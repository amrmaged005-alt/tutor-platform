import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.RESEND_FROM_EMAIL!;
const BASE_URL = process.env.NEXTAUTH_URL!;

// ─── Send verification email ──────────────────────────────────────────────────
export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verifyUrl = `${BASE_URL}/api/auth/verify-email?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verify your Coursaty account",
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem;">
        <h1 style="font-size: 1.5rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem;">
          Verify your email
        </h1>
        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 1.5rem;">
          Thanks for joining Coursaty! Click the button below to verify your email address.
          This link expires in <strong>24 hours</strong>.
        </p>
        
          href="${verifyUrl}"
          style="display: inline-block; background-color: #3b82f6; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 700; font-size: 15px; text-decoration: none;"
        >
          Verify my email
        </a>
        <p style="color: #94a3b8; font-size: 13px; margin-top: 1.5rem;">
          If you didn't create a Coursaty account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}