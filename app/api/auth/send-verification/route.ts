import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateEmailVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";
import { isRateLimited, resendVerificationLimiter } from "@/lib/ratelimit";

// Authenticated resend — for a logged-in user who hasn't verified yet.
export async function POST() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user.email.toLowerCase();
  const limited = await isRateLimited(resendVerificationLimiter, `resend-verify:${email}`);
  if (limited) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before trying again." },
      { status: 429, headers: { "Retry-After": "3600" } }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, isEmailVerified: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  if (user.isEmailVerified) {
    return NextResponse.json({ error: "Email is already verified." }, { status: 400 });
  }

  try {
    const token = await generateEmailVerificationToken(user.id);
    await sendVerificationEmail(user.email!, user.name ?? "there", token);
  } catch (err) {
    console.error("Send verification failed:", err);
    return NextResponse.json({ error: "Could not send email. Try again later." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
