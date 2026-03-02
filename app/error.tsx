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
                gap: 16,
                padding: "2rem",
                textAlign: "center",
            }}
        >
            <div style={{ fontSize: 48, marginBottom: 8 }}>😵</div>
            <h2 style={{ color: "#f8fafc", fontWeight: 700, fontSize: 22, margin: 0 }}>
                Something went wrong
            </h2>
            <p style={{ color: "#64748b", fontSize: 15, maxWidth: 400 }}>
                {error.message || "An unexpected error occurred. Please try again."}
            </p>
            <button
                onClick={reset}
                style={{
                    backgroundColor: "#3b82f6",
                    color: "white",
                    padding: "0.7rem 1.8rem",
                    borderRadius: 10,
                    border: "none",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    marginTop: 8,
                    boxShadow: "0 2px 12px rgba(59,130,246,0.3)",
                }}
            >
                Try again
            </button>
        </div>
    );
}
