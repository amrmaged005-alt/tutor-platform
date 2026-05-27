import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const REFERRAL_CREDIT_EGP = 100;

/**
 * POST /api/me/referral/complete
 * Body: { referredId: string }
 *
 * Marks a referral as completed (e.g. when the referred user finishes their first booking)
 * and credits the referrer's wallet. Called internally by the booking flow or by an admin.
 * Requires session: either ADMIN, or the referred user themselves triggering it.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const referredId = typeof body?.referredId === "string" ? body.referredId : session.user.id;

  // Only the referred user themselves or an admin can mark completion
  if (referredId !== session.user.id) {
    const me = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (me?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const referral = await prisma.referral.findUnique({ where: { referredId } });
  if (!referral) return NextResponse.json({ error: "No referral found" }, { status: 404 });
  if (referral.completedAt) {
    return NextResponse.json({ ok: true, alreadyCompleted: true });
  }

  await prisma.$transaction([
    prisma.referral.update({
      where: { id: referral.id },
      data: { completedAt: new Date(), creditEgp: REFERRAL_CREDIT_EGP },
    }),
    prisma.user.update({
      where: { id: referral.referrerId },
      data: { walletBalanceEgp: { increment: REFERRAL_CREDIT_EGP } },
    }),
  ]);

  return NextResponse.json({ ok: true, creditedEgp: REFERRAL_CREDIT_EGP });
}
