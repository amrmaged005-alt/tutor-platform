"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import BackgroundFloaters from "../../components/ui/BackgroundFloaters";
import SectionHeader from "../../components/ui/SectionHeader";

// ─── TYPES ─────────────────────────────────────────────────────────────────────
export interface ClassCardData {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  city: string;
  location: string | null;
  priceEgp: number;
  capacity: number | null;
  schedule: string | null;
  format: string;
  curriculum: string;
  gradeLevel: string | null;
  language: string;
  bookingsCount: number;
  spotsLeft: number | null;
  avgRating: number | null;
  reviewCount: number;
  center: { id: string; name: string; city: string } | null;
  owner: { id: string; fullName: string | null; name: string | null; photoUrl: string | null } | null;
}

// ─── CONSTANTS ─────────────────────────────────────────────────────────────────
const SUBJECT_META: Record<string, { color: string; bg: string; emoji: string }> = {
  Math:             { color: "#60a5fa", bg: "#1e3a5f", emoji: "📐" },
  Mathematics:      { color: "#60a5fa", bg: "#1e3a5f", emoji: "📐" },
  Physics:          { color: "#c084fc", bg: "#2e1065", emoji: "⚡" },
  Chemistry:        { color: "#34d399", bg: "#064e3b", emoji: "🧪" },
  Biology:          { color: "#4ade80", bg: "#052e16", emoji: "🧬" },
  English:          { color: "#fb923c", bg: "#422006", emoji: "📝" },
  Arabic:           { color: "#f87171", bg: "#450a0a", emoji: "✍️" },
  History:          { color: "#a8a29e", bg: "#1c1917", emoji: "📜" },
  Geography:        { color: "#2dd4bf", bg: "#042f2e", emoji: "🌍" },
  "Computer Science": { color: "#38bdf8", bg: "#0c1a2e", emoji: "💻" },
  Science:          { color: "#34d399", bg: "#052e16", emoji: "🔬" },
  French:           { color: "#a78bfa", bg: "#1e1b4b", emoji: "🇫🇷" },
  Economics:        { color: "#fbbf24", bg: "#1c1400", emoji: "📊" },
  Business:         { color: "#e879f9", bg: "#2d0a3f", emoji: "💼" },
};

const FORMAT_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  IN_PERSON: { label: "In-Person", color: "#4ade80", bg: "#052e16", icon: "📍" },
  ONLINE:    { label: "Online",    color: "#38bdf8", bg: "#0c2a3f", icon: "💻" },
  HYBRID:    { label: "Hybrid",    color: "#c084fc", bg: "#1e1040", icon: "🔀" },
};

const CURRICULUM_LABELS: Record<string, string> = {
  NATIONAL: "National", IGCSE: "IGCSE", AMERICAN: "American",
  IB: "IB", FRENCH: "French", STEM: "STEM", OTHER: "Other",
};

const ALL_SUBJECTS = ["Math", "Physics", "Chemistry", "Biology", "English", "Arabic", "History", "Geography", "Computer Science", "Science", "French", "Economics", "Business"];
const ALL_CURRICULA = ["NATIONAL", "IGCSE", "AMERICAN", "IB", "FRENCH", "STEM"];
const ALL_FORMATS = ["IN_PERSON", "ONLINE", "HYBRID"];
const ALL_GRADES = ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12", "Thanaweya Amma", "IGCSE", "AS Level", "A Level", "SAT", "ACT"];
const TRENDING = ["Math", "Physics", "IGCSE", "Online", "Thanaweya Amma", "Chemistry", "Grade 11"];

function getSubjectMeta(subject: string) {
  return SUBJECT_META[subject] ?? { color: "#94a3b8", bg: "#1e293b", emoji: "📚" };
}

// ─── SPOTS BAR ─────────────────────────────────────────────────────────────────
function SpotsBar({ capacity, booked }: { capacity: number; booked: number }) {
  const pct = Math.min((booked / capacity) * 100, 100);
  const left = capacity - booked;
  const color = pct > 80 ? "#ef4444" : pct > 50 ? "#f59e0b" : "#22c55e";
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: "#64748b" }}>{booked} enrolled</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: left <= 3 ? "#ef4444" : left <= 5 ? "#f59e0b" : "#64748b" }}>
          {left <= 0 ? "FULL" : left <= 5 ? `⚡ ${left} left!` : `${left} spots`}
        </span>
      </div>
      <div style={{ height: 4, backgroundColor: "#334155", borderRadius: 99, overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ height: "100%", background: color, borderRadius: 99 }}
        />
      </div>
    </div>
  );
}

