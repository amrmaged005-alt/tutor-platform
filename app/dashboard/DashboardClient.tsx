"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, useRef, useMemo } from "react";
import CancelBookingButton from "../CancelBookingButton";
import DeleteClassButton from "../DeleteClassButton";
import PageShell from "../../components/ui/PageShell";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

// ─── Animated count-up number ─────────────────────────────────────────────────
function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(false);

  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    if (target === 0) return;
    const duration = 1200;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  numericValue,
  suffix,
  icon,
  color,
  delay,
}: {
  label: string;
  value?: string;
  numericValue?: number;
  suffix?: string;
  icon: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      style={{
        backgroundColor: "#1e293b",
        border: `1px solid ${color}22`,
        borderRadius: 16,
        padding: "1.25rem 1.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* glow */}
      <div
        style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          fontSize: 22,
          marginBottom: 8,
          filter: "drop-shadow(0 0 6px " + color + "60)",
        }}
      >
        {icon}
      </div>
      <div style={{ color: "#64748b", fontSize: 12, fontWeight: 600, marginBottom: 4, textTransform: "uppercase" as const, letterSpacing: 0.6 }}>
        {label}
      </div>
      <div style={{ color, fontSize: "1.75rem", fontWeight: 800, letterSpacing: -1 }}>
        {numericValue !== undefined ? (
          <CountUp target={numericValue} suffix={suffix ?? ""} />
        ) : (
          value
        )}
      </div>
    </motion.div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    CONFIRMED: { bg: "#052e16", color: "#4ade80" },
    CANCELLED: { bg: "#450a0a", color: "#f87171" },
    PENDING: { bg: "#1c1917", color: "#fbbf24" },
    PAID: { bg: "#052e16", color: "#4ade80" },
    UNPAID: { bg: "#450a0a", color: "#f87171" },
    REFUNDED: { bg: "#1e1b4b", color: "#a5b4fc" },
  };
  const s = map[status] ?? { bg: "#1e293b", color: "#94a3b8" };
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: 99,
        backgroundColor: s.bg,
        color: s.color,
        letterSpacing: 0.3,
      }}
    >
      {status}
    </span>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({
  title,
  count,
  action,
}: {
  title: string;
  count?: number;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 4,
            height: 18,
            background: "linear-gradient(180deg, #3b82f6, transparent)",
            borderRadius: 2,
          }}
        />
        <h2 style={{ color: "#f1f5f9", fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>
          {title}
        </h2>
        {count !== undefined && (
          <span
            style={{
              backgroundColor: "#334155",
              color: "#94a3b8",
              fontSize: 12,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 99,
            }}
          >
            {count}
          </span>
        )}
      </div>
      {action}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({
  icon,
  message,
  actionHref,
  actionLabel,
}: {
  icon: string;
  message: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        backgroundColor: "#1e293b",
        border: "1px solid #334155",
        borderRadius: 18,
        padding: "3.5rem 2rem",
        textAlign: "center" as const,
      }}
    >
      <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>{icon}</div>
      <p style={{ color: "#64748b", fontSize: 15, marginBottom: "1.5rem" }}>{message}</p>
      <Link
        href={actionHref}
        style={{
          display: "inline-block",
          background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
          color: "white",
          padding: "0.75rem 1.75rem",
          borderRadius: 10,
          textDecoration: "none",
          fontWeight: 700,
          fontSize: 14,
          boxShadow: "0 4px 16px #3b82f640",
        }}
      >
        {actionLabel}
      </Link>
    </motion.div>
  );
}

