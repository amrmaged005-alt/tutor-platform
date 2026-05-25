import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMobileUser, classSelect, serializeClass } from "../_utils";

export async function GET(req: NextRequest) {
  const user = await requireMobileUser(req);
  if (user instanceof NextResponse) return user;

  const where = user.role === "STUDENT"
    ? { studentId: user.id }
    : user.role === "ADMIN"
      ? {}
      : {
          class: {
            OR: [
              { ownerId: user.id },
              { tutors: { some: { tutorId: user.id } } },
              { center: { tutors: { some: { id: user.id } } } },
            ],
          },
        };

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      student: {
        select: {
          id: true,
          fullName: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      class: {
        select: classSelect(),
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    bookings: bookings.map((booking) => ({
      id: booking.id,
      createdAt: booking.createdAt,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      amountEgp: booking.amountEgp,
      notes: booking.notes,
      student: booking.student,
      class: serializeClass(booking.class),
    })),
  });
}
