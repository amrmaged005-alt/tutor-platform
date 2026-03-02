// ─────────────────────────────────────────────────────────────────────────────
// NOTE: This file splits into two parts:
//   1. The async Server Component wrapper (default export) — handles data fetching
//   2. The Client Component <ClassDetailClient /> — handles animations & UI
// Paste both into: app/classes/[id]/page.tsx
// ─────────────────────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════════════════
// SERVER COMPONENT (top of file — no "use client" directive here)
// ═══════════════════════════════════════════════════════════════════════════

import { prisma } from "../../../lib/prisma";
import { auth } from "../../../lib/auth";
import { redirect } from "next/navigation";
import ClassDetailClient from "./ClassDetailClient";

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  const cls = await prisma.class.findUnique({
    where: { id },
    include: {
      tutors: { include: { tutor: true } },
      center: true,
      owner: true,
      materials: true,
      _count: {
        select: { bookings: { where: { status: { not: "CANCELLED" } } } },
      },
    },
  });

  if (!cls)
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0f172a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#f1f5f9",
          fontSize: 20,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Class not found.
      </div>
    );

  const spotsLeft = cls.capacity ? cls.capacity - cls._count.bookings : null;

  const relatedClasses = await prisma.class.findMany({
    where: { subject: cls.subject, id: { not: cls.id } },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  let alreadyBooked = false;
  let currentUserRole = "";
  let isEligibleToReview = false;
  let existingUserReview: { rating: number; comment: string | null } | null =
    null;

  if (session?.user?.email) {
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (currentUser) {
      currentUserRole = currentUser.role;

      const existing = await prisma.booking.findFirst({
        where: {
          classId: cls.id,
          studentId: currentUser.id,
          status: { not: "CANCELLED" },
        },
      });
      alreadyBooked = !!existing;

      const confirmedBooking = await prisma.booking.findFirst({
        where: {
          classId: cls.id,
          studentId: currentUser.id,
          status: "CONFIRMED",
        },
      });
      isEligibleToReview = !!confirmedBooking;

      if (isEligibleToReview) {
        existingUserReview = await prisma.review.findUnique({
          where: {
            classId_studentId: { classId: cls.id, studentId: currentUser.id },
          },
          select: { rating: true, comment: true },
        });
      }
    }
  }

  async function bookClass() {
    "use server";
    const session = await auth();
    if (!session?.user?.email) redirect("/login");

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!currentUser) redirect("/login");

    const existingCancelled = await prisma.booking.findFirst({
      where: {
        classId: cls!.id,
        studentId: currentUser.id,
        status: "CANCELLED",
      },
    });

    if (existingCancelled) {
      await prisma.booking.update({
        where: { id: existingCancelled.id },
        data: { status: "PENDING", paymentStatus: "UNPAID" },
      });
    } else {
      await prisma.booking.create({
        data: {
          classId: cls!.id,
          studentId: currentUser.id,
          status: "PENDING",
          paymentStatus: "UNPAID",
        },
      });
    }

    redirect("/booking-confirmed?classId=" + cls!.id);
  }

  // Serialize only what the client needs
  const classData = {
    id: cls.id,
    title: cls.title,
    subject: cls.subject,
    description: cls.description,
    curriculum: cls.curriculum,
    format: cls.format,
    gradeLevel: cls.gradeLevel,
    language: cls.language,
    priceEgp: cls.priceEgp,
    schedule: cls.schedule,
    capacity: cls.capacity,
    location: (cls as any).location ?? null,
    city: (cls as any).city ?? null,
    isOnline: (cls as any).isOnline ?? false,
    bookingsCount: cls._count.bookings,
    spotsLeft,
    materials: cls.materials.map((m) => ({
      id: m.id,
      title: m.title,
      isLocked: (m as any).isLocked ?? false,
      fileUrl: (m as any).fileUrl ?? null,
    })),
    owner: cls.owner
      ? {
          id: cls.owner.id,
          fullName: (cls.owner as any).fullName ?? null,
          name: cls.owner.name ?? null,
          bio: (cls.owner as any).bio ?? null,
          subjects: (cls.owner as any).subjects ?? [],
          phone: cls.owner.phone ?? null,
        }
      : null,
    center: cls.center
      ? {
          id: cls.center.id,
          name: cls.center.name,
          city: (cls.center as any).city ?? null,
          location: (cls.center as any).location ?? null,
          description: (cls.center as any).description ?? null,
          phone: (cls.center as any).phone ?? null,
        }
      : null,
    relatedClasses: relatedClasses.map((r) => ({
      id: r.id,
      title: r.title,
      subject: r.subject,
      description: r.description,
      priceEgp: r.priceEgp,
    })),
  };

  return (
    <ClassDetailClient
      classData={classData}
      session={session}
      alreadyBooked={alreadyBooked}
      currentUserRole={currentUserRole}
      isEligibleToReview={isEligibleToReview}
      existingUserReview={existingUserReview}
      bookClass={bookClass}
      classId={id}
    />
  );
}