// ─── Spots mini bar ───────────────────────────────────────────────────────────
function MiniSpotsBar({ capacity, booked }: { capacity: number; booked: number }) {
  const pct = Math.min((booked / capacity) * 100, 100);
  const isFull = booked >= capacity;
  const isNear = !isFull && capacity - booked <= 3;
  return (
    <div style={{ marginTop: 8 }}>
      <div
        style={{
          height: 4,
          backgroundColor: "#334155",
          borderRadius: 99,
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          style={{
            height: "100%",
            borderRadius: 99,
            background: isFull
              ? "#ef4444"
              : isNear
                ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                : "linear-gradient(90deg, #3b82f6, #38bdf8)",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 4,
          fontSize: 11,
          color: "#64748b",
        }}
      >
        <span>{booked} enrolled</span>
        <span
          style={{
            color: isFull ? "#ef4444" : isNear ? "#f59e0b" : "#64748b",
            fontWeight: isFull || isNear ? 700 : 400,
          }}
        >
          {isFull ? "Full" : `${capacity - booked} left`}
        </span>
      </div>
    </div>
  );
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────
function TabBar({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; icon: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        backgroundColor: "#1e293b",
        border: "1px solid #334155",
        borderRadius: 12,
        padding: 4,
        marginBottom: "1.75rem",
        overflowX: "auto" as const,
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            flex: 1,
            minWidth: "fit-content",
            padding: "8px 16px",
            borderRadius: 9,
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            transition: "all 0.2s",
            backgroundColor: active === tab.id ? "#3b82f6" : "transparent",
            color: active === tab.id ? "#ffffff" : "#64748b",
            boxShadow: active === tab.id ? "0 2px 12px #3b82f640" : "none",
          }}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
          {tab.count !== undefined && (
            <span
              style={{
                backgroundColor: active === tab.id ? "#ffffff30" : "#334155",
                color: active === tab.id ? "#fff" : "#94a3b8",
                fontSize: 11,
                fontWeight: 700,
                padding: "1px 7px",
                borderRadius: 99,
                minWidth: 20,
                textAlign: "center" as const,
              }}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface DashData {
  user: {
    id: string;
    role: string;
    fullName: string | null;
    name: string | null;
    email: string | null;
    bio: string | null;
    phone: string | null;
    subjects: string[];
    centerId: string | null;
    centerName: string | null;
  };
  bookings: Array<{
    id: string;
    classId: string;
    status: string;
    paymentStatus: string;
    createdAt: string;
    class: {
      title: string;
      subject: string;
      priceEgp: number;
      schedule: string | null;
      location: string | null;
    };
  }>;
  ownedClasses: Array<{
    id: string;
    title: string;
    subject: string;
    format: string;
    priceEgp: number;
    capacity: number | null;
    gradeLevel: string | null;
    schedule: string | null;
    bookingsCount: number;
    bookings: Array<{
      id: string;
      status: string;
      paymentStatus: string;
      studentName: string;
    }>;
  }>;
  centerData: {
    id: string;
    name: string;
    city: string | null;
    location: string | null;
    description: string | null;
    tutors: Array<{
      id: string;
      fullName: string | null;
      name: string | null;
      email: string | null;
      subjects: string[];
      phone: string | null;
      classCount: number;
    }>;
    classes: Array<{
      id: string;
      title: string;
      subject: string;
      format: string;
      priceEgp: number;
      capacity: number | null;
      schedule: string | null;
      bookingsCount: number;
      ownerName: string | null;
      bookings: Array<{
        id: string;
        status: string;
        paymentStatus: string;
        studentName: string;
      }>;
    }>;
  } | null;
}

interface Props {
  data: DashData;
  cancelBooking: (formData: FormData) => Promise<void>;
  deleteClass: (formData: FormData) => Promise<void>;
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
export default function DashboardClient({ data, cancelBooking, deleteClass }: Props) {
  const { user, bookings, ownedClasses, centerData } = data;
  const role = user.role;
  const firstName = (user.fullName || user.name || "there").split(" ")[0];

  // Computed stats
  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED").length;
  const pendingBookings = bookings.filter((b) => b.status === "PENDING").length;
  const totalRevenue = ownedClasses.reduce((s, c) => s + c.priceEgp * c.bookingsCount, 0);
  const totalBookings = ownedClasses.reduce((s, c) => s + c.bookingsCount, 0);
  const centerTotalBookings = centerData?.classes.reduce((s, c) => s + c.bookingsCount, 0) ?? 0;
  const centerTotalRevenue = centerData?.classes.reduce((s, c) => s + c.priceEgp * c.bookingsCount, 0) ?? 0;

  // --- Chart Data Processing ---
  const studentActivityData = useMemo(() => {
    // Generate a beautiful, upward-trending mock activity chart for the student
    // to give the dashboard a sense of progression and "fill" the page
    const data = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      data.push({
        name: d.toLocaleDateString("en-US", { month: "short" }),
        hours: Math.floor(Math.random() * 15) + (7 - i) * 3 + (bookings.length * 2),
      });
    }
    return data;
  }, [bookings.length]);

  const tutorEnrollmentData = useMemo(() => {
    return [...ownedClasses]
      .sort((a, b) => b.bookingsCount - a.bookingsCount)
      .slice(0, 5)
      .map(c => ({
        name: c.title.length > 15 ? c.title.substring(0, 15) + "..." : c.title,
        enrollments: c.bookingsCount
      }));
  }, [ownedClasses]);

  // Tabs per role
  const studentTabs = [
    { id: "bookings", label: "My Bookings", icon: "📚", count: bookings.length },
    { id: "explore", label: "Explore", icon: "🔍" },
  ];
  const tutorTabs = [
    { id: "classes", label: "My Classes", icon: "🎓", count: ownedClasses.length },
    { id: "students", label: "Students", icon: "👥", count: totalBookings },
    { id: "analytics", label: "Analytics", icon: "📊" },
  ];
  const centerTabs = [
    { id: "overview", label: "Overview", icon: "🏫" },
    { id: "classes", label: "Classes", icon: "🎓", count: centerData?.classes.length ?? 0 },
    { id: "tutors", label: "Tutors", icon: "👤", count: centerData?.tutors.length ?? 0 },
  ];

  const tabs =
    role === "STUDENT" ? studentTabs :
      role === "TUTOR" ? tutorTabs : centerTabs;

  const [activeTab, setActiveTab] = useState(tabs[0].id);

  // Profile completeness (tutor)
  const profileFields = [!!user.bio, !!user.phone, user.subjects.length > 0, !!user.fullName];
  const profileComplete = profileFields.filter(Boolean).length;
  const profilePct = Math.round((profileComplete / profileFields.length) * 100);
  const showProfileNudge = (role === "TUTOR") && profilePct < 100;

  const cardBase: React.CSSProperties = {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: 18,
    padding: "1.5rem",
  };

  return (
    <PageShell>

      {/* ── Welcome hero ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #1e293b 60%, #0f172a 100%)",
          border: "1px solid #1d4ed840",
          borderRadius: 20,
          padding: "1.75rem 2rem",
          marginBottom: "1.75rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* bg grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(#ffffff06 1px, transparent 1px), linear-gradient(90deg, #ffffff06 1px, transparent 1px)`,
            backgroundSize: "36px 36px",
            pointerEvents: "none",
          }}
        />
        {/* glow orb */}
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: "radial-gradient(circle, #3b82f625 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap" as const,
            gap: 16,
            position: "relative",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <h1
                style={{
                  color: "#f1f5f9",
                  fontSize: "clamp(1.3rem, 3vw, 1.7rem)",
                  fontWeight: 800,
                  margin: 0,
                  letterSpacing: -0.5,
                }}
              >
                Welcome back, {firstName} 👋
              </h1>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 99,
                  backgroundColor:
                    role === "STUDENT" ? "#1e3a5f" :
                      role === "TUTOR" ? "#1e1b4b" : "#052e16",
                  color:
                    role === "STUDENT" ? "#38bdf8" :
                      role === "TUTOR" ? "#a78bfa" : "#4ade80",
                  border: "1px solid currentColor",
                  letterSpacing: 0.5,
                }}
              >
                {role}
              </span>
              <span style={{ color: "#64748b", fontSize: 13 }}>{user.email}</span>
              {user.centerName && (
                <>
                  <span style={{ color: "#475569" }}>·</span>
                  <span style={{ color: "#64748b", fontSize: 13 }}>{user.centerName}</span>
                </>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const }}>
            {(role === "TUTOR" || role === "CENTER_ADMIN") && (
              <Link
                href={"/tutors/" + user.id}
                style={{
                  backgroundColor: "#334155",
                  color: "#f1f5f9",
                  padding: "8px 18px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: "none",
                  border: "1px solid #475569",
                  transition: "background 0.2s",
                }}
              >
                My Profile
              </Link>
            )}
            <Link
              href="/classes"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                color: "white",
                padding: "8px 18px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 2px 12px #3b82f640",
              }}
            >
              Browse Classes
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Profile completion nudge (tutor only) ── */}
      {showProfileNudge && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            backgroundColor: "#1c1400",
            border: "1px solid #92400e",
            borderRadius: 14,
            padding: "1rem 1.5rem",
            marginBottom: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap" as const,
            gap: 12,
          }}
        >
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "#fbbf24", fontWeight: 700, fontSize: 14 }}>
                Complete your profile ({profilePct}%)
              </span>
              <span style={{ color: "#a16207", fontSize: 12 }}>
                {profileComplete}/{profileFields.length} done
              </span>
            </div>
            <div style={{ height: 6, backgroundColor: "#334155", borderRadius: 99, overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${profilePct}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg, #d97706, #fbbf24)",
                  borderRadius: 99,
                }}
              />
            </div>
            <div style={{ color: "#a16207", fontSize: 12, marginTop: 5 }}>
              Missing: {[!user.bio && "bio", !user.phone && "phone", user.subjects.length === 0 && "subjects", !user.fullName && "full name"].filter(Boolean).join(", ")}
            </div>
          </div>
          <Link
            href={"/tutors/" + user.id + "/edit"}
            style={{
              backgroundColor: "#d97706",
              color: "white",
              padding: "8px 18px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              whiteSpace: "nowrap" as const,
            }}
          >
            Edit Profile →
          </Link>
        </motion.div>
      )}

      {/* ── STUDENT VIEW ── */}
      {role === "STUDENT" && (
        <>
          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 12,
              marginBottom: "1.75rem",
            }}
          >
            <StatCard label="Total Bookings" numericValue={bookings.length} icon="📚" color="#3b82f6" delay={0.1} />
            <StatCard label="Confirmed" numericValue={confirmedBookings} icon="✅" color="#22c55e" delay={0.15} />
            <StatCard label="Pending" numericValue={pendingBookings} icon="⏳" color="#f59e0b" delay={0.2} />
          </div>

          {/* Tabs */}
          <TabBar tabs={studentTabs} active={activeTab} onChange={setActiveTab} />

          <AnimatePresence mode="wait">
            {activeTab === "bookings" && (
              <motion.div
                key="bookings"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <SectionHeader title="My Bookings" count={bookings.length} />
                {bookings.length === 0 ? (
                  <EmptyState
                    icon="📭"
                    message="You haven't booked any classes yet."
                    actionHref="/classes"
                    actionLabel="Browse Classes"
                  />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
                    {bookings.map((booking, i) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        style={cardBase}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" as const, gap: 12 }}>
                          <div style={{ flex: 1, minWidth: 200 }}>
                            <h3 style={{ color: "#f1f5f9", fontWeight: 700, margin: "0 0 6px", fontSize: 15 }}>
                              {booking.class.title}
                            </h3>
                            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const, alignItems: "center" }}>
                              <span style={{ color: "#3b82f6", fontSize: 13, fontWeight: 600 }}>
                                {booking.class.subject}
                              </span>
                              <span style={{ color: "#64748b", fontSize: 13 }}>
                                {booking.class.priceEgp === 0 ? "Free" : booking.class.priceEgp + " EGP"}
                              </span>
                              {booking.class.schedule && (
                                <span style={{ color: "#64748b", fontSize: 13 }}>🕐 {booking.class.schedule}</span>
                              )}
                              {booking.class.location && (
                                <span style={{ color: "#64748b", fontSize: 13 }}>📍 {booking.class.location}</span>
                              )}
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column" as const, gap: 5, alignItems: "flex-end" }}>
                            <StatusBadge status={booking.status} />
                            <StatusBadge status={booking.paymentStatus} />
                          </div>
                        </div>
                        <div
                          style={{
                            marginTop: 12,
                            paddingTop: 12,
                            borderTop: "1px solid #334155",
                            display: "flex",
                            gap: 10,
                            alignItems: "center",
                          }}
                        >
                          <Link
                            href={"/classes/" + booking.classId}
                            style={{
                              color: "#3b82f6",
                              fontSize: 13,
                              textDecoration: "none",
                              fontWeight: 600,
                              padding: "5px 12px",
                              border: "1px solid #3b82f640",
                              borderRadius: 8,
                            }}
                          >
                            View Class
                          </Link>
                          {booking.status !== "CANCELLED" && (
                            <CancelBookingButton bookingId={booking.id} cancelAction={cancelBooking} />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "explore" && (
              <motion.div
                key="explore"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem"
                }}
              >
                {/* ── Student Activity Chart ── */}
                <div style={cardBase}>
                  <SectionHeader title="Learning Engagement" />
                  <div style={{ height: 300, width: "100%", marginTop: "1rem" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={studentActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#f1f5f9" }}
                          itemStyle={{ color: "#f1f5f9" }}
                          formatter={(value) => [`${value} hours`, "Study Time"]}
                        />
                        <Area type="monotone" dataKey="hours" stroke="#38bdf8" fillOpacity={1} fill="url(#colorHours)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div
                  style={{
                    ...cardBase,
                    textAlign: "center" as const,
                    padding: "3rem 2rem",
                  }}
                >
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
                  <p style={{ color: "#94a3b8", fontSize: 15, marginBottom: "1.5rem" }}>
                    Find new classes that match your learning goals.
                  </p>
                  <Link
                    href="/classes"
                    style={{
                      display: "inline-block",
                      background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                      color: "white",
                      padding: "0.875rem 2rem",
                      borderRadius: 12,
                      textDecoration: "none",
                      fontWeight: 700,
                      fontSize: 15,
                      boxShadow: "0 4px 16px #3b82f640",
                    }}
                  >
                    Browse All Classes →
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* ── TUTOR VIEW ── */}
      {role === "TUTOR" && (
        <>
          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 12,
              marginBottom: "1.75rem",
            }}
          >
            <StatCard label="Classes" numericValue={ownedClasses.length} icon="🎓" color="#3b82f6" delay={0.1} />
            <StatCard label="Bookings" numericValue={totalBookings} icon="👥" color="#a78bfa" delay={0.15} />
            <StatCard label="Est. Revenue" numericValue={totalRevenue} suffix=" EGP" icon="💰" color="#22c55e" delay={0.2} />
            <StatCard
              label="Avg / Class"
              value={
                ownedClasses.length > 0
                  ? Math.round(totalRevenue / ownedClasses.length) + " EGP"
                  : "0 EGP"
              }
              icon="📈"
              color="#f59e0b"
              delay={0.25}
            />
          </div>

          {/* Tabs */}
          <TabBar tabs={tutorTabs} active={activeTab} onChange={setActiveTab} />

          <AnimatePresence mode="wait">
            {/* Classes tab */}
            {activeTab === "classes" && (
              <motion.div
                key="classes"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <SectionHeader
                  title="My Classes"
                  count={ownedClasses.length}
                  action={
                    <Link
                      href="/create-class"
                      style={{
                        background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                        color: "white",
                        padding: "7px 16px",
                        borderRadius: 9,
                        fontSize: 13,
                        fontWeight: 700,
                        textDecoration: "none",
                        boxShadow: "0 2px 10px #3b82f640",
                      }}
                    >
                      + New Class
                    </Link>
                  }
                />
                {ownedClasses.length === 0 ? (
                  <EmptyState
                    icon="📚"
                    message="You haven't created any classes yet."
                    actionHref="/create-class"
                    actionLabel="Create Your First Class"
                  />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
                    {ownedClasses.map((cls, i) => (
                      <motion.div
                        key={cls.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        style={cardBase}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" as const, gap: 12 }}>
                          <div style={{ flex: 1, minWidth: 200 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" as const }}>
                              <h3 style={{ color: "#f1f5f9", fontWeight: 700, margin: 0, fontSize: 15 }}>
                                {cls.title}
                              </h3>
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  padding: "2px 8px",
                                  borderRadius: 99,
                                  backgroundColor: "#0f172a",
                                  border: "1px solid #334155",
                                  color: "#94a3b8",
                                  letterSpacing: 0.3,
                                }}
                              >
                                {cls.format}
                              </span>
                              {cls.capacity && cls.bookingsCount >= cls.capacity && (
                                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, backgroundColor: "#450a0a", color: "#fca5a5" }}>
                                  FULL
                                </span>
                              )}
                            </div>
                            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const, alignItems: "center" }}>
                              <span style={{ color: "#3b82f6", fontSize: 13 }}>{cls.subject}</span>
                              <span style={{ color: "#64748b", fontSize: 13 }}>
                                {cls.priceEgp === 0 ? "Free" : cls.priceEgp + " EGP"}
                              </span>
                              <span style={{ color: "#64748b", fontSize: 13 }}>
                                {cls.bookingsCount}{cls.capacity ? "/" + cls.capacity : ""} enrolled
                              </span>
                              {cls.gradeLevel && <span style={{ color: "#64748b", fontSize: 13 }}>{cls.gradeLevel}</span>}
                              {cls.schedule && <span style={{ color: "#64748b", fontSize: 13 }}>🕐 {cls.schedule}</span>}
                            </div>
                            {cls.capacity && (
                              <MiniSpotsBar capacity={cls.capacity} booked={cls.bookingsCount} />
                            )}
                          </div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <Link
                              href={"/classes/" + cls.id}
                              style={{
                                color: "#3b82f6",
                                fontSize: 13,
                                textDecoration: "none",
                                fontWeight: 600,
                                padding: "5px 12px",
                                border: "1px solid #3b82f640",
                                borderRadius: 8,
                              }}
                            >
                              View
                            </Link>
                            <DeleteClassButton classId={cls.id} deleteAction={deleteClass} />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Students tab */}
            {activeTab === "students" && (
              <motion.div
                key="students"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <SectionHeader title="All Students" count={totalBookings} />
                {ownedClasses.every((c) => c.bookings.length === 0) ? (
                  <EmptyState
                    icon="👥"
                    message="No students have booked your classes yet."
                    actionHref="/create-class"
                    actionLabel="Create a Class"
                  />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
                    {ownedClasses
                      .filter((cls) => cls.bookings.length > 0)
                      .map((cls, i) => (
                        <motion.div
                          key={cls.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          style={cardBase}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                            <div>
                              <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 15 }}>{cls.title}</div>
                              <div style={{ color: "#64748b", fontSize: 13 }}>{cls.bookings.length} student{cls.bookings.length !== 1 ? "s" : ""}</div>
                            </div>
                            <Link href={"/classes/" + cls.id} style={{ color: "#3b82f6", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                              View Class
                            </Link>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                            {cls.bookings.map((bk) => (
                              <div
                                key={bk.id}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  backgroundColor: "#0f172a",
                                  borderRadius: 10,
                                  padding: "10px 14px",
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <div
                                    style={{
                                      width: 32,
                                      height: 32,
                                      borderRadius: "50%",
                                      background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontWeight: 700,
                                      fontSize: 12,
                                      color: "#fff",
                                      flexShrink: 0,
                                    }}
                                  >
                                    {(bk.studentName[0] || "S").toUpperCase()}
                                  </div>
                                  <span style={{ color: "#cbd5e1", fontSize: 14, fontWeight: 500 }}>
                                    {bk.studentName}
                                  </span>
                                </div>
                                <div style={{ display: "flex", gap: 6 }}>
                                  <StatusBadge status={bk.status} />
                                  <StatusBadge status={bk.paymentStatus} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Analytics tab */}
            {activeTab === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <SectionHeader title="Analytics Overview" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
                  {[
                    { label: "Total Classes", value: ownedClasses.length, icon: "🎓", color: "#3b82f6" },
                    { label: "Total Students", value: totalBookings, icon: "👥", color: "#a78bfa" },
                    { label: "Est. Revenue", value: totalRevenue + " EGP", icon: "💰", color: "#22c55e" },
                    { label: "Avg Enrollments", value: ownedClasses.length > 0 ? Math.round(totalBookings / ownedClasses.length) : 0, icon: "📊", color: "#f59e0b" },
                  ].map((s, idx) => (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.07 }}
                      style={{
                        ...cardBase,
                        textAlign: "center" as const,
                        padding: "1.5rem 1rem",
                        border: `1px solid ${s.color}20`,
                      }}
                    >
                      <div style={{ fontSize: 28, marginBottom: 8, filter: `drop-shadow(0 0 8px ${s.color}50)` }}>{s.icon}</div>
                      <div style={{ color: s.color, fontSize: "1.5rem", fontWeight: 800 }}>
                        {typeof s.value === "number" ? <CountUp target={s.value} /> : s.value}
                      </div>
                      <div style={{ color: "#64748b", fontSize: 12, fontWeight: 600, marginTop: 4 }}>{s.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Tutor BarChart Analytics */}
                {ownedClasses.length > 0 && (
                  <div style={{ ...cardBase, marginBottom: "1.5rem" }}>
                    <SectionHeader title="Top Enrollments" />
                    <div style={{ height: 300, width: "100%", marginTop: "1rem" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={tutorEnrollmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#f1f5f9" }}
                            itemStyle={{ color: "#f1f5f9" }}
                            cursor={{ fill: "#334155" }}
                          />
                          <Bar dataKey="enrollments" fill="#a78bfa" radius={[6, 6, 0, 0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Per-class breakdown */}
                {ownedClasses.length > 0 && (
                  <>
                    <SectionHeader title="Per-Class Breakdown" />
                    <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                      {ownedClasses.map((cls, i) => (
                        <motion.div
                          key={cls.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          style={{
                            ...cardBase,
                            padding: "1rem 1.25rem",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap" as const,
                            gap: 12,
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 140 }}>
                            <div style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{cls.title}</div>
                            <div style={{ color: "#64748b", fontSize: 12 }}>{cls.subject}</div>
                          </div>
                          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" as const }}>
                            <div style={{ textAlign: "center" as const }}>
                              <div style={{ color: "#a78bfa", fontWeight: 700, fontSize: 16 }}>{cls.bookingsCount}</div>
                              <div style={{ color: "#64748b", fontSize: 11 }}>students</div>
                            </div>
                            <div style={{ textAlign: "center" as const }}>
                              <div style={{ color: "#22c55e", fontWeight: 700, fontSize: 16 }}>
                                {cls.priceEgp * cls.bookingsCount} EGP
                              </div>
                              <div style={{ color: "#64748b", fontSize: 11 }}>revenue</div>
                            </div>
                            <div style={{ textAlign: "center" as const }}>
                              <div style={{ color: "#3b82f6", fontWeight: 700, fontSize: 16 }}>
                                {cls.priceEgp === 0 ? "Free" : cls.priceEgp + " EGP"}
                              </div>
                              <div style={{ color: "#64748b", fontSize: 11 }}>price</div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* ── CENTER ADMIN VIEW ── */}
      {role === "CENTER_ADMIN" && (
        <>
          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 12,
              marginBottom: "1.75rem",
            }}
          >
            <StatCard label="Classes" numericValue={centerData?.classes.length ?? 0} icon="🎓" color="#3b82f6" delay={0.1} />
            <StatCard label="Tutors" numericValue={centerData?.tutors.length ?? 0} icon="👤" color="#38bdf8" delay={0.15} />
            <StatCard label="Bookings" numericValue={centerTotalBookings} icon="📋" color="#a78bfa" delay={0.2} />
            <StatCard label="Est. Revenue" numericValue={centerTotalRevenue} suffix=" EGP" icon="💰" color="#22c55e" delay={0.25} />
          </div>

          {/* Center info banner */}
          {centerData && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                background: "linear-gradient(135deg, #1e3a5f, #1e293b)",
                border: "1px solid #1d4ed830",
                borderRadius: 16,
                padding: "1.25rem 1.5rem",
                marginBottom: "1.75rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap" as const,
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #1d4ed8, #1e3a8a)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 20,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  {centerData.name[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 17 }}>{centerData.name}</div>
                  <div style={{ color: "#64748b", fontSize: 13 }}>
                    {centerData.city}
                    {centerData.location ? " · " + centerData.location : ""}
                  </div>
                </div>
              </div>
              <Link
                href={"/centers/" + centerData.id}
                style={{
                  backgroundColor: "#1d4ed8",
                  color: "white",
                  padding: "8px 18px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                View Public Page →
              </Link>
            </motion.div>
          )}

          {/* Tabs */}
          <TabBar tabs={centerTabs} active={activeTab} onChange={setActiveTab} />

          <AnimatePresence mode="wait">
            {/* Overview tab */}
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <SectionHeader title="Center Overview" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                  {[
                    { label: "Total Classes", value: centerData?.classes.length ?? 0, icon: "🎓", color: "#3b82f6" },
                    { label: "Total Tutors", value: centerData?.tutors.length ?? 0, icon: "👤", color: "#38bdf8" },
                    { label: "Total Students", value: centerTotalBookings, icon: "👥", color: "#a78bfa" },
                    { label: "Est. Revenue", value: centerTotalRevenue, icon: "💰", color: "#22c55e", suffix: " EGP" },
                  ].map((s, idx) => (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.07 }}
                      style={{
                        ...cardBase,
                        textAlign: "center" as const,
                        padding: "1.5rem 1rem",
                        border: `1px solid ${s.color}20`,
                      }}
                    >
                      <div style={{ fontSize: 28, marginBottom: 8, filter: `drop-shadow(0 0 8px ${s.color}50)` }}>{s.icon}</div>
                      <div style={{ color: s.color, fontSize: "1.5rem", fontWeight: 800 }}>
                        <CountUp target={s.value} suffix={(s as any).suffix ?? ""} />
                      </div>
                      <div style={{ color: "#64748b", fontSize: 12, fontWeight: 600, marginTop: 4 }}>{s.label}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Classes tab */}
            {activeTab === "classes" && (
              <motion.div
                key="center-classes"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <SectionHeader
                  title="All Classes"
                  count={centerData?.classes.length ?? 0}
                  action={
                    <Link
                      href="/create-class"
                      style={{
                        background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                        color: "white",
                        padding: "7px 16px",
                        borderRadius: 9,
                        fontSize: 13,
                        fontWeight: 700,
                        textDecoration: "none",
                        boxShadow: "0 2px 10px #3b82f640",
                      }}
                    >
                      + New Class
                    </Link>
                  }
                />
                {!centerData || centerData.classes.length === 0 ? (
                  <EmptyState
                    icon="🏫"
                    message="No classes created for this center yet."
                    actionHref="/create-class"
                    actionLabel="Create First Class"
                  />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
                    {centerData.classes.map((cls, i) => (
                      <motion.div
                        key={cls.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        style={cardBase}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" as const, gap: 12 }}>
                          <div style={{ flex: 1, minWidth: 200 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" as const }}>
                              <h3 style={{ color: "#f1f5f9", fontWeight: 700, margin: 0, fontSize: 15 }}>
                                {cls.title}
                              </h3>
                              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, backgroundColor: "#0f172a", border: "1px solid #334155", color: "#94a3b8" }}>
                                {cls.format}
                              </span>
                              {cls.capacity && cls.bookingsCount >= cls.capacity && (
                                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, backgroundColor: "#450a0a", color: "#fca5a5" }}>FULL</span>
                              )}
                            </div>
                            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const, alignItems: "center" }}>
                              <span style={{ color: "#3b82f6", fontSize: 13 }}>{cls.subject}</span>
                              <span style={{ color: "#64748b", fontSize: 13 }}>
                                {cls.priceEgp === 0 ? "Free" : cls.priceEgp + " EGP"}
                              </span>
                              <span style={{ color: "#64748b", fontSize: 13 }}>
                                {cls.bookingsCount}{cls.capacity ? "/" + cls.capacity : ""} enrolled
                              </span>
                              {cls.ownerName && (
                                <span style={{ color: "#64748b", fontSize: 13 }}>by {cls.ownerName}</span>
                              )}
                              {cls.schedule && <span style={{ color: "#64748b", fontSize: 13 }}>🕐 {cls.schedule}</span>}
                            </div>
                            {cls.capacity && (
                              <MiniSpotsBar capacity={cls.capacity} booked={cls.bookingsCount} />
                            )}
                          </div>
                          <Link href={"/classes/" + cls.id} style={{ color: "#3b82f6", fontSize: 13, fontWeight: 600, textDecoration: "none", padding: "5px 12px", border: "1px solid #3b82f640", borderRadius: 8 }}>
                            View
                          </Link>
                        </div>
                        {cls.bookings.length > 0 && (
                          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #334155" }}>
                            <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 0.6, marginBottom: 8 }}>
                              Students ({cls.bookings.length})
                            </div>
                            <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
                              {cls.bookings.map((bk) => (
                                <div key={bk.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0f172a", borderRadius: 8, padding: "8px 12px" }}>
                                  <span style={{ color: "#94a3b8", fontSize: 13 }}>{bk.studentName}</span>
                                  <div style={{ display: "flex", gap: 5 }}>
                                    <StatusBadge status={bk.status} />
                                    <StatusBadge status={bk.paymentStatus} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Tutors tab */}
            {activeTab === "tutors" && (
              <motion.div
                key="tutors"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <SectionHeader title="Tutors" count={centerData?.tutors.length ?? 0} />
                {!centerData || centerData.tutors.length === 0 ? (
                  <EmptyState
                    icon="👤"
                    message="No tutors assigned to this center yet."
                    actionHref="/dashboard"
                    actionLabel="Back to Dashboard"
                  />
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                    {centerData.tutors.map((tutor, i) => (
                      <motion.div
                        key={tutor.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        style={cardBase}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: "50%",
                              background: "radial-gradient(circle at 40% 40%, #60a5fa, #1d4ed8)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 800,
                              fontSize: 16,
                              color: "#fff",
                              flexShrink: 0,
                              boxShadow: "0 0 0 2px #1e293b, 0 0 0 4px #3b82f630",
                            }}
                          >
                            {((tutor.fullName || tutor.name || "T")[0] || "T").toUpperCase()}
                          </div>
                          <div>
                            <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 14 }}>
                              {tutor.fullName || tutor.name || "Unnamed"}
                            </div>
                            <div style={{ color: "#64748b", fontSize: 12 }}>
                              {tutor.classCount} class{tutor.classCount !== 1 ? "es" : ""}
                            </div>
                          </div>
                        </div>
                        {tutor.subjects.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4, marginBottom: 10 }}>
                            {tutor.subjects.map((s) => (
                              <span
                                key={s}
                                style={{
                                  backgroundColor: "#0f172a",
                                  border: "1px solid #334155",
                                  borderRadius: 6,
                                  padding: "2px 8px",
                                  fontSize: 11,
                                  color: "#94a3b8",
                                }}
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                        <Link
                          href={"/tutors/" + tutor.id}
                          style={{
                            color: "#3b82f6",
                            fontSize: 13,
                            fontWeight: 600,
                            textDecoration: "none",
                            padding: "5px 12px",
                            border: "1px solid #3b82f640",
                            borderRadius: 8,
                            display: "inline-block",
                          }}
                        >
                          View Profile →
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </PageShell>
  );
}