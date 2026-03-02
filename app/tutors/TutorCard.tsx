"use client";

import { motion } from "framer-motion";
import Link from "next/link";

// ─── TYPES ─────────────────────────────────────────────────────────────────────
export interface TutorCardData {
  id: string;
  fullName: string | null;
  name: string | null;
  bio: string | null;
  subjects: string[];
  photoUrl: string | null;
  city: string | null;
  center: { id: string; name: string } | null;
  classCount: number;       // how many classes they own
  studentCount: number;     // total bookings across all their classes
  avgRating: number | null; // computed from reviews
  reviewCount: number;
  isVerified: boolean;
}

// ─── SUBJECT COLORS ────────────────────────────────────────────────────────────
const SUBJECT_COLORS: Record<string, string> = {
  Math: "#3b82f6", Mathematics: "#3b82f6",
  Physics: "#8b5cf6", Chemistry: "#22c55e",
  Biology: "#10b981", English: "#f59e0b",
  Arabic: "#ef4444", History: "#f97316",
  Geography: "#06b6d4", French: "#a78bfa",
  "Computer Science": "#38bdf8", Science: "#34d399",
  Economics: "#fbbf24", Accounting: "#fb923c", Business: "#e879f9",
};

function subjectColor(s: string) {
  return SUBJECT_COLORS[s] ?? "#3b82f6";
}

// ─── AVATAR ────────────────────────────────────────────────────────────────────
// Shows photo if available, otherwise a colored initial
function Avatar({ name, photoUrl, size = 72 }: { name: string; photoUrl: string | null; size?: number }) {
  const initial = (name[0] || "T").toUpperCase();
  // Pick a consistent gradient color based on the first char
  const colors = [
    ["#60a5fa", "#1d4ed8"], // blue
    ["#a78bfa", "#6d28d9"], // purple
    ["#34d399", "#059669"], // green
    ["#f97316", "#c2410c"], // orange
    ["#38bdf8", "#0284c7"], // sky
  ];
  const pair = colors[initial.charCodeAt(0) % colors.length];

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          border: "3px solid #1e293b",
          boxShadow: "0 0 0 2px #3b82f630",
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle at 35% 35%, ${pair[0]}, ${pair[1]})`,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        fontSize: size * 0.38,
        color: "#fff",
        boxShadow: `0 0 0 3px #1e293b, 0 0 0 5px ${pair[0]}30`,
      }}
    >
      {initial}
    </div>
  );
}

