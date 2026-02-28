import { prisma } from "../lib/prisma";
import { auth } from "../lib/auth";
import Link from "next/link";
import ClassSearch from "./ClassSearch";

export default async function HomePage() {
  const session = await auth();

  // Load initial classes (server-side, so first paint is fast)
  const initialClasses = await prisma.class.findMany({
    include: {
      tutors: { include: { tutor: true } },
      center: true,
      owner: true,
      _count: { select: { bookings: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", fontFamily: "system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{
        backgroundColor: "#1e293b",
        borderBottom: "1px solid #334155",
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div>
          <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f8fafc" }}>📖 Coursaty</span>
          <span style={{
            marginLeft: "0.75rem",
            fontSize: 11,
            fontWeight: 600,
            backgroundColor: "#3b82f6",
            color: "white",
            padding: "2px 8px",
            borderRadius: 20,
            textTransform: "uppercase" as const,
            letterSpacing: 1,
          }}>Cairo MVP</span>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {session?.user ? (
            <>
              <span style={{ color: "#94a3b8", fontSize: 14 }}>
                {session.user.name ?? session.user.email}
              </span>
              <Link href="/dashboard" style={{
                backgroundColor: "#3b82f6",
                color: "white",
                padding: "0.5rem 1.25rem",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}>Dashboard</Link>
            </>
          ) : (
            <>
              <Link href="/login" style={{
                backgroundColor: "#1e293b",
                color: "#94a3b8",
                padding: "0.5rem 1.25rem",
                borderRadius: 8,
                fontSize: 14,
                border: "1px solid #334155",
                textDecoration: "none",
              }}>Sign In</Link>
              <Link href="/signup" style={{
                backgroundColor: "#3b82f6",
                color: "white",
                padding: "0.5rem 1.25rem",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}>Sign Up</Link>
            </>
          )}
        </div>
      </div>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "3rem 2rem 2rem" }}>
        <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#f8fafc", marginBottom: "0.75rem" }}>
          Find Your Perfect Tutor
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "1.1rem", maxWidth: 500, margin: "0 auto 2rem" }}>
          Small group classes in Cairo — Physics, Math, Chemistry and more.
        </p>
      </div>

      {/* Search + filters + grid — all in the client component */}
      <ClassSearch initialClasses={initialClasses} />

    </div>
  );
}
