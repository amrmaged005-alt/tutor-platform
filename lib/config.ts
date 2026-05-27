import { prisma } from "./prisma";

export const CONFIG_DEFAULTS: Record<string, string> = {
  platform_fee_pct: "10",
  min_booking_lead_hours: "2",
  max_active_classes_per_tutor: "20",
  waitlist_notification_hours: "24",
};

export async function getConfig(key: string): Promise<string | null> {
  try {
    const entry = await prisma.platformConfig.findUnique({ where: { key } });
    if (entry) return entry.value;
  } catch {
    // table may not exist yet during migration
  }
  return CONFIG_DEFAULTS[key] ?? null;
}

export async function getPlatformFeePct(): Promise<number> {
  const val = await getConfig("platform_fee_pct");
  const n = val ? parseInt(val, 10) : 10;
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : 10;
}

export async function getMinBookingLeadHours(): Promise<number> {
  const val = await getConfig("min_booking_lead_hours");
  const n = val ? parseInt(val, 10) : 2;
  return Number.isFinite(n) && n >= 0 ? n : 2;
}

export async function getMaxActiveClassesPerTutor(): Promise<number> {
  const val = await getConfig("max_active_classes_per_tutor");
  const n = val ? parseInt(val, 10) : 20;
  return Number.isFinite(n) && n >= 1 ? n : 20;
}

export async function getWaitlistNotificationHours(): Promise<number> {
  const val = await getConfig("waitlist_notification_hours");
  const n = val ? parseInt(val, 10) : 24;
  return Number.isFinite(n) && n >= 1 ? n : 24;
}
