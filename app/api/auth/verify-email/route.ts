import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";
import { log } from "@/lib/audit";

// Verifies an email-verification token. Returns JSON consumed by /verify-email.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")?.trim();

  if (!token) {
    return NextResponse.json({ error: "Invalid or expired link." }, { status: 400 });
  }

  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: { select: { id: true, email: true, name: true, isEmailVerified: true } } },
  });

  if (!record) {
    return NextResponse.json({ error: "Invalid or expired link." }, { status: 400 });
  }

  if (record.expiresAt < new Date()) {
    await prisma.emailVerificationToken.delete({ where: { id: record.id } }).catch(() => null);
    return NextResponse.json({ error: "This link has expired. Request a new one." }, { status: 400 });
  }

  if (record.user.isEmailVerified) {
    await prisma.emailVerificationToken.deleteMany({ where: { userId: record.userId } }).catch(() => null);
    return NextResponse.json({ success: true, alreadyVerified: true });
  }

  await prisma.user.update({
    where: { id: record.userId },
    data: { isEmailVerified: true, emailVerified: new Date() },
  });

  await prisma.emailVerificationToken.deleteMany({ where: { userId: record.userId } }).catch(() => null);

  await log({
    action: "user.email_verified",
    actorId: record.userId,
    targetType: "User",
    targetId: record.userId,
  });

  if (record.user.email) {
    sendWelcomeEmail(record.user.email, record.user.name ?? "there").catch(() => {});
  }

  return NextResponse.json({ success: true });
}
