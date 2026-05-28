import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function guardCenter(centerId: string) {
  const session = await auth();
  if (!session?.user?.id)
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, centerId: true },
  });
  if (!me) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const ok = me.role === "ADMIN" || (me.role === "CENTER_ADMIN" && me.centerId === centerId);
  if (!ok) return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { me };
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const guard = await guardCenter(id);
  if (guard.error) return guard.error;

  const url = new URL(req.url);
  const statusFilter = url.searchParams.get("status"); // PENDING | CONFIRMED | CANCELLED
  const classIdFilter = url.searchParams.get("classId");
  const dateFrom = url.searchParams.get("dateFrom");
  const dateTo = url.searchParams.get("dateTo");
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const limit = 20;

  // Get all class IDs for this center
  const centerClasses = await prisma.class.findMany({
    where: { centerId: id },
    select: { id: true },
  });
  const centerClassIds = centerClasses.map((c) => c.id);

  if (centerClassIds.length === 0) {
    return NextResponse.json({ bookings: [], total: 0, page, limit });
  }

  const where = {
    classId: classIdFilter
      ? (centerClassIds.includes(classIdFilter) ? classIdFilter : "__none__")
      : { in: centerClassIds },
    ...(statusFilter && ["PENDING", "CONFIRMED", "CANCELLED"].includes(statusFilter)
      ? { status: statusFilter as "PENDING" | "CONFIRMED" | "CANCELLED" }
      : {}),
    ...(dateFrom || dateTo
      ? {
          createdAt: {
            ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
            ...(dateTo ? { lte: new Date(dateTo) } : {}),
          },
        }
      : {}),
  };

  const [total, rawBookings] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        amountEgp: true,
        createdAt: true,
        paidAt: true,
        classId: true,
        studentId: true,
        class: {
          select: {
            id: true,
            title: true,
            subject: true,
            owner: { select: { fullName: true, name: true } },
          },
        },
        student: {
          select: { id: true, fullName: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  const bookings = rawBookings.map((b) => ({
    id: b.id,
    status: b.status,
    paymentStatus: b.paymentStatus,
    amountEgp: b.amountEgp,
    createdAt: b.createdAt.toISOString(),
    paidAt: b.paidAt?.toISOString() ?? null,
    classId: b.classId,
    classTitle: b.class.title,
    classSubject: b.class.subject,
    tutorName: b.class.owner?.fullName ?? b.class.owner?.name ?? null,
    studentId: b.studentId,
    studentName: b.student.fullName ?? b.student.name ?? b.student.email ?? "Student",
    studentEmail: b.student.email,
  }));

  return NextResponse.json({ bookings, total, page, limit });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const guard = await guardCenter(id);
  if (guard.error) return guard.error;

  const body = await req.json().catch(() => null);
  const bookingId = typeof body?.bookingId === "string" ? body.bookingId : null;
  const newStatus = body?.status;

  if (!bookingId || !newStatus)
    return NextResponse.json({ error: "bookingId and status required" }, { status: 400 });

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, class: { select: { centerId: true } } },
  });
  if (!booking || booking.class.centerId !== id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: newStatus },
    select: { id: true, status: true },
  });

  return NextResponse.json({ ok: true, booking: updated });
}
