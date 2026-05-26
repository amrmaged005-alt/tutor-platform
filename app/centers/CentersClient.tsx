"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useIsMobile } from "../hooks/useIsMobile";

// ─── TYPES ─────────────────────────────────────────────────────────────────────
export interface CenterCardData {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  city: string;
  location: string | null;
  phone: string | null;
  email: string | null;
  tutorCount: number;
  classCount: number;
  totalStudents: number;
  avgRating: number | null;
  reviewCount: number;
  subjects: string[];
}

// ─── SUBJECT COLORS ────────────────────────────────────────────────────────────
const SUBJECT_COLORS: Record<string, string> = {
  Math: "var(--accent)", Mathematics: "var(--accent)", Physics: "var(--accent)",
  Chemistry: "var(--success)", Biology: "var(--accent)", English: "var(--warning)",
  Arabic: "var(--error)", History: "var(--warning)", Geography: "var(--accent)",
  French: "var(--accent)", "Computer Science": "var(--accent)", Science: "var(--success)",
  Economics: "var(--warning)", Business: "var(--accent)",
};
function subjectColor(s: string) { return SUBJECT_COLORS[s] ?? "var(--text-secondary)"; }

const CITIES = ["All Cities", "Cairo", "Alexandria", "Giza", "Online"];

// ─── STARS ─────────────────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span style={{ color: "var(--rating)", fontSize: 13, letterSpacing: 1 }}>
      {"★".repeat(full)}{"☆".repeat(5 - full)}
    </span>
  );
}

// ─── CENTER LOGO ───────────────────────────────────────────────────────────────
function CenterLogo({ name, logoUrl, size = 56 }: { name: string; logoUrl: string | null; size?: number }) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={name}
        width={size}
        height={size}
        unoptimized={logoUrl.startsWith("data:") || logoUrl.startsWith("blob:")}
        style={{ width: size, height: size, borderRadius: 12, objectFit: "cover", flexShrink: 0, border: "1px solid var(--border-light)" }}
      />
    );
  }
  const colors = ["var(--accent-bg-soft)", "var(--accent-bg-soft)", "var(--accent-bg)", "var(--warning-bg)", "var(--accent-bg-soft)"];
  const textColors = ["var(--accent-hover)", "var(--accent)", "var(--success)", "var(--warning)", "var(--accent)"];
  const idx = (name.charCodeAt(0) ?? 0) % colors.length;
  return (
    <div style={{
      width: size, height: size, borderRadius: 12,
      backgroundColor: colors[idx],
      flexShrink: 0, display: "flex", alignItems: "center",
      justifyContent: "center", fontWeight: 800,
      fontSize: size * 0.4, color: textColors[idx],
      border: "1px solid var(--border-light)",
    }}>
      {name[0]?.toUpperCase()}
    </div>
  );
}

// ─── CENTER CARD ───────────────────────────────────────────────────────────────
function CenterCard({ center, index = 0 }: { center: CenterCardData; index?: number }) {
  const visibleSubjects = center.subjects.slice(0, 3);
  const extraSubjects = center.subjects.length - 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        borderRadius: 14,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "border-color 0.2s, box-shadow 0.2s",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = "var(--accent-border)";
        el.style.boxShadow = "0 4px 16px rgba(37,99,235,0.08)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = "var(--border-light)";
        el.style.boxShadow = "none";
      }}
    >
      {/* Top accent bar */}
      <div style={{ height: 3, backgroundColor: "var(--accent)", flexShrink: 0 }} />

      <div style={{ padding: "18px 18px 0" }}>
        {/* Header row */}
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 12 }}>
          <CenterLogo name={center.name} logoUrl={center.logoUrl} size={52} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {center.name}
            </div>
            <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 5, display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{center.city}{center.location ? ` · ${center.location}` : ""}</span>
            </div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, backgroundColor: "var(--accent-bg)", border: "1px solid var(--accent-border)", borderRadius: 99, padding: "2px 8px", fontSize: 11, fontWeight: 700, color: "var(--accent)" }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Verified Center
            </span>
          </div>
        </div>

        {/* Rating */}
        {center.avgRating !== null ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <Stars rating={center.avgRating} />
            <span style={{ fontWeight: 700, color: "var(--text)", fontSize: 13 }}>{center.avgRating.toFixed(1)}</span>
            <span style={{ color: "var(--text-muted)", fontSize: 12 }}>({center.reviewCount} reviews)</span>
          </div>
        ) : (
          <div style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 10 }}>New center</div>
        )}

        {/* Subject tags */}
        {center.subjects.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
            {visibleSubjects.map((s) => (
              <span key={s} style={{
                backgroundColor: `${subjectColor(s)}12`,
                border: `1px solid ${subjectColor(s)}30`,
                color: subjectColor(s),
                borderRadius: 999, padding: "2px 9px",
                fontSize: 11, fontWeight: 600,
              }}>{s}</span>
            ))}
            {extraSubjects > 0 && (
              <span style={{ backgroundColor: "var(--bg-subtle)", color: "var(--text-secondary)", borderRadius: 999, padding: "2px 9px", fontSize: 11, fontWeight: 600 }}>
                +{extraSubjects} more
              </span>
            )}
          </div>
        )}

        {/* Description */}
        {center.description && (
          <p style={{
            color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.6,
            margin: "0 0 10px",
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {center.description}
          </p>
        )}

        {/* Stats row */}
        <div style={{ display: "flex", gap: 16, paddingBottom: 12, borderBottom: "1px solid var(--bg-subtle)" }}>
          {[
            { value: center.tutorCount, label: "Tutors" },
            { value: center.classCount, label: "Classes" },
            { value: center.totalStudents, label: "Students" },
          ].map((stat) => (
            <div key={stat.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontWeight: 700, color: "var(--text)", fontSize: 14 }}>{stat.value}</span>
              <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "12px 18px 16px" }}>
        <Link
          href={`/centers/${center.id}`}
          style={{
            display: "block", textAlign: "center",
            backgroundColor: "var(--accent)",
            color: "var(--bg-card)", borderRadius: 8,
            padding: "9px 0", fontSize: 13, fontWeight: 600,
            textDecoration: "none",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--accent-hover)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--accent)"; }}
        >
          View Center
        </Link>
      </div>
    </motion.div>
  );
}

