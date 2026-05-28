import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function guardCenter(centerId: string) {
  const session = await auth();
  if (!session?.user?.id)
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, centerId: true },
  });
  if (!me) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const ok = me.role === "ADMIN" || (me.role === "CENTER_ADMIN" && me.centerId === centerId);
  if (!ok) return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { me };
}

function periodStart(period: string): Date {
  const now = new Date();
  if (period === "year") return new Date(now.getFullYear(), 0, 1);
  if (period === "quarter") return new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  // default: month
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const guard = await guardCenter(id);
  if (guard.error) return guard.error;

  const url = new URL(req.url);
  const period = url.searchParams.get("period") ?? "month";
  const start = periodStart(period);

  const centerClasses = await prisma.class.findMany({
    where: { centerId: id },
    select: { id: true, title: true, ownerId: true },
  });
  const centerClassIds = centerClasses.map((c) => c.id);

  if (centerClassIds.length === 0) {
    return NextResponse.json({
      grossRevenue: 0, platformFee: 0, netRevenue: 0,
      revenueByClass: [], revenueByTutor: [], revenueByMonth: [],
    });
  }

  const bookings = await prisma.booking.findMany({
    where: {
      classId: { in: centerClassIds },
      paymentStatus: "PAID",
      paidAt: { gte: start },
    },
    select: {
      classId: true,
      amountEgp: true,
      platformFeeEgp: true,
      paidAt: true,
    },
  });

  const grossRevenue = bookings.reduce((s, b) => s + (b.amountEgp ?? 0), 0);
  const platformFee = bookings.reduce((s, b) => s + (b.platformFeeEgp ?? 0), 0);
  const netRevenue = grossRevenue - platformFee;

  // Revenue by class
  const classTotals = new Map<string, number>();
  const classBookings = new Map<string, number>();
  for (const b of bookings) {
    classTotals.set(b.classId, (classTotals.get(b.classId) ?? 0) + (b.amountEgp ?? 0));
    classBookings.set(b.classId, (classBookings.get(b.classId) ?? 0) + 1);
  }
  const classById = Object.fromEntries(centerClasses.map((c) => [c.id, c]));
  const revenueByClass = Array.from(classTotals.entries())
    .map(([cid, rev]) => ({
      classId: cid,
      classTitle: classById[cid]?.title ?? cid,
      revenue: rev,
      bookingCount: classBookings.get(cid) ?? 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Revenue by tutor (class owner)
  const tutorTotals = new Map<string, number>();
  const tutorClassCount = new Map<string, Set<string>>();
  for (const b of bookings) {
    const ownerId = classById[b.classId]?.ownerId;
    if (!ownerId) continue;
    tutorTotals.set(ownerId, (tutorTotals.get(ownerId) ?? 0) + (b.amountEgp ?? 0));
    if (!tutorClassCount.has(ownerId)) tutorClassCount.set(ownerId, new Set());
    tutorClassCount.get(ownerId)!.add(b.classId);
  }
  const tutorIds = Array.from(tutorTotals.keys());
  const tutors = tutorIds.length
    ? await prisma.user.findMany({
        where: { id: { in: tutorIds } },
        select: { id: true, fullName: true, name: true },
      })
    : [];
  const tutorName = (tid: string) => {
    const t = tutors.find((x) => x.id === tid);
    return t?.fullName ?? t?.name ?? "Tutor";
  };
  const revenueByTutor = Array.from(tutorTotals.entries())
    .map(([tid, rev]) => ({
      tutorId: tid,
      tutorName: tutorName(tid),
      revenue: rev,
      classCount: tutorClassCount.get(tid)?.size ?? 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Revenue by month (last 12 months always, within period)
  const monthMap = new Map<string, number>();
  for (const b of bookings) {
    if (!b.paidAt) continue;
    const key = `${b.paidAt.getFullYear()}-${String(b.paidAt.getMonth() + 1).padStart(2, "0")}`;
    monthMap.set(key, (monthMap.get(key) ?? 0) + (b.amountEgp ?? 0));
  }
  const revenueByMonth = Array.from(monthMap.entries())
    .map(([month, revenue]) => ({ month, revenue }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return NextResponse.json({
    grossRevenue,
    platformFee,
    netRevenue,
    revenueByClass,
    revenueByTutor,
    revenueByMonth,
  });
}
