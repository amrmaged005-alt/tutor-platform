import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { ClassCreateSchema } from "@/schemas/class";
import { isRateLimited, generalLimiter } from "@/lib/ratelimit";

function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const contentLength = Number(req.headers.get("content-length") ?? 0);
    if (contentLength > 32_768) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const limited = await isRateLimited(generalLimiter, `class:${session.user.id ?? session.user.email}`);
    if (limited) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || (user.role !== "TUTOR" && user.role !== "CENTER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Only tutors and centers can create classes" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = ClassCreateSchema.safeParse({
      ...body,
      city: body.city ?? "Cairo",
      description: body.description || undefined,
      location: body.location || undefined,
      schedule: body.schedule || undefined,
      gradeLevel: body.gradeLevel || undefined,
      capacity: body.capacity ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid class details" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const newClass = await prisma.class.create({
      data: {
        title:       data.title,
        subject:     data.subject,
        curriculum:  data.curriculum,
        gradeLevel:  data.gradeLevel ?? null,
        format:      data.format,
        language:    data.language,
        description: data.description ?? null,
        location:    data.location ?? null,
        city:        data.city,
        priceEgp:    data.priceEgp,
        capacity:    data.capacity,
        schedule:    data.schedule ?? null,
        isOnline:    data.format === "ONLINE",
        paymentType: data.format === "ONLINE" ? "ONLINE" : "IN_PERSON",
        ownerId: user.id,
        tutors: {
          create: [{ tutorId: user.id }],
        },
      },
    });

    return NextResponse.json({ success: true, class: newClass });
  } catch (error) {
    console.error("Create class error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
