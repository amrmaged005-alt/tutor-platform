"use server";

import { prisma } from "../../../../lib/prisma";
import { auth } from "../../../../lib/auth";
import { redirect } from "next/navigation";

export async function updateTutorProfile(
  tutorId: string,
  formData: FormData
) {
  const session = await auth();

  const tutor = await prisma.user.findUnique({ where: { id: tutorId } });
  if (!tutor || session?.user?.email !== tutor.email) {
    throw new Error("Unauthorized");
  }

  const fullName = (formData.get("fullName") as string)?.trim() || null;
  const bio = (formData.get("bio") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;

  // Parse subjects — sent as comma-separated string
  const subjectsRaw = (formData.get("subjects") as string) ?? "";
  const subjects = subjectsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  await (prisma.user as any).update({
    where: { id: tutorId },
    data: { fullName, bio, phone, subjects },
  });

  redirect("/tutors/" + tutorId);
}