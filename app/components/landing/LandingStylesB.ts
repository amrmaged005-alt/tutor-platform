export const BOOK_CSS_B = `
  gap: 14px;
}
.step-row {
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: 14px;
  padding: 16px;
  border-radius: 12px;
  background: var(--sheet);
  border: 1px solid var(--sheet-border);
  transition: transform 200ms ease, box-shadow 200ms ease;
}
.step-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: var(--chapter-soft);
  color: var(--chapter);
  clip-path: circle(0%);
  transition: clip-path 420ms cubic-bezier(0.34,1.56,0.64,1);
}
.step-row.step-revealed .step-icon {
  clip-path: circle(60%);
}
.step-row h3,
.catalog-card h3,
.trust-card h3,
.outcome-note h3 {
  margin: 0 0 5px;
  color: var(--ink);
  font-size: 16px;
  line-height: 1.3;
}
.step-row p,
.catalog-card p,
.trust-card p,
.outcome-note p {
  margin: 0;
  color: var(--muted);
  font-size: 13.5px;
  line-height: 1.62;
}
.catalog-grid,
.trust-grid,
.outcome-grid {
  display: grid;
  gap: 14px;
}
.catalog-card {
  padding: 16px;
  text-decoration: none;
  color: inherit;
  position: relative;
  overflow: hidden;
  transition: transform 200ms cubic-bezier(0.34,1.56,0.64,1), border-color 160ms ease, box-shadow 160ms ease;
}
.catalog-card:hover {
  transform: translateY(-3px) rotate(-0.8deg);
  border-color: var(--accent-border);
  box-shadow: 0 8px 28px oklch(25% 0.04 160 / 0.16);
}
.class-card-top-bar {
  position: absolute;
  top: 0;
  inset-inline-start: 0;
  inset-inline-end: 0;
  height: 3px;
  background: var(--chapter);
  transform: scaleX(0);
  transform-origin: inset-inline-start center;
  transition: transform 240ms ease;
  pointer-events: none;
}
.catalog-card.class-card:hover .class-card-top-bar {
  transform: scaleX(1);
}
.card-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 12px;
}
.avatar-mark {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--chapter-soft);
  border: 1px solid var(--accent-border);
  color: var(--chapter);
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  font-weight: 850;
}
.avatar-wrap {
  position: relative;
  flex: 0 0 auto;
}
.online-dot {
  position: absolute;
  bottom: 1px;
  inset-inline-end: 1px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #22c55e;
  border: 2px solid var(--bg-card);
  animation: online-pulse 2s ease-in-out infinite;
}
@keyframes online-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.28); }
  50% { box-shadow: 0 0 0 5px rgba(34,197,94,0); }
}
@media (prefers-reduced-motion: reduce) {
  .online-dot { animation: none; }
}
.badge-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 10px;
}
.book-badge {
  border: 1px solid var(--sheet-border);
  background: var(--sheet-strong);
  color: var(--muted);
  border-radius: 999px;
  padding: 4px 9px;
  font-size: 11px;
  font-weight: 700;
}
.book-badge.price-badge-bronze {
  background: var(--bronze);
  border-color: var(--bronze);
  color: #fff;
}
.meta-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  color: var(--text-muted);
  font-size: 12px;
}
.trust-card,
.outcome-note,
.stat-card {
  padding: 18px;
  transition: transform 200ms ease, box-shadow 200ms ease;
}
.trust-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 28px oklch(35% 0.1 160 / 0.18);
}
.outcome-note:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px oklch(30% 0.06 160 / 0.14);
}
.trust-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: var(--chapter-soft);
  color: var(--chapter);
  margin-bottom: 14px;
}
.annotation {
  border-left: 3px solid var(--chapter);
  background: color-mix(in srgb, var(--chapter-soft) 78%, transparent);
  padding: 16px 18px;
  border-radius: 0 12px 12px 0;
  color: var(--muted);
  line-height: 1.65;
  font-size: 14px;
  font-style: italic;
}
.annotation strong {
  font-style: normal;
  color: var(--ink);
  text-decoration: underline;
  text-decoration-style: wavy;
  text-decoration-color: var(--chapter);
  text-underline-offset: 3px;
}
.bookmark-rail {
  position: fixed;
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  z-index: 20;
  width: min(1040px, calc(100vw - 24px));
  margin: 0 auto;
  display: flex;
  gap: 8px;
  padding: 0;
  overflow-x: auto;
  scrollbar-width: none;
  backdrop-filter: blur(12px) saturate(160%);
  -webkit-backdrop-filter: blur(12px) saturate(160%);
}
.bookmark-rail::-webkit-scrollbar { display: none; }
.bookmark-rail a {
  flex: 0 0 auto;
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  position: relative;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  padding: 0 12px;
  background: var(--bookmark-bg);
  color: var(--muted);
  text-decoration: none;
  font-size: 12px;
  font-weight: 750;
}
.bookmark-rail a.active {
  color: var(--ink);
  border-color: var(--accent-border);
  background: var(--sheet-strong);
}
.bookmark-active-dot {
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--chapter);
  pointer-events: none;
}
.book-page-controls {
  position: absolute;
  inset-inline-end: 22px;
  inset-block-start: 22px;
  z-index: 18;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  background: var(--bookmark-bg);
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(8px) saturate(140%);
  -webkit-backdrop-filter: blur(8px) saturate(140%);
}
.book-page-controls button {
  min-height: 32px;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  background: var(--bg-card);
  color: var(--text);
  padding: 0 12px;
  font: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: background 160ms ease, transform 120ms ease;
}
.book-page-controls button:hover:not(:disabled) {
  background: var(--chapter-soft);
  color: var(--chapter);
  transform: translateY(-1px);
}
.book-page-controls button:disabled {
  opacity: 0.45;
  cursor: default;
}
.book-page-controls span {
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 800;
  min-width: 42px;
  text-align: center;
}
.book-mobile-scroll {
  height: auto;
  overflow: visible;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: none;
  overscroll-behavior-y: auto;
  scroll-behavior: smooth;
  touch-action: pan-y;
}
.book-mobile-page {
  min-height: auto;
  overflow: visible;
  scroll-snap-align: none;
  scroll-snap-stop: normal;
  padding: 1rem 0.875rem;
  display: grid;
  place-items: center;
  touch-action: pan-y;
  scroll-margin-top: 76px;
}
.book-mobile-card {
  width: min(100%, 430px);
  max-height: none;
  overflow-y: auto;
  overscroll-behavior: auto;
  background: linear-gradient(145deg, var(--paper), var(--paper-alt));
  border: 1px solid var(--paper-edge);
  border-radius: 16px 10px 10px 16px;
  box-shadow: 0 14px 34px var(--paper-shadow);
  padding: 1rem;
  transform-origin: left center;
  will-change: transform, opacity;
  touch-action: pan-y;
}
.book-mobile-page.is-active .book-mobile-card {
  animation: mobilePageFlipIn 260ms ease-out both;
}
.book-mobile-card .book-page {
  padding: 0;
}
.book-mobile-card .book-page.left {
  border: 0;
  padding-bottom: 0.875rem;
  margin-bottom: 0.875rem;
  border-bottom: 1px solid var(--paper-line);
}
.book-mobile-card .book-page.right {
  min-height: 0;
}
.book-mobile-card .book-heading {
  font-size: clamp(1.45rem, 8vw, 2rem);
  line-height: 1.05;
  letter-spacing: -0.04em;
  margin-bottom: 0.75rem;
}
.book-mobile-card .book-heading.medium {
  font-size: clamp(1.35rem, 7vw, 1.85rem);
}
.book-mobile-card .book-copy {
  font-size: 0.92rem;
  line-height: 1.48;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.book-mobile-card .book-actions {
  margin-top: 0.875rem;
  gap: 0.5rem;
}
.book-mobile-card .book-btn,
.book-mobile-card .book-btn-secondary {
  min-height: 44px;
  padding: 0 0.875rem;
  font-size: 13px;
  flex: 0 0 auto;
}
.book-mobile-card .stat-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
  margin-top: 1rem;
}
.book-mobile-card .stat-card,
.book-mobile-card .trust-card,
.book-mobile-card .outcome-note,
.book-mobile-card .catalog-card,
.book-mobile-card .toc-card,
.book-mobile-card .step-row {
  padding: 0.7rem;
  border-radius: 10px;
}
.book-mobile-card .stat-card strong {
  font-size: 1.1rem;
}
.book-mobile-card .stat-card span,
.book-mobile-card .toc-card span,
.book-mobile-card .step-row p,
.book-mobile-card .catalog-card p,
.book-mobile-card .trust-card p,
.book-mobile-card .outcome-note p,
.book-mobile-card .annotation {
  font-size: 12px;
  line-height: 1.42;
}
.book-mobile-card .toc-grid,
.book-mobile-card .step-list,
.book-mobile-card .catalog-grid,
.book-mobile-card .trust-grid,
.book-mobile-card .outcome-grid {
  gap: 0.5rem;
}
.book-mobile-card .toc-card {
  min-height: 0;
  grid-template-columns: 34px 1fr;
}
.book-mobile-card .toc-card svg {
  display: none;
}
.book-mobile-card .toc-num,
.book-mobile-card .step-icon,
.book-mobile-card .trust-icon {
  width: 32px;
  height: 32px;
  border-radius: 9px;
}
.book-mobile-card .step-row {
  grid-template-columns: 34px 1fr;
  gap: 0.65rem;
}
.book-mobile-card .step-row h3,
.book-mobile-card .catalog-card h3,
.book-mobile-card .trust-card h3,
.book-mobile-card .outcome-note h3 {
  font-size: 13px;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.book-mobile-card .catalog-card p,
.book-mobile-card .trust-card p,
.book-mobile-card .outcome-note p,
.book-mobile-card .annotation {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.book-mobile-card .cover-visual {
  min-height: 150px;
}
.book-mobile-card .cover-stack {
  width: min(150px, 54vw);
}
.book-mobile-card .cover-board {
  padding: 1rem;
}
.book-mobile-card .cover-page-front,
.book-mobile-card .cover-page-back {
  display: none;
}
.book-mobile-card .cover-board h2 {
  font-size: 1.55rem !important;
}
.book-mobile-progress {
  position: fixed;
  inset-inline: 0;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 0.75rem);
  z-index: 22;
  display: flex;
  justify-content: center;
  gap: 0.45rem;
  pointer-events: none;
}
.book-mobile-progress span {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--border);
  transition: width 180ms ease, background 180ms ease;
}
.book-mobile-progress span.active {
  width: 22px;
`;
