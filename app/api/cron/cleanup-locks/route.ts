import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { log } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expected = process.env.CRON_SECRET;

  if (!expected) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });
  }

  if (authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const expired = await prisma.booking.findMany({
    where: {
      paymentStatus: "UNPAID",
      lockedUntil: { lt: now, not: null },
      status: "PENDING",
    },
    select: { id: true, promoCode: true },
  });

  if (expired.length === 0) {
    return NextResponse.json({ cleaned: 0 });
  }

  const cleanedIds = await prisma.$transaction(async (tx) => {
    const cleaned: string[] = [];
    for (const booking of expired) {
      const result = await tx.booking.updateMany({
        where: {
          id: booking.id,
          status: "PENDING",
          paymentStatus: "UNPAID",
          lockedUntil: { lt: now, not: null },
        },
        data: {
          lockedAt: null,
          lockedUntil: null,
          status: "CANCELLED",
        },
      });
      if (result.count !== 1) continue;

      cleaned.push(booking.id);
      if (booking.promoCode) {
        await tx.promoCode.updateMany({
          where: { code: booking.promoCode, usedCount: { gt: 0 } },
          data: { usedCount: { decrement: 1 } },
        });
      }
    }
    return cleaned;
  });

  await Promise.all(
    cleanedIds.map((id) =>
      log({
        action: "booking.expired",
        targetType: "Booking",
        targetId: id,
        metadata: { reason: "seat lock expired" },
      })
    )
  );

  return NextResponse.json({ cleaned: cleanedIds.length });
}
