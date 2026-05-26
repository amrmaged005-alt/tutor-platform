import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED_ROUTES: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/create-class": ["TUTOR", "CENTER_ADMIN", "ADMIN"],
  "/dashboard": ["STUDENT", "TUTOR", "CENTER_ADMIN", "ADMIN"],
};

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

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (req.method === "OPTIONS" && pathname.startsWith("/api/")) {
    return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
  }

  for (const [route, allowedRoles] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(route)) {
      const token = await getToken({
        req,
        secret: process.env.AUTH_SECRET,
      });

      if (!token) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return applyCors(req, NextResponse.redirect(loginUrl));
      }

      const userRole = token.role as string;
      if (!allowedRoles.includes(userRole)) {
        return applyCors(req, NextResponse.redirect(new URL("/unauthorized", req.url)));
      }
    }
  }

  return applyCors(req, NextResponse.next());
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/create-class/:path*",
    "/api/:path*",
  ],
};
