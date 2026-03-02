import { prisma } from "../../lib/prisma";
import TutorsClient from "./TutorsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find a Tutor",
  description: "Browse verified tutors in Cairo. Find expert educators for Math, Physics, Chemistry, IGCSE, Thanaweya Amma, and more.",
  openGraph: {
    title: "Find a Tutor | Coursaty",
    description: "Browse verified tutors in Cairo for all subjects and curricula.",
    type: "website",
    url: "/tutors",
  },
  twitter: {
    card: "summary_large_image",
    title: "Find a Tutor | Coursaty",
    description: "Browse verified tutors in Cairo for all subjects and curricula.",
  },
};

export const revalidate = 60;

export default async function TutorsPage() {
  const tutors = await prisma.user.findMany({
    where: { role: { in: ["TUTOR", "CENTER_ADMIN"] } },
    select: {
      id: true,
      fullName: true,
      name: true,
      bio: true,
      subjects: true,
      photoUrl: true,
      isVerified: true,
      center: {
        select: { id: true, name: true, city: true },
      },
      ownedClasses: {
        select: {
          id: true,
          bookings: { select: { id: true } },
          reviews: { select: { rating: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const tutorCards = tutors.map((t) => {
    const allReviews = t.ownedClasses.flatMap((c) => c.reviews);
    const avgRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        : null;

    return {
      id: t.id,
      fullName: t.fullName,
      name: t.name,
      bio: t.bio,
      subjects: t.subjects,
      photoUrl: t.photoUrl,
      city: t.center?.city ?? "Cairo",
      center: t.center ? { id: t.center.id, name: t.center.name } : null,
      classCount: t.ownedClasses.length,
      studentCount: t.ownedClasses.reduce((s, c) => s + c.bookings.length, 0),
      avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
      reviewCount: allReviews.length,
      isVerified: t.isVerified,
    };
  });

  return <TutorsClient tutors={tutorCards} />;
}