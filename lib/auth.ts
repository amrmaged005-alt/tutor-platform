import NextAuth, { CredentialsSignin } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compare, hashSync } from "bcryptjs";
import { headers } from "next/headers";
import { prisma } from "./prisma";
import { isRateLimited, authLimiter } from "./ratelimit";
import { sendLoginAlertEmail, sendWelcomeEmail } from "./email";
import { authConfig } from "../auth.config";
import { validateEnv } from "./validateEnv";

// Crash at startup with a clear message if required env vars are missing,
// rather than failing silently at runtime when emails/payments/OAuth break.
validateEnv();

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// Precomputed valid hash so a "user not found" path still spends real CPU in
// bcrypt.compare — defeats timing-based account enumeration.
const DUMMY_HASH = hashSync("timing-attack-mitigation-placeholder", 12);

// Surfaces a specific message to the client. Auth.js masks thrown errors as a
// generic "CredentialsSignin", but the `code` field is forwarded verbatim.
class LoginError extends CredentialsSignin {
  constructor(message: string) {
    super();
    this.code = message;
  }
}

async function readClientMeta(): Promise<{ ip: string; userAgent: string }> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown";
  const userAgent = h.get("user-agent") || "unknown";
  return { ip, userAgent };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma as never),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Link Google to an existing same-email account instead of erroring or
      // creating a duplicate. Google has already verified ownership of the
      // email, so this is safe.
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) {
          throw new LoginError("Invalid email or password.");
        }

        const { ip, userAgent } = await readClientMeta();

        // IP-level brute-force throttle (Redis) on top of per-account lockout.
        if (await isRateLimited(authLimiter, `login:${ip}`)) {
          throw new LoginError(
            "Too many login attempts. Please wait 15 minutes and try again."
          );
        }

        const user = await prisma.user.findUnique({ where: { email } });

        // User not found — burn equivalent CPU, log, return generic error.
        if (!user || !user.password) {
          await compare(password, DUMMY_HASH);
          await prisma.loginAuditLog
            .create({ data: { email, ip, userAgent, success: false, reason: "user_not_found" } })
            .catch(() => {});
          throw new LoginError("Invalid email or password.");
        }

        // Account lockout window still active.
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
          await prisma.loginAuditLog
            .create({ data: { email, userId: user.id, ip, userAgent, success: false, reason: "account_locked" } })
            .catch(() => {});
          throw new LoginError(`Account locked. Try again in ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}.`);
        }

        const valid = await compare(password, user.password);

        if (!valid) {
          const failCount = user.failedLoginCount + 1;
          const lockUntil = failCount >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCK_DURATION_MS) : null;
          await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginCount: failCount, lockedUntil: lockUntil },
          });
          await prisma.loginAuditLog
            .create({ data: { email, userId: user.id, ip, userAgent, success: false, reason: "wrong_password" } })
            .catch(() => {});

          const attemptsLeft = Math.max(0, MAX_FAILED_ATTEMPTS - failCount);
          if (attemptsLeft === 0) {
            throw new LoginError("Too many failed attempts. Account locked for 15 minutes.");
          }
          throw new LoginError(
            `Invalid email or password. ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} remaining.`
          );
        }

        // TEMP: email verification disabled — re-enable this block before going to production.
        // Correct password but email not verified.
        // if (!user.isEmailVerified) {
        //   await prisma.loginAuditLog
        //     .create({ data: { email, userId: user.id, ip, userAgent, success: false, reason: "unverified_email" } })
        //     .catch(() => {});
        //   throw new LoginError("Please verify your email before logging in. Check your inbox.");
        // }

        // Success — reset lockout counters, record login telemetry.
        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date(), lastLoginIp: ip },
        });
        await prisma.loginAuditLog
          .create({ data: { email, userId: user.id, ip, userAgent, success: true, reason: "success" } })
          .catch(() => {});

        // Fire-and-forget login alert — never block sign-in on email delivery.
        if (user.email) {
          sendLoginAlertEmail(user.email, user.name ?? "there", ip, userAgent, new Date().toISOString()).catch(() => {});
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          isEmailVerified: user.isEmailVerified,
          sessionVersion: user.sessionVersion,
        } as never;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, account }) {
      // Initial sign-in: project user fields onto the token.
      if (user) {
        const u = user as {
          id?: string; role?: string; phone?: string | null;
          isEmailVerified?: boolean; sessionVersion?: number;
        };
        token.id = u.id ?? token.id;
        token.role = u.role ?? token.role;
        token.phone = u.phone ?? token.phone;
        token.isEmailVerified = u.isEmailVerified ?? token.isEmailVerified;
        token.sessionVersion = u.sessionVersion ?? 0;
      }

      // Google sign-in: hydrate claims from DB (adapter user lacks them).
      if (account?.provider === "google" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, phone: true, isEmailVerified: true, sessionVersion: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.phone = dbUser.phone;
          token.isEmailVerified = dbUser.isEmailVerified;
          token.sessionVersion = dbUser.sessionVersion;
        }
      }

      // Forced-logout enforcement: if the user bumped sessionVersion
      // ("sign out of all devices" / password reset), invalidate stale tokens.
      if (token.id && typeof token.sessionVersion === "number") {
        try {
          const current = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { sessionVersion: true },
          });
          if (current && current.sessionVersion !== token.sessionVersion) {
            return null; // drops the session
          }
        } catch {
          // DB hiccup — fail open so a transient outage doesn't log everyone out.
        }
      }

      return token;
    },
  },
  events: {
    async createUser({ user }) {
      // Adapter only creates users for OAuth (credentials signups use the
      // signup route). Google has verified the email, so trust it.
      if (!user.id) return;
      await prisma.user
        .update({
          where: { id: user.id },
          data: { role: "STUDENT", isEmailVerified: true, emailVerified: new Date() },
        })
        .catch(() => {});
      if (user.email) {
        sendWelcomeEmail(user.email, user.name ?? "there").catch(() => {});
      }
    },
  },
});
