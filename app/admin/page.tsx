import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (!currentUser || currentUser.role !== "ADMIN") redirect("/dashboard");

  // Fetch all stats in parallel
  const [
    totalUsers,
    totalTutors,
    totalStudents,
    totalCenterAdmins,
    totalClasses,
    totalBookings,
    confirmedBookings,
    recentUsers,
    recentClasses,
    recentBookings,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "TUTOR" } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "CENTER_ADMIN" } }),
    prisma.class.count(),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, fullName: true, name: true, email: true, role: true, createdAt: true },
    }),
    prisma.class.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        owner: { select: { fullName: true, name: true } },
        center: { select: { name: true } },
        _count: { select: { bookings: true } },
      },
    }),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        student: { select: { fullName: true, name: true, email: true } },
        class: { select: { title: true, priceEgp: true } },
      },
    }),
  ]);

  const estimatedRevenue = await prisma.booking.findMany({
    where: { status: "CONFIRMED" },
    include: { class: { select: { priceEgp: true } } },
  });
  const totalRevenue = estimatedRevenue.reduce((sum, b) => sum + b.class.priceEgp, 0);

  const cardStyle = {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: 16,
    padding: "1.5rem",
  };

  const tableHeaderStyle: React.CSSProperties = {
    color: "#64748b",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    padding: "0.75rem 1rem",
    textAlign: "left",
    borderBottom: "1px solid #334155",
  };

  const tableCellStyle: React.CSSProperties = {
    color: "#cbd5e1",
    fontSize: 13,
    padding: "0.875rem 1rem",
    borderBottom: "1px solid #1e293b",
  };

  const roleColor = (role: string) => {
    if (role === "ADMIN") return { bg: "#450a0a", text: "#f87171" };
    if (role === "TUTOR") return { bg: "#1e3a5f", text: "#38bdf8" };
    if (role === "CENTER_ADMIN") return { bg: "#2e1065", text: "#a78bfa" };
    return { bg: "#0f172a", text: "#64748b" };
  };

  const statusColor = (status: string) => {
    if (status === "CONFIRMED") return { bg: "#052e16", text: "#4ade80" };
    if (status === "CANCELLED") return { bg: "#450a0a", text: "#f87171" };
    return { bg: "#1c1917", text: "#fbbf24" };
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ color: "#f1f5f9", fontSize: "1.75rem", fontWeight: 800, margin: 0 }}>
              Admin Dashboard
            </h1>
            <p style={{ color: "#64748b", fontSize: 14, margin: "4px 0 0" }}>
              Full platform overview
            </p>
          </div>
          <Link href="/dashboard" style={{ color: "#64748b", fontSize: 14, textDecoration: "none" }}>
            Back to Dashboard
          </Link>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { label: "Total Users", value: totalUsers, color: "#3b82f6" },
            { label: "Students", value: totalStudents, color: "#4ade80" },
            { label: "Tutors", value: totalTutors, color: "#38bdf8" },
            { label: "Centers", value: totalCenterAdmins, color: "#a78bfa" },
            { label: "Classes", value: totalClasses, color: "#fbbf24" },
            { label: "Total Bookings", value: totalBookings, color: "#fb923c" },
            { label: "Confirmed", value: confirmedBookings, color: "#4ade80" },
            { label: "Est. Revenue", value: totalRevenue + " EGP", color: "#4ade80" },
          ].map(stat => (
            <div key={stat.label} style={cardStyle}>
              <div style={{ color: "#64748b", fontSize: 12, marginBottom: 6 }}>{stat.label}</div>
              <div style={{ color: stat.color, fontSize: "1.6rem", fontWeight: 800 }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Recent Users */}
        <div style={{ ...cardStyle, marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ color: "#f1f5f9", fontSize: "1rem", fontWeight: 700, margin: 0 }}>
              Recent Users
            </h2>
            <span style={{ color: "#64748b", fontSize: 13 }}>{totalUsers} total</span>
          </div>
          <div style={{ overflowX: "auto" as const }}>
            <table style={{ width: "100%", borderCollapse: "collapse" as const }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>Name</th>
                  <th style={tableHeaderStyle}>Email</th>
                  <th style={tableHeaderStyle}>Role</th>
                  <th style={tableHeaderStyle}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map(user => {
                  const rc = roleColor(user.role);
                  return (
                    <tr key={user.id}>
                      <td style={tableCellStyle}>{user.fullName || user.name || "—"}</td>
                      <td style={tableCellStyle}>{user.email}</td>
                      <td style={tableCellStyle}>
                        <span style={{ backgroundColor: rc.bg, color: rc.text, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={tableCellStyle}>
                        {new Date(user.createdAt).toLocaleDateString("en-GB")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Classes */}
        <div style={{ ...cardStyle, marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ color: "#f1f5f9", fontSize: "1rem", fontWeight: 700, margin: 0 }}>
              Recent Classes
            </h2>
            <span style={{ color: "#64748b", fontSize: 13 }}>{totalClasses} total</span>
          </div>
          <div style={{ overflowX: "auto" as const }}>
            <table style={{ width: "100%", borderCollapse: "collapse" as const }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>Title</th>
                  <th style={tableHeaderStyle}>Subject</th>
                  <th style={tableHeaderStyle}>Owner / Center</th>
                  <th style={tableHeaderStyle}>Price</th>
                  <th style={tableHeaderStyle}>Bookings</th>
                </tr>
              </thead>
              <tbody>
                {recentClasses.map(cls => (
                  <tr key={cls.id}>
                    <td style={tableCellStyle}>
                      <Link href={"/classes/" + cls.id} style={{ color: "#3b82f6", textDecoration: "none", fontWeight: 600 }}>
                        {cls.title}
                      </Link>
                    </td>
                    <td style={tableCellStyle}>{cls.subject}</td>
                    <td style={tableCellStyle}>
                      {cls.center?.name || cls.owner?.fullName || cls.owner?.name || "—"}
                    </td>
                    <td style={tableCellStyle}>{cls.priceEgp === 0 ? "Free" : cls.priceEgp + " EGP"}</td>
                    <td style={tableCellStyle}>{cls._count.bookings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Bookings */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ color: "#f1f5f9", fontSize: "1rem", fontWeight: 700, margin: 0 }}>
              Recent Bookings
            </h2>
            <span style={{ color: "#64748b", fontSize: 13 }}>{totalBookings} total</span>
          </div>
          <div style={{ overflowX: "auto" as const }}>
            <table style={{ width: "100%", borderCollapse: "collapse" as const }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>Student</th>
                  <th style={tableHeaderStyle}>Class</th>
                  <th style={tableHeaderStyle}>Price</th>
                  <th style={tableHeaderStyle}>Status</th>
                  <th style={tableHeaderStyle}>Payment</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map(booking => {
                  const sc = statusColor(booking.status);
                  const pc = statusColor(booking.paymentStatus === "PAID" ? "CONFIRMED" : booking.paymentStatus === "REFUNDED" ? "" : "PENDING");
                  return (
                    <tr key={booking.id}>
                      <td style={tableCellStyle}>
                        {booking.student.fullName || booking.student.name || booking.student.email}
                      </td>
                      <td style={tableCellStyle}>{booking.class.title}</td>
                      <td style={tableCellStyle}>{booking.class.priceEgp === 0 ? "Free" : booking.class.priceEgp + " EGP"}</td>
                      <td style={tableCellStyle}>
                        <span style={{ backgroundColor: sc.bg, color: sc.text, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
                          {booking.status}
                        </span>
                      </td>
                      <td style={tableCellStyle}>
                        <span style={{ backgroundColor: pc.bg, color: pc.text, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
                          {booking.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
