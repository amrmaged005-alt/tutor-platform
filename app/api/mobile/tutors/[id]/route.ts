import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { classSelect, serializeClass } from "../../_utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const tutor = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      name: true,
      bio: true,
      subjects: true,
      photoUrl: true,
      isVerified: true,
      center: { select: { id: true, name: true, city: true } },
      ownedClasses: {
        where: { isActive: true },
        select: classSelect(),
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!tutor) {
    return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
  }

  const classes = tutor.ownedClasses.map(serializeClass);
  const ratings = classes.flatMap((cls) => cls.avgRating === null ? [] : Array(cls.reviewCount).fill(cls.avgRating));

  return NextResponse.json({
    tutor: {
      id: tutor.id,
      fullName: tutor.fullName,
      name: tutor.name,
      bio: tutor.bio,
      subjects: tutor.subjects,
      photoUrl: tutor.photoUrl,
      isVerified: tutor.isVerified,
      city: tutor.center?.city ?? "Cairo",
      center: tutor.center,
      classCount: classes.length,
      studentCount: classes.reduce((sum, cls) => sum + cls.bookingsCount, 0),
      avgRating: ratings.length
        ? Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10) / 10
        : null,
      reviewCount: ratings.length,
      classes,
    },
  });
}
