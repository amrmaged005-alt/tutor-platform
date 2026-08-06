"use client";

import Link from "next/link";
import { motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useI18n } from "@/app/components/i18n";
import { DashboardIcon } from "./DashboardPrimitives";
import type { DashData, DashboardStatsShape } from "./DashboardTypes";

function getGreeting(): { key: "dash.greeting.morning" | "dash.greeting.afternoon" | "dash.greeting.evening"; emoji: string } {
  const hour = new Date().getHours();
  if (hour < 12) return { key: "dash.greeting.morning", emoji: "🌅" };
  if (hour < 18) return { key: "dash.greeting.afternoon", emoji: "☀️" };
  return { key: "dash.greeting.evening", emoji: "🌙" };
}

function getWeekRange(locale: string): string {
  const now = new Date();
  const day = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - day);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString(locale, { month: "short", day: "numeric" });
  return `${fmt(startOfWeek)} - ${fmt(endOfWeek)}, ${now.getFullYear()}`;
}

function StatCard({
  label,
  value,
  icon,
  color,
  delay,
  meta,
  trend,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  delay: number;
  meta?: string;
  trend?: "up" | "down";
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        borderRadius: 14,
        padding: "1.1rem 1.2rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <span
        style={{
          position: "absolute",
          insetInlineEnd: 14,
          insetBlockStart: 14,
          display: "inline-grid",
          width: 34,
          height: 34,
          placeItems: "center",
          color,
          background: "var(--accent-bg)",
          borderRadius: 999,
        }}
      >
        <DashboardIcon name={icon} size={18} />
      </span>
      <div
        style={{
          color: "var(--text-muted)",
          fontSize: 11,
          fontWeight: 700,
          marginBottom: 6,
          paddingInlineEnd: 44,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          color,
          fontSize: "clamp(1.75rem, 3vw, 2.4rem)",
          fontWeight: 850,
          lineHeight: 1.1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {typeof value === "number" ? <CountUp value={value} disabled={Boolean(reduceMotion)} /> : value}
      </div>
      {meta && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            marginTop: 6,
            fontSize: 11,
            fontWeight: 700,
            color:
              trend === "up"
                ? "var(--success)"
                : trend === "down"
                ? "var(--error)"
                : "var(--text-muted)",
          }}
        >
          {trend === "up" && <TrendingUp size={12} aria-hidden />}
          {trend === "down" && <TrendingDown size={12} aria-hidden />}
          {meta}
        </div>
      )}
    </motion.div>
  );
}

