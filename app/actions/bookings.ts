"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isRateLimited, bookingLimiter } from "@/lib/ratelimit";
import { log } from "@/lib/audit";

const LOCK_DURATION_MINUTES = 10;

// ─── Lock a seat and initiate payment ────────────────────────────────────────

export async function lockSeat(
  classId: string
): Promise<
  | { success: true; bookingId: string; iframeUrl: string | null }
  | { success: false; error: string }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "You must be logged in to book a class." };
  }

  const studentId = session.user.id;

  // Rate limit by user ID — max 10 booking attempts per hour
  const limited = await isRateLimited(bookingLimiter, studentId);
  if (limited) {
    return {
      success: false,
      error: "Too many booking attempts. Please wait a while before trying again.",
    };
  }

  // Email verification gate — controlled by REQUIRE_EMAIL_VERIFICATION env var.
  // Set to "true" in production once email delivery is confirmed working.
  if (process.env.REQUIRE_EMAIL_VERIFICATION === "true") {
    const user = await prisma.user.findUnique({
      where: { id: studentId },
      select: { isEmailVerified: true },
    });
    if (!user?.isEmailVerified) {
      return {
        success: false,
        error: "Please verify your email address before booking a class.",
      };
    }
  }

  try {
    const now = new Date();

    // 1. Get the class and make sure it exists (pre-flight check, not the capacity gate)
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      select: {
        id: true,
        capacity: true,
        priceEgp: true,
        isActive: true,
        paymentType: true,
      },
    });

    if (!classData) {
      return { success: false, error: "Class not found." };
    }

    if (!classData.isActive) {
      return { success: false, error: "This class is no longer available." };
    }

    // 2. Check if the student already booked this class
    const existingBooking = await prisma.booking.findUnique({
      where: { classId_studentId: { classId, studentId } },
    });

    if (existingBooking) {
      if (existingBooking.status === "CONFIRMED") {
        return { success: false, error: "You have already booked this class." };
      }

      if (
        existingBooking.status === "PENDING" &&
        existingBooking.lockedUntil &&
        existingBooking.lockedUntil > now
      ) {
        return {
          success: false,
          error: "You already have a pending booking for this class.",
        };
      }
    }

    // 3. Calculate the commission (10% to platform, 90% to tutor)
    const amountEgp = classData.priceEgp ?? 0;
    const platformFeeEgp = Math.round(amountEgp * 0.1);
    const tutorPayoutEgp = amountEgp - platformFeeEgp;

    // 4. Create or refresh the booking inside a serializable transaction so
    //    two concurrent requests cannot both pass the capacity check and
    //    both insert a booking (phantom-read prevention).
    const lockedUntil = new Date(
      now.getTime() + LOCK_DURATION_MINUTES * 60 * 1000
    );

    const bookingData = {
        status: "PENDING",
        paymentStatus: "UNPAID",
        amountEgp,
        platformFeeEgp,
        tutorPayoutEgp,
        lockedAt: now,
        lockedUntil,
        idempotencyKey: `${studentId}-${classId}-${now.getTime()}`,
        paidAt: null,
        refundedAt: null,
        refundReason: null,
        paymobOrderId: null,
        paymobPaymentKey: null,
      } as const;

    let booking: Awaited<ReturnType<typeof prisma.booking.create>>;
    try {
      const txResult = await prisma.$transaction(
        async (tx) => {
          // Re-count active bookings inside the transaction so the check and
          // the write are atomic — prevents overbooking under concurrent load.
          const activeCount = await tx.booking.count({
            where: {
              classId,
              OR: [
                { status: "CONFIRMED" },
                { status: "PENDING", lockedUntil: { gt: now } },
              ],
            },
          });

          if (
            classData.capacity !== null &&
            activeCount >= classData.capacity
          ) {
            return null; // signal: class is full
          }

          if (existingBooking) {
            return tx.booking.update({
              where: { id: existingBooking.id },
              data: bookingData,
            });
          }
          return tx.booking.create({
            data: { classId, studentId, ...bookingData },
          });
        },
        { isolationLevel: "Serializable" }
      );

      if (!txResult) {
        return { success: false, error: "Sorry, this class is fully booked." };
      }
      booking = txResult;
    } catch (txError: unknown) {
      // Serializable transactions can fail with a serialization error when
      // two concurrent writers conflict — retry once is sufficient.
      const msg = txError instanceof Error ? txError.message : "";
      if (msg.includes("could not serialize") || msg.includes("deadlock")) {
        return { success: false, error: "Sorry, this class is fully booked." };
      }
      throw txError;
    }

    if (existingBooking) {
      await log({
        action: "booking.created",
        actorId: studentId,
        targetType: "Booking",
        targetId: booking.id,
        metadata: { classId, amountEgp, paymentType: classData.paymentType, refreshed: true },
      });
    } else {
      await log({
        action: "booking.created",
        actorId: studentId,
        targetType: "Booking",
        targetId: booking.id,
        metadata: { classId, amountEgp, paymentType: classData.paymentType },
      });
    }

    // 6. If in-person, no payment needed — return early
    if (classData.paymentType === "IN_PERSON") {
      return { success: true, bookingId: booking.id, iframeUrl: null };
    }

    // 7. If online, create a Paymob payment link
    const { createPaymobPayment } = await import("@/lib/paymob");

    let iframeUrl: string;
    try {
      iframeUrl = await createPaymobPayment({
        amountEGP: amountEgp,
        bookingId: booking.id,
        user: {
          email: session.user.email ?? "",
          firstName: session.user.name?.split(" ")[0] ?? "Student",
          lastName: session.user.name?.split(" ")[1] ?? ".",
          phone: (session.user as any).phone ?? "01000000000",
        },
      });
    } catch (error) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: "CANCELLED",
          paymentStatus: "FAILED",
          lockedAt: null,
          lockedUntil: null,
        },
      });
      console.error("Paymob setup error:", error);
      return {
        success: false,
        error: "Could not start online payment. Please try again.",
      };
    }

    return { success: true, bookingId: booking.id, iframeUrl };
  } catch (error) {
    console.error("lockSeat error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

// ─── Update booking status (tutor / center admin / platform admin) ────────────

export async function updateBookingStatus(
  bookingId: string,
  action: "MARK_PAID" | "CANCEL" | "NO_SHOW" | "MARK_ATTENDED",
  note?: string
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "You must be logged in." };
  }

  const role = (session.user as any).role as string;
  const userId = session.user.id;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      class: {
        include: {
          owner: true,
          center: {
            include: { tutors: true },
          },
          tutors: true,
        },
      },
    },
  });

  if (!booking) {
    return { success: false, error: "Booking not found." };
  }

  const isAdmin = role === "ADMIN";
  const isOwner = booking.class.ownerId === userId;
  const isCenterTutor = booking.class.center?.tutors.some((t) => t.id === userId);
  const isClassTutor = booking.class.tutors.some((t) => t.tutorId === userId);

  if (!isAdmin && !isOwner && !isCenterTutor && !isClassTutor) {
    return {
      success: false,
      error: "You are not authorized to manage this booking.",
    };
  }

  if (booking.class.paymentType === "ONLINE" && action === "MARK_PAID") {
    return {
      success: false,
      error: "Online payments are confirmed automatically.",
    };
  }

  try {
    if (action === "MARK_PAID") {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "CONFIRMED",
          paymentStatus: "PAID",
          paidAt: new Date(),
          notes: note ?? booking.notes,
        },
      });
    }

    if (action === "CANCEL") {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "CANCELLED",
          notes: note ?? booking.notes,
        },
      });
    }

    if (action === "NO_SHOW") {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "CANCELLED",
          notes: note ? `[NO-SHOW] ${note}` : "[NO-SHOW]",
        },
      });
    }

    if (action === "MARK_ATTENDED") {
      const nextNote = note
        ? `[ATTENDED] ${note}`
        : booking.notes?.includes("[ATTENDED]")
          ? booking.notes
          : booking.notes
            ? `[ATTENDED] ${booking.notes}`
            : "[ATTENDED]";

      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "CONFIRMED",
          notes: nextNote,
        },
      });
    }

    // Log the status change
    const auditAction =
      action === "MARK_PAID"
        ? "booking.confirmed"
        : action === "MARK_ATTENDED"
          ? "booking.attended"
          : action === "NO_SHOW"
            ? "booking.no_show"
            : "booking.cancelled";

    await log({
      action: auditAction,
      actorId: userId,
      actorRole: role,
      targetType: "Booking",
      targetId: bookingId,
      metadata: { action, note },
    });

    return { success: true };
  } catch (error) {
    console.error("updateBookingStatus error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

// ─── Add a note to a booking ──────────────────────────────────────────────────

export async function addBookingNote(
  bookingId: string,
  note: string
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "You must be logged in." };
  }

  const userId = session.user.id;
  const role = (session.user as any).role as string;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      class: {
        include: {
          center: { include: { tutors: true } },
          tutors: true,
        },
      },
    },
  });

  if (!booking) return { success: false, error: "Booking not found." };

  const isAdmin = role === "ADMIN";
  const isOwner = booking.class.ownerId === userId;
  const isCenterTutor = booking.class.center?.tutors.some((t) => t.id === userId);
  const isClassTutor = booking.class.tutors.some((t) => t.tutorId === userId);

  if (!isAdmin && !isOwner && !isCenterTutor && !isClassTutor) {
    return { success: false, error: "Not authorized." };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { notes: note },
  });

  await log({
    action: "booking.note_added",
    actorId: userId,
    actorRole: role,
    targetType: "Booking",
    targetId: bookingId,
    metadata: { note },
  });

  return { success: true };
}
