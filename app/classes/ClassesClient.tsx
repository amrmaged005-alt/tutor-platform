"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";
import { useI18n } from "../components/i18n";
import { useFilterParams } from "../hooks/useFilterParams";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useIsMobile } from "../hooks/useIsMobile";
import ClassFilterBottomSheet from "./components/ClassFilterBottomSheet";
import ClassFilters, { type ClassFilterState } from "./components/ClassFilters";
import ClassCard, { type ClassCardData } from "./components/ClassCard";
import TrendingClassesRow from "./components/TrendingClassesRow";
import { DEFAULT_CLASS_FILTERS, filterClasses, getActiveClassFilterCount } from "./components/classFiltering";

const SUBJECTS = [
  "Math", "Physics", "Chemistry", "Biology", "English", "Arabic", "History",
  "Geography", "French", "Computer Science", "Science", "Economics",
  "Accounting", "Business",
];

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", margin: "0 0 4px" }}>
        {title}
      </h2>
      {subtitle && <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: 0 }}>{subtitle}</p>}
    </div>
  );
}

function ResultsGrid({ classes }: { classes: ClassCardData[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 18 }}>
      {classes.map((cls, index) => <ClassCard key={cls.id} cls={cls} index={index} />)}
    </div>
  );
}

function mobileGrid(classes: ClassCardData[]) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
      {classes.map((cls, index) => <ClassCard key={cls.id} cls={cls} index={index} compact />)}
    </div>
  );
}

