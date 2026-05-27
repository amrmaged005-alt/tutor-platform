import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CONFIG_DEFAULTS } from "@/lib/config";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const u = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  return u?.role === "ADMIN" ? session : null;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const stored = await prisma.platformConfig.findMany({
    select: { key: true, value: true, updatedAt: true },
  });
  const storedMap = new Map(stored.map((s) => [s.key, s]));

  const entries = Object.keys(CONFIG_DEFAULTS).map((key) => {
    const s = storedMap.get(key);
    return {
      key,
      value: s?.value ?? CONFIG_DEFAULTS[key],
      isDefault: !s,
      updatedAt: s?.updatedAt ?? null,
    };
  });

  // Include any extra keys stored that aren't in defaults
  for (const s of stored) {
    if (!(s.key in CONFIG_DEFAULTS)) {
      entries.push({ key: s.key, value: s.value, isDefault: false, updatedAt: s.updatedAt });
    }
  }

  return NextResponse.json({ config: entries });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const key = typeof body?.key === "string" ? body.key : "";
  const value = typeof body?.value === "string" ? body.value : "";

  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });
  if (!(key in CONFIG_DEFAULTS)) {
    return NextResponse.json({ error: "Unknown config key" }, { status: 400 });
  }
  if (!value) return NextResponse.json({ error: "value required" }, { status: 400 });

  // Range validation for known numeric keys
  const n = parseInt(value, 10);
  if (key === "platform_fee_pct" && (!Number.isFinite(n) || n < 0 || n > 100)) {
    return NextResponse.json({ error: "platform_fee_pct must be 0-100" }, { status: 400 });
  }
  if (key === "min_booking_lead_hours" && (!Number.isFinite(n) || n < 0)) {
    return NextResponse.json({ error: "min_booking_lead_hours must be >= 0" }, { status: 400 });
  }
  if (key === "max_active_classes_per_tutor" && (!Number.isFinite(n) || n < 1)) {
    return NextResponse.json({ error: "max_active_classes_per_tutor must be >= 1" }, { status: 400 });
  }
  if (key === "waitlist_notification_hours" && (!Number.isFinite(n) || n < 1)) {
    return NextResponse.json({ error: "waitlist_notification_hours must be >= 1" }, { status: 400 });
  }

  const updated = await prisma.platformConfig.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });

  return NextResponse.json({ ok: true, entry: updated });
}
