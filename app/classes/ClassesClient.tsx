"use client";

import { useMemo } from "react";
import { Search } from "lucide-react";
import PageShell from "../../components/ui/PageShell";
import EmptyState from "../../components/ui/EmptyState";
import SectionHeader from "../../components/ui/SectionHeader";
import { useFilterParams } from "../hooks/useFilterParams";
import { useIsMobile } from "../hooks/useIsMobile";
import ClassFilters, { type ClassFilterState } from "./components/ClassFilters";
import ClassCard from "./components/ClassCard";
import ClassGrid from "./components/ClassGrid";
import type { ClassCardData } from "./components/ClassCard";

const DEFAULT_FILTERS: ClassFilterState = {
  search: "",
  subject: "",
  curriculum: "",
  format: "",
  maxPrice: "",
  city: "",
  minRating: "",
  sort: "newest",
};
function matchesText(cls: ClassCardData, query: string) {
  const haystack = [cls.title, cls.subject, cls.description, cls.city, cls.location, cls.owner?.fullName, cls.owner?.name, cls.center?.name]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}
export default function ClassesClient({ classes }: { classes: ClassCardData[] }) {
  const isMobile = useIsMobile();
  const { filters, setFilter, resetFilters } = useFilterParams(DEFAULT_FILTERS);
  const typedFilters = filters as ClassFilterState;

  const filtered = useMemo(() => {
    let result = classes.filter((cls) => {
      const price = cls.priceEgp ?? 0;
      const rating = cls.avgRating ?? 0;
      if (typedFilters.search && !matchesText(cls, typedFilters.search)) return false;
      if (typedFilters.subject && cls.subject !== typedFilters.subject) return false;
      if (typedFilters.curriculum && cls.curriculum !== typedFilters.curriculum) return false;
      if (typedFilters.format && cls.format !== typedFilters.format) return false;
      if (typedFilters.city && !(cls.city ?? "").toLowerCase().includes(typedFilters.city.toLowerCase())) return false;
      if (typedFilters.maxPrice && price > Number(typedFilters.maxPrice)) return false;
      if (typedFilters.minRating && rating < Number(typedFilters.minRating)) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      if (typedFilters.sort === "price_asc") return (a.priceEgp ?? 0) - (b.priceEgp ?? 0);
      if (typedFilters.sort === "price_desc") return (b.priceEgp ?? 0) - (a.priceEgp ?? 0);
      if (typedFilters.sort === "popular") return (b.bookingsCount ?? 0) - (a.bookingsCount ?? 0);
      if (typedFilters.sort === "rating") return (b.avgRating ?? 0) - (a.avgRating ?? 0);
      return 0;
    });

    return result;
  }, [classes, typedFilters]);

  const activeFilterCount = Object.entries(typedFilters).filter(([key, value]) => key !== "sort" && Boolean(value)).length;
  const trending = useMemo(() => [...classes].sort((a, b) => (b.bookingsCount ?? 0) - (a.bookingsCount ?? 0)).slice(0, 6), [classes]);
  return (
    <PageShell>
      <section style={{ marginBottom: isMobile ? "1rem" : "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div>
            <span style={{ color: "var(--accent)", fontSize: 12, fontWeight: 800, textTransform: "uppercase" }}>Browse</span>
            <h1 style={{ color: "var(--text)", fontSize: "clamp(1.5rem, 4vw, 2.25rem)", margin: "0.25rem 0 0.35rem", fontWeight: 900 }}>Classes</h1>
            <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 14 }}>{classes.length} classes across subjects, curricula, cities, and formats.</p>
          </div>
          <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{filtered.length} results{activeFilterCount > 0 ? `, ${activeFilterCount} filters active` : ""}</span>
        </div>
      </section>

      {trending.length > 0 && (
        <section style={{ marginBottom: isMobile ? "1.25rem" : "1.75rem" }}>
          <SectionHeader title="Trending This Week" subtitle="Popular with students right now" badge="Trending" badgeColor="var(--rating)" />
          <div style={{ display: "flex", overflowX: "auto", gap: 12, paddingBottom: 4 }}>
            {trending.map((cls, index) => (
              <div key={cls.id} style={{ minWidth: isMobile ? 156 : 240, maxWidth: isMobile ? 180 : 260 }}>
                <ClassCard cls={cls} index={index} compact />
              </div>
            ))}
          </div>
        </section>
      )}

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "260px minmax(0, 1fr)", gap: isMobile ? 14 : 24, alignItems: "start" }}>
        <ClassFilters
          filters={typedFilters}
          onChange={(key, value) => setFilter(key, value)}
          onReset={resetFilters}
          activeCount={activeFilterCount}
        />

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
