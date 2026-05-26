import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TRENDING_CACHE = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
};

export async function GET() {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Group bookings by classId in the last 7 days (exclude cancelled)
    const grouped = await prisma.booking.groupBy({
      by: ["classId"],
      where: {
        createdAt: { gte: since },
        status:    { not: "CANCELLED" },
      },
      _count: { classId: true },
      orderBy: { _count: { classId: "desc" } },
      take: 10,
    });

    let classIds = grouped.map((g) => g.classId);

    // Fallback: if fewer than 3 trending, fill with top-rated classes
    if (classIds.length < 3) {
      const topRated = await prisma.class.findMany({
        where:   { isActive: true },
        select:  { id: true },
        orderBy: { reviews: { _count: "desc" } },
        take:    10,
      });
      const extraIds = topRated
        .map((c) => c.id)
        .filter((id) => !classIds.includes(id));
      classIds = [...classIds, ...extraIds].slice(0, 10);
    }

    const classes = await prisma.class.findMany({
      where: { id: { in: classIds }, isActive: true },
      include: {
        owner:  { select: { id: true, fullName: true, name: true, photoUrl: true, isVerified: true } },
        tutors: { include: { tutor: { select: { id: true, fullName: true, name: true, photoUrl: true } } } },
        reviews: { select: { rating: true }, where: { isApproved: true } },
        _count:  { select: { bookings: { where: { status: { not: "CANCELLED" } } } } },
      },
    });

    // Build a lookup for weeklyBookings
    const weeklyMap = new Map(grouped.map((g) => [g.classId, g._count.classId]));

    // Preserve trending order; append fallback classes at end
    const ordered = classIds
      .map((id) => classes.find((c) => c.id === id))
      .filter(Boolean) as typeof classes;

    const result = ordered.map((cls) => {
      const ratings = cls.reviews.map((r) => r.rating);
      const avgRating = ratings.length
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
        : null;
      const { reviews, ...rest } = cls;
      return {
        ...rest,
        avgRating,
        weeklyBookings: weeklyMap.get(cls.id) ?? 0,
      };
    });

    return NextResponse.json({ items: result }, { headers: TRENDING_CACHE });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch trending classes", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
