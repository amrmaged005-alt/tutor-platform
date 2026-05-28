import { prisma } from "../lib/prisma";
import Landing from "./Landing";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Coursaty — Find Verified Tutors in Egypt",
  description:
    "Browse verified tutors and learning centers across Cairo. Book classes for Math, Physics, Chemistry, IGCSE, Thanaweya Amma, and more. Instant booking, transparent pricing.",
  openGraph: {
    title: "Coursaty — Find Verified Tutors in Egypt",
    description:
      "Egypt's tutoring marketplace — verified tutors, all curricula, instant booking.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Coursaty — Find Verified Tutors in Egypt",
    description:
      "Egypt's tutoring marketplace — verified tutors, all curricula, instant booking.",
  },
};

export default async function HomePage() {
  let tutorCount = 0;
  let classCount = 0;
  let bookingCount = 0;
  let rawTutors: Awaited<ReturnType<typeof fetchTutors>> = [];
  let rawClasses: Awaited<ReturnType<typeof fetchClasses>> = [];

  try {
    [tutorCount, classCount, bookingCount, rawTutors, rawClasses] =
      await Promise.all([
        prisma.user.count({ where: { role: { in: ["TUTOR", "CENTER_ADMIN"] } } }),
        prisma.class.count(),
        prisma.booking.count({ where: { status: "CONFIRMED" } }),
        fetchTutors(),
        fetchClasses(),
      ]);
  } catch (err) {
    console.error("[HomePage] data fetch failed:", err);
  }

  const featuredTutors = rawTutors.map((t) => {
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

  const featuredClasses = rawClasses.map((c) => {
    const avgRating =
      c.reviews.length > 0
        ? c.reviews.reduce((s, r) => s + r.rating, 0) / c.reviews.length
        : null;
    return {
      id: c.id,
      title: c.title,
      subject: c.subject,
      description: c.description,
      city: c.city,
      location: c.location,
      priceEgp: c.priceEgp,
      capacity: c.capacity,
      schedule: c.schedule,
      format: c.format,
      curriculum: c.curriculum,
      gradeLevel: c.gradeLevel,
      language: c.language,
      bookingsCount: c._count.bookings,
      spotsLeft: c.capacity ? c.capacity - c._count.bookings : null,
      avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
      reviewCount: c.reviews.length,
      center: c.center
        ? { id: c.center.id, name: c.center.name, city: c.center.city }
        : null,
      owner: c.owner
        ? {
            id: c.owner.id,
            fullName: c.owner.fullName,
            name: c.owner.name,
            photoUrl: c.owner.photoUrl,
            isVerified: c.owner.isVerified,
          }
        : null,
    };
  });

  return (
    <Landing
      stats={{ tutors: tutorCount, classes: classCount, bookings: bookingCount }}
      featuredTutors={featuredTutors}
      featuredClasses={featuredClasses}
    />
  );
}

function fetchTutors() {
  return prisma.user.findMany({
    where: { role: { in: ["TUTOR", "CENTER_ADMIN"] } },
    select: {
      id: true,
      fullName: true,
      name: true,
      bio: true,
      subjects: true,
      photoUrl: true,
      isVerified: true,
      center: { select: { id: true, name: true, city: true } },
      ownedClasses: {
        select: {
          id: true,
          bookings: { select: { id: true } },
          reviews: { select: { rating: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
}

function fetchClasses() {
  return prisma.class.findMany({
    include: {
      center: { select: { id: true, name: true, city: true } },
      owner: {
        select: {
          id: true,
          fullName: true,
          name: true,
          photoUrl: true,
          isVerified: true,
        },
      },
      _count: {
        select: { bookings: { where: { status: { not: "CANCELLED" } } } },
      },
      reviews: { select: { rating: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
}
