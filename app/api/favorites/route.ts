import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ classIds: [], tutorIds: [] });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    select: { classId: true, tutorId: true },
  });

  return NextResponse.json({
    classIds: favorites.map((f) => f.classId).filter(Boolean) as string[],
    tutorIds: favorites.map((f) => f.tutorId).filter(Boolean) as string[],
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const type = body?.type as "class" | "tutor" | undefined;
  const id   = typeof body?.id === "string" ? body.id : null;

  if (!type || !id || (type !== "class" && type !== "tutor")) {
    return NextResponse.json({ error: "type and id are required", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  await prisma.favorite.upsert({
    where: type === "class"
      ? { userId_classId: { userId: session.user.id, classId: id } }
      : { userId_tutorId: { userId: session.user.id, tutorId: id } },
    update: {},
    create: {
      userId:  session.user.id,
      classId: type === "class" ? id : null,
      tutorId: type === "tutor" ? id : null,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const type = body?.type as "class" | "tutor" | undefined;
  const id   = typeof body?.id === "string" ? body.id : null;

  if (!type || !id || (type !== "class" && type !== "tutor")) {
    return NextResponse.json({ error: "type and id are required", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  await prisma.favorite.deleteMany({
    where: type === "class"
      ? { userId: session.user.id, classId: id }
      : { userId: session.user.id, tutorId: id },
  });

  return NextResponse.json({ ok: true });
}
