import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ count: 0 });
  }

  const count = await prisma.message.count({
    where: {
      isRead: false,
      senderId: { not: session.user.id },
      thread: {
        OR: [{ studentId: session.user.id }, { tutorId: session.user.id }],
      },
    },
  });

  return NextResponse.json({ count });
}
