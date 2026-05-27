import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import SettingsClient from "./SettingsClient";

export const metadata: Metadata = {
  title: "Notification Settings | Coursaty",
  description: "Manage your email notification preferences on Coursaty.",
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?next=/settings");
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
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-alt)",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <SettingsClient initialPrefs={user} />
    </main>
  );
}
