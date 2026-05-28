import { randomBytes } from "crypto";
import { prisma } from "./prisma";

const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

function newToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Issues a fresh email-verification token, invalidating any prior tokens for
 * the same user so only the latest link works.
 */
export async function generateEmailVerificationToken(userId: string): Promise<string> {
  await prisma.emailVerificationToken.deleteMany({ where: { userId } });

  const token = newToken();
  await prisma.emailVerificationToken.create({
    data: { userId, token, expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS) },
  });

  return token;
}

/**
 * Issues a fresh password-reset token, invalidating any prior tokens for the
 * same user.
 */
export async function generatePasswordResetToken(userId: string): Promise<string> {
  await prisma.passwordResetToken.deleteMany({ where: { userId } });

  const token = newToken();
  await prisma.passwordResetToken.create({
    data: { userId, token, expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS) },
  });

  return token;
}
