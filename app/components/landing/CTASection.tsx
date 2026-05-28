"use client";

import Link from "next/link";

export default function CTASection() {
  return (
    <section style={{ backgroundColor: "var(--bg)", borderTop: "1px solid var(--border-light)", padding: "3rem 1rem 4rem" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ color: "var(--text)", margin: 0, fontSize: "clamp(1.35rem, 2.5vw, 1.8rem)", fontWeight: 850 }}>Find your next class</h2>
          <p style={{ color: "var(--text-muted)", margin: "0.35rem 0 0" }}>Browse verified tutoring classes across Egypt.</p>
        </div>
        <Link href="/classes" className="btn-primary">Browse classes</Link>
      </div>
    </section>
  );
}
