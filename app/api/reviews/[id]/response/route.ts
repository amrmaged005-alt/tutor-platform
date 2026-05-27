import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function loadReviewWithOwnership(reviewId: string) {
  return prisma.review.findUnique({
    where: { id: reviewId },
    select: {
      id: true,
      tutorResponse: true,
      tutorRespondedAt: true,
      class: {
        select: {
          ownerId: true,
          tutors: { select: { tutorId: true } },
        },
      },
    },
  });
}

function isOwnerOrTutor(
  review: NonNullable<Awaited<ReturnType<typeof loadReviewWithOwnership>>>,
  userId: string
): boolean {
  if (review.class.ownerId === userId) return true;
  return review.class.tutors.some((t) => t.tutorId === userId);
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const response = typeof body?.response === "string" ? body.response.trim() : "";

  if (!response) {
    return NextResponse.json({ error: "Response is required" }, { status: 400 });
  }
  if (response.length > 500) {
    return NextResponse.json({ error: "Response must be 500 characters or fewer" }, { status: 400 });
  }

  const review = await loadReviewWithOwnership(id);
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!isOwnerOrTutor(review, session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (review.tutorResponse) {
    return NextResponse.json(
      { error: "You have already responded to this review" },
      { status: 409 }
    );
  }

  const updated = await prisma.review.update({
    where: { id },
    data: { tutorResponse: response, tutorRespondedAt: new Date() },
    select: {
      id: true,
      rating: true,
      comment: true,
      tutorResponse: true,
      tutorRespondedAt: true,
    },
  });

  return NextResponse.json({ ok: true, review: updated });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const review = await loadReviewWithOwnership(id);
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!isOwnerOrTutor(review, session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.review.update({
    where: { id },
    data: { tutorResponse: null, tutorRespondedAt: null },
  });

  return NextResponse.json({ ok: true });
}
