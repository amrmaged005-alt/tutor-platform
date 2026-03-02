import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";
import { log } from "@/lib/audit";

function verifyPaymobHmac(params: Record<string, string>, hmac: string): boolean {
  const secret = process.env.PAYMOB_HMAC_SECRET!;

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

  return computed === hmac;
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

    const alreadyProcessed = await prisma.webhookEvent.findUnique({
      where: { paymobTransactionId: transactionId },
    });

    if (alreadyProcessed) {
      console.log(`Webhook already processed: ${transactionId}`);
      return NextResponse.json({ received: true });
    }

    const booking = await prisma.booking.findUnique({
      where: { paymobOrderId },
    });

    await prisma.webhookEvent.create({
      data: {
        paymobTransactionId: transactionId,
        type: transactionType,
        processed: false,
        bookingId: booking?.id ?? null,
        payload: body,
      },
    });

    if (!booking) {
      console.error(`Webhook: no booking found for paymobOrderId ${paymobOrderId}`);
      return NextResponse.json({ received: true });
    }

    if (success) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: "CONFIRMED",
          paymentStatus: "PAID",
          paidAt: new Date(),
          lockedAt: null,
          lockedUntil: null,
        },
      });

      await log({
        action: "payment.received",
        targetType: "Booking",
        targetId: booking.id,
        metadata: {
          paymobOrderId,
          transactionId,
          amountCents: body.obj?.amount_cents,
        },
      });

      console.log(`Booking confirmed: ${booking.id}`);
    } else {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: "CANCELLED",
          paymentStatus: "FAILED",
          lockedAt: null,
          lockedUntil: null,
        },
      });

      await log({
        action: "payment.failed",
        targetType: "Booking",
        targetId: booking.id,
        metadata: { paymobOrderId, transactionId },
      });

      console.log(`Booking failed: ${booking.id}`);
    }

    await prisma.webhookEvent.update({
      where: { paymobTransactionId: transactionId },
      data: { processed: true },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ received: true });
  }
}