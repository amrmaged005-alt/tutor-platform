import { prisma } from "../lib/prisma";
import Link from "next/link";

const subjectColors: Record<string, { bg: string; text: string; emoji: string }> = {
  Math: { bg: "#dbeafe", text: "#1e40af", emoji: "📐" },
  Physics: { bg: "#ede9fe", text: "#5b21b6", emoji: "⚡" },
  Chemistry: { bg: "#dcfce7", text: "#166534", emoji: "🧪" },
  Statics: { bg: "#fef9c3", text: "#854d0e", emoji: "📏" },
  Dynamics: { bg: "#ffe4e6", text: "#9f1239", emoji: "🚀" },
  Orientation: { bg: "#e0f2fe", text: "#0c4a6e", emoji: "🧭" },
  default: { bg: "#f3f4f6", text: "#374151", emoji: "📚" },
};

export default async function HomePage() {
  const classes = await prisma.class.findMany({
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
            textTransform: "uppercase",
            letterSpacing: 1,
          }}>Cairo MVP</span>
        </div>
        <Link href="/bookings" style={{
          backgroundColor: "#3b82f6",
          color: "white",
          padding: "0.5rem 1.25rem",
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          textDecoration: "none",
        }}>
          My Bookings
        </Link>
      </div>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "3rem 2rem 2rem" }}>
        <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#f8fafc", marginBottom: "0.75rem" }}>
          Find Your Perfect Tutor
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "1.1rem", maxWidth: 500, margin: "0 auto" }}>
          Small group classes in Cairo. Physics, Math, Chemistry and more.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", justifyContent: "center", gap: "2rem", padding: "1rem 2rem 2rem" }}>
        {[
          { label: "Classes Available", value: classes.length },
          { label: "City", value: "Cairo" },
          { label: "Format", value: "In-Person" },
        ].map((stat) => (
          <div key={stat.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#38bdf8" }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Class Grid */}
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "0 2rem 4rem",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: "1.5rem",
      }}>
        {classes.map((cls) => {
          const style = subjectColors[cls.subject] ?? subjectColors.default;
          const spotsLeft = cls.capacity ? cls.capacity - cls._count.bookings : null;
          const isFull = spotsLeft !== null && spotsLeft <= 0;
          const displayName = cls.center ? cls.center.name : cls.owner ? cls.owner.fullName : "Unknown";
          const isCenter = !!cls.center;

          return (
            <Link key={cls.id} href={`/classes/${cls.id}`} style={{ textDecoration: "none" }}>
              <div style={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 16,
                padding: "1.5rem",
                height: "100%",
                boxSizing: "border-box",
              }}>

                {/* Top row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <span style={{
                    backgroundColor: style.bg,
                    color: style.text,
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "4px 12px",
                    borderRadius: 20,
                  }}>
                    {style.emoji} {cls.subject}
                  </span>
                  {isFull && (
                    <span style={{ backgroundColor: "#450a0a", color: "#fca5a5", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20 }}>
                      FULL
                    </span>
                  )}
                  {!isFull && spotsLeft !== null && spotsLeft <= 3 && (
                    <span style={{ backgroundColor: "#451a03", color: "#fdba74", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20 }}>
                      Only {spotsLeft} left
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "0.5rem" }}>
                  {cls.title}
                </h2>

                {/* Description */}
                {cls.description && (
                  <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: "1rem", lineHeight: 1.5 }}>
                    {cls.description}
                  </p>
                )}

                {/* Details */}
                <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 2 }}>
                  {cls.location && <div>📍 {cls.location}</div>}
                  {cls.schedule && <div>🕐 {cls.schedule}</div>}
                  <div>{isCenter ? "🏫" : "👤"} {displayName}</div>
                </div>

                {/* Footer */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "1.25rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid #334155",
                }}>
                  <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#38bdf8" }}>
                    {cls.priceEgp > 0 ? `${cls.priceEgp} EGP` : "Free"}
                  </span>
                  <span style={{ fontSize: 12, color: "#64748b" }}>
                    {spotsLeft !== null ? `${spotsLeft} spots left` : `${cls._count.bookings} booked`}
                  </span>
                </div>

              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}