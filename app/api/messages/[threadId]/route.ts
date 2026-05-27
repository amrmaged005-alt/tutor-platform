import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isRateLimited, messageLimiter } from "@/lib/ratelimit";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const { threadId } = await params;
  const uid = session.user.id;

  try {
    const thread = await prisma.messageThread.findUnique({
      where: { id: threadId },
      include: {
        student: { select: { id: true, fullName: true, name: true, photoUrl: true } },
        tutor:   { select: { id: true, fullName: true, name: true, photoUrl: true } },
      },
    });

    if (!thread) {
      return NextResponse.json({ error: "Thread not found", code: "NOT_FOUND" }, { status: 404 });
    }

    if (thread.studentId !== uid && thread.tutorId !== uid) {
      return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where:   { threadId },
      orderBy: { createdAt: "asc" },
    });

    // Mark messages from other party as read
    await prisma.message.updateMany({
      where: { threadId, senderId: { not: uid }, isRead: false },
      data:  { isRead: true },
    });

    const otherUser = thread.studentId === uid ? thread.tutor : thread.student;
    return NextResponse.json({ thread: { ...thread, otherUser }, messages });
  } catch (err) {
    console.error("[GET /api/messages/[threadId]] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const limited = await isRateLimited(messageLimiter, session.user.id);
  if (limited) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  const { threadId } = await params;
  const uid = session.user.id;

  const body    = await req.json().catch(() => null);
  const content = typeof body?.content === "string" ? body.content.slice(0, 2000).trim() : "";

  if (!content) {
    return NextResponse.json({ error: "Content is required", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  try {
    const thread = await prisma.messageThread.findUnique({
      where:  { id: threadId },
      select: { id: true, studentId: true, tutorId: true },
    });

    if (!thread) {
      return NextResponse.json({ error: "Thread not found", code: "NOT_FOUND" }, { status: 404 });
    }

    if (thread.studentId !== uid && thread.tutorId !== uid) {
      return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
    }

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: { threadId, senderId: uid, content },
      }),
      prisma.messageThread.update({
        where: { id: threadId },
        data:  { updatedAt: new Date() },
      }),
    ]);

    return NextResponse.json(message, { status: 201 });
  } catch (err) {
    console.error("[POST /api/messages/[threadId]] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
