"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import TutorCard, { TutorCardData } from "./TutorCard";
import BackgroundFloaters from "../../components/ui/BackgroundFloaters";
import SectionHeader from "../../components/ui/SectionHeader";
import SkeletonCard from "../../components/ui/SkeletonCard";

// ─── CONSTANTS ─────────────────────────────────────────────────────────────────

const ALL_SUBJECTS = [
  "Math", "Physics", "Chemistry", "Biology", "English",
  "Arabic", "History", "Geography", "French", "Computer Science",
  "Science", "Economics", "Accounting", "Business",
];

const CITIES = ["All Cities", "Cairo", "Alexandria", "Giza", "Online"];

// ─── FILTER SIDEBAR ────────────────────────────────────────────────────────────

function FilterSidebar({
  selectedSubjects, setSelectedSubjects,
  selectedCity, setSelectedCity,
  minRating, setMinRating,
  onClear,
}: {
  selectedSubjects: string[];
  setSelectedSubjects: (s: string[]) => void;
  selectedCity: string;
  setSelectedCity: (c: string) => void;
  minRating: number;
  setMinRating: (r: number) => void;
  onClear: () => void;
}) {
  function toggleSubject(s: string) {
    setSelectedSubjects(
      selectedSubjects.includes(s)
        ? selectedSubjects.filter((x) => x !== s)
        : [...selectedSubjects, s]
    );
  }

  const hasFilters = selectedSubjects.length > 0 || selectedCity !== "All Cities" || minRating > 0;

  return (
    <div
      style={{
        width: 260,
        flexShrink: 0,
        position: "sticky",
        top: 24,
        alignSelf: "flex-start",
        backgroundColor: "#1e293b",
        border: "1px solid #334155",
        borderRadius: 20,
        padding: "24px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9" }}>Filters</span>
        {hasFilters && (
          <button
            onClick={onClear}
            style={{
              background: "none",
              border: "none",
              color: "#3b82f6",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
            }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* City */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
          City
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {CITIES.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              style={{
                background: selectedCity === city ? "#3b82f615" : "none",
                border: selectedCity === city ? "1px solid #3b82f640" : "1px solid transparent",
                borderRadius: 8,
                padding: "7px 12px",
                textAlign: "left",
                color: selectedCity === city ? "#3b82f6" : "#94a3b8",
                fontWeight: selectedCity === city ? 600 : 400,
                fontSize: 14,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Subjects */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
          Subjects
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {ALL_SUBJECTS.map((s) => {
            const active = selectedSubjects.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleSubject(s)}
                style={{
                  padding: "4px 11px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: `1px solid ${active ? "#3b82f6" : "#334155"}`,
                  backgroundColor: active ? "#3b82f620" : "transparent",
                  color: active ? "#3b82f6" : "#64748b",
                  transition: "all 0.15s",
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Min Rating */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
          Minimum Rating
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[0, 3, 4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() => setMinRating(r)}
              style={{
                flex: 1,
                padding: "6px 4px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                border: `1px solid ${minRating === r ? "#f59e0b" : "#334155"}`,
                backgroundColor: minRating === r ? "#f59e0b15" : "transparent",
                color: minRating === r ? "#f59e0b" : "#64748b",
                transition: "all 0.15s",
              }}
            >
              {r === 0 ? "Any" : `${r}★`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SUBJECT PILLS (quick filter strip) ────────────────────────────────────────

function SubjectPills({
  selected, onToggle,
}: {
  selected: string[];
  onToggle: (s: string) => void;
}) {
  const COLORS: Record<string, string> = {
    Math: "#3b82f6", Physics: "#8b5cf6", Chemistry: "#22c55e",
    Biology: "#10b981", English: "#f59e0b", Arabic: "#ef4444",
    History: "#f97316", Geography: "#06b6d4", French: "#a78bfa",
    "Computer Science": "#38bdf8", Science: "#34d399",
    Economics: "#fbbf24", Accounting: "#fb923c", Business: "#e879f9",
  };

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {ALL_SUBJECTS.map((s) => {
        const active = selected.includes(s);
        const color = COLORS[s] ?? "#3b82f6";
        return (
          <motion.button
            key={s}
            whileTap={{ scale: 0.94 }}
            onClick={() => onToggle(s)}
            style={{
              padding: "6px 16px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              border: `1px solid ${active ? color : "#334155"}`,
              backgroundColor: active ? `${color}22` : "#1e293b",
              color: active ? color : "#64748b",
              transition: "all 0.15s",
              boxShadow: active ? `0 0 10px ${color}30` : "none",
            }}
          >
            {s}
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── MAIN CLIENT COMPONENT ─────────────────────────────────────────────────────

export default function TutorsClient({ tutors }: { tutors: TutorCardData[] }) {
  // Filter state
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [minRating, setMinRating] = useState(0);
  const [search, setSearch] = useState("");

  function toggleSubject(s: string) {
    setSelectedSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  function clearFilters() {
    setSelectedSubjects([]);
    setSelectedCity("All Cities");
    setMinRating(0);
    setSearch("");
  }

  // Apply filters
  const filtered = useMemo(() => {
    return tutors.filter((t) => {
      // Search
      if (search) {
        const q = search.toLowerCase();
        const nameMatch = (t.fullName ?? t.name ?? "").toLowerCase().includes(q);
        const subjectMatch = t.subjects.some((s) => s.toLowerCase().includes(q));
        const bioMatch = (t.bio ?? "").toLowerCase().includes(q);
        if (!nameMatch && !subjectMatch && !bioMatch) return false;
      }
      // Subject filter
      if (selectedSubjects.length > 0) {
        const hasSubject = selectedSubjects.some((s) => t.subjects.includes(s));
        if (!hasSubject) return false;
      }
      // City filter
      if (selectedCity !== "All Cities" && t.city !== selectedCity) return false;
      // Rating filter
      if (minRating > 0 && (t.avgRating === null || t.avgRating < minRating)) return false;
      return true;
    });
  }, [tutors, search, selectedSubjects, selectedCity, minRating]);

  // Segment into groups
  const featured = filtered.filter((t) => t.avgRating !== null && t.avgRating >= 4.5).slice(0, 4);
  const topRated = filtered.filter((t) => t.avgRating !== null && t.avgRating >= 4 && t.avgRating < 4.5).slice(0, 8);
  const newTutors = filtered.filter((t) => t.avgRating === null).slice(0, 8);
  // "All results" when filters active — show flat list instead of segments
  const isFiltering = selectedSubjects.length > 0 || selectedCity !== "All Cities" || minRating > 0 || search;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#f1f5f9",
        position: "relative",
      }}
    >
      {/* Ambient background orbs */}
      <BackgroundFloaters count={4} />

      {/* ── HERO BANNER ── */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
          borderBottom: "1px solid #334155",
          padding: "56px 24px 48px",
          zIndex: 1,
        }}
      >
        {/* Grid texture */}
        <div
          style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: `linear-gradient(#ffffff06 1px, transparent 1px), linear-gradient(90deg, #ffffff06 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow orb */}
        <div
          style={{
            position: "absolute", top: -100, right: -100,
            width: 400, height: 400, borderRadius: "50%",
            background: "radial-gradient(circle, #3b82f625 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
          <Link href="/" style={{ color: "#64748b", fontSize: 13, textDecoration: "none" }}>
            ← Home
          </Link>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 900,
              margin: "20px 0 12px",
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
            }}
          >
            Find Your Perfect{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #3b82f6, #38bdf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Tutor
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{ color: "#94a3b8", fontSize: 17, marginBottom: 28, maxWidth: 480 }}
          >
            {tutors.length} verified tutors across Egypt. Filter by subject, city, and rating.
          </motion.p>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ position: "relative", maxWidth: 520 }}
          >
            <span
              style={{
                position: "absolute", left: 16, top: "50%",
                transform: "translateY(-50%)", fontSize: 18, pointerEvents: "none",
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by name, subject, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 14,
                padding: "14px 16px 14px 48px",
                color: "#f1f5f9",
                fontSize: 15,
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "inherit",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.target.style.borderColor = "#334155")}
            />
          </motion.div>

          {/* Quick subject pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            style={{ marginTop: 20 }}
          >
            <SubjectPills selected={selectedSubjects} onToggle={toggleSubject} />
          </motion.div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "40px 24px 80px",
          position: "relative",
          zIndex: 1,
          display: "flex",
          gap: 32,
          alignItems: "flex-start",
        }}
      >
        {/* Sidebar */}
        <FilterSidebar
          selectedSubjects={selectedSubjects}
          setSelectedSubjects={setSelectedSubjects}
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          minRating={minRating}
          setMinRating={setMinRating}
          onClear={clearFilters}
        />

        {/* Cards area */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Result count */}
          <div style={{ marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: "#64748b", fontSize: 14 }}>
              Showing{" "}
              <span style={{ color: "#f1f5f9", fontWeight: 700 }}>{filtered.length}</span>
              {" "}tutor{filtered.length !== 1 ? "s" : ""}
              {isFiltering && " matching your filters"}
            </span>
            {isFiltering && (
              <button
                onClick={clearFilters}
                style={{
                  background: "none", border: "1px solid #334155",
                  color: "#94a3b8", borderRadius: 8,
                  padding: "6px 14px", fontSize: 13,
                  fontWeight: 600, cursor: "pointer",
                }}
              >
                ✕ Clear filters
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              // Empty state
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: 20,
                  padding: "64px 32px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔍</div>
                <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
                  No tutors found
                </div>
                <div style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>
                  Try adjusting your filters or search term
                </div>
                <button
                  onClick={clearFilters}
                  style={{
                    backgroundColor: "#3b82f6", color: "#fff",
                    border: "none", borderRadius: 10,
                    padding: "10px 24px", fontSize: 14,
                    fontWeight: 700, cursor: "pointer",
                  }}
                >
                  Clear all filters
                </button>
              </motion.div>
            ) : isFiltering ? (
              // Flat results when filtering
              <motion.div
                key="filtered"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: 20,
                  }}
                >
                  {filtered.map((t, i) => (
                    <TutorCard key={t.id} tutor={t} index={i} />
                  ))}
                </div>
              </motion.div>
            ) : (
              // Segmented view — default
              <motion.div
                key="segments"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: "flex", flexDirection: "column", gap: 48 }}
              >
                {/* ⭐ Top Rated */}
                {featured.length > 0 && (
                  <section>
                    <SectionHeader
                      title="Top Rated Tutors"
                      subtitle="Consistently rated 4.5★ or higher by their students"
                      badge="⭐ Highest Rated"
                      badgeColor="#f59e0b"
                    />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                      {featured.map((t, i) => <TutorCard key={t.id} tutor={t} index={i} />)}
                    </div>
                  </section>
                )}

                {/* 📈 Good Rating */}
                {topRated.length > 0 && (
                  <section>
                    <SectionHeader
                      title="Highly Rated"
                      subtitle="Tutors with strong ratings and proven track records"
                      badge="📈 Recommended"
                      badgeColor="#3b82f6"
                    />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                      {topRated.map((t, i) => <TutorCard key={t.id} tutor={t} index={i} />)}
                    </div>
                  </section>
                )}

                {/* 🌱 New Tutors */}
                {newTutors.length > 0 && (
                  <section>
                    <SectionHeader
                      title="New on Coursaty"
                      subtitle="Fresh tutors — be among their first students"
                      badge="🌱 New"
                      badgeColor="#22c55e"
                    />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                      {newTutors.map((t, i) => <TutorCard key={t.id} tutor={t} index={i} />)}
                    </div>
                  </section>
                )}

                {/* If no segments have content */}
                {featured.length === 0 && topRated.length === 0 && newTutors.length === 0 && (
                  <div style={{ textAlign: "center", color: "#64748b", padding: "48px 0", fontSize: 15 }}>
                    No tutors available yet. Check back soon!
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