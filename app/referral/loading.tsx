export default function ReferralLoading() {
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-alt)", padding: "2rem 1.25rem" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", display: "grid", gap: 14 }}>
        <div className="skeleton" style={{ height: 120 }} />
        <div className="skeleton" style={{ height: 96 }} />
        <div className="skeleton" style={{ height: 180 }} />
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } } .skeleton { background: var(--border-light); border-radius: 8px; animation: pulse 1.5s ease-in-out infinite; }`}</style>
    </main>
  );
}
