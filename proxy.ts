import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED_ROUTES: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/create-class": ["TUTOR", "CENTER_ADMIN", "ADMIN"],
  "/dashboard": ["STUDENT", "TUTOR", "CENTER_ADMIN", "ADMIN"],
  "/api/bookings": ["STUDENT", "ADMIN"],
  "/api/classes/create": ["TUTOR", "CENTER_ADMIN", "ADMIN"],
  "/api/reviews": ["STUDENT", "ADMIN"],
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  for (const [route, allowedRoles] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(route)) {
      const token = await getToken({
        req,
        secret: process.env.AUTH_SECRET,
      });

      if (!token) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }

      const userRole = token.role as string;
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/create-class/:path*",
    "/api/bookings/:path*",
    "/api/classes/create/:path*",
    "/api/reviews/:path*",
  ],
};
