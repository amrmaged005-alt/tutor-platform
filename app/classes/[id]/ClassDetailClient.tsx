"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import ReviewSection from "../../components/ReviewSection";

// ─── Subject color map ───────────────────────────────────────────────────────
const SUBJECT_COLORS: Record<string, { glow: string; badge: string; bg: string }> = {
  Math:        { glow: "#3b82f6", badge: "#3b82f6", bg: "#1e3a5f" },
  Mathematics: { glow: "#3b82f6", badge: "#3b82f6", bg: "#1e3a5f" },
  Physics:     { glow: "#8b5cf6", badge: "#8b5cf6", bg: "#2e1a4f" },
  Chemistry:   { glow: "#22c55e", badge: "#22c55e", bg: "#052e16" },
  Biology:     { glow: "#10b981", badge: "#10b981", bg: "#022c22" },
  English:     { glow: "#f59e0b", badge: "#f59e0b", bg: "#1c1400" },
  Arabic:      { glow: "#ef4444", badge: "#ef4444", bg: "#2d0000" },
  History:     { glow: "#f97316", badge: "#f97316", bg: "#1c0d00" },
  Geography:   { glow: "#06b6d4", badge: "#06b6d4", bg: "#002f3a" },
  French:      { glow: "#a78bfa", badge: "#a78bfa", bg: "#1e1b4b" },
  Computer:    { glow: "#38bdf8", badge: "#38bdf8", bg: "#0c2a3f" },
  Science:     { glow: "#34d399", badge: "#34d399", bg: "#052e16" },
};

function getSubjectColor(subject: string) {
  return SUBJECT_COLORS[subject] ?? { glow: "#3b82f6", badge: "#38bdf8", bg: "#0c2a3f" };
}

// ─── Animated progress bar ───────────────────────────────────────────────────
function SpotsBar({ capacity, spotsLeft }: { capacity: number; spotsLeft: number }) {
  const pct = Math.round(((capacity - spotsLeft) / capacity) * 100);
  const isCritical = spotsLeft <= 3;
  const isLow = spotsLeft <= 5;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>
          {capacity - spotsLeft} enrolled
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: isCritical ? "#ef4444" : isLow ? "#f59e0b" : "#22c55e",
          }}
        >
          {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
        </span>
      </div>
      <div
        style={{
          height: 6,
          backgroundColor: "#334155",
          borderRadius: 99,
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
          style={{
            height: "100%",
            borderRadius: 99,
            background: isCritical
              ? "linear-gradient(90deg, #ef4444, #f97316)"
              : isLow
              ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
              : "linear-gradient(90deg, #22c55e, #34d399)",
          }}
        />
      </div>
    </div>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────
function Badge({
  children,
  color,
  bg,
}: {
  children: React.ReactNode;
  color: string;
  bg: string;
}) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: "4px 12px",
        borderRadius: 99,
        backgroundColor: bg,
        color,
        border: `1px solid ${color}44`,
        letterSpacing: 0.3,
        whiteSpace: "nowrap" as const,
      }}
    >
      {children}
    </span>
  );
}

