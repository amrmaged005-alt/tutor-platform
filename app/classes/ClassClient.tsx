"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useIsMobile } from "../hooks/useIsMobile";

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

// ─── SUBJECT COLOR SYSTEM (muted, professional) ─────────────────────────────
const SUBJECT_COLORS: Record<string, string> = {
  Math: "var(--accent)", Mathematics: "var(--accent)", Physics: "var(--accent)",
  Chemistry: "var(--success)", Biology: "var(--accent)", English: "var(--warning)",
  Arabic: "var(--error)", History: "var(--warning)", Geography: "var(--accent)",
  "Computer Science": "var(--accent)", Science: "var(--success)", French: "var(--accent)",
  Economics: "var(--warning)", Business: "var(--accent)",
};
function subjectColor(s: string) { return SUBJECT_COLORS[s] ?? "var(--text-secondary)"; }

const FORMAT_LABELS: Record<string, string> = {
  IN_PERSON: "In-Person", ONLINE: "Online", HYBRID: "Hybrid",
};

const CURRICULUM_LABELS: Record<string, string> = {
  NATIONAL: "National", IGCSE: "IGCSE", AMERICAN: "American",
  IB: "IB", FRENCH: "French", STEM: "STEM", OTHER: "Other",
};

const ALL_SUBJECTS = ["Math", "Physics", "Chemistry", "Biology", "English", "Arabic", "History", "Geography", "Computer Science", "Science", "French", "Economics"];
const ALL_CURRICULA = ["NATIONAL", "IGCSE", "AMERICAN", "IB", "FRENCH", "STEM"];
const ALL_FORMATS = ["IN_PERSON", "ONLINE", "HYBRID"];
const ALL_GRADES = ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12", "Thanaweya Amma", "IGCSE", "AS Level", "A Level", "SAT", "ACT"];
const QUICK_PILLS = ["Math", "Physics", "IGCSE", "Online", "Grade 11", "Chemistry"];

// ─── SPOTS BAR ─────────────────────────────────────────────────────────────────
function SpotsBar({ capacity, booked }: { capacity: number; booked: number }) {
  const pct = Math.min((booked / capacity) * 100, 100);
  const left = capacity - booked;
  const barColor = pct > 80 ? "var(--error)" : pct > 50 ? "var(--warning)" : "var(--success)";
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{booked} enrolled</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: left <= 3 ? "var(--error)" : left <= 5 ? "var(--warning)" : "var(--text-secondary)" }}>
          {left <= 0 ? "Full" : left <= 5 ? `${left} spots left` : `${left} spots`}
        </span>
      </div>
      <div style={{ height: 4, backgroundColor: "var(--bg-subtle)", borderRadius: 99, overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ height: "100%", backgroundColor: barColor, borderRadius: 99 }}
        />
      </div>
    </div>
  );
}

