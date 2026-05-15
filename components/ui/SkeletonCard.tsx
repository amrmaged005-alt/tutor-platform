export default function SkeletonCard() {
  return (
    <div
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--text)",
        borderRadius: 20,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top accent bar */}
      <div className="skeleton" style={{ height: 4, borderRadius: 0 }} />

      <div style={{ padding: "20px 20px 0" }}>
        {/* Avatar + name row */}
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 16 }}>
          <div className="skeleton skeleton-circle" style={{ width: 64, height: 64, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton skeleton-text medium" style={{ marginBottom: 8 }} />
            <div className="skeleton skeleton-text short" style={{ marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 20, width: 70, borderRadius: 99 }} />
          </div>
        </div>

        {/* Rating row */}
        <div className="skeleton skeleton-text medium" style={{ marginBottom: 12 }} />

        {/* Tags */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {[60, 50, 70].map((w, i) => (
            <div key={i} className="skeleton" style={{ height: 22, width: w, borderRadius: 99 }} />
          ))}
        </div>

        {/* Bio */}
        <div className="skeleton skeleton-text long" style={{ marginBottom: 6 }} />
        <div className="skeleton skeleton-text medium" style={{ marginBottom: 16 }} />

        {/* Stats row */}
        <div style={{ display: "flex", gap: 16, paddingBottom: 16, borderBottom: "1px solid var(--text)" }}>
          <div className="skeleton" style={{ height: 14, width: 80, borderRadius: 6 }} />
          <div className="skeleton" style={{ height: 14, width: 80, borderRadius: 6 }} />
        </div>
      </div>

      {/* CTA row */}
      <div style={{ padding: "14px 20px 20px", display: "flex", gap: 8 }}>
        <div className="skeleton" style={{ flex: 1, height: 38, borderRadius: 10 }} />
        <div className="skeleton" style={{ flex: 1, height: 38, borderRadius: 10 }} />
      </div>
    </div>
  );
}