// ─── Stat tile ────────────────────────────────────────────────────────────────
function StatTile({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div
      style={{
        backgroundColor: "#0f172a",
        border: "1px solid #334155",
        borderRadius: 12,
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span style={{ fontSize: 20 }}>{icon}</span>
      <div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#64748b",
            textTransform: "uppercase" as const,
            letterSpacing: 0.8,
            marginBottom: 2,
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>{value}</div>
      </div>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface ClassData {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  curriculum: string;
  format: string;
  gradeLevel: string | null;
  language: string | null;
  priceEgp: number;
  schedule: string | null;
  capacity: number | null;
  location: string | null;
  city: string | null;
  isOnline: boolean;
  bookingsCount: number;
  spotsLeft: number | null;
  materials: Array<{ id: string; title: string; isLocked: boolean; fileUrl: string | null }>;
  owner: {
    id: string;
    fullName: string | null;
    name: string | null;
    bio: string | null;
    subjects: string[];
    phone: string | null;
  } | null;
  center: {
    id: string;
    name: string;
    city: string | null;
    location: string | null;
    description: string | null;
    phone: string | null;
  } | null;
  relatedClasses: Array<{
    id: string;
    title: string;
    subject: string;
    description: string | null;
    priceEgp: number;
  }>;
}

interface Props {
  classData: ClassData;
  session: any;
  alreadyBooked: boolean;
  currentUserRole: string;
  isEligibleToReview: boolean;
  existingUserReview: { rating: number; comment: string | null } | null;
  bookClass: () => Promise<void>;
  classId: string;
}

// ─── Main client component ────────────────────────────────────────────────────
export default function ClassDetailClient({
  classData: cls,
  session,
  alreadyBooked,
  currentUserRole,
  isEligibleToReview,
  existingUserReview,
  bookClass,
  classId,
}: Props) {
  const subjectColor = getSubjectColor(cls.subject);
  const tutor = cls.owner;
  const whatsappNumber = tutor?.phone?.replace(/\D/g, "") ?? "";
  const centerWhatsapp = cls.center?.phone?.replace(/\D/g, "") ?? "";

  const [stickyVisible, setStickyVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  // Show sticky bottom bar on mobile after scrolling past hero
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  const isTutor =
    currentUserRole === "TUTOR" ||
    currentUserRole === "CENTER_ADMIN" ||
    currentUserRole === "ADMIN";

  const bookingCTA = () => {
    if (!session?.user) {
      return (
        <Link
          href="/login"
          style={{
            display: "block",
            textAlign: "center" as const,
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            color: "white",
            padding: "14px",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: "1rem",
            textDecoration: "none",
            boxShadow: "0 4px 20px #3b82f640",
            transition: "opacity 0.2s",
          }}
        >
          Sign in to Book
        </Link>
      );
    }
    if (isTutor) {
      return (
        <div
          style={{
            textAlign: "center" as const,
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            color: "#64748b",
            padding: "14px",
            borderRadius: 12,
            fontWeight: 600,
            fontSize: "0.9rem",
          }}
        >
          Tutors cannot book classes
        </div>
      );
    }
    if (alreadyBooked) {
      return (
        <div
          style={{
            textAlign: "center" as const,
            backgroundColor: "#052e16",
            border: "1px solid #166534",
            color: "#4ade80",
            padding: "14px",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: "1rem",
          }}
        >
          ✓ Already Booked
        </div>
      );
    }
    if (cls.spotsLeft === 0) {
      return (
        <div
          style={{
            textAlign: "center" as const,
            backgroundColor: "#450a0a",
            border: "1px solid #7f1d1d",
            color: "#fca5a5",
            padding: "14px",
            borderRadius: 12,
            fontWeight: 700,
          }}
        >
          Class is Full
        </div>
      );
    }
    return (
      <form action={bookClass}>
        <button
          type="submit"
          style={{
            width: "100%",
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            color: "white",
            padding: "14px",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: "1rem",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 24px #3b82f650",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 32px #3b82f660";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 24px #3b82f650";
          }}
        >
          {cls.priceEgp === 0 ? "Book Free — Get Started" : `Book Now — ${cls.priceEgp} EGP`}
        </button>
      </form>
    );
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#f1f5f9",
      }}
    >
      {/* ── Hero Banner ── */}
      <div
        ref={heroRef}
        style={{
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(135deg, #0f172a 0%, ${subjectColor.bg} 60%, #0f172a 100%)`,
          borderBottom: "1px solid #334155",
          padding: "3rem 2rem 2.5rem",
        }}
      >
        {/* Glow orb */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${subjectColor.glow}22 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
        {/* Grid lines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(#ffffff06 1px, transparent 1px), linear-gradient(90deg, #ffffff06 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.5rem" }}
          >
            <Link
              href="/classes"
              style={{
                color: "#64748b",
                fontSize: 13,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 4,
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#94a3b8")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#64748b")}
            >
              ← Browse Classes
            </Link>
            <span style={{ color: "#475569", fontSize: 13 }}>/</span>
            <span style={{ color: "#64748b", fontSize: 13 }}>{cls.subject}</span>
            <span style={{ color: "#475569", fontSize: 13 }}>/</span>
            <span style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>
              {cls.title.length > 40 ? cls.title.slice(0, 40) + "…" : cls.title}
            </span>
          </motion.div>

          {/* Badges row */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, marginBottom: "1.25rem" }}
          >
            <Badge color={subjectColor.badge} bg={subjectColor.bg}>
              {cls.subject}
            </Badge>
            <Badge color="#a78bfa" bg="#1e1b4b">
              {cls.curriculum}
            </Badge>
            <Badge
              color={cls.format === "ONLINE" ? "#38bdf8" : cls.format === "IN_PERSON" ? "#22c55e" : "#f59e0b"}
              bg={cls.format === "ONLINE" ? "#0c2a3f" : cls.format === "IN_PERSON" ? "#052e16" : "#1c1000"}
            >
              {cls.format === "IN_PERSON" ? "📍 In-Person" : cls.format === "ONLINE" ? "💻 Online" : "🔀 Hybrid"}
            </Badge>
            {cls.gradeLevel && (
              <Badge color="#fbbf24" bg="#1c1200">
                Grade {cls.gradeLevel}
              </Badge>
            )}
            {cls.language && (
              <Badge color="#94a3b8" bg="#1e293b">
                🌐 {cls.language}
              </Badge>
            )}
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
              fontWeight: 800,
              color: "#f1f5f9",
              margin: "0 0 1rem",
              letterSpacing: -0.5,
              maxWidth: 700,
              lineHeight: 1.2,
            }}
          >
            {cls.title}
          </motion.h1>

          {/* Social proof row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" as const }}
          >
            <span style={{ color: "#94a3b8", fontSize: 14 }}>
              👥 <strong style={{ color: "#f1f5f9" }}>{cls.bookingsCount}</strong> students enrolled
            </span>
            {cls.capacity && (
              <span style={{ color: "#94a3b8", fontSize: 14 }}>
                📋 Capacity: <strong style={{ color: "#f1f5f9" }}>{cls.capacity}</strong>
              </span>
            )}
            {tutor && (
              <span style={{ color: "#94a3b8", fontSize: 14 }}>
                👤 by{" "}
                <strong style={{ color: "#f1f5f9" }}>
                  {tutor.fullName || tutor.name || "Tutor"}
                </strong>
              </span>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "2rem 1.5rem 4rem",
          display: "grid",
          gridTemplateColumns: "1fr min(380px, 35%)",
          gap: "2rem",
          alignItems: "start",
        }}
        className="detail-grid"
      >
        {/* ── Left column ── */}
        <div style={{ minWidth: 0 }}>
          {/* Description */}
          {cls.description && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              style={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 18,
                padding: "1.75rem",
                marginBottom: "1.5rem",
              }}
            >
              <h2
                style={{
                  color: "#f1f5f9",
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  margin: "0 0 0.875rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 4,
                    height: 18,
                    background: `linear-gradient(180deg, ${subjectColor.glow}, transparent)`,
                    borderRadius: 2,
                    display: "inline-block",
                  }}
                />
                About This Class
              </h2>
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: 15,
                  lineHeight: 1.75,
                  margin: 0,
                }}
              >
                {cls.description}
              </p>
            </motion.div>
          )}

          {/* Stats grid */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 12,
              marginBottom: "1.5rem",
            }}
          >
            <StatTile
              icon="💰"
              label="Price"
              value={cls.priceEgp === 0 ? "Free" : cls.priceEgp + " EGP"}
            />
            <StatTile
              icon="📍"
              label="Location"
              value={
                cls.isOnline
                  ? "Online"
                  : cls.location ?? cls.city ?? "See details"
              }
            />
            {cls.schedule && (
              <StatTile icon="📅" label="Schedule" value={cls.schedule} />
            )}
            {cls.capacity && (
              <StatTile
                icon="🪑"
                label="Capacity"
                value={cls.capacity + " students"}
              />
            )}
          </motion.div>

          {/* Spots bar */}
          {cls.capacity && cls.spotsLeft !== null && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              style={{
                backgroundColor: "#1e293b",
                border: `1px solid ${cls.spotsLeft <= 3 ? "#ef444440" : cls.spotsLeft <= 5 ? "#f59e0b40" : "#334155"}`,
                borderRadius: 16,
                padding: "1.25rem 1.5rem",
                marginBottom: "1.5rem",
              }}
            >
              {cls.spotsLeft <= 5 && cls.spotsLeft > 0 && (
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: cls.spotsLeft <= 3 ? "#ef4444" : "#f59e0b",
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  🔥 Only {cls.spotsLeft} spot{cls.spotsLeft !== 1 ? "s" : ""} remaining — book now!
                </motion.div>
              )}
              <SpotsBar capacity={cls.capacity} spotsLeft={cls.spotsLeft} />
            </motion.div>
          )}

          {/* Tutor card */}
          {tutor && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 18,
                padding: "1.75rem",
                marginBottom: "1.5rem",
              }}
            >
              <h2
                style={{
                  color: "#f1f5f9",
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  margin: "0 0 1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 4,
                    height: 18,
                    background: "linear-gradient(180deg, #3b82f6, transparent)",
                    borderRadius: 2,
                    display: "inline-block",
                  }}
                />
                About the Tutor
              </h2>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: `radial-gradient(circle at 40% 40%, #60a5fa, #1d4ed8)`,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 24,
                    color: "#fff",
                    boxShadow: "0 0 0 3px #1e293b, 0 0 0 5px #3b82f640",
                  }}
                >
                  {((tutor.fullName || tutor.name || "T")[0] || "T").toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      color: "#f1f5f9",
                      fontSize: 16,
                      marginBottom: 4,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {tutor.fullName || tutor.name || "Tutor"}
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 99,
                        backgroundColor: "#1e3a5f",
                        color: "#38bdf8",
                        border: "1px solid #38bdf820",
                      }}
                    >
                      ✓ Verified
                    </span>
                  </div>
                  {tutor.subjects && tutor.subjects.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        flexWrap: "wrap" as const,
                        marginBottom: 10,
                      }}
                    >
                      {tutor.subjects.map((s) => (
                        <span
                          key={s}
                          style={{
                            background: "#0f172a",
                            border: "1px solid #334155",
                            borderRadius: 6,
                            padding: "2px 10px",
                            fontSize: 12,
                            color: "#94a3b8",
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  {tutor.bio && (
                    <p
                      style={{
                        color: "#94a3b8",
                        fontSize: 14,
                        lineHeight: 1.65,
                        margin: "0 0 14px",
                      }}
                    >
                      {tutor.bio}
                    </p>
                  )}
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const }}>
                    <Link
                      href={"/tutors/" + tutor.id}
                      style={{
                        color: "#3b82f6",
                        fontSize: 13,
                        textDecoration: "none",
                        fontWeight: 600,
                        padding: "6px 14px",
                        border: "1px solid #3b82f640",
                        borderRadius: 8,
                        transition: "background 0.2s",
                      }}
                    >
                      View Full Profile →
                    </Link>
                    {tutor.phone && (
                      <a
                        href={"https://wa.me/" + whatsappNumber}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          backgroundColor: "#16a34a",
                          color: "#fff",
                          borderRadius: 8,
                          padding: "6px 14px",
                          textDecoration: "none",
                          fontWeight: 600,
                          fontSize: 13,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        💬 WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Center card */}
          {cls.center && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              style={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 18,
                padding: "1.75rem",
                marginBottom: "1.5rem",
              }}
            >
              <h2
                style={{
                  color: "#f1f5f9",
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  margin: "0 0 1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 4,
                    height: 18,
                    background: "linear-gradient(180deg, #1d4ed8, transparent)",
                    borderRadius: 2,
                    display: "inline-block",
                  }}
                />
                Learning Center
              </h2>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 14,
                    background: "linear-gradient(135deg, #1d4ed8, #1e3a8a)",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 24,
                    color: "#fff",
                    boxShadow: "0 0 0 3px #1e293b, 0 0 0 5px #1d4ed840",
                  }}
                >
                  {cls.center.name[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      color: "#f1f5f9",
                      fontSize: 16,
                      marginBottom: 4,
                    }}
                  >
                    {cls.center.name}
                  </div>
                  <div style={{ color: "#64748b", fontSize: 13, marginBottom: 10 }}>
                    {cls.center.city}
                    {cls.center.location ? " · " + cls.center.location : ""}
                  </div>
                  {cls.center.description && (
                    <p
                      style={{
                        color: "#94a3b8",
                        fontSize: 14,
                        lineHeight: 1.65,
                        margin: "0 0 14px",
                      }}
                    >
                      {cls.center.description}
                    </p>
                  )}
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const }}>
                    <Link
                      href={"/centers/" + cls.center.id}
                      style={{
                        color: "#3b82f6",
                        fontSize: 13,
                        textDecoration: "none",
                        fontWeight: 600,
                        padding: "6px 14px",
                        border: "1px solid #3b82f640",
                        borderRadius: 8,
                      }}
                    >
                      View Center →
                    </Link>
                    {cls.center.phone && (
                      <a
                        href={"https://wa.me/" + centerWhatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          backgroundColor: "#16a34a",
                          color: "#fff",
                          borderRadius: 8,
                          padding: "6px 14px",
                          textDecoration: "none",
                          fontWeight: 600,
                          fontSize: 13,
                        }}
                      >
                        💬 WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Materials */}
          {cls.materials.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              style={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 18,
                padding: "1.75rem",
                marginBottom: "1.5rem",
              }}
            >
              <h2
                style={{
                  color: "#f1f5f9",
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  margin: "0 0 1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 4,
                    height: 18,
                    background: "linear-gradient(180deg, #f59e0b, transparent)",
                    borderRadius: 2,
                    display: "inline-block",
                  }}
                />
                Class Materials
              </h2>
              {cls.materials.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.05 }}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.875rem 1rem",
                    backgroundColor: "#0f172a",
                    borderRadius: 10,
                    marginBottom: 8,
                    border: "1px solid #334155",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 18 }}>
                      {m.isLocked ? "🔒" : "📄"}
                    </span>
                    <span style={{ color: "#cbd5e1", fontSize: 14, fontWeight: 500 }}>
                      {m.title}
                    </span>
                  </div>
                  {m.isLocked ? (
                    <span
                      style={{
                        color: "#64748b",
                        fontSize: 12,
                        backgroundColor: "#1e293b",
                        padding: "4px 10px",
                        borderRadius: 6,
                      }}
                    >
                      Book to unlock
                    </span>
                  ) : (
                    <a
                      href={m.fileUrl ?? "#"}
                      style={{
                        color: "#38bdf8",
                        fontSize: 13,
                        textDecoration: "none",
                        fontWeight: 600,
                        padding: "4px 12px",
                        background: "#0c2a3f",
                        borderRadius: 6,
                        border: "1px solid #38bdf820",
                      }}
                    >
                      ↓ Download
                    </a>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Reviews */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
          >
            <ReviewSection
              classId={classId}
              isEligible={isEligibleToReview}
              existingUserReview={existingUserReview}
            />
          </motion.div>
        </div>

        {/* ── Right sidebar (sticky booking card) ── */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              position: "sticky",
              top: "6rem",
              backgroundColor: "#1e293b",
              border: `1px solid ${subjectColor.glow}30`,
              borderRadius: 20,
              padding: "1.75rem",
              boxShadow: `0 0 40px ${subjectColor.glow}15`,
            }}
          >
            {/* Price */}
            <div style={{ marginBottom: "1.25rem" }}>
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: "#f1f5f9",
                  letterSpacing: -1,
                }}
              >
                {cls.priceEgp === 0 ? (
                  <span style={{ color: "#22c55e" }}>Free</span>
                ) : (
                  <>
                    {cls.priceEgp}{" "}
                    <span style={{ fontSize: "1rem", fontWeight: 600, color: "#64748b" }}>
                      EGP
                    </span>
                  </>
                )}
              </div>
              <div style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>
                per enrollment
              </div>
            </div>

            {/* Quick stats */}
            <div
              style={{
                backgroundColor: "#0f172a",
                borderRadius: 12,
                padding: "1rem",
                marginBottom: "1.25rem",
                display: "flex",
                flexDirection: "column" as const,
                gap: 10,
              }}
            >
              {[
                {
                  icon: "🎓",
                  label: "Curriculum",
                  value: cls.curriculum,
                },
                {
                  icon: "💻",
                  label: "Format",
                  value:
                    cls.format === "IN_PERSON"
                      ? "In-Person"
                      : cls.format === "ONLINE"
                      ? "Online"
                      : "Hybrid",
                },
                {
                  icon: "📅",
                  label: "Schedule",
                  value: cls.schedule ?? "Flexible",
                },
                {
                  icon: "📍",
                  label: "Location",
                  value: cls.isOnline
                    ? "Online"
                    : cls.location ?? cls.city ?? "—",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: "#64748b", fontSize: 13, display: "flex", gap: 6 }}>
                    {item.icon} {item.label}
                  </span>
                  <span style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 600, textAlign: "right" as const, maxWidth: "55%" }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Spots bar in sidebar */}
            {cls.capacity && cls.spotsLeft !== null && (
              <div style={{ marginBottom: "1.25rem" }}>
                <SpotsBar capacity={cls.capacity} spotsLeft={cls.spotsLeft} />
              </div>
            )}

            {/* Urgency warning */}
            {cls.spotsLeft !== null && cls.spotsLeft <= 5 && cls.spotsLeft > 0 && (
              <motion.div
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                style={{
                  backgroundColor: "#1c0a00",
                  border: "1px solid #92400e",
                  borderRadius: 10,
                  padding: "10px 12px",
                  marginBottom: "1rem",
                  fontSize: 13,
                  color: "#fdba74",
                  fontWeight: 600,
                  textAlign: "center" as const,
                }}
              >
                🔥 Only {cls.spotsLeft} spot{cls.spotsLeft !== 1 ? "s" : ""} left!
              </motion.div>
            )}

            {/* CTA */}
            {bookingCTA()}

            {/* Trust badges */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 20,
                marginTop: "1.25rem",
                paddingTop: "1.25rem",
                borderTop: "1px solid #334155",
              }}
            >
              {[
                { icon: "🔒", label: "Secure" },
                { icon: "✅", label: "Verified" },
                { icon: "💬", label: "Support" },
              ].map((t) => (
                <div
                  key={t.label}
                  style={{
                    display: "flex",
                    flexDirection: "column" as const,
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: 16 }}>{t.icon}</span>
                  <span style={{ color: "#64748b", fontSize: 11, fontWeight: 600 }}>
                    {t.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Related classes ── */}
      {cls.relatedClasses.length > 0 && (
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 1.5rem 4rem",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h2
              style={{
                color: "#f1f5f9",
                fontWeight: 700,
                fontSize: "1.1rem",
                margin: "0 0 1.25rem",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span
                style={{
                  width: 4,
                  height: 18,
                  background: `linear-gradient(180deg, ${subjectColor.glow}, transparent)`,
                  borderRadius: 2,
                  display: "inline-block",
                }}
              />
              More {cls.subject} Classes
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 16,
              }}
            >
              {cls.relatedClasses.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 + i * 0.07 }}
                  whileHover={{ y: -3, boxShadow: `0 12px 32px ${subjectColor.glow}20` }}
                  style={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: 16,
                    padding: "1.25rem",
                    cursor: "pointer",
                    transition: "border-color 0.2s",
                  }}
                >
                  <Link
                    href={"/classes/" + r.id}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: subjectColor.badge,
                        textTransform: "uppercase" as const,
                        letterSpacing: 0.8,
                        marginBottom: 6,
                      }}
                    >
                      {r.subject}
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        color: "#f1f5f9",
                        fontSize: 15,
                        marginBottom: 8,
                        lineHeight: 1.3,
                      }}
                    >
                      {r.title}
                    </div>
                    {r.description && (
                      <div
                        style={{
                          color: "#64748b",
                          fontSize: 13,
                          lineHeight: 1.5,
                          marginBottom: 12,
                        }}
                      >
                        {r.description.length > 80
                          ? r.description.slice(0, 80) + "…"
                          : r.description}
                      </div>
                    )}
                    <div
                      style={{
                        fontWeight: 700,
                        color: r.priceEgp === 0 ? "#22c55e" : "#f1f5f9",
                        fontSize: 15,
                      }}
                    >
                      {r.priceEgp === 0 ? "Free" : r.priceEgp + " EGP"}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Mobile sticky CTA ── */}
      <AnimatePresence>
        {stickyVisible && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: "#1e293b",
              borderTop: "1px solid #334155",
              padding: "1rem 1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              zIndex: 50,
              boxShadow: "0 -8px 32px #00000080",
            }}
            className="mobile-sticky-cta"
          >
            <div>
              <div
                style={{ fontWeight: 800, color: "#f1f5f9", fontSize: "1.2rem" }}
              >
                {cls.priceEgp === 0 ? "Free" : cls.priceEgp + " EGP"}
              </div>
              <div style={{ color: "#64748b", fontSize: 12 }}>
                {cls.spotsLeft !== null
                  ? cls.spotsLeft + " spots left"
                  : "Unlimited spots"}
              </div>
            </div>
            <div style={{ flex: 1, maxWidth: 240 }}>{bookingCTA()}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Responsive style override ── */}
      <style>{`
        @media (max-width: 768px) {
          .detail-grid {
            grid-template-columns: 1fr !important;
          }
          .mobile-sticky-cta {
            display: flex !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-sticky-cta {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}