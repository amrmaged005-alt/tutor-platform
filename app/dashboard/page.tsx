import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
import { cancelBooking, deleteClass } from "./dashboard-actions";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      bookings: {
        where: { status: { not: "CANCELLED" } },
        include: { class: true },
        orderBy: { createdAt: "desc" },
      },
      ownedClasses: {
        orderBy: { createdAt: "desc" },
      },
      center: true,
    },
  });

  if (!user) redirect("/login");

  const role = user.role;
  const isRestrictedCenterTutor =
    role === "TUTOR" &&
    Boolean(user.centerId) &&
    user.centerAccessLevel !== "FULL";

  // Revenue and student PII are fetched only for tutors with full access.
  // Restricted center tutors must not receive these fields in the RSC payload.
  const [managedBookings, approvedReviews] = isRestrictedCenterTutor
    ? [[], []]
    : await Promise.all([
        prisma.booking.findMany({
          where: { class: { ownerId: user.id } },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            classId: true,
            status: true,
            paymentStatus: true,
            amountEgp: true,
            paidAt: true,
            notes: true,
            student: {
              select: {
                fullName: true,
                email: true,
                phone: true,
              },
            },
          },
        }),
        prisma.review.findMany({
          where: {
            isApproved: true,
            class: { ownerId: user.id },
          },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            tutorResponse: true,
            class: { select: { title: true } },
            student: {
              select: {
                fullName: true,
                name: true,
                email: true,
              },
            },
          },
        }),
      ]);

  const managedBookingsByClass = new Map<
    string,
    (typeof managedBookings)[number][]
  >();
  for (const booking of managedBookings) {
    const classBookings = managedBookingsByClass.get(booking.classId) ?? [];
    classBookings.push(booking);
    managedBookingsByClass.set(booking.classId, classBookings);
  }

  let centerData: any = null;
  if (role === "CENTER_ADMIN" && user.centerId) {
    centerData = await prisma.learningCenter.findUnique({
      where: { id: user.centerId },
      include: {
        classes: {
          include: {
            _count: {
              select: {
                bookings: { where: { status: { not: "CANCELLED" } } },
              },
            },
            bookings: {
              include: { student: true },
              orderBy: { createdAt: "desc" },
            },
            owner: { select: { fullName: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        tutors: {
          select: {
            id: true,
            fullName: true,
            name: true,
            email: true,
            subjects: true,
            phone: true,
            _count: { select: { ownedClasses: true } },
          },
        },
      },
    });
  }

  // Serialize everything cleanly
  const dashData = {
    user: {
      id: user.id,
      role: user.role,
      fullName: (user as any).fullName ?? null,
      name: user.name ?? null,
      email: user.email ?? null,
      bio: (user as any).bio ?? null,
      phone: (user as any).phone ?? null,
      subjects: (user as any).subjects ?? [],
      centerId: (user as any).centerId ?? null,
      centerName: (user as any).center?.name ?? null,
      // Access level only constrains a tutor who belongs to a center; standalone tutors are FULL.
      centerAccessLevel: (user as any).centerId ? ((user as any).centerAccessLevel ?? "FULL") : null,
      isVerified: (user as any).isVerified ?? false,
    },
    bookings: user.bookings.map((b) => ({
      id: b.id,
      classId: b.classId,
      status: b.status,
      paymentStatus: b.paymentStatus,
      createdAt: b.createdAt.toISOString(),
      class: {
        title: b.class.title,
        subject: b.class.subject,
        priceEgp: b.class.priceEgp,
        schedule: (b.class as any).schedule ?? null,
        location: (b.class as any).location ?? null,
      },
    })),
    ownedClasses: user.ownedClasses.map((cls) => {
      const classBookings = managedBookingsByClass.get(cls.id) ?? [];
      return {
        id: cls.id,
        title: cls.title,
        subject: cls.subject,
        format: cls.format,
        paymentType: cls.paymentType,
        priceEgp: cls.priceEgp,
        capacity: cls.capacity,
        gradeLevel: cls.gradeLevel,
        schedule: (cls as any).schedule ?? null,
        imageUrl: (cls as any).imageUrl ?? null,
        bookingsCount: classBookings.filter((bk) => bk.status !== "CANCELLED").length,
        bookings: classBookings.map((bk) => ({
          id: bk.id,
          status: bk.status,
          paymentStatus: bk.paymentStatus,
          amountEgp: bk.amountEgp,
          paidAt: bk.paidAt?.toISOString() ?? null,
          notes: bk.notes,
          studentName:
            bk.student.fullName ?? bk.student.email ?? "Student",
          studentEmail: bk.student.email ?? null,
          studentPhone: bk.student.phone ?? null,
        })),
      };
    }),
    tutorReviews: approvedReviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment ?? null,
      createdAt: review.createdAt.toISOString(),
      tutorResponse: review.tutorResponse ?? null,
      classTitle: review.class.title,
      studentName: review.student?.fullName ?? review.student?.name ?? review.student?.email ?? "Student",
    })),
    centerData: centerData
      ? {
        id: centerData.id,
        name: centerData.name,
        city: centerData.city ?? null,
        location: centerData.location ?? null,
        description: centerData.description ?? null,
        tutors: centerData.tutors.map((t: any) => ({
          id: t.id,
          fullName: t.fullName ?? null,
          name: t.name ?? null,
          email: t.email ?? null,
          subjects: t.subjects ?? [],
          phone: t.phone ?? null,
          classCount: t._count.ownedClasses,
        })),
        classes: centerData.classes.map((cls: any) => ({
          id: cls.id,
          title: cls.title,
          subject: cls.subject,
          format: cls.format,
          paymentType: cls.paymentType,
          priceEgp: cls.priceEgp,
          capacity: cls.capacity,
          schedule: cls.schedule ?? null,
          imageUrl: cls.imageUrl ?? null,
          gradeLevel: cls.gradeLevel ?? null,
          bookingsCount: cls._count.bookings,
          ownerName: cls.owner?.fullName ?? cls.owner?.name ?? null,
          bookings: cls.bookings.map((bk: any) => ({
            id: bk.id,
            status: bk.status,
            paymentStatus: bk.paymentStatus,
            amountEgp: bk.amountEgp,
            paidAt: bk.paidAt?.toISOString() ?? null,
            notes: bk.notes,
            studentName: bk.student?.fullName ?? bk.student?.email ?? "Student",
            studentEmail: bk.student?.email ?? null,
            studentPhone: bk.student?.phone ?? null,
          })),
        })),
      }
      : null,
  };

  return (
    <DashboardClient
      data={dashData}
      cancelBooking={cancelBooking}
      deleteClass={deleteClass}
    />
  );
}
