export default function TutorsLoading() {
    return (
        <div role="status" aria-label="Loading tutors" aria-busy="true" style={{ minHeight: "100vh", backgroundColor: "var(--bg-card)" }}>
            {/* Hero section skeleton */}
            <div
                style={{
                    background: "linear-gradient(135deg, var(--bg-alt) 0%, var(--bg-card) 100%)",
                    borderBottom: "1px solid var(--border-light)",
                    padding: "56px 24px 48px",
                }}
            >
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <div className="skeleton" style={{ height: 13, width: 60, borderRadius: 6, marginBottom: 24 }} />
                    <div className="skeleton" style={{ height: 44, width: "55%", borderRadius: 10, marginBottom: 14 }} />
                    <div className="skeleton" style={{ height: 16, width: "40%", borderRadius: 6, marginBottom: 28 }} />
                    {/* Search bar */}
                    <div className="skeleton" style={{ height: 52, width: "min(520px, 100%)", borderRadius: 14, marginBottom: 20 }} />
                    {/* Quick pills */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {[70, 60, 80, 55, 90, 65, 75].map((w, i) => (
                            <div key={i} className="skeleton" style={{ height: 34, width: w, borderRadius: 999 }} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px", display: "flex", gap: 32 }}>
                {/* Sidebar skeleton */}
                <div className="skeleton" style={{ width: 260, height: 380, borderRadius: 20, flexShrink: 0 }} />

                {/* Cards grid */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="skeleton" style={{ height: 14, width: 180, borderRadius: 6, marginBottom: 28 }} />
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
                                style={{
                                    backgroundColor: "var(--bg-card)",
                                    border: "1px solid var(--border-light)",
                                    borderRadius: 20,
                                    overflow: "hidden",
                                    animationDelay: `${i * 0.06}s`,
                                }}
                                className="fade-in"
                            >
                                <div className="skeleton" style={{ height: 4, borderRadius: 0 }} />
                                <div style={{ padding: "20px 20px 0" }}>
                                    <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                                        <div className="skeleton skeleton-circle" style={{ width: 64, height: 64, flexShrink: 0 }} />
                                        <div style={{ flex: 1 }}>
                                            <div className="skeleton skeleton-text medium" style={{ marginBottom: 8 }} />
                                            <div className="skeleton skeleton-text short" style={{ marginBottom: 8 }} />
                                            <div className="skeleton" style={{ height: 20, width: 72, borderRadius: 99 }} />
                                        </div>
                                    </div>
                                    <div className="skeleton skeleton-text medium" style={{ marginBottom: 12 }} />
                                    <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                                        {[60, 50, 70].map((w, j) => (
                                            <div key={j} className="skeleton" style={{ height: 22, width: w, borderRadius: 99 }} />
                                        ))}
                                    </div>
                                    <div className="skeleton skeleton-text long" style={{ marginBottom: 6 }} />
                                    <div className="skeleton skeleton-text medium" style={{ marginBottom: 16 }} />
                                    <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: 16, display: "flex", gap: 16 }}>
                                        <div className="skeleton" style={{ height: 14, width: 80, borderRadius: 6 }} />
                                        <div className="skeleton" style={{ height: 14, width: 80, borderRadius: 6 }} />
                                    </div>
                                </div>
                                <div style={{ padding: "14px 20px 20px", display: "flex", gap: 8 }}>
                                    <div className="skeleton" style={{ flex: 1, height: 38, borderRadius: 10 }} />
                                    <div className="skeleton" style={{ flex: 1, height: 38, borderRadius: 10 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
