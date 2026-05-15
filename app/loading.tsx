export default function RootLoading() {
    return (
        <div
            style={{
                minHeight: "60vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 20,
                backgroundColor: "var(--bg-card)",
            }}
        >
            <div style={{ position: "relative", width: 56, height: 56 }}>
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "50%",
                        border: "3px solid var(--text)",
                    }}
                />
                <div
                    className="spinner"
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: 56,
                        height: 56,
                        borderWidth: 3,
                        borderTopColor: "var(--accent)",
                        borderRightColor: "#5d3a5f20",
                    }}
                />
            </div>
            <div style={{ textAlign: "center" }}>
                <div
                    style={{
                        fontSize: "1.1rem",
                        fontWeight: 800,
                        background: "linear-gradient(135deg, var(--accent), #5d3a5f)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        marginBottom: 4,
                    }}
                >
                    Coursaty
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: 0 }}>Loading…</p>
            </div>
        </div>
    );
}
