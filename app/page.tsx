import { prisma } from "../lib/prisma";
import ClassSearch from "./ClassSearch";

export default async function HomePage() {
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
      <div style={{ textAlign: "center", padding: "3rem 2rem 2rem" }}>
        <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#f8fafc", marginBottom: "0.75rem" }}>
          Find Your Perfect Tutor
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "1.1rem", maxWidth: 500, margin: "0 auto 2rem" }}>
          Small group classes in Cairo — Physics, Math, Chemistry and more.
        </p>
      </div>
      <ClassSearch initialClasses={initialClasses} />
    </div>
  );
}