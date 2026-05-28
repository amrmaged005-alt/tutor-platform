"use client";

export default function TestimonialsSection() {
  return (
    <section style={{ backgroundColor: "var(--bg-alt)", borderTop: "1px solid var(--border-light)", padding: "3rem 1rem" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <h2 style={{ color: "var(--text)", fontSize: "clamp(1.35rem, 2.5vw, 1.8rem)", margin: "0 0 1rem", fontWeight: 850 }}>Loved by learners</h2>
        <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 16, padding: "1.25rem" }}>
          <p style={{ color: "var(--text)", margin: 0, fontWeight: 700 }}>Real student stories will appear here as reviews come in.</p>
        </div>
      </div>
    </section>
  );
}
