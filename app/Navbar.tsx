import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";
import NavbarClient from "../components/NavbarClient";

export default async function Navbar() {
  const session = await auth();

  let role = "";
  let centerId: string | null = null;
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, centerId: true },
    });
    role = user?.role ?? "";
    centerId = user?.centerId ?? null;
  }

  return <NavbarClient session={!!session?.user} role={role} centerId={centerId} />;
}