"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const MOBILE_CSS = `
#bk-mobile-root {
  --bk-parchment: #FDF6E3;
  --bk-parchment-alt: #F5EDD0;
  --bk-edge: #E8D69C;
  --bk-text: #2C1810;
  --bk-muted: #6B4F3A;
  --bk-spine: #7B2D42;
  --bk-spine-dark: #4A1828;
  --bk-bg: #1A1008;
  display: none;
  min-height: 100dvh;
  background: var(--bk-bg);
  color: var(--bk-text);
  font-family: 'Lora', Georgia, serif;
  padding: 14px 14px 96px;
  position: relative;
  overflow-x: hidden;
}
@media (max-width: 860px) {
  #bk-mobile-root { display: flex; flex-direction: column; }
}
.bk-m-back {
  align-self: flex-start;
  color: rgba(253,246,227,0.7);
  text-decoration: none;
  font-size: 13px;
  margin-bottom: 8px;
  padding: 6px 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.bk-m-progress {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 0 14px;
  position: sticky;
  top: 0;
  z-index: 5;
  background: linear-gradient(180deg, var(--bk-bg) 70%, transparent);
}
.bk-m-step-label {
  color: rgba(253,246,227,0.92);
  font-family: 'Lora', Georgia, serif;
  font-size: 12px;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.bk-m-dots {
  display: inline-flex;
  gap: 5px;
  flex: 0 0 auto;
}
.bk-m-dots span {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgba(253,246,227,0.22);
  transition: width 220ms ease, background 220ms ease;
}
.bk-m-dots span.active {
  width: 22px;
  background: #F59E0B;
}
.bk-m-track {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  gap: 14px;
  padding-bottom: 14px;
}
.bk-m-track::-webkit-scrollbar { display: none; }
.bk-m-card {
  flex: 0 0 calc(100% - 8px);
  scroll-snap-align: center;
  scroll-snap-stop: always;
  min-height: 56vh;
  background: var(--bk-parchment);
  border: 1px solid rgba(123,45,66,0.16);
  border-radius: 14px;
  padding: 1.4rem 1.25rem 1.5rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.35);
  display: flex;
  flex-direction: column;
  gap: 12px;
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 380ms ease, transform 380ms ease;
}
.bk-m-card.in-view {
  opacity: 1;
  transform: translateY(0);
}
.bk-m-card.cover {
  background: linear-gradient(150deg, #943852, #3D1220);
  color: var(--bk-parchment);
  border-color: rgba(253,246,227,0.16);
}
.bk-m-card.cover .bk-m-eyebrow,
.bk-m-card.cover .bk-m-body { color: rgba(253,246,227,0.86); }
.bk-m-eyebrow {
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--bk-spine);
  font-weight: 700;
}
.bk-m-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.6rem;
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -0.01em;
  margin: 2px 0 4px;
}
.bk-m-card.cover .bk-m-title { font-size: 1.9rem; }
.bk-m-body {
  color: var(--bk-muted);
  font-size: 0.96rem;
  line-height: 1.65;
  margin: 0;
}
.bk-m-rule {
  width: 36px;
  height: 1px;
  background: var(--bk-spine);
  opacity: 0.6;
  margin: 4px 0 2px;
}
.bk-m-card.cover .bk-m-rule { background: #F59E0B; opacity: 0.85; }
.bk-m-features {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 4px;
}
.bk-m-feature {
  background: rgba(123,45,66,0.05);
  border: 1px solid rgba(123,45,66,0.12);
  border-radius: 10px;
  padding: 10px 12px;
}
.bk-m-feature h4 {
  margin: 0 0 4px;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 0.92rem;
  color: var(--bk-text);
  letter-spacing: -0.01em;
}
.bk-m-feature p {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.5;
  color: var(--bk-muted);
}
.bk-m-steps { display: flex; flex-direction: column; gap: 10px; margin-top: 4px; }
.bk-m-step {
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 12px;
  align-items: start;
  background: rgba(123,45,66,0.04);
  border: 1px solid rgba(123,45,66,0.10);
  border-radius: 10px;
  padding: 10px 12px;
}
.bk-m-step-num {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background: var(--bk-spine);
  color: var(--bk-parchment);
  font-family: 'Playfair Display', Georgia, serif;
  font-weight: 800;
  font-size: 14px;
  display: grid;
  place-items: center;
}
.bk-m-step h4 {
  margin: 4px 0 2px;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 0.95rem;
  color: var(--bk-text);
}
.bk-m-step p {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.5;
  color: var(--bk-muted);
}
.bk-m-testimonial {
  background: rgba(253,246,227,0.6);
  border-inline-start: 3px solid var(--bk-spine);
  border-radius: 0 10px 10px 0;
  padding: 12px 14px;
  margin-top: 6px;
}
.bk-m-testimonial blockquote {
  margin: 0 0 8px;
  font-style: italic;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 0.92rem;
  line-height: 1.55;
  color: var(--bk-text);
}
.bk-m-testimonial-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  color: var(--bk-muted);
}
.bk-m-avatar {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: var(--bk-spine);
  color: var(--bk-parchment);
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 12px;
}
.bk-m-stars {
  margin-inline-start: auto;
  color: #F59E0B;
  font-weight: 700;
}
.bk-m-illus {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
  padding: 10px;
  border-radius: 10px;
  background: rgba(245,158,11,0.10);
  border: 1px dashed rgba(245,158,11,0.45);
}
.bk-m-illus-ring {
  width: 56px;
  height: 56px;
  border-radius: 999px;
  border: 2px solid #F59E0B;
  display: grid;
  place-items: center;
  font-family: 'Playfair Display', Georgia, serif;
  font-weight: 800;
  font-size: 18px;
  color: var(--bk-spine);
  flex: 0 0 auto;
}
.bk-m-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}
.bk-m-btn,
.bk-m-btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 18px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.86rem;
  text-decoration: none;
  letter-spacing: 0.02em;
  min-height: 40px;
}
.bk-m-btn {
  background: #F59E0B;
  color: var(--bk-bg);
}
.bk-m-btn-secondary {
  background: transparent;
  color: var(--bk-text);
  border: 1px solid rgba(123,45,66,0.40);
}
.bk-m-card.cover .bk-m-btn-secondary {
  color: var(--bk-parchment);
  border-color: rgba(253,246,227,0.40);
}
.bk-m-nav {
  position: fixed;
  inset-inline: 14px;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 16px);
  display: flex;
  gap: 10px;
  z-index: 6;
}
.bk-m-nav-btn {
  flex: 1;
  min-height: 46px;
  border-radius: 999px;
  border: 1px solid rgba(253,246,227,0.25);
  background: rgba(26,16,8,0.78);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  color: var(--bk-parchment);
  font-weight: 700;
  font-size: 0.92rem;
  letter-spacing: 0.02em;
  cursor: pointer;
  font-family: inherit;
  transition: background 200ms ease, transform 120ms ease;
}
.bk-m-nav-btn:active { transform: scale(0.97); }
.bk-m-nav-btn.primary {
  background: #F59E0B;
  border-color: #F59E0B;
  color: var(--bk-bg);
}
.bk-m-nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
@media (prefers-reduced-motion: reduce) {
  .bk-m-card, .bk-m-nav-btn { transition: none !important; }
  .bk-m-track { scroll-behavior: auto; }
}
`;

const STEP_LABELS = ["Cover", "Chapter I", "Chapter II", "Chapter III", "Chapter IV", "Epilogue"];

function CardCover() {
  return (
    <article className="bk-m-card cover" data-card>
      <span className="bk-m-eyebrow" style={{ color: "rgba(253,246,227,0.72)" }}>Coursaty</span>
      <h1 className="bk-m-title">Find the Right Tutor. First Time.</h1>
      <div className="bk-m-rule" />
      <p className="bk-m-body">A guided story about choosing verified tutors, clear classes, and confident learning across Egypt.</p>
      <div className="bk-m-actions">
        <Link href="/classes" className="bk-m-btn">Browse Classes</Link>
        <Link href="/tutors" className="bk-m-btn-secondary">Find a Tutor</Link>
      </div>
    </article>
  );
}

function CardChapter1() {
  return (
    <article className="bk-m-card" data-card>
      <span className="bk-m-eyebrow">Chapter I</span>
      <h2 className="bk-m-title">Finding Good Tutors Shouldn&apos;t Be This Hard</h2>
      <div className="bk-m-rule" />
      <p className="bk-m-body">Parents ask friends, scroll chats, compare scattered screenshots, and hope the tutor is the right fit. Students deserve a clearer path.</p>
      <div className="bk-m-features">
        <div className="bk-m-feature"><h4>No vetting</h4><p>Hard to know who is qualified until after the first lesson.</p></div>
        <div className="bk-m-feature"><h4>Word of mouth</h4><p>Useful, but narrow. Great tutors stay invisible.</p></div>
        <div className="bk-m-feature"><h4>Price opacity</h4><p>Fees, formats, and expectations are often unclear.</p></div>
        <div className="bk-m-feature"><h4>Schedule chaos</h4><p>Availability gets buried across calls and threads.</p></div>
      </div>
    </article>
  );
}

function CardChapter2() {
  return (
    <article className="bk-m-card" data-card>
      <span className="bk-m-eyebrow">Chapter II</span>
      <h2 className="bk-m-title">A Better Way to Learn</h2>
      <div className="bk-m-rule" />
      <p className="bk-m-body">Coursaty gives every class a proper home: subject, curriculum, level, price, format, seats, tutor profile, and reviews.</p>
      <div className="bk-m-steps">
        <div className="bk-m-step"><span className="bk-m-step-num">1</span><div><h4>Search & filter</h4><p>Find classes by subject, curriculum, level, location, price, and format.</p></div></div>
        <div className="bk-m-step"><span className="bk-m-step-num">2</span><div><h4>Book in seconds</h4><p>Reserve your seat and receive confirmation without chasing messages.</p></div></div>
        <div className="bk-m-step"><span className="bk-m-step-num">3</span><div><h4>Learn with confidence</h4><p>Verified profiles, reviews, and clear details help you choose well.</p></div></div>
      </div>
    </article>
  );
}

function CardChapter3() {
  return (
    <article className="bk-m-card" data-card>
      <span className="bk-m-eyebrow">Chapter III</span>
      <h2 className="bk-m-title">Built for Egypt&apos;s Students</h2>
      <div className="bk-m-rule" />
      <div className="bk-m-features">
        <div className="bk-m-feature"><h4>Local curricula</h4><p>National, IGCSE, American, IB, STEM, and more.</p></div>
        <div className="bk-m-feature"><h4>Flexible formats</h4><p>In-person, online, and hybrid classes.</p></div>
        <div className="bk-m-feature"><h4>Tutor trust</h4><p>Verification, profiles, ratings, and reviews.</p></div>
        <div className="bk-m-feature"><h4>Seat visibility</h4><p>Capacity and remaining places are clear.</p></div>
      </div>
      <div className="bk-m-illus">
        <div className="bk-m-illus-ring">1,800+</div>
        <div style={{ fontSize: "0.86rem", color: "var(--bk-muted)" }}>Students already learning across Egypt.</div>
      </div>
    </article>
  );
}

function CardChapter4() {
  return (
    <article className="bk-m-card" data-card>
      <span className="bk-m-eyebrow">Chapter IV</span>
      <h2 className="bk-m-title">What Our Students Say</h2>
      <div className="bk-m-rule" />
      <div className="bk-m-testimonial">
        <blockquote>&quot;The verification process gave me confidence. My daughter loves her Chemistry tutor.&quot;</blockquote>
        <div className="bk-m-testimonial-meta">
          <span className="bk-m-avatar">A</span>
          <span><strong>Ahmed K.</strong> · Parent</span>
          <span className="bk-m-stars">5.0</span>
        </div>
      </div>
      <div className="bk-m-testimonial">
        <blockquote>&quot;I found an IGCSE Physics class in one evening instead of asking around for a week.&quot;</blockquote>
        <div className="bk-m-testimonial-meta">
          <span className="bk-m-avatar">M</span>
          <span><strong>Mariam S.</strong> · Student</span>
          <span className="bk-m-stars">5.0</span>
        </div>
      </div>
    </article>
  );
}

function CardEpilogue() {
  return (
    <article className="bk-m-card" data-card>
      <span className="bk-m-eyebrow">Epilogue</span>
      <h2 className="bk-m-title">Your Perfect Tutor Awaits</h2>
      <div className="bk-m-rule" />
      <p className="bk-m-body">Start with a subject, a grade, or a curriculum. Coursaty will help you narrow the path.</p>
      <div className="bk-m-actions">
        <Link href="/classes" className="bk-m-btn">Browse Classes</Link>
        <Link href="/tutors" className="bk-m-btn-secondary">Find a Tutor</Link>
      </div>
      <p className="bk-m-body" style={{ marginTop: 6, fontSize: "0.78rem", opacity: 0.7 }}>Are you a tutor? <Link href="/signup?role=tutor" style={{ color: "var(--bk-spine)", fontWeight: 700 }}>Join Coursaty</Link>.</p>
    </article>
  );
}

const CARDS = [CardCover, CardChapter1, CardChapter2, CardChapter3, CardChapter4, CardEpilogue];

export default function BookMobile() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [step, setStep] = useState(0);

  // Track which card is closest to the viewport center (works with native CSS snap)
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const compute = () => {
      frame = 0;
      const cardWidth = track.clientWidth;
      if (!cardWidth) return;
      const idx = Math.round(track.scrollLeft / cardWidth);
      const clamped = Math.min(CARDS.length - 1, Math.max(0, idx));
      setStep((current) => (current === clamped ? current : clamped));
    };
    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(compute);
    };
    compute();
    track.addEventListener("scroll", schedule, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      track.removeEventListener("scroll", schedule);
    };
  }, []);

  // Reveal cards on enter via IntersectionObserver — matches the dashboard preview
  // and photo-plate reveal pattern used elsewhere on the landing
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.querySelectorAll<HTMLElement>("[data-card]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          }
        }
      },
      { root: track, threshold: 0.4 }
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  const goto = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.min(CARDS.length - 1, Math.max(0, index));
    track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        goto(step + 1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goto(step - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, goto]);

  return (
    <>
      <style>{MOBILE_CSS}</style>
      <div id="bk-mobile-root">
        <Link href="/" className="bk-m-back" aria-label="Back to Coursaty home">← Back to Coursaty</Link>
        <div className="bk-m-progress" role="navigation" aria-label="Story progress">
          <span className="bk-m-step-label">{step + 1} / {CARDS.length} · {STEP_LABELS[step]}</span>
          <span className="bk-m-dots" aria-hidden="true">
            {CARDS.map((_, i) => (
              <span key={i} className={i === step ? "active" : undefined} />
            ))}
          </span>
        </div>
        <div ref={trackRef} className="bk-m-track" aria-live="polite">
          {CARDS.map((Card, i) => (
            <Card key={i} />
          ))}
        </div>
        <div className="bk-m-nav" aria-label="Story navigation">
          <button
            type="button"
            className="bk-m-nav-btn"
            onClick={() => goto(step - 1)}
            disabled={step === 0}
            aria-label="Previous step"
          >
            ← Previous
          </button>
          <button
            type="button"
            className="bk-m-nav-btn primary"
            onClick={() => goto(step + 1)}
            disabled={step === CARDS.length - 1}
            aria-label="Next step"
          >
            Next →
          </button>
        </div>
      </div>
    </>
  );
}
