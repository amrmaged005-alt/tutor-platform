import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      bookings: {
        include: { class: true },
        orderBy: { createdAt: "desc" },
      },
      ownedClasses: {
        include: {
          _count: { select: { bookings: true } },
          bookings: {
            include: { student: true },
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      classTutors: {
        include: {
          class: {
            include: { _count: { select: { bookings: true } } },
          },
        },
      },
      center: true,
    },
  });

  if (!user) redirect("/login");

  const role = user.role;

  const totalBookings = user.ownedClasses.reduce((sum, cls) => sum + cls._count.bookings, 0);
  const totalRevenue = user.ownedClasses.reduce((sum, cls) => sum + cls.priceEgp * cls._count.bookings, 0);
  const confirmedBookings = user.bookings.filter((b) => b.status === "CONFIRMED").length;
  const pendingBookings = user.bookings.filter((b) => b.status === "PENDING").length;

  const statusColor = (status: string) => {
    if (status === "CONFIRMED") return { bg: "#052e16", text: "#4ade80" };
    if (status === "CANCELLED") return { bg: "#450a0a", text: "#f87171" };
    return { bg: "#1c1917", text: "#fbbf24" };
  };

  const paymentColor = (status: string) => {
    if (status === "PAID") return { bg: "#052e16", text: "#4ade80" };
    if (status === "REFUNDED") return { bg: "#1e1b4b", text: "#a5b4fc" };
    return { bg: "#450a0a", text: "#f87171" };
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", fontFamily: "system-ui, sans-serif" }}>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem" }}>

        {/* Welcome Banner */}
        <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "1.5rem 2rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ color: "#f1f5f9", fontSize: "1.4rem", fontWeight: 800, margin: 0 }}>
              Welcome back, {user.fullName?.split(" ")[0] ?? "there"} 👋
            </h1>
            <p style={{ color: "#64748b", fontSize: 13, marginTop: "0.25rem", margin: "4px 0 0" }}>
              Signed in as <span style={{ color: "#38bdf8", fontWeight: 600 }}>{role}</span>
              {user.center ? " · " + user.center.name : ""}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            {(role === "TUTOR" || role === "CENTER_ADMIN") && (
              <Link href={"/tutors/" + user.id} style={{ backgroundColor: "#334155", color: "#f1f5f9", padding: "0.5rem 1.25rem", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                My Profile
              </Link>
            )}
            <Link href="/" style={{ backgroundColor: "#3b82f6", color: "white", padding: "0.5rem 1.25rem", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
              Browse Classes
            </Link>
          </div>
        </div>

        {/* STUDENT VIEW */}
        {role === "STUDENT" && (
          <div>
            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "24px" }}>
              {[
                { label: "Total Bookings", value: user.bookings.length, color: "#3b82f6" },
                { label: "Confirmed", value: confirmedBookings, color: "#4ade80" },
                { label: "Pending", value: pendingBookings, color: "#fbbf24" },
              ].map((stat) => (
                <div key={stat.label} style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "1.25rem 1.5rem" }}>
                  <div style={{ color: "#64748b", fontSize: 13, marginBottom: 6 }}>{stat.label}</div>
                  <div style={{ color: stat.color, fontSize: "1.8rem", fontWeight: 800 }}>{stat.value}</div>
                </div>
              ))}
            </div>

            <h2 style={{ color: "#f1f5f9", fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>My Bookings</h2>

            {user.bookings.length === 0 ? (
              <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "3rem", textAlign: "center" as const }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
                <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>You have not booked any classes yet.</p>
                <Link href="/" style={{ backgroundColor: "#3b82f6", color: "white", padding: "0.75rem 1.5rem", borderRadius: 10, textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
                  Browse Classes
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" as const, gap: "1rem" }}>
                {user.bookings.map((booking) => (
                  <div key={booking.id} style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "1.25rem 1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ color: "#f1f5f9", fontWeight: 700, margin: "0 0 6px" }}>{booking.class.title}</h3>
                        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" as const }}>
                          <span style={{ color: "#94a3b8", fontSize: 13 }}>{booking.class.subject}</span>
                          <span style={{ color: "#64748b", fontSize: 13 }}>{booking.class.priceEgp === 0 ? "Free" : booking.class.priceEgp + " EGP"}</span>
                          {booking.class.schedule && <span style={{ color: "#64748b", fontSize: 13 }}>{booking.class.schedule}</span>}
                          <span style={{ color: "#64748b", fontSize: 13 }}>{booking.class.isOnline ? "Online" : booking.class.city}</span>
                        </div>
                        {booking.notes && (
                          <p style={{ color: "#64748b", fontSize: 13, marginTop: 8, marginBottom: 0 }}>Note: {booking.notes}</p>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" as const, gap: "6px", alignItems: "flex-end", marginLeft: 16 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, backgroundColor: statusColor(booking.status).bg, color: statusColor(booking.status).text }}>
                          {booking.status}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, backgroundColor: paymentColor(booking.paymentStatus).bg, color: paymentColor(booking.paymentStatus).text }}>
                          {booking.paymentStatus}
                        </span>
                      </div>
                    </div>
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #334155", display: "flex", gap: 10 }}>
                      <Link href={"/classes/" + booking.classId} style={{ color: "#3b82f6", fontSize: 13, textDecoration: "none", fontWeight: 600 }}>
                        View Class
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TUTOR VIEW */}
        {(role === "TUTOR" || role === "CENTER_ADMIN") && (
          <div>
            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px", marginBottom: "24px" }}>
              {[
                { label: "Total Classes", value: user.ownedClasses.length, color: "#3b82f6" },
                { label: "Total Bookings", value: totalBookings, color: "#a78bfa" },
                { label: "Est. Revenue", value: totalRevenue + " EGP", color: "#4ade80" },
                { label: "Avg per Class", value: user.ownedClasses.length > 0 ? Math.round(totalRevenue / user.ownedClasses.length) + " EGP" : "0 EGP", color: "#fbbf24" },
              ].map((stat) => (
                <div key={stat.label} style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "1.25rem 1.5rem" }}>
                  <div style={{ color: "#64748b", fontSize: 13, marginBottom: 6 }}>{stat.label}</div>
                  <div style={{ color: stat.color, fontSize: "1.5rem", fontWeight: 800 }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* My Classes */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ color: "#f1f5f9", fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>My Classes</h2>
              <Link href="/create-class" style={{ backgroundColor: "#3b82f6", color: "white", padding: "0.5rem 1.25rem", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                + New Class
              </Link>
            </div>

            {user.ownedClasses.length === 0 ? (
              <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "3rem", textAlign: "center" as const }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📚</div>
                <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>You have not created any classes yet.</p>
                <Link href="/create-class" style={{ backgroundColor: "#3b82f6", color: "white", padding: "0.75rem 1.5rem", borderRadius: 10, textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
                  Create Your First Class
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" as const, gap: "1rem", marginBottom: "2rem" }}>
                {user.ownedClasses.map((cls) => (
                  <div key={cls.id} style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "1.25rem 1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                          <h3 style={{ color: "#f1f5f9", fontWeight: 700, margin: 0 }}>{cls.title}</h3>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, backgroundColor: "#0f172a", border: "1px solid #334155", color: "#94a3b8" }}>
                            {cls.format}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" as const }}>
                          <span style={{ color: "#3b82f6", fontSize: 13 }}>{cls.subject}</span>
                          <span style={{ color: "#64748b", fontSize: 13 }}>{cls.priceEgp === 0 ? "Free" : cls.priceEgp + " EGP"}</span>
                          <span style={{ color: "#64748b", fontSize: 13 }}>{cls._count.bookings} bookings</span>
                          {cls.gradeLevel && <span style={{ color: "#64748b", fontSize: 13 }}>{cls.gradeLevel}</span>}
                          {cls.schedule && <span style={{ color: "#64748b", fontSize: 13 }}>{cls.schedule}</span>}
                        </div>
                      </div>
                      <Link href={"/classes/" + cls.id} style={{ color: "#3b82f6", fontSize: 13, textDecoration: "none", fontWeight: 600, marginLeft: 16, whiteSpace: "nowrap" as const }}>
                        View Class
                      </Link>
                    </div>

                    {/* Students who booked */}
                    {cls.bookings.length > 0 && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #334155" }}>
                        <div style={{ color: "#64748b", fontSize: 12, marginBottom: 8, fontWeight: 600 }}>STUDENTS</div>
                        <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
                          {cls.bookings.map((booking) => (
                            <div key={booking.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ color: "#94a3b8", fontSize: 13 }}>
                                {booking.student.fullName ?? booking.student.email}
                              </span>
                              <div style={{ display: "flex", gap: 6 }}>
                                <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, backgroundColor: statusColor(booking.status).bg, color: statusColor(booking.status).text }}>
                                  {booking.status}
                                </span>
                                <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, backgroundColor: paymentColor(booking.paymentStatus).bg, color: paymentColor(booking.paymentStatus).text }}>
                                  {booking.paymentStatus}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
