"use client";

import Link from "next/link";
import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: { label: string; href?: string; onClick?: () => void };
  secondary?: { label: string; href?: string; onClick?: () => void };
  compact?: boolean;
}

function DefaultIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default function EmptyState({
  title,
  description,
  icon,
  action,
  secondary,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        borderRadius: 16,
        padding: compact ? "2.25rem 1.5rem" : "3.5rem 2rem",
        textAlign: "center",
        boxShadow: "var(--shadow-xs)",
      }}
    >
      <div
        style={{
          width: compact ? 48 : 56,
          height: compact ? 48 : 56,
          borderRadius: 14,
          margin: "0 auto 1.25rem",
          backgroundColor: "var(--accent-bg)",
          border: "1px solid var(--accent-border)",
          color: "var(--accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-hidden
      >
        {icon ?? <DefaultIcon />}
      </div>

      <h3
        style={{
          color: "var(--text)",
          fontWeight: 700,
          fontSize: compact ? 16 : 18,
          letterSpacing: "-0.015em",
          margin: 0,
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: 14,
            lineHeight: 1.6,
            margin: "0.5rem auto 0",
            maxWidth: 380,
          }}
        >
          {description}
        </p>
      )}

      {(action || secondary) && (
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            justifyContent: "center",
            marginTop: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          {action && (
            action.href ? (
              <Link href={action.href} className="btn-primary">
                {action.label}
              </Link>
            ) : (
              <button type="button" onClick={action.onClick} className="btn-primary">
                {action.label}
              </button>
            )
          )}
          {secondary && (
            secondary.href ? (
              <Link href={secondary.href} className="btn-secondary">
                {secondary.label}
              </Link>
            ) : (
              <button type="button" onClick={secondary.onClick} className="btn-secondary">
                {secondary.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