// ─── CLASS CARD ────────────────────────────────────────────────────────────────
function ClassCard({ cls, index = 0 }: { cls: ClassCardData; index?: number }) {
  const meta = getSubjectMeta(cls.subject);
  const fmt = FORMAT_META[cls.format] ?? { label: cls.format, color: "#94a3b8", bg: "#1e293b", icon: "📍" };
  const isFull = cls.spotsLeft !== null && cls.spotsLeft <= 0;
  const isUrgent = cls.spotsLeft !== null && cls.spotsLeft > 0 && cls.spotsLeft <= 5;
  const displayName = cls.center?.name ?? cls.owner?.fullName ?? cls.owner?.name ?? "Coursaty Tutor";
  const isCenter = !!cls.center;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      whileHover={{ y: -6, boxShadow: `0 20px 48px ${meta.color}20` }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = `${meta.color}50`; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#334155"; }}
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
    >
      {/* Urgency top bar */}
      {isUrgent && (
        <motion.div
          animate={{ opacity: [1, 0.6, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ height: 3, background: "linear-gradient(90deg, #ef4444, #f59e0b)", flexShrink: 0 }}
        />
      )}

      {/* Subject color accent bar */}
      {!isUrgent && (
        <div style={{ height: 3, background: `linear-gradient(90deg, ${meta.color}, ${meta.color}44)`, flexShrink: 0 }} />
      )}

      <div style={{ padding: "18px 18px 0" }}>
        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          {/* Subject badge */}
          <span style={{
            backgroundColor: meta.bg, color: meta.color,
            fontSize: 12, fontWeight: 700, padding: "4px 12px",
            borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 5,
          }}>
            <span>{meta.emoji}</span> {cls.subject}
          </span>

          {/* Format badge */}
          <span style={{
            backgroundColor: fmt.bg, color: fmt.color,
            fontSize: 11, fontWeight: 600, padding: "3px 10px",
            borderRadius: 999, border: `1px solid ${fmt.color}30`,
          }}>
            {fmt.icon} {fmt.label}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: 15, fontWeight: 700, color: "#f1f5f9",
          margin: "0 0 8px", lineHeight: 1.3,
        }}>
          {cls.title}
        </h3>

        {/* Tags row */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          <span style={{ backgroundColor: "#0f172a", color: "#64748b", fontSize: 11, padding: "2px 8px", borderRadius: 999, border: "1px solid #334155" }}>
            {CURRICULUM_LABELS[cls.curriculum] ?? cls.curriculum}
          </span>
          {cls.gradeLevel && (
            <span style={{ backgroundColor: "#0f172a", color: "#64748b", fontSize: 11, padding: "2px 8px", borderRadius: 999, border: "1px solid #334155" }}>
              {cls.gradeLevel}
            </span>
          )}
          {isFull && (
            <span style={{ backgroundColor: "#450a0a", color: "#fca5a5", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>
              FULL
            </span>
          )}
          {isUrgent && !isFull && (
            <span style={{ backgroundColor: "#451a03", color: "#fdba74", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>
              🔥 {cls.spotsLeft} left
            </span>
          )}
        </div>

        {/* Description */}
        {cls.description && (
          <p style={{
            color: "#64748b", fontSize: 13, lineHeight: 1.6,
            margin: "0 0 10px",
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {cls.description}
          </p>
        )}

        {/* Info rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
          {(cls.location || cls.city) && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#94a3b8" }}>
              <span>📍</span><span>{cls.location ?? cls.city}</span>
            </div>
          )}
          {cls.schedule && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#94a3b8" }}>
              <span>🕐</span><span>{cls.schedule}</span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#94a3b8" }}>
            <span>{isCenter ? "🏫" : "👤"}</span>
            <span>{displayName}</span>
            {isCenter && (
              <span style={{ backgroundColor: "#1d4ed820", color: "#60a5fa", fontSize: 10, padding: "1px 6px", borderRadius: 6, fontWeight: 600, border: "1px solid #1d4ed840" }}>
                CENTER
              </span>
            )}
          </div>
        </div>

        {/* Rating */}
        {cls.avgRating !== null && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{ color: "#f59e0b", fontSize: 13 }}>{"★".repeat(Math.round(cls.avgRating))}{"☆".repeat(5 - Math.round(cls.avgRating))}</span>
            <span style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 13 }}>{cls.avgRating.toFixed(1)}</span>
            <span style={{ color: "#64748b", fontSize: 12 }}>({cls.reviewCount})</span>
          </div>
        )}

        {/* Spots bar */}
        {cls.capacity && cls.capacity > 0 && (
          <SpotsBar capacity={cls.capacity} booked={cls.bookingsCount} />
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "14px 18px 18px", marginTop: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid #334155" }}>
          <div>
            <div style={{ fontSize: "1.2rem", fontWeight: 900, color: cls.priceEgp === 0 ? "#4ade80" : "#38bdf8" }}>
              {cls.priceEgp === 0 ? "Free" : cls.priceEgp.toLocaleString() + " EGP"}
            </div>
            {cls.priceEgp > 0 && <div style={{ fontSize: 10, color: "#64748b" }}>per month</div>}
          </div>
          <Link
            href={`/classes/${cls.id}`}
            style={{
              backgroundColor: isFull ? "#1e293b" : `${meta.color}20`,
              color: isFull ? "#64748b" : meta.color,
              border: `1px solid ${isFull ? "#334155" : `${meta.color}40`}`,
              borderRadius: 10, padding: "7px 16px",
              fontSize: 13, fontWeight: 700,
              textDecoration: "none", whiteSpace: "nowrap",
              transition: "all 0.2s",
            }}
          >
            {isFull ? "Full" : "View Class →"}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── FILTER SIDEBAR ────────────────────────────────────────────────────────────
function FilterSidebar({
  selectedSubjects, setSelectedSubjects,
  selectedFormats, setSelectedFormats,
  selectedCurriculum, setSelectedCurriculum,
  selectedGrade, setSelectedGrade,
  maxPrice, setMaxPrice,
  onClear, hasFilters,
}: {
  selectedSubjects: string[]; setSelectedSubjects: (s: string[]) => void;
  selectedFormats: string[]; setSelectedFormats: (f: string[]) => void;
  selectedCurriculum: string; setSelectedCurriculum: (c: string) => void;
  selectedGrade: string; setSelectedGrade: (g: string) => void;
  maxPrice: number; setMaxPrice: (p: number) => void;
  onClear: () => void; hasFilters: boolean;
}) {
  function toggleSubject(s: string) {
    setSelectedSubjects(selectedSubjects.includes(s)
      ? selectedSubjects.filter(x => x !== s)
      : [...selectedSubjects, s]);
  }
  function toggleFormat(f: string) {
    setSelectedFormats(selectedFormats.includes(f)
      ? selectedFormats.filter(x => x !== f)
      : [...selectedFormats, f]);
  }

  const sectionLabel: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: "#64748b",
    letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10,
  };

  return (
    <div style={{
      width: 256, flexShrink: 0,
      position: "sticky", top: 24, alignSelf: "flex-start",
      backgroundColor: "#1e293b", border: "1px solid #334155",
      borderRadius: 20, padding: "20px 18px",
      display: "flex", flexDirection: "column", gap: 22,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9" }}>🎯 Filters</span>
        {hasFilters && (
          <button onClick={onClear} style={{ background: "none", border: "none", color: "#3b82f6", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0 }}>
            Clear all
          </button>
        )}
      </div>

      {/* Format */}
      <div>
        <div style={sectionLabel}>Format</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {ALL_FORMATS.map(f => {
            const fmt = FORMAT_META[f];
            const active = selectedFormats.includes(f);
            return (
              <button key={f} onClick={() => toggleFormat(f)} style={{
                display: "flex", alignItems: "center", gap: 8,
                background: active ? `${fmt.color}12` : "none",
                border: `1px solid ${active ? fmt.color + "40" : "transparent"}`,
                borderRadius: 8, padding: "7px 10px", textAlign: "left",
                color: active ? fmt.color : "#94a3b8",
                fontWeight: active ? 600 : 400, fontSize: 14, cursor: "pointer",
                transition: "all 0.15s",
              }}>
                <span>{fmt.icon}</span> {fmt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subjects */}
      <div>
        <div style={sectionLabel}>Subject</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {ALL_SUBJECTS.map(s => {
            const active = selectedSubjects.includes(s);
            const meta = getSubjectMeta(s);
            return (
              <button key={s} onClick={() => toggleSubject(s)} style={{
                padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                cursor: "pointer",
                border: `1px solid ${active ? meta.color : "#334155"}`,
                backgroundColor: active ? meta.bg : "transparent",
                color: active ? meta.color : "#64748b",
                transition: "all 0.15s",
              }}>
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Curriculum */}
      <div>
        <div style={sectionLabel}>Curriculum</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <button onClick={() => setSelectedCurriculum("")} style={{
            background: selectedCurriculum === "" ? "#3b82f615" : "none",
            border: selectedCurriculum === "" ? "1px solid #3b82f640" : "1px solid transparent",
            borderRadius: 8, padding: "6px 10px", textAlign: "left",
            color: selectedCurriculum === "" ? "#3b82f6" : "#94a3b8",
            fontSize: 13, fontWeight: selectedCurriculum === "" ? 600 : 400, cursor: "pointer",
          }}>All Curricula</button>
          {ALL_CURRICULA.map(c => (
            <button key={c} onClick={() => setSelectedCurriculum(c === selectedCurriculum ? "" : c)} style={{
              background: selectedCurriculum === c ? "#3b82f615" : "none",
              border: selectedCurriculum === c ? "1px solid #3b82f640" : "1px solid transparent",
              borderRadius: 8, padding: "6px 10px", textAlign: "left",
              color: selectedCurriculum === c ? "#3b82f6" : "#94a3b8",
              fontSize: 13, fontWeight: selectedCurriculum === c ? 600 : 400, cursor: "pointer",
            }}>{CURRICULUM_LABELS[c]}</button>
          ))}
        </div>
      </div>

      {/* Grade */}
      <div>
        <div style={sectionLabel}>Grade / Level</div>
        <select
          value={selectedGrade}
          onChange={e => setSelectedGrade(e.target.value)}
          style={{
            width: "100%", backgroundColor: "#0f172a", color: "#cbd5e1",
            border: "1px solid #334155", borderRadius: 10,
            padding: "8px 12px", fontSize: 13, cursor: "pointer", outline: "none",
          }}
        >
          <option value="">All Grades</option>
          {ALL_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      {/* Max Price */}
      <div>
        <div style={{ ...sectionLabel, marginBottom: 8 }}>
          Max Price: <span style={{ color: "#f1f5f9", fontWeight: 700 }}>{maxPrice === 2000 ? "Any" : `${maxPrice} EGP`}</span>
        </div>
        <input
          type="range" min={0} max={2000} step={50}
          value={maxPrice}
          onChange={e => setMaxPrice(Number(e.target.value))}
          style={{ width: "100%", accentColor: "#3b82f6" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginTop: 4 }}>
          <span>Free</span><span>2000 EGP</span>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN CLIENT COMPONENT ─────────────────────────────────────────────────────
export default function ClassesClient({ classes }: { classes: ClassCardData[] }) {
  const [search, setSearch] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [maxPrice, setMaxPrice] = useState(2000);
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc" | "popular" | "rating">("newest");

  // Quick toggle for trending pills
  function toggleTrending(tag: string) {
    if (ALL_SUBJECTS.includes(tag)) {
      setSelectedSubjects(prev => prev.includes(tag) ? prev.filter(x => x !== tag) : [...prev, tag]);
    } else if (tag === "Online") {
      setSelectedFormats(prev => prev.includes("ONLINE") ? prev.filter(x => x !== "ONLINE") : [...prev, "ONLINE"]);
    } else if (tag === "IGCSE") {
      setSelectedCurriculum(prev => prev === "IGCSE" ? "" : "IGCSE");
    } else if (ALL_GRADES.includes(tag)) {
      setSelectedGrade(prev => prev === tag ? "" : tag);
    }
  }

  function clearFilters() {
    setSearch(""); setSelectedSubjects([]); setSelectedFormats([]);
    setSelectedCurriculum(""); setSelectedGrade(""); setMaxPrice(2000);
    setSortBy("newest");
  }

  const hasFilters = selectedSubjects.length > 0 || selectedFormats.length > 0 || !!selectedCurriculum || !!selectedGrade || maxPrice < 2000 || !!search;

  // Filter + sort
  const filtered = useMemo(() => {
    let result = classes.filter(c => {
      if (search) {
        const q = search.toLowerCase();
        const match = c.title.toLowerCase().includes(q)
          || c.subject.toLowerCase().includes(q)
          || (c.description ?? "").toLowerCase().includes(q)
          || (c.owner?.fullName ?? c.owner?.name ?? "").toLowerCase().includes(q)
          || (c.center?.name ?? "").toLowerCase().includes(q);
        if (!match) return false;
      }
      if (selectedSubjects.length > 0 && !selectedSubjects.includes(c.subject)) return false;
      if (selectedFormats.length > 0 && !selectedFormats.includes(c.format)) return false;
      if (selectedCurriculum && c.curriculum !== selectedCurriculum) return false;
      if (selectedGrade && c.gradeLevel !== selectedGrade) return false;
      if (maxPrice < 2000 && c.priceEgp > maxPrice) return false;
      return true;
    });

    // Sort
    if (sortBy === "price_asc") result = [...result].sort((a, b) => a.priceEgp - b.priceEgp);
    else if (sortBy === "price_desc") result = [...result].sort((a, b) => b.priceEgp - a.priceEgp);
    else if (sortBy === "popular") result = [...result].sort((a, b) => b.bookingsCount - a.bookingsCount);
    else if (sortBy === "rating") result = [...result].sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));

    return result;
  }, [classes, search, selectedSubjects, selectedFormats, selectedCurriculum, selectedGrade, maxPrice, sortBy]);

  // Segments (only when not filtering)
  const isFiltering = hasFilters;
  const freeClasses = filtered.filter(c => c.priceEgp === 0);
  const topRated = filtered.filter(c => c.avgRating !== null && c.avgRating >= 4.5);
  const onlineClasses = filtered.filter(c => c.format === "ONLINE");
  const urgentClasses = filtered.filter(c => c.spotsLeft !== null && c.spotsLeft > 0 && c.spotsLeft <= 5);
  const allOthers = filtered.filter(c =>
    !topRated.includes(c) &&
    !urgentClasses.includes(c)
  );

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: "#0f172a",
      fontFamily: "system-ui, -apple-system, sans-serif",
      color: "#f1f5f9", position: "relative",
    }}>
      <BackgroundFloaters count={4} />

      {/* ── HERO ── */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, #0f172a 0%, #0c1a2e 50%, #0f172a 100%)",
        borderBottom: "1px solid #334155",
        padding: "52px 24px 44px", zIndex: 1,
      }}>
        {/* Grid texture */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `linear-gradient(#ffffff05 1px, transparent 1px), linear-gradient(90deg, #ffffff05 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }} />
        {/* Glow orb */}
        <div style={{
          position: "absolute", top: -120, right: -80,
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, #38bdf820 0%, transparent 65%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -80, left: -60,
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, #3b82f615 0%, transparent 65%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
          <Link href="/" style={{ color: "#64748b", fontSize: 13, textDecoration: "none" }}>← Home</Link>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            style={{
              fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 900,
              margin: "20px 0 10px", letterSpacing: "-0.03em", lineHeight: 1.15,
            }}
          >
            Browse{" "}
            <span style={{ background: "linear-gradient(90deg, #38bdf8, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Classes
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.13 }}
            style={{ color: "#94a3b8", fontSize: 17, marginBottom: 24, maxWidth: 460 }}
          >
            {classes.length} classes across all subjects and curricula. Find yours in seconds.
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            style={{ position: "relative", maxWidth: 560, marginBottom: 20 }}
          >
            <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 18, pointerEvents: "none" }}>🔍</span>
            <input
              type="text"
              placeholder="Search by name, subject, tutor, or keyword..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", backgroundColor: "#1e293b",
                border: "1px solid #334155", borderRadius: 14,
                padding: "13px 16px 13px 48px", color: "#f1f5f9",
                fontSize: 15, outline: "none", boxSizing: "border-box",
                fontFamily: "inherit", transition: "border-color 0.2s",
              }}
              onFocus={e => (e.target.style.borderColor = "#38bdf8")}
              onBlur={e => (e.target.style.borderColor = "#334155")}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 18 }}>×</button>
            )}
          </motion.div>

          {/* Trending pills */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}
          >
            <span style={{ color: "#64748b", fontSize: 12, fontWeight: 600 }}>🔥 Trending:</span>
            {TRENDING.map(tag => {
              const isActive = selectedSubjects.includes(tag)
                || (tag === "Online" && selectedFormats.includes("ONLINE"))
                || (tag === "IGCSE" && selectedCurriculum === "IGCSE")
                || selectedGrade === tag;
              const meta = getSubjectMeta(tag);
              return (
                <motion.button
                  key={tag}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => toggleTrending(tag)}
                  style={{
                    padding: "5px 14px", borderRadius: 999, fontSize: 13,
                    fontWeight: 600, cursor: "pointer",
                    border: `1px solid ${isActive ? meta.color : "#334155"}`,
                    backgroundColor: isActive ? meta.bg : "#1e293b",
                    color: isActive ? meta.color : "#64748b",
                    transition: "all 0.15s",
                  }}
                >
                  {tag}
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding: "36px 24px 80px",
        position: "relative", zIndex: 1,
        display: "flex", gap: 28, alignItems: "flex-start",
      }}>
        {/* Sidebar */}
        <FilterSidebar
          selectedSubjects={selectedSubjects} setSelectedSubjects={setSelectedSubjects}
          selectedFormats={selectedFormats} setSelectedFormats={setSelectedFormats}
          selectedCurriculum={selectedCurriculum} setSelectedCurriculum={setSelectedCurriculum}
          selectedGrade={selectedGrade} setSelectedGrade={setSelectedGrade}
          maxPrice={maxPrice} setMaxPrice={setMaxPrice}
          onClear={clearFilters} hasFilters={hasFilters}
        />

        {/* Cards area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Controls row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <span style={{ color: "#64748b", fontSize: 14 }}>
              Showing{" "}
              <span style={{ color: "#f1f5f9", fontWeight: 700 }}>{filtered.length}</span>
              {" "}class{filtered.length !== 1 ? "es" : ""}
              {hasFilters && " matching filters"}
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {hasFilters && (
                <button onClick={clearFilters} style={{
                  background: "none", border: "1px solid #334155", color: "#94a3b8",
                  borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}>✕ Clear</button>
              )}
              <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} style={{
                backgroundColor: "#1e293b", color: "#cbd5e1",
                border: "1px solid #334155", borderRadius: 10,
                padding: "7px 12px", fontSize: 13, cursor: "pointer", outline: "none",
              }}>
                <option value="newest">Newest first</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="popular">Most popular</option>
                <option value="rating">Top rated</option>
              </select>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 20, padding: "64px 32px", textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔍</div>
                <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>No classes found</div>
                <div style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>Try adjusting your filters</div>
                <button onClick={clearFilters} style={{ backgroundColor: "#3b82f6", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  Clear all filters
                </button>
              </motion.div>
            ) : isFiltering ? (
              // Flat list when filtering
              <motion.div key="filtered" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 18 }}>
                  {filtered.map((c, i) => <ClassCard key={c.id} cls={c} index={i} />)}
                </div>
              </motion.div>
            ) : (
              // Segmented view
              <motion.div key="segments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: "flex", flexDirection: "column", gap: 48 }}>

                {/* 🔥 Almost Full */}
                {urgentClasses.length > 0 && (
                  <section>
                    <SectionHeader title="Filling Up Fast" subtitle="These classes have very few spots remaining" badge="🔥 Act Now" badgeColor="#ef4444" />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 18 }}>
                      {urgentClasses.slice(0, 4).map((c, i) => <ClassCard key={c.id} cls={c} index={i} />)}
                    </div>
                  </section>
                )}

                {/* ⭐ Top Rated */}
                {topRated.length > 0 && (
                  <section>
                    <SectionHeader title="Top Rated Classes" subtitle="Highly reviewed by enrolled students" badge="⭐ Highest Rated" badgeColor="#f59e0b" />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 18 }}>
                      {topRated.slice(0, 8).map((c, i) => <ClassCard key={c.id} cls={c} index={i} />)}
                    </div>
                  </section>
                )}

                {/* 💻 Online Classes */}
                {onlineClasses.length > 0 && (
                  <section>
                    <SectionHeader title="Learn From Anywhere" subtitle="Online classes — join from home" badge="💻 Online" badgeColor="#38bdf8" />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 18 }}>
                      {onlineClasses.slice(0, 6).map((c, i) => <ClassCard key={c.id} cls={c} index={i} />)}
                    </div>
                  </section>
                )}

                {/* 💚 Free Classes */}
                {freeClasses.length > 0 && (
                  <section>
                    <SectionHeader title="Free Classes" subtitle="Start learning at zero cost" badge="💚 Free" badgeColor="#22c55e" />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 18 }}>
                      {freeClasses.slice(0, 6).map((c, i) => <ClassCard key={c.id} cls={c} index={i} />)}
                    </div>
                  </section>
                )}

                {/* 📚 All Classes */}
                {allOthers.length > 0 && (
                  <section>
                    <SectionHeader title="All Classes" subtitle="Browse the full catalogue" badge="📚 All" badgeColor="#94a3b8" />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 18 }}>
                      {allOthers.map((c, i) => <ClassCard key={c.id} cls={c} index={i} />)}
                    </div>
                  </section>
                )}

                {filtered.length === 0 && (
                  <div style={{ textAlign: "center", color: "#64748b", padding: "48px 0", fontSize: 15 }}>
                    No classes available yet. Check back soon!
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}