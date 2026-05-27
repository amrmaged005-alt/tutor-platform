import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const source = await prisma.class.findUnique({
    where: { id },
    select: { subject: true, curriculum: true },
  });

  if (!source) {
    return NextResponse.json({ error: "Class not found", code: "NOT_FOUND" }, { status: 404 });
  }

  const similar = await prisma.class.findMany({
    where: {
      id:         { not: id },
      subject:    source.subject,
      curriculum: source.curriculum,
      isActive:   true,
    },
    take: 6,
    orderBy: { reviews: { _count: "desc" } },
    include: {
      tutors: { include: { tutor: { select: { id: true, fullName: true, name: true, photoUrl: true } } } },
      center: { select: { id: true, name: true, logoUrl: true } },
      owner:  { select: { id: true, fullName: true, name: true, photoUrl: true } },
      _count: { select: { bookings: true, reviews: true } },
    },
  });

  return NextResponse.json(similar, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
