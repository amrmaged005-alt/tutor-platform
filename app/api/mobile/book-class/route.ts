import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMobileUser } from "../_utils";

export async function POST(req: NextRequest) {
  const user = await requireMobileUser(req);
  if (user instanceof NextResponse) return user;

  if (user.role !== "STUDENT") {
    return NextResponse.json({ error: "Only student accounts can book classes." }, { status: 403 });
  }

  let classId = "";
  try {
    const body = await req.json();
    classId = String(body.classId ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!classId) {
    return NextResponse.json({ error: "Class is required." }, { status: 400 });
  }

  const cls = await prisma.class.findUnique({
    where: { id: classId },
    select: {
      id: true,
      title: true,
      isActive: true,
      capacity: true,
      priceEgp: true,
      paymentType: true,
      _count: { select: { bookings: { where: { status: { not: "CANCELLED" } } } } },
    },
  });

  if (!cls || !cls.isActive) {
    return NextResponse.json({ error: "This class is no longer available." }, { status: 404 });
  }

  const existing = await prisma.booking.findUnique({
    where: { classId_studentId: { classId, studentId: user.id } },
    select: { id: true, status: true },
  });

  if (existing && existing.status !== "CANCELLED") {
    return NextResponse.json(
      { error: "You have already booked this class.", bookingId: existing.id },
      { status: 409 }
    );
  }

  if (cls.capacity && cls._count.bookings >= cls.capacity) {
    return NextResponse.json({ error: "Sorry, this class is fully booked." }, { status: 409 });
  }

  const booking = existing
    ? await prisma.booking.update({
        where: { id: existing.id },
        data: {
          status: cls.priceEgp === 0 ? "CONFIRMED" : "PENDING",
          paymentStatus: cls.priceEgp === 0 ? "PAID" : "UNPAID",
          amountEgp: cls.priceEgp,
          platformFeeEgp: Math.round(cls.priceEgp * 0.1),
          tutorPayoutEgp: cls.priceEgp - Math.round(cls.priceEgp * 0.1),
        },
      })
    : await prisma.booking.create({
        data: {
          classId,
          studentId: user.id,
          status: cls.priceEgp === 0 ? "CONFIRMED" : "PENDING",
          paymentStatus: cls.priceEgp === 0 ? "PAID" : "UNPAID",
          amountEgp: cls.priceEgp,
          platformFeeEgp: Math.round(cls.priceEgp * 0.1),
          tutorPayoutEgp: cls.priceEgp - Math.round(cls.priceEgp * 0.1),
        },
      });

  return NextResponse.json({
    success: true,
    bookingId: booking.id,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    message: cls.paymentType === "ONLINE"
      ? "Booking created. Online payment will be enabled in the web checkout."
      : "Booking received. Please pay the tutor or center directly.",
  });
}
