"use client";

import { Search } from "lucide-react";

export type ClassFilterState = {
  search: string;
  subject: string;
  curriculum: string;
  format: string;
  maxPrice: string;
  city: string;
};

const SUBJECTS = ["", "Math", "Physics", "Chemistry", "Biology", "English", "Arabic", "Computer Science"];
const CURRICULA = ["", "NATIONAL", "IGCSE", "AMERICAN", "IB", "FRENCH", "STEM"];
const FORMATS = ["", "IN_PERSON", "ONLINE", "HYBRID"];

export default function ClassFilters({
  filters,
  onChange,
  onReset,
}: {
  filters: ClassFilterState;
  onChange: (key: keyof ClassFilterState, value: string) => void;
  onReset: () => void;
}) {
  const input: React.CSSProperties = {
    backgroundColor: "var(--bg-card)",
    color: "var(--text)",
    border: "1px solid var(--border-light)",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 13,
    fontFamily: "inherit",
    width: "100%",
  };

  return (
    <section style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 18, padding: "1rem", marginBottom: "1.25rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
        <label style={{ position: "relative" }}>
          <span style={{ position: "absolute", insetInlineStart: 11, top: 11, color: "var(--text-muted)", display: "inline-flex" }}>
            <Search size={15} strokeWidth={1.8} aria-hidden />
          </span>
          <input
            value={filters.search}
            onChange={(e) => onChange("search", e.target.value)}
            placeholder="Search classes"
            style={{ ...input, paddingInlineStart: 34 }}
          />
        </label>
        <select value={filters.subject} onChange={(e) => onChange("subject", e.target.value)} style={input}>
          {SUBJECTS.map((subject) => <option key={subject || "all"} value={subject}>{subject || "All subjects"}</option>)}
        </select>
        <select value={filters.curriculum} onChange={(e) => onChange("curriculum", e.target.value)} style={input}>
          {CURRICULA.map((curriculum) => <option key={curriculum || "all"} value={curriculum}>{curriculum || "All curricula"}</option>)}
        </select>
        <select value={filters.format} onChange={(e) => onChange("format", e.target.value)} style={input}>
          {FORMATS.map((format) => <option key={format || "all"} value={format}>{format ? format.replace("_", " ") : "Any format"}</option>)}
        </select>
        <input value={filters.city} onChange={(e) => onChange("city", e.target.value)} placeholder="City" style={input} />
        <input value={filters.maxPrice} onChange={(e) => onChange("maxPrice", e.target.value)} placeholder="Max price" inputMode="numeric" style={input} />
      </div>
      <button type="button" onClick={onReset} className="btn-secondary" style={{ marginTop: 10, padding: "8px 12px", fontSize: 13 }}>
        Reset filters
      </button>
    </section>
  );
}
