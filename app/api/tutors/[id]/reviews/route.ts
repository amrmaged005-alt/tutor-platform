import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const reviews = await prisma.review.findMany({
    where: {
      class: {
        OR: [{ ownerId: id }, { tutors: { some: { tutorId: id } } }],
      },
    },
    include: {
      student: { select: { fullName: true, name: true, photoUrl: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json({ reviews });
}
