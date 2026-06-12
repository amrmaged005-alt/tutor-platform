import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const ProfileSchema = z.object({
  fullName: z.string().trim().min(1).max(120).optional(),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
  subjects: z.array(z.string().trim().min(1).max(60)).max(20).optional(),
  photoUrl: z.string().trim().url().max(2048).optional().or(z.literal("")),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, fullName: true, name: true, email: true, phone: true, bio: true, subjects: true, photoUrl: true, role: true },
  });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = ProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid profile data." }, { status: 400 });
  }
  const { fullName, phone, bio, subjects, photoUrl } = parsed.data;

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(fullName !== undefined && { fullName }),
      ...(phone !== undefined && { phone: phone || null }),
      ...(bio !== undefined && { bio: bio || null }),
      ...(subjects !== undefined && { subjects }),
      ...(photoUrl !== undefined && { photoUrl: photoUrl || null }),
    },
    select: { id: true, fullName: true, phone: true, bio: true, subjects: true, photoUrl: true },
  });

  return NextResponse.json({ ok: true, user: updated });
}
