import CoursatyLogo from "@/components/ui/CoursatyLogo";
import { ErrorStateCard, LoadingStateCard, NotFoundStateCard } from "@/components/ui/GlobalStateCards";

const captions = [
  ["Loading state", "Brand moment to skeleton geometry"],
  ["Error state", "Clear message and recovery action"],
  ["Not found state", "Helpful guidance to classes and home"],
] as const;

export default function GlobalStatesPage() {
  return (
    <main style={{ minHeight: "100vh", padding: "1.25rem", background: "var(--bg)", color: "var(--text)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <CoursatyLogo compact />
          <span style={{ width: 1, height: 28, background: "var(--border)" }} />
          <span>
            <strong style={{ display: "block", color: "var(--text)", fontFamily: "Georgia, serif", fontSize: 14 }}>Global states</strong>
            <small style={{ color: "var(--text-muted)", fontSize: 10 }}>Consistent. Calm. Confident.</small>
          </span>
        </div>

        <div className="global-state-grid">
          <LoadingStateCard compact />
          <ErrorStateCard compact />
          <NotFoundStateCard compact />
        </div>

        <div className="global-state-caption-grid">
          {captions.map(([title, description], index) => (
            <div key={title} style={{ display: "flex", gap: 9, alignItems: "center" }}>
              <span style={{ display: "grid", width: 30, height: 30, placeItems: "center", color: "var(--accent)", background: "var(--accent-bg)", border: "1px solid var(--accent-border)", borderRadius: "50%", fontSize: 10, fontWeight: 850 }}>
                {index === 0 ? "..." : index === 1 ? "!" : "404"}
              </span>
              <span>
                <strong style={{ display: "block", color: "var(--text)", fontSize: 11, textTransform: "uppercase" }}>{title}</strong>
                <small style={{ color: "var(--text-muted)", fontSize: 9 }}>{description}</small>
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
