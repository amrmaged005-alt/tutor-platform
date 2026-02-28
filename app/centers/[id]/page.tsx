import { prisma } from "../../../lib/prisma";
import { notFound } from "next/navigation";

export default async function CenterProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const center = await prisma.learningCenter.findUnique({
    where: { id },
    include: { classes: true },
  });

  if (!center) notFound();

  const cardStyle = {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "16px",
    padding: "24px",
  };

  const whatsappNumber = center.phone ? center.phone.replace(/\D/g, "") : "";

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#f1f5f9", fontFamily: "system-ui, sans-serif", padding: "40px 24px", maxWidth: "900px", margin: "0 auto" }}>
      <a href="/tutors" style={{ color: "#3b82f6", textDecoration: "none", fontSize: "14px" }}>
        Back to Directory
      </a>

      <div style={{ ...cardStyle, marginTop: "24px", display: "flex", gap: "24px", alignItems: "flex-start" }}>
        <div style={{ width: 80, height: 80, borderRadius: "16px", background: "#1d4ed8", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "32px", color: "#fff" }}>
          {center.name[0]?.toUpperCase()}
        </div>

        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, margin: "0 0 4px" }}>{center.name}</h1>
          <div style={{ color: "#64748b", fontSize: "14px", marginBottom: "12px" }}>
            {center.city}{center.location ? " - " + center.location : ""}
          </div>

          {center.description && (
            <p style={{ color: "#94a3b8", fontSize: "15px", lineHeight: 1.6, margin: "0 0 14px" }}>
              {center.description}
            </p>
          )}

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" as const }}>
            {center.phone && (
              <a href={"https://wa.me/" + whatsappNumber} target="_blank" rel="noopener noreferrer" style={{ background: "#16a34a", color: "#fff", borderRadius: "8px", padding: "10px 20px", textDecoration: "none", fontWeight: 600, fontSize: "14px" }}>
                WhatsApp
              </a>
            )}
            {center.email && (
              <a href={"mailto:" + center.email} style={{ background: "#1e293b", color: "#94a3b8", border: "1px solid #334155", borderRadius: "8px", padding: "10px 20px", textDecoration: "none", fontWeight: 600, fontSize: "14px" }}>
                {center.email}
              </a>
            )}
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "40px 0 16px" }}>
        {"Classes (" + center.classes.length + ")"}
      </h2>

      {center.classes.length === 0 ? (
        <p style={{ color: "#64748b" }}>No classes yet.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {center.classes.map((cls) => (
            <a key={cls.id} href={"/classes/" + cls.id} style={{ textDecoration: "none" }}>
              <div style={{ ...cardStyle, cursor: "pointer" }}>
                <div style={{ fontWeight: 700, color: "#f1f5f9", marginBottom: "6px" }}>{cls.title}</div>
                <div style={{ color: "#3b82f6", fontSize: "13px", marginBottom: "4px" }}>{cls.subject}</div>
                {cls.description && (
                  <div style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "8px" }}>
                    {cls.description.length > 80 ? cls.description.slice(0, 80) + "..." : cls.description}
                  </div>
                )}
                <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: "15px" }}>
                  {cls.priceEgp === 0 ? "Free" : cls.priceEgp + " EGP"}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
