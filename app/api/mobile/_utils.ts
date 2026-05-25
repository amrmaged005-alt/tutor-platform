import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);

export type MobileUser = {
  id: string;
  email: string | null;
  name: string;
  role: "STUDENT" | "TUTOR" | "CENTER_ADMIN" | "ADMIN";
};

export async function requireMobileUser(req: NextRequest): Promise<MobileUser | NextResponse> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";

  if (!token) {
    return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  }

  try {
    const verified = await jwtVerify(token, secret);
    const userId = verified.payload.sub;
    if (!userId) {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        name: true,
        role: true,
        isSuspended: true,
      },
    });

    if (!user || user.isSuspended) {
      return NextResponse.json({ error: "Account is not available." }, { status: 401 });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.fullName ?? user.name ?? "",
      role: user.role,
    };
  } catch {
    return NextResponse.json({ error: "Session expired. Please sign in again." }, { status: 401 });
  }
}

export function classSelect() {
  return {
    id: true,
    title: true,
    subject: true,
    description: true,
    city: true,
    location: true,
    priceEgp: true,
    capacity: true,
    schedule: true,
    format: true,
    paymentType: true,
    curriculum: true,
    gradeLevel: true,
    language: true,
    center: { select: { id: true, name: true, city: true } },
    owner: {
      select: {
        id: true,
        fullName: true,
        name: true,
        photoUrl: true,
        isVerified: true,
      },
    },
    tutors: {
      select: {
        tutor: {
          select: {
            id: true,
            fullName: true,
            name: true,
            photoUrl: true,
            isVerified: true,
          },
        },
      },
    },
    reviews: { select: { rating: true } },
    _count: { select: { bookings: { where: { status: { not: "CANCELLED" } } } } },
  } as const;
}

type MobileTutorEntry = {
  tutor: {
    id: string;
    fullName: string | null;
    name: string | null;
    photoUrl: string | null;
    isVerified: boolean;
  };
};

type MobileClassRecord = {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  city: string;
  location: string | null;
  priceEgp: number;
  capacity: number | null;
  schedule: string | null;
  format: string;
  paymentType: string;
  curriculum: string;
  gradeLevel: string | null;
  language: string;
  center: { id: string; name: string; city: string } | null;
  owner: {
    id: string;
    fullName: string | null;
    name: string | null;
    photoUrl: string | null;
    isVerified: boolean;
  } | null;
  tutors: MobileTutorEntry[];
  reviews: { rating: number }[];
  _count: { bookings: number };
};

export function serializeClass(cls: MobileClassRecord) {
  const reviews = cls.reviews ?? [];
  const avgRating = reviews.length
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : null;

  return {
    id: cls.id,
    title: cls.title,
    subject: cls.subject,
    description: cls.description,
    city: cls.city,
    location: cls.location,
    priceEgp: cls.priceEgp,
    capacity: cls.capacity,
    schedule: cls.schedule,
    format: cls.format,
    paymentType: cls.paymentType,
    curriculum: cls.curriculum,
    gradeLevel: cls.gradeLevel,
    language: cls.language,
    center: cls.center,
    owner: cls.owner,
    tutors: (cls.tutors ?? []).map((entry) => entry.tutor),
    bookingsCount: cls._count?.bookings ?? 0,
    spotsLeft: cls.capacity === null || cls.capacity === undefined
      ? null
      : Math.max(cls.capacity - (cls._count?.bookings ?? 0), 0),
    avgRating,
    reviewCount: reviews.length,
  };
}

export type SerializedClass = ReturnType<typeof serializeClass>;
export type { MobileClassRecord };
