// app/tutors/[id]/page.tsx
// SERVER COMPONENT — fetches full tutor data including reviews + stats

import { prisma } from "../../../lib/prisma";
import { auth } from "../../../lib/auth";
import { notFound } from "next/navigation";
import TutorProfileClient from "./TutorProfileClient";

export default async function TutorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const tutor = await prisma.user.findUnique({
    where: { id },
    include: {
      center: { select: { id: true, name: true, city: true } },
      ownedClasses: {
        include: {
          _count: { select: { bookings: { where: { status: { not: "CANCELLED" } } } } },
          reviews: { select: { rating: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!tutor || (tutor.role !== "TUTOR" && tutor.role !== "CENTER_ADMIN")) {
    notFound();
  }

  // Fetch all reviews for this tutor's classes with student info
  const rawReviews = await prisma.review.findMany({
    where: { class: { ownerId: id } },
    include: { student: { select: { fullName: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  // Compute aggregate rating
  const allRatings = rawReviews.map(r => r.rating);
  const avgRating = allRatings.length > 0
    ? Math.round((allRatings.reduce((a, b) => a + b, 0) / allRatings.length) * 10) / 10
    : null;

  const isOwner = session?.user?.email === tutor.email;

  // Serialize for client
  const tutorData = {
    id: tutor.id,
    fullName: tutor.fullName,
    name: tutor.name,
    email: tutor.email,
    role: tutor.role,
    bio: tutor.bio,
    phone: tutor.phone,
    photoUrl: tutor.photoUrl,
    subjects: tutor.subjects,
    center: tutor.center,
    avgRating,
    totalStudents: tutor.ownedClasses.reduce((s, c) => s + c._count.bookings, 0),
    classes: tutor.ownedClasses.map(c => {
      const classRatings = c.reviews.map(r => r.rating);
      return {
        id: c.id,
        title: c.title,
        subject: c.subject,
        description: c.description,
        priceEgp: c.priceEgp,
        capacity: c.capacity,
        format: c.format,
        gradeLevel: c.gradeLevel,
        curriculum: c.curriculum,
        bookingsCount: c._count.bookings,
        avgRating: classRatings.length > 0
          ? Math.round((classRatings.reduce((a, b) => a + b, 0) / classRatings.length) * 10) / 10
          : null,
      };
    }),
    reviews: rawReviews.map(r => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
      studentName: r.student.fullName ?? r.student.name ?? "Student",
    })),
  };

  return <TutorProfileClient tutor={tutorData} isOwner={isOwner} />;
}