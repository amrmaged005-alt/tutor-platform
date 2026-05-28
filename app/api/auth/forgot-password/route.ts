import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";
import { isRateLimited, forgotPasswordLimiter } from "@/lib/ratelimit";
import { ForgotPasswordSchema } from "@/schemas/user";

// Identical response regardless of whether the email exists — prevents
// account enumeration.
const genericResponse = () =>
  NextResponse.json({
    success: true,
    message: "If an account with that email exists, you'll receive a reset link shortly.",
  });

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (await isRateLimited(forgotPasswordLimiter, `forgot:${ip}`)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before trying again." },
      { status: 429, headers: { "Retry-After": "900" } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return genericResponse();
  }

  const parsed = ForgotPasswordSchema.safeParse(body);
  if (!parsed.success) return genericResponse();

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, password: true },
  });

  // Only send to real, password-based accounts. OAuth-only accounts have no
  // password to reset.
  if (user?.password && user.email) {
    try {
      const token = await generatePasswordResetToken(user.id);
      await sendPasswordResetEmail(user.email, user.name ?? "there", token);
    } catch (err) {
      console.error("Password reset email failed:", err);
    }
  }

  return genericResponse();
}
