export default function RootLoading() {
    return (
        <div
            style={{
                minHeight: "60vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 16,
            }}
        >
            <div className="spinner" style={{ width: 40, height: 40, borderWidth: 4 }} />
            <p style={{ color: "#64748b", fontSize: 14 }}>Loading…</p>
        </div>
    );
}
