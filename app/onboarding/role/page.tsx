"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, GraduationCap, Building2 } from "lucide-react";

const roles = [
  {
    id: "STUDENT",
    icon: BookOpen,
    title: "Student",
    description: "Browse and enroll in classes from verified tutors and learning centers.",
  },
  {
    id: "TUTOR",
    icon: GraduationCap,
    title: "Tutor",
    description: "Create and manage your own classes and grow your student base.",
  },
  {
    id: "CENTER_ADMIN",
    icon: Building2,
    title: "Center Admin",
    description: "Manage a learning center with multiple tutors and classes.",
  },
] as const;

export default function RoleOnboardingPage() {
  const router   = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleContinue() {
    if (!selected) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/me/role", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ role: selected }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-alt)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 520 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>
            Coursaty
          </div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text)", margin: "0.75rem 0 0.5rem" }}>
            How will you use Coursaty?
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>
            You can always change this later from your profile.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: "1.5rem" }}>
          {roles.map((role) => {
            const Icon    = role.icon;
            const active  = selected === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setSelected(role.id)}
                style={{
                  display:         "flex",
                  alignItems:      "center",
                  gap:             16,
                  padding:         "1rem 1.25rem",
                  backgroundColor: active ? "var(--accent-bg)" : "var(--bg-card)",
                  border:          `2px solid ${active ? "var(--accent)" : "var(--border-light)"}`,
                  borderRadius:    12,
                  cursor:          "pointer",
                  textAlign:       "left",
                  transition:      "border-color 0.15s, background 0.15s",
                }}
              >
                <div
                  style={{
                    width:           44,
                    height:          44,
                    borderRadius:    10,
                    backgroundColor: active ? "var(--accent)" : "var(--bg-alt)",
                    display:         "flex",
                    alignItems:      "center",
                    justifyContent:  "center",
                    flexShrink:      0,
                  }}
                >
                  <Icon size={20} color={active ? "var(--accent-fg)" : "var(--text-secondary)"} strokeWidth={1.8} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text)", fontSize: 15, marginBottom: 2 }}>
                    {role.title}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                    {role.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "var(--error-bg)",
              border:          "1px solid var(--error-border)",
              color:           "var(--error)",
              padding:         "0.75rem 1rem",
              borderRadius:    8,
              fontSize:        13,
              marginBottom:    "1rem",
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={!selected || loading}
          style={{
            width:           "100%",
            backgroundColor: !selected || loading ? "var(--accent-border)" : "var(--accent)",
            color:           "var(--accent-fg)",
            padding:         "12px",
            fontSize:        14,
            fontWeight:      700,
            border:          "none",
            borderRadius:    10,
            cursor:          !selected || loading ? "not-allowed" : "pointer",
            transition:      "background 0.15s",
          }}
        >
          {loading ? "Saving…" : "Continue →"}
        </button>
      </div>
    </div>
  );
}
