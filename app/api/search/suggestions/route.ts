import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
};

const DEFAULT_SUBJECTS = [
  "Math",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Arabic",
  "Computer Science",
  "Science",
  "French",
  "Economics",
];

type SuggestionType = "subject" | "class" | "tutor" | "center";

type Suggestion = {
  id: string;
  type: SuggestionType;
  label: string;
  href: string;
  meta?: string;
};

function subjectSuggestion(subject: string): Suggestion {
  return {
    id: `subject:${subject}`,
    type: "subject",
    label: subject,
    href: `/classes?subject=${encodeURIComponent(subject)}`,
    meta: "Subject",
  };
}

function normalizeLimit(value: string | null) {
  return Math.min(12, Math.max(4, Number(value ?? 8) || 8));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const limit = normalizeLimit(searchParams.get("limit"));

  if (q.length < 2) {
    return NextResponse.json(
      { items: DEFAULT_SUBJECTS.slice(0, limit).map(subjectSuggestion) },
      { headers: CACHE_HEADERS }
    );
  }

  const matchingSubjects = DEFAULT_SUBJECTS
    .filter((subject) => subject.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 4)
    .map(subjectSuggestion);

  const [classes, tutors, centers] = await Promise.all([
    prisma.class.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { subject: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        subject: true,
        curriculum: true,
        _count: { select: { bookings: true } },
      },
      orderBy: { bookings: { _count: "desc" } },
      take: limit,
    }),
    prisma.user.findMany({
      where: {
        role: { in: ["TUTOR", "CENTER_ADMIN"] },
        isSuspended: false,
        OR: [
          { fullName: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        fullName: true,
        name: true,
        subjects: true,
        isVerified: true,
      },
      orderBy: [{ isVerified: "desc" }, { createdAt: "desc" }],
      take: limit,
    }),
    prisma.learningCenter.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { city: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        city: true,
        _count: { select: { classes: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
  ]);

  const items: Suggestion[] = [
    ...matchingSubjects,
    ...classes.map((item) => ({
      id: `class:${item.id}`,
      type: "class" as const,
      label: item.title,
      href: `/classes/${item.id}`,
      meta: `${item.subject} - ${item.curriculum} - ${item._count.bookings} enrolled`,
    })),
    ...tutors.map((item) => ({
      id: `tutor:${item.id}`,
      type: "tutor" as const,
      label: item.fullName ?? item.name ?? "Coursaty Tutor",
      href: `/tutors/${item.id}`,
      meta: item.subjects.slice(0, 2).join(", ") || (item.isVerified ? "Verified tutor" : "Tutor"),
    })),
    ...centers.map((item) => ({
      id: `center:${item.id}`,
      type: "center" as const,
      label: item.name,
      href: `/centers/${item.id}`,
      meta: `${item.city} - ${item._count.classes} classes`,
    })),
  ].slice(0, limit);

  return NextResponse.json({ items }, { headers: CACHE_HEADERS });
}
