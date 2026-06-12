import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type SearchType = "all" | "classes" | "tutors" | "centers";

function rankByRelevance<T extends { _exact: number }>(items: T[]): T[] {
  return items.sort((a, b) => b._exact - a._exact);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const typeParam = (searchParams.get("type") ?? "all").toLowerCase() as SearchType;
  const type: SearchType = ["all", "classes", "tutors", "centers"].includes(typeParam) ? typeParam : "all";

  if (q.length < 2) {
    return NextResponse.json({ classes: [], tutors: [], centers: [], totalResults: 0 });
  }

  const limit = type === "all" ? 5 : 20;
  const qLower = q.toLowerCase();

  try {
    const [classes, tutors, centers] = await Promise.all([
      type === "all" || type === "classes"
        ? prisma.class.findMany({
            where: {
              isActive: true,
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { subject: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
              ],
            },
            select: {
              id: true,
              title: true,
              subject: true,
              priceEgp: true,
              city: true,
              _count: { select: { bookings: true } },
            },
            take: limit * 2,
          })
        : Promise.resolve([] as Array<{ id: string; title: string; subject: string; priceEgp: number; city: string; _count: { bookings: number } }>),
      type === "all" || type === "tutors"
        ? prisma.user.findMany({
            where: {
              role: { in: ["TUTOR", "CENTER_ADMIN"] },
              isSuspended: false,
              OR: [
                { fullName: { contains: q, mode: "insensitive" } },
                { bio: { contains: q, mode: "insensitive" } },
                { subjects: { has: q } },
              ],
            },
            select: { id: true, fullName: true, name: true, bio: true, subjects: true, photoUrl: true },
            take: limit * 2,
          })
        : Promise.resolve([] as Array<{ id: string; fullName: string | null; name: string | null; bio: string | null; subjects: string[]; photoUrl: string | null }>),
      type === "all" || type === "centers"
        ? prisma.learningCenter.findMany({
            where: {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
                { city: { contains: q, mode: "insensitive" } },
              ],
            },
            select: { id: true, name: true, description: true, city: true, logoUrl: true },
            take: limit * 2,
          })
        : Promise.resolve([] as Array<{ id: string; name: string; description: string | null; city: string; logoUrl: string | null }>),
    ]);

    const rankedClasses = rankByRelevance(
      classes.map((c) => ({ ...c, _exact: c.title.toLowerCase() === qLower ? 2 : c.title.toLowerCase().startsWith(qLower) ? 1 : 0 }))
    ).slice(0, limit);

    const rankedTutors = rankByRelevance(
      tutors.map((t) => {
        const display = (t.fullName ?? t.name ?? "").toLowerCase();
        return { ...t, _exact: display === qLower ? 2 : display.startsWith(qLower) ? 1 : 0 };
      })
    ).slice(0, limit);

    const rankedCenters = rankByRelevance(
      centers.map((c) => ({
        ...c,
        _exact: c.name.toLowerCase() === qLower ? 2 : c.name.toLowerCase().startsWith(qLower) ? 1 : 0,
      }))
    ).slice(0, limit);

    const totalResults = rankedClasses.length + rankedTutors.length + rankedCenters.length;

    // Log search query (fire-and-forget, non-blocking)
    const session = await auth();
    prisma.searchLog
      .create({
        data: {
          query: q.slice(0, 200),
          userId: session?.user?.id ?? null,
          resultCount: totalResults,
          type,
        },
      })
      .catch(() => null);

    // Strip internal scoring field
    const strip = <T extends { _exact: number }>(arr: T[]): Omit<T, "_exact">[] =>
      arr.map(({ _exact, ...rest }) => {
        void _exact;
        return rest;
      });

    return NextResponse.json({
      classes: strip(rankedClasses),
      tutors: strip(rankedTutors),
      centers: strip(rankedCenters),
      totalResults,
    });
  } catch (err) {
    console.error("[GET /api/search] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
