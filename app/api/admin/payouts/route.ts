import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { log } from "@/lib/audit";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const u = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, role: true } });
  return u?.role === "ADMIN" ? u : null;
}

const ALLOWED_STATUSES = ["PROCESSING", "PAID", "FAILED"] as const;
type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const payouts = await prisma.payout.findMany({
    where: { status: { in: ["PENDING", "PROCESSING"] } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      amountEgp: true,
      status: true,
      failureReason: true,
      createdAt: true,
      recipient: { select: { id: true, fullName: true, name: true, email: true } },
      booking: { select: { id: true, class: { select: { title: true } } } },
    },
  });

  return NextResponse.json({ payouts });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const payoutId = typeof body?.payoutId === "string" ? body.payoutId : "";
  const status = String(body?.status ?? "") as AllowedStatus;
  const failureReason = typeof body?.failureReason === "string" ? body.failureReason.slice(0, 500) : null;

  if (!payoutId || !ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid payoutId or status" }, { status: 400 });
  }

  const existing = await prisma.payout.findUnique({ where: { id: payoutId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.payout.update({
    where: { id: payoutId },
    data: {
      status,
      failureReason: status === "FAILED" ? failureReason : null,
    },
  });

  const auditAction =
    status === "PROCESSING" ? "payout.processing" :
    status === "PAID" ? "payout.paid" :
    "payout.failed";

  await log({
    actorId: admin.id,
    action: auditAction,
    targetType: "Payout",
    targetId: payoutId,
    metadata: { previousStatus: existing.status, amountEgp: existing.amountEgp, failureReason },
  });

  return NextResponse.json({ ok: true, payout: updated });
}
