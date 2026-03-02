"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import BackgroundFloaters from "../../components/ui/BackgroundFloaters";
import SectionHeader from "../../components/ui/SectionHeader";

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
  Math: "#3b82f6", Mathematics: "#3b82f6", Physics: "#8b5cf6",
  Chemistry: "#22c55e", Biology: "#10b981", English: "#f59e0b",
  Arabic: "#ef4444", History: "#f97316", Geography: "#06b6d4",
  French: "#a78bfa", "Computer Science": "#38bdf8", Science: "#34d399",
  Economics: "#fbbf24", Business: "#e879f9",
};
function subjectColor(s: string) { return SUBJECT_COLORS[s] ?? "#64748b"; }

const CITIES = ["All Cities", "Cairo", "Alexandria", "Giza", "Online"];

// ─── STARS ─────────────────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ color: "#f59e0b", fontSize: 13, letterSpacing: 1 }}>
      {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
    </span>
  );
}

// ─── CENTER LOGO ───────────────────────────────────────────────────────────────
function CenterLogo({ name, logoUrl, size = 64 }: { name: string; logoUrl: string | null; size?: number }) {
  if (logoUrl) {
    return <img src={logoUrl} alt={name} style={{ width: size, height: size, borderRadius: 14, objectFit: "cover", flexShrink: 0 }} />;
  }
  // Pick color based on first letter
  const colors = [
    ["#1d4ed8", "#1e3a8a"], ["#7c3aed", "#4c1d95"],
    ["#059669", "#064e3b"], ["#dc2626", "#7f1d1d"],
    ["#d97706", "#78350f"],
  ];
  const pair = colors[(name.charCodeAt(0) ?? 0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: 14,
      background: `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`,
      flexShrink: 0, display: "flex", alignItems: "center",
      justifyContent: "center", fontWeight: 900,
      fontSize: size * 0.4, color: "#fff",
      boxShadow: `0 0 0 3px #1e293b, 0 0 0 5px ${pair[0]}30`,
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
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -6, boxShadow: "0 20px 48px #1d4ed825" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#1d4ed850"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#334155"; }}
      style={{
        backgroundColor: "#1e293b",
        border: "1px solid #334155",
        borderRadius: 20,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "border-color 0.2s",
        position: "relative",
      }}
    >
      {/* Top accent — institutional blue */}
      <div style={{ height: 4, background: "linear-gradient(90deg, #1d4ed8, #7c3aed44)", flexShrink: 0 }} />

      <div style={{ padding: "20px 20px 0" }}>
        {/* Header row */}
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
          <CenterLogo name={center.name} logoUrl={center.logoUrl} size={60} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#f1f5f9", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {center.name}
            </div>
            <div style={{ color: "#64748b", fontSize: 13, marginBottom: 5, display: "flex", alignItems: "center", gap: 4 }}>
              <span>📍</span>
              <span>{center.city}{center.location ? ` · ${center.location}` : ""}</span>
            </div>
            {/* Verified badge */}
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, backgroundColor: "#1e3a5f", border: "1px solid #38bdf820", borderRadius: 99, padding: "2px 10px", fontSize: 11, fontWeight: 700, color: "#38bdf8" }}>
              ✓ Verified Center
            </span>
          </div>
        </div>

        {/* Rating */}
        {center.avgRating !== null ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Stars rating={center.avgRating} />
            <span style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 14 }}>{center.avgRating.toFixed(1)}</span>
            <span style={{ color: "#64748b", fontSize: 13 }}>({center.reviewCount} reviews)</span>
          </div>
        ) : (
          <div style={{ color: "#475569", fontSize: 13, marginBottom: 12 }}>New center</div>
        )}

        {/* Subject tags */}
        {center.subjects.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {visibleSubjects.map((s) => (
              <span key={s} style={{
                backgroundColor: `${subjectColor(s)}18`,
                border: `1px solid ${subjectColor(s)}40`,
                color: subjectColor(s),
                borderRadius: 999, padding: "3px 10px",
                fontSize: 12, fontWeight: 600,
              }}>{s}</span>
            ))}
            {extraSubjects > 0 && (
              <span style={{ backgroundColor: "#334155", color: "#94a3b8", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>
                +{extraSubjects} more
              </span>
            )}
          </div>
        )}

        {/* Description */}
        {center.description && (
          <p style={{
            color: "#64748b", fontSize: 13, lineHeight: 1.6,
            margin: "0 0 12px",
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {center.description}
          </p>
        )}

        {/* Stats row */}
        <div style={{ display: "flex", gap: 16, paddingBottom: 14, borderBottom: "1px solid #334155" }}>
          {[
            { icon: "👨‍🏫", value: center.tutorCount, label: "Tutors" },
            { icon: "📚", value: center.classCount, label: "Classes" },
            { icon: "👥", value: center.totalStudents, label: "Students" },
          ].map((stat) => (
            <div key={stat.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 14 }}>{stat.icon}</span>
              <span style={{ fontWeight: 700, color: "#cbd5e1", fontSize: 14 }}>{stat.value}</span>
              <span style={{ color: "#475569", fontSize: 12 }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "14px 20px 20px" }}>
        <Link
          href={`/centers/${center.id}`}
          style={{
            display: "block", textAlign: "center",
            background: "linear-gradient(135deg, #1d4ed8, #1e3a8a)",
            color: "#fff", borderRadius: 10,
            padding: "10px 0", fontSize: 14, fontWeight: 700,
            textDecoration: "none",
            boxShadow: "0 4px 14px #1d4ed840",
          }}
        >
          View Center →
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
  const label: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 };

  return (
    <div style={{ width: 240, flexShrink: 0, position: "sticky", top: 24, alignSelf: "flex-start", backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 20, padding: "20px 18px", display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9" }}>🏫 Filters</span>
        {hasFilters && <button onClick={onClear} style={{ background: "none", border: "none", color: "#3b82f6", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0 }}>Clear all</button>}
      </div>

      {/* City */}
      <div>
        <div style={label}>City</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {CITIES.map((city) => (
            <button key={city} onClick={() => setSelectedCity(city)} style={{
              background: selectedCity === city ? "#1d4ed815" : "none",
              border: selectedCity === city ? "1px solid #1d4ed840" : "1px solid transparent",
              borderRadius: 8, padding: "7px 10px", textAlign: "left",
              color: selectedCity === city ? "#60a5fa" : "#94a3b8",
              fontWeight: selectedCity === city ? 600 : 400,
              fontSize: 14, cursor: "pointer", transition: "all 0.15s",
            }}>
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Min Rating */}
      <div>
        <div style={label}>Minimum Rating</div>
        <div style={{ display: "flex", gap: 6 }}>
          {[0, 3, 4, 4.5].map((r) => (
            <button key={r} onClick={() => setMinRating(r)} style={{
              flex: 1, padding: "6px 4px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
              border: `1px solid ${minRating === r ? "#f59e0b" : "#334155"}`,
              backgroundColor: minRating === r ? "#f59e0b15" : "transparent",
              color: minRating === r ? "#f59e0b" : "#64748b",
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

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function CentersClient({ centers }: { centers: CenterCardData[] }) {
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

  // Segments
  const topRated = filtered.filter((c) => c.avgRating !== null && c.avgRating >= 4.5);
  const established = filtered.filter((c) => c.classCount >= 5);
  const newCenters = filtered.filter((c) => c.classCount < 5);
  const isFiltering = hasFilters;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", fontFamily: "system-ui, -apple-system, sans-serif", color: "#f1f5f9", position: "relative" }}>
      <BackgroundFloaters
        floaters={[
          { color: "#1d4ed8", size: 500, top: "-10%", left: "-8%",  duration: 12 },
          { color: "#7c3aed", size: 400, top: "65%",  left: "78%",  duration: 15, delay: 3 },
          { color: "#0284c7", size: 300, top: "35%",  left: "88%",  duration: 10, delay: 6 },
          { color: "#059669", size: 280, top: "80%",  left: "5%",   duration: 13, delay: 2 },
        ]}
      />

      {/* ── HERO ── */}
      <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #0f172a 0%, #1a2744 50%, #0f172a 100%)", borderBottom: "1px solid #334155", padding: "52px 24px 44px", zIndex: 1 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(#ffffff05 1px, transparent 1px), linear-gradient(90deg, #ffffff05 1px, transparent 1px)`, backgroundSize: "40px 40px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -120, right: -80, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, #1d4ed820 0%, transparent 65%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
          <Link href="/" style={{ color: "#64748b", fontSize: 13, textDecoration: "none" }}>← Home</Link>

          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            style={{ fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 900, margin: "20px 0 10px", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
            Learning{" "}
            <span style={{ background: "linear-gradient(90deg, #60a5fa, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Centers
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}
            style={{ color: "#94a3b8", fontSize: 17, marginBottom: 24, maxWidth: 460 }}>
            {centers.length} verified centers across Egypt. Find the right institution for you.
          </motion.p>

          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            style={{ position: "relative", maxWidth: 520 }}>
            <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 18, pointerEvents: "none" }}>🔍</span>
            <input
              type="text" placeholder="Search centers by name, subject, or location..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 14, padding: "13px 16px 13px 48px", color: "#f1f5f9", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "inherit", transition: "border-color 0.2s" }}
              onFocus={(e) => (e.target.style.borderColor = "#60a5fa")}
              onBlur={(e) => (e.target.style.borderColor = "#334155")}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 18 }}>×</button>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 24px 80px", position: "relative", zIndex: 1, display: "flex", gap: 28, alignItems: "flex-start" }}>
        {/* Sidebar */}
        <FilterSidebar
          selectedCity={selectedCity} setSelectedCity={setSelectedCity}
          minRating={minRating} setMinRating={setMinRating}
          onClear={clearFilters} hasFilters={hasFilters}
        />

        {/* Cards */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Result count */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <span style={{ color: "#64748b", fontSize: 14 }}>
              Showing <span style={{ color: "#f1f5f9", fontWeight: 700 }}>{filtered.length}</span> center{filtered.length !== 1 ? "s" : ""}
              {hasFilters && " matching filters"}
            </span>
            {hasFilters && (
              <button onClick={clearFilters} style={{ background: "none", border: "1px solid #334155", color: "#94a3b8", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                ✕ Clear
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 20, padding: "64px 32px", textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: 16 }}>🏫</div>
                <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>No centers found</div>
                <div style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>Try adjusting your search or filters</div>
                <button onClick={clearFilters} style={{ backgroundColor: "#1d4ed8", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  Clear filters
                </button>
              </motion.div>
            ) : isFiltering ? (
              <motion.div key="filtered" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 20 }}>
                  {filtered.map((c, i) => <CenterCard key={c.id} center={c} index={i} />)}
                </div>
              </motion.div>
            ) : (
              <motion.div key="segments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: "flex", flexDirection: "column", gap: 48 }}>

                {topRated.length > 0 && (
                  <section>
                    <SectionHeader title="Top Rated Centers" subtitle="Consistently rated 4.5★ or higher" badge="⭐ Highest Rated" badgeColor="#f59e0b" />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 20 }}>
                      {topRated.map((c, i) => <CenterCard key={c.id} center={c} index={i} />)}
                    </div>
                  </section>
                )}

                {established.length > 0 && (
                  <section>
                    <SectionHeader title="Established Institutions" subtitle="Centers with a proven track record" badge="🏛️ Established" badgeColor="#60a5fa" />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 20 }}>
                      {established.map((c, i) => <CenterCard key={c.id} center={c} index={i} />)}
                    </div>
                  </section>
                )}

                {newCenters.length > 0 && (
                  <section>
                    <SectionHeader title="New Centers" subtitle="Just joined — be among their first students" badge="🌱 New" badgeColor="#22c55e" />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 20 }}>
                      {newCenters.map((c, i) => <CenterCard key={c.id} center={c} index={i} />)}
                    </div>
                  </section>
                )}

                {filtered.length === 0 && (
                  <div style={{ textAlign: "center", color: "#64748b", padding: "48px 0" }}>
                    No centers yet. Check back soon!
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