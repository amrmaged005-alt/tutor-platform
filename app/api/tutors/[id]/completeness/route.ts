import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  // Only the tutor themselves or an admin may access this
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const actor = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { id: true, role: true },
  });

  const isSelf  = actor?.id === id;
  const isAdmin = actor?.role === "ADMIN";

  if (!isSelf && !isAdmin) {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
  }

  const tutor = await prisma.user.findUnique({
    where:  { id },
    select: {
      id: true, photoUrl: true, bio: true, subjects: true, phone: true,
      _count: {
        select: {
          ownedClasses: { where: { isActive: true } },
          reviews:      { where: { isApproved: true } },
        },
      },
    },
  });

  if (!tutor) {
    return NextResponse.json({ error: "Tutor not found", code: "NOT_FOUND" }, { status: 404 });
  }

  let score = 0;
  const missing: string[] = [];

  if (tutor.photoUrl) {
    score += 20;
  } else {
    missing.push("Add a profile photo (+20)");
  }

  if (tutor.bio && tutor.bio.length > 100) {
    score += 20;
  } else {
    missing.push("Write a bio of at least 100 characters (+20)");
  }

  if (tutor.subjects.length > 0) {
    score += 15;
  } else {
    missing.push("Add at least one subject (+15)");
  }

  if (tutor.phone) {
    score += 10;
  } else {
    missing.push("Add your phone number (+10)");
  }

  if (tutor._count.ownedClasses > 0) {
    score += 20;
  } else {
    missing.push("Publish at least one class (+20)");
  }

  if (tutor._count.reviews > 0) {
    score += 15;
  } else {
    missing.push("Receive your first student review (+15)");
  }

  return NextResponse.json({ score, missing });
}
