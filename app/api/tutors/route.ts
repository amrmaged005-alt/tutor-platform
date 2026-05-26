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

    const where: Prisma.UserWhereInput = {
      role:        "TUTOR",
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
          ownedClasses: { select: { id: true }, where: { isActive: true } },
          reviews: {
            select: { rating: true },
            where:  { isApproved: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    const withStats = tutors.map((t) => {
      const ratings   = t.reviews.map((r) => r.rating);
      const avgRating = ratings.length > 0
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
        : null;
      const { reviews, ownedClasses, ...rest } = t;
      return { ...rest, avgRating, classCount: ownedClasses.length };
    });

    const filtered = minRating > 0
      ? withStats.filter((t) => (t.avgRating ?? 0) >= minRating)
      : withStats;

    return NextResponse.json({ items: filtered, total, hasMore: skip + filtered.length < total });
  } catch {
    return NextResponse.json({ error: "Failed to fetch tutors", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
