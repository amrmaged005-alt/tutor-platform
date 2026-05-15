"use client";

export default function RootError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div
            style={{
                minHeight: "60vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 20,
                padding: "2rem",
                textAlign: "center",
            }}
        >
            <div
                style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "rgba(248,113,113,0.1)",
                    border: "1px solid rgba(248,113,113,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 32,
                    marginBottom: 4,
                }}
            >
                ⚠
            </div>
            <h2 style={{ color: "var(--bg-alt)", fontWeight: 700, fontSize: 22, margin: 0 }}>
                Something went wrong
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 15, maxWidth: 400, lineHeight: 1.7 }}>
                {error.message || "An unexpected error occurred. Please try again."}
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                <button
                    onClick={reset}
                    style={{
                        background: "linear-gradient(135deg, var(--accent), var(--accent-hover))",
                        color: "var(--accent-fg)",
                        padding: "0.75rem 1.8rem",
                        borderRadius: 12,
                        border: "none",
                        fontSize: 15,
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 4px 16px rgba(59,130,246,0.4)",
                    }}
                >
                    Try again
                </button>
                <a
                    href="/"
                    style={{
                        border: "1px solid var(--border-light)",
                        color: "var(--text-muted)",
                        padding: "0.75rem 1.8rem",
                        borderRadius: 12,
                        fontSize: 15,
                        fontWeight: 500,
                        textDecoration: "none",
                        backgroundColor: "rgba(30,41,59,0.5)",
                        display: "inline-flex",
                        alignItems: "center",
                    }}
                >
                    Go Home
                </a>
            </div>
        </div>
    );
}
