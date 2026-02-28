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
    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#94a3b8", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>
      {children}
    </label>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", textTransform: "uppercase" as const, letterSpacing: 1, marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: "1px solid #1e3a5f" }}>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: "#0f172a",
  color: "#f1f5f9",
  border: "1px solid #334155",
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

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <div style={{ maxWidth: 660, margin: "0 auto 1.5rem" }}>
        <a href="/dashboard" style={{ color: "#64748b", fontSize: 14, textDecoration: "none" }}>
          Back to dashboard
        </a>
      </div>

      <div style={{ maxWidth: 660, margin: "0 auto", backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f8fafc", marginBottom: "0.25rem" }}>
          Create a New Class
        </h1>
        <p style={{ color: "#64748b", fontSize: 14, marginBottom: "2rem" }}>
          Fill in the details below. You can edit them later.
        </p>

        <SectionTitle>Basic Information</SectionTitle>

        <div style={{ marginBottom: "1.25rem" }}>
          <FieldLabel>Class Title *</FieldLabel>
          <input style={inputStyle} placeholder="e.g. Physics - Mechanics and Waves (Grade 11)" value={form.title} onChange={e => update("title", e.target.value)} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <FieldLabel>Subject *</FieldLabel>
            <select style={selectStyle} value={form.subject} onChange={e => update("subject", e.target.value)}>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <FieldLabel>Price (EGP) *</FieldLabel>
            <input style={inputStyle} type="number" placeholder="e.g. 300" value={form.priceEgp} onChange={e => update("priceEgp", e.target.value)} />
          </div>
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
          <FieldLabel>Description</FieldLabel>
          <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" as const }} placeholder="What will students learn? What topics are covered?" value={form.description} onChange={e => update("description", e.target.value)} />
        </div>

        <SectionTitle>Curriculum and Level</SectionTitle>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <FieldLabel>Curriculum / System</FieldLabel>
            <select style={selectStyle} value={form.curriculum} onChange={e => update("curriculum", e.target.value)}>
              {CURRICULA.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <FieldLabel>Grade / Level</FieldLabel>
            <select style={selectStyle} value={form.gradeLevel} onChange={e => update("gradeLevel", e.target.value)}>
              <option value="">Select grade</option>
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <SectionTitle>Format and Language</SectionTitle>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <FieldLabel>Class Format</FieldLabel>
            <select style={selectStyle} value={form.format} onChange={e => update("format", e.target.value)}>
              {FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <FieldLabel>Teaching Language</FieldLabel>
            <select style={selectStyle} value={form.language} onChange={e => update("language", e.target.value)}>
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <SectionTitle>Location and Schedule</SectionTitle>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <FieldLabel>Location / Area</FieldLabel>
            <input style={inputStyle} placeholder="e.g. Nasr City, Cairo" value={form.location} onChange={e => update("location", e.target.value)} />
          </div>
          <div>
            <FieldLabel>Max Students</FieldLabel>
            <input style={inputStyle} type="number" placeholder="e.g. 15" value={form.capacity} onChange={e => update("capacity", e.target.value)} />
          </div>
        </div>

        <div style={{ marginBottom: "1.75rem" }}>
          <FieldLabel>Schedule</FieldLabel>
          <input style={inputStyle} placeholder="e.g. Saturday and Monday, 5:00 PM" value={form.schedule} onChange={e => update("schedule", e.target.value)} />
        </div>

        {error && (
          <div style={{ backgroundColor: "#450a0a", color: "#fca5a5", border: "1px solid #7f1d1d", borderRadius: 8, padding: "0.75rem 1rem", fontSize: 14, marginBottom: "1.25rem" }}>
            {error}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", backgroundColor: loading ? "#1e40af" : "#3b82f6", color: "white", border: "none", borderRadius: 10, padding: "0.85rem", fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Creating class..." : "Create Class"}
        </button>
      </div>
    </div>
  );
}