"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import TutorCard, { TutorCardData } from "./TutorCard";

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
        width: 240,
        flexShrink: 0,
        position: "sticky",
        top: 80,
        alignSelf: "flex-start",
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        borderRadius: 14,
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Filters</span>
        {hasFilters && (
          <button
            onClick={onClear}
            style={{
              background: "var(--accent-bg)",
              border: "1px solid var(--accent-border)",
              color: "var(--accent)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              borderRadius: 999,
              padding: "3px 10px",
            }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* City */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
          City
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {CITIES.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              style={{
                background: selectedCity === city ? "var(--accent-bg)" : "none",
                border: selectedCity === city ? "1px solid var(--accent-border)" : "1px solid transparent",
                borderRadius: 8,
                padding: "7px 10px",
                textAlign: "left",
                color: selectedCity === city ? "var(--accent)" : "var(--text-secondary)",
                fontWeight: selectedCity === city ? 600 : 400,
                fontSize: 13,
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
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
          Subjects
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {ALL_SUBJECTS.map((s) => {
            const active = selectedSubjects.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleSubject(s)}
                style={{
                  padding: "3px 10px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  border: `1px solid ${active ? "var(--accent-border)" : "var(--border-light)"}`,
                  backgroundColor: active ? "var(--accent-bg)" : "var(--bg-card)",
                  color: active ? "var(--accent)" : "var(--text-secondary)",
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
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
          Minimum Rating
        </div>
        <div style={{ display: "flex", gap: 5 }}>
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
                border: `1px solid ${minRating === r ? "var(--warning-bg)" : "var(--border-light)"}`,
                backgroundColor: minRating === r ? "var(--warning-bg)" : "var(--bg-card)",
                color: minRating === r ? "var(--warning)" : "var(--text-secondary)",
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

// ─── SECTION TITLE ─────────────────────────────────────────────────────────────

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: 0, marginBottom: subtitle ? 4 : 0 }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: 0 }}>{subtitle}</p>
      )}
    </div>
  );
}

// ─── MAIN CLIENT COMPONENT ─────────────────────────────────────────────────────

export default function TutorsClient({ tutors }: { tutors: TutorCardData[] }) {
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

  const filtered = useMemo(() => {
    return tutors.filter((t) => {
      if (search) {
        const q = search.toLowerCase();
        const nameMatch = (t.fullName ?? t.name ?? "").toLowerCase().includes(q);
        const subjectMatch = t.subjects.some((s) => s.toLowerCase().includes(q));
        const bioMatch = (t.bio ?? "").toLowerCase().includes(q);
        if (!nameMatch && !subjectMatch && !bioMatch) return false;
      }
      if (selectedSubjects.length > 0) {
        if (!selectedSubjects.some((s) => t.subjects.includes(s))) return false;
      }
      if (selectedCity !== "All Cities" && t.city !== selectedCity) return false;
      if (minRating > 0 && (t.avgRating === null || t.avgRating < minRating)) return false;
      return true;
    });
  }, [tutors, search, selectedSubjects, selectedCity, minRating]);

  const featured = filtered.filter((t) => t.avgRating !== null && t.avgRating >= 4.5).slice(0, 4);
  const topRated = filtered.filter((t) => t.avgRating !== null && t.avgRating >= 4 && t.avgRating < 4.5).slice(0, 8);
  const newTutors = filtered.filter((t) => t.avgRating === null).slice(0, 8);
  const isFiltering = selectedSubjects.length > 0 || selectedCity !== "All Cities" || minRating > 0 || search;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-alt)", color: "var(--text)" }}>

      {/* Page header */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          borderBottom: "1px solid var(--border-light)",
          padding: "32px 24px 28px",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, color: "var(--text-muted)", fontSize: 13 }}>
            <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Home</Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span style={{ color: "var(--text)" }}>Tutors</span>
          </div>

          <h1 style={{ fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 800, color: "var(--text)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            Find Your Perfect Tutor
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, margin: "0 0 24px" }}>
            {tutors.length} verified tutors across Egypt — filter by subject, city, and rating.
          </p>

          {/* Search bar */}
          <div style={{ position: "relative", maxWidth: 520 }}>
            <div
              style={{
                position: "absolute", left: 14, top: "50%",
                transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name, subject, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                backgroundColor: "var(--bg-alt)",
                border: "1px solid var(--border-light)",
                borderRadius: 10,
                padding: "11px 14px 11px 42px",
                color: "var(--text)",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "inherit",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--accent)";
                e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border-light)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Quick subject pills */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 16 }}>
            {ALL_SUBJECTS.map((s) => {
              const active = selectedSubjects.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSubject(s)}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    border: `1px solid ${active ? "var(--accent-border)" : "var(--border-light)"}`,
                    backgroundColor: active ? "var(--accent-bg)" : "var(--bg-card)",
                    color: active ? "var(--accent)" : "var(--text-secondary)",
                    transition: "all 0.15s",
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "32px 24px 80px",
          display: "flex",
          gap: 28,
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

          {/* Result count + clear */}
          <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>
              <span style={{ color: "var(--text)", fontWeight: 700 }}>{filtered.length}</span>
              {" "}tutor{filtered.length !== 1 ? "s" : ""}
              {isFiltering ? " match your filters" : " available"}
            </span>
            {isFiltering && (
              <button
                onClick={clearFilters}
                style={{
                  background: "var(--accent-bg)",
                  border: "1px solid var(--accent-border)",
                  color: "var(--accent)",
                  borderRadius: 999,
                  padding: "5px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                ✕ Clear filters
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-light)",
                  borderRadius: 14,
                  padding: "64px 32px",
                  textAlign: "center",
                }}
              >
                <div style={{ marginBottom: 16, color: "var(--border)" }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto", display: "block" }}>
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <div style={{ color: "var(--text)", fontWeight: 700, fontSize: 17, marginBottom: 8 }}>
                  No tutors found
                </div>
                <div style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>
                  Try adjusting your filters or clearing your search.
                </div>
                <button
                  onClick={clearFilters}
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "var(--bg-card)",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 24px",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Clear all filters
                </button>
              </motion.div>
            ) : isFiltering ? (
              <motion.div
                key="filtered"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 18 }}>
                  {filtered.map((t, i) => (
                    <TutorCard key={t.id} tutor={t} index={i} />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="segments"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: "flex", flexDirection: "column", gap: 40 }}
              >
                {featured.length > 0 && (
                  <section>
                    <SectionTitle
                      title="Top Rated Tutors"
                      subtitle="Consistently rated 4.5★ or higher by their students"
                    />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 18 }}>
                      {featured.map((t, i) => <TutorCard key={t.id} tutor={t} index={i} />)}
                    </div>
                  </section>
                )}

                {topRated.length > 0 && (
                  <section>
                    <SectionTitle
                      title="Highly Rated"
                      subtitle="Tutors with strong ratings and proven track records"
                    />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 18 }}>
                      {topRated.map((t, i) => <TutorCard key={t.id} tutor={t} index={i} />)}
                    </div>
                  </section>
                )}

                {newTutors.length > 0 && (
                  <section>
                    <SectionTitle
                      title="New on Coursaty"
                      subtitle="Fresh tutors — be among their first students"
                    />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 18 }}>
                      {newTutors.map((t, i) => <TutorCard key={t.id} tutor={t} index={i} />)}
                    </div>
                  </section>
                )}

                {featured.length === 0 && topRated.length === 0 && newTutors.length === 0 && (
                  <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "48px 0", fontSize: 15 }}>
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
