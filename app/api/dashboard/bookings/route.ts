import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const role = (session.user as any).role as string;

  // Platform admin sees all bookings
  // Tutors and center admins see only bookings for their classes
  const bookings = await prisma.booking.findMany({
    where:
      role === "ADMIN"
        ? {}
        : {
            class: {
              OR: [
                { ownerId: userId },
                { tutors: { some: { tutorId: userId } } },
                { center: { tutors: { some: { id: userId } } } },
              ],
            },
          },
    include: {
      student: {
        select: {
          fullName: true,
          email: true,
          phone: true,
        },
      },
      class: {
        select: {
          id: true,
          title: true,
          subject: true,
          paymentType: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bookings);
}