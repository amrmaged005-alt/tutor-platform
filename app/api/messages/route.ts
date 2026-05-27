import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isRateLimited, messageLimiter } from "@/lib/ratelimit";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const uid = session.user.id;

  try {
    const threads = await prisma.messageThread.findMany({
      where: {
        OR: [{ studentId: uid }, { tutorId: uid }],
      },
      orderBy: { updatedAt: "desc" },
      include: {
        student: { select: { id: true, fullName: true, name: true, photoUrl: true } },
        tutor:   { select: { id: true, fullName: true, name: true, photoUrl: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    const withUnread = await Promise.all(
      threads.map(async (t) => {
        const unread = await prisma.message.count({
          where: { threadId: t.id, isRead: false, senderId: { not: uid } },
        });
        const lastMessage = t.messages[0] ?? null;
        const otherUser = t.studentId === uid ? t.tutor : t.student;
        return { id: t.id, updatedAt: t.updatedAt, lastMessage, otherUser, unreadCount: unread };
      })
    );

    return NextResponse.json(withUnread);
  } catch (err) {
    console.error("[GET /api/messages] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const limited = await isRateLimited(messageLimiter, session.user.id);
  if (limited) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const threadId = typeof body?.threadId === "string" ? body.threadId : "";
  const content = typeof body?.content === "string" ? body.content.slice(0, 2000).trim() : "";

  if (!threadId || !content) {
    return NextResponse.json({ error: "threadId and content are required", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const uid = session.user.id;

  try {
    const thread = await prisma.messageThread.findUnique({
      where: { id: threadId },
      select: { studentId: true, tutorId: true },
    });

    if (!thread) return NextResponse.json({ error: "Thread not found", code: "NOT_FOUND" }, { status: 404 });
    if (thread.studentId !== uid && thread.tutorId !== uid) {
      return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
    }

    const [message] = await prisma.$transaction([
      prisma.message.create({ data: { threadId, senderId: uid, content, isRead: false } }),
      prisma.messageThread.update({ where: { id: threadId }, data: { updatedAt: new Date() } }),
    ]);

    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/messages] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
