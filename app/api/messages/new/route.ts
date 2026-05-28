import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isRateLimited, messageLimiter } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const limited = await isRateLimited(messageLimiter, session.user.id);
  if (limited) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  try {
    const user = await prisma.user.findUnique({
      where:  { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "STUDENT") {
      return NextResponse.json({ error: "Only students can start message threads", code: "FORBIDDEN" }, { status: 403 });
    }

    const body    = await req.json().catch(() => null);
    const tutorId = typeof body?.tutorId === "string" ? body.tutorId : null;

    if (!tutorId) {
      return NextResponse.json({ error: "tutorId is required", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const tutor = await prisma.user.findUnique({
      where:  { id: tutorId },
      select: { id: true, role: true },
    });

    if (!tutor || (tutor.role !== "TUTOR" && tutor.role !== "CENTER_ADMIN")) {
      return NextResponse.json({ error: "Tutor not found", code: "NOT_FOUND" }, { status: 404 });
    }

    const thread = await prisma.messageThread.upsert({
      where:  { studentId_tutorId: { studentId: session.user.id, tutorId } },
      update: {},
      create: { studentId: session.user.id, tutorId },
    });

    return NextResponse.json({ threadId: thread.id });
  } catch (err) {
    console.error("[POST /api/messages/new] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
