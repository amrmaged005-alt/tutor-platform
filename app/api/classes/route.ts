import { NextResponse } from "next/server";
import { auth } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || (user.role !== "TUTOR" && user.role !== "CENTER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Only tutors and centers can create classes" }, { status: 403 });
    }

    const {
      title,
      subject,
      curriculum,
      gradeLevel,
      format,
      language,
      description,
      location,
      priceEgp,
      capacity,
      schedule,
    } = await req.json();

    if (!title || !subject || priceEgp === undefined || priceEgp === null) {
      return NextResponse.json({ error: "Title, subject and price are required" }, { status: 400 });
    }

    const newClass = await prisma.class.create({
      data: {
        title,
        subject,
        curriculum:  curriculum  ?? "NATIONAL",
        gradeLevel:  gradeLevel  ?? null,
        format:      format      ?? "IN_PERSON",
        language:    language    ?? "Arabic",
        description: description ?? null,
        location:    location    ?? null,
        city: "Cairo",
        priceEgp:    Number(priceEgp),
        capacity:    capacity ? Number(capacity) : null,
        schedule:    schedule    ?? null,
        isOnline:    format === "ONLINE",
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
