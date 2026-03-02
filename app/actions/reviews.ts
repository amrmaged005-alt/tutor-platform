"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isRateLimited, reviewLimiter } from "@/lib/ratelimit";
import { log } from "@/lib/audit";

export async function submitReview(
  classId: string,
  rating: number,
  comment?: string
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "You must be logged in to leave a review." };
  }

  const studentId = session.user.id;

  const limited = await isRateLimited(reviewLimiter, studentId);
  if (limited) {
    return {
      success: false,
      error: "Too many review submissions. Please wait before trying again.",
    };
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { success: false, error: "Rating must be a whole number between 1 and 5." };
  }

  if (comment && comment.trim().length > 1000) {
    return { success: false, error: "Review comment must be under 1000 characters." };
  }

  const cls = await prisma.class.findUnique({
    where: { id: classId },
    select: { id: true, isActive: true },
  });

  if (!cls) {
    return { success: false, error: "Class not found." };
  }

  const confirmedBooking = await prisma.booking.findFirst({
    where: {
      classId,
      studentId,
      status: "CONFIRMED",
    },
  });

  if (!confirmedBooking) {
    return {
      success: false,
      error: "You can only review a class after your booking is confirmed.",
    };
  }

  const existingReview = await prisma.review.findUnique({
    where: { classId_studentId: { classId, studentId } },
  });

  if (existingReview) {
    return { success: false, error: "You have already reviewed this class." };
  }

  try {
    const review = await prisma.review.create({
      data: {
        classId,
        studentId,
        rating,
        comment: comment?.trim() ?? null,
      },
    });

    await log({
      action: "review.created",
      actorId: studentId,
      targetType: "Review",
      targetId: review.id,
      metadata: { classId, rating, comment },
    });

    return { success: true };
  } catch (error) {
    console.error("submitReview error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

// ─── Edit an existing review ──────────────────────────────────────────────────

export async function editReview(
  reviewId: string,
  rating: number,
  comment?: string
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "You must be logged in." };
  }

  const studentId = session.user.id;

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { success: false, error: "Rating must be a whole number between 1 and 5." };
  }

  if (comment && comment.trim().length > 1000) {
    return { success: false, error: "Review comment must be under 1000 characters." };
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { studentId: true },
  });

  if (!review) {
    return { success: false, error: "Review not found." };
  }

  if (review.studentId !== studentId) {
    return { success: false, error: "You can only edit your own reviews." };
  }

  try {
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating,
        comment: comment?.trim() ?? null,
      },
    });

    await log({
      action: "review.edited",
      actorId: studentId,
      targetType: "Review",
      targetId: reviewId,
      metadata: { rating, comment },
    });

    return { success: true };
  } catch (error) {
    console.error("editReview error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

// ─── Delete a review ──────────────────────────────────────────────────────────

export async function deleteReview(
  reviewId: string
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "You must be logged in." };
  }

  const studentId = session.user.id;
  const role = (session.user as any).role as string;

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { studentId: true },
  });

  if (!review) {
    return { success: false, error: "Review not found." };
  }

  const isAdmin = role === "ADMIN";
  const isOwner = review.studentId === studentId;

  if (!isAdmin && !isOwner) {
    return { success: false, error: "You can only delete your own reviews." };
  }

  try {
    await prisma.review.delete({ where: { id: reviewId } });

    await log({
      action: "review.deleted",
      actorId: studentId,
      actorRole: role,
      targetType: "Review",
      targetId: reviewId,
    });

    return { success: true };
  } catch (error) {
    console.error("deleteReview error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}