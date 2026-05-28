"use client";

import { Search, SlidersHorizontal } from "lucide-react";
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

const SUBJECTS = ["", "Math", "Physics", "Chemistry", "Biology", "English", "Arabic", "Computer Science"];
const CURRICULA = ["", "NATIONAL", "IGCSE", "AMERICAN", "IB", "FRENCH", "STEM"];
const TYPES = ["", "online", "inperson", "both"];
const CITIES = ["", "Cairo", "Alexandria", "Giza", "Mansoura", "Tanta", "Zagazig", "Ismailia"];
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

export function ClassFilterControls({
  filters,
  onChange,
}: {
  filters: ClassFilterState;
  onChange: (key: keyof ClassFilterState, value: string) => void;
}) {
  const { t } = useI18n();
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
    <div style={{ display: "grid", gap: 12 }}>
      <label style={{ position: "relative" }}>
        <span style={{ position: "absolute", insetInlineStart: 11, top: 12, color: "var(--text-muted)", display: "inline-flex" }}>
          <Search size={15} strokeWidth={1.8} aria-hidden />
        </span>
        <input value={filters.q} onChange={(event) => onChange("q", event.target.value)} placeholder={t("classes.filter.search")} style={{ ...control, paddingInlineStart: 34 }} />
      </label>

      <FilterGroup title={t("classes.filter.subject")}>
        <select value={filters.subject} onChange={(event) => onChange("subject", event.target.value)} style={control}>
          {SUBJECTS.map((subject) => <option key={subject || "all"} value={subject}>{subject || t("classes.filter.allSubjects")}</option>)}
        </select>
      </FilterGroup>

      <FilterGroup title={t("classes.filter.priceRange")}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <input value={filters.minPrice} onChange={(event) => onChange("minPrice", event.target.value)} placeholder="Min EGP" inputMode="numeric" style={control} />
          <input value={filters.maxPrice} onChange={(event) => onChange("maxPrice", event.target.value)} placeholder={t("classes.filter.maxPrice")} inputMode="numeric" style={control} />
        </div>
      </FilterGroup>

      <FilterGroup title={t("classes.filter.curriculum")}>
        <select value={filters.curriculum} onChange={(event) => onChange("curriculum", event.target.value)} style={control}>
          {CURRICULA.map((curriculum) => <option key={curriculum || "all"} value={curriculum}>{curriculum || t("classes.filter.allCurricula")}</option>)}
        </select>
      </FilterGroup>

      <FilterGroup title={t("classes.filter.format")}>
        <select value={filters.type} onChange={(event) => onChange("type", event.target.value)} style={control}>
          {TYPES.map((type) => <option key={type || "all"} value={type}>{type ? type.replace("inperson", "In-person").replace("online", "Online").replace("both", "Both") : t("classes.filter.anyFormat")}</option>)}
        </select>
      </FilterGroup>

      <FilterGroup title={t("classes.filter.city")}>
        <select value={filters.city} onChange={(event) => onChange("city", event.target.value)} style={control}>
          {CITIES.map((city) => <option key={city || "all"} value={city}>{city || "All cities"}</option>)}
        </select>
      </FilterGroup>

      <FilterGroup title={t("classes.filter.rating")}>
        <select value={filters.minRating} onChange={(event) => onChange("minRating", event.target.value)} style={control}>
          {RATINGS.map((rating) => <option key={rating || "any"} value={rating}>{rating ? t("classes.filter.starsPlus", { rating }) : t("classes.filter.anyRating")}</option>)}
        </select>
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
    <aside style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 18, padding: "1rem", position: "sticky", top: 88 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--text)", fontWeight: 850 }}>
          <SlidersHorizontal size={17} strokeWidth={2} aria-hidden /> {t("classes.filters")}
          {activeCount > 0 && <span style={{ backgroundColor: "var(--accent)", color: "var(--accent-fg)", borderRadius: 999, minWidth: 20, height: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>{activeCount}</span>}
        </span>
        {activeCount > 0 && <button type="button" onClick={onReset} style={{ background: "transparent", border: 0, color: "var(--accent)", cursor: "pointer", fontSize: 12, fontWeight: 800 }}>{t("common.clearAll")}</button>}
      </div>

      <ClassFilterControls filters={filters} onChange={onChange} />
    </aside>
  );
}
