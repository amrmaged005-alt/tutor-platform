import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const { threadId } = await params;
  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    select: { studentId: true, tutorId: true },
  });

  if (!thread) return NextResponse.json({ error: "Thread not found", code: "NOT_FOUND" }, { status: 404 });
  if (thread.studentId !== session.user.id && thread.tutorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
  }

  await prisma.message.updateMany({
    where: { threadId, senderId: { not: session.user.id }, isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({ ok: true });
}
