import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMobileUser } from "../../../mobile/_utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const reviews = await prisma.review.findMany({
    where: { classId: id, isApproved: true },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      tutorResponse: true,
      tutorRespondedAt: true,
      student: { select: { fullName: true, name: true, photoUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ reviews });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireMobileUser(req);
  if (user instanceof NextResponse) return user;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const rating = Number(body?.rating ?? 0);
  const comment = typeof body?.comment === "string" ? body.comment.slice(0, 600) : "";

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Choose a rating from 1 to 5.", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const booking = await prisma.booking.findFirst({
    where: { classId: id, studentId: user.id, status: "CONFIRMED" },
    select: { id: true },
  });

  if (!booking) {
    return NextResponse.json(
      { error: "You can only review classes you have booked.", code: "FORBIDDEN" },
      { status: 403 }
    );
  }

  // New reviews default to isApproved: false (moderation required)
  const review = await prisma.review.upsert({
    where:  { classId_studentId: { classId: id, studentId: user.id } },
    update: { rating, comment },
    create: { classId: id, studentId: user.id, rating, comment, isApproved: false },
  });

  return NextResponse.json({ review });
}
