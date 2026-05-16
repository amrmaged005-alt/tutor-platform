# Codex Handoff — Coursaty Tutoring Platform

Last Claude session: 2026-05-16  
Status: **Two tasks are incomplete and need finishing.**

---

## Project Overview

**Coursaty** — Egypt's tutoring marketplace. Next.js 16 App Router, Prisma + Supabase (PostgreSQL), NextAuth v5, Paymob payments, Resend email, Tailwind CSS v4 (PostCSS mode, no shadcn/ui).

Working directory: `/` (repo root)  
Dev command: `npm run dev`  
Build: `npx next build` (currently passes clean — 0 TS errors, 25 routes)

---

## What Was Completed This Session

All of the below are **done and committed**:

| Area | What changed |
|------|-------------|
| Security | `app/actions/bookings.ts` — capacity check moved inside Prisma `Serializable` transaction (prevents overbooking race condition) |
| Security | `app/api/webhooks/paymob/route.ts` — added amount, currency, and integration-ID validation beyond HMAC |
| Security | `app/api/reviews/route.ts`, `app/api/classes/route.ts`, `app/api/admin/verify-user/route.ts` — CSRF same-origin guard added |
| Security | `app/api/signup/route.ts` — IP-based rate limiting via `@upstash/ratelimit` |
| Security | `next.config.ts` — Replaced all Stripe CSP references with Paymob + Google Fonts; added email-verification env flag |
| UI | `app/booking-confirmed/page.tsx` — Full rewrite: removed decorative orbs/emojis, added lucide status icons, clean booking detail card |
| UI | `app/Landing.tsx` — `useReducedMotion` throughout; bento grid section; all custom SVGs replaced with lucide-react; redesigned stats/steps/testimonials/FAQ |
| UI | `app/tutors/TutorCard.tsx` — Replaced inline SVG `MapPin` + checkmark polyline with `MapPin`, `Check`, `Star` from lucide-react |
| UI | `app/globals.css` — Added `@media (prefers-reduced-motion: reduce)` block |
| Build | `npx tsc --noEmit` → 0 errors. `npx next build` → clean. |

---

## Two Pending Tasks

### Task 1 — Fix Hydration Error in ThemeToggle (HIGH PRIORITY)

**Error message** the user is seeing in browser dev tools:
```
Hydration failed because the server rendered HTML didn't match the client.
components/NavbarClient.tsx (36:13) @ ThemeToggle
- aria-label="Switch to dark mode"   ← server (theme defaults to "light")
+ aria-label="Switch to light mode"  ← client (localStorage says "dark")
```

**Root cause:**  
`components/NavbarClient.tsx` — `ThemeToggle` component renders a Sun or Moon icon based on `theme` from `useTheme()`. The server has no localStorage access, so it always starts with `theme = "light"` and renders the Moon icon. If the user's stored preference is `"dark"`, the client renders the Sun icon. Mismatch → hydration error.

The `ThemeProvider` in `app/components/Theme.tsx` initialises state like this:
```ts
const [theme, setThemeState] = useState<Theme>(() => {
  if (typeof document === "undefined") return "light";  // server always returns "light"
  return (document.documentElement.getAttribute("data-theme") as Theme) || "light";
});
```
On the server `document` is undefined, so it returns `"light"`. The inline script in `app/layout.tsx` sets `data-theme` on `<html>` *before React hydrates*, but `useState`'s lazy initialiser already ran on the server with `"light"`, so it sent that HTML to the client. The client then reads `"dark"` from `data-theme` and diverges.

**Fix to apply** in `components/NavbarClient.tsx`:

Make `ThemeToggle` defer rendering until after mount (avoids the SSR/client mismatch without changing the provider):

```tsx
function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Render a size-matching placeholder until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div
        style={{
          width: compact ? 36 : 60,
          height: 36,
          borderRadius: compact ? 8 : 999,
          border: "1px solid var(--border-light)",
          display: "inline-flex",
        }}
        aria-hidden="true"
      />
    );
  }

  const Icon = theme === "dark" ? Sun : Moon;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        background: "transparent",
        border: "1px solid var(--border-light)",
        borderRadius: compact ? 8 : 999,
        width: compact ? 36 : "auto",
        height: 36,
        padding: compact ? 0 : "0 12px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        color: "var(--text-secondary)",
        cursor: "pointer",
        transition: "background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-alt)"; e.currentTarget.style.color = "var(--text)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}
    >
      <Icon size={16} strokeWidth={1.8} />
    </button>
  );
}
```

