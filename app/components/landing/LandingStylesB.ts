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
}
.step-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: var(--chapter-soft);
  color: var(--chapter);
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
  transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}
.catalog-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent-border);
  box-shadow: var(--shadow-md);
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
}
.bookmark-rail::-webkit-scrollbar { display: none; }
.bookmark-rail a {
  flex: 0 0 auto;
  min-height: 36px;
  display: inline-flex;
  align-items: center;
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
.book-mobile-scroll {
  height: 100dvh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: y mandatory;
  overscroll-behavior-y: contain;
  scroll-behavior: smooth;
  touch-action: pan-y;
}
.book-mobile-page {
  height: 100dvh;
  min-height: 100dvh;
  overflow: hidden;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  padding: calc(64px + 0.875rem) 0.875rem 4.75rem;
  display: grid;
  place-items: center;
  touch-action: pan-y;
}
.book-mobile-card {
  width: min(100%, 430px);
  max-height: calc(100dvh - 8.9rem);
  overflow: hidden;
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
  letter-spacing: 0;
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
  min-height: 40px;
  padding: 0 0.875rem;
  font-size: 13px;
  flex: 1 1 130px;
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