// ─── FILTER SIDEBAR ────────────────────────────────────────────────────────────
function FilterSidebar({
  selectedCity, setSelectedCity,
  minRating, setMinRating,
  onClear, hasFilters,
}: {
  selectedCity: string; setSelectedCity: (c: string) => void;
  minRating: number; setMinRating: (r: number) => void;
  onClear: () => void; hasFilters: boolean;
}) {
  return (
    <div style={{ width: 220, flexShrink: 0, position: "sticky", top: 80, alignSelf: "flex-start", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 14, padding: "18px", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Filters</span>
        {hasFilters && (
          <button onClick={onClear} style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)", color: "var(--accent)", fontSize: 12, fontWeight: 600, cursor: "pointer", padding: "3px 10px", borderRadius: 999 }}>
            Clear all
          </button>
        )}
      </div>

      {/* City */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>City</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {CITIES.map((city) => (
            <button key={city} onClick={() => setSelectedCity(city)} style={{
              background: selectedCity === city ? "var(--accent-bg)" : "none",
              border: selectedCity === city ? "1px solid var(--accent-border)" : "1px solid transparent",
              borderRadius: 8, padding: "7px 10px", textAlign: "left",
              color: selectedCity === city ? "var(--accent)" : "var(--text-secondary)",
              fontWeight: selectedCity === city ? 600 : 400,
              fontSize: 13, cursor: "pointer", transition: "all 0.15s",
            }}>
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Min Rating */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Minimum Rating</div>
        <div style={{ display: "flex", gap: 5 }}>
          {[0, 3, 4, 4.5].map((r) => (
            <button key={r} onClick={() => setMinRating(r)} style={{
              flex: 1, padding: "6px 4px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
              border: `1px solid ${minRating === r ? "var(--warning-bg)" : "var(--border-light)"}`,
              backgroundColor: minRating === r ? "var(--warning-bg)" : "var(--bg-card)",
              color: minRating === r ? "var(--warning)" : "var(--text-secondary)",
              transition: "all 0.15s",
            }}>
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
    <div style={{ marginBottom: 18 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: 0, marginBottom: subtitle ? 4 : 0 }}>{title}</h2>
      {subtitle && <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: 0 }}>{subtitle}</p>}
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function CentersClient({ centers }: { centers: CenterCardData[] }) {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [minRating, setMinRating] = useState(0);

  function clearFilters() { setSearch(""); setSelectedCity("All Cities"); setMinRating(0); }
  const hasFilters = !!search || selectedCity !== "All Cities" || minRating > 0;

  const filtered = useMemo(() => {
    return centers.filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        const match = c.name.toLowerCase().includes(q)
          || (c.description ?? "").toLowerCase().includes(q)
          || c.subjects.some((s) => s.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (selectedCity !== "All Cities" && c.city !== selectedCity) return false;
      if (minRating > 0 && (c.avgRating === null || c.avgRating < minRating)) return false;
      return true;
    });
  }, [centers, search, selectedCity, minRating]);

  const topRated = filtered.filter((c) => c.avgRating !== null && c.avgRating >= 4.5);
  const established = filtered.filter((c) => c.classCount >= 5);
  const newCenters = filtered.filter((c) => c.classCount < 5);
  const isFiltering = hasFilters;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-alt)", color: "var(--text)" }}>

      {/* Page header */}
      <div style={{ backgroundColor: "var(--bg-card)", borderBottom: "1px solid var(--border-light)", padding: isMobile ? "10px 14px 12px" : "32px 24px 28px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Breadcrumb (desktop only) */}
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, color: "var(--text-muted)", fontSize: 13 }}>
              <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Home</Link>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span style={{ color: "var(--text)" }}>Learning Centers</span>
            </div>
          )}

          <h1 style={{
            fontSize: isMobile ? 20 : "clamp(22px, 3.5vw, 32px)",
            fontWeight: 800, color: "var(--text)",
            margin: isMobile ? "0 0 6px" : "0 0 6px",
            letterSpacing: "-0.02em",
            display: "inline-flex", alignItems: "baseline", gap: 8, flexWrap: "wrap",
          }}>
            Learning Centers
            {isMobile && (
              <span style={{
                fontSize: 12, fontWeight: 700, color: "var(--text-muted)",
                background: "var(--bg-alt)", border: "1px solid var(--border-light)",
                borderRadius: 999, padding: "2px 8px", letterSpacing: 0,
              }}>{centers.length}</span>
            )}
          </h1>
          {!isMobile && <p style={{ color: "var(--text-secondary)", fontSize: 15, margin: "0 0 24px" }}>
            {centers.length} verified centers across Egypt — find the right institution for you.
          </p>}

          {/* Search bar */}
          <div style={{ position: "relative", maxWidth: isMobile ? 420 : 520 }}>
            <div style={{ position: "absolute", insetInlineStart: isMobile ? 10 : 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              type="text" placeholder="Search by name, subject, or location..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", backgroundColor: "var(--bg-alt)", border: "1px solid var(--border-light)", borderRadius: 10, padding: isMobile ? "8px 12px" : "11px 14px", paddingInlineStart: isMobile ? 34 : 42, color: "var(--text)", fontSize: isMobile ? 13 : 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", transition: "border-color 0.15s, box-shadow 0.15s" }}
              onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; }}
              onBlur={(e) => { e.target.style.borderColor = "var(--border-light)"; e.target.style.boxShadow = "none"; }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ position: "absolute", insetInlineEnd: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding: isMobile ? "12px 14px 64px" : "32px 24px 80px",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: isMobile ? 16 : 28,
        alignItems: isMobile ? "stretch" : "flex-start",
      }}>
        {/* Sidebar — desktop only (mobile users get the chips in the hero) */}
        {!isMobile && <FilterSidebar
          selectedCity={selectedCity} setSelectedCity={setSelectedCity}
          minRating={minRating} setMinRating={setMinRating}
          onClear={clearFilters} hasFilters={hasFilters}
        />}

        {/* Cards */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Result count */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
            <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>
              <span style={{ color: "var(--text)", fontWeight: 700 }}>{filtered.length}</span> center{filtered.length !== 1 ? "s" : ""}
              {hasFilters && " match your filters"}
            </span>
            {hasFilters && (
              <button onClick={clearFilters} style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)", color: "var(--accent)", borderRadius: 999, padding: "5px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                ✕ Clear filters
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 14, padding: "64px 32px", textAlign: "center" }}>
                <div style={{ marginBottom: 16, color: "var(--text-dim)" }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto", display: "block" }}>
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <div style={{ color: "var(--text)", fontWeight: 700, fontSize: 17, marginBottom: 8 }}>No centers found</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>Try adjusting your search or filters</div>
                <button onClick={clearFilters} style={{ backgroundColor: "var(--accent)", color: "var(--bg-card)", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  Clear filters
                </button>
              </motion.div>
            ) : isFiltering ? (
              <motion.div key="filtered" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
                  {filtered.map((c, i) => <CenterCard key={c.id} center={c} index={i} />)}
                </div>
              </motion.div>
            ) : (
              <motion.div key="segments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "flex", flexDirection: "column", gap: 40 }}>
                {topRated.length > 0 && (
                  <section>
                    <SectionTitle title="Top Rated Centers" subtitle="Consistently rated 4.5★ or higher" />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
                      {topRated.map((c, i) => <CenterCard key={c.id} center={c} index={i} />)}
                    </div>
                  </section>
                )}
                {established.length > 0 && (
                  <section>
                    <SectionTitle title="Established Institutions" subtitle="Centers with a proven track record" />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
                      {established.map((c, i) => <CenterCard key={c.id} center={c} index={i} />)}
                    </div>
                  </section>
                )}
                {newCenters.length > 0 && (
                  <section>
                    <SectionTitle title="New Centers" subtitle="Just joined — be among their first students" />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
                      {newCenters.map((c, i) => <CenterCard key={c.id} center={c} index={i} />)}
                    </div>
                  </section>
                )}
                {filtered.length === 0 && (
                  <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "48px 0" }}>No centers yet. Check back soon!</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
