import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { isRateLimited, resetPasswordLimiter } from "@/lib/ratelimit";
import { PasswordResetSchema } from "@/schemas/user";
import { sendPasswordChangedEmail } from "@/lib/email";
import { log } from "@/lib/audit";

// GET — used by the reset page on load to check the token is still valid
// before showing the form.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")?.trim();
  if (!token) {
    return NextResponse.json({ valid: false, error: "Invalid or expired link." }, { status: 400 });
  }

  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record || record.used || record.expiresAt < new Date()) {
    return NextResponse.json({ valid: false, error: "This reset link is invalid or has expired." }, { status: 400 });
  }

  return NextResponse.json({ valid: true });
}

// POST — perform the reset.
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (await isRateLimited(resetPasswordLimiter, `reset:${ip}`)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before trying again." },
      { status: 429, headers: { "Retry-After": "3600" } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = PasswordResetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const { token, password } = parsed.data;

  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  if (!record || record.used || record.expiresAt < new Date()) {
    return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
  }

  const hashed = await hash(password, 12);

  // Atomically: set the new password, clear lockout state, bump sessionVersion
  // (invalidates every existing JWT session), and consume the token.
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: {
        password: hashed,
        failedLoginCount: 0,
        lockedUntil: null,
        passwordChangedAt: new Date(),
        sessionVersion: { increment: 1 },
      },
    }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { used: true } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: record.userId, used: false } }),
  ]);

  await log({
    action: "user.password_reset",
    actorId: record.userId,
    targetType: "User",
    targetId: record.userId,
  }).catch(() => {});

  if (record.user.email) {
    sendPasswordChangedEmail(record.user.email, record.user.name ?? "there").catch(() => {});
  }

  return NextResponse.json({ success: true });
}
