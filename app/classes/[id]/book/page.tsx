import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import BookingCheckout from "./BookingCheckout";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const cls = await prisma.class.findUnique({
    where: { id },
    select: { title: true, subject: true },
  });
  if (!cls) return { title: "Booking | Coursaty" };
  return { title: `Book ${cls.title} | Coursaty` };
}

export default async function ClassBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    const { id } = await params;
    redirect(`/login?next=/classes/${id}/book`);
  }

  const { id } = await params;
  const now = new Date();

  const [cls, user] = await Promise.all([
    prisma.class.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        subject: true,
        priceEgp: true,
        format: true,
        paymentType: true,
        city: true,
        schedule: true,
        capacity: true,
        isActive: true,
        owner: { select: { id: true, fullName: true, name: true } },
        center: { select: { name: true } },
        _count: {
          select: {
            bookings: {
              where: {
                OR: [
                  { status: "CONFIRMED" },
                  { status: "PENDING", lockedUntil: { gt: now } },
                ],
              },
            },
          },
        },
      },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    }),
  ]);

  if (!cls || !cls.isActive) {
    redirect("/classes");
  }

  if (user?.role !== "STUDENT") {
    redirect(`/classes/${id}`);
  }

  const existingBooking = await prisma.booking.findFirst({
    where: {
      classId: id,
      studentId: session.user.id,
      OR: [
        { status: "CONFIRMED" },
        { status: "PENDING", lockedUntil: { gt: now } },
      ],
    },
  });

  if (existingBooking) {
    redirect(`/classes/${id}?alreadyBooked=1`);
  }

  const spotsLeft = cls.capacity ? cls.capacity - cls._count.bookings : null;

  if (spotsLeft !== null && spotsLeft <= 0) {
    redirect(`/classes/${id}?full=1`);
  }

  const tutorName =
    cls.owner?.fullName ?? cls.owner?.name ?? cls.center?.name ?? "Tutor";

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--surface-booking)",
      }}
    >
      <BookingCheckout
        cls={{
          id: cls.id,
          title: cls.title,
          subject: cls.subject,
          priceEgp: cls.priceEgp,
          format: cls.format,
          paymentType: cls.paymentType,
          city: cls.city,
          schedule: cls.schedule,
          spotsLeft,
          tutorId: cls.owner?.id ?? null,
          tutorName,
        }}
      />
    </main>
  );
}
