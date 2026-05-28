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

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string; classId: string }> }
) {
  const { id, classId } = await ctx.params;
  const guard = await guardCenter(id);
  if (guard.error) return guard.error;

  const cls = await prisma.class.findUnique({
    where: { id: classId },
    select: { centerId: true },
  });
  if (!cls || cls.centerId !== id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const {
    title, subject, description, priceEgp, capacity, format, isActive,
    startDate, sessionDays, sessionTimeFrom, sessionTimeTo, recurrence,
    gradeLevel, curriculum, location, ownerId,
  } = body;

  if (ownerId) {
    const tutor = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { centerId: true },
    });
    if (tutor?.centerId !== id)
      return NextResponse.json({ error: "Tutor not in this center" }, { status: 400 });
  }

  const updated = await prisma.class.update({
    where: { id: classId },
    data: {
      ...(title !== undefined && { title }),
      ...(subject !== undefined && { subject }),
      ...(description !== undefined && { description }),
      ...(typeof priceEgp === "number" && { priceEgp }),
      ...(typeof capacity === "number" && { capacity }),
      ...(format !== undefined && { format }),
      ...(typeof isActive === "boolean" && { isActive }),
      ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
      ...(Array.isArray(sessionDays) && { sessionDays }),
      ...(sessionTimeFrom !== undefined && { sessionTimeFrom }),
      ...(sessionTimeTo !== undefined && { sessionTimeTo }),
      ...(recurrence !== undefined && { recurrence }),
      ...(gradeLevel !== undefined && { gradeLevel }),
      ...(curriculum !== undefined && { curriculum }),
      ...(location !== undefined && { location }),
      ...(ownerId !== undefined && { ownerId }),
    },
    select: { id: true, title: true, isActive: true },
  });

  return NextResponse.json({ ok: true, class: updated });
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string; classId: string }> }
) {
  const { id, classId } = await ctx.params;
  const guard = await guardCenter(id);
  if (guard.error) return guard.error;

  const cls = await prisma.class.findUnique({
    where: { id: classId },
    select: { centerId: true },
  });
  if (!cls || cls.centerId !== id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Check for upcoming confirmed bookings
  const upcomingBookings = await prisma.booking.count({
    where: {
      classId,
      status: "CONFIRMED",
    },
  });
  if (upcomingBookings > 0) {
    return NextResponse.json(
      { error: "This class has active confirmed bookings. Cancel them first." },
      { status: 409 }
    );
  }

  await prisma.class.update({
    where: { id: classId },
    data: { isActive: false },
  });

  return NextResponse.json({ ok: true });
}
