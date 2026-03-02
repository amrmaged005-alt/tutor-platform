"use server";

import { prisma } from "../../../lib/prisma";
import { auth } from "../../../lib/auth";
import { redirect } from "next/navigation";

export async function bookClass(classId: string) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!currentUser) redirect("/login");

  const existingCancelled = await prisma.booking.findFirst({
    where: { classId, studentId: currentUser.id, status: "CANCELLED" },
  });

  if (existingCancelled) {
    await prisma.booking.update({
      where: { id: existingCancelled.id },
      data: { status: "PENDING", paymentStatus: "UNPAID" },
    });
  } else {
    await prisma.booking.create({
      data: {
        classId,
        studentId: currentUser.id,
        status: "PENDING",
        paymentStatus: "UNPAID",
      },
    });
  }

  redirect("/booking-confirmed?classId=" + classId);
}