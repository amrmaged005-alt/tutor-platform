import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { hash } from "bcryptjs";
import { UserRegisterSchema } from "@/schemas/user";
import { isRateLimited, authLimiter } from "@/lib/ratelimit";

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
        { error: parsed.error.issues[0]?.message ?? "Invalid signup details" },
        { status: 400 }
      );
    }

    const { fullName, email, password, role } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashedPassword = await hash(password, 12);

    await prisma.user.create({
      data: {
        fullName,
        name: fullName,
        email: normalizedEmail,
        password: hashedPassword,
        role,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
