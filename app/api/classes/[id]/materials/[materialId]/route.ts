import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; materialId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id, materialId } = await params;

  const cls = await prisma.class.findUnique({
    where: { id },
    select: { ownerId: true },
  });

  if (!cls) {
    return NextResponse.json({ error: "Class not found", code: "NOT_FOUND" }, { status: 404 });
  }

  if (cls.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
  }

  const material = await prisma.material.findFirst({
    where: { id: materialId, classId: id },
    select: { id: true },
  });

  if (!material) {
    return NextResponse.json({ error: "Material not found", code: "NOT_FOUND" }, { status: 404 });
  }

  await prisma.material.delete({ where: { id: materialId } });

  return NextResponse.json({ ok: true });
}
