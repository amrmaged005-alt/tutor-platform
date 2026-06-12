import Link from "next/link";
import { AlertCircle, BookOpen, Home, RotateCcw, Search } from "lucide-react";
import CoursatyLogo from "./CoursatyLogo";

const previewCard = {
  minHeight: 360,
  padding: "1.5rem",
  background: "var(--bg-card)",
  border: "1px solid var(--border-light)",
  borderRadius: "var(--radius-lg)",
  boxShadow: "var(--shadow-sm)",
} as const;

/* ── Loading State ─────────────────────────────────────────────── */
export function LoadingStateCard({ compact = false }: { compact?: boolean }) {
  return (
    <article
      style={{ ...previewCard, minHeight: compact ? 340 : 380 }}
      aria-label="Loading state preview"
    >
      <div style={{ display: "grid", minHeight: compact ? 296 : 336, placeItems: "center" }}>
        <div style={{ width: "100%", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
            <CoursatyLogo compact />
          </div>
          {/* Animated skeleton bars */}
          <div className="skeleton" style={{ width: "52%", height: 8, margin: "0 auto 5px", borderRadius: 4 }} />
          <div className="skeleton" style={{ width: "34%", height: 6, margin: "0 auto 24px", borderRadius: 4 }} />
          {/* Three column skeleton */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {[0, 1, 2].map((column) => (
              <div
                key={column}
                style={{
                  padding: "10px 8px",
                  border: "1px solid var(--border-light)",
                  borderRadius: 10,
                }}
              >
                <div className="skeleton" style={{ height: 48, marginBottom: 8, borderRadius: 6 }} />
                {[0, 1, 2, 3].map((line) => (
                  <div
                    key={line}
                    className="skeleton"
                    style={{
                      width: line === 2 ? "62%" : "100%",
                      height: 5,
                      marginBottom: 6,
                      borderRadius: 3,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

/* ── Error State ───────────────────────────────────────────────── */
export function ErrorStateCard({
  reset,
  compact = false,
}: {
  reset?: () => void;
  compact?: boolean;
}) {
  return (
    <article
      style={{
        ...previewCard,
        minHeight: compact ? 340 : 380,
        display: "grid",
        placeItems: "center",
        textAlign: "center",
      }}
      aria-label="Error state preview"
    >
      <div style={{ maxWidth: 280 }}>
        {/* Stacked icon: book + alert badge */}
        <span
          style={{
            position: "relative",
            display: "inline-grid",
            width: 76,
            height: 76,
            placeItems: "center",
            color: "var(--accent)",
            background: "var(--accent-bg)",
            borderRadius: "50%",
          }}
        >
          <BookOpen size={36} strokeWidth={1.3} aria-hidden />
          <AlertCircle
            size={22}
            fill="var(--error)"
            color="var(--bg-card)"
            strokeWidth={2}
            style={{ position: "absolute", insetInlineEnd: -2, insetBlockEnd: 4 }}
            aria-hidden
          />
        </span>

        <h2
          style={{
            margin: "18px 0 6px",
            color: "var(--text)",
            fontSize: "1.2rem",
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          Something went wrong
        </h2>
        <p
          style={{
            margin: "0 0 20px",
            color: "var(--text-muted)",
            fontSize: 13,
            lineHeight: 1.7,
          }}
        >
          We ran into a problem while processing your request. Please try again in a moment.
        </p>

        <button
          type="button"
          onClick={reset}
          className="btn-primary"
          style={{ minWidth: 140, padding: "9px 16px", fontSize: 13 }}
        >
          <RotateCcw size={14} aria-hidden />
          Try again
        </button>
        <div style={{ margin: "12px 0 8px", color: "var(--text-dim)", fontSize: 11 }}>or</div>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            color: "var(--accent)",
            fontSize: 12,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          <Home size={13} aria-hidden />
          Go home
        </Link>
      </div>
    </article>
  );
}

/* ── 404 Not Found State ───────────────────────────────────────── */
export function NotFoundStateCard({ compact = false }: { compact?: boolean }) {
  return (
    <article
      style={{
        ...previewCard,
        minHeight: compact ? 340 : 380,
        display: "grid",
        placeItems: "center",
        textAlign: "center",
      }}
      aria-label="Not found state preview"
    >
      <div style={{ maxWidth: 290 }}>
        {/* Big 404 */}
        <div
          style={{
            color: "var(--accent)",
            fontSize: compact ? 88 : 112,
            fontWeight: 850,
            letterSpacing: "-0.07em",
            lineHeight: 0.9,
            marginBottom: 12,
          }}
        >
          404
        </div>
        <h2
          style={{
            margin: "0 0 6px",
            color: "var(--text)",
            fontSize: "1.25rem",
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          Page not found
        </h2>
        <p
          style={{
            margin: "0 0 20px",
            color: "var(--text-muted)",
            fontSize: 13,
            lineHeight: 1.7,
          }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
          <Link
            href="/classes"
            className="btn-primary"
            style={{ minWidth: 160, padding: "9px 16px", fontSize: 13, textDecoration: "none" }}
          >
            <Search size={14} aria-hidden />
            Browse Classes
          </Link>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              color: "var(--accent)",
              fontSize: 12,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            <Home size={13} aria-hidden />
            Go home
          </Link>
        </div>
      </div>
    </article>
  );
}
