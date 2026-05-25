import { prisma } from "../../lib/prisma";
import { auth } from "../../lib/auth";
import { redirect } from "next/navigation";
import BookingConfirmedClient from "./BookingConfirmedClient";

export default async function BookingConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const { bookingId } = await searchParams;
  if (!bookingId) redirect("/");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      class: {
        include: {
          owner: true,
          center: true,
        },
      },
    },
  });

  if (!booking || booking.studentId !== session.user.id) redirect("/");

  const cls = booking.class;
  const rawPhone = cls.owner?.phone ?? cls.center?.phone ?? "";
  const whatsappNumber = rawPhone.replace(/\D/g, "");
  const contactName = cls.center?.name ?? cls.owner?.fullName ?? "the tutor";

  return (
    <BookingConfirmedClient
      data={{
        bookingId: booking.id,
        amountEgp: booking.amountEgp ?? 0,
        platformFeeEgp: booking.platformFeeEgp ?? null,
        paymentStatus: booking.paymentStatus,
        classId: cls.id,
        classTitle: cls.title,
        classSubject: cls.subject,
        classSchedule: cls.schedule ?? null,
        classLocation: cls.location ?? null,
        paymentType: cls.paymentType,
        whatsappNumber,
        contactName,
      }}
    />
  );
}
