"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useI18n } from "@/app/components/i18n";

export type ClassFilterState = {
  q: string;
  subject: string;
  curriculum: string;
  type: string;
  minPrice: string;
  maxPrice: string;
  city: string;
  minRating: string;
  sort: string;
};

const SUBJECTS = ["Math", "Physics", "Chemistry", "Biology", "English"];
const CURRICULA = ["NATIONAL", "IGCSE", "AMERICAN"];
const TYPES = [
  { value: "online", label: "Online" },
  { value: "inperson", label: "In person" },
];
const CITIES = ["Cairo", "Alexandria", "Giza"];
const RATINGS = ["4.5", "4"];

const subjectCounts: Record<string, number> = {
  Math: 28,
  Physics: 86,
  Chemistry: 44,
  Biology: 42,
  English: 37,
};

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details open style={{ borderTop: "1px solid var(--border-light)", paddingBlock: "10px 2px" }}>
      <summary style={{ color: "var(--text)", fontSize: 11, fontWeight: 800, cursor: "pointer", listStyle: "none", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span>{title}</span>
        <ChevronDown size={12} strokeWidth={2} aria-hidden />
      </summary>
      {children}
    </details>
  );
}

function CheckRow({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label style={{ display: "flex", minHeight: 21, alignItems: "center", gap: 7, color: "var(--text-secondary)", fontSize: 11, cursor: "pointer" }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ width: 12, height: 12, accentColor: "var(--accent)", margin: 0 }}
      />
      <span style={{ flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
      {count !== undefined && <span style={{ color: "var(--text-muted)", fontSize: 10 }}>{count}</span>}
    </label>
  );
}

export function ClassFilterControls({
  filters,
  onChange,
}: {
  filters: ClassFilterState;
  onChange: (key: keyof ClassFilterState, value: string) => void;
}) {
  const { t } = useI18n();
  const numberInput: React.CSSProperties = {
    backgroundColor: "var(--bg-card)",
    color: "var(--text)",
    border: "1px solid var(--border-light)",
    borderRadius: 7,
    padding: "7px 8px",
    fontSize: 11,
    fontFamily: "inherit",
    width: "100%",
    minHeight: 30,
  };

  return (
    <div style={{ display: "grid" }}>
      <FilterGroup title={t("classes.filter.subject")}>
        <div style={{ display: "grid", gap: 3 }}>
          {SUBJECTS.map((subject) => (
            <CheckRow key={subject} label={subject} count={subjectCounts[subject]} checked={filters.subject === subject} onChange={() => onChange("subject", filters.subject === subject ? "" : subject)} />
          ))}
          <button type="button" onClick={() => onChange("subject", "")} style={{ justifySelf: "start", marginTop: 2, border: 0, background: "transparent", color: "var(--accent)", fontSize: 10, fontWeight: 800, cursor: "pointer", padding: 0 }}>
            Show more
          </button>
        </div>
      </FilterGroup>

      <FilterGroup title={t("classes.filter.priceRange")}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          <input name="class-filter-min-price" aria-label="Minimum price in EGP" value={filters.minPrice} onChange={(event) => onChange("minPrice", event.target.value)} placeholder="Min" inputMode="numeric" style={numberInput} />
          <input name="class-filter-max-price" aria-label={t("classes.filter.maxPrice")} value={filters.maxPrice} onChange={(event) => onChange("maxPrice", event.target.value)} placeholder="Max" inputMode="numeric" style={numberInput} />
        </div>
      </FilterGroup>

      <FilterGroup title={t("classes.filter.curriculum")}>
        <div style={{ display: "grid", gap: 3 }}>
          {CURRICULA.map((curriculum) => (
            <CheckRow key={curriculum} label={curriculum} checked={filters.curriculum === curriculum} onChange={() => onChange("curriculum", filters.curriculum === curriculum ? "" : curriculum)} />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title={t("classes.filter.format")}>
        <div style={{ display: "grid", gap: 3 }}>
          {TYPES.map((type) => (
            <CheckRow key={type.value} label={type.label} checked={filters.type === type.value} onChange={() => onChange("type", filters.type === type.value ? "" : type.value)} />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title={t("classes.filter.city")}>
        <div style={{ display: "grid", gap: 3 }}>
          {CITIES.map((city) => (
            <CheckRow key={city} label={city} checked={filters.city === city} onChange={() => onChange("city", filters.city === city ? "" : city)} />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title={t("classes.filter.rating")}>
        <div style={{ display: "grid", gap: 3 }}>
          {RATINGS.map((rating) => (
            <CheckRow key={rating} label={t("classes.filter.starsPlus", { rating })} checked={filters.minRating === rating} onChange={() => onChange("minRating", filters.minRating === rating ? "" : rating)} />
          ))}
        </div>
      </FilterGroup>
    </div>
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
  const { t } = useI18n();
  return (
    <aside style={{ width: 172, backgroundColor: "var(--bg-card)", borderInlineEnd: "1px solid var(--border-light)", padding: "12px 12px 18px", position: "sticky", top: 64, minHeight: "calc(100vh - 64px)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text)", fontWeight: 850, fontSize: 12 }}>
          <SlidersHorizontal size={14} strokeWidth={2} aria-hidden /> {t("classes.filters")}
          {activeCount > 0 && <span style={{ backgroundColor: "var(--accent)", color: "var(--accent-fg)", borderRadius: 999, minWidth: 20, height: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>{activeCount}</span>}
        </span>
        <button type="button" onClick={onReset} style={{ background: "transparent", border: 0, color: activeCount > 0 ? "var(--accent)" : "var(--text-muted)", cursor: "pointer", fontSize: 10, fontWeight: 800 }}>
          {t("common.clearAll")}
        </button>
      </div>

      <ClassFilterControls filters={filters} onChange={onChange} />

      <div style={{ marginTop: 14, padding: 12, border: "1px solid var(--border-light)", borderRadius: 10, background: "var(--bg-alt)" }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, display: "grid", placeItems: "center", color: "var(--accent)", background: "var(--accent-bg)", marginBottom: 8 }}>?</div>
        <div style={{ color: "var(--text)", fontSize: 11, fontWeight: 800, marginBottom: 3 }}>Active filters</div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          <span style={{ borderRadius: 999, background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-muted)", fontSize: 10, padding: "3px 7px" }}>Mathematics</span>
          <span style={{ borderRadius: 999, background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-muted)", fontSize: 10, padding: "3px 7px" }}>Online</span>
        </div>
      </div>
    </aside>
  );
}
