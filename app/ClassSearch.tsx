"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, User, Building2, MapPin } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────
type Tutor = { id: string; fullName: string | null };
type ClassTutor = { tutor: Tutor };
type Center = { id: string; name: string };
type Owner = { id: string; fullName: string | null; name?: string | null };

type ClassResult = {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  location: string | null;
  city: string;
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

// ── Constants ─────────────────────────────────────────────────────────────
const SUBJECTS = ["Math","Physics","Chemistry","Biology","English","Arabic","History","Geography","CS"];
const CURRICULA = ["NATIONAL","IGCSE","AMERICAN","IB","FRENCH","STEM","OTHER"];
const GRADES = ["Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12","Thanaweya Amma","IGCSE","AS Level","A Level","ACT","SAT"];
const FORMATS = ["IN_PERSON","ONLINE","HYBRID"];
const SORT_OPTIONS = [
  { value: "newest",     label: "Newest first" },
  { value: "price_asc",  label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "popular",    label: "Most popular" },
];

const SUBJECT_META: Record<string, { bg: string; text: string; glow: string; emoji: string }> = {
  Math:      { bg: "var(--accent-bg)",          text: "var(--accent)",   glow: "var(--accent)",   emoji: "📐" },
  Physics:   { bg: "rgba(93,58,95,0.10)",        text: "#5d3a5f",         glow: "#5d3a5f",         emoji: "⚡" },
  Chemistry: { bg: "var(--success-bg)",          text: "var(--success)",  glow: "var(--success)",  emoji: "🧪" },
  Biology:   { bg: "var(--success-bg)",          text: "var(--success)",  glow: "var(--success)",  emoji: "🧬" },
  English:   { bg: "var(--warning-bg)",          text: "#8a5e1a",         glow: "#8a5e1a",         emoji: "📝" },
  Arabic:    { bg: "var(--error-bg)",            text: "var(--error)",    glow: "var(--error)",    emoji: "✍️" },
  History:   { bg: "var(--warning-bg)",          text: "#8a5e1a",         glow: "#78716c",         emoji: "📜" },
  Geography: { bg: "rgba(28,110,122,0.10)",      text: "#1c6e7a",         glow: "var(--accent)",   emoji: "🌍" },
  CS:        { bg: "rgba(28,110,122,0.10)",      text: "#1c6e7a",         glow: "var(--accent)",   emoji: "💻" },
  default:   { bg: "var(--bg-alt)",              text: "var(--text-secondary)", glow: "var(--text-muted)", emoji: "📚" },
};

const FORMAT_META: Record<string, { label: string; color: string; bg: string }> = {
  IN_PERSON: { label: "In-Person", color: "var(--success)", bg: "var(--success-bg)" },
  ONLINE:    { label: "Online",    color: "#1c6e7a",         bg: "rgba(28,110,122,0.10)" },
  HYBRID:    { label: "Hybrid",    color: "#5d3a5f",         bg: "rgba(93,58,95,0.10)" },
};

const CURRICULUM_LABEL: Record<string, string> = {
  NATIONAL: "National", IGCSE: "IGCSE", AMERICAN: "American",
  IB: "IB", FRENCH: "French", STEM: "STEM", OTHER: "Other",
};

const TRENDING_TAGS = ["Math", "Physics", "IGCSE", "Grade 11", "Online", "Chemistry", "Thanaweya Amma"];

// ── Skeleton Card ─────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 20, padding: "1.5rem", overflow: "hidden" }}>
      {[["60%","1rem"],["90%","1.2rem"],["40%","0.9rem"],["75%","0.9rem"],["50%","0.9rem"]].map(([w, h], i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
          style={{ width: w, height: h, backgroundColor: "var(--text-secondary)", borderRadius: 8, marginBottom: "0.75rem" }}
        />
      ))}
    </div>
  );
}

