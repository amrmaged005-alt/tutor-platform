import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
    if (!isSameOrigin(req)) {
        return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
    }

    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
        }

        const adminUser = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!adminUser || adminUser.role !== "ADMIN") {
            return NextResponse.json({ error: "Admin access required", code: "FORBIDDEN" }, { status: 403 });
        }

        const body = await req.json();
        const { userId, isVerified } = body;

        if (typeof userId !== "string" || typeof isVerified !== "boolean") {
            return NextResponse.json({ error: "Invalid payload", code: "VALIDATION_ERROR" }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { isVerified },
        });

        return NextResponse.json({
            success: true,
            user: { id: updatedUser.id, isVerified: updatedUser.isVerified },
        });
    } catch {
        return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
    }
}
