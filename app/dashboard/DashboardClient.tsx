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
    <PageShell>
      {(role === "TUTOR" || role === "CENTER_ADMIN") && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <button type="button" onClick={exportDashboard} className="btn-secondary">Export CSV</button>
        </div>
      )}
      <DashboardStats data={data} stats={stats} isMobile={isMobile} />
      {role === "TUTOR" && <DashboardChecklist tutorId={user.id} />}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 12,
          marginBottom: isMobile ? "1rem" : "1.5rem",
        }}
      >
        {(role === "TUTOR" || role === "CENTER_ADMIN") && (
          <DashboardMaterials classes={ownedClasses.map((cls) => ({ id: cls.id, title: cls.title, subject: cls.subject }))} />
        )}
        <DashboardMessages />
      </div>

      {role === "STUDENT" && (
        <DashboardBookings bookings={bookings} cancelBooking={cancelBooking} isMobile={isMobile} />
      )}

      {role === "TUTOR" && (
        <>
          <DashboardClasses
            mode="tutor"
            classes={ownedClasses}
            deleteClass={deleteClass}
            isMobile={isMobile}
          />
          <DashboardRevenue
            mode="tutor"
            classes={ownedClasses}
            totalBookings={stats.totalBookings}
            totalRevenue={stats.totalRevenue}
            isMobile={isMobile}
          />
          <DashboardReviews reviews={data.tutorReviews ?? []} />
          <DashboardPayouts />
        </>
      )}

      {role === "CENTER_ADMIN" && centerData && (
        <>
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
  );
}