// ── Spots Progress Bar ────────────────────────────────────────────────────
function SpotsBar({ capacity, booked }: { capacity: number; booked: number }) {
  const pct = Math.min((booked / capacity) * 100, 100);
  const left = capacity - booked;
  const color = pct > 80 ? "var(--error)" : pct > 50 ? "var(--rating)" : "var(--success)";
  return (
    <div style={{ marginTop: "0.75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{booked} booked</span>
        <span style={{ fontSize: 11, color: left <= 5 ? "var(--error)" : "var(--text-muted)", fontWeight: left <= 5 ? 700 : 400 }}>
          {left <= 0 ? "FULL" : left <= 5 ? `⚡ Only ${left} left!` : `${left} spots left`}
        </span>
      </div>
      <div style={{ height: 4, backgroundColor: "var(--text-secondary)", borderRadius: 99, overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: pct + "%" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ height: "100%", backgroundColor: color, borderRadius: 99 }}
        />
      </div>
    </div>
  );
}

// ── Heart / Save Button ───────────────────────────────────────────────────
function HeartButton({ id }: { id: string }) {
  const [saved, setSaved] = useState(false);
  return (
    <motion.button
      whileTap={{ scale: 1.4 }}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSaved(s => !s); }}
      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0, color: saved ? "var(--error)" : "var(--text-secondary)", transition: "color 0.2s" }}
      title={saved ? "Saved" : "Save class"}
    >
      <Heart size={16} strokeWidth={2} fill={saved ? "currentColor" : "none"} />
    </motion.button>
  );
}

// ── Class Card ────────────────────────────────────────────────────────────
function ClassCard({ cls, index }: { cls: ClassResult; index: number }) {
  const [hovered, setHovered] = useState(false);
  const meta = SUBJECT_META[cls.subject] ?? SUBJECT_META.default;
  const fmt = FORMAT_META[cls.format] ?? { label: cls.format, color: "var(--text-muted)", bg: "var(--bg-alt)" };
  const spotsLeft = cls.capacity ? cls.capacity - cls._count.bookings : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;
  const isUrgent = spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 5;
  const displayName = cls.center ? cls.center.name : (cls.owner?.fullName ?? cls.owner?.name ?? "Unknown");
  const isCenter = !!cls.center;
  const initial = (displayName || "?")[0].toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      layout
    >
      <Link href={"/classes/" + cls.id} style={{ textDecoration: "none", display: "block" }}>
        <motion.div
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          whileHover={{ y: -6, boxShadow: `0 20px 60px ${meta.glow}20` }}
          style={{
            backgroundColor: "var(--bg-card)",
            border: `1px solid ${hovered ? meta.glow + "50" : "var(--border-light)"}`,
            borderRadius: 20,
            padding: "1.5rem",
            height: "100%",
            boxSizing: "border-box",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
            transition: "border-color 0.25s",
          }}
        >
          {/* Glow top corner */}
          <motion.div
            animate={{ opacity: hovered ? 1 : 0 }}
            style={{ position: "absolute", top: 0, left: 0, width: 160, height: 160, background: `radial-gradient(circle, ${meta.glow}12 0%, transparent 70%)`, pointerEvents: "none" }}
          />

          {/* Urgency banner */}
          {isUrgent && (
            <motion.div
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, var(--error), var(--rating))", borderRadius: "20px 20px 0 0" }}
            />
          )}

          {/* Header row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
            <span style={{ backgroundColor: meta.bg, color: meta.text, fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span>{meta.emoji}</span> {cls.subject}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ backgroundColor: fmt.bg, color: fmt.color, fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20, border: `1px solid ${fmt.color}30` }}>
                {fmt.label}
              </span>
              <HeartButton id={cls.id} />
            </div>
          </div>

          {/* Title */}
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.5rem", lineHeight: 1.4 }}>
            {cls.title}
          </h2>

          {/* Tags */}
          <div style={{ display: "flex", gap: 6, marginBottom: "0.75rem", flexWrap: "wrap" }}>
            <span style={{ backgroundColor: "var(--bg-card)", color: "var(--text-muted)", fontSize: 11, padding: "2px 8px", borderRadius: 20, border: "1px solid var(--border-light)" }}>
              {CURRICULUM_LABEL[cls.curriculum] ?? cls.curriculum}
            </span>
            {cls.gradeLevel && (
              <span style={{ backgroundColor: "var(--bg-card)", color: "var(--text-muted)", fontSize: 11, padding: "2px 8px", borderRadius: 20, border: "1px solid var(--border-light)" }}>
                {cls.gradeLevel}
              </span>
            )}
            {isFull && (
              <span style={{ backgroundColor: "var(--error-bg)", color: "var(--error)", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, border: "1px solid var(--error-border)" }}>
                FULL
              </span>
            )}
          </div>

          {/* Description */}
          {cls.description && (
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: "1rem", lineHeight: 1.6 }}>
              {cls.description.length > 85 ? cls.description.slice(0, 85) + "…" : cls.description}
            </p>
          )}

          {/* Info rows */}
          <div style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 4, marginBottom: "0.5rem" }}>
            {(cls.location || cls.city) && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <MapPin size={13} strokeWidth={2} color="var(--text-muted)" />
                <span style={{ color: "var(--text-muted)" }}>{cls.location ?? cls.city}</span>
              </div>
            )}
            {cls.schedule && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span>🕐</span>
                <span style={{ color: "var(--text-muted)" }}>{cls.schedule}</span>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {isCenter ? <Building2 size={13} strokeWidth={2} color="var(--text-muted)" /> : <User size={13} strokeWidth={2} color="var(--text-muted)" />}
              <span style={{ color: "var(--text-muted)" }}>{displayName}</span>
              {isCenter && (
                <span style={{ backgroundColor: "rgba(13,89,70,0.13)", color: "var(--accent)", fontSize: 10, padding: "1px 6px", borderRadius: 10, border: "1px solid rgba(13,89,70,0.25)", fontWeight: 600 }}>
                  CENTER
                </span>
              )}
            </div>
          </div>

          {/* Spots bar */}
          {cls.capacity && cls.capacity > 0 && (
            <SpotsBar capacity={cls.capacity} booked={cls._count.bookings} />
          )}

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid var(--border-light)" }}>
            <div>
              <div style={{ fontSize: "1.3rem", fontWeight: 900, color: cls.priceEgp === 0 ? "var(--success)" : "#1c6e7a" }}>
                {cls.priceEgp === 0 ? "Free" : cls.priceEgp.toLocaleString() + " EGP"}
              </div>
              {cls.priceEgp > 0 && (
                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>per month</div>
              )}
            </div>
            <motion.div
              animate={{ x: hovered ? 4 : 0 }}
              style={{ backgroundColor: isFull ? "var(--bg-alt)" : "rgba(13,89,70,0.13)", color: isFull ? "var(--text-muted)" : "var(--accent)", border: `1px solid ${isFull ? "var(--border)" : "rgba(13,89,70,0.25)"}`, borderRadius: 10, padding: "6px 14px", fontSize: 13, fontWeight: 600 }}
            >
              {isFull ? "Full" : "View →"}
            </motion.div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// ── Filter Chip ───────────────────────────────────────────────────────────
function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        backgroundColor: active ? "var(--accent)" : "var(--bg-alt)",
        color: active ? "var(--accent-fg)" : "var(--text-secondary)",
        border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
        borderRadius: 20,
        padding: "6px 14px",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition: "all 0.2s",
      }}
    >
      {label}
    </motion.button>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
