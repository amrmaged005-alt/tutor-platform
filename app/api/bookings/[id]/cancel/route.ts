import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWaitlistNotification } from "@/lib/email";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const booking = await prisma.booking.findUnique({
    where:  { id },
    select: {
      id: true, status: true, studentId: true, classId: true,
      class: { select: { id: true, title: true, priceEgp: true, owner: { select: { fullName: true, name: true } } } },
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found", code: "NOT_FOUND" }, { status: 404 });
  }

  // Only the student or admin may cancel
  const actor = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { id: true, role: true },
  });
  const isStudent = booking.studentId === session.user.id;
  const isAdmin   = actor?.role === "ADMIN";

  if (!isStudent && !isAdmin) {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
  }

  if (booking.status === "CANCELLED") {
    return NextResponse.json({ error: "Already cancelled", code: "ALREADY_CANCELLED" }, { status: 409 });
  }

  await prisma.booking.update({
    where: { id },
    data:  { status: "CANCELLED" },
  });

  // Notify first person on the waitlist that a spot opened
  const firstWaiting = await prisma.waitlist.findFirst({
    where:   { classId: booking.classId, notifiedAt: null },
    orderBy: { position: "asc" },
    select:  {
      id: true,
      user: { select: { email: true, fullName: true, name: true } },
    },
  });

  if (firstWaiting?.user?.email) {
    const tutorName =
      booking.class.owner?.fullName ?? booking.class.owner?.name ?? "your tutor";
    const baseUrl = process.env.NEXTAUTH_URL ?? "";

    await Promise.all([
      sendWaitlistNotification({
        to:        firstWaiting.user.email,
        firstName: firstWaiting.user.fullName ?? firstWaiting.user.name ?? "Student",
        classTitle: booking.class.title,
        tutorName,
        priceEgp:  booking.class.priceEgp,
        classUrl:  `${baseUrl}/classes/${booking.classId}`,
      }),
      prisma.waitlist.update({
        where: { id: firstWaiting.id },
        data:  { notifiedAt: new Date() },
      }),
    ]);
  }

  return NextResponse.json({ ok: true });
}
