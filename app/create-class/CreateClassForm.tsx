"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { useI18n } from "@/app/components/i18n";

const SUBJECTS = ["Math", "Physics", "Chemistry", "Biology", "English", "Arabic", "History", "Geography", "CS"];

const CURRICULA = [
  { value: "NATIONAL",  labelKey: "createClass.curriculum.national" },
  { value: "IGCSE",     labelKey: "createClass.curriculum.igcse" },
  { value: "AMERICAN",  labelKey: "createClass.curriculum.american" },
  { value: "IB",        labelKey: "createClass.curriculum.ib" },
  { value: "FRENCH",    labelKey: "createClass.curriculum.french" },
  { value: "STEM",      labelKey: "createClass.curriculum.stem" },
  { value: "OTHER",     labelKey: "createClass.curriculum.other" },
] as const;

const GRADES = [
  "Grade 7", "Grade 8", "Grade 9",
  "Grade 10", "Grade 11", "Grade 12",
  "Thanaweya Amma", "IGCSE", "AS Level", "A Level",
  "ACT", "SAT", "Mixed / All levels",
];

const FORMATS = [
  { value: "IN_PERSON", labelKey: "createClass.format.inPerson" },
  { value: "ONLINE",    labelKey: "createClass.format.online" },
  { value: "HYBRID",    labelKey: "createClass.format.hybrid" },
] as const;

const LANGUAGES = ["Arabic", "English", "Both"];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>
      {children}
    </label>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase" as const, letterSpacing: 1, marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: "1px solid var(--border)" }}>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: "var(--bg-card)",
  color: "var(--text)",
  border: "1px solid var(--border-light)",
  borderRadius: 8,
  padding: "0.65rem 0.9rem",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer" };

