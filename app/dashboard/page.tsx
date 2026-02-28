import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      bookings: {
        include: { class: true },
        orderBy: { createdAt: "desc" },
      },
      ownedClasses: {
        include: { _count: { select: { bookings: true } } },
        orderBy: { createdAt: "desc" },
      },
      classTutors: {
        include: {
          class: {
            include: { _count: { select: { bookings: true } } },
          },
        },
      },
    },
  });

  if (!user) redirect("/login");

  const role = user.role;

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
        <Link href="/" style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f8fafc", textDecoration: "none" }}>
          📖 Coursaty
        </Link>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span style={{ color: "#94a3b8", fontSize: 14 }}>{user.fullName ?? user.email}</span>
          <Link href="/api/auth/signout" style={{
            backgroundColor: "#334155",
            color: "#94a3b8",
            padding: "0.5rem 1rem",
            borderRadius: 8,
            fontSize: 13,
            textDecoration: "none",
          }}>
            Sign out
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem" }}>

        {/* Welcome */}
        <div style={{
          backgroundColor: "#1e293b",
          border: "1px solid #334155",
          borderRadius: 16,
          padding: "1.5rem 2rem",
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div>
            <h1 style={{ color: "#f1f5f9", fontSize: "1.4rem", fontWeight: 800, margin: 0 }}>
              Welcome back, {user.fullName?.split(" ")[0] ?? "there"} 👋
            </h1>
            <p style={{ color: "#64748b", fontSize: 13, marginTop: "0.25rem" }}>
              You are signed in as a <span style={{ color: "#38bdf8", fontWeight: 600 }}>{role}</span>
            </p>
          </div>
          <Link href="/" style={{
            backgroundColor: "#3b82f6",
            color: "white",
            padding: "0.5rem 1.25rem",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
          }}>
            Browse Classes
          </Link>
        </div>

        {/* STUDENT VIEW */}
        {role === "STUDENT" && (
          <div>
            <h2 style={{ color: "#f1f5f9", fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
              My Bookings
            </h2>
            {user.bookings.length === 0 ? (
              <div style={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 16,
                padding: "3rem",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
                <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>You haven't booked any classes yet.</p>
                <Link href="/" style={{
                  backgroundColor: "#3b82f6",
                  color: "white",
                  padding: "0.75rem 1.5rem",
                  borderRadius: 10,
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: 14,
                }}>
                  Browse Classes
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {user.bookings.map((booking) => (
                  <div key={booking.id} style={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: 16,
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                    <div>
                      <h3 style={{ color: "#f1f5f9", fontWeight: 700, margin: "0 0 0.25rem" }}>
                        {booking.class.title}
                      </h3>
                      <p style={{ color: "#64748b", fontSize: 13 }}>
                        💰 {booking.class.priceEgp} EGP
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <span style={{
                        fontSize: 12,
                        fontWeight: 600,
                        padding: "4px 12px",
                        borderRadius: 20,
                        backgroundColor: booking.status === "CONFIRMED" ? "#052e16" : "#1c1917",
                        color: booking.status === "CONFIRMED" ? "#4ade80" : "#fbbf24",
                      }}>
                        {booking.status}
                      </span>
                      <span style={{
                        fontSize: 12,
                        fontWeight: 600,
                        padding: "4px 12px",
                        borderRadius: 20,
                        backgroundColor: booking.paymentStatus === "PAID" ? "#052e16" : "#450a0a",
                        color: booking.paymentStatus === "PAID" ? "#4ade80" : "#f87171",
                      }}>
                        {booking.paymentStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TUTOR VIEW */}
        {role === "TUTOR" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ color: "#f1f5f9", fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
                My Classes
              </h2>
              <Link href="/create-class" style={{
                backgroundColor: "#3b82f6",
                color: "white",
                padding: "0.5rem 1.25rem",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}>
                + Create Class
              </Link>
            </div>

            {user.ownedClasses.length === 0 && user.classTutors.length === 0 ? (
              <div style={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 16,
                padding: "3rem",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📚</div>
                <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>You haven't created any classes yet.</p>
                <Link href="/create-class" style={{
                  backgroundColor: "#3b82f6",
                  color: "white",
                  padding: "0.75rem 1.5rem",
                  borderRadius: 10,
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: 14,
                }}>
                  Create Your First Class
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {user.ownedClasses.map((cls) => (
                  <div key={cls.id} style={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: 16,
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                    <div>
                      <h3 style={{ color: "#f1f5f9", fontWeight: 700, margin: "0 0 0.25rem" }}>
                        {cls.title}
                      </h3>
                      <p style={{ color: "#64748b", fontSize: 13 }}>
                        {cls._count.bookings} bookings · {cls.priceEgp} EGP
                      </p>
                    </div>
                    <Link href={`/classes/${cls.id}`} style={{
                      color: "#38bdf8",
                      fontSize: 13,
                      textDecoration: "none",
                      fontWeight: 600,
                    }}>
                      View →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CENTER ADMIN VIEW */}
        {role === "CENTER_ADMIN" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ color: "#f1f5f9", fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
                Center Dashboard
              </h2>
              <Link href="/create-class" style={{
                backgroundColor: "#3b82f6",
                color: "white",
                padding: "0.5rem 1.25rem",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}>
                + Create Class
              </Link>
            </div>
            <div style={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 16,
              padding: "2rem",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏫</div>
              <p style={{ color: "#94a3b8" }}>Center management coming soon.</p>
              <Link href="/create-class" style={{
                display: "inline-block",
                marginTop: "1rem",
                backgroundColor: "#3b82f6",
                color: "white",
                padding: "0.75rem 1.5rem",
                borderRadius: 10,
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 14,
              }}>
                Create a Class
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}