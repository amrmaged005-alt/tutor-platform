"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────
type Tutor = { id: string; fullName: string | null };
type ClassTutor = { tutor: Tutor };
type Center = { id: string; name: string };
type Owner = { id: string; fullName: string | null };

type ClassResult = {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  location: string | null;
  priceEgp: number;
  capacity: number | null;
  schedule: string | null;
  format: string;
  curriculum: string;
  gradeLevel: string | null;
  language: string;
  center: Center | null;
  owner: Owner | null;
  tutors: ClassTutor[];
  _count: { bookings: number };
};

// ── Constants ──────────────────────────────────────────────────────────────
const SUBJECTS = ["Math", "Physics", "Chemistry", "Biology", "English", "Arabic", "History", "Geography", "CS"];
const CURRICULA = ["NATIONAL", "IGCSE", "AMERICAN", "IB", "FRENCH", "STEM", "OTHER"];
const GRADES = [
  "Grade 7", "Grade 8", "Grade 9",
  "Grade 10", "Grade 11", "Grade 12",
  "Thanaweya Amma", "IGCSE", "AS Level", "A Level",
  "ACT", "SAT",
];
const FORMATS = ["IN_PERSON", "ONLINE", "HYBRID"];
const SORT_OPTIONS = [
  { value: "newest",     label: "Newest first" },
  { value: "price_asc",  label: "Price: low → high" },
  { value: "price_desc", label: "Price: high → low" },
  { value: "popular",    label: "Most popular" },
];

const subjectColors: Record<string, { bg: string; text: string; emoji: string }> = {
  Math:      { bg: "#dbeafe", text: "#1e40af", emoji: "📐" },
  Physics:   { bg: "#ede9fe", text: "#5b21b6", emoji: "⚡" },
  Chemistry: { bg: "#dcfce7", text: "#166534", emoji: "🧪" },
  Biology:   { bg: "#dcfce7", text: "#14532d", emoji: "🧬" },
  English:   { bg: "#fef9c3", text: "#854d0e", emoji: "📝" },
  default:   { bg: "#f3f4f6", text: "#374151", emoji: "📚" },
};

const formatLabel: Record<string, string> = {
  IN_PERSON: "In-Person",
  ONLINE: "Online",
  HYBRID: "Hybrid",
};

const curriculumLabel: Record<string, string> = {
  NATIONAL: "National",
  IGCSE: "IGCSE",
  AMERICAN: "American",
  IB: "IB",
  FRENCH: "French",
  STEM: "STEM",
  OTHER: "Other",
};

// ── Helper: small select style ─────────────────────────────────────────────
const selectStyle: React.CSSProperties = {
  backgroundColor: "#1e293b",
  color: "#cbd5e1",
  border: "1px solid #334155",
  borderRadius: 8,
  padding: "0.5rem 0.75rem",
  fontSize: 13,
  cursor: "pointer",
  outline: "none",
  minWidth: 130,
};

