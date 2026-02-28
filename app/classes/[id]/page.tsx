import { prisma } from "../../../lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

const TEMP_STUDENT_ID = "student1";

async function bookClass(classId: string) {
  "use server";

  const existing = await prisma.booking.findUnique({
    where: {
      classId_studentId: {
        classId,
        studentId: TEMP_STUDENT_ID,
      },
    },
  });

  if (!existing) {
    await prisma.booking.create({
      data: {
        classId,
        studentId: TEMP_STUDENT_ID,
        status: "PENDING",
        paymentStatus: "UNPAID",
      },
    });
  }

  redirect("/bookings");
}

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cls = await prisma.class.findUnique({
    where: { id },
    include: {
      tutors: { include: { tutor: true } },
      center: true,
      owner: true,
      materials: true,
    },
  });

  if (!cls) return notFound();

  const bookAction = bookClass.bind(null, id);
  const isCenter = !!cls.center;

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

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "2rem" }}>

        <Link href="/" style={{ fontSize: 13, color: "#64748b", textDecoration: "none" }}>
          ← Back to classes
        </Link>

        {/* Class Header */}
        <div style={{
          backgroundColor: "#1e293b",
          border: "1px solid #334155",
          borderRadius: 16,
          padding: "1.75rem",
          marginTop: "1.25rem",
        }}>
          <p style={{ color: "#64748b", fontSize: 13, marginBottom: "0.5rem" }}>{cls.subject}</p>
          <h1 style={{ color: "#f1f5f9", fontSize: "1.6rem", fontWeight: 800, marginBottom: "1rem" }}>
            {cls.title}
          </h1>
          {cls.description && (
            <p style={{ color: "#94a3b8", lineHeight: 1.7, marginBottom: "1.5rem" }}>
              {cls.description}
            </p>
          )}

          {/* Details */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            {[
              { icon: "📍", label: cls.location ?? cls.city },
              { icon: "🕐", label: cls.schedule ?? "Schedule TBD" },
              { icon: "💰", label: cls.priceEgp > 0 ? `${cls.priceEgp} EGP` : "Free" },
              { icon: "🪑", label: cls.capacity ? `${cls.capacity} seats` : "Unlimited" },
            ].map((item) => (
              <div key={item.label} style={{
                backgroundColor: "#0f172a",
                borderRadius: 10,
                padding: "0.75rem 1rem",
                fontSize: 14,
                color: "#cbd5e1",
              }}>
                {item.icon} {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Taught by */}
        <div style={{
          backgroundColor: "#1e293b",
          border: "1px solid #334155",
          borderRadius: 16,
          padding: "1.5rem",
          marginTop: "1rem",
        }}>
          <h2 style={{ color: "#f1f5f9", fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>
            {isCenter ? "🏫 Learning Center" : "👤 Independent Tutor"}
          </h2>

          {isCenter && cls.center && (
            <Link href={`/centers/${cls.center.id}`} style={{ textDecoration: "none" }}>
              <div style={{
                backgroundColor: "#0f172a",
                borderRadius: 12,
                padding: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: "#3b82f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.4rem",
                }}>🏫</div>
                <div>
                  <div style={{ color: "#38bdf8", fontWeight: 700 }}>{cls.center.name}</div>
                  <div style={{ color: "#64748b", fontSize: 13 }}>📍 {cls.center.location ?? cls.center.city}</div>
                </div>
              </div>
            </Link>
          )}

          {!isCenter && cls.owner && (
            <div style={{
              backgroundColor: "#0f172a",
              borderRadius: 12,
              padding: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                backgroundColor: "#3b82f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.4rem",
              }}>👤</div>
              <div>
                <div style={{ color: "#f1f5f9", fontWeight: 700 }}>{cls.owner.fullName}</div>
                {cls.owner.bio && <div style={{ color: "#64748b", fontSize: 13 }}>{cls.owner.bio}</div>}
              </div>
            </div>
          )}

          {/* Tutors list */}
          {cls.tutors.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <p style={{ color: "#64748b", fontSize: 13, marginBottom: "0.5rem" }}>Teaching this class:</p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {cls.tutors.map((ct) => (
                  <span key={ct.tutor.id} style={{
                    backgroundColor: "#0f172a",
                    color: "#cbd5e1",
                    fontSize: 13,
                    padding: "4px 12px",
                    borderRadius: 20,
                    border: "1px solid #334155",
                  }}>
                    👤 {ct.tutor.fullName}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Materials preview */}
        {cls.materials.length > 0 && (
          <div style={{
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 16,
            padding: "1.5rem",
            marginTop: "1rem",
          }}>
            <h2 style={{ color: "#f1f5f9", fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>
              📁 Class Materials
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {cls.materials.map((m) => (
                <div key={m.id} style={{
                  backgroundColor: "#0f172a",
                  borderRadius: 10,
                  padding: "0.75rem 1rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <span style={{ color: "#cbd5e1", fontSize: 14 }}>📄 {m.title}</span>
                  <span style={{
                    fontSize: 12,
                    color: m.isLocked ? "#f87171" : "#4ade80",
                    backgroundColor: m.isLocked ? "#450a0a" : "#052e16",
                    padding: "2px 10px",
                    borderRadius: 20,
                  }}>
                    {m.isLocked ? "🔒 Locked" : "✅ Unlocked"}
                  </span>
                </div>
              ))}
            </div>
            <p style={{ color: "#475569", fontSize: 12, marginTop: "0.75rem" }}>
              Materials unlock after payment is confirmed.
            </p>
          </div>
        )}

        {/* Book button */}
        <form action={bookAction} style={{ marginTop: "1.5rem" }}>
          <button type="submit" style={{
            width: "100%",
            backgroundColor: "#3b82f6",
            color: "white",
            padding: "1rem",
            fontSize: "1rem",
            fontWeight: 700,
            border: "none",
            borderRadius: 12,
            cursor: "pointer",
          }}>
            Book this class
          </button>
        </form>

      </div>
    </div>
  );
}