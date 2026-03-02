"use client";

import { motion } from "framer-motion";

// ─── SECTION HEADER ────────────────────────────────────────────────────────────
// Used at the top of every segment on listing pages.
// e.g. "⭐ Top Rated Tutors", "🔥 Trending This Week"
// Animates in from below when it enters the viewport.

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;       // e.g. "🔥 Trending" — shown as a pill above the title
  badgeColor?: string;  // color for the badge pill
  align?: "left" | "center";
}

export default function SectionHeader({
  title,
  subtitle,
  badge,
  badgeColor = "#f59e0b",
  align = "left",
}: SectionHeaderProps) {
  return (
    // whileInView: animation triggers when this element scrolls into view
    // viewport once: only animates once, not every time you scroll past
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        textAlign: align,
        marginBottom: "32px",
      }}
    >
      {/* Badge pill — optional */}
      {badge && (
        <div
          style={{
            display: "inline-block",
            padding: "4px 14px",
            borderRadius: "999px",
            background: `${badgeColor}20`,
            color: badgeColor,
            border: `1px solid ${badgeColor}40`,
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            marginBottom: "12px",
          }}
        >
          {badge}
        </div>
      )}

      {/* Main title */}
      <h2
        style={{
          fontSize: "28px",
          fontWeight: 800,
          color: "#f1f5f9",
          margin: "0 0 8px 0",
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h2>

      {/* Subtitle */}
      {subtitle && (
        <p
          style={{
            fontSize: "15px",
            color: "#94a3b8",
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          {subtitle}
        </p>
      )}

      {/* Decorative underline accent */}
      <div
        style={{
          marginTop: "16px",
          width: "48px",
          height: "3px",
          borderRadius: "999px",
          background: "linear-gradient(90deg, #3b82f6, #38bdf8)",
          marginLeft: align === "center" ? "auto" : "0",
          marginRight: align === "center" ? "auto" : "0",
        }}
      />
    </motion.div>
  );
}