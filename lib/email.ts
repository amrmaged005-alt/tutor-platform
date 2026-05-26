// Email utility — uses Resend when RESEND_API_KEY is present, no-ops otherwise.
// To enable email: set RESEND_API_KEY and RESEND_FROM_EMAIL in your .env.

async function resendClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  const { Resend } = await import("resend");
  return new Resend(key);
}

const FROM = () => process.env.RESEND_FROM_EMAIL ?? "noreply@coursaty.com";

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
