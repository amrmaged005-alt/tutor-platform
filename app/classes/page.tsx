import { prisma } from "../../lib/prisma";
import ClassesClient from "./ClassesClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Classes",
  description: "Find the best tutoring classes in Cairo. Filter by subject, curriculum, grade level, and price. Physics, Math, Chemistry, IGCSE, Thanaweya Amma and more.",
  openGraph: {
    title: "Browse Classes | Coursaty",
    description: "Find the best tutoring classes in Cairo — all subjects, all curricula.",
    type: "website",
    url: "/classes",
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse Classes | Coursaty",
    description: "Find the best tutoring classes in Cairo — all subjects, all curricula.",
  },
};

export const revalidate = 30;

export default async function ClassesPage() {
  const classes = await prisma.class.findMany({
    include: {
      center: { select: { id: true, name: true, city: true } },
      owner: { select: { id: true, fullName: true, name: true, photoUrl: true, isVerified: true } },
      _count: {
        select: { bookings: { where: { status: { not: "CANCELLED" } } } },
      },
      reviews: { select: { rating: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const classCards = classes.map((c) => {
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

  return <ClassesClient classes={classCards} />;
}