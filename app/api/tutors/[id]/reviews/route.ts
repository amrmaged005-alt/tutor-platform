import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const reviews = await prisma.review.findMany({
    where: {
      isApproved: true,
      class: {
        OR: [{ ownerId: id }, { tutors: { some: { tutorId: id } } }],
      },
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      tutorResponse: true,
      tutorRespondedAt: true,
      classId: true,
      class: { select: { title: true } },
      student: { select: { fullName: true, name: true, photoUrl: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json({ reviews });
}
