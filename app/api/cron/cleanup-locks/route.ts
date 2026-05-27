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
      status: { not: "CANCELLED" },
    },
    select: { id: true },
  });

  if (expired.length === 0) {
    return NextResponse.json({ cleaned: 0 });
  }

  const ids = expired.map((b) => b.id);
  await prisma.booking.updateMany({
    where: { id: { in: ids } },
    data: {
      lockedAt: null,
      lockedUntil: null,
      status: "CANCELLED",
    },
  });

  await Promise.all(
    ids.map((id) =>
      log({
        action: "booking.expired",
        targetType: "Booking",
        targetId: id,
        metadata: { reason: "seat lock expired" },
      })
    )
  );

  return NextResponse.json({ cleaned: ids.length });
}
