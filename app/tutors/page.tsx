// app/tutors/page.tsx
// SERVER COMPONENT — no "use client" here
// Fetches tutors with real stats (class count, student count, avg rating)
// then passes serialized data to TutorsClient

import { prisma } from "../../lib/prisma";
import TutorsClient from "./TutorsClient";

export const metadata = { title: "Tutors | Coursaty" };
export const revalidate = 60; // refresh data every 60 seconds

export default async function TutorsPage() {
  // Fetch all tutors + CENTER_ADMINs with everything we need for cards
  const tutors = await prisma.user.findMany({
    where: { role: { in: ["TUTOR", "CENTER_ADMIN"] } },
    select: {
      id: true,
      fullName: true,
      name: true,
      bio: true,
      subjects: true,
      photoUrl: true,
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

  // Flatten into TutorCardData shape — compute stats here on the server
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
    };
  });

  return <TutorsClient tutors={tutorCards} />;
}