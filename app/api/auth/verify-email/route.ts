import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/login?error=missing-token", req.url)
    );
  }

  // Find the verification token in the database
  const verification = await prisma.verificationToken.findUnique({
    where: { token },
  });

  // Token doesn't exist
  if (!verification) {
    return NextResponse.redirect(
      new URL("/login?error=invalid-token", req.url)
    );
  }

  // Token has expired
  if (verification.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    return NextResponse.redirect(
      new URL("/login?error=expired-token", req.url)
    );
  }

  // Mark the user as verified
  await prisma.user.update({
    where: { email: verification.identifier },
    data: {
      isEmailVerified: true,
      emailVerified: new Date(),
    },
  });

  // Delete the token — it's been used
  await prisma.verificationToken.delete({ where: { token } });

  // Redirect to login with a success message
  return NextResponse.redirect(
    new URL("/login?verified=true", req.url)
  );
}