export default function SkeletonCard() {
  return (
    <div
      style={{
        backgroundColor: "#1e293b",
        border: "1px solid #334155",
        borderRadius: 16,
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    >
      <div style={{ height: 20, backgroundColor: "#334155", borderRadius: 8, width: "60%" }} />
      <div style={{ height: 14, backgroundColor: "#334155", borderRadius: 8, width: "40%" }} />
      <div style={{ height: 14, backgroundColor: "#334155", borderRadius: 8, width: "80%" }} />
      <div style={{ height: 36, backgroundColor: "#334155", borderRadius: 8, marginTop: 8 }} />
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}