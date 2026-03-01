import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import CancelBookingButton from "../CancelBookingButton";
import DeleteClassButton from "../DeleteClassButton";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      bookings: {
        where: { status: { not: "CANCELLED" } },
        include: { class: true },
        orderBy: { createdAt: "desc" },
      },
      ownedClasses: {
        include: {
          _count: { select: { bookings: { where: { status: { not: "CANCELLED" } } } } },
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

  // Fetch center data if CENTER_ADMIN
  let centerData = null;
  if (role === "CENTER_ADMIN" && user.centerId) {
    centerData = await prisma.learningCenter.findUnique({
      where: { id: user.centerId },
      include: {
        classes: {
          include: {
            _count: { select: { bookings: { where: { status: { not: "CANCELLED" } } } } },
            bookings: {
              include: { student: true },
              orderBy: { createdAt: "desc" },
            },
            owner: { select: { fullName: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        tutors: {
          select: {
            id: true, fullName: true, name: true, email: true,
            subjects: true, phone: true,
            _count: { select: { ownedClasses: true } },
          },
        },
      },
    });
  }

  const totalBookings = user.ownedClasses.reduce((sum, cls) => sum + cls._count.bookings, 0);
  const totalRevenue = user.ownedClasses.reduce((sum, cls) => sum + cls.priceEgp * cls._count.bookings, 0);
  const confirmedBookings = user.bookings.filter((b) => b.status === "CONFIRMED").length;
  const pendingBookings = user.bookings.filter((b) => b.status === "PENDING").length;

  // Center stats
  const centerTotalBookings = centerData?.classes.reduce((sum, cls) => sum + cls._count.bookings, 0) ?? 0;
  const centerTotalRevenue = centerData?.classes.reduce((sum, cls) => sum + cls.priceEgp * cls._count.bookings, 0) ?? 0;

  async function cancelBooking(formData: FormData) {
    "use server";
    const bookingId = formData.get("bookingId") as string;
    const session = await auth();
    if (!session?.user?.email) redirect("/login");
    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!currentUser) redirect("/login");
    await prisma.booking.updateMany({
      where: { id: bookingId, studentId: currentUser.id },
      data: { status: "CANCELLED" },
    });
    redirect("/dashboard");
  }

  async function deleteClass(formData: FormData) {
    "use server";
    const classId = formData.get("classId") as string;
    const session = await auth();
    if (!session?.user?.email) redirect("/login");
    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!currentUser) redirect("/login");
    const cls = await prisma.class.findUnique({ where: { id: classId } });
    if (!cls || cls.ownerId !== currentUser.id) redirect("/dashboard");
    await prisma.material.deleteMany({ where: { classId } });
    await prisma.booking.deleteMany({ where: { classId } });
    await prisma.classTutor.deleteMany({ where: { classId } });
    await prisma.class.delete({ where: { id: classId } });
    redirect("/dashboard");
  }

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

  const cardStyle = {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: 16,
    padding: "1.25rem 1.5rem",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem" }}>

        {/* Welcome Banner */}
        <div style={{ ...cardStyle, marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ color: "#f1f5f9", fontSize: "1.4rem", fontWeight: 800, margin: 0 }}>
              Welcome back, {user.fullName?.split(" ")[0] ?? "there"} 👋
            </h1>
            <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>
              Signed in as <span style={{ color: "#38bdf8", fontWeight: 600 }}>{role}</span>
              {user.center ? " · " + user.center.name : ""}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
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

        {/* ── STUDENT VIEW ── */}
        {role === "STUDENT" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Total Bookings", value: user.bookings.length, color: "#3b82f6" },
                { label: "Confirmed", value: confirmedBookings, color: "#4ade80" },
                { label: "Pending", value: pendingBookings, color: "#fbbf24" },
              ].map((stat) => (
                <div key={stat.label} style={cardStyle}>
                  <div style={{ color: "#64748b", fontSize: 13, marginBottom: 6 }}>{stat.label}</div>
                  <div style={{ color: stat.color, fontSize: "1.8rem", fontWeight: 800 }}>{stat.value}</div>
                </div>
              ))}
            </div>

            <h2 style={{ color: "#f1f5f9", fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>My Bookings</h2>

            {user.bookings.length === 0 ? (
              <div style={{ ...cardStyle, padding: "3rem", textAlign: "center" as const }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
                <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>You have not booked any classes yet.</p>
                <Link href="/" style={{ backgroundColor: "#3b82f6", color: "white", padding: "0.75rem 1.5rem", borderRadius: 10, textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
                  Browse Classes
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" as const, gap: "1rem" }}>
                {user.bookings.map((booking) => (
                  <div key={booking.id} style={cardStyle}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ color: "#f1f5f9", fontWeight: 700, margin: "0 0 6px" }}>{booking.class.title}</h3>
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" as const }}>
                          <span style={{ color: "#3b82f6", fontSize: 13, fontWeight: 600 }}>{booking.class.subject}</span>
                          <span style={{ color: "#64748b", fontSize: 13 }}>{booking.class.priceEgp === 0 ? "Free" : booking.class.priceEgp + " EGP"}</span>
                          {booking.class.schedule && <span style={{ color: "#64748b", fontSize: 13 }}>🕐 {booking.class.schedule}</span>}
                          {booking.class.location && <span style={{ color: "#64748b", fontSize: 13 }}>📍 {booking.class.location}</span>}
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" as const, gap: 6, alignItems: "flex-end", marginLeft: 16 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, backgroundColor: statusColor(booking.status).bg, color: statusColor(booking.status).text }}>
                          {booking.status}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, backgroundColor: paymentColor(booking.paymentStatus).bg, color: paymentColor(booking.paymentStatus).text }}>
                          {booking.paymentStatus}
                        </span>
                      </div>
                    </div>
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #334155", display: "flex", gap: 10, alignItems: "center" }}>
                      <Link href={"/classes/" + booking.classId} style={{ color: "#3b82f6", fontSize: 13, textDecoration: "none", fontWeight: 600 }}>
                        View Class
                      </Link>
                      {booking.status !== "CANCELLED" && (
                        <CancelBookingButton bookingId={booking.id} cancelAction={cancelBooking} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TUTOR VIEW ── */}
        {role === "TUTOR" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Total Classes", value: user.ownedClasses.length, color: "#3b82f6" },
                { label: "Total Bookings", value: totalBookings, color: "#a78bfa" },
                { label: "Est. Revenue", value: totalRevenue + " EGP", color: "#4ade80" },
                { label: "Avg per Class", value: user.ownedClasses.length > 0 ? Math.round(totalRevenue / user.ownedClasses.length) + " EGP" : "0 EGP", color: "#fbbf24" },
              ].map((stat) => (
                <div key={stat.label} style={cardStyle}>
                  <div style={{ color: "#64748b", fontSize: 13, marginBottom: 6 }}>{stat.label}</div>
                  <div style={{ color: stat.color, fontSize: "1.5rem", fontWeight: 800 }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {(!user.bio || !user.phone || user.subjects.length === 0) && (
              <div style={{ backgroundColor: "#1c1917", border: "1px solid #92400e", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ color: "#fbbf24", fontWeight: 700, fontSize: 14 }}>Complete your profile</span>
                  <p style={{ color: "#a16207", fontSize: 13, margin: "4px 0 0" }}>Add your bio, subjects, and phone so students can find and contact you.</p>
                </div>
                <Link href={"/tutors/" + user.id + "/edit"} style={{ backgroundColor: "#d97706", color: "white", padding: "0.5rem 1rem", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" as const }}>
                  Edit Profile
                </Link>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ color: "#f1f5f9", fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>My Classes</h2>
              <Link href="/create-class" style={{ backgroundColor: "#3b82f6", color: "white", padding: "0.5rem 1.25rem", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                + New Class
              </Link>
            </div>

            {user.ownedClasses.length === 0 ? (
              <div style={{ ...cardStyle, padding: "3rem", textAlign: "center" as const }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📚</div>
                <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>You have not created any classes yet.</p>
                <Link href="/create-class" style={{ backgroundColor: "#3b82f6", color: "white", padding: "0.75rem 1.5rem", borderRadius: 10, textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
                  Create Your First Class
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" as const, gap: "1rem" }}>
                {user.ownedClasses.map((cls) => {
                  const spotsLeft = cls.capacity ? cls.capacity - cls._count.bookings : null;
                  const spotsWarning = spotsLeft !== null && spotsLeft <= 3 && spotsLeft > 0;
                  const isFull = spotsLeft !== null && spotsLeft <= 0;
                  return (
                    <div key={cls.id} style={cardStyle}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" as const }}>
                            <h3 style={{ color: "#f1f5f9", fontWeight: 700, margin: 0 }}>{cls.title}</h3>
                            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, backgroundColor: "#0f172a", border: "1px solid #334155", color: "#94a3b8" }}>{cls.format}</span>
                            {isFull && <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, backgroundColor: "#450a0a", color: "#fca5a5" }}>FULL</span>}
                            {spotsWarning && <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, backgroundColor: "#451a03", color: "#fdba74" }}>Only {spotsLeft} left</span>}
                          </div>
                          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" as const }}>
                            <span style={{ color: "#3b82f6", fontSize: 13 }}>{cls.subject}</span>
                            <span style={{ color: "#64748b", fontSize: 13 }}>{cls.priceEgp === 0 ? "Free" : cls.priceEgp + " EGP"}</span>
                            <span style={{ color: "#64748b", fontSize: 13 }}>{cls._count.bookings} bookings{cls.capacity ? " / " + cls.capacity : ""}</span>
                            {cls.gradeLevel && <span style={{ color: "#64748b", fontSize: 13 }}>{cls.gradeLevel}</span>}
                            {cls.schedule && <span style={{ color: "#64748b", fontSize: 13 }}>🕐 {cls.schedule}</span>}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, marginLeft: 16, alignItems: "center" }}>
                          <Link href={"/classes/" + cls.id} style={{ color: "#3b82f6", fontSize: 13, textDecoration: "none", fontWeight: 600 }}>View</Link>
                          <DeleteClassButton classId={cls.id} deleteAction={deleteClass} />
                        </div>
                      </div>
                      {cls.bookings.length > 0 && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #334155" }}>
                          <div style={{ color: "#64748b", fontSize: 12, marginBottom: 8, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>Students ({cls.bookings.length})</div>
                          <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
                            {cls.bookings.map((booking) => (
                              <div key={booking.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ color: "#94a3b8", fontSize: 13 }}>{booking.student.fullName ?? booking.student.email}</span>
                                <div style={{ display: "flex", gap: 6 }}>
                                  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, backgroundColor: statusColor(booking.status).bg, color: statusColor(booking.status).text }}>{booking.status}</span>
                                  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, backgroundColor: paymentColor(booking.paymentStatus).bg, color: paymentColor(booking.paymentStatus).text }}>{booking.paymentStatus}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── CENTER ADMIN VIEW ── */}
        {role === "CENTER_ADMIN" && (
          <div>
            {/* Center Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Total Classes", value: centerData?.classes.length ?? 0, color: "#3b82f6" },
                { label: "Total Tutors", value: centerData?.tutors.length ?? 0, color: "#38bdf8" },
                { label: "Total Bookings", value: centerTotalBookings, color: "#a78bfa" },
                { label: "Est. Revenue", value: centerTotalRevenue + " EGP", color: "#4ade80" },
              ].map((stat) => (
                <div key={stat.label} style={cardStyle}>
                  <div style={{ color: "#64748b", fontSize: 13, marginBottom: 6 }}>{stat.label}</div>
                  <div style={{ color: stat.color, fontSize: "1.5rem", fontWeight: 800 }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Center info banner */}
            {centerData && (
              <div style={{ ...cardStyle, marginBottom: "1.5rem", background: "linear-gradient(135deg, #1e3a5f, #1e293b)", border: "1px solid #1d4ed8" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ color: "#64748b", fontSize: 12, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: 0.5, marginBottom: 4 }}>Your Center</div>
                    <div style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 20 }}>{centerData.name}</div>
                    <div style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>{centerData.city}{centerData.location ? " · " + centerData.location : ""}</div>
                  </div>
                  <Link href={"/centers/" + centerData.id} style={{ backgroundColor: "#1d4ed8", color: "white", padding: "0.5rem 1.25rem", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                    View Public Page
                  </Link>
                </div>
              </div>
            )}

            {/* Tutors in center */}
            {centerData && centerData.tutors.length > 0 && (
              <div style={{ marginBottom: "2rem" }}>
                <h2 style={{ color: "#f1f5f9", fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
                  Tutors in {centerData.name} ({centerData.tutors.length})
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                  {centerData.tutors.map((tutor) => (
                    <div key={tutor.id} style={cardStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white", flexShrink: 0 }}>
                          {(tutor.fullName || tutor.name || "T")[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 14 }}>{tutor.fullName || tutor.name || "Unnamed"}</div>
                          <div style={{ color: "#64748b", fontSize: 12 }}>{tutor._count.ownedClasses} classes</div>
                        </div>
                      </div>
                      {tutor.subjects.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4, marginBottom: 8 }}>
                          {tutor.subjects.map(s => (
                            <span key={s} style={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 6, padding: "2px 8px", fontSize: 11, color: "#94a3b8" }}>{s}</span>
                          ))}
                        </div>
                      )}
                      <Link href={"/tutors/" + tutor.id} style={{ color: "#3b82f6", fontSize: 12, textDecoration: "none", fontWeight: 600 }}>
                        View Profile
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All center classes */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ color: "#f1f5f9", fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
                All Classes ({centerData?.classes.length ?? 0})
              </h2>
              <Link href="/create-class" style={{ backgroundColor: "#3b82f6", color: "white", padding: "0.5rem 1.25rem", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                + New Class
              </Link>
            </div>

            {!centerData || centerData.classes.length === 0 ? (
              <div style={{ ...cardStyle, padding: "3rem", textAlign: "center" as const }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏫</div>
                <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>No classes created yet for this center.</p>
                <Link href="/create-class" style={{ backgroundColor: "#3b82f6", color: "white", padding: "0.75rem 1.5rem", borderRadius: 10, textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
                  Create First Class
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" as const, gap: "1rem" }}>
                {centerData.classes.map((cls) => {
                  const spotsLeft = cls.capacity ? cls.capacity - cls._count.bookings : null;
                  const isFull = spotsLeft !== null && spotsLeft <= 0;
                  const spotsWarning = spotsLeft !== null && spotsLeft <= 3 && spotsLeft > 0;
                  return (
                    <div key={cls.id} style={cardStyle}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" as const }}>
                            <h3 style={{ color: "#f1f5f9", fontWeight: 700, margin: 0 }}>{cls.title}</h3>
                            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, backgroundColor: "#0f172a", border: "1px solid #334155", color: "#94a3b8" }}>{cls.format}</span>
                            {isFull && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, backgroundColor: "#450a0a", color: "#fca5a5" }}>FULL</span>}
                            {spotsWarning && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, backgroundColor: "#451a03", color: "#fdba74" }}>Only {spotsLeft} left</span>}
                          </div>
                          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" as const }}>
                            <span style={{ color: "#3b82f6", fontSize: 13 }}>{cls.subject}</span>
                            <span style={{ color: "#64748b", fontSize: 13 }}>{cls.priceEgp === 0 ? "Free" : cls.priceEgp + " EGP"}</span>
                            <span style={{ color: "#64748b", fontSize: 13 }}>{cls._count.bookings} bookings{cls.capacity ? " / " + cls.capacity : ""}</span>
                            {cls.owner && <span style={{ color: "#64748b", fontSize: 13 }}>by {cls.owner.fullName || cls.owner.name}</span>}
                            {cls.schedule && <span style={{ color: "#64748b", fontSize: 13 }}>🕐 {cls.schedule}</span>}
                          </div>
                        </div>
                        <Link href={"/classes/" + cls.id} style={{ color: "#3b82f6", fontSize: 13, textDecoration: "none", fontWeight: 600, marginLeft: 16 }}>
                          View
                        </Link>
                      </div>

                      {cls.bookings.length > 0 && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #334155" }}>
                          <div style={{ color: "#64748b", fontSize: 12, marginBottom: 8, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>
                            Students ({cls.bookings.length})
                          </div>
                          <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
                            {cls.bookings.map((booking) => (
                              <div key={booking.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ color: "#94a3b8", fontSize: 13 }}>{booking.student.fullName ?? booking.student.email}</span>
                                <div style={{ display: "flex", gap: 6 }}>
                                  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, backgroundColor: statusColor(booking.status).bg, color: statusColor(booking.status).text }}>{booking.status}</span>
                                  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, backgroundColor: paymentColor(booking.paymentStatus).bg, color: paymentColor(booking.paymentStatus).text }}>{booking.paymentStatus}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}