function CountUp({ value, disabled }: { value: number; disabled: boolean }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const motionValue = useMotionValue(disabled ? value : 0);
  const spring = useSpring(motionValue, { stiffness: 95, damping: 22 });
  const rounded = useTransform(spring, (latest) => Math.round(latest));

  useEffect(() => {
    if (inView || disabled) motionValue.set(value);
  }, [disabled, inView, motionValue, value]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
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
  const { t, lang } = useI18n();
  const { user, bookings, ownedClasses, tutorReviews, centerData } = data;
  const role = user.role;
  const canSeeRevenue =
    role !== "TUTOR" ||
    !user.centerId ||
    user.centerAccessLevel === "FULL";
  const firstName = (user.fullName || user.name || t("dash.greeting.fallbackName")).split(" ")[0];
  const { key: greetingKey, emoji } = getGreeting();
  const greeting = t(greetingKey);
  const weekRange = getWeekRange(lang === "ar" ? "ar-EG" : "en-EG");

  const avgRating =
    tutorReviews && tutorReviews.length > 0
      ? (tutorReviews.reduce((sum, r) => sum + r.rating, 0) / tutorReviews.length).toFixed(1)
      : null;

  const profileFields = [!!user.bio, !!user.phone, user.subjects.length > 0, !!user.fullName];
  const profileComplete = profileFields.filter(Boolean).length;
  const profilePct = Math.round((profileComplete / profileFields.length) * 100);
  const showProfileNudge = role === "TUTOR" && profilePct < 100;

  const statItems =
    role === "STUDENT"
      ? [
          { label: t("dash.stat.totalBookings"), value: bookings.length, icon: "bookings", color: "var(--accent)", meta: t("dash.meta.allTime") },
          { label: t("dash.stat.confirmed"), value: stats.confirmedBookings, icon: "check", color: "var(--success)", meta: t("dash.meta.active"), trend: "up" as const },
          { label: t("dash.stat.pending"), value: stats.pendingBookings, icon: "clock", color: "var(--warning)", meta: t("dash.meta.awaitingApproval") },
        ]
      : role === "TUTOR"
      ? [
          { label: t("dash.stat.totalBookings"), value: stats.totalBookings, icon: "students", color: "var(--accent)", meta: t("dash.meta.enrolledStudents"), trend: stats.totalBookings > 0 ? "up" as const : undefined },
          { label: t("dash.tab.classes"), value: ownedClasses.length, icon: "classes", color: "var(--accent-hover)", meta: t("dash.meta.activeClasses") },
          ...(canSeeRevenue
            ? [{ label: t("dash.stat.grossRevenue"), value: t("common.priceEgp", { price: stats.totalRevenue.toLocaleString() }), icon: "revenue", color: "var(--success)", meta: stats.totalRevenue > 0 ? t("dash.meta.lifetimeEarnings") : undefined, trend: stats.totalRevenue > 0 ? ("up" as const) : undefined }]
            : []),
          {
            label: t("dash.stat.avgRating"),
            value: avgRating ? `${avgRating} ★` : "—",
            icon: "trend",
            color: "var(--rating)",
            meta: tutorReviews && tutorReviews.length > 0 ? t("dash.meta.fromReviews", { n: tutorReviews.length }) : t("dash.meta.noReviews"),
          },
        ]
      : [
          { label: t("dash.stat.classes"), value: centerData?.classes.length ?? 0, icon: "classes", color: "var(--accent)", meta: t("dash.meta.active") },
          { label: t("landing.stats.tutors"), value: centerData?.tutors.length ?? 0, icon: "tutor", color: "var(--accent-hover)", meta: t("dash.meta.enrolled") },
          { label: t("dash.stat.bookings"), value: stats.centerBookings, icon: "clipboard", color: "var(--rating)", meta: t("dash.meta.total"), trend: stats.centerBookings > 0 ? "up" as const : undefined },
          { label: t("dash.stat.grossRevenue"), value: t("common.priceEgp", { price: stats.centerRevenue.toLocaleString() }), icon: "revenue", color: "var(--success)", meta: t("dash.meta.lifetime") },
        ];

  return (
    <>
      <motion.div
        initial={false}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          flexDirection: isMobile ? "column" : "row",
          gap: 8,
          marginBottom: isMobile ? "1rem" : "1.5rem",
        }}
      >
        <div>
          <h1
            style={{
              color: "var(--text)",
              fontSize: isMobile ? "1.35rem" : "clamp(1.5rem, 3vw, 1.85rem)",
              fontWeight: 850,
              margin: 0,
              letterSpacing: "-0.025em",
            }}
          >
            {greeting}, {firstName} {emoji}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "3px 0 0" }}>
            Here&apos;s what&apos;s happening with your{" "}
            {role === "STUDENT" ? "learning" : "tutoring"} this week.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span
            style={{
              color: "var(--text-muted)",
              fontSize: 12,
              fontWeight: 700,
              padding: "5px 10px",
              borderRadius: 8,
              background: "var(--bg-card)",
              border: "1px solid var(--border-light)",
              whiteSpace: "nowrap",
            }}
          >
            {weekRange}
          </span>
          {(role === "TUTOR" || role === "CENTER_ADMIN") && (
            <Link href={`/tutors/${user.id}`} className="btn-secondary" style={{ textDecoration: "none", fontSize: 12, padding: "5px 12px" }}>
              {t("tutor.viewProfile")}
            </Link>
          )}
          <Link href="/classes" className="btn-primary" style={{ textDecoration: "none", fontSize: 12, padding: "5px 12px" }}>
            {t("hero.browseClasses")}
          </Link>
        </div>
      </motion.div>

      {showProfileNudge && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--warning)",
            borderRadius: 12,
            padding: isMobile ? "0.75rem 1rem" : "0.9rem 1.25rem",
            marginBottom: "1.25rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ color: "var(--warning)", fontWeight: 800, fontSize: 13 }}>
                Profile {profilePct}% complete
              </span>
              <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
                {profileComplete}/{profileFields.length}
              </span>
            </div>
            <div style={{ height: 5, backgroundColor: "var(--border-light)", borderRadius: 99, overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${profilePct}%` }}
                transition={{ duration: 0.8 }}
                style={{ height: "100%", background: "var(--warning)", borderRadius: 99 }}
              />
            </div>
          </div>
          <Link href={`/tutors/${user.id}/edit`} className="btn-secondary" style={{ textDecoration: "none", fontSize: 12 }}>
            Complete profile
          </Link>
        </motion.div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : `repeat(${statItems.length}, 1fr)`,
          gap: isMobile ? 8 : 12,
          marginBottom: isMobile ? "1rem" : "1.5rem",
        }}
      >
        {statItems.map((item, index) => (
          <StatCard key={item.label} {...item} delay={0.08 + index * 0.04} />
        ))}
      </div>
    </>
  );
}
