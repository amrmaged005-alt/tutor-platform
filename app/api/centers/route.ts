import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city")?.trim();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));

  const where = city ? { city: { equals: city, mode: "insensitive" as const } } : {};

  const [centers, total] = await Promise.all([
    prisma.learningCenter.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        description: true,
        logoUrl: true,
        city: true,
        location: true,
        _count: { select: { tutors: true, classes: true } },
        classes: { select: { subject: true } },
      },
    }),
    prisma.learningCenter.count({ where }),
  ]);

  // Compute avg rating per center based on reviews of their classes
  const centerIds = centers.map((c) => c.id);
  const ratings = centerIds.length
    ? await prisma.review.groupBy({
        by: ["classId"],
        where: { isApproved: true, class: { centerId: { in: centerIds } } },
        _avg: { rating: true },
      })
    : [];

  // Map class -> center
  const classToCenter = centerIds.length
    ? await prisma.class.findMany({
        where: { centerId: { in: centerIds } },
        select: { id: true, centerId: true },
      })
    : [];
  const classCenterMap = new Map(classToCenter.map((c) => [c.id, c.centerId]));

  const ratingSums = new Map<string, { sum: number; count: number }>();
  for (const r of ratings) {
    const cid = classCenterMap.get(r.classId);
    if (!cid || r._avg.rating == null) continue;
    const bucket = ratingSums.get(cid) ?? { sum: 0, count: 0 };
    bucket.sum += r._avg.rating;
    bucket.count++;
    ratingSums.set(cid, bucket);
  }

  const result = centers.map((c) => {
    const r = ratingSums.get(c.id);
    return {
      id: c.id,
      name: c.name,
      description: c.description,
      logoUrl: c.logoUrl,
      city: c.city,
      location: c.location,
      tutorCount: c._count.tutors,
      classCount: c._count.classes,
      subjects: Array.from(new Set(c.classes.map((cls) => cls.subject))),
      avgRating: r && r.count > 0 ? Math.round((r.sum / r.count) * 10) / 10 : null,
      reviewCount: r?.count ?? 0,
      totalStudents: 0,
      phone: null,
      email: null,
    };
  });

  return NextResponse.json({
    centers: result,
    meta: { total, page, limit, pages: Math.ceil(total / limit) },
  });
}
