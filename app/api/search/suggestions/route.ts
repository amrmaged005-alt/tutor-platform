import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
};

const DEFAULT_SUBJECTS = [
  "Math", "Physics", "Chemistry", "Biology", "English", "Arabic",
  "Computer Science", "Science", "French", "Economics",
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (q.length < 2) {
    return NextResponse.json(
      { classes: [], tutors: [], subjects: DEFAULT_SUBJECTS.slice(0, 5) },
      { headers: CACHE_HEADERS }
    );
  }

  const matchingSubjects = DEFAULT_SUBJECTS
    .filter((s) => s.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 4);

  const [classRows, tutorRows] = await Promise.all([
    prisma.class.findMany({
      where: {
        isActive: true,
        OR: [
          { title:       { contains: q, mode: "insensitive" } },
          { subject:     { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true, title: true, subject: true,
        _count: { select: { bookings: true } },
      },
      orderBy: { bookings: { _count: "desc" } },
      take: 5,
    }),
    prisma.user.findMany({
      where: {
        role:        { in: ["TUTOR", "CENTER_ADMIN"] },
        isSuspended: false,
        OR: [
          { fullName: { contains: q, mode: "insensitive" } },
          { name:     { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true, fullName: true, name: true, subjects: true, isVerified: true,
      },
      orderBy: [{ isVerified: "desc" }, { createdAt: "desc" }],
      take: 5,
    }),
  ]);

  return NextResponse.json(
    {
      classes: classRows.map((c) => ({ id: c.id, title: c.title, subject: c.subject })),
      tutors:  tutorRows.map((t) => ({
        id:       t.id,
        name:     t.fullName ?? t.name ?? "Tutor",
        subjects: t.subjects,
      })),
      subjects: matchingSubjects,
    },
    { headers: CACHE_HEADERS }
  );
}
