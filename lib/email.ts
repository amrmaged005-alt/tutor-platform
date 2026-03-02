// TEMP: Email verification disabled
// import { Resend } from "resend";
//
// const resend = new Resend(process.env.RESEND_API_KEY!);
// const FROM = process.env.RESEND_FROM_EMAIL!;
// const BASE_URL = process.env.NEXTAUTH_URL!;

// ─── Send verification email (disabled) ───────────────────────────────────────
export async function sendVerificationEmail(
  _email: string,
  _token: string
): Promise<void> {
  // TEMP: Email verification disabled — no-op
  console.log("[TEMP] sendVerificationEmail called but disabled");
}

/*
// ─── ORIGINAL CODE (restore to re-enable) ─────────────────────────────────────
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.RESEND_FROM_EMAIL!;
const BASE_URL = process.env.NEXTAUTH_URL!;

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verifyUrl = `${BASE_URL}/api/auth/verify-email?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verify your Coursaty account",
    html: `...`,
  });
}
*/