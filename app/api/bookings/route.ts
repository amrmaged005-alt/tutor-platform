import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPaymobPayment } from "@/lib/paymob";
import { classSelect, requireMobileUser, serializeClass } from "../mobile/_utils";
import { isRateLimited, bookingLimiter } from "@/lib/ratelimit";

export async function GET(req: NextRequest) {
  const user = await requireMobileUser(req);
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
  const user = await requireMobileUser(req);
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
  const sessionCount = Math.min(Math.max(Number(body?.sessionCount ?? 1), 1), 5);
  const paymentType = body?.paymentType === "ONLINE" ? "ONLINE" : "IN_PERSON";
  const note = typeof body?.note === "string" ? body.note.slice(0, 500) : "";
  const packageOption: { sessions: number; discountPct: number } | null =
    body?.packageOption && typeof body.packageOption === "object" ? body.packageOption : null;

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
      packagesEnabled: true,
      packageOptions: true,
      _count: { select: { bookings: { where: { status: { not: "CANCELLED" } } } } },
    },
  });

  if (!cls || !cls.isActive) {
    return NextResponse.json({ error: "This class is no longer available." }, { status: 404 });
  }

  if (cls.capacity && cls._count.bookings >= cls.capacity) {
    return NextResponse.json({ error: "Sorry, this class is fully booked." }, { status: 409 });
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

  // Validate package option if provided
  let packageSessions = sessionCount;
  let packageDiscount  = 0;
  if (packageOption && cls.packagesEnabled) {
    const options = (cls.packageOptions ?? []) as Array<{ sessions: number; discountPct: number }>;
    const matched = options.find(
      (o) => o.sessions === packageOption.sessions && o.discountPct === packageOption.discountPct
    );
    if (!matched) {
      return NextResponse.json({ error: "Invalid package option." }, { status: 400 });
    }
    packageSessions = matched.sessions;
    packageDiscount  = matched.discountPct;
  }

  const amountEgp = Math.round(cls.priceEgp * packageSessions * (1 - packageDiscount / 100));
  const packageNote = packageOption ? `Package: ${packageSessions} sessions, ${packageDiscount}% off` : null;
  const notes = [note, packageNote, `Sessions: ${packageSessions}`, `Payment: ${paymentType}`].filter(Boolean).join("\n");
  const isOnline = paymentType === "ONLINE" && amountEgp > 0;
  const bookingData = {
    status: isOnline ? "PENDING" as const : "CONFIRMED" as const,
    paymentStatus: isOnline ? "UNPAID" as const : "PAID" as const,
    paidAt: isOnline ? null : new Date(),
    amountEgp,
    notes,
    platformFeeEgp: Math.round(amountEgp * 0.1),
    tutorPayoutEgp: amountEgp - Math.round(amountEgp * 0.1),
  };

  const booking = existing
    ? await prisma.booking.update({ where: { id: existing.id }, data: bookingData })
    : await prisma.booking.create({
        data: { classId, studentId: user.id, ...bookingData },
      });

  let paymentUrl: string | null = null;
  if (isOnline) {
    try {
      const [firstName, ...rest] = user.name.trim().split(/\s+/);
      paymentUrl = await createPaymobPayment({
        amountEGP: amountEgp,
        bookingId: booking.id,
        user: {
          email: user.email ?? "student@coursaty.com",
          firstName: firstName || "Coursaty",
          lastName: rest.join(" ") || "Student",
          phone: "01000000000",
        },
      });
    } catch (error) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { paymentStatus: "FAILED" },
      });
      console.error("Mobile Paymob start error:", error);
      return NextResponse.json(
        { error: "Could not start online payment. Please choose pay at center or try again." },
        { status: 502 }
      );
    }
  }

  return NextResponse.json({
    success: true,
    bookingId: booking.id,
    paymentUrl,
    message: isOnline
      ? "Booking created. Continue to secure online payment."
      : "Booking confirmed. Please pay at the center.",
  });
}
