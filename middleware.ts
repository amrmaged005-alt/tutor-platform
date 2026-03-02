import { auth } from "./lib/auth";
import { NextResponse } from "next/server";

// Routes and which roles can access them
const PROTECTED_ROUTES: Record<string, string[]> = {
  "/admin":          ["ADMIN"],
  "/create-class":   ["TUTOR", "CENTER_ADMIN", "ADMIN"],
  "/dashboard":      ["STUDENT", "TUTOR", "CENTER_ADMIN", "ADMIN"],
  "/api/bookings":   ["STUDENT", "ADMIN"],
  "/api/classes/create": ["TUTOR", "CENTER_ADMIN", "ADMIN"],
  "/api/reviews":    ["STUDENT", "ADMIN"],
  "/api/stripe":     ["STUDENT", "TUTOR", "CENTER_ADMIN", "ADMIN"],
};

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  for (const [route, allowedRoles] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(route)) {
      // Not logged in → send to login
      if (!session) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Logged in but wrong role → send to unauthorized
      const userRole = (session.user as any)?.role;
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/create-class/:path*",
    "/api/bookings/:path*",
    "/api/classes/create/:path*",
    "/api/reviews/:path*",
    "/api/stripe/:path*",
  ],
};