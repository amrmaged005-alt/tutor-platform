"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { log } from "@/lib/audit";

// Update booking status (tutor / center admin / platform admin)

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

// Add a note to a booking

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
