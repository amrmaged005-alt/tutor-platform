import type { NextAuthConfig } from "next-auth";

// Edge-safe auth config — NO Prisma, NO adapter, NO Node-only imports.
// This is what middleware.ts loads so the Edge runtime never tries to bundle
// Prisma. lib/auth.ts spreads this and layers on the adapter + Credentials
// provider (which need Node + Prisma at call time).

export const authConfig = {
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  // Providers are added in lib/auth.ts. Middleware only validates existing
  // sessions, so it needs no providers here.
  providers: [],
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
    // Edge-safe session shaping. The full (Prisma-backed) jwt callback lives in
    // lib/auth.ts; here we only project token claims onto the session object.
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: unknown }).role = token.role;
        (session.user as { phone?: unknown }).phone = token.phone;
        (session.user as { isEmailVerified?: unknown }).isEmailVerified =
          token.isEmailVerified;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;
