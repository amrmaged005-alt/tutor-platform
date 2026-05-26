import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const uid = session.user.id;

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
      return { ...t, unreadCount: unread };
    })
  );

  return NextResponse.json(withUnread);
}
