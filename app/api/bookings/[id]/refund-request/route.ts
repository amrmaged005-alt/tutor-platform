import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    select: { id: true, studentId: true, paymentStatus: true, status: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found", code: "NOT_FOUND" }, { status: 404 });
  }

  if (booking.studentId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
  }

  if (booking.paymentStatus !== "PAID") {
    return NextResponse.json({ error: "Only paid bookings can be refunded", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  if (booking.status === "CANCELLED") {
    return NextResponse.json({ error: "Booking is already cancelled", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const body  = await req.json().catch(() => null);
  const reason = typeof body?.reason === "string" ? body.reason.slice(0, 500) : "";
  const notes  = typeof body?.notes  === "string" ? body.notes.slice(0, 500) : "";

  if (!reason) {
    return NextResponse.json({ error: "Reason is required", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const refundReason = reason + (notes ? ": " + notes : "");

  await prisma.$transaction([
    prisma.booking.update({
      where: { id },
      data:  { refundReason },
    }),
    prisma.auditLog.create({
      data: {
        actorId:    session.user.id,
        actorRole:  "STUDENT",
        action:     "refund.requested",
        targetType: "Booking",
        targetId:   id,
        metadata:   { reason, notes: notes || undefined },
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
