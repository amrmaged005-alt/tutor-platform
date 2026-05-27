import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json({ classes: [], tutors: [], centers: [], totalResults: 0 });
  }

  const [classes, tutors, centers] = await Promise.all([
    prisma.class.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { subject: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, title: true, subject: true, priceEgp: true, city: true },
      take: 8,
    }),
    prisma.user.findMany({
      where: {
        role: { in: ["TUTOR", "CENTER_ADMIN"] },
        isSuspended: false,
        OR: [
          { fullName: { contains: q, mode: "insensitive" } },
          { subjects: { has: q } },
        ],
      },
      select: { id: true, fullName: true, name: true, photoUrl: true, subjects: true },
      take: 8,
    }),
    prisma.learningCenter.findMany({
      where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { city: { contains: q, mode: "insensitive" } }] },
      select: { id: true, name: true, city: true, logoUrl: true },
      take: 5,
    }),
  ]);

  return NextResponse.json({
    classes,
    tutors: tutors.map((t) => ({
      id: t.id,
      name: t.fullName ?? t.name ?? "Tutor",
      photoUrl: t.photoUrl,
      subjects: t.subjects,
    })),
    centers,
    totalResults: classes.length + tutors.length + centers.length,
  });
}
