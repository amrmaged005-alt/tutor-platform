import { prisma } from "../../../lib/prisma";
import { auth } from "../../../lib/auth";
import { notFound } from "next/navigation";
import TutorProfileClient from "./TutorProfileClient";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const tutor = await prisma.user.findUnique({
    where: { id },
    select: {
      fullName: true,
      name: true,
      bio: true,
      subjects: true,
      center: { select: { name: true, city: true } },
    },
  });

  if (!tutor) return { title: "Tutor Not Found" };

  const displayName = tutor.fullName ?? tutor.name ?? "Tutor";
  const subjects = Array.isArray(tutor.subjects) && tutor.subjects.length > 0
    ? (tutor.subjects as string[]).join(", ")
    : null;
  const city = tutor.center?.city ?? "Cairo";
  const description = tutor.bio
    ? tutor.bio.slice(0, 155)
    : `${displayName} is a verified tutor on Coursaty${subjects ? `, specializing in ${subjects}` : ""} in ${city}.`;

  return {
    title: displayName,
    description,
    openGraph: {
      title: `${displayName} | Coursaty Tutor`,
      description,
      type: "profile",
      url: `/tutors/${id}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayName} | Coursaty Tutor`,
      description,
    },
  };
}

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

  const rawReviews = await prisma.review.findMany({
    where: { class: { ownerId: id } },
    include: { student: { select: { fullName: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const allRatings = rawReviews.map(r => r.rating);
  const avgRating = allRatings.length > 0
    ? Math.round((allRatings.reduce((a, b) => a + b, 0) / allRatings.length) * 10) / 10
    : null;

  const isOwner = session?.user?.email === tutor.email;

  const tutorData = {
    id: tutor.id,
    fullName: tutor.fullName,
    name: tutor.name,
    email: tutor.email,
    role: tutor.role,
    bio: tutor.bio,
    phone: tutor.phone,
    photoUrl: tutor.photoUrl,
    isVerified: tutor.isVerified,
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
        schedule: c.schedule,
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

  return <TutorProfileClient tutor={tutorData} isOwner={isOwner} isSignedIn={!!session?.user} />;
}
