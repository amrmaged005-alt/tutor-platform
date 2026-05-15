export default function DashboardLoading() {
    return (
        <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-card)" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem 5rem" }}>

                {/* Welcome hero skeleton */}
                <div
                    style={{
                        background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg-alt) 100%)",
                        border: "1px solid rgba(13,89,70,0.13)",
                        borderRadius: 20,
                        padding: "1.75rem 2rem",
                        marginBottom: "1.75rem",
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                        <div>
                            <div className="skeleton" style={{ height: 28, width: 260, borderRadius: 8, marginBottom: 10 }} />
                            <div style={{ display: "flex", gap: 10 }}>
                                <div className="skeleton" style={{ height: 20, width: 70, borderRadius: 99 }} />
                                <div className="skeleton" style={{ height: 20, width: 140, borderRadius: 6 }} />
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 10 }}>
                            <div className="skeleton" style={{ height: 36, width: 100, borderRadius: 10 }} />
                            <div className="skeleton" style={{ height: 36, width: 120, borderRadius: 10 }} />
                        </div>
                    </div>
                </div>

                {/* Stat cards */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                        gap: 12,
                        marginBottom: "1.75rem",
                    }}
                >
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="fade-in"
                            style={{
                                backgroundColor: "var(--bg-card)",
                                border: "1px solid var(--border-light)",
                                borderLeft: "3px solid var(--text-secondary)",
                                borderRadius: 16,
                                padding: "1.25rem 1.5rem",
                                animationDelay: `${i * 0.08}s`,
                                animationFillMode: "both",
                            }}
                        >
                            <div className="skeleton" style={{ height: 22, width: 22, borderRadius: 6, marginBottom: 10 }} />
                            <div className="skeleton skeleton-text short" style={{ height: 11, marginBottom: 8 }} />
                            <div className="skeleton" style={{ height: 32, width: 80, borderRadius: 8 }} />
                        </div>
                    ))}
                </div>

                {/* Tab bar */}
                <div
                    style={{
                        backgroundColor: "var(--bg-card)",
                        border: "1px solid var(--border-light)",
                        borderRadius: 12,
                        padding: 4,
                        marginBottom: "1.75rem",
                        display: "flex",
                        gap: 4,
                    }}
                >
                    {[120, 110, 100].map((w, i) => (
                        <div key={i} className="skeleton" style={{ height: 38, width: w, borderRadius: 9 }} />
                    ))}
                </div>

                {/* Content rows */}
                <div className="skeleton" style={{ height: 16, width: 160, borderRadius: 6, marginBottom: 16 }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="fade-in"
                            style={{
                                backgroundColor: "var(--bg-card)",
                                border: "1px solid var(--border-light)",
                                borderRadius: 18,
                                padding: "1.5rem",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                animationDelay: `${0.3 + i * 0.06}s`,
                                animationFillMode: "both",
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <div className="skeleton skeleton-text medium" style={{ marginBottom: 8 }} />
                                <div style={{ display: "flex", gap: 10 }}>
                                    <div className="skeleton" style={{ height: 12, width: 70, borderRadius: 4 }} />
                                    <div className="skeleton" style={{ height: 12, width: 60, borderRadius: 4 }} />
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 6 }}>
                                <div className="skeleton" style={{ height: 24, width: 70, borderRadius: 99 }} />
                                <div className="skeleton" style={{ height: 24, width: 60, borderRadius: 99 }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
