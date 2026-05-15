"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SUBJECTS = ["Math", "Physics", "Chemistry", "Biology", "English", "Arabic", "History", "Geography", "CS"];

const CURRICULA = [
  { value: "NATIONAL",  label: "National (Thanaweya Amma)" },
  { value: "IGCSE",     label: "IGCSE / British" },
  { value: "AMERICAN",  label: "American / SAT / ACT" },
  { value: "IB",        label: "IB (International Baccalaureate)" },
  { value: "FRENCH",    label: "French System" },
  { value: "STEM",      label: "STEM Schools" },
  { value: "OTHER",     label: "Other" },
];

const GRADES = [
  "Grade 7", "Grade 8", "Grade 9",
  "Grade 10", "Grade 11", "Grade 12",
  "Thanaweya Amma", "IGCSE", "AS Level", "A Level",
  "ACT", "SAT", "Mixed / All levels",
];

const FORMATS = [
  { value: "IN_PERSON", label: "In-Person" },
  { value: "ONLINE",    label: "Online" },
  { value: "HYBRID",    label: "Hybrid (both)" },
];

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
    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase" as const, letterSpacing: 1, marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: "1px solid var(--text)" }}>
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
    if (!form.title.trim()) return setError("Title is required.");
    if (!form.subject.trim()) return setError("Subject is required.");
    if (!form.priceEgp) return setError("Price is required (use 0 for free).");

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
    if (!res.ok) { setError(data.error ?? "Something went wrong."); setLoading(false); return; }
    router.push("/dashboard");
  }

  const focusInput = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = "var(--accent)";
    e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)";
  };
  const blurInput = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = "var(--text-secondary)";
    e.target.style.boxShadow = "none";
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-card)", fontFamily: "system-ui, sans-serif", padding: "2rem", position: "relative", overflow: "hidden" }}>
      {/* Background orbs */}
      <div style={{ position: "absolute", top: "-5%", right: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", left: "-5%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 660, margin: "0 auto 1.5rem", position: "relative", zIndex: 1 }}>
        <a href="/dashboard" style={{ color: "var(--text-muted)", fontSize: 14, textDecoration: "none" }}>
          ← Back to dashboard
        </a>
      </div>

      <div style={{ maxWidth: 660, margin: "0 auto", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 20, padding: "2rem", position: "relative", zIndex: 1, boxShadow: "0 8px 40px rgba(0,0,0,0.3)" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--bg-alt)", marginBottom: "0.4rem", letterSpacing: -0.5 }}>
            Create a New Class
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
            Fill in the details below. You can edit them later from your dashboard.
          </p>
        </div>

        <SectionTitle>Basic Information</SectionTitle>

        <div style={{ marginBottom: "1.25rem" }}>
          <FieldLabel>Class Title *</FieldLabel>
          <input style={inputStyle} placeholder="e.g. Physics - Mechanics and Waves (Grade 11)" value={form.title} onChange={e => update("title", e.target.value)} onFocus={focusInput} onBlur={blurInput} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <FieldLabel>Subject *</FieldLabel>
            <select style={selectStyle} value={form.subject} onChange={e => update("subject", e.target.value)} onFocus={focusInput} onBlur={blurInput}>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <FieldLabel>Price (EGP) *</FieldLabel>
            <input style={inputStyle} type="number" placeholder="e.g. 300 (or 0 for free)" value={form.priceEgp} onChange={e => update("priceEgp", e.target.value)} onFocus={focusInput} onBlur={blurInput} />
          </div>
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
          <FieldLabel>Description</FieldLabel>
          <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" as const }} placeholder="What will students learn? What topics are covered?" value={form.description} onChange={e => update("description", e.target.value)} onFocus={focusInput} onBlur={blurInput} />
        </div>

        <SectionTitle>Curriculum and Level</SectionTitle>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <FieldLabel>Curriculum / System</FieldLabel>
            <select style={selectStyle} value={form.curriculum} onChange={e => update("curriculum", e.target.value)} onFocus={focusInput} onBlur={blurInput}>
              {CURRICULA.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <FieldLabel>Grade / Level</FieldLabel>
            <select style={selectStyle} value={form.gradeLevel} onChange={e => update("gradeLevel", e.target.value)} onFocus={focusInput} onBlur={blurInput}>
              <option value="">Select grade</option>
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <SectionTitle>Format and Language</SectionTitle>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <FieldLabel>Class Format</FieldLabel>
            <select style={selectStyle} value={form.format} onChange={e => update("format", e.target.value)} onFocus={focusInput} onBlur={blurInput}>
              {FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <FieldLabel>Teaching Language</FieldLabel>
            <select style={selectStyle} value={form.language} onChange={e => update("language", e.target.value)} onFocus={focusInput} onBlur={blurInput}>
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <SectionTitle>Location and Schedule</SectionTitle>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <FieldLabel>Location / Area</FieldLabel>
            <input style={inputStyle} placeholder="e.g. Nasr City, Cairo" value={form.location} onChange={e => update("location", e.target.value)} onFocus={focusInput} onBlur={blurInput} />
          </div>
          <div>
            <FieldLabel>Max Students</FieldLabel>
            <input style={inputStyle} type="number" placeholder="e.g. 15" value={form.capacity} onChange={e => update("capacity", e.target.value)} onFocus={focusInput} onBlur={blurInput} />
          </div>
        </div>

        <div style={{ marginBottom: "1.75rem" }}>
          <FieldLabel>Schedule</FieldLabel>
          <input style={inputStyle} placeholder="e.g. Saturday and Monday, 5:00 PM" value={form.schedule} onChange={e => update("schedule", e.target.value)} onFocus={focusInput} onBlur={blurInput} />
        </div>

        {error && (
          <div style={{ backgroundColor: "var(--bg-card)", color: "var(--error-border)", border: "1px solid rgba(163,48,40,0.25)", borderRadius: 10, padding: "0.75rem 1rem", fontSize: 14, marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: 8 }}>
            <span>⚠</span> {error}
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
          {loading ? "Creating class..." : "Create Class →"}
        </button>
      </div>
    </div>
  );
}