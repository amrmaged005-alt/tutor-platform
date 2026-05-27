import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      referralCode: true,
      walletBalanceEgp: true,
      referralsSent: {
        orderBy: { createdAt: "desc" },
        select: {
          createdAt: true,
          completedAt: true,
          creditEgp: true,
          referred: { select: { fullName: true, name: true } },
        },
      },
    },
  });

  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://coursaty.com";
  const referralLink = me.referralCode ? `${baseUrl}/signup?ref=${me.referralCode}` : null;

  const totalCreditsEgp = me.referralsSent.reduce((sum, r) => sum + r.creditEgp, 0);

  return NextResponse.json({
    referralCode: me.referralCode,
    referralLink,
    referralCount: me.referralsSent.length,
    totalCreditsEgp,
    walletBalanceEgp: me.walletBalanceEgp,
    referrals: me.referralsSent.map((r) => ({
      name: r.referred.fullName ?? r.referred.name ?? "Friend",
      joinedAt: r.createdAt,
      completedAt: r.completedAt,
      creditEgp: r.creditEgp,
    })),
  });
}
