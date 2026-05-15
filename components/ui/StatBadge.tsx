"use client";

// ─── STAT BADGE ────────────────────────────────────────────────────────────────
// A small icon + value display used on tutor cards and profile pages.
// Examples:
//   <StatBadge icon="⭐" value="4.9" label="rating" />
//   <StatBadge icon="👥" value="340" label="students" />
//   <StatBadge icon="⏱" value="~2 hrs" label="response" />

interface StatBadgeProps {
  icon: string;
  value: string | number;
  label?: string;       // optional label below the value
  color?: string;       // accent color
  layout?: "row" | "column"; // row = icon+value side by side, column = stacked
}

export default function StatBadge({
  icon,
  value,
  label,
  color = "var(--text-muted)",
  layout = "row",
}: StatBadgeProps) {
  if (layout === "column") {
    // Used on profile hero section — large stacked stats
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <div style={{ fontSize: "22px" }}>{icon}</div>
        <div
          style={{
            fontSize: "20px",
            fontWeight: 800,
            color: "var(--text)",
            lineHeight: 1,
          }}
        >
          {value}
        </div>
        {label && (
          <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>
            {label}
          </div>
        )}
      </div>
    );
  }

  // Default "row" layout — used on cards
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "13px",
        color,
      }}
    >
      <span style={{ fontSize: "14px" }}>{icon}</span>
      <span style={{ fontWeight: 600, color: "var(--border)" }}>{value}</span>
      {label && (
        <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>{label}</span>
      )}
    </div>
  );
}