"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Search, X, SlidersHorizontal } from "lucide-react";
import TutorCard, { TutorCardData } from "./TutorCard";
import { useI18n } from "../components/i18n";
import { useIsMobile } from "../hooks/useIsMobile";
import { useFocusTrap } from "@/components/ui/useFocusTrap";

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
  const { t } = useI18n();

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
        <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{t("common.filters")}</span>
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
            {t("common.clearAll")}
          </button>
        )}
      </div>

      {/* City */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
          {t("tutors.city")}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {CITIES.map((city) => {
            const label = city === "All Cities" ? t("tutors.allCities") : city;
            return (
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
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subjects */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
          {t("tutors.subjects")}
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
          {t("tutors.minRating")}
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
              {r === 0 ? t("common.any") : `${r}+`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function MobileTutorFilterDrawer({
  open, onClose,
  selectedSubjects, setSelectedSubjects,
  selectedCity, setSelectedCity,
  minRating, setMinRating,
  onClear,
  resultCount,
  totalCount,
}: {
  open: boolean; onClose: () => void;
  selectedSubjects: string[]; setSelectedSubjects: (s: string[]) => void;
  selectedCity: string; setSelectedCity: (c: string) => void;
  minRating: number; setMinRating: (r: number) => void;
  onClear: () => void;
  resultCount: number;
  totalCount: number;
}) {
  const { t } = useI18n();
  const dragStartY = useRef<number | null>(null);
  const dragDelta = useRef(0);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const [dragY, setDragY] = useState(0);
  useFocusTrap(dialogRef, open, onClose);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  function toggleSubject(s: string) {
    setSelectedSubjects(selectedSubjects.includes(s) ? selectedSubjects.filter(x => x !== s) : [...selectedSubjects, s]);
  }

  const hasFilters = selectedSubjects.length > 0 || selectedCity !== "All Cities" || minRating > 0;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          backgroundColor: "rgba(24,23,21,0.42)", backdropFilter: "blur(3px)",
          zIndex: 997,
          opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.25s ease",
        }}
      />
      <div
        ref={dialogRef}
        role="dialog" aria-modal="true" aria-label={t("common.filters")}
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          maxHeight: "80vh",
          backgroundColor: "var(--bg-elevated)",
          borderRadius: "20px 20px 0 0",
          border: "1px solid var(--border-light)", borderBottom: "none",
          zIndex: 998,
          transform: open ? `translateY(${dragY}px)` : "translateY(100%)",
          transition: dragY === 0 ? "transform 0.3s cubic-bezier(0.4,0,0.2,1)" : "none",
          display: "flex", flexDirection: "column",
          boxShadow: "var(--shadow-xl)",
          overflowY: "auto",
        }}
      >
        <div
          onTouchStart={(e) => { dragStartY.current = e.touches[0]?.clientY ?? null; dragDelta.current = 0; }}
          onTouchMove={(e) => {
            if (dragStartY.current === null) return;
            const delta = (e.touches[0]?.clientY ?? 0) - dragStartY.current;
            if (delta < 0) return;
            dragDelta.current = delta;
            setDragY(delta);
          }}
          onTouchEnd={() => {
            const final = dragDelta.current;
            dragStartY.current = null;
            dragDelta.current = 0;
            setDragY(0);
            if (final > 80) onClose();
          }}
          style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px", touchAction: "none", cursor: "grab" }}
        >
          <div style={{ width: 40, height: 4, borderRadius: 99, background: "var(--border)" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 20px 16px" }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>{t("common.filters")}</span>
          <button onClick={onClose} aria-label={t("common.close")} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4, lineHeight: 1, display: "inline-flex" }}>
            <X size={20} strokeWidth={1.8} />
          </button>
        </div>

        <div style={{ padding: "0 20px 24px", display: "flex", flexDirection: "column", gap: 24 }}>
          {/* City */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>{t("tutors.city")}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {CITIES.map(city => {
                const label = city === "All Cities" ? t("tutors.allCities") : city;
                return (
                  <button key={city} onClick={() => setSelectedCity(city)} style={{
                    padding: "7px 14px", borderRadius: 99, fontSize: 13, cursor: "pointer",
                    background: selectedCity === city ? "var(--accent-bg)" : "var(--bg-card)",
                    border: `1px solid ${selectedCity === city ? "var(--accent-border)" : "var(--border-light)"}`,
                    color: selectedCity === city ? "var(--accent)" : "var(--text-secondary)",
                    fontWeight: selectedCity === city ? 600 : 400,
                  }}>{label}</button>
                );
              })}
            </div>
          </div>

          {/* Subjects */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>{t("tutors.subjects")}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {ALL_SUBJECTS.map(s => {
                const active = selectedSubjects.includes(s);
                return (
                  <button key={s} onClick={() => toggleSubject(s)} style={{
                    padding: "5px 12px", borderRadius: 99, fontSize: 13, fontWeight: 500, cursor: "pointer",
                    border: `1px solid ${active ? "var(--accent-border)" : "var(--border-light)"}`,
                    backgroundColor: active ? "var(--accent-bg)" : "var(--bg-card)",
                    color: active ? "var(--accent)" : "var(--text-secondary)",
                    transition: "all 0.15s",
                  }}>{s}</button>
                );
              })}
            </div>
          </div>

          {/* Min Rating */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>{t("tutors.minRating")}</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[0, 3, 4, 4.5].map(r => (
                <button key={r} onClick={() => setMinRating(r)} style={{
                  flex: 1, padding: "9px 6px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  border: `1px solid ${minRating === r ? "var(--accent-border)" : "var(--border-light)"}`,
                  backgroundColor: minRating === r ? "var(--accent-bg)" : "var(--bg-card)",
                  color: minRating === r ? "var(--accent)" : "var(--text-secondary)",
                }}>{r === 0 ? t("common.any") : `${r}+`}</button>
              ))}
            </div>
          </div>

          <div style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", paddingTop: 4 }}>
            {resultCount} of {totalCount} results
          </div>

          <div style={{ display: "flex", gap: 10, paddingTop: 8 }}>
            {hasFilters && (
              <button onClick={() => { onClear(); onClose(); }} style={{
                flex: 1, padding: "12px", borderRadius: 10, border: "1px solid var(--border)",
                background: "var(--bg-card)", color: "var(--text)", fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}>{t("common.clearAll")}</button>
            )}
            <button onClick={onClose} style={{
              flex: 2, padding: "12px", borderRadius: 10, border: "none",
              background: "var(--accent)", color: "var(--accent-fg)", fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}>{t("common.applyFilters")}</button>
          </div>
        </div>
      </div>
    </>
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
  const { t } = useI18n();
  const isMobile = useIsMobile();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [minRating, setMinRating] = useState(0);
  const [search, setSearch] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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

  const activeFilterCount = [selectedSubjects.length > 0, selectedCity !== "All Cities", minRating > 0].filter(Boolean).length;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-alt)", color: "var(--text)" }}>
      <MobileTutorFilterDrawer
        open={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)}
        selectedSubjects={selectedSubjects} setSelectedSubjects={setSelectedSubjects}
        selectedCity={selectedCity} setSelectedCity={setSelectedCity}
        minRating={minRating} setMinRating={setMinRating}
        onClear={clearFilters}
        resultCount={filtered.length}
        totalCount={tutors.length}
      />

      {/* Page header */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          borderBottom: "1px solid var(--border-light)",
          padding: isMobile ? "10px 14px 12px" : "32px 24px 28px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Hero image on desktop — students learning together as social proof */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            style={{
              position: "absolute",
              inset: 0,
              insetInlineStart: "auto",
              width: "min(44%, 520px)",
              opacity: 0.5,
              pointerEvents: "none",
              maskImage: "linear-gradient(90deg, transparent 0%, black 35%)",
              WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 35%)",
            }}
            aria-hidden="true"
          >
            <Image
              src="/higgsfield/group-study.webp"
              alt=""
              fill
              priority
              sizes="520px"
              style={{ objectFit: "cover" }}
            />
          </motion.div>
        )}
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
          {/* Breadcrumb */}
          <div style={{ display: isMobile ? "none" : "flex", alignItems: "center", gap: 6, marginBottom: 16, color: "var(--text-muted)", fontSize: 13 }}>
            <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>{t("common.home")}</Link>
            <ChevronRight size={12} strokeWidth={2} aria-hidden />
            <span style={{ color: "var(--text)" }}>{t("common.tutors")}</span>
          </div>

          <h1 style={{
            fontSize: isMobile ? 20 : "clamp(22px, 3.5vw, 32px)",
            fontWeight: 800, color: "var(--text)",
            margin: isMobile ? "0 0 6px" : "0 0 6px",
            letterSpacing: "-0.02em",
            display: "inline-flex", alignItems: "baseline", gap: 8, flexWrap: "wrap",
          }}>
            {t("tutors.pageTitle")}
            {isMobile && (
              <span style={{
                fontSize: 12, fontWeight: 700, color: "var(--text-muted)",
                background: "var(--bg-alt)", border: "1px solid var(--border-light)",
                borderRadius: 999, padding: "2px 8px", letterSpacing: 0,
              }}>{tutors.length}</span>
            )}
          </h1>
          {!isMobile && <p style={{ color: "var(--text-secondary)", fontSize: 15, margin: "0 0 24px" }}>
            {t("tutors.pageSubtitle", { count: tutors.length })}
          </p>}

          {/* Search bar */}
          <div style={{ position: "relative", maxWidth: isMobile ? 420 : 520 }}>
            <div
              style={{
                position: "absolute", insetInlineStart: isMobile ? 10 : 14, top: "50%",
                transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)",
              }}
            >
              <Search size={16} strokeWidth={2} aria-hidden />
            </div>
            <input
              type="text"
              placeholder={t("tutors.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                backgroundColor: "var(--bg-alt)",
                border: "1px solid var(--border-light)",
                borderRadius: 10,
                padding: isMobile ? "8px 12px" : "11px 14px",
                paddingInlineStart: isMobile ? 34 : 42,
                color: "var(--text)",
                fontSize: isMobile ? 13 : 14,
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
          <div style={{ display: isMobile ? "none" : "flex", gap: 6, flexWrap: "wrap", marginTop: 16 }}>
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
          padding: isMobile ? "14px 14px 64px" : "32px 24px 80px",
          display: "flex",
          gap: 28,
          alignItems: "flex-start",
        }}
      >
        {/* Desktop sidebar */}
        <div className="desktop-only" style={{ flexDirection: "column", flexShrink: 0 }}>
          <FilterSidebar
            selectedSubjects={selectedSubjects}
            setSelectedSubjects={setSelectedSubjects}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            minRating={minRating}
            setMinRating={setMinRating}
            onClear={clearFilters}
          />
        </div>

        {/* Cards area */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Result count + controls */}
          <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Mobile filter button */}
              <button
                className="mobile-only"
                onClick={() => setMobileFiltersOpen(true)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  backgroundColor: isFiltering ? "var(--accent-bg)" : "var(--bg-card)",
                  border: `1px solid ${isFiltering ? "var(--accent-border)" : "var(--border-light)"}`,
                  color: isFiltering ? "var(--accent)" : "var(--text-secondary)",
                  borderRadius: 8, padding: "8px 14px",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >
                <SlidersHorizontal size={14} strokeWidth={2} />
                {t("common.filters")}
                {isFiltering && <span style={{
                  backgroundColor: "var(--accent)", color: "var(--accent-fg)",
                  borderRadius: 99, width: 16, height: 16,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700,
                }}>
                  {activeFilterCount}
                </span>}
              </button>
              <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                <span style={{ color: "var(--text)", fontWeight: 700 }}>{filtered.length}</span>
                {" "}{filtered.length === 1 ? t("tutor.classes") : t("common.tutors").toLowerCase()}
                {isFiltering ? ` ${t("tutors.matchFilters")}` : ` ${t("tutors.available")}`}
              </span>
            </div>
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
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <X size={13} strokeWidth={2} /> {t("common.clearAll")}
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
                <div style={{ marginBottom: 16, color: "var(--text-dim)" }}>
                  <Search size={48} strokeWidth={1.5} style={{ margin: "0 auto", display: "block" }} aria-hidden />
                </div>
                <div style={{ color: "var(--text)", fontWeight: 700, fontSize: 17, marginBottom: 8 }}>
                  {t("tutors.noFound")}
                </div>
                <div style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>
                  {t("tutors.noFoundSub")}
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
                  {t("common.clearFilters")}
                </button>
              </motion.div>
            ) : isFiltering ? (
              <motion.div
                key="filtered"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(270px, 1fr))", gap: isMobile ? 10 : 18 }}>
                  {filtered.map((tutor, i) => (
                    <TutorCard key={tutor.id} tutor={tutor} index={i} />
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
                      title={t("tutors.topRated")}
                      subtitle={t("tutors.topRatedSub")}
                    />
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(270px, 1fr))", gap: isMobile ? 10 : 18 }}>
                      {featured.map((tutor, i) => <TutorCard key={tutor.id} tutor={tutor} index={i} />)}
                    </div>
                  </section>
                )}

                {topRated.length > 0 && (
                  <section>
                    <SectionTitle
                      title={t("tutors.highlyRated")}
                      subtitle={t("tutors.highlyRatedSub")}
                    />
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(270px, 1fr))", gap: isMobile ? 10 : 18 }}>
                      {topRated.map((tutor, i) => <TutorCard key={tutor.id} tutor={tutor} index={i} />)}
                    </div>
                  </section>
                )}

                {newTutors.length > 0 && (
                  <section>
                    <SectionTitle
                      title={t("tutors.newTutors")}
                      subtitle={t("tutors.newTutorsSub")}
                    />
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(270px, 1fr))", gap: isMobile ? 10 : 18 }}>
                      {newTutors.map((tutor, i) => <TutorCard key={tutor.id} tutor={tutor} index={i} />)}
                    </div>
                  </section>
                )}

                {featured.length === 0 && topRated.length === 0 && newTutors.length === 0 && (
                  <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "48px 0", fontSize: 15 }}>
                    {t("tutors.noFound")}
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
