import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import ReferralClient from "./ReferralClient";

export const metadata: Metadata = {
  title: "Refer & Earn | Coursaty",
  description: "Invite friends to Coursaty and earn wallet credit when they book their first class.",
};

export default async function ReferralPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?next=/referral");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      referralCode: true,
      walletBalanceEgp: true,
      referralsSent: {
        select: {
          id: true,
          completedAt: true,
          creditEgp: true,
        },
      },
    },
  });

  if (!user) redirect("/login");

  const referralCount = user.referralsSent.length;
  const completedCount = user.referralsSent.filter((r) => r.completedAt !== null).length;
  const totalEarnedEgp = user.referralsSent.reduce((sum, r) => sum + r.creditEgp, 0);

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-alt)",
      }}
    >
      <ReferralClient
        data={{
          referralCode: user.referralCode ?? "",
          walletBalanceEgp: user.walletBalanceEgp,
          referralCount,
          completedCount,
          totalEarnedEgp,
        }}
      />
    </main>
  );
}
