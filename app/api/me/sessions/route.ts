import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { log } from "@/lib/audit";

// Revoke every active session by bumping sessionVersion. The jwt callback
// compares the token's version against this and drops any stale session —
// including the caller's, so the client should redirect to /login afterwards.
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { sessionVersion: { increment: 1 } },
  });

  await log({
    action: "user.sessions_revoked",
    actorId: session.user.id,
    targetType: "User",
    targetId: session.user.id,
  }).catch(() => {});

  return NextResponse.json({ success: true });
}
