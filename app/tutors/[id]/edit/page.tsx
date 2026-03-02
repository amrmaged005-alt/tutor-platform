import { prisma } from "../../../../lib/prisma";
import { auth } from "../../../../lib/auth";
import { notFound, redirect } from "next/navigation";
import TutorEditClient from "./TutorEditClient";
import { updateTutorProfile } from "./actions";

export default async function TutorEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const tutor = await prisma.user.findUnique({
    where: { id },
    include: { center: true },
  });

  if (!tutor || (tutor.role !== "TUTOR" && tutor.role !== "CENTER_ADMIN")) {
    notFound();
  }

  // Only the owner can edit
  if (session?.user?.email !== tutor.email) {
    redirect("/tutors/" + id);
  }

  const tutorData = {
    id: tutor.id,
    fullName: (tutor as any).fullName ?? "",
    name: tutor.name ?? "",
    email: tutor.email ?? "",
    bio: (tutor as any).bio ?? "",
    phone: (tutor as any).phone ?? "",
    subjects: (tutor as any).subjects ?? [] as string[],
    center: tutor.center
      ? { id: tutor.center.id, name: tutor.center.name }
      : null,
  };

  const boundAction = updateTutorProfile.bind(null, id);

  return <TutorEditClient tutor={tutorData} updateAction={boundAction} />;
}