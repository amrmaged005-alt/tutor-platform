import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { classSelect, serializeClass, type MobileClassRecord, type SerializedClass } from "../_utils";

type TutorRecord = {
  id: string;
  fullName: string | null;
  name: string | null;
  bio: string | null;
  subjects: string[];
  photoUrl: string | null;
  isVerified: boolean;
  center: { id: string; name: string; city: string | null } | null;
  ownedClasses: MobileClassRecord[];
};

function serializeTutor(tutor: TutorRecord, includeClasses = false) {
  const classes = (tutor.ownedClasses ?? []).map(serializeClass);
  const reviewRatings = classes.flatMap((cls: SerializedClass) =>
    cls.avgRating === null ? [] : Array(cls.reviewCount).fill(cls.avgRating)
  );
  const avgRating = reviewRatings.length
    ? Math.round((reviewRatings.reduce((sum, rating) => sum + rating, 0) / reviewRatings.length) * 10) / 10
    : null;

  return {
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
    avgRating,
    reviewCount: reviewRatings.length,
    classes: includeClasses ? classes : undefined,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim() ?? "";
  const subject = searchParams.get("subject")?.trim() ?? "";
  const includeClasses = searchParams.get("includeClasses") === "1";

  const tutors = await prisma.user.findMany({
    where: {
      role: { in: ["TUTOR", "CENTER_ADMIN"] },
      isSuspended: false,
      ...(subject ? { subjects: { has: subject } } : {}),
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
              { bio: { contains: search, mode: "insensitive" } },
              { subjects: { has: search } },
              { center: { name: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
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
        take: includeClasses ? 20 : 6,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ tutors: tutors.map((tutor) => serializeTutor(tutor, includeClasses)) });
}
