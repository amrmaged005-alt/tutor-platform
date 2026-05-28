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
const BASE_URL = () => process.env.NEXTAUTH_URL ?? "https://coursaty.com";

const BRAND = "#0d5946";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function layout(inner: string): string {
  return `<div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; color: #18171515;">${inner}</div>`;
}

function ctaButton(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;padding:12px 24px;background:${BRAND};color:#ffffff;border-radius:8px;text-decoration:none;font-weight:bold;">${label}</a>`;
}

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
  email: string,
  name: string,
  token: string
): Promise<void> {
  const resend = await resendClient();
  if (!resend) return; // email not configured — silently skip
  const link = `${BASE_URL()}/verify-email?token=${token}`;
  await resend.emails.send({
    from: FROM(),
    to: email,
    subject: "Verify your Coursaty account",
    html: layout(`
      <h2 style="color:${BRAND};">Welcome to Coursaty, ${escapeHtml(name)}!</h2>
      <p>Please verify your email address to activate your account.</p>
      ${ctaButton(link, "Verify Email")}
      <p style="color:#666;font-size:14px;margin-top:24px;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
    `),
  });
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
): Promise<void> {
  const resend = await resendClient();
  if (!resend) return;
  const link = `${BASE_URL()}/reset-password?token=${token}`;
  await resend.emails.send({
    from: FROM(),
    to: email,
    subject: "Reset your Coursaty password",
    html: layout(`
      <h2 style="color:${BRAND};">Password Reset Request</h2>
      <p>Hi ${escapeHtml(name)}, we received a request to reset your password.</p>
      ${ctaButton(link, "Reset Password")}
      <p style="color:#666;font-size:14px;margin-top:24px;">This link expires in 1 hour. If you didn't request this, your account is safe — ignore this email.</p>
    `),
  });
}

export async function sendLoginAlertEmail(
  email: string,
  name: string,
  ip: string,
  userAgent: string,
  time: string
): Promise<void> {
  const resend = await resendClient();
  if (!resend) return;
  const row = (label: string, value: string) =>
    `<tr><td style="padding:8px;border:1px solid #eee;color:#666;">${label}</td><td style="padding:8px;border:1px solid #eee;">${escapeHtml(value)}</td></tr>`;
  await resend.emails.send({
    from: FROM(),
    to: email,
    subject: "New login to your Coursaty account",
    html: layout(`
      <h2 style="color:${BRAND};">New Login Detected</h2>
      <p>Hi ${escapeHtml(name)}, we noticed a new login to your account.</p>
      <table style="border-collapse:collapse;width:100%">
        ${row("Time", time)}
        ${row("IP Address", ip)}
        ${row("Device", userAgent)}
      </table>
      <p style="color:#c00;margin-top:16px;">If this wasn't you, <a href="${BASE_URL()}/forgot-password">reset your password immediately</a>.</p>
    `),
  });
}

export async function sendPasswordChangedEmail(
  email: string,
  name: string
): Promise<void> {
  const resend = await resendClient();
  if (!resend) return;
  await resend.emails.send({
    from: FROM(),
    to: email,
    subject: "Your Coursaty password was changed",
    html: layout(`
      <h2 style="color:${BRAND};">Password Changed</h2>
      <p>Hi ${escapeHtml(name)}, your password was successfully changed.</p>
      <p style="color:#c00;">If you didn't make this change, <a href="${BASE_URL()}/forgot-password">reset your password immediately</a> and contact support.</p>
    `),
  });
}

export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<void> {
  const resend = await resendClient();
  if (!resend) return;
  await resend.emails.send({
    from: FROM(),
    to: email,
    subject: "Welcome to Coursaty",
    html: layout(`
      <h2 style="color:${BRAND};">You're in, ${escapeHtml(name)}!</h2>
      <p>Your email is verified. You can now book sessions, connect with tutors, and start learning.</p>
      ${ctaButton(`${BASE_URL()}/classes`, "Browse Classes")}
    `),
  });
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
