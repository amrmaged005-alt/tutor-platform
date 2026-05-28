import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Routes that require any authenticated session.
const PROTECTED = ["/dashboard", "/messages", "/favorites", "/settings", "/referral", "/bookings", "/create-class"];
// Routes gated by role.
const ROLE_GATES: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/centers": ["CENTER_ADMIN", "ADMIN"],
};
// Auth screens a signed-in user shouldn't see (verify-email intentionally omitted).
const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];

const ALLOWED_ORIGINS = new Set([
  "http://localhost:3000",
  "http://localhost:5000",
  "http://localhost:8080",
  "http://127.0.0.1:3000",
  "https://coursaty.com",
]);

function corsHeaders(req: NextRequest): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

function applyCors(req: NextRequest, res: NextResponse): NextResponse {
  if (!req.nextUrl.pathname.startsWith("/api/")) return res;
  for (const [key, value] of Object.entries(corsHeaders(req))) {
    res.headers.set(key, value);
  }
  return res;
}

const matches = (pathname: string, route: string) => pathname === route || pathname.startsWith(`${route}/`);

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (req.method === "OPTIONS" && pathname.startsWith("/api/")) {
    return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
  }

  // Page-route auth. (API routes guard themselves with auth() server-side.)
  if (!pathname.startsWith("/api/")) {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });

    const roleGate = Object.entries(ROLE_GATES).find(([route]) => matches(pathname, route));
    const isProtected = PROTECTED.some((route) => matches(pathname, route));
    const isAuthRoute = AUTH_ROUTES.some((route) => matches(pathname, route));

    if (roleGate || isProtected) {
      if (!token) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }
      if (roleGate && !roleGate[1].includes(token.role as string)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    if (isAuthRoute && token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return applyCors(req, NextResponse.next());
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/centers/:path*",
    "/dashboard/:path*",
    "/create-class/:path*",
    "/messages/:path*",
    "/favorites/:path*",
    "/settings/:path*",
    "/referral/:path*",
    "/bookings/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/api/:path*",
  ],
};
