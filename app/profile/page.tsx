import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = {
  title: "Your Profile | Coursaty",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/profile");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, fullName: true, name: true, email: true, phone: true, bio: true, subjects: true, photoUrl: true },
  });
  if (!user) redirect("/login?callbackUrl=/profile");

  return (
    <ProfileClient
      initial={{
        fullName: user.fullName ?? user.name ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
        bio: user.bio ?? "",
        subjects: user.subjects ?? [],
        photoUrl: user.photoUrl ?? null,
      }}
    />
  );
}
