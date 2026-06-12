import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import SettingsTabs from "./SettingsTabs";

export const metadata: Metadata = {
  title: "Settings | Coursaty",
  description: "Manage your notification preferences and account security on Coursaty.",
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/settings");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      notifyBookingConfirmed: true,
      notifyBookingCancelled: true,
      notifyNewMessage: true,
      notifyWaitlistOpened: true,
      notifyReviewReceived: true,
      notifyPayoutProcessed: true,
      notifyMarketingEmails: true,
      fullName: true,
      name: true,
      email: true,
      role: true,
      isEmailVerified: true,
      password: true,
      lastLoginAt: true,
      lastLoginIp: true,
      failedLoginCount: true,
      lockedUntil: true,
      accounts: { select: { provider: true } },
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <SettingsTabs
      initialPrefs={{
      notifyBookingConfirmed: user.notifyBookingConfirmed,
      notifyNewMessage: user.notifyNewMessage,
      notifyReviewReceived: user.notifyReviewReceived,
      pushOnBooking: user.notifyBookingConfirmed,
      }}
      profile={{ name: user.fullName ?? user.name ?? "Coursaty member", email: user.email ?? "No email address", role: user.role }}
      security={{
        isEmailVerified: user.isEmailVerified,
        hasPassword: Boolean(user.password),
        lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
        lastLoginIp: user.lastLoginIp,
        failedLoginCount: user.failedLoginCount,
        lockedUntil: user.lockedUntil ? user.lockedUntil.toISOString() : null,
        providers: Array.from(new Set(user.accounts.map((a) => a.provider))),
      }}
    />
  );
}
