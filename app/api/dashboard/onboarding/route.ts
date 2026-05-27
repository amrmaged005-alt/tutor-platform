import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface OnboardingStep {
  id: string;
  label: string;
  complete: boolean;
  points: number;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true,
      photoUrl: true,
      bio: true,
      phone: true,
      subjects: true,
      _count: { select: { ownedClasses: true } },
    },
  });
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (me.role !== "TUTOR" && me.role !== "CENTER_ADMIN") {
    return NextResponse.json({ error: "Onboarding is only for tutors" }, { status: 403 });
  }

  // Check if tutor has at least one booking across their owned classes
  const firstBookingCount = await prisma.booking.count({
    where: { class: { OR: [{ ownerId: me.id }, { tutors: { some: { tutorId: me.id } } }] } },
  });

  const steps: OnboardingStep[] = [
    { id: "photo", label: "Add a profile photo", complete: !!me.photoUrl, points: 20 },
    { id: "bio", label: "Write your bio (100+ characters)", complete: !!me.bio && me.bio.length >= 100, points: 20 },
    { id: "subjects", label: "Add your subjects", complete: me.subjects.length > 0, points: 15 },
    { id: "first_class", label: "Create your first class", complete: me._count.ownedClasses > 0, points: 25 },
    { id: "phone", label: "Add a phone number", complete: !!me.phone, points: 10 },
    { id: "first_booking", label: "Get your first booking", complete: firstBookingCount > 0, points: 10 },
  ];

  const totalPoints = steps.reduce((sum, s) => sum + s.points, 0);
  const earnedPoints = steps.filter((s) => s.complete).reduce((sum, s) => sum + s.points, 0);
  const percentComplete = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const isComplete = steps.every((s) => s.complete);

  return NextResponse.json({ percentComplete, steps, isComplete });
}
