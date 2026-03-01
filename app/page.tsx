import { prisma } from "../lib/prisma";
import Landing from "./Landing";
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
    <div>
      <Landing />
      <div id="classes" style={{ backgroundColor: "#0f172a", paddingTop: "4rem" }}>
        <div style={{ textAlign: "center", paddingBottom: "2rem" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#f8fafc", marginBottom: "0.5rem" }}>
            Browse Classes
          </h2>
          <p style={{ color: "#64748b", fontSize: 16 }}>
            Find the right class for you
          </p>
        </div>
        <ClassSearch initialClasses={initialClasses} />
      </div>
    </div>
  );
}