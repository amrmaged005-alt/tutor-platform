import { prisma } from "../../../lib/prisma";
import { auth } from "../../../lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function TutorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const tutor = await prisma.user.findUnique({
    where: { id },
    include: {
      ownedClasses: {
        include: { _count: { select: { bookings: true } } },
        orderBy: { createdAt: "desc" },
      },
      classTutors: { include: { class: true } },
      center: true,
    },
  });

  if (!tutor || (tutor.role !== "TUTOR" && tutor.role !== "CENTER_ADMIN")) {
    notFound();
  }

  const isOwner = session?.user?.email === tutor.email;
  const displayName = tutor.fullName || tutor.name || "Unnamed Tutor";
  const whatsappNumber = tutor.phone ? tutor.phone.replace(/\D/g, "") : "";

  const allClassIds = new Set<string>();
  const allClasses: any[] = [];
  for (const c of tutor.ownedClasses) {
    if (!allClassIds.has(c.id)) {
      allClassIds.add(c.id);
      allClasses.push(c);
    }
  }
  for (const ct of tutor.classTutors) {
    if (!allClassIds.has(ct.class.id)) {
      allClassIds.add(ct.class.id);
      allClasses.push(ct.class);
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <Link href="/tutors" style={{ color: "#64748b", fontSize: 14, textDecoration: "none" }}>
            ← Back to Tutors
          </Link>
          {isOwner && (
            <Link
              href={"/tutors/" + id + "/edit"}
              style={{
                backgroundColor: "#334155",
                color: "#f1f5f9",
                padding: "0.5rem 1.25rem",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              ✏️ Edit Profile
            </Link>
          )}
        </div>

        <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "2rem", marginBottom: "2rem" }}>
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" as const }}>

            <div style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              backgroundColor: "#3b82f6",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 36,
              color: "#fff"
            }}>
              {displayName[0]?.toUpperCase()}
            </div>

            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" as const }}>
                <h1 style={{ color: "#f1f5f9", fontSize: "1.6rem", fontWeight: 800, margin: 0 }}>
                  {displayName}
                </h1>
                <span style={{
                  backgroundColor: "#1e3a5f",
                  color: "#38bdf8",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 20
                }}>
                  {tutor.role === "CENTER_ADMIN" ? "CENTER" : "TUTOR"}
                </span>
              </div>

              <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 12px" }}>
                📍 {tutor.center?.city || "Cairo"}
                {tutor.center ? " · " + tutor.center.name : ""}
              </p>

              {tutor.subjects.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginBottom: 14 }}>
                  {tutor.subjects.map((s) => (
                    <span key={s} style={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: 6,
                      padding: "4px 12px",
                      fontSize: 13,
                      color: "#94a3b8"
                    }}>
                      {s}
                    </span>
                  ))}
                </div>
              ) : isOwner ? (
                <p style={{ color: "#64748b", fontSize: 13, marginBottom: 14 }}>
                  No subjects added yet.{" "}
                  <Link href={"/tutors/" + id + "/edit"} style={{ color: "#3b82f6" }}>
                    Add them →
                  </Link>
                </p>
              ) : null}

              {tutor.bio ? (
                <p style={{ color: "#94a3b8", fontSize: 15, lineHeight: 1.7, margin: "0 0 16px" }}>
                  {tutor.bio}
                </p>
              ) : isOwner ? (
                <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 16px" }}>
                  No bio yet.{" "}
                  <Link href={"/tutors/" + id + "/edit"} style={{ color: "#3b82f6" }}>
                    Add a bio →
                  </Link>
                </p>
              ) : (
                <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 16px" }}>
                  No bio provided.
                </p>
              )}

              <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
                <div style={{ textAlign: "center" as const }}>
                  <div style={{ color: "#3b82f6", fontWeight: 800, fontSize: "1.2rem" }}>
                    {allClasses.length}
                  </div>
                  <div style={{ color: "#64748b", fontSize: 12 }}>
                    Classes
                  </div>
                </div>
              </div>

              {/* FIXED SECTION BELOW */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const }}>
                {tutor.phone ? (
                  <a
                    href={"https://wa.me/" + whatsappNumber}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: "#16a34a",
                      color: "#fff",
                      borderRadius: 8,
                      padding: "8px 18px",
                      textDecoration: "none",
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    💬 WhatsApp
                  </a>
                ) : isOwner ? (
                  <Link
                    href={"/tutors/" + id + "/edit"}
                    style={{
                      backgroundColor: "#334155",
                      color: "#94a3b8",
                      borderRadius: 8,
                      padding: "8px 18px",
                      textDecoration: "none",
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    Add WhatsApp number
                  </Link>
                ) : null}
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
