import { BadgeCheck, Clock3, Flame, RotateCcw, Star, TrendingUp, type LucideIcon } from "lucide-react";
import type { useI18n } from "../components/i18n";

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
  studentsThisWeek?: number;
  repeatStudentCount?: number;
  lastBookedAt?: string | null;
}

const SUBJECT_COLORS: Record<string, string> = {
  Math: "var(--accent)",
  Mathematics: "var(--accent)",
  Physics: "var(--accent)",
  Chemistry: "var(--success)",
  Biology: "var(--accent)",
  English: "var(--warning)",
  Arabic: "var(--error)",
  History: "var(--warning)",
  Geography: "var(--accent)",
  French: "var(--accent)",
  "Computer Science": "var(--accent)",
  Science: "var(--success)",
  Economics: "var(--warning)",
  Accounting: "var(--warning)",
  Business: "var(--accent)",
};

export function subjectColor(subject: string) {
  return SUBJECT_COLORS[subject] ?? "var(--accent)";
}

export function isTopTutor(tutor: TutorCardData) {
  return tutor.avgRating !== null && tutor.avgRating >= 4.7 && (tutor.reviewCount >= 3 || tutor.studentCount >= 10);
}

type Translate = ReturnType<typeof useI18n>["t"];

export function getRelativeBookedLabel(value: string | null | undefined, t: Translate) {
  if (!value) return null;

  const bookedAt = new Date(value).getTime();
  if (!Number.isFinite(bookedAt)) return null;

  const diffMs = Date.now() - bookedAt;
  const minutes = Math.max(1, Math.round(diffMs / 60000));
  if (minutes < 60) return t("tutor.lastBookedMinutes", { n: minutes });

  const hours = Math.round(minutes / 60);
  if (hours < 24) return t("tutor.lastBookedHours", { n: hours });

  const days = Math.round(hours / 24);
  return t("tutor.lastBookedDays", { n: days });
}

export function Avatar({ name, photoUrl, size = 64 }: { name: string; photoUrl: string | null; size?: number }) {
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
      aria-hidden="true"
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

export function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span style={{ display: "inline-flex", gap: 1 }} aria-hidden="true">
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

export function SubjectPill({ subject }: { subject: string }) {
  const color = subjectColor(subject);
  return (
    <span
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
        color,
        borderRadius: 999,
        padding: "2px 9px",
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      {subject}
    </span>
  );
}

export function VerifiedBadge({ label }: { label: string }) {
  return (
    <div
      title={label}
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
        letterSpacing: 0,
      }}
    >
      <BadgeCheck size={10} strokeWidth={2.4} aria-hidden="true" />
      {label}
    </div>
  );
}

export function TutorTrustSignals({
  tutor,
  compact,
  labels,
}: {
  tutor: TutorCardData;
  compact: boolean;
  labels: {
    topTutor: string;
    studentsThisWeek: string;
    repeatStudents: string;
    lastBooked: string | null;
  };
}) {
  const signals = [
    isTopTutor(tutor) ? { icon: Flame, label: labels.topTutor, tone: "var(--warning)" } : null,
    tutor.studentsThisWeek ? { icon: TrendingUp, label: labels.studentsThisWeek, tone: "var(--success)" } : null,
    labels.lastBooked ? { icon: Clock3, label: labels.lastBooked, tone: "var(--accent)" } : null,
    tutor.repeatStudentCount ? { icon: RotateCcw, label: labels.repeatStudents, tone: "var(--accent)" } : null,
  ].filter(Boolean).slice(0, compact ? 2 : 3) as Array<{ icon: LucideIcon; label: string; tone: string }>;

  if (signals.length === 0) return null;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
      {signals.map(({ icon: Icon, label, tone }) => (
        <span
          key={label}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            minHeight: compact ? 24 : 26,
            borderRadius: 999,
            padding: compact ? "3px 7px" : "4px 9px",
            backgroundColor: "var(--bg-subtle)",
            border: "1px solid var(--border-light)",
            color: "var(--text-secondary)",
            fontSize: compact ? 10 : 11,
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          <Icon size={compact ? 11 : 12} strokeWidth={2.2} color={tone} aria-hidden="true" />
          {label}
        </span>
      ))}
    </div>
  );
}