// ─── STAR RATING ───────────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ color: "#f59e0b", fontSize: 13, letterSpacing: 1 }}>
      {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
    </span>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function TutorCard({
  tutor,
  index = 0,
}: {
  tutor: TutorCardData;
  index?: number;
}) {
  const displayName = tutor.fullName || tutor.name || "Unnamed Tutor";
  // Show max 3 subjects on the card, rest collapsed
  const visibleSubjects = tutor.subjects.slice(0, 3);
  const extraSubjects = tutor.subjects.length - 3;
  // Primary color = first subject's color (used for card accent)
  const primaryColor = subjectColor(tutor.subjects[0] ?? "Math");

  return (
    // Animate in from below with stagger based on index
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
      whileHover={{
        y: -6,
        boxShadow: `0 20px 48px ${primaryColor}25`,
      }}
      style={{
        backgroundColor: "#1e293b",
        border: "1px solid #334155",
        borderRadius: 20,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transition: "border-color 0.2s",
        position: "relative",
      }}
      // Hover border glow via CSS transition
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = `${primaryColor}60`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "#334155";
      }}
    >
      {/* ── Top accent bar (subject color) ── */}
      <div
        style={{
          height: 4,
          background: `linear-gradient(90deg, ${primaryColor}, ${primaryColor}44)`,
          flexShrink: 0,
        }}
      />

      {/* ── Card body ── */}
      <div style={{ padding: "20px 20px 0" }}>

        {/* Top row: avatar + name + badges */}
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
          <Avatar name={displayName} photoUrl={tutor.photoUrl} size={64} />

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Name */}
            <div
              style={{
                fontWeight: 700,
                fontSize: 16,
                color: "#f1f5f9",
                marginBottom: 4,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {displayName}
            </div>

            {/* Location */}
            <div style={{ color: "#64748b", fontSize: 13, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
              <span>📍</span>
              <span>{tutor.city ?? "Egypt"}</span>
              {tutor.center && (
                <>
                  <span style={{ color: "#334155" }}>·</span>
                  <span style={{ color: "#94a3b8", fontWeight: 500 }}>{tutor.center.name}</span>
                </>
              )}
            </div>

            {/* Verified badge */}
            {tutor.isVerified && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  backgroundColor: "#1e3a5f",
                  border: "1px solid #38bdf820",
                  borderRadius: 99,
                  padding: "2px 10px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#38bdf8",
                  letterSpacing: 0.3,
                  marginTop: 6,
                }}
              >
                ✓ Verified
              </div>
            )}
          </div>
        </div>

        {/* Rating row */}
        {tutor.avgRating !== null ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Stars rating={tutor.avgRating} />
            <span style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 14 }}>
              {tutor.avgRating.toFixed(1)}
            </span>
            <span style={{ color: "#64748b", fontSize: 13 }}>
              ({tutor.reviewCount} review{tutor.reviewCount !== 1 ? "s" : ""})
            </span>
          </div>
        ) : (
          <div style={{ color: "#475569", fontSize: 13, marginBottom: 12 }}>
            No reviews yet
          </div>
        )}

        {/* Subject tags */}
        {tutor.subjects.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
            {visibleSubjects.map((s) => (
              <span
                key={s}
                style={{
                  backgroundColor: `${subjectColor(s)}18`,
                  border: `1px solid ${subjectColor(s)}40`,
                  color: subjectColor(s),
                  borderRadius: 999,
                  padding: "3px 10px",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {s}
              </span>
            ))}
            {extraSubjects > 0 && (
              <span
                style={{
                  backgroundColor: "#334155",
                  color: "#94a3b8",
                  borderRadius: 999,
                  padding: "3px 10px",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                +{extraSubjects} more
              </span>
            )}
          </div>
        )}

        {/* Bio snippet */}
        {tutor.bio && (
          <p
            style={{
              color: "#64748b",
              fontSize: 13,
              lineHeight: 1.6,
              margin: "0 0 14px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {tutor.bio}
          </p>
        )}

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: 16,
            paddingBottom: 16,
            borderBottom: "1px solid #334155",
          }}
        >
          {[
            { icon: "📚", value: tutor.classCount, label: "Classes" },
            { icon: "👥", value: tutor.studentCount, label: "Students" },
          ].map((stat) => (
            <div key={stat.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 14 }}>{stat.icon}</span>
              <span style={{ fontWeight: 700, color: "#cbd5e1", fontSize: 14 }}>{stat.value}</span>
              <span style={{ color: "#475569", fontSize: 13 }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA buttons ── */}
      <div style={{ padding: "14px 20px 20px", display: "flex", gap: 8 }}>
        <Link
          href={`/tutors/${tutor.id}`}
          style={{
            flex: 1,
            display: "block",
            textAlign: "center",
            backgroundColor: "#0f172a",
            border: "1px solid #334155",
            color: "#f1f5f9",
            borderRadius: 10,
            padding: "9px 0",
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = `${primaryColor}60`;
            (e.currentTarget as HTMLAnchorElement).style.color = primaryColor;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "#334155";
            (e.currentTarget as HTMLAnchorElement).style.color = "#f1f5f9";
          }}
        >
          View Profile
        </Link>
        {tutor.classCount > 0 && (
          <Link
            href={`/tutors/${tutor.id}`}
            style={{
              flex: 1,
              display: "block",
              textAlign: "center",
              background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}99)`,
              color: "#fff",
              borderRadius: 10,
              padding: "9px 0",
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: `0 4px 14px ${primaryColor}40`,
            }}
          >
            Book Trial
          </Link>
        )}
      </div>
    </motion.div>
  );
}