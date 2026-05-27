import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, centerId: true },
  });

  const { id } = await ctx.params;
  const isAdmin = me?.role === "ADMIN";
  const isCenterAdmin = me?.role === "CENTER_ADMIN" && me.centerId === id;
  if (!isAdmin && !isCenterAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const center = await prisma.learningCenter.findUnique({
    where: { id },
    select: {
      id: true,
      _count: { select: { tutors: true, classes: true } },
    },
  });
  if (!center) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const classes = await prisma.class.findMany({
    where: { centerId: id, isActive: true },
    select: { id: true, ownerId: true },
  });
  const activeClasses = classes.length;
  const classIds = classes.map((c) => c.id);

  const allBookings = await prisma.booking.findMany({
    where: { classId: { in: classIds }, paymentStatus: "PAID" },
    select: { id: true, amountEgp: true, studentId: true, paidAt: true, classId: true },
  });

  const totalBookings = allBookings.length;
  const totalRevenue = allBookings.reduce((sum, b) => sum + (b.amountEgp ?? 0), 0);
  const revenueThisMonth = allBookings
    .filter((b) => b.paidAt && b.paidAt >= monthStart)
    .reduce((sum, b) => sum + (b.amountEgp ?? 0), 0);
  const totalStudents = new Set(allBookings.map((b) => b.studentId)).size;

  // Revenue by tutor (via class owner)
  const revenueByTutorMap = new Map<string, number>();
  const bookingsByTutorMap = new Map<string, number>();
  for (const b of allBookings) {
    const cls = classes.find((c) => c.id === b.classId);
    const ownerId = cls?.ownerId;
    if (!ownerId) continue;
    revenueByTutorMap.set(ownerId, (revenueByTutorMap.get(ownerId) ?? 0) + (b.amountEgp ?? 0));
    bookingsByTutorMap.set(ownerId, (bookingsByTutorMap.get(ownerId) ?? 0) + 1);
  }

  const tutorIds = Array.from(revenueByTutorMap.keys());
  const tutors = tutorIds.length
    ? await prisma.user.findMany({
        where: { id: { in: tutorIds } },
        select: { id: true, fullName: true, name: true },
      })
    : [];
  const tutorName = (tid: string) => {
    const t = tutors.find((x) => x.id === tid);
    return t?.fullName ?? t?.name ?? "Tutor";
  };

  const revenueByTutor = Array.from(revenueByTutorMap.entries())
    .map(([tutorId, amount]) => ({ tutorId, name: tutorName(tutorId), amount }))
    .sort((a, b) => b.amount - a.amount);

  // Top tutor by bookings
  let topTutor: { id: string; name: string; bookings: number } | null = null;
  for (const [tutorId, count] of bookingsByTutorMap.entries()) {
    if (!topTutor || count > topTutor.bookings) {
      topTutor = { id: tutorId, name: tutorName(tutorId), bookings: count };
    }
  }

  // Avg rating across all class reviews
  const reviewAvg = classIds.length
    ? await prisma.review.aggregate({
        where: { classId: { in: classIds }, isApproved: true },
        _avg: { rating: true },
      })
    : { _avg: { rating: null } };

  return NextResponse.json({
    totalRevenue,
    revenueThisMonth,
    activeTutors: center._count.tutors,
    activeClasses,
    totalStudents,
    totalBookings,
    avgRating: reviewAvg._avg.rating != null ? Math.round(reviewAvg._avg.rating * 10) / 10 : null,
    topTutor,
    revenueByTutor,
  });
}
