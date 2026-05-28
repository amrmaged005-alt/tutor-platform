import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isRateLimited, promoLimiter } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ valid: false, error: "Unauthorized" }, { status: 401 });
  }

  const limited = await isRateLimited(promoLimiter, session.user.id);
  if (limited) {
    return NextResponse.json({ valid: false, error: "Too many requests. Please slow down." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
  const classId = typeof body?.classId === "string" ? body.classId : "";

  if (!code || !classId) {
    return NextResponse.json({ valid: false, error: "Code and classId are required" }, { status: 400 });
  }

  try {
    const promo = await prisma.promoCode.findUnique({ where: { code } });
    if (!promo || !promo.isActive) {
      return NextResponse.json({ valid: false, error: "Invalid or inactive promo code" });
    }

    if (promo.expiresAt && promo.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, error: "This code has expired" });
    }

    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
      return NextResponse.json({ valid: false, error: "This code has reached its usage limit" });
    }

    const cls = await prisma.class.findUnique({
      where: { id: classId },
      select: { id: true, priceEgp: true, isActive: true },
    });
    if (!cls || !cls.isActive) {
      return NextResponse.json({ valid: false, error: "Class not found" }, { status: 404 });
    }

    const discountEgp = Math.round((cls.priceEgp * promo.discountPct) / 100);
    const finalPrice = Math.max(0, cls.priceEgp - discountEgp);

    return NextResponse.json({
      valid: true,
      discountPct: promo.discountPct,
      discountEgp,
      finalPrice,
    });
  } catch (err) {
    console.error("[POST /api/promo/validate] error:", err);
    return NextResponse.json({ valid: false, error: "Internal server error" }, { status: 500 });
  }
}
