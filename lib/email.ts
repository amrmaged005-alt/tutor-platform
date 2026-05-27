// Email utility — uses Resend when RESEND_API_KEY is present, no-ops otherwise.
// To enable email: set RESEND_API_KEY and RESEND_FROM_EMAIL in your .env.

import { prisma } from "./prisma";

async function resendClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  const { Resend } = await import("resend");
  return new Resend(key);
}

const FROM = () => process.env.RESEND_FROM_EMAIL ?? "noreply@coursaty.com";

type NotifPrefKey =
  | "notifyBookingConfirmed"
  | "notifyBookingCancelled"
  | "notifyNewMessage"
  | "notifyWaitlistOpened"
  | "notifyReviewReceived"
  | "notifyPayoutProcessed"
  | "notifyMarketingEmails";

/**
 * Returns true if the user opted-in (or has no record / pref unknown).
 * Returns false only when the user explicitly disabled this preference.
 */
export async function isOptedIn(emailOrUserId: string, prefKey: NotifPrefKey): Promise<boolean> {
  try {
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: emailOrUserId }, { id: emailOrUserId }] },
      select: { [prefKey]: true } as Record<NotifPrefKey, true>,
    });
    if (!user) return true;
    return (user as Record<string, boolean | undefined>)[prefKey] !== false;
  } catch {
    return true;
  }
}

export async function sendVerificationEmail(
  _email: string,
  _token: string
): Promise<void> {
  // Email verification disabled — no-op stub
}

export interface WaitlistNotificationParams {
  to:         string;
  firstName:  string;
  classTitle: string;
  tutorName:  string;
  priceEgp:   number;
  classUrl:   string;
}

export async function sendWaitlistNotification(
  params: WaitlistNotificationParams
): Promise<void> {
  const resend = await resendClient();
  if (!resend) return; // email not configured — silently skip

  const { to, firstName, classTitle, tutorName, priceEgp, classUrl } = params;

  // T15: respect user notification preferences
  const allowed = await isOptedIn(to, "notifyWaitlistOpened");
  if (!allowed) return;

  const { renderWaitlistEmail } = await import(
    "@/components/email-waitlist-notification"
  );

  await resend.emails.send({
    from:    FROM(),
    to,
    subject: `A spot just opened in ${classTitle} — book now!`,
    html:    renderWaitlistEmail({ firstName, classTitle, tutorName, priceEgp, classUrl }),
  });
}
