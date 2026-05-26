import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  const userId  = session?.user?.id ?? null;

  const cls = await prisma.class.findUnique({
    where: { id },
    select: { ownerId: true, tutors: { select: { tutorId: true } } },
  });

  if (!cls) {
    return NextResponse.json({ error: "Class not found", code: "NOT_FOUND" }, { status: 404 });
  }

  const isOwner = userId && (
    cls.ownerId === userId ||
    cls.tutors.some((t) => t.tutorId === userId)
  );

  let isStudent = false;
  if (userId && !isOwner) {
    const booking = await prisma.booking.findFirst({
      where: { classId: id, studentId: userId, status: "CONFIRMED" },
      select: { id: true },
    });
    isStudent = !!booking;
  }

  const where = isOwner
    ? { classId: id }
    : { classId: id, isLocked: false };

  const materials = await prisma.material.findMany({
    where,
    orderBy: { createdAt: "asc" },
  });

  // Non-students only get unlocked materials
  if (!isOwner && !isStudent) {
    return NextResponse.json(materials.filter((m) => !m.isLocked));
  }

  return NextResponse.json(materials);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await params;

  const cls = await prisma.class.findUnique({
    where: { id },
    select: { ownerId: true, tutors: { select: { tutorId: true } } },
  });

  if (!cls) {
    return NextResponse.json({ error: "Class not found", code: "NOT_FOUND" }, { status: 404 });
  }

  const userId = session.user.id!;
  const isOwner =
    cls.ownerId === userId ||
    cls.tutors.some((t) => t.tutorId === userId);

  if (!isOwner) {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
  }

  const body     = await req.json().catch(() => null);
  const title    = typeof body?.title === "string" ? body.title.slice(0, 200) : "";
  const url      = typeof body?.url    === "string" ? body.url : null;
  const type     = typeof body?.type   === "string" ? body.type : null;
  const isLocked = typeof body?.isLocked === "boolean" ? body.isLocked : true;

  if (!title) {
    return NextResponse.json({ error: "Title is required", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const material = await prisma.material.create({
    data: { classId: id, title, url, type, isLocked },
  });

  return NextResponse.json(material, { status: 201 });
}
