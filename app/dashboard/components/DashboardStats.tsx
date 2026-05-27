"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/app/components/i18n";
import { DashboardIcon } from "./DashboardPrimitives";
import type { DashData, DashboardStatsShape } from "./DashboardTypes";

function StatCard({
  label,
  value,
  icon,
  color,
  delay,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        borderInlineStart: `3px solid ${color}`,
        borderRadius: 16,
        padding: "1.15rem 1.25rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <span style={{ color, display: "inline-flex", marginBottom: 8 }}>
        <DashboardIcon name={icon} size={22} />
      </span>
      <div style={{ color: "var(--text-secondary)", fontSize: 11, fontWeight: 800, marginBottom: 6, textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ color, fontSize: "1.55rem", fontWeight: 850 }}>{value}</div>
    </motion.div>
  );
}

export default function DashboardStats({
  data,
  stats,
  isMobile,
}: {
  data: DashData;
  stats: DashboardStatsShape;
  isMobile: boolean;
}) {
  const { t } = useI18n();
  const { user, bookings, ownedClasses, centerData } = data;
  const role = user.role;
  const firstName = (user.fullName || user.name || "there").split(" ")[0];
  const profileFields = [!!user.bio, !!user.phone, user.subjects.length > 0, !!user.fullName];
  const profileComplete = profileFields.filter(Boolean).length;
  const profilePct = Math.round((profileComplete / profileFields.length) * 100);
  const showProfileNudge = role === "TUTOR" && profilePct < 100;
  const statItems =
    role === "STUDENT"
      ? [
          { label: "Bookings", value: bookings.length, icon: "bookings", color: "var(--accent)" },
          { label: "Confirmed", value: stats.confirmedBookings, icon: "check", color: "var(--success)" },
          { label: "Pending", value: stats.pendingBookings, icon: "clock", color: "var(--warning)" },
        ]
      : role === "TUTOR"
        ? [
            { label: "Classes", value: ownedClasses.length, icon: "classes", color: "var(--accent)" },
            { label: "Bookings", value: stats.totalBookings, icon: "students", color: "var(--accent-hover)" },
            { label: "Gross", value: `${stats.totalRevenue} EGP`, icon: "revenue", color: "var(--success)" },
            { label: "Avg / Class", value: `${ownedClasses.length ? Math.round(stats.totalRevenue / ownedClasses.length) : 0} EGP`, icon: "trend", color: "var(--rating)" },
          ]
        : [
            { label: "Classes", value: centerData?.classes.length ?? 0, icon: "classes", color: "var(--accent)" },
            { label: "Tutors", value: centerData?.tutors.length ?? 0, icon: "tutor", color: "var(--accent-hover)" },
            { label: "Bookings", value: stats.centerBookings, icon: "clipboard", color: "var(--rating)" },
            { label: "Gross", value: `${stats.centerRevenue} EGP`, icon: "revenue", color: "var(--success)" },
          ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{
          background: "linear-gradient(135deg, var(--bg-card), var(--bg-alt))",
          border: "1px solid var(--accent-border)",
          borderRadius: isMobile ? 14 : 20,
          padding: isMobile ? "0.875rem 1rem" : "1.75rem 2rem",
          marginBottom: isMobile ? "0.875rem" : "1.5rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ color: "var(--text)", fontSize: "clamp(1.3rem, 3vw, 1.7rem)", fontWeight: 850, margin: "0 0 6px" }}>
              {firstName}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 99, backgroundColor: "var(--accent-bg)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}>
                {role === "STUDENT" ? "Student" : role === "TUTOR" ? "Tutor" : "Center admin"}
              </span>
              <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{user.email}</span>
              {user.centerName && <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{user.centerName}</span>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {(role === "TUTOR" || role === "CENTER_ADMIN") && <Link href={`/tutors/${user.id}`} className="btn-secondary" style={{ textDecoration: "none" }}>{t("tutor.viewProfile")}</Link>}
            <Link href="/classes" className="btn-primary" style={{ textDecoration: "none" }}>{t("hero.browseClasses")}</Link>
          </div>
        </div>
      </motion.div>

      {showProfileNudge && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--warning)", borderRadius: 14, padding: isMobile ? "0.75rem 1rem" : "1rem 1.5rem", marginBottom: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}
        >
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "var(--warning)", fontWeight: 800, fontSize: 14 }}>Profile {profilePct}% complete</span>
              <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{profileComplete}/{profileFields.length}</span>
            </div>
            <div style={{ height: 6, backgroundColor: "var(--border-light)", borderRadius: 99, overflow: "hidden" }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${profilePct}%` }} transition={{ duration: 0.8 }} style={{ height: "100%", background: "var(--warning)", borderRadius: 99 }} />
            </div>
          </div>
          <Link href={`/tutors/${user.id}/edit`} className="btn-secondary" style={{ textDecoration: "none" }}>Edit profile</Link>
        </motion.div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(160px, 1fr))", gap: isMobile ? 8 : 12, marginBottom: isMobile ? "1rem" : "1.5rem" }}>
        {statItems.map((item, index) => <StatCard key={item.label} {...item} delay={0.08 + index * 0.04} />)}
      </div>
    </>
  );
}
