import { prisma } from "../../../lib/prisma";
import { auth } from "../../../lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  const cls = await prisma.class.findUnique({
    where: { id },
    include: {
      tutors: { include: { tutor: true } },
      center: true,
      owner: true,
      materials: true,
      _count: { select: { bookings: true } },
    },
  });

  if (!cls) return <div style={{ color: "white", padding: "2rem" }}>Class not found.</div>;

  const spotsLeft = cls.capacity ? cls.capacity - cls._count.bookings : null;

  // Check if logged-in user already booked
  let alreadyBooked = false;
  if (session?.user?.email) {
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (currentUser) {
      const existing = await prisma.booking.findUnique({
        where: { classId_studentId: { classId: cls.id, studentId: currentUser.id } },
      });
      alreadyBooked = !!existing;
    }
  }

  async function bookClass() {
    "use server";
    const session = await auth();
    if (!session?.user?.email) redirect("/login");

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!currentUser) redirect("/login");

    await prisma.booking.upsert({
      where: { classId_studentId: { classId: cls!.id, studentId: currentUser.id } },
      update: {},
      create: {
        classId: cls!.id,
        studentId: currentUser.id,
        status: "PENDING",
        paymentStatus: "UNPAID",
      },
    });

    redirect("/dashboard");
  }

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
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {session?.user ? (
            <Link href="/dashboard" style={{
              backgroundColor: "#3b82f6", color: "white", padding: "0.5rem 1.25rem",
              borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none",
            }}>
              Dashboard
            </Link>
          ) : (
            <Link href="/login" style={{
              backgroundColor: "#3b82f6", color: "white", padding: "0.5rem 1.25rem",
              borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none",
            }}>
              Sign In
            </Link>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "2rem" }}>

        {/* Back */}
        <Link href="/" style={{ color: "#64748b", fontSize: 13, textDecoration: "none", display: "block", marginBottom: "1.5rem" }}>
          ← Back to all classes
        </Link>

        {/* Main Card */}
        <div style={{
          backgroundColor: "#1e293b",
          border: "1px solid #334155",
          borderRadius: 16,
          padding: "2rem",
          marginBottom: "1.5rem",
        }}>
          <h1 style={{ color: "#f1f5f9", fontSize: "1.6rem", fontWeight: 800, margin: "0 0 0.5rem" }}>
            {cls.title}
          </h1>

          {cls.description && (
            <p style={{ color: "#94a3b8", fontSize: 15, marginBottom: "1.5rem", lineHeight: 1.6 }}>
              {cls.description}
            </p>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            {[
              { label: "Subject", value: cls.subject },
              { label: "Price", value: `${cls.priceEgp} EGP/month` },
              { label: "Location", value: cls.location ?? "TBA" },
              { label: "Schedule", value: cls.schedule ?? "TBA" },
              { label: "Spots Left", value: spotsLeft !== null ? `${spotsLeft} of ${cls.capacity}` : "Unlimited" },
              { label: "Taught by", value: cls.center ? cls.center.name : cls.owner?.fullName ?? "Unknown" },
            ].map((item) => (
              <div key={item.label} style={{
                backgroundColor: "#0f172a",
                borderRadius: 10,
                padding: "0.875rem 1rem",
              }}>
                <div style={{ color: "#64748b", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                  {item.label}
                </div>
                <div style={{ color: "#f1f5f9", fontSize: 14, fontWeight: 600 }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Book Button */}
          {!session?.user ? (
            <Link href="/login" style={{
              display: "block",
              textAlign: "center",
              backgroundColor: "#3b82f6",
              color: "white",
              padding: "1rem",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: "1rem",
              textDecoration: "none",
            }}>
              Sign in to Book This Class
            </Link>
          ) : alreadyBooked ? (
            <div style={{
              textAlign: "center",
              backgroundColor: "#052e16",
              color: "#4ade80",
              padding: "1rem",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: "1rem",
            }}>
              ✅ You've already booked this class
            </div>
          ) : spotsLeft === 0 ? (
            <div style={{
              textAlign: "center",
              backgroundColor: "#450a0a",
              color: "#fca5a5",
              padding: "1rem",
              borderRadius: 10,
              fontWeight: 700,
            }}>
              This class is full
            </div>
          ) : (
            <form action={bookClass}>
              <button type="submit" style={{
                width: "100%",
                backgroundColor: "#3b82f6",
                color: "white",
                padding: "1rem",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: "1rem",
                border: "none",
                cursor: "pointer",
              }}>
                Book This Class — {cls.priceEgp} EGP
              </button>
            </form>
          )}
        </div>

        {/* Materials */}
        {cls.materials.length > 0 && (
          <div style={{
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 16,
            padding: "1.5rem",
          }}>
            <h2 style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "1rem", marginBottom: "1rem" }}>
              📎 Class Materials
            </h2>
            {cls.materials.map((m) => (
              <div key={m.id} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.75rem 0",
                borderBottom: "1px solid #334155",
              }}>
                <span style={{ color: "#cbd5e1", fontSize: 14 }}>{m.title}</span>
                {m.isLocked ? (
                  <span style={{ color: "#64748b", fontSize: 12 }}>🔒 Book to unlock</span>
                ) : (
                  <a href={m.fileUrl ?? "#"} style={{ color: "#38bdf8", fontSize: 12 }}>⬇ Download</a>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}