export default function ClassesClient({ classes }: { classes: ClassCardData[] }) {
  const isMobile = useIsMobile();
  const { t } = useI18n();
  const { filters, setFilter, resetFilters } = useFilterParams(DEFAULT_CLASS_FILTERS);
  const typedFilters = filters as ClassFilterState;
  const [items, setItems] = useState(classes);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(classes.length >= 12);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<ClassFilterState>(typedFilters);

  const filtered = useMemo(() => filterClasses(items, typedFilters), [items, typedFilters]);
  const draftResultCount = useMemo(() => filterClasses(items, draftFilters).length, [items, draftFilters]);
  const activeFilterCount = getActiveClassFilterCount(typedFilters);
  const draftActiveFilterCount = getActiveClassFilterCount(draftFilters);
  const isFiltering = activeFilterCount > 0;
  const filterQuery = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(typedFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params.toString();
  }, [typedFilters]);

  function updateFilter(key: keyof ClassFilterState, value: string) {
    setFilter(key, value);
  }

  function toggleSubject(subject: string) {
    updateFilter("subject", typedFilters.subject === subject ? "" : subject);
  }

  function openMobileFilters() {
    setDraftFilters(typedFilters);
    setMobileFiltersOpen(true);
  }

  function applyMobileFilters() {
    (Object.entries(draftFilters) as [keyof ClassFilterState, string][]).forEach(([key, value]) => {
      setFilter(key, value);
    });
    setMobileFiltersOpen(false);
  }

  function clearMobileFilters() {
    setDraftFilters(DEFAULT_CLASS_FILTERS);
    resetFilters();
  }

  useEffect(() => {
    const params = new URLSearchParams(filterQuery);
    params.set("page", "1");
    params.set("limit", "12");

    let cancelled = false;
    fetch(`/api/classes?${params.toString()}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { items: [], hasMore: false }))
      .then((data) => {
        if (cancelled) return;
        setItems(Array.isArray(data.items) ? data.items : []);
        setPage(1);
        setHasMore(Boolean(data.hasMore));
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [filterQuery]);

  const loadMore = useCallback(async () => {
    const nextPage = page + 1;
    const params = new URLSearchParams(filterQuery);
    params.set("page", String(nextPage));
    params.set("limit", "12");
    const res = await fetch(`/api/classes?${params.toString()}`, { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    const nextItems = Array.isArray(data.items) ? data.items : [];
    setItems((current) => [...current, ...nextItems]);
    setPage(nextPage);
    setHasMore(Boolean(data.hasMore));
  }, [filterQuery, page]);

  const { sentinelRef, isLoading } = useInfiniteScroll(loadMore, hasMore);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-alt)", color: "var(--text)" }}>
      <ClassFilterBottomSheet
        open={mobileFiltersOpen}
        filters={draftFilters}
        onChange={(key, value) => setDraftFilters((current) => ({ ...current, [key]: value }))}
        onApply={applyMobileFilters}
        onClear={clearMobileFilters}
        onClose={() => setMobileFiltersOpen(false)}
        activeCount={draftActiveFilterCount}
        resultCount={draftResultCount}
        totalCount={items.length}
      />

      <div
        style={{
          backgroundColor: "var(--bg-card)",
          borderBottom: "1px solid var(--border-light)",
          padding: isMobile ? "10px 14px 12px" : "32px 24px 28px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
            className="desktop-only"
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              insetInlineEnd: 0,
              width: "min(44%, 520px)",
              opacity: 0.5,
              pointerEvents: "none",
              maskImage: "linear-gradient(90deg, transparent 0%, black 35%)",
              WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 35%)",
            }}
            aria-hidden="true"
          >
            <Image src="/higgsfield/group-study.webp" alt="" fill priority sizes="520px" style={{ objectFit: "cover" }} />
        </div>

        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
          <div style={{ display: isMobile ? "none" : "flex", alignItems: "center", gap: 6, marginBottom: 16, color: "var(--text-muted)", fontSize: 13 }}>
            <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>{t("common.home")}</Link>
            <ChevronRight size={12} strokeWidth={2} aria-hidden />
            <span style={{ color: "var(--text)" }}>Classes</span>
          </div>

          <h1 style={{ fontSize: isMobile ? 20 : "clamp(22px, 3.5vw, 32px)", fontWeight: 900, color: "var(--text)", margin: "0 0 6px", letterSpacing: 0 }}>
            Find Your Perfect Class
          </h1>
          {!isMobile && (
            <p style={{ color: "var(--text-secondary)", fontSize: 15, margin: "0 0 24px" }}>
              {items.length} verified classes across Egypt - filter by subject, city, price, and format.
            </p>
          )}

          <div style={{ position: "relative", maxWidth: isMobile ? 420 : 520 }}>
            <span style={{ position: "absolute", insetInlineStart: isMobile ? 10 : 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)", display: "inline-flex" }}>
              <Search size={16} strokeWidth={2} aria-hidden />
            </span>
            <input
              name="class-search"
              aria-label="Search classes"
              type="search"
              placeholder="Search by title, subject, tutor, or keyword..."
              value={typedFilters.q}
              onChange={(event) => updateFilter("q", event.target.value)}
              style={{
                width: "100%",
                backgroundColor: "var(--bg-alt)",
                border: "1px solid var(--border-light)",
                borderRadius: 10,
                padding: isMobile ? "8px 12px" : "11px 14px",
                paddingInlineStart: isMobile ? 34 : 42,
                paddingInlineEnd: typedFilters.q ? 42 : 14,
                color: "var(--text)",
                fontSize: isMobile ? 13 : 14,
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "inherit",
                minHeight: isMobile ? 38 : 46,
              }}
            />
            <AnimatePresence>
              {typedFilters.q && (
                <motion.button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => updateFilter("q", "")}
                  initial={{ opacity: 0, scale: 0.82 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.82 }}
                  style={{ position: "absolute", insetInlineEnd: 8, top: "50%", display: "inline-flex", padding: 6, color: "var(--text-muted)", background: "transparent", border: 0, cursor: "pointer", transform: "translateY(-50%)" }}
                >
                  <X size={15} aria-hidden />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div style={{ display: isMobile ? "none" : "flex", gap: 6, flexWrap: "wrap", marginTop: 16 }}>
            {SUBJECTS.map((subject) => {
              const active = typedFilters.subject === subject;
              return (
                <button
                  key={subject}
                  type="button"
                  onClick={() => toggleSubject(subject)}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    border: `1px solid ${active ? "var(--accent-border)" : "var(--border-light)"}`,
                    backgroundColor: active ? "var(--accent-bg)" : "var(--bg-card)",
                    color: active ? "var(--accent)" : "var(--text-secondary)",
                    transition: "background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast)",
                  }}
                >
                  {subject}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {!isFiltering && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "16px 14px 0" : "28px 24px 0" }}>
          <TrendingClassesRow isMobile={isMobile} />
        </div>
      )}

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
        <div className="desktop-only" style={{ flexDirection: "column", flexShrink: 0 }}>
          <ClassFilters
            filters={typedFilters}
            onChange={updateFilter}
            onReset={resetFilters}
            activeCount={activeFilterCount}
          />
        </div>

        <main style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                className="mobile-only"
                type="button"
                onClick={openMobileFilters}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  backgroundColor: isFiltering ? "var(--accent-bg)" : "var(--bg-card)",
                  border: `1px solid ${isFiltering ? "var(--accent-border)" : "var(--border-light)"}`,
                  color: isFiltering ? "var(--accent)" : "var(--text-secondary)",
                  borderRadius: 8,
                  padding: "8px 14px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <SlidersHorizontal size={14} strokeWidth={2} aria-hidden />
                Filters
                {activeFilterCount > 0 && (
                  <span style={{ backgroundColor: "var(--accent)", color: "var(--accent-fg)", borderRadius: 99, width: 16, height: 16, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800 }}>
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                <strong style={{ color: "var(--text)" }}>{filtered.length}</strong> classes {isFiltering ? "match your filters" : "available"}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {isFiltering && (
                <button type="button" onClick={resetFilters} style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)", color: "var(--accent)", borderRadius: 999, padding: "5px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <X size={13} strokeWidth={2} aria-hidden /> Clear all
                </button>
              )}
              <select name="class-sort" aria-label="Sort classes" value={typedFilters.sort} onChange={(event) => updateFilter("sort", event.target.value)} style={{ backgroundColor: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--border-light)", borderRadius: 8, padding: "7px 10px", fontSize: 13, fontFamily: "inherit" }}>
                <option value="popular">Most popular</option>
                <option value="newest">Newest</option>
                <option value="price_asc">Price low-high</option>
                <option value="price_desc">Price high-low</option>
              </select>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 14, padding: "64px 32px", textAlign: "center" }}>
                <Search size={48} strokeWidth={1.5} style={{ color: "var(--text-dim)", margin: "0 auto 16px", display: "block" }} aria-hidden />
                <div style={{ color: "var(--text)", fontWeight: 800, fontSize: 17, marginBottom: 8 }}>No classes found</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>Try another subject, city, price, or class format.</div>
                <button type="button" onClick={resetFilters} className="btn-primary">Clear filters</button>
              </motion.div>
            ) : isFiltering ? (
              <motion.div key="filtered" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {isMobile ? mobileGrid(filtered) : <ResultsGrid classes={filtered} />}
              </motion.div>
            ) : (
              <motion.div key="segments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "flex", flexDirection: "column", gap: 40 }}>
                <section>
                  <SectionTitle title="New on Coursaty" subtitle="Recently published, ready to book" />
                  {isMobile ? mobileGrid(filtered) : <ResultsGrid classes={filtered} />}
                </section>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={sentinelRef} style={{ minHeight: 56, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13, marginTop: 18 }}>
            {isLoading ? <span style={{ width: 20, height: 20, border: "2px solid var(--border-light)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> : !hasMore && items.length > 0 ? "You've seen all classes" : null}
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </main>
      </div>
    </div>
  );
}
