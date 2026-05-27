import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMobileUser } from "../_utils";

export async function GET(req: NextRequest) {
  const authed = await requireMobileUser(req);
  if (authed instanceof NextResponse) return authed;

  const user = await prisma.user.findUnique({
    where: { id: authed.id },
    select: {
      id: true,
      fullName: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      photoUrl: true,
      bio: true,
      isVerified: true,
      isEmailVerified: true,
      subjects: true,
      centerId: true,
      walletBalanceEgp: true,
      referralCode: true,
      center: { select: { id: true, name: true } },
    },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.fullName ?? user.name ?? "",
      email: user.email,
      phone: user.phone,
      role: user.role,
      photoUrl: user.photoUrl,
      bio: user.bio,
      isVerified: user.isVerified,
      isEmailVerified: user.isEmailVerified,
      subjects: user.subjects,
      centerId: user.centerId,
      centerName: user.center?.name ?? null,
      walletBalanceEgp: user.walletBalanceEgp,
      referralCode: user.referralCode,
    },
  });
}
