import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  });
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (me.role === "STUDENT") {
    const records = await prisma.attendanceRecord.findMany({
      where: { studentId: me.id },
      orderBy: { sessionDate: "desc" },
      select: {
        id: true,
        sessionDate: true,
        attended: true,
        notes: true,
        class: { select: { id: true, title: true, subject: true } },
      },
    });

    const byClass = new Map<string, { classId: string; title: string; subject: string; attended: number; total: number }>();
    for (const r of records) {
      const cid = r.class.id;
      if (!byClass.has(cid)) {
        byClass.set(cid, { classId: cid, title: r.class.title, subject: r.class.subject, attended: 0, total: 0 });
      }
      const bucket = byClass.get(cid)!;
      bucket.total++;
      if (r.attended) bucket.attended++;
    }

    const summary = Array.from(byClass.values()).map((c) => ({
      ...c,
      attendancePct: c.total > 0 ? Math.round((c.attended / c.total) * 100) : 0,
    }));

    return NextResponse.json({ records, summary });
  }

  // TUTOR / CENTER_ADMIN / ADMIN
  const records = await prisma.attendanceRecord.findMany({
    where:
      me.role === "ADMIN"
        ? {}
        : {
            class: {
              OR: [{ ownerId: me.id }, { tutors: { some: { tutorId: me.id } } }],
            },
          },
    orderBy: { sessionDate: "desc" },
    take: 500,
    select: {
      id: true,
      sessionDate: true,
      attended: true,
      notes: true,
      class: { select: { id: true, title: true } },
      student: { select: { id: true, fullName: true, name: true } },
    },
  });

  return NextResponse.json({ records });
}
