export default function UnauthorizedPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f172a",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
    }}>
      <h1 style={{ color: "#ef4444", fontSize: 48, margin: 0 }}>403</h1>
      <p style={{ color: "#94a3b8", fontSize: 18, margin: 0 }}>
        You don't have permission to access this page.
      </p>
      <a href="/" style={{
        marginTop: 8,
        padding: "10px 24px",
        borderRadius: 10,
        background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
        color: "#fff",
        textDecoration: "none",
        fontWeight: 600,
      }}>
        Go Home
      </a>
    </div>
  );
}