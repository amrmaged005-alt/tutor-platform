export const BOOK_CSS_D = `
  font-weight: 800;
}
.booking-card p {
  margin: 0;
  font-size: 12px;
  color: var(--muted);
  line-height: 1.4;
}
.booking-cta {
  position: relative;
  min-width: 110px;
  height: 38px;
  border-radius: 10px;
  background: var(--accent);
  color: var(--accent-fg);
  border: 1px solid var(--accent);
  font-weight: 750;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: background 200ms ease;
}
.booking-cta[data-state="booking"] { background: var(--accent-hover); }
.booking-cta[data-state="confirmed"] {
  background: var(--success);
  color: var(--accent-fg);
}
.booking-cta-text {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: opacity 220ms ease, transform 220ms ease;
}
.booking-cta-progress {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08));
  transform-origin: left center;
  transform: scaleX(0);
  transition: transform 1400ms linear;
  pointer-events: none;
}
.booking-cta[data-state="booking"] .booking-cta-progress { transform: scaleX(1); }
.booking-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--accent);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 240ms ease, transform 240ms ease;
}
.booking-status.show { opacity: 1; transform: translateY(0); }
.dashboard-row {
  display: grid;
  grid-template-columns: 32px 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px dashed var(--border);
  background: color-mix(in srgb, var(--bg-card) 60%, transparent);
  font-size: 12px;
  color: var(--muted);
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 320ms ease, transform 320ms ease, border-color 320ms ease, background 320ms ease;
}
.dashboard-row strong { color: var(--ink); font-weight: 700; }
.dashboard-row.show {
  opacity: 1;
  transform: translateY(0);
  border-color: var(--accent-border);
  background: var(--accent-bg-soft);
}
.dashboard-row .dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-bg);
}

/* Search reveal preview on the find page */
.search-preview {
  display: grid;
  gap: 10px;
  background: var(--sheet-strong);
  border: 1px solid var(--sheet-border);
  border-radius: 14px;
  padding: 14px;
}
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 12px;
}
.search-bar .typed {
  color: var(--ink);
  font-weight: 600;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
}
.search-bar .caret {
  display: inline-block;
  width: 1px;
  height: 14px;
  background: var(--accent);
  margin-inline-start: 2px;
  animation: caret-blink 1s steps(2) infinite;
}
@keyframes caret-blink { 50% { opacity: 0; } }
.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.chip {
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--muted);
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
  transition: background 200ms ease, color 200ms ease, border-color 200ms ease;
}
.chip.active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--accent-fg);
}

@media (max-width: 900px) {
  .hero-visual { min-height: 340px; }
  .hero-frame { width: min(280px, 80%); }
  .hero-back-plate { width: 42%; }
  .hero-stat-chip { min-width: 116px; padding: 8px 10px; }
  .hero-stat-chip strong { font-size: 15px; }
}
.book-mobile-card .hero-visual { min-height: 200px; }
.book-mobile-card .hero-frame { width: min(180px, 56vw); border-radius: 14px; }
.book-mobile-card .hero-frame-tape { width: 70px; height: 18px; }
.book-mobile-card .hero-back-plate { display: none; }
.book-mobile-card .hero-stat-chip { transform: rotate(-2deg) scale(0.9); }
.book-mobile-card .plate.editorial { aspect-ratio: 16/10; }
.book-mobile-card .tutor-highlight { grid-template-columns: 78px 1fr; padding: 10px; }
.book-mobile-card .booking-card { padding: 10px 12px; }
.book-mobile-card .booking-cta { min-width: 92px; height: 34px; font-size: 12px; }

/* ── Dashboard preview mock ─────────────────────────────── */
.dashboard-mock {
  background: var(--sheet-strong);
  border: 1px solid var(--sheet-border);
  border-radius: 14px;
  padding: 14px;
  display: grid;
  gap: 10px;
  box-shadow: var(--shadow-sm);
}
.dashboard-mock-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.dashboard-mock-header h4 {
  margin: 0;
  font-size: 13px;
  font-weight: 800;
  color: var(--ink);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.dashboard-mock-header .pill {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
  background: var(--accent-bg);
  border: 1px solid var(--accent-border);
  border-radius: 999px;
  padding: 3px 8px;
}
.dashboard-mock-row {
  display: grid;
  grid-template-columns: 8px 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  transition: border-color 220ms ease, background 220ms ease, opacity 220ms ease;
  opacity: 0;
  transform: translateY(6px);
}
.dashboard-mock.in-view .dashboard-mock-row {
  opacity: 1;
  transform: translateY(0);
}
.dashboard-mock.in-view .dashboard-mock-row:nth-child(2) { transition-delay: 80ms; }
.dashboard-mock.in-view .dashboard-mock-row:nth-child(3) { transition-delay: 180ms; }
.dashboard-mock.in-view .dashboard-mock-row:nth-child(4) { transition-delay: 280ms; }
.dashboard-mock-row .swatch {
  width: 6px;
  height: 26px;
  border-radius: 99px;
  background: var(--accent);
}
.dashboard-mock-row .swatch.gold { background: var(--rating); }
.dashboard-mock-row .swatch.teal { background: #1c6e7a; }
.dashboard-mock-row strong {
  font-size: 13px;
  color: var(--ink);
  font-weight: 750;
  display: block;
  line-height: 1.25;
}
.dashboard-mock-row .row-sub {
  font-size: 11px;
  color: var(--muted);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.dashboard-mock-row .status {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 4px 9px;
  border-radius: 999px;
  background: var(--accent-bg);
  color: var(--accent);
  border: 1px solid var(--accent-border);
  white-space: nowrap;
}
.dashboard-mock-row .status.pending {
  background: var(--warning-bg);
  color: var(--warning);
  border-color: color-mix(in srgb, var(--warning) 32%, transparent);
}
.dashboard-mock-row .status.upcoming {
  background: rgba(28,110,122,0.10);
  color: #1c6e7a;
  border-color: rgba(28,110,122,0.30);
}

/* ── Mini tutor row (cover spread) ─────────────────────────────── */
.mini-tutor-row {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(150px, 1fr);
  gap: 8px;
  margin-top: 14px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-bottom: 4px;
}
.mini-tutor-row::-webkit-scrollbar { display: none; }
.mini-tutor-chip {
  scroll-snap-align: start;
  background: var(--sheet);
  border: 1px solid var(--sheet-border);
  border-radius: 12px;
  padding: 10px 12px;
  display: grid;
  grid-template-columns: 34px 1fr;
  gap: 10px;
  align-items: center;
  text-decoration: none;
  color: inherit;
  transition: transform 180ms ease, border-color 180ms ease;
  min-width: 0;
}
.mini-tutor-chip:hover {
  transform: translateY(-2px);
  border-color: var(--accent-border);
}
.mini-tutor-chip .avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--accent-bg);
  color: var(--accent);
  display: grid;
  place-items: center;
  font-weight: 850;
  font-size: 13px;
  overflow: hidden;
  flex: 0 0 auto;
}
.mini-tutor-chip .avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.mini-tutor-chip strong {
  font-size: 12.5px;
  font-weight: 750;
  color: var(--ink);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}
.mini-tutor-chip .meta {
  font-size: 10.5px;
  color: var(--muted);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 3px;
}
.book-mobile-card .mini-tutor-row { grid-auto-columns: minmax(140px, 1fr); margin-top: 12px; }
.book-mobile-card .mini-tutor-chip { padding: 8px 10px; grid-template-columns: 28px 1fr; gap: 8px; }
.book-mobile-card .mini-tutor-chip .avatar { width: 28px; height: 28px; font-size: 11px; }
.book-mobile-card .dashboard-mock { padding: 10px; gap: 8px; }
.book-mobile-card .dashboard-mock-row { padding: 8px 10px; }
`;
