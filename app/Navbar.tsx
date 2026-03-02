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
  const isAdmin = role === "ADMIN";

  const linkStyle = {
    color: "#94a3b8",
    fontSize: 14,
    textDecoration: "none",
    fontWeight: 500,
    transition: "color 0.2s",
  } as const;

  return (
    <div
      style={{
        backgroundColor: "#1e293b",
        borderBottom: "1px solid #334155",
        padding: "0 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: 60,
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          fontSize: "1.25rem",
          fontWeight: 800,
          color: "#f8fafc",
          textDecoration: "none",
          background: "linear-gradient(90deg, #3b82f6, #38bdf8)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Coursaty
      </Link>

      {/* Nav links */}
      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>

        {/* ✅ Home → landing page */}
        <Link href="/" style={linkStyle}>
          Home
        </Link>

        {/* ✅ Classes → browse classes (was incorrectly pointing to "/") */}
        <Link href="/classes" style={linkStyle}>
          Classes
        </Link>

        <Link href="/tutors" style={linkStyle}>
          Tutors
        </Link>

        {/* ✅ Centers listing page */}
        <Link href="/centers" style={linkStyle}>
          Centers
        </Link>

        {session?.user ? (
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <Link href="/dashboard" style={linkStyle}>
              Dashboard
            </Link>

            {canCreateClass && (
              <Link href="/create-class" style={linkStyle}>
                Create Class
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                style={{
                  backgroundColor: "#f87171",
                  color: "#fff",
                  padding: "5px 14px",
                  borderRadius: 8,
                  fontSize: 13,
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                Admin
              </Link>
            )}

            <Link
              href="/api/auth/signout"
              style={{
                backgroundColor: "#334155",
                color: "#94a3b8",
                padding: "6px 14px",
                borderRadius: 8,
                fontSize: 13,
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Sign out
            </Link>
          </div>
        ) : (
          <Link
            href="/login"
            style={{
              backgroundColor: "#3b82f6",
              color: "white",
              padding: "6px 16px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 2px 8px #3b82f640",
            }}
          >
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
}