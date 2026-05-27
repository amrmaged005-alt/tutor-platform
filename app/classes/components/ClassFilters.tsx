"use client";

import { Search, SlidersHorizontal } from "lucide-react";

export type ClassFilterState = {
  search: string;
  subject: string;
  curriculum: string;
  format: string;
  maxPrice: string;
  city: string;
  minRating: string;
  sort: string;
};

const SUBJECTS = ["", "Math", "Physics", "Chemistry", "Biology", "English", "Arabic", "Computer Science"];
const CURRICULA = ["", "NATIONAL", "IGCSE", "AMERICAN", "IB", "FRENCH", "STEM"];
const FORMATS = ["", "IN_PERSON", "ONLINE", "HYBRID"];
const RATINGS = ["", "4.5", "4", "3"];

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details open style={{ borderTop: "1px solid var(--border-light)", paddingTop: 12 }}>
      <summary style={{ color: "var(--text)", fontSize: 13, fontWeight: 800, cursor: "pointer", listStyle: "none", marginBottom: 10 }}>
        {title}
      </summary>
      {children}
    </details>
  );
}

export default function ClassFilters({
  filters,
  onChange,
  onReset,
  activeCount,
}: {
  filters: ClassFilterState;
  onChange: (key: keyof ClassFilterState, value: string) => void;
  onReset: () => void;
  activeCount: number;
}) {
  const control: React.CSSProperties = {
    backgroundColor: "var(--bg-card)",
    color: "var(--text)",
    border: "1px solid var(--border-light)",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 13,
    fontFamily: "inherit",
    width: "100%",
    minHeight: 42,
  };

  return (
    <aside style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 18, padding: "1rem", position: "sticky", top: 88 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--text)", fontWeight: 850 }}>
          <SlidersHorizontal size={17} strokeWidth={2} aria-hidden /> Filters
          {activeCount > 0 && <span style={{ backgroundColor: "var(--accent)", color: "var(--accent-fg)", borderRadius: 999, minWidth: 20, height: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>{activeCount}</span>}
        </span>
        {activeCount > 0 && <button type="button" onClick={onReset} style={{ background: "transparent", border: 0, color: "var(--accent)", cursor: "pointer", fontSize: 12, fontWeight: 800 }}>Clear</button>}
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        <label style={{ position: "relative" }}>
          <span style={{ position: "absolute", insetInlineStart: 11, top: 12, color: "var(--text-muted)", display: "inline-flex" }}>
            <Search size={15} strokeWidth={1.8} aria-hidden />
          </span>
          <input value={filters.search} onChange={(event) => onChange("search", event.target.value)} placeholder="Search classes" style={{ ...control, paddingInlineStart: 34 }} />
        </label>

        <FilterGroup title="Subject">
          <select value={filters.subject} onChange={(event) => onChange("subject", event.target.value)} style={control}>
            {SUBJECTS.map((subject) => <option key={subject || "all"} value={subject}>{subject || "All subjects"}</option>)}
          </select>
        </FilterGroup>

        <FilterGroup title="Price range">
          <input value={filters.maxPrice} onChange={(event) => onChange("maxPrice", event.target.value)} placeholder="Max price (EGP)" inputMode="numeric" style={control} />
        </FilterGroup>

        <FilterGroup title="Curriculum">
          <select value={filters.curriculum} onChange={(event) => onChange("curriculum", event.target.value)} style={control}>
            {CURRICULA.map((curriculum) => <option key={curriculum || "all"} value={curriculum}>{curriculum || "All curricula"}</option>)}
          </select>
        </FilterGroup>

        <FilterGroup title="Format">
          <select value={filters.format} onChange={(event) => onChange("format", event.target.value)} style={control}>
            {FORMATS.map((format) => <option key={format || "all"} value={format}>{format ? format.replace("_", " ") : "Any format"}</option>)}
          </select>
        </FilterGroup>

        <FilterGroup title="City">
          <input value={filters.city} onChange={(event) => onChange("city", event.target.value)} placeholder="City" style={control} />
        </FilterGroup>

        <FilterGroup title="Rating">
          <select value={filters.minRating} onChange={(event) => onChange("minRating", event.target.value)} style={control}>
            {RATINGS.map((rating) => <option key={rating || "any"} value={rating}>{rating ? `${rating}+ stars` : "Any rating"}</option>)}
          </select>
        </FilterGroup>
      </div>
    </aside>
  );
}