// ─── CLASS CARD ────────────────────────────────────────────────────────────────
function ClassCard({ cls, index = 0, isMobile }: { cls: ClassCardData; index?: number; isMobile: boolean }) {
  const color = subjectColor(cls.subject);
  const isFull = cls.spotsLeft !== null && cls.spotsLeft <= 0;
  const isUrgent = cls.spotsLeft !== null && cls.spotsLeft > 0 && cls.spotsLeft <= 5;
  const displayName = cls.center?.name ?? cls.owner?.fullName ?? cls.owner?.name ?? "Coursaty Tutor";
  const isCenter = !!cls.center;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
    >
      <Link
        href={`/classes/${cls.id}`}
        style={{
          textDecoration: "none",
          color: "inherit",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-light)",
          borderRadius: isMobile ? 14 : 14,
          overflow: "hidden",
          transition: "box-shadow 0.2s, border-color 0.2s, transform 0.2s",
          height: "100%",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = "var(--shadow-md)";
          (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)";
          (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
          (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-light)";
          (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
        }}
      >
      {/* Subject color top bar */}
      <div style={{ height: 3, backgroundColor: color, flexShrink: 0 }} />

      <div style={{ padding: isMobile ? "10px 10px 0" : "16px 16px 0" }}>
        {/* Subject + format row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{
            color: "var(--accent-fg)",
            fontSize: isMobile ? 11 : 12, fontWeight: 700,
            backgroundColor: color,
            border: `1px solid ${color}`,
            padding: isMobile ? "3px 8px" : "3px 10px", borderRadius: 99,
            letterSpacing: 0.2,
          }}>
            {cls.subject}
          </span>
          {!isMobile && <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
            {FORMAT_LABELS[cls.format] ?? cls.format}
          </span>}
        </div>

        {/* Title */}
        <h3 style={{ fontSize: isMobile ? 12 : 14, fontWeight: 700, color: "var(--text)", margin: "0 0 6px", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {cls.title}
        </h3>

        {/* Curriculum + grade */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          <span style={{ backgroundColor: "var(--bg-subtle)", color: "var(--text-secondary)", fontSize: 11, padding: "2px 8px", borderRadius: 4, fontWeight: 500 }}>
            {isMobile && cls.gradeLevel ? cls.gradeLevel : (CURRICULUM_LABELS[cls.curriculum] ?? cls.curriculum)}
          </span>
          {!isMobile && cls.gradeLevel && (
            <span style={{ backgroundColor: "var(--bg-subtle)", color: "var(--text-secondary)", fontSize: 11, padding: "2px 8px", borderRadius: 4, fontWeight: 500 }}>
              {cls.gradeLevel}
            </span>
          )}
          {isFull && (
            <span style={{ backgroundColor: "var(--error-bg)", color: "var(--error)", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>
              Full
            </span>
          )}
          {isUrgent && !isFull && (
            <span style={{ backgroundColor: "var(--warning-bg)", color: "var(--warning)", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>
              {cls.spotsLeft} left
            </span>
          )}
        </div>

        {isMobile && (
          <div style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 600, margin: "0 0 8px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {displayName}
          </div>
        )}

        {/* Description */}
        {!isMobile && cls.description && (
          <p style={{
            color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.55, margin: "0 0 8px",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {cls.description}
          </p>
        )}

        {/* Meta info */}
        {!isMobile && <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
          {(cls.location || cls.city) && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1C4.34 1 3 2.34 3 4c0 2.25 3 7 3 7s3-4.75 3-7c0-1.66-1.34-3-3-3zm0 4.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" fill="currentColor"/></svg>
              <span>{cls.location ?? cls.city}</span>
            </div>
          )}
          {cls.schedule && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/><path d="M6 3v3l2 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
              <span>{cls.schedule}</span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="3.5" r="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1.5 10.5c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            <span>{displayName}{isCenter && " · Center"}</span>
          </div>
        </div>}

        {/* Rating */}
        {!isMobile && cls.avgRating !== null && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
            <span style={{ color: "var(--rating)", fontSize: 12 }}>{"★".repeat(Math.round(cls.avgRating))}{"☆".repeat(5 - Math.round(cls.avgRating))}</span>
            <span style={{ fontWeight: 600, color: "var(--text)", fontSize: 12 }}>{cls.avgRating.toFixed(1)}</span>
            <span style={{ color: "var(--text-muted)", fontSize: 12 }}>({cls.reviewCount})</span>
          </div>
        )}

        {/* Spots bar */}
        {!isMobile && cls.capacity && cls.capacity > 0 && (
          <SpotsBar capacity={cls.capacity} booked={cls.bookingsCount} />
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: isMobile ? "8px 10px 12px" : "12px 16px 16px", marginTop: "auto", borderTop: "1px solid var(--bg-subtle)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: isMobile ? "0.95rem" : "1.1rem", fontWeight: 800, color: cls.priceEgp === 0 ? "var(--success)" : "var(--text)", letterSpacing: "-0.02em" }}>
              {cls.priceEgp === 0 ? "Free" : cls.priceEgp.toLocaleString() + " EGP"}
            </div>
            {cls.priceEgp > 0 && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>per month</div>}
          </div>
        </div>
        <span
          style={{
            display: "block",
            textAlign: "center",
            backgroundColor: isFull ? "var(--bg-subtle)" : "var(--accent)",
            color: isFull ? "var(--text-muted)" : "var(--accent-fg)",
            borderRadius: 8, padding: isMobile ? "5px 8px" : "9px",
            fontSize: isMobile ? 11 : 13, fontWeight: 600,
          }}
        >
          {isFull ? "View Details" : "View Class"}
        </span>
      </div>
      </Link>
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
    setSelectedSubjects(selectedSubjects.includes(s) ? selectedSubjects.filter(x => x !== s) : [...selectedSubjects, s]);
  }
  function toggleFormat(f: string) {
    setSelectedFormats(selectedFormats.includes(f) ? selectedFormats.filter(x => x !== f) : [...selectedFormats, f]);
  }

  const sectionLabel: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: "var(--text-muted)",
    letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10,
  };

  return (
    <div style={{
      width: 240, flexShrink: 0,
      position: "sticky", top: 80, alignSelf: "flex-start",
      backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)",
      borderRadius: 14, padding: "18px 16px",
      display: "flex", flexDirection: "column", gap: 20,
      boxShadow: "var(--shadow-sm)",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 14, borderBottom: "1px solid var(--bg-subtle)" }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Filters</span>
        {hasFilters && (
          <button onClick={onClear} style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)", color: "var(--accent)", fontSize: 12, fontWeight: 600, cursor: "pointer", padding: "3px 10px", borderRadius: 99 }}>
            Clear all
          </button>
        )}
      </div>

      {/* Format */}
      <div>
        <div style={sectionLabel}>Format</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {ALL_FORMATS.map(f => {
            const active = selectedFormats.includes(f);
            return (
              <button key={f} onClick={() => toggleFormat(f)} style={{
                display: "flex", alignItems: "center", gap: 8,
                background: active ? "var(--accent-bg)" : "none",
                border: `1px solid ${active ? "var(--accent-border)" : "transparent"}`,
                borderRadius: 7, padding: "7px 10px", textAlign: "left",
                color: active ? "var(--accent)" : "var(--text-secondary)",
                fontWeight: active ? 600 : 400, fontSize: 13, cursor: "pointer",
                transition: "all 0.12s",
              }}>
                {FORMAT_LABELS[f]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subjects */}
      <div>
        <div style={sectionLabel}>Subject</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {ALL_SUBJECTS.map(s => {
            const active = selectedSubjects.includes(s);
            const c = subjectColor(s);
            return (
              <button key={s} onClick={() => toggleSubject(s)} style={{
                padding: "3px 9px", borderRadius: 5, fontSize: 11, fontWeight: 600,
                cursor: "pointer",
                border: `1px solid ${active ? c + "40" : "var(--border-light)"}`,
                backgroundColor: active ? c + "10" : "var(--bg-alt)",
                color: active ? c : "var(--text-secondary)",
                transition: "all 0.12s",
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
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {[{ key: "", label: "All Curricula" }, ...ALL_CURRICULA.map(c => ({ key: c, label: CURRICULUM_LABELS[c] }))].map(opt => (
            <button key={opt.key} onClick={() => setSelectedCurriculum(opt.key === selectedCurriculum ? "" : opt.key)} style={{
              background: selectedCurriculum === opt.key ? "var(--accent-bg)" : "none",
              border: `1px solid ${selectedCurriculum === opt.key ? "var(--accent-border)" : "transparent"}`,
              borderRadius: 7, padding: "6px 10px", textAlign: "left",
              color: selectedCurriculum === opt.key ? "var(--accent)" : "var(--text-secondary)",
              fontSize: 13, fontWeight: selectedCurriculum === opt.key ? 600 : 400, cursor: "pointer",
            }}>{opt.label}</button>
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
            width: "100%", backgroundColor: "var(--bg-alt)", color: "var(--text)",
            border: "1px solid var(--border-light)", borderRadius: 8,
            padding: "8px 10px", fontSize: 13, cursor: "pointer", outline: "none",
          }}
        >
          <option value="">All Grades</option>
          {ALL_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      {/* Max Price */}
      <div>
        <div style={{ ...sectionLabel, marginBottom: 8 }}>
          Max Price: <span style={{ color: "var(--text)", fontWeight: 700 }}>{maxPrice === 2000 ? "Any" : `${maxPrice} EGP`}</span>
        </div>
        <input
          type="range" min={0} max={2000} step={50}
          value={maxPrice}
          onChange={e => setMaxPrice(Number(e.target.value))}
          style={{ width: "100%", accentColor: "var(--accent)" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
          <span>Free</span><span>2000 EGP</span>
        </div>
      </div>
    </div>
  );
}

// ─── SECTION HEADER ────────────────────────────────────────────────────────────
function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", margin: "0 0 4px" }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>{subtitle}</p>}
    </div>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────────
export default function ClassesClient({ classes }: { classes: ClassCardData[] }) {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [maxPrice, setMaxPrice] = useState(2000);
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc" | "popular" | "rating">("newest");

  function toggleQuickPill(tag: string) {
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
    setSelectedCurriculum(""); setSelectedGrade(""); setMaxPrice(2000); setSortBy("newest");
  }

  const hasFilters = selectedSubjects.length > 0 || selectedFormats.length > 0 || !!selectedCurriculum || !!selectedGrade || maxPrice < 2000 || !!search;

  const filtered = useMemo(() => {
    let result = classes.filter(c => {
      if (search) {
        const q = search.toLowerCase();
        if (!c.title.toLowerCase().includes(q) && !c.subject.toLowerCase().includes(q)
          && !(c.description ?? "").toLowerCase().includes(q)
          && !(c.owner?.fullName ?? c.owner?.name ?? "").toLowerCase().includes(q)
          && !(c.center?.name ?? "").toLowerCase().includes(q)) return false;
      }
      if (selectedSubjects.length > 0 && !selectedSubjects.includes(c.subject)) return false;
      if (selectedFormats.length > 0 && !selectedFormats.includes(c.format)) return false;
      if (selectedCurriculum && c.curriculum !== selectedCurriculum) return false;
      if (selectedGrade && c.gradeLevel !== selectedGrade) return false;
      if (maxPrice < 2000 && c.priceEgp > maxPrice) return false;
      return true;
    });

    if (sortBy === "price_asc") result = [...result].sort((a, b) => a.priceEgp - b.priceEgp);
    else if (sortBy === "price_desc") result = [...result].sort((a, b) => b.priceEgp - a.priceEgp);
    else if (sortBy === "popular") result = [...result].sort((a, b) => b.bookingsCount - a.bookingsCount);
    else if (sortBy === "rating") result = [...result].sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));
    return result;
  }, [classes, search, selectedSubjects, selectedFormats, selectedCurriculum, selectedGrade, maxPrice, sortBy]);

  const isFiltering = hasFilters;
  const topRated = filtered.filter(c => c.avgRating !== null && c.avgRating >= 4.5);
  const urgentClasses = filtered.filter(c => c.spotsLeft !== null && c.spotsLeft > 0 && c.spotsLeft <= 5);
  const allOthers = filtered.filter(c => !topRated.includes(c) && !urgentClasses.includes(c));

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-alt)", fontFamily: "var(--font-sans)", color: "var(--text)" }}>

      {/* Hero / Page Header */}
      <div style={{
        backgroundColor: "var(--bg-card)",
        borderBottom: "1px solid var(--border-light)",
        padding: isMobile ? "16px 14px 14px" : "2.5rem 1.5rem 2rem",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Link href="/" style={{ color: "var(--text-muted)", fontSize: 13, textDecoration: "none", display: isMobile ? "none" : "inline-flex", alignItems: "center", gap: 4, marginBottom: "1rem" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Home
          </Link>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)", fontWeight: 800, color: "var(--text)", margin: "0 0 0.5rem", letterSpacing: "-0.025em" }}
          >
            Browse Classes
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.08 }}
            style={{ color: "var(--text-secondary)", fontSize: isMobile ? 13 : 15, margin: isMobile ? "0 0 0.75rem" : "0 0 1.5rem" }}
          >
            {classes.length} classes across all subjects and curricula
          </motion.p>

          {/* Search */}
          <div style={{ position: "relative", maxWidth: isMobile ? 420 : 520, marginBottom: isMobile ? "0.5rem" : "1rem" }}>
            <svg style={{ position: "absolute", insetInlineStart: isMobile ? 10 : 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)" }} width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search by subject, tutor, or keyword..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", backgroundColor: "var(--bg-alt)",
                border: "1px solid var(--border-light)", borderRadius: 10,
                padding: isMobile ? "8px 12px" : "11px 14px", paddingInlineStart: isMobile ? 34 : 40, color: "var(--text)",
                fontSize: isMobile ? 13 : 14, outline: "none", boxSizing: "border-box",
                fontFamily: "inherit", transition: "border-color 0.15s, box-shadow 0.15s",
              }}
              onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(13,89,70,0.15)"; }}
              onBlur={e => { e.target.style.borderColor = "var(--border-light)"; e.target.style.boxShadow = "none"; }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ position: "absolute", insetInlineEnd: isMobile ? 8 : 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>×</button>
            )}
          </div>

          {/* Quick pills */}
          <div style={{ display: isMobile ? "none" : "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 600, marginInlineEnd: 2 }}>Quick:</span>
            {QUICK_PILLS.map(tag => {
              const isActive = selectedSubjects.includes(tag) || (tag === "Online" && selectedFormats.includes("ONLINE")) || (tag === "IGCSE" && selectedCurriculum === "IGCSE") || selectedGrade === tag;
              return (
                <button
                  key={tag}
                  onClick={() => toggleQuickPill(tag)}
                  style={{
                    padding: "4px 12px", borderRadius: 99, fontSize: 12,
                    fontWeight: 500, cursor: "pointer",
                    border: `1px solid ${isActive ? "var(--accent-border)" : "var(--border-light)"}`,
                    backgroundColor: isActive ? "var(--accent-bg)" : "var(--bg-card)",
                    color: isActive ? "var(--accent)" : "var(--text-secondary)",
                    transition: "all 0.12s",
                  }}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "16px 14px 64px" : "2rem 1.5rem 5rem", display: "flex", gap: 24, alignItems: "flex-start" }}>

        {/* Sidebar */}
        <div className="desktop-only" style={{ flexDirection: "column", flexShrink: 0 }}>
          <FilterSidebar
            selectedSubjects={selectedSubjects} setSelectedSubjects={setSelectedSubjects}
            selectedFormats={selectedFormats} setSelectedFormats={setSelectedFormats}
            selectedCurriculum={selectedCurriculum} setSelectedCurriculum={setSelectedCurriculum}
            selectedGrade={selectedGrade} setSelectedGrade={setSelectedGrade}
            maxPrice={maxPrice} setMaxPrice={setMaxPrice}
            onClear={clearFilters} hasFilters={hasFilters}
          />
        </div>

        {/* Cards area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Controls */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
            <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>
              <span style={{ color: "var(--text)", fontWeight: 700 }}>{filtered.length}</span>{" "}
              class{filtered.length !== 1 ? "es" : ""}
              {hasFilters && " matching filters"}
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {hasFilters && (
                <button onClick={clearFilters} style={{
                  background: "var(--accent-bg)", border: "1px solid var(--accent-border)", color: "var(--accent)",
                  borderRadius: 99, padding: "5px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}>Clear filters</button>
              )}
              <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} style={{
                backgroundColor: "var(--bg-card)", color: "var(--text)",
                border: "1px solid var(--border-light)", borderRadius: 8,
                padding: "7px 10px", fontSize: 13, cursor: "pointer", outline: "none",
              }}>
                <option value="newest">Newest first</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popular">Most enrolled</option>
                <option value="rating">Top rated</option>
              </select>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 14, padding: "4rem 2rem", textAlign: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: "var(--bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="10" cy="10" r="8.5" stroke="var(--text-muted)" strokeWidth="1.5"/><path d="M17 17l3.5 3.5" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
                <div style={{ color: "var(--text)", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>No classes found</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 20 }}>Try adjusting your search or filters</div>
                <button onClick={clearFilters} style={{ backgroundColor: "var(--accent)", color: "var(--bg-card)", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Clear all filters
                </button>
              </motion.div>
            ) : isFiltering ? (
              <motion.div key="filtered" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(280px, 1fr))", gap: isMobile ? 10 : 16 }}>
                  {filtered.map((c, i) => <ClassCard key={c.id} cls={c} index={i} isMobile={isMobile} />)}
                </div>
              </motion.div>
            ) : (
              <motion.div key="segments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: "flex", flexDirection: "column", gap: 40 }}>

                {urgentClasses.length > 0 && (
                  <section>
                    <SectionTitle title="Filling Up Fast" subtitle="Few spots remaining — book soon" />
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(280px, 1fr))", gap: isMobile ? 10 : 16 }}>
                      {urgentClasses.slice(0, 4).map((c, i) => <ClassCard key={c.id} cls={c} index={i} isMobile={isMobile} />)}
                    </div>
                  </section>
                )}

                {topRated.length > 0 && (
                  <section>
                    <SectionTitle title="Top Rated" subtitle="Highly reviewed by enrolled students" />
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(280px, 1fr))", gap: isMobile ? 10 : 16 }}>
                      {topRated.slice(0, 8).map((c, i) => <ClassCard key={c.id} cls={c} index={i} isMobile={isMobile} />)}
                    </div>
                  </section>
                )}

                {allOthers.length > 0 && (
                  <section>
                    <SectionTitle title="All Classes" subtitle={`${allOthers.length} classes available`} />
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(280px, 1fr))", gap: isMobile ? 10 : 16 }}>
                      {allOthers.map((c, i) => <ClassCard key={c.id} cls={c} index={i} isMobile={isMobile} />)}
                    </div>
                  </section>
                )}

                {filtered.length === 0 && (
                  <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "3rem 0", fontSize: 15 }}>
                    No classes available yet. Check back soon.
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
