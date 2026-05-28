import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateEmailVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";
import { isRateLimited, resendVerificationLimiter } from "@/lib/ratelimit";
import { ResendVerificationSchema } from "@/schemas/user";

// Generic success message — identical regardless of outcome to prevent
// email-account enumeration.
const GENERIC = {
  success: true,
  message: "If an account with that email needs verification, a new link is on its way.",
};

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = ResendVerificationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();

  const limited = await isRateLimited(resendVerificationLimiter, `resend-verify:${email}`);
  if (limited) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before trying again." },
      { status: 429, headers: { "Retry-After": "3600" } }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, isEmailVerified: true },
  });

  if (user && !user.isEmailVerified && user.email) {
    try {
      const token = await generateEmailVerificationToken(user.id);
      await sendVerificationEmail(user.email, user.name ?? "there", token);
    } catch (err) {
      console.error("Resend verification failed:", err);
    }
  }

  return NextResponse.json(GENERIC);
}
