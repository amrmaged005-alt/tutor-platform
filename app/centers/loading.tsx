export default function CentersLoading() {
    return (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
            {/* Header skeleton */}
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                <div className="skeleton" style={{ height: 36, width: 280, margin: "0 auto 12px", borderRadius: 8 }} />
                <div className="skeleton" style={{ height: 16, width: 380, maxWidth: "90%", margin: "0 auto", borderRadius: 6 }} />
            </div>

            {/* Center cards grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="fade-in"
                        style={{
                            backgroundColor: "var(--bg-card)",
                            border: "1px solid var(--border-light)",
                            borderRadius: 20,
                            padding: "1.75rem",
                            animationDelay: `${i * 0.08}s`,
                            animationFillMode: "both",
                        }}
                    >
                        {/* Logo + name */}
                        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                            <div className="skeleton" style={{ width: 60, height: 60, borderRadius: 14, flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                                <div className="skeleton skeleton-text medium" />
                                <div className="skeleton skeleton-text short" style={{ height: 12 }} />
                            </div>
                        </div>
                        {/* Description */}
                        <div className="skeleton skeleton-text long" />
                        <div className="skeleton skeleton-text medium" />
                        {/* Footer row */}
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
                            <div className="skeleton" style={{ height: 14, width: 100, borderRadius: 6 }} />
                            <div className="skeleton" style={{ height: 34, width: 110, borderRadius: 10 }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
