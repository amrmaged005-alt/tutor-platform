import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const role = body?.role as string | undefined;

  if (!role || !["STUDENT", "TUTOR", "CENTER_ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Invalid role", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { role: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found", code: "NOT_FOUND" }, { status: 404 });
  }

  if (user.role === "ADMIN") {
    return NextResponse.json({ error: "Cannot change admin role", code: "FORBIDDEN" }, { status: 403 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data:  { role: role as "STUDENT" | "TUTOR" | "CENTER_ADMIN" },
  });

  return NextResponse.json({ ok: true });
}
