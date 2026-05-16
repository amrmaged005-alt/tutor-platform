import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { isRateLimited, reviewLimiter } from "@/lib/ratelimit";

function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const limited = await isRateLimited(reviewLimiter, session.user.id);
  if (limited) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
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