export default function CreateClassForm() {
  const { t } = useI18n();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "", subject: "Math", curriculum: "NATIONAL",
    gradeLevel: "", format: "IN_PERSON", language: "Arabic",
    description: "", location: "", schedule: "", priceEgp: "", capacity: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setError("");
    if (!form.title.trim()) return setError(t("createClass.error.title"));
    if (!form.subject.trim()) return setError(t("createClass.error.subject"));
    if (!form.priceEgp) return setError(t("createClass.error.price"));

    setLoading(true);

    const res = await fetch("/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title, subject: form.subject, curriculum: form.curriculum,
        gradeLevel: form.gradeLevel || null, format: form.format, language: form.language,
        description: form.description, location: form.location, schedule: form.schedule,
        priceEgp: Number(form.priceEgp), capacity: form.capacity ? Number(form.capacity) : null,
      }),
    });

    const data = await res.json();
    if (!res.ok) { setError(data.error ?? t("signup.error.generic")); setLoading(false); return; }
    router.push("/dashboard");
  }

  const focusInput = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = "var(--accent)";
    e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)";
  };
  const blurInput = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = "var(--border-light)";
    e.target.style.boxShadow = "none";
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, var(--bg-alt) 0%, var(--bg) 100%)", padding: "2rem", position: "relative" }}>

      <div style={{ maxWidth: 660, margin: "0 auto 1.5rem", position: "relative", zIndex: 1 }}>
        <Link href="/dashboard" style={{ color: "var(--text-muted)", fontSize: 14, textDecoration: "none" }}>
          {t("createClass.back")}
        </Link>
      </div>

      <div style={{ maxWidth: 660, margin: "0 auto", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 20, padding: "2rem", position: "relative", zIndex: 1, boxShadow: "0 8px 40px rgba(0,0,0,0.3)" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)", marginBottom: "0.4rem", letterSpacing: -0.5 }}>
            {t("createClass.title")}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
            {t("createClass.subtitle")}
          </p>
        </div>

        <SectionTitle>{t("createClass.section.basic")}</SectionTitle>

        <div style={{ marginBottom: "1.25rem" }}>
          <FieldLabel>{t("createClass.field.title")}</FieldLabel>
          <input style={inputStyle} placeholder={t("createClass.placeholder.title")} value={form.title} onChange={e => update("title", e.target.value)} onFocus={focusInput} onBlur={blurInput} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <FieldLabel>{t("createClass.field.subject")}</FieldLabel>
            <select style={selectStyle} value={form.subject} onChange={e => update("subject", e.target.value)} onFocus={focusInput} onBlur={blurInput}>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <FieldLabel>{t("createClass.field.price")}</FieldLabel>
            <input style={inputStyle} type="number" placeholder={t("createClass.placeholder.price")} value={form.priceEgp} onChange={e => update("priceEgp", e.target.value)} onFocus={focusInput} onBlur={blurInput} />
          </div>
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
          <FieldLabel>{t("createClass.field.description")}</FieldLabel>
          <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" as const }} placeholder={t("createClass.placeholder.description")} value={form.description} onChange={e => update("description", e.target.value)} onFocus={focusInput} onBlur={blurInput} />
        </div>

        <SectionTitle>{t("createClass.section.curriculum")}</SectionTitle>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <FieldLabel>{t("createClass.field.curriculum")}</FieldLabel>
            <select style={selectStyle} value={form.curriculum} onChange={e => update("curriculum", e.target.value)} onFocus={focusInput} onBlur={blurInput}>
              {CURRICULA.map(c => <option key={c.value} value={c.value}>{t(c.labelKey)}</option>)}
            </select>
          </div>
          <div>
            <FieldLabel>{t("createClass.field.grade")}</FieldLabel>
            <select style={selectStyle} value={form.gradeLevel} onChange={e => update("gradeLevel", e.target.value)} onFocus={focusInput} onBlur={blurInput}>
              <option value="">{t("createClass.selectGrade")}</option>
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <SectionTitle>{t("createClass.section.format")}</SectionTitle>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <FieldLabel>{t("createClass.field.format")}</FieldLabel>
            <select style={selectStyle} value={form.format} onChange={e => update("format", e.target.value)} onFocus={focusInput} onBlur={blurInput}>
              {FORMATS.map(f => <option key={f.value} value={f.value}>{t(f.labelKey)}</option>)}
            </select>
          </div>
          <div>
            <FieldLabel>{t("createClass.field.language")}</FieldLabel>
            <select style={selectStyle} value={form.language} onChange={e => update("language", e.target.value)} onFocus={focusInput} onBlur={blurInput}>
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <SectionTitle>{t("createClass.section.location")}</SectionTitle>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <FieldLabel>{t("createClass.field.location")}</FieldLabel>
            <input style={inputStyle} placeholder={t("createClass.placeholder.location")} value={form.location} onChange={e => update("location", e.target.value)} onFocus={focusInput} onBlur={blurInput} />
          </div>
          <div>
            <FieldLabel>{t("createClass.field.maxStudents")}</FieldLabel>
            <input style={inputStyle} type="number" placeholder={t("createClass.placeholder.capacity")} value={form.capacity} onChange={e => update("capacity", e.target.value)} onFocus={focusInput} onBlur={blurInput} />
          </div>
        </div>

        <div style={{ marginBottom: "1.75rem" }}>
          <FieldLabel>{t("booking.schedule")}</FieldLabel>
          <input style={inputStyle} placeholder={t("createClass.placeholder.schedule")} value={form.schedule} onChange={e => update("schedule", e.target.value)} onFocus={focusInput} onBlur={blurInput} />
        </div>

        {error && (
          <div style={{ backgroundColor: "var(--bg-card)", color: "var(--error)", border: "1px solid rgba(163,48,40,0.25)", borderRadius: 10, padding: "0.75rem 1rem", fontSize: 14, marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: 8 }}>
            <AlertTriangle size={16} strokeWidth={1.8} aria-hidden="true" /> {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",
            background: loading ? "var(--accent-hover)" : "linear-gradient(135deg, var(--accent), var(--accent-hover))",
            color: "var(--accent-fg)",
            border: "none",
            borderRadius: 12,
            padding: "0.9rem",
            fontSize: 16,
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "0 4px 20px rgba(59,130,246,0.4)",
            transition: "opacity 0.2s",
            opacity: loading ? 0.8 : 1,
          }}
        >
          {loading ? t("createClass.creating") : t("dash.action.createClass")}
        </button>
      </div>
    </div>
  );
}

