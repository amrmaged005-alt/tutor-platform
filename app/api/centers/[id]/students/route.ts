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
  const search = url.searchParams.get("q")?.toLowerCase() ?? "";

  const centerClasses = await prisma.class.findMany({
    where: { centerId: id },
    select: { id: true, title: true, subject: true },
  });
  const centerClassIds = centerClasses.map((c) => c.id);

  if (centerClassIds.length === 0) {
    return NextResponse.json({ students: [] });
  }

  const bookings = await prisma.booking.findMany({
    where: {
      classId: { in: centerClassIds },
      status: { not: "CANCELLED" },
    },
    select: {
      id: true,
      amountEgp: true,
      createdAt: true,
      classId: true,
      studentId: true,
      student: {
        select: {
          id: true,
          fullName: true,
          name: true,
          email: true,
          photoUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Group by student
  const studentMap = new Map<
    string,
    {
      id: string;
      fullName: string | null;
      name: string | null;
      email: string | null;
      photoUrl: string | null;
      totalBookings: number;
      totalSpend: number;
      lastBookingDate: string;
      enrolledClassIds: Set<string>;
    }
  >();

  for (const b of bookings) {
    const s = b.student;
    const existing = studentMap.get(s.id);
    if (existing) {
      existing.totalBookings++;
      existing.totalSpend += b.amountEgp ?? 0;
      existing.enrolledClassIds.add(b.classId);
    } else {
      studentMap.set(s.id, {
        id: s.id,
        fullName: s.fullName,
        name: s.name,
        email: s.email,
        photoUrl: s.photoUrl,
        totalBookings: 1,
        totalSpend: b.amountEgp ?? 0,
        lastBookingDate: b.createdAt.toISOString(),
        enrolledClassIds: new Set([b.classId]),
      });
    }
  }

  const classById = Object.fromEntries(centerClasses.map((c) => [c.id, c]));

  let students = Array.from(studentMap.values()).map((s) => ({
    id: s.id,
    fullName: s.fullName,
    name: s.name,
    email: s.email,
    photoUrl: s.photoUrl,
    totalBookings: s.totalBookings,
    totalSpend: s.totalSpend,
    lastBookingDate: s.lastBookingDate,
    enrolledClasses: Array.from(s.enrolledClassIds).map((cid) => ({
      id: cid,
      title: classById[cid]?.title ?? cid,
      subject: classById[cid]?.subject ?? "",
    })),
  }));

  if (search) {
    students = students.filter(
      (s) =>
        (s.fullName?.toLowerCase() ?? "").includes(search) ||
        (s.name?.toLowerCase() ?? "").includes(search) ||
        (s.email?.toLowerCase() ?? "").includes(search)
    );
  }

  students.sort((a, b) => new Date(b.lastBookingDate).getTime() - new Date(a.lastBookingDate).getTime());

  return NextResponse.json({ students });
}
