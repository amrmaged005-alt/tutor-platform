"use server";

import { prisma } from "../../lib/prisma";
import { auth } from "../../lib/auth";
import { redirect } from "next/navigation";

export async function cancelBooking(formData: FormData) {
  const bookingId = formData.get("bookingId") as string;
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!currentUser) redirect("/login");
  await prisma.booking.updateMany({
    where: { id: bookingId, studentId: currentUser.id },
    data: { status: "CANCELLED" },
  });
  redirect("/dashboard");
}

export async function deleteClass(formData: FormData) {
  const classId = formData.get("classId") as string;
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!currentUser) redirect("/login");
  const cls = await prisma.class.findUnique({ where: { id: classId } });
  if (!cls || cls.ownerId !== currentUser.id) redirect("/dashboard");
  await prisma.material.deleteMany({ where: { classId } });
  await prisma.booking.deleteMany({ where: { classId } });
  await prisma.classTutor.deleteMany({ where: { classId } });
  await prisma.class.delete({ where: { id: classId } });
  redirect("/dashboard");
}