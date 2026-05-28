import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { role: true },
  });
  return user?.role === "ADMIN" ? { adminId: session.user.id } : null;
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await requireAdmin(id);
  if (!admin) {
    return NextResponse.json({ error: "Admin access required", code: "FORBIDDEN" }, { status: 403 });
  }

  try {
    const booking = await prisma.booking.findUnique({
      where:  { id },
      select: { id: true, paymentStatus: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found", code: "NOT_FOUND" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.booking.update({
        where: { id },
        data:  { paymentStatus: "REFUNDED", refundedAt: new Date() },
      }),
      prisma.auditLog.create({
        data: {
          actorId:    admin.adminId,
          actorRole:  "ADMIN",
          action:     "refund.approved",
          targetType: "Booking",
          targetId:   id,
        },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/admin/refund-requests/[id]/approve] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
