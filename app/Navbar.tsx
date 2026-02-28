import Link from "next/link";
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

export default async function Navbar() {
  const session = await auth();

  let role = "";
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });
    role = user?.role ?? "";
  }

  const canCreateClass = role === "TUTOR" || role === "CENTER_ADMIN" || role === "ADMIN";

  return (
    <div style={{ backgroundColor: "#1e293b", borderBottom: "1px solid #334155", padding: "0 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", height: 60, position: "sticky", top: 0, zIndex: 100 }}>
      <Link href="/" style={{ fontSize: "1.25rem", fontWeight: 800, color: "#f8fafc", textDecoration: "none" }}>
        Coursaty
      </Link>

      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
        <Link href="/" style={{ color: "#94a3b8", fontSize: 14, textDecoration: "none", fontWeight: 500 }}>
          Classes
        </Link>
        <Link href="/tutors" style={{ color: "#94a3b8", fontSize: 14, textDecoration: "none", fontWeight: 500 }}>
          Tutors
        </Link>

        {session?.user ? (
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <Link href="/dashboard" style={{ color: "#94a3b8", fontSize: 14, textDecoration: "none", fontWeight: 500 }}>
              Dashboard
            </Link>
            {canCreateClass && (
              <Link href="/create-class" style={{ color: "#94a3b8", fontSize: 14, textDecoration: "none", fontWeight: 500 }}>
                Create Class
              </Link>
            )}
            <Link href="/api/auth/signout" style={{ backgroundColor: "#334155", color: "#94a3b8", padding: "6px 14px", borderRadius: 8, fontSize: 13, textDecoration: "none", fontWeight: 500 }}>
              Sign out
            </Link>
          </div>
        ) : (
          <Link href="/login" style={{ backgroundColor: "#3b82f6", color: "white", padding: "6px 16px", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
}