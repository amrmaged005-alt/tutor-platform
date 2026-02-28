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

  const relatedClasses = await prisma.class.findMany({
    where: { subject: cls.subject, id: { not: cls.id } },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  let alreadyBooked = false;
  let currentUserRole = "";
  if (session?.user?.email) {
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (currentUser) {
      currentUserRole = currentUser.role;
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

  const tutor = cls.owner;
  const whatsappNumber = tutor?.phone ? tutor.phone.replace(/\D/g, "") : "";
  const centerWhatsapp = cls.center?.phone ? cls.center.phone.replace(/\D/g, "") : "";

  const badgeStyle = (color: string, bg: string) => ({
    fontSize: 11,
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: 20,
    backgroundColor: bg,
    color: color,
    border: "1px solid " + color + "33",
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>

        <Link href="/" style={{ color: "#64748b", fontSize: 13, textDecoration: "none", display: "block", marginBottom: "1.5rem" }}>
          Back to all classes
        </Link>

        {/* Main Card */}
        <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "2rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, marginBottom: 16 }}>
            <span style={badgeStyle("#38bdf8", "#0c2a3f")}>{cls.subject}</span>
            <span style={badgeStyle("#a78bfa", "#1e1b4b")}>{cls.curriculum}</span>
            <span style={badgeStyle("#4ade80", "#052e16")}>{cls.format}</span>
            {cls.gradeLevel && <span style={badgeStyle("#fbbf24", "#1c1917")}>{cls.gradeLevel}</span>}
            {cls.language && <span style={badgeStyle("#94a3b8", "#1e293b")}>{cls.language}</span>}
          </div>

          <h1 style={{ color: "#f1f5f9", fontSize: "1.6rem", fontWeight: 800, margin: "0 0 0.75rem" }}>
            {cls.title}
          </h1>

          {cls.description && (
            <p style={{ color: "#94a3b8", fontSize: 15, lineHeight: 1.7, margin: "0 0 1.5rem" }}>
              {cls.description}
            </p>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "1.5rem" }}>
            {[
              { label: "Price", value: cls.priceEgp === 0 ? "Free" : cls.priceEgp + " EGP / month" },
              { label: "Location", value: cls.isOnline ? "Online" : (cls.location ?? cls.city) },
              { label: "Schedule", value: cls.schedule ?? "Contact for schedule" },
              { label: "Spots Left", value: spotsLeft !== null ? spotsLeft + " of " + cls.capacity : "Unlimited" },
            ].map((item) => (
              <div key={item.label} style={{ backgroundColor: "#0f172a", borderRadius: 10, padding: "0.875rem 1rem" }}>
                <div style={{ color: "#64748b", fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: 0.5, marginBottom: 4 }}>
                  {item.label}
                </div>
                <div style={{ color: "#f1f5f9", fontSize: 14, fontWeight: 600 }}>{item.value}</div>
              </div>
            ))}
          </div>

          {!session?.user ? (
            <Link href="/login" style={{ display: "block", textAlign: "center" as const, backgroundColor: "#3b82f6", color: "white", padding: "1rem", borderRadius: 10, fontWeight: 700, fontSize: "1rem", textDecoration: "none" }}>
              Sign in to Book This Class
            </Link>
          ) : currentUserRole === "TUTOR" || currentUserRole === "CENTER_ADMIN" || currentUserRole === "ADMIN" ? (
            <div style={{ textAlign: "center" as const, backgroundColor: "#1e293b", border: "1px solid #334155", color: "#64748b", padding: "1rem", borderRadius: 10, fontWeight: 600, fontSize: "0.95rem" }}>
              Tutors cannot book classes
            </div>
          ) : alreadyBooked ? (
            <div style={{ textAlign: "center" as const, backgroundColor: "#052e16", color: "#4ade80", padding: "1rem", borderRadius: 10, fontWeight: 700, fontSize: "1rem" }}>
              You have already booked this class
            </div>
          ) : spotsLeft === 0 ? (
            <div style={{ textAlign: "center" as const, backgroundColor: "#450a0a", color: "#fca5a5", padding: "1rem", borderRadius: 10, fontWeight: 700 }}>
              This class is full
            </div>
          ) : (
            <form action={bookClass}>
              <button type="submit" style={{ width: "100%", backgroundColor: "#3b82f6", color: "white", padding: "1rem", borderRadius: 10, fontWeight: 700, fontSize: "1rem", border: "none", cursor: "pointer" }}>
                {cls.priceEgp === 0 ? "Book This Class — Free" : "Book This Class — " + cls.priceEgp + " EGP"}
              </button>
            </form>
          )}
        </div>

        {/* Tutor Bio Card */}
        {tutor && (
          <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "1.5rem", marginBottom: "1.5rem" }}>
            <h2 style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "1rem", margin: "0 0 1rem" }}>
              About the Tutor
            </h2>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#3b82f6", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 22, color: "#fff" }}>
                {(tutor.fullName || tutor.name || "T")[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 16, marginBottom: 4 }}>
                  {tutor.fullName || tutor.name || "Tutor"}
                </div>
                {tutor.subjects && tutor.subjects.length > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 8 }}>
                    {tutor.subjects.map((s) => (
                      <span key={s} style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 6, padding: "2px 10px", fontSize: 12, color: "#94a3b8" }}>{s}</span>
                    ))}
                  </div>
                )}
                {tutor.bio && (
                  <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6, margin: "0 0 12px" }}>{tutor.bio}</p>
                )}
                <div style={{ display: "flex", gap: 10 }}>
                  <Link href={"/tutors/" + tutor.id} style={{ color: "#3b82f6", fontSize: 13, textDecoration: "none", fontWeight: 600 }}>
                    View Full Profile
                  </Link>
                  {tutor.phone && (
                    <a href={"https://wa.me/" + whatsappNumber} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: "#16a34a", color: "#fff", borderRadius: 8, padding: "6px 14px", textDecoration: "none", fontWeight: 600, fontSize: 13 }}>
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Center Card */}
        {cls.center && (
          <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "1.5rem", marginBottom: "1.5rem" }}>
            <h2 style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "1rem", margin: "0 0 1rem" }}>
              Learning Center
            </h2>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ width: 56, height: 56, borderRadius: 12, background: "#1d4ed8", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 22, color: "#fff" }}>
                {cls.center.name[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 16, marginBottom: 4 }}>{cls.center.name}</div>
                <div style={{ color: "#64748b", fontSize: 13, marginBottom: 8 }}>{cls.center.city}{cls.center.location ? " - " + cls.center.location : ""}</div>
                {cls.center.description && (
                  <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6, margin: "0 0 12px" }}>{cls.center.description}</p>
                )}
                <div style={{ display: "flex", gap: 10 }}>
                  <Link href={"/centers/" + cls.center.id} style={{ color: "#3b82f6", fontSize: 13, textDecoration: "none", fontWeight: 600 }}>
                    View Center
                  </Link>
                  {cls.center.phone && (
                    <a href={"https://wa.me/" + centerWhatsapp} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: "#16a34a", color: "#fff", borderRadius: 8, padding: "6px 14px", textDecoration: "none", fontWeight: 600, fontSize: 13 }}>
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Materials */}
        {cls.materials.length > 0 && (
          <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "1.5rem", marginBottom: "1.5rem" }}>
            <h2 style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "1rem", margin: "0 0 1rem" }}>
              Class Materials
            </h2>
            {cls.materials.map((m) => (
              <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0", borderBottom: "1px solid #334155" }}>
                <span style={{ color: "#cbd5e1", fontSize: 14 }}>{m.title}</span>
                {m.isLocked ? (
                  <span style={{ color: "#64748b", fontSize: 12 }}>Book to unlock</span>
                ) : (
                  <a href={m.fileUrl ?? "#"} style={{ color: "#38bdf8", fontSize: 12 }}>Download</a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Related Classes */}
        {relatedClasses.length > 0 && (
          <div>
            <h2 style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "1rem", margin: "0 0 1rem" }}>
              More {cls.subject} Classes
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
              {relatedClasses.map((r) => (
                <Link key={r.id} href={"/classes/" + r.id} style={{ textDecoration: "none" }}>
                  <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "1.25rem", cursor: "pointer" }}>
                    <div style={{ fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>{r.title}</div>
                    <div style={{ color: "#3b82f6", fontSize: 13, marginBottom: 4 }}>{r.subject}</div>
                    {r.description && (
                      <div style={{ color: "#94a3b8", fontSize: 13, marginBottom: 8 }}>
                        {r.description.length > 70 ? r.description.slice(0, 70) + "..." : r.description}
                      </div>
                    )}
                    <div style={{ fontWeight: 700, color: "#f1f5f9" }}>
                      {r.priceEgp === 0 ? "Free" : r.priceEgp + " EGP"}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}