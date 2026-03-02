export default function ClassesLoading() {
    return (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
            {/* Header skeleton */}
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                <div className="skeleton" style={{ height: 36, width: 260, margin: "0 auto 12px", borderRadius: 8 }} />
                <div className="skeleton" style={{ height: 16, width: 400, maxWidth: "90%", margin: "0 auto", borderRadius: 6 }} />
            </div>

            {/* Filter pills skeleton */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: "2rem" }}>
                {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: 34, width: 80 + Math.random() * 40, borderRadius: 20 }} />
                ))}
            </div>

            {/* Cards grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="fade-in"
                        style={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #334155",
                            borderRadius: 20,
                            padding: "1.5rem",
                            animationDelay: `${i * 0.08}s`,
                            animationFillMode: "both",
                        }}
                    >
                        {/* Subject tag */}
                        <div className="skeleton" style={{ height: 26, width: 90, borderRadius: 20, marginBottom: 14 }} />
                        {/* Title */}
                        <div className="skeleton skeleton-text long" />
                        <div className="skeleton skeleton-text medium" />
                        {/* Meta row */}
                        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                            <div className="skeleton" style={{ height: 20, width: 70, borderRadius: 6 }} />
                            <div className="skeleton" style={{ height: 20, width: 70, borderRadius: 6 }} />
                            <div className="skeleton" style={{ height: 20, width: 70, borderRadius: 6 }} />
                        </div>
                        {/* Spots bar */}
                        <div className="skeleton" style={{ height: 6, width: "100%", borderRadius: 4, marginTop: 16 }} />
                        {/* Bottom row */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                            <div className="skeleton" style={{ height: 28, width: 80, borderRadius: 8 }} />
                            <div className="skeleton" style={{ height: 36, width: 100, borderRadius: 10 }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
