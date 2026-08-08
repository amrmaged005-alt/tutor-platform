import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true,
      centerId: true,
      centerAccessLevel: true,
    },
  });
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (me.role !== "TUTOR" && me.role !== "CENTER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (me.role === "TUTOR" && me.centerId && me.centerAccessLevel !== "FULL") {
    return NextResponse.json(
      { error: "Your center manages payout information." },
      { status: 403 }
    );
  }

  const payouts = await prisma.payout.findMany({
    where: { recipientId: me.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      amountEgp: true,
      status: true,
      updatedAt: true,
      createdAt: true,
      bookingId: true,
      booking: { select: { class: { select: { title: true } } } },
    },
  });

  let pendingAmount = 0;
  let processingAmount = 0;
  let paidTotal = 0;
  for (const p of payouts) {
    if (p.status === "PENDING") pendingAmount += p.amountEgp;
    else if (p.status === "PROCESSING") processingAmount += p.amountEgp;
    else if (p.status === "PAID") paidTotal += p.amountEgp;
  }

  // Next payout date: 1st of next month
  const now = new Date();
  const nextPayoutDate = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

  return NextResponse.json({
    pendingAmount,
    processingAmount,
    paidTotal,
    nextPayoutDate,
    payouts: payouts.map((p) => ({
      id: p.id,
      amount: p.amountEgp,
      status: p.status,
      paidAt: p.status === "PAID" ? p.updatedAt : null,
      createdAt: p.createdAt,
      bookingId: p.bookingId,
      classTitle: p.booking?.class?.title ?? null,
    })),
  });
}
