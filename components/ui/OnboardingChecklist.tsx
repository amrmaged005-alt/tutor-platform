"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Circle, Zap, ChevronDown, ChevronUp } from "lucide-react";

interface OnboardingStep {
  id: string;
  label: string;
  complete: boolean;
  points: number;
}

interface OnboardingData {
  percentComplete: number;
  steps: OnboardingStep[];
  isComplete: boolean;
}

export default function OnboardingChecklist() {
  const [data, setData] = useState<OnboardingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/onboarding")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setData(d);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) return null;
  if (data.isComplete && collapsed) return null;

  const incomplete = data.steps.filter((s) => !s.complete);
  const complete = data.steps.filter((s) => s.complete);

  return (
    <div
      style={{
        borderRadius: 14,
        border: "1px solid var(--border-light)",
        backgroundColor: "var(--bg-card)",
        overflow: "hidden",
        marginBottom: "1.25rem",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "1rem 1.25rem",
          background: data.isComplete
            ? "linear-gradient(135deg, var(--success-bg), var(--bg-card))"
            : "linear-gradient(135deg, var(--accent-bg), var(--bg-card))",
          borderBottom: collapsed ? "none" : "1px solid var(--border-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          cursor: "pointer",
        }}
        onClick={() => setCollapsed((v) => !v)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Zap
            size={18}
            strokeWidth={1.8}
            style={{ color: data.isComplete ? "var(--success)" : "var(--accent)" }}
            aria-hidden
          />
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "var(--text)" }}>
              {data.isComplete ? "Profile complete! 🎉" : "Complete your profile"}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
              {data.isComplete
                ? "You've completed all steps."
                : `${incomplete.length} step${incomplete.length !== 1 ? "s" : ""} remaining`}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Progress ring */}
          <div style={{ position: "relative", width: 44, height: 44 }}>
            <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden>
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke="var(--border-light)"
                strokeWidth="4"
              />
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke={data.isComplete ? "var(--success)" : "var(--accent)"}
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 18}`}
                strokeDashoffset={`${2 * Math.PI * 18 * (1 - data.percentComplete / 100)}`}
                strokeLinecap="round"
                style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
              />
            </svg>
            <span
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                color: "var(--text)",
              }}
            >
              {data.percentComplete}%
            </span>
          </div>
          {collapsed
            ? <ChevronDown size={14} strokeWidth={2} style={{ color: "var(--text-muted)" }} aria-hidden />
            : <ChevronUp size={14} strokeWidth={2} style={{ color: "var(--text-muted)" }} aria-hidden />
          }
        </div>
      </div>

      {/* Steps */}
      {!collapsed && (
        <div style={{ padding: "0.5rem 0" }}>
          {/* Incomplete steps first */}
          {incomplete.map((step) => (
            <div
              key={step.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 1.25rem",
              }}
            >
              <Circle
                size={16}
                strokeWidth={1.5}
                style={{ color: "var(--border-light)", flexShrink: 0 }}
                aria-hidden
              />
              <span style={{ fontSize: 13, color: "var(--text)", flex: 1 }}>{step.label}</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--accent)",
                  backgroundColor: "var(--accent-bg)",
                  padding: "1px 7px",
                  borderRadius: 99,
                }}
              >
                +{step.points}pts
              </span>
            </div>
          ))}
          {/* Completed steps */}
          {complete.map((step) => (
            <div
              key={step.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 1.25rem",
                opacity: 0.55,
              }}
            >
              <CheckCircle
                size={16}
                strokeWidth={2}
                style={{ color: "var(--success)", flexShrink: 0 }}
                aria-hidden
              />
              <span
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  textDecoration: "line-through",
                  flex: 1,
                }}
              >
                {step.label}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--success)",
                  backgroundColor: "var(--success-bg)",
                  padding: "1px 7px",
                  borderRadius: 99,
                }}
              >
                +{step.points}pts
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
