"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpenCheck, Flame, MapPin, Monitor, RotateCcw, Search, SlidersHorizontal, Star, TrendingUp, Wallet, X } from "lucide-react";
import { useFilterParams } from "../hooks/useFilterParams";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useIsMobile } from "../hooks/useIsMobile";
import ClassFilterBottomSheet from "./components/ClassFilterBottomSheet";
import ClassFilters, { type ClassFilterState } from "./components/ClassFilters";
import ClassCard, { type ClassCardData } from "./components/ClassCard";
import { DEFAULT_CLASS_FILTERS, filterClasses, getActiveClassFilterCount } from "./components/classFiltering";

function ResultsGrid({ classes }: { classes: ClassCardData[] }) {
  return (
    <div className="classes-results-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10 }}>
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

function TrendingPills({ classes, activeSubject, onSelect }: { classes: ClassCardData[]; activeSubject: string; onSelect: (subject: string) => void }) {
  const subjects = useMemo(() => {
    const seen = new Set<string>();
    return classes.filter((cls) => {
      if (seen.has(cls.subject)) return false;
      seen.add(cls.subject);
      return true;
    }).slice(0, 6);
  }, [classes]);

  if (subjects.length === 0) return null;

  return (
    <section style={{ marginBlock: "10px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--bronze)", fontSize: 11, fontWeight: 850, marginBottom: 7 }}>
        <Flame size={12} strokeWidth={2} aria-hidden />
        Trending now
      </div>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
        {subjects.map((cls) => {
          const active = activeSubject === cls.subject;
          return (
            <button
              key={cls.subject}
              type="button"
              onClick={() => onSelect(active ? "" : cls.subject)}
              style={{
                minWidth: 98,
                maxWidth: 118,
                display: "flex",
                alignItems: "center",
                gap: 7,
                border: `1px solid ${active ? "var(--accent-border)" : "var(--border-light)"}`,
                background: active ? "var(--accent-bg)" : "var(--bg-card)",
                color: "var(--text)",
                borderRadius: 9,
                padding: "7px 8px",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{ width: 28, height: 28, borderRadius: 999, display: "grid", placeItems: "center", flexShrink: 0, background: active ? "var(--accent)" : "var(--accent-bg)", color: active ? "var(--accent-fg)" : "var(--accent)", fontSize: 11, fontWeight: 900 }}>
                {cls.subject.slice(0, 2).toUpperCase()}
              </span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 11, fontWeight: 850 }}>{cls.subject}</span>
                <span style={{ display: "block", color: "var(--text-muted)", fontSize: 9 }}>{cls.bookingsCount ?? 0} bookings</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function QuickRefinePanel({
  classes,
  filters,
  onChange,
}: {
  classes: ClassCardData[];
  filters: ClassFilterState;
  onChange: (key: keyof ClassFilterState, value: string) => void;
}) {
  const popularSubjects = useMemo(() => {
    const counts = new Map<string, number>();
    classes.forEach((cls) => counts.set(cls.subject, (counts.get(cls.subject) ?? 0) + 1));
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [classes]);

  const actions = [
    {
      label: "Under 500 EGP",
      icon: Wallet,
      active: filters.maxPrice === "500",
      onClick: () => onChange("maxPrice", filters.maxPrice === "500" ? "" : "500"),
    },
    {
      label: "Online",
      icon: Monitor,
      active: filters.type === "online",
      onClick: () => onChange("type", filters.type === "online" ? "" : "online"),
    },
    {
      label: "Cairo",
      icon: MapPin,
      active: filters.city === "Cairo",
      onClick: () => onChange("city", filters.city === "Cairo" ? "" : "Cairo"),
    },
    {
      label: "4+ stars",
      icon: Star,
      active: filters.minRating === "4",
      onClick: () => onChange("minRating", filters.minRating === "4" ? "" : "4"),
    },
    {
      label: "Cheapest first",
      icon: TrendingUp,
      active: filters.sort === "price_asc",
      onClick: () => onChange("sort", filters.sort === "price_asc" ? "popular" : "price_asc"),
    },
  ];

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 11, padding: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
        <div>
          <div style={{ color: "var(--text)", fontSize: 12, fontWeight: 900 }}>Quick refine</div>
          <div style={{ color: "var(--text-muted)", fontSize: 10, lineHeight: 1.35 }}>Narrow results without opening filters.</div>
        </div>
        <span style={{ width: 28, height: 28, borderRadius: 999, display: "grid", placeItems: "center", flexShrink: 0, color: "var(--accent)", background: "var(--accent-bg)" }}>
          <SlidersHorizontal size={14} strokeWidth={2} aria-hidden />
        </span>
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        {actions.map(({ label, icon: Icon, active, onClick }) => (
          <button
            key={label}
            type="button"
            aria-pressed={active}
            onClick={onClick}
            style={{
              minHeight: 32,
              display: "flex",
              alignItems: "center",
              gap: 7,
              width: "100%",
              padding: "6px 8px",
              borderRadius: 8,
              border: `1px solid ${active ? "var(--accent-border)" : "var(--border-light)"}`,
              background: active ? "var(--accent-bg)" : "var(--bg)",
              color: active ? "var(--accent)" : "var(--text-secondary)",
              fontFamily: "inherit",
              fontSize: 11,
              fontWeight: 800,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <Icon size={13} strokeWidth={2} aria-hidden />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {popularSubjects.length > 0 && (
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border-light)" }}>
          <div style={{ color: "var(--text-muted)", fontSize: 10, fontWeight: 850, marginBottom: 7 }}>Popular subjects</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {popularSubjects.map(([subject, count]) => {
              const active = filters.subject === subject;
              return (
                <button
                  key={subject}
                  type="button"
                  onClick={() => onChange("subject", active ? "" : subject)}
                  style={{
                    border: `1px solid ${active ? "var(--accent-border)" : "var(--border-light)"}`,
                    background: active ? "var(--accent-bg)" : "var(--bg)",
                    color: active ? "var(--accent)" : "var(--text-secondary)",
                    borderRadius: 999,
                    padding: "4px 8px",
                    fontSize: 10,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {subject} · {count}
                </button>
              );
            })}
          </div>
        </div>
      )}
      </div>
  );
}

function RightRail({
  classes,
  filters,
  resultCount,
  activeCount,
  onChange,
  onReset,
}: {
  classes: ClassCardData[];
  filters: ClassFilterState;
  resultCount: number;
  activeCount: number;
  onChange: (key: keyof ClassFilterState, value: string) => void;
  onReset: () => void;
}) {
  return (
    <aside className="classes-right-rail" style={{ width: 216, flexShrink: 0, display: "grid", gap: 14, position: "sticky", top: 80 }}>
      <div style={{ color: "var(--text-muted)", fontSize: 10, fontWeight: 800 }}>No results state</div>
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 11, padding: "19px 16px", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, margin: "0 auto 10px", borderRadius: 999, display: "grid", placeItems: "center", color: "var(--accent)", background: "var(--accent-bg)" }}>
          <BookOpenCheck size={32} strokeWidth={1.7} aria-hidden />
        </div>
        <div style={{ color: "var(--text)", fontSize: 14, fontWeight: 900, marginBottom: 4 }}>
          {resultCount === 0 ? "No classes found" : `${resultCount} classes found`}
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: 11, lineHeight: 1.45, margin: "0 0 13px" }}>
          {resultCount === 0 ? "We couldn't find any classes matching your search." : "Refine filters or open a class to compare details."}
        </p>
        <button
          type="button"
          onClick={onReset}
          disabled={activeCount === 0}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            minHeight: 30,
            padding: "0 14px",
            borderRadius: 7,
            border: "1px solid var(--accent)",
            background: activeCount > 0 ? "var(--accent)" : "var(--accent-bg)",
            color: activeCount > 0 ? "var(--accent-fg)" : "var(--accent)",
            fontSize: 11,
            fontWeight: 850,
            cursor: activeCount > 0 ? "pointer" : "default",
          }}
        >
          <RotateCcw size={12} strokeWidth={2} aria-hidden />
          Reset filters
        </button>
      </div>
      <QuickRefinePanel classes={classes} filters={filters} onChange={onChange} />
    </aside>
  );
}

export default function ClassesClient({ classes }: { classes: ClassCardData[] }) {
  const isMobile = useIsMobile();
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
    <div style={{ minHeight: "calc(100vh - 64px)", backgroundColor: "var(--bg)", color: "var(--text)" }}>
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
        className="mobile-only"
        style={{
          padding: "10px 14px 0",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 900, color: "var(--text)", margin: 0, letterSpacing: 0 }}>Browse Classes</h1>
      </div>

      <div className="classes-marketplace-shell" style={{ maxWidth: 1180, margin: "0 auto", display: "flex", alignItems: "flex-start" }}>
        <div className="desktop-only" style={{ flexDirection: "column", flexShrink: 0 }}>
          <ClassFilters
            filters={typedFilters}
            onChange={updateFilter}
            onReset={resetFilters}
            activeCount={activeFilterCount}
          />
        </div>

        <main style={{ flex: 1, minWidth: 0, padding: isMobile ? "8px 14px 64px" : "22px 14px 80px" }}>
          <div style={{ marginBottom: 4 }}>
            <div className="desktop-only" style={{ alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 10, fontWeight: 700, marginBottom: 2 }}>
              <span>IT</span>
              <span>/</span>
              <span>Students</span>
            </div>
            <h1 className="desktop-only" style={{ fontFamily: "var(--font-serif)", fontSize: 35, lineHeight: 1.02, fontWeight: 800, color: "var(--accent)", margin: "0 0 3px", letterSpacing: 0 }}>
              Browse Classes
            </h1>
            <p className="desktop-only" style={{ color: "var(--text-secondary)", fontSize: 11, margin: "0 0 11px" }}>
              Find the right class, with the right tutor, at the right time.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{ position: "relative", flex: 1, maxWidth: isMobile ? "none" : 520 }}>
                <span style={{ position: "absolute", insetInlineStart: isMobile ? 10 : 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)", display: "inline-flex" }}>
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
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-light)",
                borderRadius: 999,
                padding: isMobile ? "8px 12px" : "7px 12px",
                paddingInlineStart: isMobile ? 34 : 36,
                paddingInlineEnd: typedFilters.q ? 36 : 14,
                color: "var(--text)",
                fontSize: isMobile ? 13 : 11,
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "inherit",
                minHeight: isMobile ? 38 : 32,
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
                  style={{ position: "absolute", insetInlineEnd: 7, top: "50%", display: "inline-flex", padding: 5, color: "var(--text-muted)", background: "transparent", border: 0, cursor: "pointer", transform: "translateY(-50%)" }}
                >
                  <X size={15} aria-hidden />
                </motion.button>
              )}
            </AnimatePresence>
              </div>
              <select name="class-sort" aria-label="Sort classes" value={typedFilters.sort} onChange={(event) => updateFilter("sort", event.target.value)} style={{ backgroundColor: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--border-light)", borderRadius: 8, padding: isMobile ? "8px 10px" : "7px 9px", minHeight: isMobile ? 38 : 32, fontSize: isMobile ? 13 : 11, fontFamily: "inherit", flexShrink: 0 }}>
                <option value="popular">Sort: Popular</option>
                <option value="newest">Sort: Newest</option>
                <option value="price_asc">Price low-high</option>
                <option value="price_desc">Price high-low</option>
              </select>
            </div>
          </div>

          {!isFiltering && <TrendingPills classes={items} activeSubject={typedFilters.subject} onSelect={toggleSubject} />}

          <div style={{ marginBottom: 9, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
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
              <span style={{ color: "var(--text-secondary)", fontSize: isMobile ? 14 : 11 }}>
                <strong style={{ color: "var(--text)" }}>{filtered.length}</strong> classes {isFiltering ? "match your filters" : "available"}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {isFiltering && (
                <button type="button" onClick={resetFilters} style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)", color: "var(--accent)", borderRadius: 999, padding: "5px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <X size={13} strokeWidth={2} aria-hidden /> Clear all
                </button>
              )}
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
            ) : (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {isMobile ? mobileGrid(filtered) : <ResultsGrid classes={filtered.slice(0, 12)} />}
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={sentinelRef} style={{ minHeight: 56, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13, marginTop: 18 }}>
            {isLoading ? <span style={{ width: 20, height: 20, border: "2px solid var(--border-light)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> : !hasMore && items.length > 0 ? "You've seen all classes" : null}
          </div>
          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            @media (max-width: 1120px) {
              .classes-right-rail { width: 188px !important; }
            }
            @media (max-width: 980px) {
              .classes-results-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
            }
            @media (max-width: 900px) {
              .classes-marketplace-shell { display: block !important; }
              .classes-results-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            }
          `}</style>
        </main>

        <div className="desktop-only" style={{ flexShrink: 0, paddingBlockStart: 22 }}>
          <RightRail classes={items} filters={typedFilters} resultCount={filtered.length} activeCount={activeFilterCount} onChange={updateFilter} onReset={resetFilters} />
        </div>
      </div>
    </div>
  );
}
