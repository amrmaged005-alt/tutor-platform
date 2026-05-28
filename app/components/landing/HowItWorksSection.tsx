"use client";

export default function HowItWorksSection() {
  const steps = ["Search by subject, city, or tutor", "Compare verified classes", "Book your seat securely"];
  return (
    <section style={{ backgroundColor: "var(--bg-alt)", borderTop: "1px solid var(--border-light)", padding: "3rem 1rem" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <h2 style={{ color: "var(--text)", fontSize: "clamp(1.35rem, 2.5vw, 1.8rem)", margin: "0 0 1rem", fontWeight: 850 }}>How it works</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {steps.map((step, index) => (
            <div key={step} style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 16, padding: "1rem" }}>
              <span style={{ color: "var(--accent)", fontWeight: 900 }}>{index + 1}</span>
              <p style={{ color: "var(--text)", margin: "0.5rem 0 0", fontWeight: 750 }}>{step}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
