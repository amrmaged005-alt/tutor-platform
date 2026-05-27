import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMobileUser } from "../_utils";

export async function GET(req: NextRequest) {
  const user = await requireMobileUser(req);
  if (user instanceof NextResponse) return user;

  const [classFavs, tutorFavs] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId: user.id, classId: { not: null } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        class: {
          select: {
            id: true,
            title: true,
            subject: true,
            priceEgp: true,
            city: true,
          },
        },
      },
    }),
    prisma.favorite.findMany({
      where: { userId: user.id, tutorId: { not: null } },
      orderBy: { createdAt: "desc" },
      select: { id: true, tutorId: true },
    }),
  ]);

  const tutorIds = tutorFavs.map((f) => f.tutorId).filter((id): id is string => Boolean(id));
  const tutors = tutorIds.length
    ? await prisma.user.findMany({
        where: { id: { in: tutorIds } },
        select: { id: true, fullName: true, name: true, photoUrl: true, subjects: true },
      })
    : [];

  return NextResponse.json({
    classes: classFavs.map((f) => ({ favoriteId: f.id, ...f.class })),
    tutors: tutorFavs.map((f) => {
      const t = tutors.find((u) => u.id === f.tutorId);
      return {
        favoriteId: f.id,
        id: f.tutorId,
        name: t?.fullName ?? t?.name ?? "Tutor",
        photoUrl: t?.photoUrl ?? null,
        subjects: t?.subjects ?? [],
      };
    }),
  });
}

export async function POST(req: NextRequest) {
  const user = await requireMobileUser(req);
  if (user instanceof NextResponse) return user;

  const body = await req.json().catch(() => null);
  const type = body?.type === "tutor" ? "tutor" : body?.type === "class" ? "class" : null;
  const id = typeof body?.id === "string" ? body.id : "";
  if (!type || !id) {
    return NextResponse.json({ error: "type and id are required" }, { status: 400 });
  }

  const data = type === "class" ? { userId: user.id, classId: id } : { userId: user.id, tutorId: id };
  try {
    const fav = await prisma.favorite.create({ data });
    return NextResponse.json({ ok: true, favoriteId: fav.id });
  } catch {
    return NextResponse.json({ ok: true, alreadyExists: true });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await requireMobileUser(req);
  if (user instanceof NextResponse) return user;

  const body = await req.json().catch(() => null);
  const type = body?.type === "tutor" ? "tutor" : body?.type === "class" ? "class" : null;
  const id = typeof body?.id === "string" ? body.id : "";
  if (!type || !id) {
    return NextResponse.json({ error: "type and id are required" }, { status: 400 });
  }

  if (type === "class") {
    await prisma.favorite.deleteMany({ where: { userId: user.id, classId: id } });
  } else {
    await prisma.favorite.deleteMany({ where: { userId: user.id, tutorId: id } });
  }

  return NextResponse.json({ ok: true });
}
