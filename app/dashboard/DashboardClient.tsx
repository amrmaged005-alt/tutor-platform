"use client";

import { useMemo } from "react";
import PageShell from "../../components/ui/PageShell";
import { useIsMobile } from "../hooks/useIsMobile";
import DashboardBookings from "./components/DashboardBookings";
import DashboardChecklist from "./components/DashboardChecklist";
import DashboardClasses from "./components/DashboardClasses";
import DashboardMaterials from "./components/DashboardMaterials";
import DashboardMessages from "./components/DashboardMessages";
import DashboardRevenue from "./components/DashboardRevenue";
import DashboardPayouts from "./components/DashboardPayouts";
import DashboardReviews from "./components/DashboardReviews";
import DashboardStats from "./components/DashboardStats";
import type { DashData } from "./components/DashboardTypes";
import DashboardSidebar from "@/components/ui/DashboardSidebar";

type Props = {
  data: DashData;
  cancelBooking: (formData: FormData) => Promise<void>;
  deleteClass: (formData: FormData) => Promise<void>;
};

export default function DashboardClient({ data, cancelBooking, deleteClass }: Props) {
  const isMobile = useIsMobile();
  const { user, bookings, ownedClasses, centerData } = data;
  const role = user.role;

  function exportDashboard() {
    window.location.href = "/api/dashboard/export";
  }

  const stats = useMemo(() => {
    const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED").length;
    const pendingBookings = bookings.filter((b) => b.status === "PENDING").length;
    const totalBookings = ownedClasses.reduce((sum, cls) => sum + cls.bookingsCount, 0);
    const totalRevenue = ownedClasses.reduce((sum, cls) => sum + cls.priceEgp * cls.bookingsCount, 0);
    const centerBookings = centerData?.classes.reduce((sum, cls) => sum + cls.bookingsCount, 0) ?? 0;
    const centerRevenue = centerData?.classes.reduce((sum, cls) => sum + cls.priceEgp * cls.bookingsCount, 0) ?? 0;

    return { confirmedBookings, pendingBookings, totalBookings, totalRevenue, centerBookings, centerRevenue };
  }, [bookings, centerData, ownedClasses]);

  return (
    <div className="dashboard-app-shell">
      <DashboardSidebar name={user.fullName ?? user.name ?? "Coursaty member"} />
      <div className="dashboard-app-content">
        <PageShell>
          {(role === "TUTOR" || role === "CENTER_ADMIN") && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
              <button type="button" onClick={exportDashboard} className="btn-secondary" style={{ fontSize: 12, padding: "5px 12px" }}>
                Export CSV
              </button>
            </div>
          )}

          <DashboardStats data={data} stats={stats} isMobile={isMobile} />

          {role === "STUDENT" && (
            <DashboardBookings bookings={bookings} cancelBooking={cancelBooking} isMobile={isMobile} />
          )}

          {role === "TUTOR" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1fr) minmax(0, 1.4fr)",
                gap: isMobile ? "1rem" : "1.25rem",
                alignItems: "start",
              }}
            >
              {/* Left column: checklist + upcoming bookings */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <DashboardChecklist tutorId={user.id} />
                <UpcomingBookingsPanel ownedClasses={ownedClasses} isMobile={isMobile} />
                <DashboardMessages />
              </div>

              {/* Right column: classes + revenue */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <DashboardClasses mode="tutor" classes={ownedClasses} deleteClass={deleteClass} isMobile={isMobile} />
                <DashboardRevenue
                  mode="tutor"
                  classes={ownedClasses}
                  totalBookings={stats.totalBookings}
                  totalRevenue={stats.totalRevenue}
                  isMobile={isMobile}
                />
                <DashboardReviews reviews={data.tutorReviews ?? []} />
                <DashboardPayouts />
              </div>
            </div>
          )}

          {role === "CENTER_ADMIN" && centerData && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1rem" }}>
                <DashboardMaterials classes={ownedClasses.map((cls) => ({ id: cls.id, title: cls.title, subject: cls.subject }))} />
                <DashboardMessages />
              </div>
              <DashboardClasses
                mode="center"
                centerData={centerData}
                classes={centerData.classes}
                isMobile={isMobile}
              />
              <DashboardRevenue
                mode="center"
                classes={centerData.classes}
                totalBookings={stats.centerBookings}
                totalRevenue={stats.centerRevenue}
                isMobile={isMobile}
              />
            </>
          )}
        </PageShell>
      </div>
    </div>
  );
}

/* Upcoming bookings panel — shows booked students per class for TUTOR */
function UpcomingBookingsPanel({
  ownedClasses,
  isMobile,
}: {
  ownedClasses: { id: string; title: string; subject: string; schedule: string | null; bookings: Array<{ id: string; studentName: string; status: string; paymentStatus: string }> }[];
  isMobile: boolean;
}) {
  const upcoming = ownedClasses
    .flatMap((cls) =>
      cls.bookings.filter((b) => b.status !== "CANCELLED").map((b) => ({
        bookingId: b.id,
        classTitle: cls.title,
        subject: cls.subject,
        schedule: cls.schedule,
        studentName: b.studentName,
        status: b.status,
        paymentStatus: b.paymentStatus,
      }))
    )
    .slice(0, 8);

  const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
    CONFIRMED: { bg: "var(--success-bg)", color: "var(--success)" },
    PENDING: { bg: "var(--warning-bg)", color: "var(--warning)" },
    CANCELLED: { bg: "var(--error-bg)", color: "var(--error)" },
    PAID: { bg: "var(--success-bg)", color: "var(--success)" },
  };

  return (
    <section
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: isMobile ? "0.75rem 1rem" : "1rem 1.25rem",
          borderBottom: "1px solid var(--border-light)",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "var(--text)" }}>
          Upcoming Bookings
        </h2>
        {upcoming.length > 0 && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 99,
              backgroundColor: "var(--accent-bg)",
              color: "var(--accent)",
            }}
          >
            {upcoming.length}
          </span>
        )}
      </div>

      {upcoming.length === 0 ? (
        <div style={{ padding: "2rem 1.25rem", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
          No upcoming bookings yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {upcoming.map((item, index) => {
            const statusStyle = STATUS_STYLE[item.status] ?? { bg: "var(--bg-alt)", color: "var(--text-muted)" };
            return (
              <div
                key={item.bookingId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "0.75rem 1.25rem",
                  borderTop: index > 0 ? "1px solid var(--border-light)" : "none",
                }}
              >
                <span
                  style={{
                    display: "grid",
                    width: 36,
                    height: 36,
                    placeItems: "center",
                    flexShrink: 0,
                    color: "var(--accent)",
                    background: "var(--accent-bg)",
                    borderRadius: "50%",
                    fontSize: 12,
                    fontWeight: 850,
                  }}
                >
                  {item.studentName.trim()[0]?.toUpperCase() ?? "S"}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <strong
                    style={{
                      display: "block",
                      overflow: "hidden",
                      color: "var(--text)",
                      fontSize: 13,
                      fontWeight: 700,
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.classTitle}
                  </strong>
                  <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
                    {item.studentName}
                    {item.schedule ? ` · ${item.schedule}` : ""}
                  </span>
                </span>
                <span
                  style={{
                    flexShrink: 0,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 99,
                    backgroundColor: statusStyle.bg,
                    color: statusStyle.color,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {item.status}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {upcoming.length > 0 && (
        <div style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid var(--border-light)" }}>
          <a
            href="/dashboard/bookings"
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--accent)",
              textDecoration: "none",
            }}
          >
            View full calendar
          </a>
        </div>
      )}
    </section>
  );
}
