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
                gap: 20,
                padding: "2rem",
                textAlign: "center",
                backgroundColor: "var(--bg-alt)",
            }}
        >
            <div>
                <div
                    style={{
                        fontSize: "clamp(5rem, 14vw, 9rem)",
                        fontWeight: 900,
                        color: "var(--border-light)",
                        lineHeight: 1,
                        marginBottom: 16,
                    }}
                >
                    404
                </div>
                <h2 style={{ color: "var(--text)", fontWeight: 700, fontSize: "clamp(1.2rem, 3vw, 1.5rem)", margin: "0 0 12px" }}>
                    Page not found
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: 15, maxWidth: 400, margin: "0 auto 28px", lineHeight: 1.7 }}>
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    Let&apos;s get you back on track.
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                    <Link
                        href="/"
                        style={{
                            backgroundColor: "var(--accent)",
                            color: "var(--accent-fg)",
                            padding: "10px 24px",
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 600,
                            textDecoration: "none",
                        }}
                    >
                        Go Home
                    </Link>
                    <Link
                        href="/classes"
                        style={{
                            border: "1px solid var(--border-light)",
                            color: "var(--text)",
                            padding: "10px 24px",
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 500,
                            textDecoration: "none",
                            backgroundColor: "var(--bg-card)",
                        }}
                    >
                        Browse Classes
                    </Link>
                </div>
            </div>
        </div>
    );
}
