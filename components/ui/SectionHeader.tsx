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
  badgeColor = "var(--rating)",
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
          fontSize: "clamp(1.3rem, 3vw, 1.75rem)",
          fontWeight: 800,
          color: "var(--text)",
          margin: "0 0 8px 0",
          lineHeight: 1.2,
          letterSpacing: "-0.025em",
        }}
      >
        {title}
      </h2>

      {/* Subtitle */}
      {subtitle && (
        <p
          style={{
            fontSize: "14px",
            color: "var(--text-muted)",
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          {subtitle}
        </p>
      )}

      {/* Decorative underline accent */}
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: 40 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.15 }}
        style={{
          marginTop: "14px",
          height: "3px",
          borderRadius: "999px",
          background: badge
            ? `linear-gradient(90deg, ${badgeColor}, ${badgeColor}60)`
            : "linear-gradient(90deg, var(--accent), #1c6e7a)",
          marginLeft: align === "center" ? "auto" : "0",
          marginRight: align === "center" ? "auto" : "0",
        }}
      />
    </motion.div>
  );
}