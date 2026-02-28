import { prisma } from "../../lib/prisma";
import Link from "next/link";

const TEMP_STUDENT_ID = "student1";

export default async function BookingsPage() {
  const bookings = await prisma.booking.findMany({
    where: { studentId: TEMP_STUDENT_ID },
    include: { class: { include: { center: true, owner: true } } },
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
        <Link href="/" style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f8fafc", textDecoration: "none" }}>
          📖 Coursaty
        </Link>
        <Link href="/" style={{
          backgroundColor: "#1e293b",
          color: "#94a3b8",
          padding: "0.5rem 1.25rem",
          borderRadius: 8,
          fontSize: 14,
          border: "1px solid #334155",
          textDecoration: "none",
        }}>
          Browse Classes
        </Link>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "2rem" }}>
        <h1 style={{ color: "#f1f5f9", fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          My Bookings
        </h1>
        <p style={{ color: "#64748b", fontSize: 14, marginBottom: "2rem" }}>
          {bookings.length} booking{bookings.length !== 1 ? "s" : ""} found
        </p>

        {bookings.length === 0 ? (
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
            {bookings.map((booking) => {
              const displayName = booking.class.center
                ? booking.class.center.name
                : booking.class.owner?.fullName ?? "Unknown";
              const isCenter = !!booking.class.center;

              return (
                <div key={booking.id} style={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: 16,
                  padding: "1.5rem",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h2 style={{ color: "#f1f5f9", fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.4rem" }}>
                        {booking.class.title}
                      </h2>
                      <p style={{ color: "#64748b", fontSize: 13 }}>
                        {isCenter ? "🏫" : "👤"} {displayName}
                      </p>
                      <p style={{ color: "#64748b", fontSize: 13 }}>
                        💰 {booking.class.priceEgp > 0 ? `${booking.class.priceEgp} EGP` : "Free"}
                      </p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", alignItems: "flex-end" }}>
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

                  <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #334155" }}>
                    <Link href={`/classes/${booking.classId}`} style={{
                      color: "#38bdf8",
                      fontSize: 13,
                      textDecoration: "none",
                      fontWeight: 600,
                    }}>
                      View class →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}