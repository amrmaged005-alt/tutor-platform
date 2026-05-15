export default function ClassesLoading() {
    return (
        <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-card)" }}>
            {/* Hero section skeleton */}
            <div
                style={{
                    background: "linear-gradient(135deg, var(--text) 0%, var(--text) 50%, var(--text) 100%)",
                    borderBottom: "1px solid var(--text)",
                    padding: "56px 24px 48px",
                }}
            >
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <div className="skeleton" style={{ height: 13, width: 60, borderRadius: 6, marginBottom: 24 }} />
                    <div className="skeleton" style={{ height: 44, width: "50%", borderRadius: 10, marginBottom: 14 }} />
                    <div className="skeleton" style={{ height: 16, width: "38%", borderRadius: 6, marginBottom: 28 }} />
                    {/* Search bar */}
                    <div className="skeleton" style={{ height: 56, width: "min(600px, 100%)", borderRadius: 16, marginBottom: 20 }} />
                    {/* Trending pills */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {[65, 70, 50, 90, 60, 75, 55].map((w, i) => (
                            <div key={i} className="skeleton" style={{ height: 32, width: w, borderRadius: 999 }} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px", display: "flex", gap: 32 }}>
                {/* Sidebar */}
                <div className="skeleton" style={{ width: 260, height: 460, borderRadius: 20, flexShrink: 0 }} />

                {/* Cards */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="skeleton" style={{ height: 14, width: 200, borderRadius: 6, marginBottom: 28 }} />
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                            gap: 20,
                        }}
                    >
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="fade-in"
                                style={{
                                    backgroundColor: "var(--bg-card)",
                                    border: "1px solid var(--text)",
                                    borderRadius: 20,
                                    overflow: "hidden",
                                    animationDelay: `${i * 0.07}s`,
                                    animationFillMode: "both",
                                }}
                            >
                                <div className="skeleton" style={{ height: 4, borderRadius: 0 }} />
                                <div style={{ padding: "18px 18px 0" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                                        <div className="skeleton" style={{ height: 26, width: 90, borderRadius: 999 }} />
                                        <div className="skeleton" style={{ height: 22, width: 70, borderRadius: 999 }} />
                                    </div>
                                    <div className="skeleton skeleton-text long" style={{ marginBottom: 8 }} />
                                    <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                                        <div className="skeleton" style={{ height: 20, width: 70, borderRadius: 999 }} />
                                        <div className="skeleton" style={{ height: 20, width: 60, borderRadius: 999 }} />
                                    </div>
                                    <div className="skeleton skeleton-text medium" style={{ marginBottom: 6 }} />
                                    <div className="skeleton skeleton-text long" style={{ marginBottom: 10 }} />
                                    <div className="skeleton" style={{ height: 4, borderRadius: 99, marginBottom: 6 }} />
                                </div>
                                <div style={{ padding: "12px 18px 18px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid var(--text)", marginBottom: 10 }}>
                                        <div className="skeleton" style={{ height: 28, width: 80, borderRadius: 8 }} />
                                    </div>
                                    <div className="skeleton" style={{ height: 40, width: "100%", borderRadius: 10 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
