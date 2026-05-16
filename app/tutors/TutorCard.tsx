"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, Check, Star } from "lucide-react";

// Types
export interface TutorCardData {
  id: string;
  fullName: string | null;
  name: string | null;
  bio: string | null;
  subjects: string[];
  photoUrl: string | null;
  city: string | null;
  center: { id: string; name: string } | null;
  classCount: number;
  studentCount: number;
  avgRating: number | null;
  reviewCount: number;
  isVerified: boolean;
}

// Subject colors
const SUBJECT_COLORS: Record<string, string> = {
  Math: "var(--accent)", Mathematics: "var(--accent)",
  Physics: "var(--accent)", Chemistry: "var(--success)",
  Biology: "var(--accent)", English: "var(--warning)",
  Arabic: "var(--error)", History: "var(--warning)",
  Geography: "var(--accent)", French: "var(--accent)",
  "Computer Science": "var(--accent)", Science: "var(--success)",
  Economics: "var(--warning)", Accounting: "var(--warning)", Business: "var(--accent)",
};

function subjectColor(s: string) {
  return SUBJECT_COLORS[s] ?? "var(--accent)";
}

// Avatar
function Avatar({ name, photoUrl, size = 64 }: { name: string; photoUrl: string | null; size?: number }) {
  const initial = (name[0] || "T").toUpperCase();
  const colors = ["var(--accent-bg-soft)", "var(--accent-bg-soft)", "var(--accent-bg)", "var(--warning-bg)", "var(--accent-bg-soft)"];
  const textColors = ["var(--accent-hover)", "var(--accent)", "var(--success)", "var(--warning)", "var(--accent)"];
  const idx = initial.charCodeAt(0) % colors.length;

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
          border: "2px solid var(--border-light)",
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
        backgroundColor: colors[idx],
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: size * 0.38,
        color: textColors[idx],
        border: "2px solid var(--border-light)",
      }}
    >
      {initial}
    </div>
  );
}

// Star rating
function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={12}
          strokeWidth={i < full ? 0 : 1.5}
          fill={i < full ? "var(--rating)" : "none"}
          color={i < full ? "var(--rating)" : "var(--text-dim)"}
        />
      ))}
    </span>
  );
}

// Main component
export default function TutorCard({
  tutor,
  index = 0,
}: {
  tutor: TutorCardData;
  index?: number;
}) {
  const displayName = tutor.fullName || tutor.name || "Unnamed Tutor";
  const visibleSubjects = tutor.subjects.slice(0, 3);
  const extraSubjects = tutor.subjects.length - 3;
  const primaryColor = subjectColor(tutor.subjects[0] ?? "Math");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        borderRadius: 14,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transition: "border-color 0.2s, box-shadow 0.2s",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = "var(--accent-border)";
        el.style.boxShadow = "0 4px 16px rgba(37,99,235,0.08)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = "var(--border-light)";
        el.style.boxShadow = "none";
      }}
    >
      {/* Top accent bar */}
      <div style={{ height: 3, backgroundColor: primaryColor, flexShrink: 0 }} />

      {/* Card body */}
      <div style={{ padding: "20px 20px 0" }}>

        {/* Top row: avatar + name + info */}
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
          <Avatar name={displayName} photoUrl={tutor.photoUrl} size={56} />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: "var(--text)",
                marginBottom: 3,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {displayName}
            </div>

            <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 5, display: "flex", alignItems: "center", gap: 4 }}>
              <MapPin size={12} strokeWidth={2} />
              <span>{tutor.city ?? "Egypt"}</span>
              {tutor.center && (
                <>
                  <span style={{ color: "var(--text-muted)" }}>-</span>
                  <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{tutor.center.name}</span>
                </>
              )}
            </div>

            {tutor.isVerified && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  backgroundColor: "var(--accent-bg)",
                  border: "1px solid var(--accent-border)",
                  borderRadius: 99,
                  padding: "2px 8px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--accent)",
                  letterSpacing: 0.2,
                }}
              >
                <Check size={10} strokeWidth={3} />
                Verified
              </div>
            )}
          </div>
        </div>

        {/* Rating row */}
        {tutor.avgRating !== null ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <Stars rating={tutor.avgRating} />
            <span style={{ fontWeight: 700, color: "var(--text)", fontSize: 13 }}>
              {tutor.avgRating.toFixed(1)}
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
              ({tutor.reviewCount} review{tutor.reviewCount !== 1 ? "s" : ""})
            </span>
          </div>
        ) : (
          <div style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 12 }}>No reviews yet</div>
        )}

        {/* Subject tags */}
        {tutor.subjects.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
            {visibleSubjects.map((s) => (
              <span
                key={s}
                style={{
                  backgroundColor: `${subjectColor(s)}12`,
                  border: `1px solid ${subjectColor(s)}30`,
                  color: subjectColor(s),
                  borderRadius: 999,
                  padding: "2px 9px",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {s}
              </span>
            ))}
            {extraSubjects > 0 && (
              <span
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  color: "var(--text-secondary)",
                  borderRadius: 999,
                  padding: "2px 9px",
                  fontSize: 11,
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
              color: "var(--text-secondary)",
              fontSize: 13,
              lineHeight: 1.6,
              margin: "0 0 12px",
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
            paddingBottom: 14,
            borderBottom: "1px solid var(--bg-subtle)",
          }}
        >
          {[
            { value: tutor.classCount, label: "Classes" },
            { value: tutor.studentCount, label: "Students" },
          ].map((stat) => (
            <div key={stat.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontWeight: 700, color: "var(--text)", fontSize: 14 }}>{stat.value}</span>
              <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "12px 20px 18px", display: "flex", gap: 8 }}>
        <Link
          href={`/tutors/${tutor.id}`}
          style={{
            flex: 1,
            display: "block",
            textAlign: "center",
            backgroundColor: "var(--bg-alt)",
            border: "1px solid var(--border-light)",
            color: "var(--text)",
            borderRadius: 8,
            padding: "9px 12px",
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.borderColor = "var(--border)";
            el.style.backgroundColor = "var(--bg-subtle)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.borderColor = "var(--border-light)";
            el.style.backgroundColor = "var(--bg-alt)";
          }}
        >
          View Profile
        </Link>
        {tutor.classCount > 0 ? (
          <Link
            href={`/classes?tutor=${tutor.id}`}
            style={{
              flex: 1,
              display: "block",
              textAlign: "center",
              backgroundColor: "var(--accent)",
              color: "var(--accent-fg)",
              border: "none",
              borderRadius: 8,
              padding: "9px 12px",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--accent-hover)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--accent)"; }}
          >
            Browse Classes
          </Link>
        ) : (
          <div style={{
            flex: 1,
            display: "flex", alignItems: "center", justifyContent: "center",
            backgroundColor: "var(--bg-subtle)",
            color: "var(--text-muted)",
            border: "1px solid var(--border-light)",
            borderRadius: 8,
            padding: "9px 12px",
            fontSize: 12,
            fontWeight: 500,
          }}>
            No Classes Yet
          </div>
        )}
      </div>
    </motion.div>
  );
}


