import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function guardCenter(centerId: string) {
  const session = await auth();
  if (!session?.user?.id)
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, centerId: true },
  });
  if (!me) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const ok = me.role === "ADMIN" || (me.role === "CENTER_ADMIN" && me.centerId === centerId);
  if (!ok) return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { me };
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const guard = await guardCenter(id);
  if (guard.error) return guard.error;

  const url = new URL(req.url);
  const tutorFilter = url.searchParams.get("tutorId") ?? undefined;
  const statusFilter = url.searchParams.get("status"); // "active" | "inactive"

  const classes = await prisma.class.findMany({
    where: {
      centerId: id,
      ...(tutorFilter ? { ownerId: tutorFilter } : {}),
      ...(statusFilter === "active" ? { isActive: true } : statusFilter === "inactive" ? { isActive: false } : {}),
    },
    select: {
      id: true,
      title: true,
      subject: true,
      description: true,
      priceEgp: true,
      capacity: true,
      isActive: true,
      format: true,
      schedule: true,
      startDate: true,
      sessionDays: true,
      sessionTimeFrom: true,
      sessionTimeTo: true,
      recurrence: true,
      gradeLevel: true,
      curriculum: true,
      city: true,
      location: true,
      ownerId: true,
      owner: { select: { id: true, fullName: true, name: true } },
      _count: { select: { bookings: { where: { status: { not: "CANCELLED" } } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = classes.map((c) => ({
    id: c.id,
    title: c.title,
    subject: c.subject,
    description: c.description,
    priceEgp: c.priceEgp,
    capacity: c.capacity,
    isActive: c.isActive,
    format: c.format,
    schedule: c.schedule,
    startDate: c.startDate?.toISOString() ?? null,
    sessionDays: c.sessionDays,
    sessionTimeFrom: c.sessionTimeFrom,
    sessionTimeTo: c.sessionTimeTo,
    recurrence: c.recurrence,
    gradeLevel: c.gradeLevel,
    curriculum: c.curriculum,
    city: c.city,
    location: c.location,
    ownerId: c.ownerId,
    ownerName: c.owner?.fullName ?? c.owner?.name ?? null,
    bookingCount: c._count.bookings,
    seatsLeft: c.capacity ? c.capacity - c._count.bookings : null,
  }));

  return NextResponse.json({ classes: result });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const guard = await guardCenter(id);
  if (guard.error) return guard.error;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const { title, subject, ownerId, description, priceEgp, capacity, format,
    startDate, sessionDays, sessionTimeFrom, sessionTimeTo, recurrence,
    gradeLevel, curriculum, location } = body;

  if (!title || !subject)
    return NextResponse.json({ error: "title and subject are required" }, { status: 400 });

  // Verify tutor belongs to this center
  if (ownerId) {
    const tutor = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { centerId: true },
    });
    if (tutor?.centerId !== id)
      return NextResponse.json({ error: "Tutor is not affiliated with this center" }, { status: 400 });
  }

  const center = await prisma.learningCenter.findUnique({
    where: { id },
    select: { city: true, location: true },
  });

  const cls = await prisma.class.create({
    data: {
      title,
      subject,
      description: description ?? null,
      priceEgp: typeof priceEgp === "number" ? priceEgp : 0,
      capacity: typeof capacity === "number" ? capacity : 20,
      format: format ?? "IN_PERSON",
      curriculum: curriculum ?? "NATIONAL",
      gradeLevel: gradeLevel ?? null,
      city: center?.city ?? "Cairo",
      location: location ?? center?.location ?? null,
      startDate: startDate ? new Date(startDate) : null,
      sessionDays: Array.isArray(sessionDays) ? sessionDays : [],
      sessionTimeFrom: sessionTimeFrom ?? null,
      sessionTimeTo: sessionTimeTo ?? null,
      recurrence: recurrence ?? "weekly",
      centerId: id,
      ownerId: ownerId ?? null,
      isActive: true,
    },
    select: { id: true, title: true },
  });

  return NextResponse.json({ ok: true, class: cls }, { status: 201 });
}
