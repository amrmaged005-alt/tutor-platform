import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { classId, rating, comment } = body;

  if (!classId || typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const booking = await prisma.booking.findFirst({
    where: {
      classId,
      studentId: session.user.id,
      status: "CONFIRMED",
    },
  });

  if (!booking) {
    return NextResponse.json(
      { error: "You can only review classes you have a confirmed booking for" },
      { status: 403 }
    );
  }

  const review = await prisma.review.upsert({
    where: {
      classId_studentId: {
        classId,
        studentId: session.user.id,
      },
    },
    update: { rating, comment },
    create: {
      classId,
      studentId: session.user.id,
      rating,
      comment,
    },
  });

  return NextResponse.json(review);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");

  if (!classId) {
    return NextResponse.json({ error: "classId required" }, { status: 400 });
  }

  const reviews = await prisma.review.findMany({
    where: { classId },
    include: {
      student: {
        select: {
          fullName: true,
          name: true,
          photoUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reviews);
}