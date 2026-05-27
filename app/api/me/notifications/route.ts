import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const NOTIFICATION_KEYS = [
  "notifyBookingConfirmed",
  "notifyBookingCancelled",
  "notifyNewMessage",
  "notifyWaitlistOpened",
  "notifyReviewReceived",
  "notifyPayoutProcessed",
  "notifyMarketingEmails",
] as const;

type NotificationKey = typeof NOTIFICATION_KEYS[number];

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: NOTIFICATION_KEYS.reduce((acc, k) => ({ ...acc, [k]: true }), {}) as Record<NotificationKey, true>,
  });

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ preferences: user });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const updates: Partial<Record<NotificationKey, boolean>> = {};
  for (const key of NOTIFICATION_KEYS) {
    if (key in body) {
      if (typeof body[key] !== "boolean") {
        return NextResponse.json({ error: `${key} must be a boolean` }, { status: 400 });
      }
      updates[key] = body[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid preference fields provided" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: updates,
    select: NOTIFICATION_KEYS.reduce((acc, k) => ({ ...acc, [k]: true }), {}) as Record<NotificationKey, true>,
  });

  return NextResponse.json({ ok: true, preferences: updated });
}
