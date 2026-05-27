import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMobileUser } from "../_utils";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  createdAt: Date;
  read: boolean;
};

export async function GET(req: NextRequest) {
  const user = await requireMobileUser(req);
  if (user instanceof NextResponse) return user;

  // Pull recent audit logs and booking transitions to build the notification feed
  const [auditLogs, recentBookings] = await Promise.all([
    prisma.auditLog.findMany({
      where: {
        OR: [{ actorId: user.id }, { targetType: "Booking", targetId: { not: null } }],
        action: {
          in: ["payment.received", "payment.failed", "payment.refunded", "booking.cancelled", "review.created"],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        id: true,
        action: true,
        targetType: true,
        targetId: true,
        createdAt: true,
        metadata: true,
      },
    }),
    prisma.booking.findMany({
      where: { studentId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        updatedAt: true,
        class: { select: { title: true } },
      },
    }),
  ]);

  // Filter audit logs to only those affecting this user's bookings
  const myBookingIds = new Set(recentBookings.map((b) => b.id));
  const filteredLogs = auditLogs.filter(
    (l) => l.targetType !== "Booking" || !l.targetId || myBookingIds.has(l.targetId)
  );

  const notifications: Notification[] = [];

  for (const b of recentBookings) {
    if (b.paymentStatus === "PAID") {
      notifications.push({
        id: `bk-${b.id}-confirmed`,
        type: "booking_confirmed",
        title: "Booking confirmed",
        body: `Your booking for ${b.class.title} is confirmed.`,
        createdAt: b.updatedAt,
        read: false,
      });
    } else if (b.paymentStatus === "FAILED") {
      notifications.push({
        id: `bk-${b.id}-failed`,
        type: "booking_failed",
        title: "Payment failed",
        body: `Your payment for ${b.class.title} did not go through.`,
        createdAt: b.updatedAt,
        read: false,
      });
    }
  }

  for (const log of filteredLogs) {
    if (log.action === "review.created") {
      notifications.push({
        id: `audit-${log.id}`,
        type: "review_received",
        title: "New review",
        body: "A student left you a new review.",
        createdAt: log.createdAt,
        read: false,
      });
    }
  }

  // Deduplicate + sort newest first, cap at 30
  const seen = new Set<string>();
  const deduped = notifications
    .filter((n) => (seen.has(n.id) ? false : seen.add(n.id)))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 30);

  return NextResponse.json({ notifications: deduped });
}