Same fix should be applied to `LangToggle` in the same file if it has the same pattern.

After making this change, run `npx next build` to confirm no new TS errors.

---

### Task 2 — Integrate Book Landing Page (`book-landing.html` → `/book` Next.js route)

**Context:**  
A standalone `book-landing.html` was created in the repo root. It is a self-contained 3D book-opening interactive landing page (vanilla HTML/CSS/JS). The user wants it converted into a proper Next.js route at `/book`.

**Design decisions already made:**
- Route: `app/book/page.tsx` (new)
- Client component: `app/book/BookClient.tsx` (new)  
- The book overlays fullscreen (`position: fixed; inset: 0; z-index: 9999`) — it visually covers the Navbar/Footer from the root layout without needing a separate root layout
- All element IDs prefixed with `bk-` to avoid collisions
- `document.body.style.overflow = 'hidden'` set on mount (only on desktop ≥861px), restored on unmount
- Content: Coursaty-branded (not generic "The Story")
- Mobile (<860px): hide the 3D scene, show vertical card fallback

**Fonts needed:** Add `Playfair Display` and `Lora` to the existing Google Fonts `<link>` in `app/layout.tsx`:

```html
<!-- current -->
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

<!-- replace with -->
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet" />
```

**File: `app/book/page.tsx`** (simple server wrapper):
```tsx
import type { Metadata } from "next";
import BookClient from "./BookClient";

export const metadata: Metadata = {
  title: "Coursaty — An Interactive Story",
  description:
    "Discover Coursaty through an interactive book experience. Find verified tutors for Math, Physics, IGCSE, and more across Egypt.",
};

export default function BookPage() {
  return <BookClient />;
}
```

**File: `app/book/BookClient.tsx`** — Full client component.

The component structure:
```
BookClient (client component)
  <style>{BOOK_CSS}</style>           ← all CSS as template literal
  <div id="bk-root">                  ← position:fixed; inset:0; z-index:9999; background:#1a1008
    <a id="bk-back-btn" href="/">     ← top-left "← Back to Coursaty"
    <div id="bk-scene">              ← perspective:2200px
      <div id="bk-book">
        <div id="bk-page-stack" />   ← decorative right-edge stacking
        {/* 6 spreads: bk-spread-0 through bk-spread-5 */}
        <div id="bk-flip-layer">     ← the flip mechanism
          <div id="bk-flip-front"><div id="bk-flip-front-inner" /></div>
          <div id="bk-flip-back"><div id="bk-flip-back-inner" /></div>
        </div>
        <div id="bk-spine" />
        <div id="bk-cover-left" className="bk-cover bk-cover-left"> ... </div>
        <div id="bk-cover-right" className="bk-cover bk-cover-right"> ... </div>
      </div>
    </div>
    <div id="bk-ribbon">             ← right-edge progress bookmark
      <div id="bk-ribbon-fill" />
      <div id="bk-ribbon-marker" />
    </div>
    <nav id="bk-controls">           ← Prev / indicator / Next buttons
      <button id="bk-prev" />
      <span id="bk-indicator" />
      <button id="bk-next" />
    </nav>
    <button id="bk-sound-btn" />     ← top-right sound toggle
  </div>
  <div id="bk-mobile">              ← mobile card fallback (display:none on desktop)
    ...cards...
  </div>
```

**The 6 spreads — Coursaty content:**

| # | Left page | Right page |
|---|-----------|------------|
| 0 | Ornamental cover left (logo quote, icon) | Headline "Find the Right Tutor. First Time." + CTA "Browse Classes" + subject tags |
| 1 | Ch. I "Finding Good Tutors Shouldn't Be This Hard" — body text about the problem | 4 pain-point feature cards: No vetting, Word of mouth, Price opacity, Schedule chaos |
| 2 | Ch. II "A Better Way to Learn" — intro text | 3 steps: Search & filter → Book in seconds → Learn with confidence |
| 3 | Ch. III "Built for Egypt's Students" — feature grid (4 items) | 4 more feature items + stat: "Join thousands already learning" |
| 4 | Ch. IV "What Our Students Say" — 2 testimonials | 1 testimonial + aggregate rating (4.9 ★ from 1,800+ reviews) |
| 5 | "Your Perfect Tutor Awaits" — primary CTA "Browse Classes" + secondary "Find a Tutor" | "Are You a Tutor?" signup section + social links + footer note |

