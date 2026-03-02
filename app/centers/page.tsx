// app/centers/page.tsx
// SERVER COMPONENT — fetches all centers with stats

import { prisma } from "../../lib/prisma";
import CentersClient from "./CentersClient";

export const metadata = { title: "Learning Centers | Coursaty" };
export const revalidate = 60;

export default async function CentersPage() {
  const centers = await prisma.learningCenter.findMany({
    include: {
      tutors: { select: { id: true } },
      classes: {
        include: {
          _count: { select: { bookings: { where: { status: { not: "CANCELLED" } } } } },
          reviews: { select: { rating: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const centerCards = centers.map((c) => {
    const allReviews = c.classes.flatMap((cls) => cls.reviews);
    const avgRating =
      allReviews.length > 0
        ? Math.round((allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length) * 10) / 10
        : null;
    const totalStudents = c.classes.reduce((s, cls) => s + cls._count.bookings, 0);
    const subjects = Array.from(new Set(c.classes.map((cls) => cls.subject)));

    return {
      id: c.id,
      name: c.name,
      description: c.description,
      logoUrl: c.logoUrl,
      city: c.city,
      location: c.location,
      phone: c.phone,
      email: c.email,
      tutorCount: c.tutors.length,
      classCount: c.classes.length,
      totalStudents,
      avgRating,
      reviewCount: allReviews.length,
      subjects,
    };
  });

  return <CentersClient centers={centerCards} />;
}