import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "../../generated/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subject   = searchParams.get("subject") || "";
    const city      = searchParams.get("city") || "";
    const minRating = Number(searchParams.get("minRating") ?? 0);
    const page      = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit     = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 12)));
    const skip      = (page - 1) * limit;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const where: Prisma.UserWhereInput = {
      role:        { in: ["TUTOR", "CENTER_ADMIN"] },
      isSuspended: false,
    };

    if (subject) {
      where.subjects = { has: subject };
    }

    if (city) {
      where.OR = [
        { center: { city: { contains: city, mode: "insensitive" } } },
        { ownedClasses: { some: { city: { contains: city, mode: "insensitive" } } } },
      ];
    }

    const [tutors, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id:          true,
          fullName:    true,
          name:        true,
          photoUrl:    true,
          bio:         true,
          subjects:    true,
          isVerified:  true,
          createdAt:   true,
          center: {
            select: { id: true, name: true, city: true },
          },
          ownedClasses: {
            where: { isActive: true },
            select: {
              id: true,
              city: true,
              bookings: { select: { id: true, createdAt: true, studentId: true } },
              reviews: {
                select: { rating: true },
                where:  { isApproved: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    const withStats = tutors.map((t) => {
      const reviews = t.ownedClasses.flatMap((cls) => cls.reviews);
      const bookings = t.ownedClasses.flatMap((cls) => cls.bookings);
      const bookingsByStudent = bookings.reduce<Record<string, number>>((acc, booking) => {
        acc[booking.studentId] = (acc[booking.studentId] ?? 0) + 1;
        return acc;
      }, {});
      const lastBookedAt = bookings.reduce<Date | null>((latest, booking) => {
        if (!latest || booking.createdAt > latest) return booking.createdAt;
        return latest;
      }, null);
      const ratings   = reviews.map((r) => r.rating);
      const avgRating = ratings.length > 0
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
        : null;
      const city = t.center?.city ?? t.ownedClasses.find((cls) => cls.city)?.city ?? "Cairo";
      const { ownedClasses, ...rest } = t;
      return {
        ...rest,
        city,
        center: t.center ? { id: t.center.id, name: t.center.name } : null,
        avgRating,
        classCount: ownedClasses.length,
        studentCount: bookings.length,
        reviewCount: reviews.length,
        studentsThisWeek: bookings.filter((booking) => booking.createdAt >= weekAgo).length,
        repeatStudentCount: Object.values(bookingsByStudent).filter((count) => count > 1).length,
        lastBookedAt: lastBookedAt?.toISOString() ?? null,
      };
    });

    const filtered = minRating > 0
      ? withStats.filter((t) => (t.avgRating ?? 0) >= minRating)
      : withStats;

    return NextResponse.json({ items: filtered, total, hasMore: skip + filtered.length < total });
  } catch {
    return NextResponse.json({ error: "Failed to fetch tutors", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
