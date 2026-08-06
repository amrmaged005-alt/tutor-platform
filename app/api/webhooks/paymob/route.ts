import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { log } from "@/lib/audit";
import { getHmacSecret } from "@/lib/paymob";

const MAX_SERIALIZABLE_ATTEMPTS = 2;
const PAYMENT_CONFLICT_REFUND_REASON =
  "Payment received after the booking seat was no longer available; refund review required.";

function getPrismaErrorCode(error: unknown): string | undefined {
  return typeof error === "object" && error !== null && "code" in error
    ? String(error.code)
    : undefined;
}

function verifyPaymobHmac(params: Record<string, string>, hmac: string): boolean {
  const secret = getHmacSecret();

  const hmacFields = [
    "amount_cents",
    "created_at",
    "currency",
    "error_occured",
    "has_parent_transaction",
    "id",
    "integration_id",
    "is_3d_secure",
    "is_auth",
    "is_capture",
    "is_refunded",
    "is_standalone_payment",
    "is_voided",
    "order",
    "owner",
    "pending",
    "source_data.pan",
    "source_data.sub_type",
    "source_data.type",
    "success",
  ];

  const dataString = hmacFields.map((field) => params[field] ?? "").join("");

  const computed = createHmac("sha512", secret)
    .update(dataString)
    .digest("hex");

  const computedBuffer = Buffer.from(computed, "hex");
  const receivedBuffer = Buffer.from(hmac, "hex");

  return (
    computedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(computedBuffer, receivedBuffer)
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const hmac = req.nextUrl.searchParams.get("hmac");

    if (!hmac) {
      console.error("Webhook rejected: no HMAC provided");
      return NextResponse.json({ error: "No HMAC" }, { status: 400 });
    }

    const flatParams: Record<string, string> = {
      amount_cents: String(body.obj?.amount_cents ?? ""),
      created_at: String(body.obj?.created_at ?? ""),
      currency: String(body.obj?.currency ?? ""),
      error_occured: String(body.obj?.error_occured ?? ""),
      has_parent_transaction: String(body.obj?.has_parent_transaction ?? ""),
      id: String(body.obj?.id ?? ""),
      integration_id: String(body.obj?.integration_id ?? ""),
      is_3d_secure: String(body.obj?.is_3d_secure ?? ""),
      is_auth: String(body.obj?.is_auth ?? ""),
      is_capture: String(body.obj?.is_capture ?? ""),
      is_refunded: String(body.obj?.is_refunded ?? ""),
      is_standalone_payment: String(body.obj?.is_standalone_payment ?? ""),
      is_voided: String(body.obj?.is_voided ?? ""),
      order: String(body.obj?.order?.id ?? ""),
      owner: String(body.obj?.owner ?? ""),
      pending: String(body.obj?.pending ?? ""),
      "source_data.pan": String(body.obj?.source_data?.pan ?? ""),
      "source_data.sub_type": String(body.obj?.source_data?.sub_type ?? ""),
      "source_data.type": String(body.obj?.source_data?.type ?? ""),
      success: String(body.obj?.success ?? ""),
    };

    const isValid = verifyPaymobHmac(flatParams, hmac);
    if (!isValid) {
      console.error("Webhook rejected: HMAC mismatch");
      return NextResponse.json({ error: "Invalid HMAC" }, { status: 401 });
    }

    const transactionId = String(body.obj?.id);
    const success = body.obj?.success === true;
    const paymobOrderId = String(body.obj?.order?.id);
    const transactionType = body.type ?? "TRANSACTION";
    const receivedAmountCents = Number(body.obj?.amount_cents ?? 0);
    const receivedCurrency = String(body.obj?.currency ?? "");
    const receivedIntegrationId = String(body.obj?.integration_id ?? "");

    // Verify the integration ID belongs to us (prevents replaying events from
    // other Paymob accounts).
    const expectedIntegrationId = process.env.PAYMOB_INTEGRATION_ID ?? "";
    if (expectedIntegrationId && receivedIntegrationId !== expectedIntegrationId) {
      console.error(`Webhook rejected: integration_id mismatch (got ${receivedIntegrationId})`);
      return NextResponse.json({ error: "Integration mismatch" }, { status: 400 });
    }

    // Currency must be EGP for this platform.
    if (receivedCurrency && receivedCurrency !== "EGP") {
      console.error(`Webhook rejected: unexpected currency ${receivedCurrency}`);
      return NextResponse.json({ error: "Currency mismatch" }, { status: 400 });
    }

    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { paymobTransactionId: transactionId },
    });

    if (existingEvent?.processed) {
      console.log(`Webhook already processed: ${transactionId}`);
      return NextResponse.json({ received: true });
    }

    const booking = await prisma.booking.findUnique({
      where: { paymobOrderId },
    });

    if (!existingEvent) {
      await prisma.webhookEvent.create({
        data: {
          paymobTransactionId: transactionId,
          type: transactionType,
          processed: false,
          bookingId: booking?.id ?? null,
          payload: body,
        },
      });
    }

    if (!booking) {
      console.error(`Webhook: no booking found for paymobOrderId ${paymobOrderId}`);
      return NextResponse.json({ received: true });
    }

    // Verify the amount matches the booking to prevent a valid-but-wrong
    // Paymob event from confirming a differently-priced booking.
    const expectedAmountCents = (booking.amountEgp ?? 0) * 100;
    if (success && receivedAmountCents !== expectedAmountCents) {
      console.error(
        `Webhook rejected: amount mismatch for booking ${booking.id} ` +
        `(expected ${expectedAmountCents}, got ${receivedAmountCents})`
      );
      await prisma.webhookEvent.update({
        where: { paymobTransactionId: transactionId },
        data: { processed: true },
      });
      return NextResponse.json({ received: true });
    }

    if (success) {
      let outcome:
        | { kind: "confirmed"; bookingId: string }
        | { kind: "already-settled"; bookingId: string }
        | { kind: "payment-conflict"; bookingId: string; reason: string }
        | undefined;

      for (let attempt = 0; attempt < MAX_SERIALIZABLE_ATTEMPTS; attempt += 1) {
        try {
          outcome = await prisma.$transaction(
            async (tx) => {
              const now = new Date();
              const current = await tx.booking.findUnique({
                where: { id: booking.id },
                include: { class: { select: { capacity: true } } },
              });

              if (!current) {
                throw new Error(`Booking ${booking.id} disappeared during webhook processing`);
              }

              // A different success event may already have confirmed the same
              // Paymob order. Preserve the confirmed booking and mark this event
              // processed without consuming another seat.
              if (
                current.paymentStatus === "PAID" ||
                current.paymentStatus === "REFUNDED" ||
                current.paymentStatus === "PARTIALLY_REFUNDED"
              ) {
                await tx.webhookEvent.update({
                  where: { paymobTransactionId: transactionId },
                  data: { processed: true, processingError: null },
                });
                return {
                  kind: "already-settled" as const,
                  bookingId: current.id,
                };
              }

              const hasValidSeatLock =
                current.status === "PENDING" &&
                current.paymentStatus === "UNPAID" &&
                current.lockedUntil !== null &&
                current.lockedUntil > now;

              let conflictReason: string | null = null;
              if (!hasValidSeatLock) {
                conflictReason = "SEAT_LOCK_EXPIRED_OR_RELEASED";
              } else {
                const occupiedSeats = await tx.booking.count({
                  where: {
                    classId: current.classId,
                    id: { not: current.id },
                    OR: [
                      { status: "CONFIRMED" },
                      { status: "PENDING", lockedUntil: { gt: now } },
                    ],
                  },
                });

                if (occupiedSeats >= current.class.capacity) {
                  conflictReason = "CLASS_CAPACITY_EXCEEDED";
                }
              }

              if (conflictReason) {
                // Paymob has captured the customer's money, so record the
                // payment truthfully without restoring the released seat.
                // refundReason puts the booking into the existing admin refund
                // queue for explicit reconciliation.
                await tx.booking.update({
                  where: { id: current.id },
                  data: {
                    status: "CANCELLED",
                    paymentStatus: "PAID",
                    paidAt: now,
                    lockedAt: null,
                    lockedUntil: null,
                    refundReason:
                      current.refundReason ?? PAYMENT_CONFLICT_REFUND_REASON,
                  },
                });
                await tx.webhookEvent.update({
                  where: { paymobTransactionId: transactionId },
                  data: { processed: true, processingError: conflictReason },
                });
                return {
                  kind: "payment-conflict" as const,
                  bookingId: current.id,
                  reason: conflictReason,
                };
              }

              await tx.booking.update({
                where: { id: current.id },
                data: {
                  status: "CONFIRMED",
                  paymentStatus: "PAID",
                  paidAt: now,
                  lockedAt: null,
                  lockedUntil: null,
                },
              });
              await tx.webhookEvent.update({
                where: { paymobTransactionId: transactionId },
                data: { processed: true, processingError: null },
              });
              return { kind: "confirmed" as const, bookingId: current.id };
            },
            { isolationLevel: "Serializable" }
          );
          break;
        } catch (error) {
          if (
            getPrismaErrorCode(error) === "P2034" &&
            attempt + 1 < MAX_SERIALIZABLE_ATTEMPTS
          ) {
            continue;
          }
          throw error;
        }
      }

      if (!outcome) {
        throw new Error("Paymob success transaction completed without an outcome");
      }

      if (outcome.kind === "already-settled") {
        console.log(`Webhook: booking ${outcome.bookingId} already settled, skipping.`);
        return NextResponse.json({ received: true });
      }

      await log({
        action: "payment.received",
        targetType: "Booking",
        targetId: outcome.bookingId,
        metadata: {
          paymobOrderId,
          transactionId,
          amountCents: body.obj?.amount_cents,
          seatGranted: outcome.kind === "confirmed",
          requiresRefund: outcome.kind === "payment-conflict",
          conflictReason:
            outcome.kind === "payment-conflict" ? outcome.reason : undefined,
        },
      });

      if (outcome.kind === "payment-conflict") {
        console.error(
          `Payment received after seat release for booking ${outcome.bookingId}: ${outcome.reason}`
        );
      } else {
        console.log(`Booking confirmed: ${outcome.bookingId}`);
      }
    } else {
      const failed = await prisma.$transaction(async (tx) => {
        const current = await tx.booking.findUnique({
          where: { id: booking.id },
          select: { promoCode: true },
        });
        const result = await tx.booking.updateMany({
          where: {
            id: booking.id,
            status: "PENDING",
            paymentStatus: "UNPAID",
          },
          data: {
            status: "CANCELLED",
            paymentStatus: "FAILED",
            lockedAt: null,
            lockedUntil: null,
          },
        });
        if (result.count === 1 && current?.promoCode) {
          await tx.promoCode.updateMany({
            where: { code: current.promoCode, usedCount: { gt: 0 } },
            data: { usedCount: { decrement: 1 } },
          });
        }
        return result;
      });

      if (failed.count === 1) {
        await log({
          action: "payment.failed",
          targetType: "Booking",
          targetId: booking.id,
          metadata: { paymobOrderId, transactionId },
        });

        console.log(`Booking failed: ${booking.id}`);
      } else {
        console.log(
          `Webhook: ignored stale failure for settled booking ${booking.id}.`
        );
      }
    }

    await prisma.webhookEvent.update({
      where: { paymobTransactionId: transactionId },
      data: { processed: true },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    if (getPrismaErrorCode(error) === "P2034") {
      // Do not acknowledge a serialization failure: Paymob must retry so a
      // captured payment cannot remain in an unprocessed event indefinitely.
      return NextResponse.json({ received: false }, { status: 503 });
    }
    return NextResponse.json({ received: true });
  }
}
