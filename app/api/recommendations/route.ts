import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (session?.user?.id) {
    const confirmedBookings = await prisma.booking.findMany({
      where:  { studentId: session.user.id, status: "CONFIRMED" },
      select: { class: { select: { subject: true } } },
    });

    const subjects = [...new Set(confirmedBookings.map((b) => b.class.subject))];
    const bookedClassIds = await prisma.booking.findMany({
      where:  { studentId: session.user.id },
      select: { classId: true },
    }).then((bkgs) => bkgs.map((b) => b.classId));

    if (subjects.length > 0) {
      const recs = await prisma.class.findMany({
        where: {
          subject:  { in: subjects },
          isActive: true,
          id:       { notIn: bookedClassIds },
        },
        take:     8,
        orderBy:  { reviews: { _count: "desc" } },
        include: {
          tutors: { include: { tutor: { select: { id: true, fullName: true, name: true, photoUrl: true } } } },
          center: { select: { id: true, name: true, logoUrl: true } },
          owner:  { select: { id: true, fullName: true, name: true, photoUrl: true } },
          _count: { select: { bookings: true, reviews: true } },
        },
      });
      return NextResponse.json(recs, {
        headers: { "Cache-Control": "private, s-maxage=60, stale-while-revalidate=300" },
      });
    }
  }

  // No booking history or not signed in — top 8 by review count
  const top = await prisma.class.findMany({
    where:    { isActive: true },
    take:     8,
    orderBy:  { reviews: { _count: "desc" } },
    include: {
      tutors: { include: { tutor: { select: { id: true, fullName: true, name: true, photoUrl: true } } } },
      center: { select: { id: true, name: true, logoUrl: true } },
      owner:  { select: { id: true, fullName: true, name: true, photoUrl: true } },
      _count: { select: { bookings: true, reviews: true } },
    },
  });

  return NextResponse.json(top, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
