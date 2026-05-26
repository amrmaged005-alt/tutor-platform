import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWaitlistNotification } from "@/lib/email";

async function requireStudent() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { id: true, role: true, fullName: true, name: true, email: true },
  });
  return user?.role === "STUDENT" ? user : null;
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await requireStudent();
  if (!user) {
    return NextResponse.json({ error: "Student account required", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const cls = await prisma.class.findUnique({
    where:  { id },
    select: {
      id: true, title: true, isActive: true, capacity: true,
      _count: { select: { bookings: { where: { status: { not: "CANCELLED" } } } } },
    },
  });

  if (!cls || !cls.isActive) {
    return NextResponse.json({ error: "Class not found", code: "NOT_FOUND" }, { status: 404 });
  }

  if (cls._count.bookings < cls.capacity) {
    return NextResponse.json(
      { error: "Class still has spots available — book directly", code: "CLASS_NOT_FULL" },
      { status: 400 }
    );
  }

  const alreadyEnrolled = await prisma.booking.findUnique({
    where:  { classId_studentId: { classId: id, studentId: user.id } },
    select: { id: true, status: true },
  });
  if (alreadyEnrolled && alreadyEnrolled.status !== "CANCELLED") {
    return NextResponse.json({ error: "You are already enrolled", code: "ALREADY_ENROLLED" }, { status: 409 });
  }

  const existing = await prisma.waitlist.findUnique({
    where: { userId_classId: { userId: user.id, classId: id } },
  });
  if (existing) {
    return NextResponse.json(
      { position: existing.position, message: `You are already #${existing.position} on the waitlist` }
    );
  }

  const count = await prisma.waitlist.count({ where: { classId: id } });
  const position = count + 1;

  await prisma.waitlist.create({
    data: { userId: user.id, classId: id, position },
  });

  return NextResponse.json(
    { position, message: `You are #${position} on the waitlist` },
    { status: 201 }
  );
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const entry = await prisma.waitlist.findUnique({
    where: { userId_classId: { userId: session.user.id, classId: id } },
  });
  if (!entry) {
    return NextResponse.json({ error: "Not on waitlist", code: "NOT_FOUND" }, { status: 404 });
  }

  // Delete entry and shift positions of later entries down
  await prisma.$transaction([
    prisma.waitlist.delete({
      where: { userId_classId: { userId: session.user.id, classId: id } },
    }),
    // Decrement position for everyone who joined after this entry
    prisma.waitlist.updateMany({
      where: { classId: id, position: { gt: entry.position } },
      data:  { position: { decrement: 1 } },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
