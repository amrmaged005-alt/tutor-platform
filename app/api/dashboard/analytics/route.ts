import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function startOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1, 0, 0, 0, 0);
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { id: true, role: true },
  });

  if (!user || (user.role !== "TUTOR" && user.role !== "CENTER_ADMIN")) {
    return NextResponse.json({ error: "Tutor or center account required", code: "FORBIDDEN" }, { status: 403 });
  }

  const classFilter = {
    OR: [
      { ownerId: user.id },
      { tutors: { some: { tutorId: user.id } } },
    ],
  };

  const now   = new Date();
  const som   = startOfMonth(now.getFullYear(), now.getMonth()); // start of current month

  const [allBookings, reviews, ownedClasses] = await Promise.all([
    prisma.booking.findMany({
      where: { class: classFilter },
      select: {
        id: true, status: true, paymentStatus: true,
        amountEgp: true, tutorPayoutEgp: true, createdAt: true,
        classId: true,
      },
    }),
    prisma.review.findMany({
      where: { class: classFilter, isApproved: true },
      select: { rating: true },
    }),
    prisma.class.findMany({
      where: { ...classFilter, isActive: true },
      select: { id: true, title: true, _count: { select: { bookings: { where: { status: { not: "CANCELLED" } } } } } },
      orderBy: { bookings: { _count: "desc" } },
      take: 1,
    }),
  ]);

  const confirmedBookings  = allBookings.filter((b) => b.status !== "CANCELLED");
  const cancelledBookings  = allBookings.filter((b) => b.status === "CANCELLED");
  const thisMonthBookings  = confirmedBookings.filter((b) => b.createdAt >= som);

  const totalRevenue       = confirmedBookings.reduce((s, b) => s + (b.amountEgp ?? 0), 0);
  const revenueThisMonth   = thisMonthBookings.reduce((s, b) => s + (b.amountEgp ?? 0), 0);
  const pendingPayout      = confirmedBookings
    .filter((b) => b.paymentStatus === "PAID")
    .reduce((s, b) => s + (b.tutorPayoutEgp ?? 0), 0);

  const cancellationRate =
    allBookings.length > 0
      ? Math.round((cancelledBookings.length / allBookings.length) * 100) / 100
      : 0;

  const ratings = reviews.map((r) => r.rating);
  const avgRating = ratings.length > 0
    ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
    : null;

  const topClass = ownedClasses[0]
    ? { id: ownedClasses[0].id, title: ownedClasses[0].title, bookings: ownedClasses[0]._count.bookings }
    : null;

  // Revenue by month — last 6 calendar months
  const revenueMap = new Map<string, number>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    revenueMap.set(monthKey(d), 0);
  }
  for (const b of confirmedBookings) {
    const key = monthKey(b.createdAt);
    if (revenueMap.has(key)) {
      revenueMap.set(key, (revenueMap.get(key) ?? 0) + (b.amountEgp ?? 0));
    }
  }
  const revenueByMonth = Array.from(revenueMap.entries()).map(([month, amount]) => ({
    month, amount,
  }));

  return NextResponse.json({
    totalRevenue,
    revenueThisMonth,
    pendingPayout,
    totalBookings:     confirmedBookings.length,
    bookingsThisMonth: thisMonthBookings.length,
    cancellationRate,
    avgRating,
    totalReviews: ratings.length,
    profileViews: 0, // future: add view tracking
    topClass,
    revenueByMonth,
  });
}
