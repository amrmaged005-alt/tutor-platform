export const BOOK_CSS_C = `
  background: var(--accent);
}
@keyframes mobilePageFlipIn {
  from {
    opacity: 0.72;
    transform: translateY(20px) rotateY(-12deg) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotateY(0) scale(1);
  }
}
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin-top: 20px;
}
.trust-card,
.outcome-note,
.stat-card {
  padding: 12px 14px;
}
.stat-card strong {
  display: block;
  color: var(--ink);
  font-size: 19px;
  line-height: 1;
  margin-bottom: 4px;
}
.stat-card span {
  color: var(--muted);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.25;
  display: block;
}
@media (prefers-reduced-motion: reduce) {
  .book-landing *, .book-landing *::before, .book-landing *::after {
    animation-duration: 1ms !important;
    transition-duration: 1ms !important;
    scroll-behavior: auto !important;
  }
}
@media (max-height: 760px) and (min-width: 901px) {
  .book-page { padding: 28px clamp(32px, 4vw, 48px); }
  .book-heading {
    font-size: clamp(2rem, 4vw, 3.5rem);
    margin-bottom: 16px;
  }
  .book-heading.medium { font-size: clamp(1.7rem, 3vw, 2.6rem); }
  .book-copy {
    font-size: 1rem;
    line-height: 1.58;
  }
  .book-actions { margin-top: 22px; }
  .stat-card { padding: 12px; }
  .cover-visual { min-height: 360px; }
}
@media (max-width: 900px) {
  .book-stage { perspective: none; }
  .chapter-tab { display: none; }
  .bookmark-rail {
    bottom: calc(env(safe-area-inset-bottom, 0px) + 1.6rem);
    width: min(100vw - 1rem, 430px);
    justify-content: flex-start;
    padding: 0 0.25rem;
  }
  .bookmark-rail a {
    min-height: 30px;
    padding: 0 0.7rem;
    font-size: 11px;
  }
}
@media (max-width: 560px) {
  .book-shell { width: 100%; }
  .bookmark-rail { width: min(100vw - 20px, 1180px); }
  .book-actions { flex-direction: column; }
  .book-btn, .book-btn-secondary { width: 100%; }
  .toc-card { grid-template-columns: 38px 1fr; }
  .toc-card svg { display: none; }
  .stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 340px) {
  .book-mobile-page {
    padding-inline: 0.625rem;
  }
  .book-mobile-card {
    padding: 0.75rem;
    max-height: calc(100dvh - 5.25rem);
  }
  .book-mobile-card .book-heading {
    font-size: 1.32rem;
  }
  .book-mobile-card .book-copy {
    -webkit-line-clamp: 3;
  }
}

/* ── Editorial photo plates ─────────────────────────────── */
.plate {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  background: var(--paper-alt);
  box-shadow:
    0 18px 40px rgba(24,23,21,0.18),
    0 1px 0 rgba(255,255,255,0.04) inset;
  isolation: isolate;
}
.plate img,
.plate :global(img) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 35%;
  transform-origin: 55% 50%;
}
.plate.portrait img,
.plate.portrait :global(img) {
  object-position: center 22%;
}
.plate.square img,
.plate.square :global(img) {
  object-position: center 30%;
}
.plate::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 12%, rgba(255,247,225,0.18), transparent 55%),
    linear-gradient(180deg, rgba(13,89,70,0.00) 50%, rgba(13,89,70,0.22) 100%);
  pointer-events: none;
  z-index: 2;
}
.plate-caption {
  position: absolute;
  inset-inline-start: 12px;
  inset-block-end: 10px;
  color: #fbfaf6;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  text-shadow: 0 1px 4px rgba(0,0,0,0.45);
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.plate-caption::before {
  content: "";
  width: 18px;
  height: 1px;
  background: rgba(251,250,246,0.85);
}
@keyframes kenburns-soft {
  0%   { transform: scale(1.04) translate3d(0, 0, 0); }
  50%  { transform: scale(1.10) translate3d(-1%, -1.2%, 0); }
  100% { transform: scale(1.04) translate3d(0, 0, 0); }
}
.plate-anim img,
.plate-anim :global(img) {
  animation: kenburns-soft 22s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .plate-anim img, .plate-anim :global(img) { animation: none; }
}

/* Hero polaroid stack for the cover page */
.hero-visual {
  position: relative;
  min-height: 0;
  height: 100%;
  max-height: min(560px, 70vh);
  display: grid;
  place-items: center;
  isolation: isolate;
  padding: 12px 24px;
}
.hero-frame {
  position: relative;
  width: min(340px, 78%);
  aspect-ratio: 4 / 5;
  max-height: 92%;
  border-radius: 18px;
  overflow: hidden;
  background: var(--paper-alt);
  box-shadow:
    0 40px 80px rgba(24,23,21,0.25),
    0 12px 24px rgba(24,23,21,0.12),
    0 0 0 1px rgba(216,212,199,0.6);
  transform: rotate(-1.2deg);
  z-index: 3;
}
.hero-frame img,
.hero-frame :global(img) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 30%;
  transform-origin: 45% 45%;
  animation: kenburns-soft 24s ease-in-out infinite;
}
.hero-frame::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 25% 18%, rgba(255,243,212,0.22), transparent 60%),
    linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(13,52,40,0.32) 100%);
  pointer-events: none;
}
.hero-frame-tape {
  position: absolute;
  top: -14px;
  inset-inline-start: 28%;
  width: 110px;
  height: 26px;
  background: linear-gradient(180deg, rgba(255,245,212,0.92), rgba(241,224,176,0.78));
  transform: rotate(-6deg);
  border-radius: 2px;
  box-shadow: 0 2px 6px rgba(24,23,21,0.18);
  z-index: 5;
  opacity: 0.92;
}
.hero-back-plate {
  position: absolute;
  inset-inline-end: 8%;
  bottom: 16%;
  width: 30%;
  max-width: 140px;
  aspect-ratio: 1 / 1;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(24,23,21,0.18);
  transform: rotate(4deg);
  z-index: 2;
}
.hero-back-plate img,
.hero-back-plate :global(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hero-stat-chip {
  position: absolute;
  inset-inline-start: 8%;
  top: 16%;
  z-index: 4;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 8px 12px;
  box-shadow: var(--shadow-lg);
  display: grid;
  gap: 2px;
  min-width: 118px;
  max-width: 150px;
  transform: rotate(-2deg);
}
.hero-stat-chip strong {
  font-size: 14px;
  color: var(--accent);
  font-weight: 850;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  line-height: 1.1;
}
.hero-stat-chip span {
  font-size: 10.5px;
  color: var(--text-muted);
  font-weight: 600;
  letter-spacing: 0.03em;
  line-height: 1.25;
}
:root[data-theme="dark"] .hero-frame { box-shadow: 0 50px 100px rgba(0,0,0,0.65), 0 12px 24px rgba(0,0,0,0.35), 0 0 0 1px rgba(73,68,49,0.5); }
:root[data-theme="dark"] .hero-frame-tape { background: linear-gradient(180deg, rgba(198,146,86,0.55), rgba(140,98,40,0.45)); }

/* Compose grid for pages that mix copy + plates */
.compose-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}
.compose-grid.with-plate {
  grid-template-rows: minmax(180px, 220px) 1fr;
}
.plate.editorial { aspect-ratio: 16 / 9; }
.plate.portrait { aspect-ratio: 4 / 5; }
.plate.square { aspect-ratio: 1 / 1; }

/* Tutor highlight card with portrait */
.tutor-highlight {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 14px;
  padding: 14px;
  background: var(--sheet);
  border: 1px solid var(--sheet-border);
  border-radius: 14px;
}
.tutor-highlight .plate { aspect-ratio: 4/5; min-height: 130px; }
.tutor-highlight h3 { margin: 0 0 4px; color: var(--ink); font-size: 15px; }
.tutor-highlight .meta-line { font-size: 12px; }
.tutor-highlight .badge-line { margin-top: 8px; }

/* Booking interaction preview */
.booking-preview {
  display: grid;
  gap: 14px;
}
.booking-card {
  background: var(--sheet-strong);
  border: 1px solid var(--sheet-border);
  border-radius: 14px;
  padding: 14px 16px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: center;
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
}
.booking-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 55%, rgba(13,89,70,0.06));
  pointer-events: none;
}
.booking-card h4 {
  margin: 0 0 4px;
  font-size: 14px;
  color: var(--ink);
`;
