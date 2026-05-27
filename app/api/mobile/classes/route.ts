import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CACHE_HEADERS = { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" };

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const subject = searchParams.get("subject")?.trim() || undefined;
  const city = searchParams.get("city")?.trim() || undefined;
  const q = searchParams.get("q")?.trim() || undefined;

  const where: Record<string, unknown> = { isActive: true };
  if (subject) where.subject = { equals: subject, mode: "insensitive" };
  if (city) where.city = { equals: city, mode: "insensitive" };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { subject: { contains: q, mode: "insensitive" } },
    ];
  }

  const [classes, total] = await Promise.all([
    prisma.class.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        subject: true,
        priceEgp: true,
        city: true,
        location: true,
        schedule: true,
        format: true,
        gradeLevel: true,
        capacity: true,
        owner: { select: { id: true, fullName: true, name: true, photoUrl: true } },
        _count: { select: { bookings: { where: { status: { not: "CANCELLED" } } }, reviews: true } },
      },
    }),
    prisma.class.count({ where }),
  ]);

  const items = classes.map((c) => ({
    id: c.id,
    title: c.title,
    subject: c.subject,
    priceEgp: c.priceEgp,
    city: c.city,
    location: c.location,
    schedule: c.schedule,
    format: c.format,
    gradeLevel: c.gradeLevel,
    capacity: c.capacity,
    spotsLeft: c.capacity == null ? null : Math.max(c.capacity - c._count.bookings, 0),
    tutorName: c.owner?.fullName ?? c.owner?.name ?? null,
    tutorPhotoUrl: c.owner?.photoUrl ?? null,
    bookingsCount: c._count.bookings,
    reviewCount: c._count.reviews,
  }));

  return NextResponse.json(
    { classes: items, meta: { total, page, limit, pages: Math.ceil(total / limit) } },
    { headers: CACHE_HEADERS }
  );
}
