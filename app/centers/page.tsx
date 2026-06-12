// app/centers/page.tsx
// SERVER COMPONENT — fetches all centers with stats (signed-in users only)

import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import { auth } from "../../lib/auth";
import CentersClient from "./CentersClient";

// Listing is gated to signed-in users, so keep it out of search indexes.
export const metadata = {
  title: "Learning Centers | Coursaty",
  robots: { index: false, follow: false },
};
export const revalidate = 60;

const ALLOWED_ROLES = ["STUDENT", "TUTOR", "CENTER_ADMIN", "ADMIN"];

export default async function CentersPage() {
  const session = await auth();
  if (!session?.user || !ALLOWED_ROLES.includes((session.user as { role?: string }).role ?? "")) {
    redirect("/login?callbackUrl=/centers");
  }

  let centers: Awaited<ReturnType<typeof fetchCenters>> = [];
  try {
    centers = await fetchCenters();
  } catch (err) {
    console.error("[CentersPage] fetch failed:", err);
  }

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

function fetchCenters() {
  return prisma.learningCenter.findMany({
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
    take: 12,
  });
}
