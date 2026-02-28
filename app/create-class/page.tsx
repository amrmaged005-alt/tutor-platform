import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { redirect } from "next/navigation";
import CreateClassForm from "./CreateClassForm";

export default async function CreateClassPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (!user || (user.role !== "TUTOR" && user.role !== "CENTER_ADMIN" && user.role !== "ADMIN")) {
    redirect("/dashboard");
  }

  return <CreateClassForm />;
}