import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "var(--bg-card)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background orbs */}
      <div style={{ position: "absolute", top: "15%", left: "5%", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(239,68,68,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "15%", right: "5%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ textAlign: "center", position: "relative", zIndex: 1, maxWidth: 480 }}>
        {/* Big gradient number */}
        <div style={{
          fontSize: "clamp(5rem, 14vw, 9rem)",
          fontWeight: 900,
          background: "linear-gradient(135deg, var(--error), var(--error))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1,
          marginBottom: 16,
          display: "block",
        }}>
          403
        </div>

        {/* Lock icon */}
        <div style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          backgroundColor: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          margin: "0 auto 20px",
        }}>
          🔒
        </div>

        <h2 style={{ color: "var(--bg-alt)", fontWeight: 700, fontSize: "clamp(1.2rem, 3vw, 1.5rem)", margin: "0 0 12px" }}>
          Access Denied
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: 15, maxWidth: 380, margin: "0 auto 28px", lineHeight: 1.7 }}>
          You don&apos;t have permission to access this page. If you think this is a mistake, please contact support.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/"
            style={{
              background: "linear-gradient(135deg, var(--accent), var(--accent-hover))",
              color: "var(--accent-fg)",
              padding: "0.75rem 1.8rem",
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 4px 20px rgba(59,130,246,0.4)",
            }}
          >
            Go Home
          </Link>
          <Link
            href="/classes"
            style={{
              border: "1px solid var(--border-light)",
              color: "var(--text-muted)",
              padding: "0.75rem 1.8rem",
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 500,
              textDecoration: "none",
              backgroundColor: "rgba(30,41,59,0.5)",
            }}
          >
            Browse Classes
          </Link>
        </div>
      </div>
    </div>
  );
}
