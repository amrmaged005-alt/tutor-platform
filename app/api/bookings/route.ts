import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPaymobPayment } from "@/lib/paymob";
import { auth } from "@/lib/auth";
import { classSelect, requireMobileUser, serializeClass, type MobileUser } from "../mobile/_utils";
import { isRateLimited, bookingLimiter } from "@/lib/ratelimit";

// Allow enough time for common Egyptian bank OTP/3DS flows before the seat is reclaimed.
const LOCK_DURATION_MINUTES = 15;
const MAX_SERIALIZABLE_ATTEMPTS = 2;
type BookingUser = MobileUser & { phone: string | null };

function getPrismaErrorCode(error: unknown): string | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string"
  ) {
    return (error as { code: string }).code;
  }
  return null;
}

async function requireBookingUser(req: NextRequest): Promise<BookingUser | NextResponse> {
  if (req.headers.get("authorization")?.toLowerCase().startsWith("bearer ")) {
    const mobileUser = await requireMobileUser(req);
    if (mobileUser instanceof NextResponse) return mobileUser;

    const contact = await prisma.user.findUnique({
      where: { id: mobileUser.id },
      select: { phone: true },
    });
    return { ...mobileUser, phone: contact?.phone ?? null };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      fullName: true,
      name: true,
      phone: true,
      role: true,
      isSuspended: true,
    },
  });

  if (!user || user.isSuspended) {
    return NextResponse.json({ error: "Account is not available." }, { status: 401 });
  }

  return {
    id: user.id,
    email: user.email,
    name: user.fullName ?? user.name ?? "",
    phone: user.phone,
    role: user.role,
  };
}

