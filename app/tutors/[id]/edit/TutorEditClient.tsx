"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useRef } from "react";

const SUBJECT_OPTIONS = [
  "Math", "Physics", "Chemistry", "Biology", "English",
  "Arabic", "History", "Geography", "French", "Computer Science",
  "Science", "Economics", "Accounting", "Business",
];

const SUBJECT_COLORS: Record<string, string> = {
  Math: "#3b82f6", Physics: "#8b5cf6", Chemistry: "#22c55e",
  Biology: "#10b981", English: "#f59e0b", Arabic: "#ef4444",
  History: "#f97316", Geography: "#06b6d4", French: "#a78bfa",
  "Computer Science": "#38bdf8", Science: "#34d399",
  Economics: "#fbbf24", Accounting: "#fb923c", Business: "#e879f9",
};

function subjectColor(s: string) {
  return SUBJECT_COLORS[s] ?? "#3b82f6";
}

interface TutorData {
  id: string;
  fullName: string;
  name: string;
  email: string;
  bio: string;
  phone: string;
  subjects: string[];
  center: { id: string; name: string } | null;
}

export default function TutorEditClient({
  tutor,
  updateAction,
}: {
  tutor: TutorData;
  updateAction: (formData: FormData) => Promise<void>;
}) {
  const [subjects, setSubjects] = useState<string[]>(tutor.subjects);
  const [subjectInput, setSubjectInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const displayName = tutor.fullName || tutor.name || "Your Profile";

  function addSubject(s: string) {
    const trimmed = s.trim();
    if (trimmed && !subjects.includes(trimmed)) {
      setSubjects([...subjects, trimmed]);
    }
    setSubjectInput("");
    setShowDropdown(false);
  }

  function removeSubject(s: string) {
    setSubjects(subjects.filter((x) => x !== s));
  }

  const filteredOptions = SUBJECT_OPTIONS.filter(
    (o) =>
      !subjects.includes(o) &&
      o.toLowerCase().includes(subjectInput.toLowerCase())
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    // Override subjects with our state
    fd.set("subjects", subjects.join(","));
    try {
      await updateAction(fd);
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = {
    width: "100%",
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    borderRadius: 10,
    padding: "11px 14px",
    color: "#f1f5f9",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    display: "block",
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 6,
    letterSpacing: 0.3,
  };

  const sectionAccent = {
    width: 4,
    height: 16,
    background: "linear-gradient(180deg,#3b82f6,transparent)",
    borderRadius: 2,
    display: "inline-block",
    marginRight: 8,
    verticalAlign: "middle",
  };

  // Completeness
  const fields = [
    !!tutor.fullName,
    !!tutor.bio,
    !!tutor.phone,
    tutor.subjects.length > 0,
  ];
  const pct = Math.round((fields.filter(Boolean).length / fields.length) * 100);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#f1f5f9",
      }}
    >
      {/* Hero */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)",
          borderBottom: "1px solid #334155",
          padding: "2.5rem 2rem",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(#ffffff06 1px, transparent 1px), linear-gradient(90deg, #ffffff06 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: "radial-gradient(circle, #3b82f620 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ maxWidth: 680, margin: "0 auto", position: "relative" }}>
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}
          >
            <Link
              href={"/tutors/" + tutor.id}
              style={{ color: "#64748b", fontSize: 13, textDecoration: "none" }}
            >
              ← Back to Profile
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            style={{ display: "flex", alignItems: "center", gap: 18 }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "radial-gradient(circle at 35% 35%, #60a5fa, #1d4ed8)",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 28,
                color: "#fff",
                boxShadow: "0 0 0 3px #1e293b, 0 0 0 6px #3b82f630",
              }}
            >
              {(displayName[0] || "T").toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "0 0 4px", letterSpacing: -0.5 }}>
                Edit Profile
              </h1>
              <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
                {tutor.email}
                {tutor.center && (
                  <span style={{ color: "#475569" }}> · {tutor.center.name}</span>
                )}
              </p>
            </div>
          </motion.div>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ marginTop: "1.5rem" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ color: "#64748b", fontSize: 12, fontWeight: 600 }}>Profile completeness</span>
              <span style={{ color: pct === 100 ? "#22c55e" : "#f59e0b", fontSize: 12, fontWeight: 700 }}>{pct}%</span>
            </div>
            <div style={{ height: 4, backgroundColor: "#334155", borderRadius: 99, overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                style={{
                  height: "100%",
                  borderRadius: 99,
                  background: pct === 100
                    ? "linear-gradient(90deg,#22c55e,#4ade80)"
                    : "linear-gradient(90deg,#f59e0b,#fbbf24)",
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Form */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "2.5rem 1.5rem 5rem" }}>
        <form ref={formRef} onSubmit={handleSubmit}>

          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 18,
              padding: "1.75rem",
              marginBottom: "1.5rem",
            }}
          >
            <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 1.25rem", color: "#f1f5f9", display: "flex", alignItems: "center" }}>
              <span style={sectionAccent} />
              Basic Info
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>FULL NAME</label>
                <input
                  name="fullName"
                  defaultValue={tutor.fullName}
                  placeholder="e.g. Ahmed Hassan"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#334155")}
                />
              </div>
              <div>
                <label style={labelStyle}>WHATSAPP PHONE</label>
                <input
                  name="phone"
                  defaultValue={tutor.phone}
                  placeholder="e.g. +201012345678"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#334155")}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>EMAIL <span style={{ color: "#475569", fontWeight: 400 }}>(read-only)</span></label>
              <input
                value={tutor.email}
                disabled
                style={{ ...inputStyle, color: "#475569", cursor: "not-allowed" }}
              />
            </div>
          </motion.div>

          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 18,
              padding: "1.75rem",
              marginBottom: "1.5rem",
            }}
          >
            <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 1.25rem", color: "#f1f5f9", display: "flex", alignItems: "center" }}>
              <span style={sectionAccent} />
              About You
            </h2>
            <label style={labelStyle}>BIO</label>
            <textarea
              name="bio"
              defaultValue={tutor.bio}
              placeholder="Tell students about your background, teaching style, and experience..."
              rows={5}
              style={{
                ...inputStyle,
                resize: "vertical" as const,
                lineHeight: 1.7,
                minHeight: 120,
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.target.style.borderColor = "#334155")}
            />
            <div style={{ color: "#475569", fontSize: 12, marginTop: 5 }}>
              A good bio helps students trust you. Aim for 2–4 sentences.
            </div>
          </motion.div>

          {/* Subjects */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 18,
              padding: "1.75rem",
              marginBottom: "2rem",
            }}
          >
            <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 1.25rem", color: "#f1f5f9", display: "flex", alignItems: "center" }}>
              <span style={sectionAccent} />
              Subjects You Teach
            </h2>

            {/* Selected subjects */}
            {subjects.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginBottom: 14 }}>
                {subjects.map((s) => (
                  <motion.span
                    key={s}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    style={{
                      backgroundColor: `${subjectColor(s)}18`,
                      border: `1px solid ${subjectColor(s)}40`,
                      color: subjectColor(s),
                      borderRadius: 8,
                      padding: "5px 12px",
                      fontSize: 13,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => removeSubject(s)}
                      style={{
                        background: "none",
                        border: "none",
                        color: subjectColor(s),
                        cursor: "pointer",
                        padding: 0,
                        fontSize: 14,
                        lineHeight: 1,
                        opacity: 0.7,
                      }}
                    >
                      ×
                    </button>
                  </motion.span>
                ))}
              </div>
            )}

            {/* Subject input with dropdown */}
            <div style={{ position: "relative" }}>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  placeholder="Type to search or add a subject..."
                  value={subjectInput}
                  onChange={(e) => {
                    setSubjectInput(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (subjectInput.trim()) addSubject(subjectInput);
                    }
                  }}
                  style={{ ...inputStyle, paddingRight: 90 }}
                />
                {subjectInput.trim() && (
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); addSubject(subjectInput); }}
                    style={{
                      position: "absolute",
                      right: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      backgroundColor: "#3b82f6",
                      color: "white",
                      border: "none",
                      borderRadius: 7,
                      padding: "5px 12px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Add
                  </button>
                )}
              </div>

              {/* Dropdown */}
              {showDropdown && filteredOptions.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: 0,
                    right: 0,
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: 12,
                    overflow: "hidden",
                    zIndex: 50,
                    boxShadow: "0 8px 32px #00000060",
                  }}
                >
                  {filteredOptions.slice(0, 8).map((o) => (
                    <button
                      key={o}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); addSubject(o); }}
                      style={{
                        width: "100%",
                        textAlign: "left" as const,
                        background: "none",
                        border: "none",
                        borderBottom: "1px solid #334155",
                        padding: "10px 16px",
                        color: "#f1f5f9",
                        fontSize: 14,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: subjectColor(o),
                          flexShrink: 0,
                        }}
                      />
                      {o}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ color: "#475569", fontSize: 12, marginTop: 8 }}>
              Pick from suggestions or type and press Enter to add a custom subject.
            </div>

            {/* Hidden input carrying subjects to formData */}
            <input type="hidden" name="subjects" value={subjects.join(",")} />
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            style={{ display: "flex", gap: 12, flexWrap: "wrap" as const }}
          >
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1,
                minWidth: 160,
                background: saving ? "#1e3a5f" : "linear-gradient(135deg,#3b82f6,#1d4ed8)",
                color: "white",
                border: "none",
                borderRadius: 12,
                padding: "14px 24px",
                fontSize: 15,
                fontWeight: 700,
                cursor: saving ? "wait" : "pointer",
                boxShadow: saving ? "none" : "0 4px 16px #3b82f640",
                transition: "all 0.2s",
              }}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <Link
              href={"/tutors/" + tutor.id}
              style={{
                flex: 1,
                minWidth: 120,
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                color: "#94a3b8",
                borderRadius: 12,
                padding: "14px 24px",
                fontSize: 15,
                fontWeight: 600,
                textDecoration: "none",
                textAlign: "center" as const,
                display: "block",
              }}
            >
              Cancel
            </Link>
          </motion.div>
        </form>
      </div>
    </div>
  );
}