"use client";

import { useCallback, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import PageShell from "../../components/ui/PageShell";
import EmptyState from "../../components/ui/EmptyState";
import { useI18n } from "../components/i18n";
import { useFilterParams } from "../hooks/useFilterParams";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useIsMobile } from "../hooks/useIsMobile";
import ClassFilters, { type ClassFilterState } from "./components/ClassFilters";
import ClassFilterBottomSheet from "./components/ClassFilterBottomSheet";
import ClassGrid from "./components/ClassGrid";
import TrendingClassesRow from "./components/TrendingClassesRow";
import type { ClassCardData } from "./components/ClassCard";
import { DEFAULT_CLASS_FILTERS, filterClasses, getActiveClassFilterCount } from "./components/classFiltering";

export default function ClassesClient({ classes }: { classes: ClassCardData[] }) {
  const isMobile = useIsMobile();
  const { t } = useI18n();
  const { filters, setFilter, resetFilters } = useFilterParams(DEFAULT_CLASS_FILTERS);
  const typedFilters = filters as ClassFilterState;
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<ClassFilterState>(typedFilters);
  const [items, setItems] = useState(classes);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(classes.length >= 12);

  const filtered = useMemo(() => filterClasses(items, typedFilters), [items, typedFilters]);
  const draftResultCount = useMemo(() => filterClasses(items, draftFilters).length, [items, draftFilters]);
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

  const loadMore = useCallback(async () => {
    const nextPage = page + 1;
    const res = await fetch(`/api/classes?page=${nextPage}&limit=12`, { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    const nextItems = Array.isArray(data.items) ? data.items : [];
    setItems((current) => [...current, ...nextItems]);
    setPage(nextPage);
    setHasMore(Boolean(data.hasMore));
  }, [page]);

  const { sentinelRef, isLoading } = useInfiniteScroll(loadMore, hasMore);

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
        totalCount={items.length}
      />

      <section style={{ marginBottom: isMobile ? "1rem" : "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div>
            <span style={{ color: "var(--accent)", fontSize: 12, fontWeight: 800, textTransform: "uppercase" }}>{t("classes.kicker")}</span>
            <h1 style={{ color: "var(--text)", fontSize: "clamp(1.5rem, 4vw, 2.25rem)", margin: "0.25rem 0 0.35rem", fontWeight: 900 }}>{t("classes.title")}</h1>
            <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 14 }}>{t("classes.summary", { count: items.length })}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {isMobile && (
              <button type="button" onClick={openMobileFilters} style={{ display: "inline-flex", alignItems: "center", gap: 7, backgroundColor: currentActiveFilterCount > 0 ? "var(--accent-bg)" : "var(--bg-card)", border: `1px solid ${currentActiveFilterCount > 0 ? "var(--accent-border)" : "var(--border-light)"}`, color: currentActiveFilterCount > 0 ? "var(--accent)" : "var(--text)", borderRadius: 10, padding: "9px 12px", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
                <SlidersHorizontal size={15} strokeWidth={2} aria-hidden />
                {t("classes.filters")}
                {currentActiveFilterCount > 0 && (
                  <span style={{ minWidth: 18, height: 18, borderRadius: 999, backgroundColor: "var(--accent)", color: "var(--accent-fg)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 850 }}>
                    {currentActiveFilterCount}
                  </span>
                )}
              </button>
            )}
            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
              {currentActiveFilterCount > 0 ? t("classes.resultsWithFilters", { count: filtered.length, filters: currentActiveFilterCount }) : t("classes.results", { count: filtered.length })}
            </span>
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
            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{t("classes.matching", { count: filtered.length })}</span>
            <select value={typedFilters.sort} onChange={(event) => setFilter("sort", event.target.value)} style={{ backgroundColor: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--border-light)", borderRadius: 10, padding: "9px 12px", fontSize: 13 }}>
              <option value="newest">{t("classes.sort.newest")}</option>
              <option value="price_asc">{t("classes.sort.priceAsc")}</option>
              <option value="price_desc">{t("classes.sort.priceDesc")}</option>
              <option value="popular">{t("classes.sort.popular")}</option>
              <option value="rating">{t("classes.sort.rating")}</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState title={t("classes.empty.title")} description={t("classes.empty.desc")} icon={<Search size={26} strokeWidth={1.8} />} action={{ label: t("common.clearFilters"), onClick: resetFilters }} />
          ) : (
            <ClassGrid classes={filtered} />
          )}
          <div ref={sentinelRef} style={{ minHeight: 56, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13, marginTop: 18 }}>
            {isLoading ? <span style={{ width: 20, height: 20, border: "2px solid var(--border-light)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> : !hasMore && items.length > 0 ? "You've seen all classes" : null}
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </main>
      </div>
    </PageShell>
  );
}
