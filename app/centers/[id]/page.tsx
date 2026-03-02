// app/centers/[id]/page.tsx
// SERVER COMPONENT — fetches center with tutors, classes, reviews

import { prisma } from "../../../lib/prisma";
import { notFound } from "next/navigation";
import CenterProfileClient from "./CenterProfileClient";

export default async function CenterProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const center = await prisma.learningCenter.findUnique({
    where: { id },
    include: {
      tutors: {
        select: {
          id: true, fullName: true, name: true,
          bio: true, subjects: true, photoUrl: true, phone: true,
          ownedClasses: {
            select: {
              id: true,
              _count: { select: { bookings: { where: { status: { not: "CANCELLED" } } } } },
              reviews: { select: { rating: true } },
            },
          },
        },
      },
      classes: {
        include: {
          _count: { select: { bookings: { where: { status: { not: "CANCELLED" } } } } },
          reviews: { select: { rating: true } },
          owner: { select: { id: true, fullName: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!center) notFound();

  // Compute center-wide stats
  const allReviews = center.classes.flatMap(c => c.reviews);
  const avgRating = allReviews.length > 0
    ? Math.round((allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length) * 10) / 10
    : null;
  const totalStudents = center.classes.reduce((s, c) => s + c._count.bookings, 0);

  // Serialize
  const centerData = {
    id: center.id,
    name: center.name,
    description: center.description,
    logoUrl: center.logoUrl,
    city: center.city,
    location: center.location,
    phone: center.phone,
    email: center.email,
    avgRating,
    totalStudents,
    reviewCount: allReviews.length,
    tutors: center.tutors.map(t => {
      const tutorReviews = t.ownedClasses.flatMap(c => c.reviews);
      const tutorRating = tutorReviews.length > 0
        ? Math.round((tutorReviews.reduce((s, r) => s + r.rating, 0) / tutorReviews.length) * 10) / 10
        : null;
      return {
        id: t.id,
        fullName: t.fullName,
        name: t.name,
        bio: t.bio,
        subjects: t.subjects,
        photoUrl: t.photoUrl,
        phone: t.phone,
        classCount: t.ownedClasses.length,
        studentCount: t.ownedClasses.reduce((s, c) => s + c._count.bookings, 0),
        avgRating: tutorRating,
      };
    }),
    classes: center.classes.map(c => {
      const cRatings = c.reviews.map(r => r.rating);
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
        spotsLeft: c.capacity ? c.capacity - c._count.bookings : null,
        avgRating: cRatings.length > 0
          ? Math.round((cRatings.reduce((a, b) => a + b, 0) / cRatings.length) * 10) / 10
          : null,
        ownerName: c.owner?.fullName ?? c.owner?.name ?? null,
      };
    }),
  };

  return <CenterProfileClient center={centerData} />;
}