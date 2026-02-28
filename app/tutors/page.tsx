import { prisma } from "../../lib/prisma";
import TutorSearch from "./TutorSearch";

export const metadata = { title: "Tutors & Centers | Coursaty" };

export default async function TutorsPage() {
  const tutors = await prisma.user.findMany({
    where: { role: { in: ["TUTOR", "CENTER_ADMIN"] } },
    select: {
      id: true,
      fullName: true,
      name: true,
      bio: true,
      subjects: true,
      center: { select: { city: true } },
      _count: { select: { ownedClasses: true } },
    },
  });

  const centers = await prisma.learningCenter.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      city: true,
      location: true,
      _count: { select: { classes: true } },
    },
  });

  const tutorsFlat = tutors.map((t) => ({
    ...t,
    city: t.center?.city ?? "Cairo",
    center: undefined,
  }));

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#f1f5f9",
        fontFamily: "system-ui, sans-serif",
        padding: "40px 24px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <div style={{ marginBottom: "40px" }}>
        <a href="/" style={{ color: "#3b82f6", textDecoration: "none", fontSize: "14px" }}>
          Back to Home
        </a>
        <h1 style={{ fontSize: "32px", fontWeight: 800, margin: "16px 0 8px", color: "#f1f5f9" }}>
          Tutors and Centers
        </h1>
        <p style={{ color: "#94a3b8", margin: 0 }}>
          Find the right tutor or learning center for you
        </p>
      </div>

      <TutorSearch tutors={tutorsFlat} centers={centers} />
    </div>
  );
}