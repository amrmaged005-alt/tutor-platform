export default function DashboardLoading() {
    return (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
            {/* Welcome header */}
            <div style={{ marginBottom: "2rem" }}>
                <div className="skeleton" style={{ height: 32, width: 300, borderRadius: 8, marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 14, width: 180, borderRadius: 6 }} />
            </div>

            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="fade-in"
                        style={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #334155",
                            borderRadius: 16,
                            padding: "1.5rem",
                            animationDelay: `${i * 0.1}s`,
                            animationFillMode: "both",
                        }}
                    >
                        <div className="skeleton" style={{ height: 20, width: 20, borderRadius: 6, marginBottom: 12 }} />
                        <div className="skeleton" style={{ height: 32, width: 80, borderRadius: 8, marginBottom: 8 }} />
                        <div className="skeleton skeleton-text short" style={{ height: 12 }} />
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: "2rem" }}>
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: 40, width: 110, borderRadius: 10 }} />
                ))}
            </div>

            {/* Table-like rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className="fade-in"
                        style={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #334155",
                            borderRadius: 12,
                            padding: "1.25rem",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            animationDelay: `${0.3 + i * 0.06}s`,
                            animationFillMode: "both",
                        }}
                    >
                        <div style={{ flex: 1 }}>
                            <div className="skeleton skeleton-text medium" />
                            <div className="skeleton skeleton-text short" style={{ height: 12 }} />
                        </div>
                        <div className="skeleton" style={{ height: 28, width: 80, borderRadius: 8 }} />
                    </div>
                ))}
            </div>
        </div>
    );
}
