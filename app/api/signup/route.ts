import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { hash } from "bcryptjs";
import { UserRegisterSchema } from "@/schemas/user";
import { isRateLimited, authLimiter } from "@/lib/ratelimit";
import { randomBytes } from "crypto";

function generateReferralCode(): string {
  // 8-character A-Z0-9 (no I, O, 0, 1 for readability)
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(8);
  let code = "";
  for (let i = 0; i < 8; i++) code += alphabet[bytes[i] % alphabet.length];
  return code;
}

async function generateUniqueReferralCode(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const code = generateReferralCode();
    const existing = await prisma.user.findUnique({ where: { referralCode: code }, select: { id: true } });
    if (!existing) return code;
  }
  return generateReferralCode() + randomBytes(2).toString("hex").toUpperCase();
}

export async function POST(req: NextRequest) {
  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > 16_384) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "127.0.0.1";
  const limited = await isRateLimited(authLimiter, `signup:${ip}`);
  if (limited) {
    return NextResponse.json({ error: "Too many signup attempts. Please try again later." }, { status: 429 });
  }

  try {
    const parsed = UserRegisterSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid signup details", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const { fullName, email, password, role } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered", code: "CONFLICT" }, { status: 409 });
    }

    const hashedPassword = await hash(password, 12);
    const referralCode = await generateUniqueReferralCode();

    const created = await prisma.user.create({
      data: { fullName, name: fullName, email: normalizedEmail, password: hashedPassword, role, referralCode },
      select: { id: true },
    });

    // T18: Handle referral (ref query param)
    const refCode = req.nextUrl.searchParams.get("ref")?.trim().toUpperCase();
    if (refCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: refCode },
        select: { id: true },
      });
      if (referrer && referrer.id !== created.id) {
        await prisma.referral.create({
          data: { referrerId: referrer.id, referredId: created.id },
        }).catch(() => null);
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
