import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { ClassCreateSchema } from "@/schemas/class";
import { isRateLimited, generalLimiter } from "@/lib/ratelimit";

const PUBLIC_CLASSES_CACHE = {
  "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page  = Math.max(1, Number(searchParams.get("page")  ?? 1));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 12)));
  const skip  = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.class.findMany({
      where: { isActive: true },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        tutors: { include: { tutor: { select: { id: true, fullName: true, name: true, photoUrl: true } } } },
        center: { select: { id: true, name: true, city: true } },
        owner:  { select: { id: true, fullName: true, name: true, photoUrl: true, isVerified: true } },
        _count: { select: { bookings: { where: { status: { not: "CANCELLED" } } } } },
        reviews: { select: { rating: true }, where: { isApproved: true } },
      },
    }),
    prisma.class.count({ where: { isActive: true } }),
  ]);

  const classCards = items.map((c) => {
    const avgRating = c.reviews.length
      ? c.reviews.reduce((sum, r) => sum + r.rating, 0) / c.reviews.length
      : null;
    return {
      id: c.id,
      title: c.title,
      subject: c.subject,
      description: c.description,
      city: c.city,
      location: c.location,
      priceEgp: c.priceEgp,
      capacity: c.capacity,
      schedule: c.schedule,
      format: c.format,
      curriculum: c.curriculum,
      gradeLevel: c.gradeLevel,
      language: c.language,
      bookingsCount: c._count.bookings,
      spotsLeft: c.capacity ? c.capacity - c._count.bookings : null,
      avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
      reviewCount: c.reviews.length,
      center: c.center,
      owner: c.owner,
    };
  });

  return NextResponse.json(
    { items: classCards, total, hasMore: skip + items.length < total },
    { headers: PUBLIC_CLASSES_CACHE }
  );
}

function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const contentLength = Number(req.headers.get("content-length") ?? 0);
    if (contentLength > 32_768) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not logged in", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const limited = await isRateLimited(generalLimiter, `class:${session.user.id ?? session.user.email}`);
    if (limited) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || (user.role !== "TUTOR" && user.role !== "CENTER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Only tutors and centers can create classes", code: "FORBIDDEN" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = ClassCreateSchema.safeParse({
      ...body,
      city: body.city ?? "Cairo",
      description: body.description || undefined,
      location: body.location || undefined,
      schedule: body.schedule || undefined,
      gradeLevel: body.gradeLevel || undefined,
      capacity: body.capacity ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid class details", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const newClass = await prisma.class.create({
      data: {
        title:       data.title,
        subject:     data.subject,
        curriculum:  data.curriculum,
        gradeLevel:  data.gradeLevel ?? null,
        format:      data.format,
        language:    data.language,
        description: data.description ?? null,
        location:    data.location ?? null,
        city:        data.city,
        priceEgp:    data.priceEgp,
        capacity:    data.capacity,
        schedule:    data.schedule ?? null,
        isOnline:    data.format === "ONLINE",
        paymentType: data.format === "ONLINE" ? "ONLINE" : "IN_PERSON",
        ownerId: user.id,
        tutors: {
          create: [{ tutorId: user.id }],
        },
      },
    });

    return NextResponse.json({ success: true, class: newClass });
  } catch (error) {
    console.error("Create class error:", error);
    return NextResponse.json({ error: "Something went wrong", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
