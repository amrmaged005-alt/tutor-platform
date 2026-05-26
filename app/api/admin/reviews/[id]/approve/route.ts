import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { role: true },
  });
  return user?.role === "ADMIN" ? session.user : null;
}

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Admin access required", code: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await params;

  const review = await prisma.review.findUnique({ where: { id }, select: { id: true } });
  if (!review) {
    return NextResponse.json({ error: "Review not found", code: "NOT_FOUND" }, { status: 404 });
  }

  await prisma.review.update({
    where: { id },
    data:  { isApproved: true, moderatedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Admin access required", code: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await params;

  const review = await prisma.review.findUnique({ where: { id }, select: { id: true } });
  if (!review) {
    return NextResponse.json({ error: "Review not found", code: "NOT_FOUND" }, { status: 404 });
  }

  await prisma.review.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
