"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import PageShell from "../../components/ui/PageShell";
import EmptyState from "../../components/ui/EmptyState";
import { useFilterParams } from "../hooks/useFilterParams";
import { useIsMobile } from "../hooks/useIsMobile";
import ClassFilters, { type ClassFilterState } from "./components/ClassFilters";
import ClassFilterBottomSheet from "./components/ClassFilterBottomSheet";
import ClassGrid from "./components/ClassGrid";
import TrendingClassesRow from "./components/TrendingClassesRow";
import type { ClassCardData } from "./components/ClassCard";
import { DEFAULT_CLASS_FILTERS, filterClasses, getActiveClassFilterCount } from "./components/classFiltering";

export default function ClassesClient({ classes }: { classes: ClassCardData[] }) {
  const isMobile = useIsMobile();
  const { filters, setFilter, resetFilters } = useFilterParams(DEFAULT_CLASS_FILTERS);
  const typedFilters = filters as ClassFilterState;
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<ClassFilterState>(typedFilters);

  const filtered = useMemo(() => filterClasses(classes, typedFilters), [classes, typedFilters]);
  const draftResultCount = useMemo(() => filterClasses(classes, draftFilters).length, [classes, draftFilters]);
  const currentActiveFilterCount = getActiveClassFilterCount(typedFilters);
  const draftActiveFilterCount = getActiveClassFilterCount(draftFilters);

  function openMobileFilters() {
    setDraftFilters(typedFilters);
    setMobileFiltersOpen(true);
  }

  function applyMobileFilters() {
    (Object.entries(draftFilters) as [keyof ClassFilterState, string][]).forEach(([key, value]) => setFilter(key, value));
    setMobileFiltersOpen(false);
  }

  function clearMobileFilters() {
    setDraftFilters(DEFAULT_CLASS_FILTERS);
    resetFilters();
  }

  return (
    <PageShell>
      <ClassFilterBottomSheet
        open={mobileFiltersOpen}
        filters={draftFilters}
        onChange={(key, value) => setDraftFilters((current) => ({ ...current, [key]: value }))}
        onApply={applyMobileFilters}
        onClear={clearMobileFilters}
        onClose={() => setMobileFiltersOpen(false)}
        activeCount={draftActiveFilterCount}
        resultCount={draftResultCount}
        totalCount={classes.length}
      />

      <section style={{ marginBottom: isMobile ? "1rem" : "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div>
            <span style={{ color: "var(--accent)", fontSize: 12, fontWeight: 800, textTransform: "uppercase" }}>Browse</span>
            <h1 style={{ color: "var(--text)", fontSize: "clamp(1.5rem, 4vw, 2.25rem)", margin: "0.25rem 0 0.35rem", fontWeight: 900 }}>Classes</h1>
            <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 14 }}>{classes.length} classes across subjects, curricula, cities, and formats.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {isMobile && (
              <button type="button" onClick={openMobileFilters} style={{ display: "inline-flex", alignItems: "center", gap: 7, backgroundColor: currentActiveFilterCount > 0 ? "var(--accent-bg)" : "var(--bg-card)", border: `1px solid ${currentActiveFilterCount > 0 ? "var(--accent-border)" : "var(--border-light)"}`, color: currentActiveFilterCount > 0 ? "var(--accent)" : "var(--text)", borderRadius: 10, padding: "9px 12px", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
                <SlidersHorizontal size={15} strokeWidth={2} aria-hidden />
                Filters
                {currentActiveFilterCount > 0 && (
                  <span style={{ minWidth: 18, height: 18, borderRadius: 999, backgroundColor: "var(--accent)", color: "var(--accent-fg)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 850 }}>
                    {currentActiveFilterCount}
                  </span>
                )}
              </button>
            )}
            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{filtered.length} results{currentActiveFilterCount > 0 ? `, ${currentActiveFilterCount} filters active` : ""}</span>
          </div>
        </div>
      </section>

      <TrendingClassesRow isMobile={isMobile} />

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "260px minmax(0, 1fr)", gap: isMobile ? 14 : 24, alignItems: "start" }}>
        {!isMobile && (
          <ClassFilters
            filters={typedFilters}
            onChange={(key, value) => setFilter(key, value)}
            onReset={resetFilters}
            activeCount={currentActiveFilterCount}
          />
        )}

        <main>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{filtered.length} matching classes</span>
            <select value={typedFilters.sort} onChange={(event) => setFilter("sort", event.target.value)} style={{ backgroundColor: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--border-light)", borderRadius: 10, padding: "9px 12px", fontSize: 13 }}>
              <option value="newest">Newest first</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most popular</option>
              <option value="rating">Top rated</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="No classes found" description="Try changing your filters or search query." icon={<Search size={26} strokeWidth={1.8} />} action={{ label: "Clear filters", onClick: resetFilters }} />
          ) : (
            <ClassGrid classes={filtered} />
          )}
        </main>
      </div>
    </PageShell>
  );
}
