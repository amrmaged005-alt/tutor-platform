import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user };
}

export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const codes = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      code: true,
      discountPct: true,
      maxUses: true,
      usedCount: true,
      expiresAt: true,
      isActive: true,
      createdAt: true,
      createdBy: { select: { id: true, fullName: true, name: true, email: true } },
    },
  });

  return NextResponse.json({ codes });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const body = await req.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
  const discountPct = Number(body?.discountPct ?? 0);
  const maxUses = body?.maxUses != null ? Number(body.maxUses) : null;
  const expiresAt = body?.expiresAt ? new Date(body.expiresAt) : null;

  if (!/^[A-Z0-9]{3,32}$/.test(code)) {
    return NextResponse.json(
      { error: "Code must be 3-32 uppercase alphanumeric characters" },
      { status: 400 }
    );
  }
  if (!Number.isInteger(discountPct) || discountPct < 1 || discountPct > 100) {
    return NextResponse.json({ error: "discountPct must be an integer 1-100" }, { status: 400 });
  }
  if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses < 1)) {
    return NextResponse.json({ error: "maxUses must be a positive integer" }, { status: 400 });
  }
  if (expiresAt && isNaN(expiresAt.getTime())) {
    return NextResponse.json({ error: "Invalid expiresAt date" }, { status: 400 });
  }

  const existing = await prisma.promoCode.findUnique({ where: { code } });
  if (existing) {
    return NextResponse.json({ error: "Code already exists" }, { status: 409 });
  }

  const created = await prisma.promoCode.create({
    data: {
      code,
      discountPct,
      maxUses,
      expiresAt,
      createdById: guard.user.id,
    },
  });

  return NextResponse.json({ ok: true, code: created });
}
