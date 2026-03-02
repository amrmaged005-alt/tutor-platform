// TEMP: Email verification disabled
// This route is temporarily stubbed out. To re-enable, restore the original code below.

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Email verification is temporarily disabled." },
    { status: 503 }
  );
}

/*
// ─── ORIGINAL CODE (restore to re-enable) ─────────────────────────────────────
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { randomBytes } from "crypto";
import { isRateLimited, generalLimiter } from "@/lib/ratelimit";
import { headers } from "next/headers";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const limited = await isRateLimited(generalLimiter, `verify-email:${ip}`);
  if (limited) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before trying again." },
      { status: 429 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isEmailVerified: true, email: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  if (user.isEmailVerified) {
    return NextResponse.json(
      { error: "Email is already verified." },
      { status: 400 }
    );
  }

  await prisma.verificationToken.deleteMany({
    where: { identifier: user.email! },
  });

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.verificationToken.create({
    data: {
      identifier: user.email!,
      token,
      expires,
    },
  });

  await sendVerificationEmail(user.email!, token);

  return NextResponse.json({ success: true });
}
*/