import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
import { cancelBooking, deleteClass } from "./dashboard-actions";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      bookings: {
        where: { status: { not: "CANCELLED" } },
        include: { class: true },
        orderBy: { createdAt: "desc" },
      },
      ownedClasses: {
        include: {
          _count: {
            select: { bookings: { where: { status: { not: "CANCELLED" } } } },
          },
          bookings: {
            include: { student: true },
            orderBy: { createdAt: "desc" },
          },
          reviews: {
            where: { isApproved: true },
            include: { student: { select: { fullName: true, name: true, email: true } } },
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      classTutors: {
        include: {
          class: {
            include: { _count: { select: { bookings: true } } },
          },
        },
      },
      center: true,
    },
  });

  if (!user) redirect("/login");

  const role = user.role;

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
    ownedClasses: user.ownedClasses.map((cls) => ({
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
      bookingsCount: cls._count.bookings,
      bookings: cls.bookings.map((bk) => ({
        id: bk.id,
        status: bk.status,
        paymentStatus: bk.paymentStatus,
        amountEgp: bk.amountEgp,
        paidAt: bk.paidAt?.toISOString() ?? null,
        notes: bk.notes,
        studentName:
          (bk.student as any).fullName ?? bk.student.email ?? "Student",
        studentEmail: bk.student.email ?? null,
        studentPhone: (bk.student as any).phone ?? null,
      })),
    })),
    tutorReviews: user.ownedClasses.flatMap((cls) => (cls as any).reviews.map((review: any) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment ?? null,
      createdAt: review.createdAt.toISOString(),
      tutorResponse: review.tutorResponse ?? null,
      classTitle: cls.title,
      studentName: review.student?.fullName ?? review.student?.name ?? review.student?.email ?? "Student",
    }))),
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
