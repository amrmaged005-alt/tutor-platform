import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { prisma } from "./prisma";
import { compare } from "bcryptjs";
import { isRateLimited, authLimiter } from "./ratelimit";
import { headers } from "next/headers";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma as any),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id   = user.id;
        token.role = (user as any).role;
        token.phone = (user as any).phone;
      }
      // Google sign-in: default role to STUDENT if not set
      if (account?.provider === "google" && !token.role) {
        const dbUser = await prisma.user.findUnique({
          where:  { id: token.id as string },
          select: { role: true },
        });
        token.role = dbUser?.role ?? "STUDENT";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role  = token.role;
        (session.user as any).phone = token.phone;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Ensure new Google OAuth users get STUDENT role by default
      if (user.id && !(user as any).role) {
        await prisma.user.update({
          where: { id: user.id },
          data:  { role: "STUDENT" },
        });
      }
    },
  },
  providers: [
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email    = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);

        if (!email || !password) return null;

        // Rate limit by IP address — max 5 login attempts per 15 minutes
        const headersList = await headers();
        const ip =
          headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          headersList.get("x-real-ip") ??
          "unknown";

        const limited = await isRateLimited(authLimiter, `login:${ip}`);
        if (limited) {
          throw new Error("Too many login attempts. Please wait 15 minutes and try again.");
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.password) return null;

        const isValid = await compare(password, user.password);

        if (!isValid) return null;

        return user;
      },
    }),
  ],
});