**CSS classes (all prefixed `bk-`):**

```
Layout/container: #bk-root, #bk-scene, #bk-book, #bk-page-stack, #bk-spine
Covers: .bk-cover, .bk-cover-left, .bk-cover-right, .bk-cover-open (animation class),
        .bk-cover-inset, .bk-cover-body
Spreads/pages: .bk-spread, .bk-page-left, .bk-page-right, .bk-page-inner
Flip: #bk-flip-layer, #bk-flip-front, #bk-flip-back, #bk-flip-front-inner, #bk-flip-back-inner
      .bk-flip-closed, .bk-flip-mid, .bk-flip-open  (state classes)
Typography: .bk-eyebrow, .bk-heading, .bk-heading-lg, .bk-body, .bk-divider,
            .bk-pull-quote, .bk-ornament, .bk-page-num, .bk-drop-cap
Components: .bk-feature-grid, .bk-feature, .bk-steps, .bk-step, .bk-step-num,
            .bk-testimonial, .bk-t-author, .bk-avatar, .bk-stars,
            .bk-email-form, .bk-email-input, .bk-social-links, .bk-social,
            .bk-tags, .bk-tag, .bk-illus, .bk-illus-ring, .bk-illus-label
Buttons: .bk-btn, .bk-btn-secondary, .bk-ctrl-btn
UI chrome: #bk-ribbon, #bk-ribbon-fill, #bk-ribbon-marker,
           #bk-controls, #bk-prev, #bk-next, #bk-indicator,
           #bk-sound-btn, #bk-back-btn
Mobile: #bk-mobile, .bk-m-cover, .bk-m-page
```

