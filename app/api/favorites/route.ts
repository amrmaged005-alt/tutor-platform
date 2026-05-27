import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ classIds: [], tutorIds: [] });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      class: {
        include: {
          center: { select: { id: true, name: true, city: true } },
          owner: { select: { id: true, fullName: true, name: true, photoUrl: true, isVerified: true } },
          _count: { select: { bookings: { where: { status: { not: "CANCELLED" } } } } },
          reviews: { select: { rating: true }, where: { isApproved: true } },
        },
      },
    },
  });
  const tutorIds = favorites.map((f) => f.tutorId).filter(Boolean) as string[];
  const tutors = tutorIds.length
    ? await prisma.user.findMany({
        where: { id: { in: tutorIds } },
        select: {
          id: true,
          fullName: true,
          name: true,
          bio: true,
          subjects: true,
          photoUrl: true,
          isVerified: true,
          center: { select: { id: true, name: true, city: true } },
          ownedClasses: { select: { bookings: { select: { id: true, createdAt: true, studentId: true } }, reviews: { select: { rating: true }, where: { isApproved: true } } } },
        },
      })
    : [];
  const classes = favorites.flatMap((f) => {
    if (!f.class) return [];
    const avgRating = f.class.reviews.length ? f.class.reviews.reduce((sum, r) => sum + r.rating, 0) / f.class.reviews.length : null;
    return [{
      id: f.class.id,
      title: f.class.title,
      subject: f.class.subject,
      description: f.class.description,
      city: f.class.city,
      location: f.class.location,
      priceEgp: f.class.priceEgp,
      capacity: f.class.capacity,
      schedule: f.class.schedule,
      format: f.class.format,
      curriculum: f.class.curriculum,
      gradeLevel: f.class.gradeLevel,
      language: f.class.language,
      bookingsCount: f.class._count.bookings,
      spotsLeft: f.class.capacity ? f.class.capacity - f.class._count.bookings : null,
      avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
      reviewCount: f.class.reviews.length,
      center: f.class.center,
      owner: f.class.owner,
    }];
  });

  return NextResponse.json({
    classIds: favorites.map((f) => f.classId).filter(Boolean) as string[],
    tutorIds,
    classes,
    tutors: tutors.map((t) => {
      const reviews = t.ownedClasses.flatMap((cls) => cls.reviews);
      const bookings = t.ownedClasses.flatMap((cls) => cls.bookings);
      const avgRating = reviews.length ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10 : null;
      return {
        id: t.id,
        fullName: t.fullName,
        name: t.name,
        bio: t.bio,
        subjects: t.subjects,
        photoUrl: t.photoUrl,
        city: t.center?.city ?? "Cairo",
        center: t.center ? { id: t.center.id, name: t.center.name } : null,
        classCount: t.ownedClasses.length,
        studentCount: bookings.length,
        avgRating,
        reviewCount: reviews.length,
        isVerified: t.isVerified,
        studentsThisWeek: 0,
        repeatStudentCount: 0,
        lastBookedAt: null,
      };
    }),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const type = body?.type as "class" | "tutor" | undefined;
  const id   = typeof body?.id === "string" ? body.id : null;

  if (!type || !id || (type !== "class" && type !== "tutor")) {
    return NextResponse.json({ error: "type and id are required", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  await prisma.favorite.upsert({
    where: type === "class"
      ? { userId_classId: { userId: session.user.id, classId: id } }
      : { userId_tutorId: { userId: session.user.id, tutorId: id } },
    update: {},
    create: {
      userId:  session.user.id,
      classId: type === "class" ? id : null,
      tutorId: type === "tutor" ? id : null,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const type = body?.type as "class" | "tutor" | undefined;
  const id   = typeof body?.id === "string" ? body.id : null;

  if (!type || !id || (type !== "class" && type !== "tutor")) {
    return NextResponse.json({ error: "type and id are required", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  await prisma.favorite.deleteMany({
    where: type === "class"
      ? { userId: session.user.id, classId: id }
      : { userId: session.user.id, tutorId: id },
  });

  return NextResponse.json({ ok: true });
}
