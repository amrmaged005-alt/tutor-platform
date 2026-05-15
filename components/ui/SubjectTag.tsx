"use client";

// ─── SUBJECT COLOR SYSTEM ──────────────────────────────────────────────────────
// Curated tonal palette — 5 muted, premium tones harmonized with the
// warm-stone background and emerald accent. Subjects are grouped semantically
// (STEM / languages / humanities / creative / tech-science) so the palette
// feels intentional, not random. Same public API as before.

type Tone = {
  base: string;     // solid color (active state, borders)
  bg: string;       // soft tint (resting background)
  border: string;   // resting border tint
  fg: string;       // active foreground (always cream-on-tone)
};

const TONES: Record<string, Tone> = {
  // STEM core — emerald (anchor accent)
  emerald: { base: "#0d5946", bg: "rgba(13,89,70,0.08)",  border: "rgba(13,89,70,0.22)",  fg: "var(--accent-fg)" },
  // Languages — refined slate
  slate:   { base: "#3f5161", bg: "rgba(63,81,97,0.08)",  border: "rgba(63,81,97,0.22)",  fg: "var(--accent-fg)" },
  // Humanities — bronze
  bronze:  { base: "#8a5e1a", bg: "rgba(138,94,26,0.09)", border: "rgba(138,94,26,0.22)", fg: "var(--accent-fg)" },
  // Creative — plum
  plum:    { base: "#5d3a5f", bg: "rgba(93,58,95,0.09)",  border: "rgba(93,58,95,0.22)",  fg: "var(--accent-fg)" },
  // Tech / applied sciences — teal
  teal:    { base: "#1c6e7a", bg: "rgba(28,110,122,0.09)",border: "rgba(28,110,122,0.22)",fg: "var(--accent-fg)" },
};

// Subject → tone-group mapping
const SUBJECT_TONE: Record<string, keyof typeof TONES> = {
  Math:              "emerald",
  Mathematics:       "emerald",
  Physics:           "emerald",
  Chemistry:         "emerald",
  Biology:           "emerald",

  English:           "slate",
  Arabic:            "slate",
  French:            "slate",

  History:           "bronze",
  Geography:         "bronze",
  Economics:         "bronze",
  Business:          "bronze",

  Art:               "plum",
  Music:             "plum",

  "Computer Science":"teal",
  Science:           "teal",
};

const DEFAULT_TONE: keyof typeof TONES = "slate";

// Backwards-compatible export — returns the base hex used by the subject's tone.
// External callers that want a single color string still work.
export const SUBJECT_COLORS: Record<string, string> = Object.fromEntries(
  Object.entries(SUBJECT_TONE).map(([subject, tone]) => [subject, TONES[tone].base])
);

export const getSubjectColor = (subject: string): string =>
  TONES[SUBJECT_TONE[subject] ?? DEFAULT_TONE].base;

const getTone = (subject: string): Tone =>
  TONES[SUBJECT_TONE[subject] ?? DEFAULT_TONE];

// ─── COMPONENT ─────────────────────────────────────────────────────────────────

interface SubjectTagProps {
  subject: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  active?: boolean;
}

export default function SubjectTag({
  subject,
  size = "md",
  onClick,
  active = false,
}: SubjectTagProps) {
  const tone = getTone(subject);

  const padding  = { sm: "3px 10px",  md: "5px 13px",  lg: "7px 17px" }[size];
  const fontSize = { sm: "11px",      md: "12.5px",    lg: "14px"     }[size];

  return (
    <span
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding,
        fontSize,
        fontWeight: 600,
        letterSpacing: "0.005em",
        borderRadius: "999px",
        cursor: onClick ? "pointer" : "default",
        transition: "background 0.18s ease, border-color 0.18s ease, color 0.18s ease",
        userSelect: "none",
        background: active ? tone.base : tone.bg,
        color:      active ? tone.fg   : tone.base,
        border:     `1px solid ${active ? tone.base : tone.border}`,
      }}
    >
      {subject}
    </span>
  );
}