// ── Main Component ─────────────────────────────────────────────────────────
export default function ClassSearch({ initialClasses }: { initialClasses: ClassResult[] }) {
  const [classes, setClasses]       = useState<ClassResult[]>(initialClasses);
  const [loading, setLoading]       = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter state
  const [search,     setSearch]     = useState("");
  const [subject,    setSubject]    = useState("");
  const [curriculum, setCurriculum] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [format,     setFormat]     = useState("");
  const [minPrice,   setMinPrice]   = useState("");
  const [maxPrice,   setMaxPrice]   = useState("");
  const [sortBy,     setSortBy]     = useState("newest");

  // ── Fetch from API whenever any filter changes ─────────────────────────
  const fetchClasses = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search)     params.set("search",     search);
    if (subject)    params.set("subject",    subject);
    if (curriculum) params.set("curriculum", curriculum);
    if (gradeLevel) params.set("gradeLevel", gradeLevel);
    if (format)     params.set("format",     format);
    if (minPrice)   params.set("minPrice",   minPrice);
    if (maxPrice)   params.set("maxPrice",   maxPrice);
    params.set("sortBy", sortBy);

    const res  = await fetch(`/api/classes/search?${params.toString()}`);
    const data = await res.json();
    setClasses(data.classes ?? []);
    setLoading(false);
  }, [search, subject, curriculum, gradeLevel, format, minPrice, maxPrice, sortBy]);

  useEffect(() => {
    const timer = setTimeout(fetchClasses, 300); // debounce 300ms
    return () => clearTimeout(timer);
  }, [fetchClasses]);

  // ── Clear all filters ──────────────────────────────────────────────────
  function clearAll() {
    setSearch(""); setSubject(""); setCurriculum("");
    setGradeLevel(""); setFormat(""); setMinPrice("");
    setMaxPrice(""); setSortBy("newest");
  }

  const hasFilters = search || subject || curriculum || gradeLevel || format || minPrice || maxPrice;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── Search bar row ── */}
      <div style={{
        maxWidth: 900,
        margin: "0 auto 1.5rem",
        padding: "0 2rem",
        display: "flex",
        gap: "0.75rem",
        alignItems: "center",
        flexWrap: "wrap" as const,
      }}>
        {/* Main search input */}
        <input
          type="text"
          placeholder="Search classes, tutors, centers…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: 220,
            backgroundColor: "#1e293b",
            color: "#f1f5f9",
            border: "1px solid #334155",
            borderRadius: 10,
            padding: "0.65rem 1rem",
            fontSize: 15,
            outline: "none",
          }}
        />

        {/* Toggle filters button */}
        <button
          onClick={() => setFiltersOpen(o => !o)}
          style={{
            backgroundColor: filtersOpen ? "#3b82f6" : "#1e293b",
            color: filtersOpen ? "white" : "#94a3b8",
            border: "1px solid #334155",
            borderRadius: 10,
            padding: "0.65rem 1.25rem",
            fontSize: 14,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          {filtersOpen ? "✕ Hide filters" : "⚙ Filters"}
          {hasFilters && !filtersOpen && (
            <span style={{
              marginLeft: 6,
              backgroundColor: "#3b82f6",
              color: "white",
              borderRadius: 20,
              fontSize: 11,
              padding: "1px 7px",
            }}>ON</span>
          )}
        </button>

        {/* Sort dropdown */}
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={selectStyle}>
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* ── Filters panel ── */}
      {filtersOpen && (
        <div style={{
          maxWidth: 900,
          margin: "0 auto 2rem",
          padding: "1.25rem 1.5rem",
          backgroundColor: "#1e293b",
          border: "1px solid #334155",
          borderRadius: 14,
          marginLeft: "2rem",
          marginRight: "2rem",
        }}>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "1rem", alignItems: "flex-end" }}>

            {/* Subject */}
            <div>
              <label style={{ display: "block", fontSize: 11, color: "#64748b", marginBottom: 4, fontWeight: 600, textTransform: "uppercase" as const }}>Subject</label>
              <select value={subject} onChange={e => setSubject(e.target.value)} style={selectStyle}>
                <option value="">All subjects</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Curriculum */}
            <div>
              <label style={{ display: "block", fontSize: 11, color: "#64748b", marginBottom: 4, fontWeight: 600, textTransform: "uppercase" as const }}>Curriculum</label>
              <select value={curriculum} onChange={e => setCurriculum(e.target.value)} style={selectStyle}>
                <option value="">All curricula</option>
                {CURRICULA.map(c => <option key={c} value={c}>{curriculumLabel[c]}</option>)}
              </select>
            </div>

            {/* Grade level */}
            <div>
              <label style={{ display: "block", fontSize: 11, color: "#64748b", marginBottom: 4, fontWeight: 600, textTransform: "uppercase" as const }}>Grade / Level</label>
              <select value={gradeLevel} onChange={e => setGradeLevel(e.target.value)} style={selectStyle}>
                <option value="">All grades</option>
                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            {/* Format */}
            <div>
              <label style={{ display: "block", fontSize: 11, color: "#64748b", marginBottom: 4, fontWeight: 600, textTransform: "uppercase" as const }}>Format</label>
              <select value={format} onChange={e => setFormat(e.target.value)} style={selectStyle}>
                <option value="">Any format</option>
                {FORMATS.map(f => <option key={f} value={f}>{formatLabel[f]}</option>)}
              </select>
            </div>

            {/* Price range */}
            <div>
              <label style={{ display: "block", fontSize: 11, color: "#64748b", marginBottom: 4, fontWeight: 600, textTransform: "uppercase" as const }}>Price (EGP)</label>
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  style={{ ...selectStyle, width: 70 }}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  style={{ ...selectStyle, width: 70 }}
                />
              </div>
            </div>

            {/* Clear button */}
            {hasFilters && (
              <button onClick={clearAll} style={{
                backgroundColor: "transparent",
                color: "#f87171",
                border: "1px solid #f87171",
                borderRadius: 8,
                padding: "0.5rem 1rem",
                fontSize: 13,
                cursor: "pointer",
              }}>
                Clear all
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Results count + loading ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto 1rem", padding: "0 2rem" }}>
        <p style={{ color: "#64748b", fontSize: 13 }}>
          {loading ? "Searching…" : `${classes.length} class${classes.length !== 1 ? "es" : ""} found`}
        </p>
      </div>

      {/* ── Class grid ── */}
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "0 2rem 4rem",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: "1.5rem",
        opacity: loading ? 0.5 : 1,
        transition: "opacity 0.2s",
      }}>
        {classes.length === 0 && !loading && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#64748b", padding: "3rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔍</div>
            <p>No classes match your filters. Try clearing some filters.</p>
          </div>
        )}

        {classes.map((cls) => {
          const style = subjectColors[cls.subject] ?? subjectColors.default;
          const spotsLeft = cls.capacity ? cls.capacity - cls._count.bookings : null;
          const isFull = spotsLeft !== null && spotsLeft <= 0;
          const displayName = cls.center
            ? cls.center.name
            : cls.owner?.fullName ?? "Unknown";
          const isCenter = !!cls.center;

          return (
            <Link key={cls.id} href={`/classes/${cls.id}`} style={{ textDecoration: "none" }}>
              <div style={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 16,
                padding: "1.5rem",
                height: "100%",
                boxSizing: "border-box" as const,
                transition: "border-color 0.2s",
              }}>
                {/* Subject badge + full badge */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <span style={{
                    backgroundColor: style.bg,
                    color: style.text,
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "4px 12px",
                    borderRadius: 20,
                  }}>
                    {style.emoji} {cls.subject}
                  </span>
                  <div style={{ display: "flex", gap: 6 }}>
                    {/* Format badge */}
                    <span style={{
                      backgroundColor: cls.format === "ONLINE" ? "#0c4a6e" : cls.format === "HYBRID" ? "#1e3a5f" : "#0f172a",
                      color: cls.format === "ONLINE" ? "#38bdf8" : "#94a3b8",
                      fontSize: 10,
                      fontWeight: 600,
                      padding: "3px 8px",
                      borderRadius: 20,
                      border: "1px solid #334155",
                    }}>
                      {formatLabel[cls.format] ?? cls.format}
                    </span>
                    {isFull && (
                      <span style={{ backgroundColor: "#450a0a", color: "#fca5a5", fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20 }}>FULL</span>
                    )}
                    {!isFull && spotsLeft !== null && spotsLeft <= 3 && (
                      <span style={{ backgroundColor: "#451a03", color: "#fdba74", fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20 }}>Only {spotsLeft} left</span>
                    )}
                  </div>
                </div>

                <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "0.4rem" }}>
                  {cls.title}
                </h2>

                {/* Curriculum + grade pills */}
                <div style={{ display: "flex", gap: 6, marginBottom: "0.75rem", flexWrap: "wrap" as const }}>
                  <span style={{ backgroundColor: "#0f172a", color: "#64748b", fontSize: 11, padding: "2px 8px", borderRadius: 20, border: "1px solid #1e293b" }}>
                    {curriculumLabel[cls.curriculum] ?? cls.curriculum}
                  </span>
                  {cls.gradeLevel && (
                    <span style={{ backgroundColor: "#0f172a", color: "#64748b", fontSize: 11, padding: "2px 8px", borderRadius: 20, border: "1px solid #1e293b" }}>
                      {cls.gradeLevel}
                    </span>
                  )}
                </div>

                {cls.description && (
                  <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: "1rem", lineHeight: 1.5 }}>
                    {cls.description.length > 80 ? cls.description.slice(0, 80) + "…" : cls.description}
                  </p>
                )}

                <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 2 }}>
                  {cls.location && <div>📍 {cls.location}</div>}
                  {cls.schedule && <div>🕐 {cls.schedule}</div>}
                  <div>{isCenter ? "🏫" : "👤"} {displayName}</div>
                </div>

                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "1.25rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid #334155",
                }}>
                  <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#38bdf8" }}>
                    {cls.priceEgp > 0 ? `${cls.priceEgp} EGP` : "Free"}
                  </span>
                  <span style={{ fontSize: 12, color: "#64748b" }}>
                    {spotsLeft !== null ? `${spotsLeft} spots left` : `${cls._count.bookings} booked`}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}