// TEMP: Email verification disabled
// This route is temporarily stubbed out. To re-enable, restore the original code below.

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return NextResponse.redirect(
    new URL("/login?info=verification-disabled", req.url)
  );
}

/*
// ─── ORIGINAL CODE (restore to re-enable) ─────────────────────────────────────
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/login?error=missing-token", req.url)
    );
  }

  const verification = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verification) {
    return NextResponse.redirect(
      new URL("/login?error=invalid-token", req.url)
    );
  }

  if (verification.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    return NextResponse.redirect(
      new URL("/login?error=expired-token", req.url)
    );
  }

  await prisma.user.update({
    where: { email: verification.identifier },
    data: {
      isEmailVerified: true,
      emailVerified: new Date(),
    },
  });

  await prisma.verificationToken.delete({ where: { token } });

  return NextResponse.redirect(
    new URL("/login?verified=true", req.url)
  );
}
*/