export default function ClassSearch({ initialClasses }: { initialClasses: ClassResult[] }) {
  const [classes, setClasses]         = useState<ClassResult[]>(initialClasses);
  const [loading, setLoading]         = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search,      setSearch]      = useState("");
  const [subject,     setSubject]     = useState("");
  const [curriculum,  setCurriculum]  = useState("");
  const [gradeLevel,  setGradeLevel]  = useState("");
  const [format,      setFormat]      = useState("");
  const [minPrice,    setMinPrice]    = useState("");
  const [maxPrice,    setMaxPrice]    = useState("");
  const [location,    setLocation]    = useState("");
  const [sortBy,      setSortBy]      = useState("newest");
  const searchRef = useRef<HTMLInputElement>(null);

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
    if (location)   params.set("location",   location);
    params.set("sortBy", sortBy);
    const res  = await fetch("/api/classes/search?" + params.toString());
    const data = await res.json();
    setClasses(data.classes ?? []);
    setLoading(false);
  }, [search, subject, curriculum, gradeLevel, format, minPrice, maxPrice, location, sortBy]);

  useEffect(() => {
    const t = setTimeout(fetchClasses, 300);
    return () => clearTimeout(t);
  }, [fetchClasses]);

  function clearAll() {
    setSearch(""); setSubject(""); setCurriculum("");
    setGradeLevel(""); setFormat(""); setMinPrice("");
    setMaxPrice(""); setLocation(""); setSortBy("newest");
  }

  const hasFilters = !!(search || subject || curriculum || gradeLevel || format || minPrice || maxPrice || location);
  const activeFilterCount = [search, subject, curriculum, gradeLevel, format, minPrice || maxPrice, location].filter(Boolean).length;

  const selectStyle: React.CSSProperties = {
    backgroundColor: "var(--bg-card)",
    color: "var(--text-secondary)",
    border: "1px solid var(--border-light)",
    borderRadius: 10,
    padding: "0.55rem 0.75rem",
    fontSize: 13,
    cursor: "pointer",
    outline: "none",
    width: "100%",
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>

      {/* ── Hero search bar ── */}
      <div style={{ maxWidth: 760, margin: "0 auto 1.5rem", padding: "0 1.5rem" }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <Search size={18} strokeWidth={2} color="var(--text-muted)" style={{ position: "absolute", left: 16, pointerEvents: "none" }} />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search by class name, tutor, subject…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%",
              backgroundColor: "var(--bg-card)",
              color: "var(--text)",
              border: "1px solid var(--border-light)",
              borderRadius: 14,
              padding: "1rem 1rem 1rem 3rem",
              fontSize: 16,
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.2s",
            }}
            onFocus={e => e.currentTarget.style.borderColor = "var(--accent)"}
            onBlur={e => e.currentTarget.style.borderColor = "var(--border-light)"}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{ position: "absolute", right: 14, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 18 }}
            >×</button>
          )}
        </div>
      </div>

      {/* ── Trending tags ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto 1.5rem", padding: "0 1.5rem", overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>🔥 Trending:</span>
          {TRENDING_TAGS.map(tag => (
            <FilterChip
              key={tag}
              label={tag}
              active={subject === tag || gradeLevel === tag || format === (tag === "Online" ? "ONLINE" : "")}
              onClick={() => {
                if (SUBJECTS.includes(tag)) setSubject(s => s === tag ? "" : tag);
                else if (GRADES.includes(tag)) setGradeLevel(g => g === tag ? "" : tag);
                else if (tag === "Online") setFormat(f => f === "ONLINE" ? "" : "ONLINE");
                else if (tag === "IGCSE") setCurriculum(c => c === "IGCSE" ? "" : "IGCSE");
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Controls row ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto 1rem", padding: "0 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setFiltersOpen(o => !o)}
            style={{
              backgroundColor: filtersOpen ? "var(--accent)" : "var(--bg-alt)",
              color: filtersOpen ? "var(--accent-fg)" : "var(--text-secondary)",
              border: `1px solid ${filtersOpen ? "var(--accent)" : "var(--border)"}`,
              borderRadius: 10,
              padding: "0.6rem 1.2rem",
              fontSize: 14,
              cursor: "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>⚙️</span>
            Filters
            {activeFilterCount > 0 && (
              <span style={{ backgroundColor: filtersOpen ? "var(--bg-card)" : "var(--accent)", color: filtersOpen ? "var(--accent)" : "var(--bg-card)", borderRadius: 99, fontSize: 11, padding: "1px 7px", fontWeight: 700 }}>
                {activeFilterCount}
              </span>
            )}
          </motion.button>

          {hasFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.03 }}
              onClick={clearAll}
              style={{ background: "none", border: "1px solid var(--error)", color: "var(--error)", borderRadius: 10, padding: "0.6rem 1rem", fontSize: 13, cursor: "pointer", fontWeight: 600 }}
            >
              ✕ Clear all
            </motion.button>
          )}

          <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
            {loading ? (
              <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                Searching…
              </motion.span>
            ) : (
              <><span style={{ color: "var(--text)", fontWeight: 700 }}>{classes.length}</span> {classes.length === 1 ? "class" : "classes"} found</>
            )}
          </span>
        </div>

        {/* Sort */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Sort:</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...selectStyle, width: "auto", minWidth: 160 }}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* ── Filters panel ── */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden", maxWidth: 1100, margin: "0 auto 1.5rem", padding: "0 1.5rem" }}
          >
            <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 16, padding: "1.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1.25rem" }}>

                {/* Subject */}
                <div>
                  <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Subject</label>
                  <select value={subject} onChange={e => setSubject(e.target.value)} style={selectStyle}>
                    <option value="">All subjects</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Curriculum */}
                <div>
                  <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Curriculum</label>
                  <select value={curriculum} onChange={e => setCurriculum(e.target.value)} style={selectStyle}>
                    <option value="">All curricula</option>
                    {CURRICULA.map(c => <option key={c} value={c}>{CURRICULUM_LABEL[c]}</option>)}
                  </select>
                </div>

                {/* Grade */}
                <div>
                  <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Grade / Level</label>
                  <select value={gradeLevel} onChange={e => setGradeLevel(e.target.value)} style={selectStyle}>
                    <option value="">All grades</option>
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                {/* Format */}
                <div>
                  <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Format</label>
                  <select value={format} onChange={e => setFormat(e.target.value)} style={selectStyle}>
                    <option value="">Any format</option>
                    {FORMATS.map(f => <option key={f} value={f}>{FORMAT_META[f]?.label ?? f}</option>)}
                  </select>
                </div>

                {/* Min Price */}
                <div>
                  <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Min Price (EGP)</label>
                  <input type="number" placeholder="0" value={minPrice} onChange={e => setMinPrice(e.target.value)} style={selectStyle} />
                </div>

                {/* Max Price */}
                <div>
                  <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Max Price (EGP)</label>
                  <input type="number" placeholder="Any" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} style={selectStyle} />
                </div>

                {/* Location */}
                <div>
                  <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Location</label>
                  <input type="text" placeholder="e.g. Nasr City" value={location} onChange={e => setLocation(e.target.value)} style={selectStyle} />
                </div>

              </div>

              {/* Active filter chips */}
              {hasFilters && (
                <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border-light)", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: 12 }}>Active:</span>
                  {subject && <ActiveChip label={`Subject: ${subject}`} onRemove={() => setSubject("")} />}
                  {curriculum && <ActiveChip label={`Curriculum: ${CURRICULUM_LABEL[curriculum]}`} onRemove={() => setCurriculum("")} />}
                  {gradeLevel && <ActiveChip label={`Grade: ${gradeLevel}`} onRemove={() => setGradeLevel("")} />}
                  {format && <ActiveChip label={`Format: ${FORMAT_META[format]?.label}`} onRemove={() => setFormat("")} />}
                  {(minPrice || maxPrice) && <ActiveChip label={`Price: ${minPrice || "0"}–${maxPrice || "∞"} EGP`} onRemove={() => { setMinPrice(""); setMaxPrice(""); }} />}
                  {location && <ActiveChip label={`📍 ${location}`} onRemove={() => setLocation("")} />}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Grid ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem 5rem" }}>
        {/* Loading skeletons */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && classes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: "center", padding: "5rem 2rem" }}
          >
            <div style={{ marginBottom: "1rem", opacity: 0.4 }}><Search size={48} strokeWidth={1.5} color="var(--text-muted)" /></div>
            <h3 style={{ color: "var(--text)", fontWeight: 700, fontSize: 20, marginBottom: 8 }}>No classes found</h3>
            <p style={{ color: "var(--text-muted)", fontSize: 15, marginBottom: "1.5rem" }}>
              Try adjusting your filters or search term.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={clearAll}
              style={{ backgroundColor: "var(--accent)", color: "var(--bg-card)", border: "none", borderRadius: 12, padding: "0.8rem 2rem", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
            >
              Clear all filters
            </motion.button>
          </motion.div>
        )}

        {/* Results */}
        {!loading && classes.length > 0 && (
          <motion.div
            layout
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}
          >
            <AnimatePresence mode="popLayout">
              {classes.map((cls, i) => (
                <ClassCard key={cls.id} cls={cls} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ── Active Filter Chip ────────────────────────────────────────────────────
function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: "var(--bg-card)", border: "1px solid rgba(13,89,70,0.25)", borderRadius: 20, padding: "3px 10px 3px 12px", fontSize: 12, color: "var(--accent-border)" }}
    >
      {label}
      <button onClick={onRemove} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
    </motion.div>
  );
}