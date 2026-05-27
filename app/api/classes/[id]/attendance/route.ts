import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireTutorForClass(classId: string, userId: string) {
  const cls = await prisma.class.findUnique({
    where: { id: classId },
    select: {
      id: true,
      ownerId: true,
      tutors: { select: { tutorId: true } },
    },
  });
  if (!cls) return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };

  const isOwner = cls.ownerId === userId;
  const isTutor = cls.tutors.some((t) => t.tutorId === userId);
  if (!isOwner && !isTutor) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { cls };
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const guard = await requireTutorForClass(id, session.user.id);
  if (guard.error) return guard.error;

  const records = await prisma.attendanceRecord.findMany({
    where: { classId: id },
    orderBy: [{ sessionDate: "desc" }, { studentId: "asc" }],
    select: {
      id: true,
      bookingId: true,
      sessionDate: true,
      attended: true,
      notes: true,
      student: { select: { id: true, fullName: true, name: true, email: true } },
    },
  });

  // Group by student
  const byStudent = new Map<
    string,
    {
      studentId: string;
      studentName: string;
      studentEmail: string | null;
      sessions: Array<{ id: string; bookingId: string; sessionDate: Date; attended: boolean; notes: string | null }>;
      attendedCount: number;
      totalCount: number;
    }
  >();

  for (const r of records) {
    const sid = r.student.id;
    if (!byStudent.has(sid)) {
      byStudent.set(sid, {
        studentId: sid,
        studentName: r.student.fullName ?? r.student.name ?? "Student",
        studentEmail: r.student.email,
        sessions: [],
        attendedCount: 0,
        totalCount: 0,
      });
    }
    const bucket = byStudent.get(sid)!;
    bucket.sessions.push({
      id: r.id,
      bookingId: r.bookingId,
      sessionDate: r.sessionDate,
      attended: r.attended,
      notes: r.notes,
    });
    bucket.totalCount++;
    if (r.attended) bucket.attendedCount++;
  }

  return NextResponse.json({ students: Array.from(byStudent.values()) });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const guard = await requireTutorForClass(id, session.user.id);
  if (guard.error) return guard.error;

  const body = await req.json().catch(() => null);
  const bookingId = String(body?.bookingId ?? "");
  const studentId = String(body?.studentId ?? "");
  const sessionDateStr = String(body?.sessionDate ?? "");
  const attended = Boolean(body?.attended);
  const notes = typeof body?.notes === "string" ? body.notes.slice(0, 500) : null;

  if (!bookingId || !studentId || !sessionDateStr) {
    return NextResponse.json(
      { error: "bookingId, studentId, sessionDate are required" },
      { status: 400 }
    );
  }

  const sessionDate = new Date(sessionDateStr);
  if (isNaN(sessionDate.getTime())) {
    return NextResponse.json({ error: "Invalid sessionDate" }, { status: 400 });
  }

  // Verify booking belongs to this class+student
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, classId: true, studentId: true },
  });
  if (!booking || booking.classId !== id || booking.studentId !== studentId) {
    return NextResponse.json({ error: "Booking does not match class/student" }, { status: 400 });
  }

  const record = await prisma.attendanceRecord.upsert({
    where: { bookingId_sessionDate: { bookingId, sessionDate } },
    create: {
      bookingId,
      classId: id,
      studentId,
      tutorId: session.user.id,
      sessionDate,
      attended,
      notes,
    },
    update: { attended, notes },
  });

  return NextResponse.json({ ok: true, record });
}
