import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { role: true },
  });
  return user?.role === "ADMIN" ? session.user : null;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Admin access required", code: "FORBIDDEN" }, { status: 403 });
  }

  try {
    const reviews = await prisma.review.findMany({
      where:   { isApproved: false },
      include: {
        student: { select: { id: true, fullName: true, name: true } },
        class:   { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
  } catch (err) {
    console.error("[GET /api/admin/reviews/pending] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
