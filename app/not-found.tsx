import Link from "next/link";

export default function NotFound() {
    return (
        <div
            style={{
                minHeight: "70vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 16,
                padding: "2rem",
                textAlign: "center",
            }}
        >
            <div style={{ fontSize: 72, marginBottom: 8 }}>🔍</div>
            <h1
                style={{
                    fontSize: "clamp(2rem, 5vw, 3.5rem)",
                    fontWeight: 900,
                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    margin: 0,
                }}
            >
                404
            </h1>
            <h2 style={{ color: "#f8fafc", fontWeight: 700, fontSize: 22, margin: 0 }}>
                Page not found
            </h2>
            <p style={{ color: "#64748b", fontSize: 15, maxWidth: 420 }}>
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
                Let&apos;s get you back on track.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap", justifyContent: "center" }}>
                <Link
                    href="/"
                    style={{
                        backgroundColor: "#3b82f6",
                        color: "white",
                        padding: "0.7rem 1.8rem",
                        borderRadius: 10,
                        fontSize: 15,
                        fontWeight: 600,
                        textDecoration: "none",
                        boxShadow: "0 2px 12px rgba(59,130,246,0.3)",
                    }}
                >
                    Go Home
                </Link>
                <Link
                    href="/classes"
                    style={{
                        border: "1px solid #334155",
                        color: "#cbd5e1",
                        padding: "0.7rem 1.8rem",
                        borderRadius: 10,
                        fontSize: 15,
                        fontWeight: 500,
                        textDecoration: "none",
                    }}
                >
                    Browse Classes
                </Link>
            </div>
        </div>
    );
}
