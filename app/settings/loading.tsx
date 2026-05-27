export default function SettingsLoading() {
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-alt)", padding: "2rem 1.25rem" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", display: "grid", gap: 14 }}>
        <div className="skeleton" style={{ height: 72 }} />
        <div className="skeleton" style={{ height: 260 }} />
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } } .skeleton { background: var(--color-border, var(--border-light)); border-radius: 8px; animation: pulse 1.5s ease-in-out infinite; }`}</style>
    </main>
  );
}
