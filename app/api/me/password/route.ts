import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { compare, hash } from "bcryptjs";
import { isRateLimited, resetPasswordLimiter } from "@/lib/ratelimit";
import { PasswordChangeSchema } from "@/schemas/user";
import { sendPasswordChangedEmail } from "@/lib/email";
import { log } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (await isRateLimited(resetPasswordLimiter, `change-pw:${session.user.id}`)) {
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

  const parsed = PasswordChangeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, password: true },
  });

  if (!user?.password) {
    // OAuth-only account with no password set.
    return NextResponse.json({ error: "This account has no password to change." }, { status: 400 });
  }

  const currentValid = await compare(parsed.data.currentPassword, user.password);
  if (!currentValid) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  }

  const hashed = await hash(parsed.data.newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, passwordChangedAt: new Date() },
  });

  await log({
    action: "user.password_changed",
    actorId: user.id,
    targetType: "User",
    targetId: user.id,
  }).catch(() => {});

  if (user.email) {
    sendPasswordChangedEmail(user.email, user.name ?? "there").catch(() => {});
  }

  return NextResponse.json({ success: true });
}
