export const BOOK_CSS_A = `
.book-landing {
  --paper: #fbfaf6;
  --paper-alt: #f4efe2;
  --paper-edge: #ddd3bd;
  --paper-shadow: rgba(24,23,21,0.16);
  --paper-gutter: rgba(24,23,21,0.10);
  --paper-line: rgba(24,23,21,0.08);
  --sheet: rgba(255,255,255,0.58);
  --sheet-strong: rgba(255,255,255,0.72);
  --sheet-border: rgba(216,212,199,0.86);
  --wash-a: rgba(13,89,70,0.055);
  --wash-b: rgba(138,90,20,0.05);
  --bronze: #8a5a14;
  --bookmark-bg: color-mix(in srgb, var(--bg-card) 90%, transparent);
  --book-backdrop:
    radial-gradient(ellipse at 50% 0%, rgba(13,89,70,0.10), transparent 42%),
    linear-gradient(180deg, var(--bg), var(--bg-alt));
  --ink: var(--text);
  --muted: var(--text-secondary);
  --chapter: var(--accent);
  --chapter-soft: var(--accent-bg);
  background: var(--book-backdrop);
  color: var(--ink);
  font-family: var(--font-sans);
  overflow-x: clip;
}
:root[data-theme="dark"] .book-landing {
  --paper: #242218;
  --paper-alt: #1d1b14;
  --paper-edge: #494431;
  --paper-shadow: rgba(0,0,0,0.58);
  --paper-gutter: rgba(0,0,0,0.42);
  --paper-line: rgba(240,238,229,0.10);
  --sheet: rgba(42,40,32,0.78);
  --sheet-strong: rgba(49,46,36,0.92);
  --sheet-border: rgba(87,82,62,0.92);
  --wash-a: rgba(63,174,140,0.08);
  --wash-b: rgba(198,146,86,0.07);
  --bookmark-bg: rgba(35,33,24,0.90);
  --book-backdrop:
    radial-gradient(ellipse at 50% 0%, rgba(63,174,140,0.13), transparent 44%),
    linear-gradient(180deg, #15140f, #1c1b15);
  --ink: var(--text);
  --muted: #c9c5b8;
  --bronze: #c8881e;
}
.book-landing * { box-sizing: border-box; }
.book-shell {
  width: 100%;
  margin: 0 auto;
  position: relative;
}
.book-scroll {
  position: relative;
  height: calc(var(--page-count) * 100svh);
}
.book-stage {
  position: sticky;
  top: 64px;
  height: calc(100svh - 64px);
  width: 100%;
  overflow: hidden;
  perspective: 1800px;
  perspective-origin: 50% 50%;
  transform-style: preserve-3d;
}
.book-anchor {
  position: absolute;
  inset-inline-start: 0;
  width: 1px;
  height: 1px;
  pointer-events: none;
  scroll-margin-top: 64px;
}
.book-layer {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  backface-visibility: hidden;
  will-change: transform, opacity;
}
.book-spread {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  height: 100%;
  min-height: 0;
  width: 100%;
  background: linear-gradient(90deg, var(--paper), var(--paper-alt));
  border: 1px solid var(--border-light);
  border-left: 0;
  border-right: 0;
  border-radius: 0;
  box-shadow: 0 18px 46px oklch(25% 0.04 160 / 0.22), 0 4px 12px oklch(20% 0.02 70 / 0.06);
  overflow: hidden;
  isolation: isolate;
  transform-style: preserve-3d;
  backface-visibility: hidden;
}
.book-spread::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, transparent calc(50% - 18px), var(--paper-gutter) 50%, transparent calc(50% + 18px)),
    radial-gradient(circle at 18% 8%, var(--wash-a), transparent 30%),
    radial-gradient(circle at 82% 90%, var(--wash-b), transparent 32%);
  z-index: 1;
}
.book-spread::after {
  content: "";
  position: absolute;
  inset-inline-end: 0;
  top: 18px;
  bottom: 18px;
  width: 10px;
  background: repeating-linear-gradient(to bottom, var(--paper-edge) 0 2px, color-mix(in srgb, var(--paper-edge) 72%, var(--ink)) 2px 4px);
  opacity: 0.72;
  z-index: 2;
}
.page-turn-leaf {
  position: absolute;
  inset: 0 0 0 50%;
  z-index: 4;
  pointer-events: none;
  transform-origin: left center;
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--paper) 92%, transparent), color-mix(in srgb, var(--paper-alt) 76%, transparent)),
    radial-gradient(circle at 100% 50%, var(--paper-gutter), transparent 36%);
  border-left: 1px solid var(--paper-line);
  box-shadow: -18px 0 28px rgba(0,0,0,0.14);
  backface-visibility: hidden;
  will-change: transform, opacity;
}
.book-page {
  min-width: 0;
  min-height: 0;
  position: relative;
  z-index: 3;
  padding: clamp(20px, 3vw, 42px) clamp(24px, 3.5vw, 48px);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overscroll-behavior: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--paper-edge) transparent;
}
.book-page::-webkit-scrollbar { width: 4px; }
.book-page::-webkit-scrollbar-track { background: transparent; }
.book-page::-webkit-scrollbar-thumb {
  background: var(--paper-edge);
  border-radius: 99px;
}
.book-page::after {
  content: "";
  position: sticky;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 24px;
  margin-top: -24px;
  background: linear-gradient(180deg, transparent, var(--paper));
  pointer-events: none;
  flex-shrink: 0;
}
.book-page.left { border-right: 1px solid var(--paper-line); }
.chapter-tab {
  position: absolute;
  top: 24px;
  inset-inline-end: -1px;
  z-index: 5;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  background: var(--chapter);
  color: var(--accent-fg);
  border-radius: 8px 0 0 8px;
  padding: 12px 7px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  box-shadow: var(--shadow-sm);
}
.chapter-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--chapter);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  margin-bottom: 14px;
}
.chapter-kicker::before {
  content: "";
  width: 28px;
  height: 1px;
  background: var(--chapter);
}
.book-heading {
  font-size: clamp(1.85rem, 3.6vw, 3.4rem);
  line-height: 1.02;
  letter-spacing: -0.055em;
  margin: 0 0 18px;
  color: var(--ink);
  font-weight: 900;
  text-wrap: balance;
}
.book-heading.medium {
  font-size: clamp(1.55rem, 2.8vw, 2.4rem);
  line-height: 1.08;
  letter-spacing: -0.04em;
}
.book-copy {
  color: var(--muted);
  font-size: clamp(1rem, 1.4vw, 1.12rem);
  line-height: 1.78;
  margin: 0;
}
.book-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 28px;
}
.book-btn,
.book-btn-secondary {
  min-height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 10px;
  padding: 0 18px;
  text-decoration: none;
  font-weight: 750;
  font-size: 14px;
  position: relative;
  overflow: hidden;
  transition: transform 160ms ease, background 160ms ease, border-color 160ms ease, color 160ms ease;
}
.book-btn { background: var(--accent); color: var(--accent-fg); border: 1px solid var(--accent); }
.book-btn::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.26) 50%, transparent 100%);
  transform: translateX(-200%);
  transition: transform 600ms ease;
  pointer-events: none;
}
.book-btn:hover::after { transform: translateX(200%); }
.book-btn:hover { background: var(--accent-hover); transform: translateY(-1px); }
.book-btn-secondary { background: rgba(251,250,246,0.48); color: var(--ink); border: 1px solid var(--border); }
.book-btn-secondary { background: var(--sheet); }
.book-btn-secondary:hover { border-color: var(--border-strong); transform: translateY(-1px); }
.cover-visual {
  position: relative;
  min-height: 440px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cover-stack {
  width: min(360px, 100%);
  aspect-ratio: 0.72;
  position: relative;
  transform-style: preserve-3d;
}
.cover-board,
.cover-page-front,
.cover-page-back {
  position: absolute;
  inset: 0;
  border-radius: 18px 12px 12px 18px;
  transform-origin: left center;
}
.cover-board {
  background: linear-gradient(145deg, #0d5946, #073327);
  box-shadow: 0 30px 60px oklch(22% 0.12 160 / 0.28), inset 8px 0 18px rgba(255,255,255,0.08);
  color: #fbfaf6;
  padding: 28px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.cover-page-front {
  background: var(--paper);
  border: 1px solid var(--paper-edge);
  transform: translateX(42px) rotateY(-18deg) rotateZ(1deg);
  box-shadow: 0 18px 42px oklch(20% 0.04 70 / 0.14);
}
.cover-page-back {
  background: var(--paper-alt);
  border: 1px solid var(--paper-edge);
  transform: translateX(22px) rotateY(-10deg) rotateZ(-1deg);
}
.cover-lines {
  padding: 28px;
  display: grid;
  gap: 12px;
}
.cover-lines span {
  display: block;
  height: 9px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--chapter) 20%, transparent);
}
.cover-lines span:nth-child(1) { width: 70%; height: 13px; }
.cover-lines span:nth-child(2) { width: 52%; }
.cover-lines span:nth-child(3) { width: 82%; }
.cover-lines span:nth-child(4) { width: 46%; }
.toc-grid {
  display: grid;
  gap: 12px;
}
.toc-card,
.catalog-card,
.trust-card,
.outcome-note,
.stat-card {
  background: var(--sheet);
  border: 1px solid var(--sheet-border);
  border-radius: 12px;
  box-shadow: var(--shadow-xs);
}
.toc-card {
  min-height: 76px;
  display: grid;
  grid-template-columns: 44px 1fr auto;
  align-items: center;
  gap: 14px;
  padding: 14px;
  color: inherit;
  text-decoration: none;
}
.toc-num {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--chapter-soft);
  color: var(--chapter);
  display: grid;
  place-items: center;
  font-weight: 850;
  font-size: 13px;
}
.toc-card strong { display: block; margin-bottom: 3px; }
.toc-card span { color: var(--muted); font-size: 13px; line-height: 1.45; }
.step-list {
  display: grid;
`;
