import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function guardCenter(centerId: string) {
  const session = await auth();
  if (!session?.user?.id)
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, centerId: true },
  });
  if (!me) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const ok = me.role === "ADMIN" || (me.role === "CENTER_ADMIN" && me.centerId === centerId);
  if (!ok) return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { me };
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const guard = await guardCenter(id);
  if (guard.error) return guard.error;

  const center = await prisma.learningCenter.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      logoUrl: true,
      city: true,
      location: true,
      phone: true,
      email: true,
    },
  });
  if (!center) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ center });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const guard = await guardCenter(id);
  if (guard.error) return guard.error;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const { name, description, city, location, phone, email, logoUrl } = body;

  if (name !== undefined && typeof name === "string" && name.trim().length === 0) {
    return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
  }

  const updated = await prisma.learningCenter.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(description !== undefined && { description }),
      ...(city !== undefined && { city }),
      ...(location !== undefined && { location }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(logoUrl !== undefined && { logoUrl }),
    },
    select: {
      id: true,
      name: true,
      description: true,
      logoUrl: true,
      city: true,
      location: true,
      phone: true,
      email: true,
    },
  });

  return NextResponse.json({ ok: true, center: updated });
}