export async function GET(req: NextRequest) {
  const user = await requireBookingUser(req);
  if (user instanceof NextResponse) return user;

  const where =
    user.role === "STUDENT"
      ? { studentId: user.id }
      : user.role === "ADMIN"
        ? {}
        : {
            class: {
              OR: [{ ownerId: user.id }, { tutors: { some: { tutorId: user.id } } }],
            },
          };

  const bookings = await prisma.booking.findMany({
    where,
    select: {
      id: true,
      status: true,
      paymentStatus: true,
      amountEgp: true,
      notes: true,
      createdAt: true,
      student: { select: { id: true, fullName: true, name: true } },
      class: { select: classSelect() },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    bookings: bookings.map((booking) => ({
      ...booking,
      class: serializeClass(booking.class),
    })),
  });
}

export async function POST(req: NextRequest) {
  const user = await requireBookingUser(req);
  if (user instanceof NextResponse) return user;

  if (user.role !== "STUDENT") {
    return NextResponse.json({ error: "Only student accounts can book classes." }, { status: 403 });
  }

  // Rate limit: max 10 booking attempts per hour per student
  const limited = await isRateLimited(bookingLimiter, `booking:${user.id}`);
  if (limited) {
    return NextResponse.json(
      { error: "Too many booking attempts. Please wait a while before trying again." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const classId = String(body?.classId ?? "");
  const rawSessionCount = Number(body?.sessionCount ?? 1);
  const sessionCount = Number.isFinite(rawSessionCount)
    ? Math.min(Math.max(Math.trunc(rawSessionCount), 1), 5)
    : 1;
  const requestedPaymentType = body?.paymentType === "ONLINE" ? "ONLINE" : "IN_PERSON";
  const note = typeof body?.note === "string" ? body.note.slice(0, 500) : "";
  const packageOption: { sessions: number; discountPct: number } | null =
    body?.packageOption && typeof body.packageOption === "object" ? body.packageOption : null;
  const promoCodeInput = typeof body?.promoCode === "string" ? body.promoCode.trim().toUpperCase() : "";

  if (!classId) {
    return NextResponse.json({ error: "Class is required." }, { status: 400 });
  }

  const { getPlatformFeePct } = await import("@/lib/config");
  const feePct = await getPlatformFeePct();
  type TransactionResult =
    | {
        kind: "booked";
        bookingId: string;
        amountEgp: number;
        isOnline: boolean;
      }
    | { kind: "already-booked"; bookingId: string }
    | { kind: "class-unavailable" }
    | { kind: "full" }
    | { kind: "invalid-package" }
    | { kind: "invalid-promo"; error: string };

  let transactionResult: TransactionResult | null = null;

  for (let attempt = 0; attempt < MAX_SERIALIZABLE_ATTEMPTS; attempt += 1) {
    try {
      transactionResult = await prisma.$transaction(
        async (tx): Promise<TransactionResult> => {
          const now = new Date();
          const cls = await tx.class.findUnique({
            where: { id: classId },
            select: {
              id: true,
              isActive: true,
              capacity: true,
              priceEgp: true,
              paymentType: true,
              packagesEnabled: true,
              packageOptions: true,
            },
          });

          if (!cls || !cls.isActive) {
            return { kind: "class-unavailable" };
          }

          // An online-only class must never be downgraded to cash by a client request.
          // In-person classes may still opt into Paymob from the mobile checkout.
          const paymentType =
            cls.paymentType === "ONLINE" ? "ONLINE" : requestedPaymentType;

          let packageSessions = sessionCount;
          let packageDiscount = 0;
          if (packageOption && cls.packagesEnabled) {
            const options = (cls.packageOptions ?? []) as Array<{
              sessions: number;
              discountPct: number;
            }>;
            const matched = options.find(
              (option) =>
                option.sessions === packageOption.sessions &&
                option.discountPct === packageOption.discountPct
            );
            if (!matched) {
              return { kind: "invalid-package" };
            }
            packageSessions = matched.sessions;
            packageDiscount = matched.discountPct;
          }

          const baseAmount = Math.round(
            cls.priceEgp * packageSessions * (1 - packageDiscount / 100)
          );
          let promoDiscountEgp = 0;
          let appliedPromoCode: string | null = null;
          let promoRecordId: string | null = null;

          if (promoCodeInput) {
            const promo = await tx.promoCode.findUnique({
              where: { code: promoCodeInput },
            });
            if (!promo || !promo.isActive) {
              return { kind: "invalid-promo", error: "Invalid promo code" };
            }
            if (promo.expiresAt && promo.expiresAt < now) {
              return {
                kind: "invalid-promo",
                error: "Promo code has expired",
              };
            }
            if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
              return {
                kind: "invalid-promo",
                error: "Promo code has reached its usage limit",
              };
            }
            promoDiscountEgp = Math.round(
              (baseAmount * promo.discountPct) / 100
            );
            appliedPromoCode = promo.code;
            promoRecordId = promo.id;
          }

          const existing = await tx.booking.findUnique({
            where: { classId_studentId: { classId, studentId: user.id } },
            select: {
              id: true,
              status: true,
              lockedUntil: true,
            },
          });

          const hasActiveExistingBooking =
            existing?.status === "CONFIRMED" ||
            (existing?.status === "PENDING" &&
              existing.lockedUntil !== null &&
              existing.lockedUntil > now);

          if (existing && hasActiveExistingBooking) {
            return { kind: "already-booked", bookingId: existing.id };
          }

          const activeCount = await tx.booking.count({
            where: {
              classId,
              OR: [
                { status: "CONFIRMED" },
                { status: "PENDING", lockedUntil: { gt: now } },
              ],
            },
          });

          if (activeCount >= cls.capacity) {
            return { kind: "full" };
          }

          const amountEgp = Math.max(0, baseAmount - promoDiscountEgp);
          const isOnline = paymentType === "ONLINE" && amountEgp > 0;
          const isFree = amountEgp === 0;
          const platformFee = Math.round((amountEgp * feePct) / 100);
          const packageNote = packageOption
            ? `Package: ${packageSessions} sessions, ${packageDiscount}% off`
            : null;
          const promoNote = appliedPromoCode
            ? `Promo: ${appliedPromoCode} (-${promoDiscountEgp} EGP)`
            : null;
          const notes = [
            note,
            packageNote,
            promoNote,
            `Sessions: ${packageSessions}`,
            `Payment: ${paymentType}`,
          ]
            .filter(Boolean)
            .join("\n");
          const lockedUntil = isOnline
            ? new Date(now.getTime() + LOCK_DURATION_MINUTES * 60 * 1000)
            : null;
          const bookingData = {
            status: isOnline ? ("PENDING" as const) : ("CONFIRMED" as const),
            paymentStatus: isFree ? ("PAID" as const) : ("UNPAID" as const),
            paidAt: isFree ? now : null,
            amountEgp,
            notes,
            platformFeeEgp: platformFee,
            tutorPayoutEgp: amountEgp - platformFee,
            promoCode: appliedPromoCode,
            promoDiscountEgp: promoDiscountEgp || null,
            lockedAt: isOnline ? now : null,
            lockedUntil,
            paymobOrderId: null,
            paymobPaymentKey: null,
          };

          const booking = existing
            ? await tx.booking.update({
                where: { id: existing.id },
                data: bookingData,
              })
            : await tx.booking.create({
                data: { classId, studentId: user.id, ...bookingData },
              });

          if (promoRecordId) {
            await tx.promoCode.update({
              where: { id: promoRecordId },
              data: { usedCount: { increment: 1 } },
            });
          }

          return {
            kind: "booked",
            bookingId: booking.id,
            amountEgp,
            isOnline,
          };
        },
        { isolationLevel: "Serializable" }
      );
      break;
    } catch (error) {
      const code = getPrismaErrorCode(error);
      if (code === "P2034" && attempt + 1 < MAX_SERIALIZABLE_ATTEMPTS) {
        continue;
      }
      if (code === "P2034" || code === "P2002") {
        const existing = await prisma.booking.findUnique({
          where: { classId_studentId: { classId, studentId: user.id } },
          select: { id: true, status: true, lockedUntil: true },
        });
        const now = new Date();
        if (
          existing &&
          (existing.status === "CONFIRMED" ||
            (existing.status === "PENDING" &&
              existing.lockedUntil !== null &&
              existing.lockedUntil > now))
        ) {
          transactionResult = {
            kind: "already-booked",
            bookingId: existing.id,
          };
          break;
        }
        return NextResponse.json(
          {
            error: "Another booking is being processed. Please try again.",
            code: "BOOKING_CONFLICT",
          },
          { status: 409 }
        );
      }
      throw error;
    }
  }

  if (!transactionResult) {
    return NextResponse.json(
      {
        error: "Another booking is being processed. Please try again.",
        code: "BOOKING_CONFLICT",
      },
      { status: 409 }
    );
  }

  if (transactionResult.kind === "class-unavailable") {
    return NextResponse.json(
      { error: "This class is no longer available." },
      { status: 404 }
    );
  }
  if (transactionResult.kind === "already-booked") {
    return NextResponse.json(
      {
        error: "You have already booked this class.",
        bookingId: transactionResult.bookingId,
      },
      { status: 409 }
    );
  }
  if (transactionResult.kind === "full") {
    return NextResponse.json(
      { error: "Sorry, this class is fully booked." },
      { status: 409 }
    );
  }
  if (transactionResult.kind === "invalid-package") {
    return NextResponse.json(
      { error: "Invalid package option." },
      { status: 400 }
    );
  }
  if (transactionResult.kind === "invalid-promo") {
    return NextResponse.json(
      { error: transactionResult.error },
      { status: 400 }
    );
  }

  let paymentUrl: string | null = null;
  if (transactionResult.isOnline) {
    try {
      const [firstName, ...rest] = user.name.trim().split(/\s+/);
      paymentUrl = await createPaymobPayment({
        amountEGP: transactionResult.amountEgp,
        bookingId: transactionResult.bookingId,
        user: {
          email: user.email ?? "",
          firstName: firstName || "",
          lastName: rest.join(" ") || firstName || "",
          phone: user.phone ?? "",
        },
      });
    } catch (error) {
      await prisma.$transaction(async (tx) => {
        const pendingBooking = await tx.booking.findUnique({
          where: { id: transactionResult.bookingId },
          select: { promoCode: true },
        });
        const cancelled = await tx.booking.updateMany({
          where: {
            id: transactionResult.bookingId,
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
        if (cancelled.count === 1 && pendingBooking?.promoCode) {
          await tx.promoCode.updateMany({
            where: { code: pendingBooking.promoCode, usedCount: { gt: 0 } },
            data: { usedCount: { decrement: 1 } },
          });
        }
      });
      console.error("Paymob start error:", error);
      return NextResponse.json(
        { error: "Could not start online payment. Please choose pay at center or try again." },
        { status: 502 }
      );
    }
  }

  return NextResponse.json({
    success: true,
    bookingId: transactionResult.bookingId,
    paymentUrl,
    message: transactionResult.isOnline
      ? "Booking created. Continue to secure online payment."
      : "Booking confirmed. Please pay at the center.",
  });
}