**Design tokens for the book (inside the `<style>` string, NOT the site's globals.css):**
```css
--bk-parchment:  #FDF6E3
--bk-parchment-alt: #F5EDD0
--bk-text:       #2C1810
--bk-muted:      #6B4F3A
--bk-spine:      #7B2D42
--bk-cta:        #F59E0B
--bk-cta-hover:  #D97706
--bk-bg:         #1A1008
```

**Keyframe animations:**
```css
@keyframes bkOpenLeft {
  0%   { transform: rotateY(0deg); }
  60%  { transform: rotateY(-185deg); }
  80%  { transform: rotateY(-168deg); }
  100% { transform: rotateY(-172deg); }
}
@keyframes bkOpenRight {
  0%   { transform: rotateY(0deg); }
  60%  { transform: rotateY(185deg); }
  80%  { transform: rotateY(168deg); }
  100% { transform: rotateY(172deg); }
}
.bk-cover-left.bk-open  { animation: bkOpenLeft  1.3s cubic-bezier(0.22,1,0.36,1) forwards; }
.bk-cover-right.bk-open { animation: bkOpenRight 1.3s cubic-bezier(0.22,1,0.36,1) forwards; }
```

**Flip state CSS (two-phase ease-in → ease-out):**
```css
#bk-flip-layer.bk-flip-closed {
  transform: rotateY(0deg);
  filter: drop-shadow(4px 0 10px rgba(0,0,0,0.3));
  transition: transform 340ms ease-out, filter 340ms ease-out;
}
#bk-flip-layer.bk-flip-mid {
  transform: rotateY(-90deg);
  filter: drop-shadow(0 0 22px rgba(0,0,0,0.55));
  transition: transform 340ms ease-in, filter 340ms ease-in;
}
#bk-flip-layer.bk-flip-open {
  transform: rotateY(-180deg);
  filter: drop-shadow(-4px 0 10px rgba(0,0,0,0.2));
  transition: transform 340ms ease-out, filter 340ms ease-out;
}
```

**The JS logic (in `useEffect`):**

```ts
useEffect(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = window.innerWidth > 860;
  const FLIP_DUR = 680; // ms total (340ms each half)
  const TOTAL = 6;
  const LABELS = ['Cover', 'Chapter I', 'Chapter II', 'Chapter III', 'Chapter IV', 'Epilogue'];
  const state = { cur: 0, flipping: false, sound: false, wheelAcc: 0, touchX: 0 };

  // Disable body scroll on desktop
  let prevOverflow = '';
  if (isDesktop) { prevOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; }

  // DOM refs
  const $ = (id: string) => document.getElementById(id);
  const coverL = $('bk-cover-left'), coverR = $('bk-cover-right');
  const flipLayer = $('bk-flip-layer') as HTMLElement;
  const flipFrontIn = $('bk-flip-front-inner') as HTMLElement;
  const flipBackIn  = $('bk-flip-back-inner')  as HTMLElement;
  const btnPrev = $('bk-prev') as HTMLButtonElement;
  const btnNext = $('bk-next') as HTMLButtonElement;
  const indicator = $('bk-indicator');
  const ribbonFill = $('bk-ribbon-fill') as HTMLElement;
  const ribbonMarker = $('bk-ribbon-marker') as HTMLElement;
  const soundBtn = $('bk-sound-btn');

  // Content helpers — read innerHTML from rendered spread elements
  const getRightHTML = (i: number) =>
    document.querySelector(`#bk-spread-${i} .bk-page-right .bk-page-inner`)?.innerHTML ?? '';
  const getLeftHTML  = (i: number) =>
    document.querySelector(`#bk-spread-${i} .bk-page-left .bk-page-inner`)?.innerHTML ?? '';

  // Snap position without transition (prevents ghost animation on reset)
  function snap(cls: string) {
    flipLayer.style.transition = 'none';
    flipLayer.className = cls;
    void flipLayer.offsetHeight; // force reflow
    flipLayer.style.transition = '';
  }

  function updateUI() {
    btnPrev.disabled = state.cur === 0;
    btnNext.disabled = state.cur === TOTAL - 1;
    if (indicator) indicator.textContent = LABELS[state.cur];
    const pct = (state.cur / (TOTAL - 1)) * 100;
    ribbonFill.style.height  = pct + '%';
    ribbonMarker.style.top   = (pct / 100 * window.innerHeight) + 'px';
  }

  function reorder() {
    for (let i = 0; i < TOTAL; i++) {
      const el = $(`bk-spread-${i}`) as HTMLElement | null;
      if (!el) continue;
      // Spreads ahead of current stack above (so they're visible peeking behind)
      // Current spread on top, past spreads below
      el.style.zIndex = String(i === state.cur ? 60 : i < state.cur ? i * 5 : 55 - i * 5);
    }
  }

  function flipTo(target: number) {
    if (state.flipping || target < 0 || target >= TOTAL || target === state.cur) return;
    const fwd = target > state.cur;
    state.flipping = true;

    if (prefersReduced) {
      snap(fwd ? 'bk-flip-open' : 'bk-flip-closed');
      state.cur = target; reorder(); updateUI();
      state.flipping = false;
      return;
    }

    if (fwd) {
      flipFrontIn.innerHTML = getRightHTML(state.cur);
      flipBackIn.innerHTML  = getLeftHTML(target);
      snap('bk-flip-closed');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        flipLayer.className = 'bk-flip-mid';
      }));
      setTimeout(() => {
        flipLayer.className = 'bk-flip-open';
        state.cur = target; reorder(); updateUI();
      }, FLIP_DUR / 2);
    } else {
      flipFrontIn.innerHTML = getRightHTML(target);
      flipBackIn.innerHTML  = getLeftHTML(state.cur);
      snap('bk-flip-open');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        flipLayer.className = 'bk-flip-mid';
      }));
      setTimeout(() => {
        flipLayer.className = 'bk-flip-closed';
        state.cur = target; reorder(); updateUI();
      }, FLIP_DUR / 2);
    }
    setTimeout(() => { state.flipping = false; }, FLIP_DUR + 80);
  }

  // Open book on mount
  setTimeout(() => {
    coverL?.classList.add('bk-open');
    coverR?.classList.add('bk-open');
  }, prefersReduced ? 0 : 380);

  // Event handlers
  const onPrev  = () => flipTo(state.cur - 1);
  const onNext  = () => flipTo(state.cur + 1);
  const onKey   = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); flipTo(state.cur + 1); }
    if (e.key === 'ArrowLeft'  || e.key === 'PageUp')   { e.preventDefault(); flipTo(state.cur - 1); }
  };
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    state.wheelAcc += e.deltaY;
    if (Math.abs(state.wheelAcc) >= 100) {
      flipTo(state.cur + (state.wheelAcc > 0 ? 1 : -1));
      state.wheelAcc = 0;
    }
  };
  const onTouchStart = (e: TouchEvent) => { state.touchX = e.touches[0].clientX; };
  const onTouchEnd   = (e: TouchEvent) => {
    const dx = e.changedTouches[0].clientX - state.touchX;
    if (Math.abs(dx) > 50) flipTo(state.cur + (dx < 0 ? 1 : -1));
  };
  const onSound = () => {
    state.sound = !state.sound;
    if (soundBtn) {
      soundBtn.textContent = state.sound ? '🔊 Sound' : '🔇 Sound';
      soundBtn.setAttribute('aria-pressed', String(state.sound));
    }
  };

  btnPrev.addEventListener('click', onPrev);
  btnNext.addEventListener('click', onNext);
  soundBtn?.addEventListener('click', onSound);
  document.addEventListener('keydown', onKey);
  if (isDesktop) {
    document.addEventListener('wheel', onWheel, { passive: false });
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchend',   onTouchEnd,   { passive: true });
  }

  // Init
  snap('bk-flip-closed');
  reorder();
  updateUI();

  return () => {
    if (isDesktop) document.body.style.overflow = prevOverflow;
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('wheel', onWheel);
    document.removeEventListener('touchstart', onTouchStart);
    document.removeEventListener('touchend', onTouchEnd);
    btnPrev.removeEventListener('click', onPrev);
    btnNext.removeEventListener('click', onNext);
    soundBtn?.removeEventListener('click', onSound);
  };
}, []);
```

**After the book route is built:**
- Add a link from `app/Landing.tsx` hero section or CTA strip: `<Link href="/book">Experience the Interactive Book →</Link>`
- Run `npx tsc --noEmit && npx next build` to verify

---

## Key Files Reference

```
app/
  layout.tsx              ← root layout; add Playfair Display + Lora to the Google Fonts link
  page.tsx                ← main landing (server component, fetches real DB data)
  Landing.tsx             ← main landing client component (large, 900+ lines)
  globals.css             ← CSS custom properties design system
  Navbar.tsx              ← server wrapper that calls NavbarClient
  book/
    page.tsx              ← NEW: simple metadata wrapper
    BookClient.tsx        ← NEW: fullscreen book experience client component
  booking-confirmed/page.tsx
  actions/bookings.ts
  api/
    webhooks/paymob/route.ts
    classes/route.ts
    reviews/route.ts
    signup/route.ts
    admin/verify-user/route.ts
  components/
    Theme.tsx             ← ThemeProvider + useTheme hook
    FooterContent.tsx

components/
  NavbarClient.tsx        ← ThemeToggle lives here; has the hydration bug

lib/
  prisma.ts
  auth.ts
  paymob.ts
  ratelimit.ts            ← generalLimiter, authLimiter, bookingLimiter, reviewLimiter
  audit.ts

book-landing.html         ← standalone prototype (source of truth for the book experience)
                             DO NOT delete — useful reference while building BookClient.tsx
```

---

## Environment / Config Notes

- `REQUIRE_EMAIL_VERIFICATION` env var — set to `"true"` in prod to gate bookings behind email verification (implemented but off by default)
- `PAYMOB_INTEGRATION_ID` env var — used in webhook validation to reject mismatched integration IDs
- Supabase connection via `DATABASE_URL` in `.env`
- Rate limiting via `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`

---

## Verification Checklist After Both Tasks

```bash
npx tsc --noEmit          # must show 0 errors
npx next build            # must complete successfully
# Browser: check / route — no hydration error in console
# Browser: check /book route — 3D book opens, pages flip, mobile shows cards
```
