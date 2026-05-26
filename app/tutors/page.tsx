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
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

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
          bookings: { select: { id: true, createdAt: true, studentId: true } },
          reviews: { select: { rating: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const tutorCards = tutors.map((t) => {
    const allReviews = t.ownedClasses.flatMap((c) => c.reviews);
    const allBookings = t.ownedClasses.flatMap((c) => c.bookings);
    const bookingsByStudent = allBookings.reduce<Record<string, number>>((acc, booking) => {
      acc[booking.studentId] = (acc[booking.studentId] ?? 0) + 1;
      return acc;
    }, {});
    const lastBookedAt = allBookings.reduce<Date | null>((latest, booking) => {
      if (!latest || booking.createdAt > latest) return booking.createdAt;
      return latest;
    }, null);
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
      studentCount: allBookings.length,
      avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
      reviewCount: allReviews.length,
      isVerified: t.isVerified,
      studentsThisWeek: allBookings.filter((booking) => booking.createdAt >= weekAgo).length,
      repeatStudentCount: Object.values(bookingsByStudent).filter((count) => count > 1).length,
      lastBookedAt: lastBookedAt?.toISOString() ?? null,
    };
  });

  return <TutorsClient tutors={tutorCards} />;
}
