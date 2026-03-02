export default function TutorsLoading() {
    return (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
            {/* Header skeleton */}
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                <div className="skeleton" style={{ height: 36, width: 220, margin: "0 auto 12px", borderRadius: 8 }} />
                <div className="skeleton" style={{ height: 16, width: 360, maxWidth: "90%", margin: "0 auto", borderRadius: 6 }} />
            </div>

            {/* Search bar skeleton */}
            <div style={{ maxWidth: 600, margin: "0 auto 2.5rem" }}>
                <div className="skeleton" style={{ height: 48, width: "100%", borderRadius: 12 }} />
            </div>

            {/* Tutor cards grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="fade-in"
                        style={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #334155",
                            borderRadius: 20,
                            padding: "1.75rem",
                            animationDelay: `${i * 0.08}s`,
                            animationFillMode: "both",
                        }}
                    >
                        {/* Avatar + name */}
                        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                            <div className="skeleton skeleton-circle" style={{ width: 56, height: 56, flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                                <div className="skeleton skeleton-text medium" />
                                <div className="skeleton skeleton-text short" style={{ height: 12 }} />
                            </div>
                        </div>
                        {/* Bio */}
                        <div className="skeleton skeleton-text long" />
                        <div className="skeleton skeleton-text medium" />
                        {/* Subject tags */}
                        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                            <div className="skeleton" style={{ height: 24, width: 65, borderRadius: 20 }} />
                            <div className="skeleton" style={{ height: 24, width: 50, borderRadius: 20 }} />
                            <div className="skeleton" style={{ height: 24, width: 75, borderRadius: 20 }} />
                        </div>
                        {/* CTA */}
                        <div className="skeleton" style={{ height: 40, width: "100%", borderRadius: 10, marginTop: 16 }} />
                    </div>
                ))}
            </div>
        </div>
    );
}
