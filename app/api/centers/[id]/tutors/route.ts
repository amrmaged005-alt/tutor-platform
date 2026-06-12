import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireCenterAdmin(centerId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, centerId: true },
  });
  if (!user || user.role !== "CENTER_ADMIN" || user.centerId !== centerId) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user };
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const guard = await requireCenterAdmin(id);
  if (guard.error) return guard.error;

  const tutors = await prisma.user.findMany({
    where: { centerId: id, role: { in: ["TUTOR", "CENTER_ADMIN"] } },
    select: {
      id: true,
      fullName: true,
      name: true,
      email: true,
      photoUrl: true,
      bio: true,
      subjects: true,
      isVerified: true,
      centerAccessLevel: true,
      _count: { select: { ownedClasses: true } },
      ownedClasses: {
        select: {
          id: true,
          title: true,
          capacity: true,
          _count: { select: { bookings: { where: { status: { not: "CANCELLED" } } } } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const tutorIds = tutors.map((t) => t.id);
  const ratings = tutorIds.length
    ? await prisma.review.groupBy({
        by: ["classId"],
        where: {
          isApproved: true,
          class: { OR: [{ ownerId: { in: tutorIds } }, { tutors: { some: { tutorId: { in: tutorIds } } } }] },
        },
        _avg: { rating: true },
        _count: { rating: true },
      })
    : [];

  const classMap = tutorIds.length
    ? await prisma.class.findMany({
        where: { OR: [{ ownerId: { in: tutorIds } }, { tutors: { some: { tutorId: { in: tutorIds } } } }] },
        select: { id: true, ownerId: true },
      })
    : [];

  const ratingByTutor = new Map<string, { sum: number; count: number }>();
  for (const r of ratings) {
    const cls = classMap.find((c) => c.id === r.classId);
    if (!cls?.ownerId || r._avg.rating == null) continue;
    const bucket = ratingByTutor.get(cls.ownerId) ?? { sum: 0, count: 0 };
    bucket.sum += r._avg.rating * (r._count.rating ?? 1);
    bucket.count += r._count.rating ?? 1;
    ratingByTutor.set(cls.ownerId, bucket);
  }

  const result = tutors.map((t) => {
    const rb = ratingByTutor.get(t.id);
    return {
      id: t.id,
      fullName: t.fullName,
      name: t.name,
      email: t.email,
      photoUrl: t.photoUrl,
      bio: t.bio,
      subjects: t.subjects,
      isVerified: t.isVerified,
      accessLevel: t.centerAccessLevel,
      classCount: t._count.ownedClasses,
      avgRating: rb && rb.count > 0 ? Math.round((rb.sum / rb.count) * 10) / 10 : null,
      classes: t.ownedClasses.map((c) => ({
        id: c.id,
        title: c.title,
        capacity: c.capacity,
        bookings: c._count.bookings,
      })),
    };
  });

  return NextResponse.json({ tutors: result });
}

const ACCESS_LEVELS = ["FULL", "LIMITED", "VIEW_ONLY"] as const;
type AccessLevel = (typeof ACCESS_LEVELS)[number];

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const guard = await requireCenterAdmin(id);
  if (guard.error) return guard.error;

  const body = await req.json().catch(() => null);
  const tutorId = typeof body?.tutorId === "string" ? body.tutorId : "";
  const accessLevel = body?.accessLevel as AccessLevel | undefined;
  if (!tutorId || !accessLevel || !ACCESS_LEVELS.includes(accessLevel)) {
    return NextResponse.json({ error: "tutorId and a valid accessLevel are required" }, { status: 400 });
  }

  const tutor = await prisma.user.findUnique({
    where: { id: tutorId },
    select: { id: true, centerId: true, role: true },
  });
  if (!tutor || tutor.centerId !== id) {
    return NextResponse.json({ error: "Tutor is not in this center" }, { status: 404 });
  }
  if (tutor.role === "CENTER_ADMIN") {
    return NextResponse.json({ error: "Center admins always have full access" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: tutorId },
    data: { centerAccessLevel: accessLevel },
    select: { id: true, centerAccessLevel: true },
  });

  return NextResponse.json({ ok: true, tutorId: updated.id, accessLevel: updated.centerAccessLevel });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const guard = await requireCenterAdmin(id);
  if (guard.error) return guard.error;

  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const tutor = await prisma.user.findUnique({ where: { email } });
  if (!tutor) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (tutor.centerId && tutor.centerId !== id) {
    return NextResponse.json({ error: "User already belongs to another center" }, { status: 409 });
  }

  const updated = await prisma.user.update({
    where: { id: tutor.id },
    data: {
      centerId: id,
      role: tutor.role === "ADMIN" || tutor.role === "CENTER_ADMIN" ? tutor.role : "TUTOR",
    },
    select: { id: true, fullName: true, name: true, email: true, role: true, centerId: true },
  });

  return NextResponse.json({ ok: true, tutor: updated });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const guard = await requireCenterAdmin(id);
  if (guard.error) return guard.error;

  const body = await req.json().catch(() => null);
  const tutorId = typeof body?.tutorId === "string" ? body.tutorId : "";
  if (!tutorId) return NextResponse.json({ error: "tutorId required" }, { status: 400 });

  const tutor = await prisma.user.findUnique({
    where: { id: tutorId },
    select: { id: true, centerId: true },
  });
  if (!tutor || tutor.centerId !== id) {
    return NextResponse.json({ error: "Tutor is not in this center" }, { status: 404 });
  }

  await prisma.user.update({ where: { id: tutorId }, data: { centerId: null } });
  return NextResponse.json({ ok: true });
}
