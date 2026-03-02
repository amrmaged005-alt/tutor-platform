"use client";

// ─── SUBJECT COLOR MAP ─────────────────────────────────────────────────────────
// Every subject has an associated color. This map is used across the entire app
// for tags, card borders, hero glows, filter pills, etc.
// Add new subjects here and they'll automatically work everywhere.

export const SUBJECT_COLORS: Record<string, string> = {
  Math: "#3b82f6",
  Mathematics: "#3b82f6",
  Physics: "#8b5cf6",
  Chemistry: "#22c55e",
  Biology: "#10b981",
  English: "#f59e0b",
  Arabic: "#ef4444",
  History: "#f97316",
  Geography: "#06b6d4",
  French: "#a78bfa",
  "Computer Science": "#38bdf8",
  Science: "#34d399",
  Economics: "#f59e0b",
  Business: "#fb923c",
  Art: "#e879f9",
  Music: "#c084fc",
};

// Fallback color if subject isn't in the map
export const getSubjectColor = (subject: string): string =>
  SUBJECT_COLORS[subject] ?? "#64748b";

// ─── COMPONENT ─────────────────────────────────────────────────────────────────

interface SubjectTagProps {
  subject: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  active?: boolean; // for filter pills — shows as "selected"
}

export default function SubjectTag({
  subject,
  size = "md",
  onClick,
  active = false,
}: SubjectTagProps) {
  const color = getSubjectColor(subject);

  // Size variants
  const padding = { sm: "4px 10px", md: "6px 14px", lg: "8px 18px" }[size];
  const fontSize = { sm: "11px", md: "13px", lg: "15px" }[size];

  return (
    <span
      onClick={onClick}
      style={{
        display: "inline-block",
        padding,
        fontSize,
        fontWeight: 600,
        borderRadius: "999px",   // pill shape
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease",
        userSelect: "none",

        // Active (selected) state vs resting state
        background: active
          ? color
          : `${color}18`,         // 18 = ~10% opacity in hex
        color: active ? "#fff" : color,
        border: `1px solid ${color}40`,  // 40 = 25% opacity border

        // Subtle glow when active
        boxShadow: active
          ? `0 0 12px ${color}60`
          : "none",
      }}
    >
      {subject}
    </span>
  );
}