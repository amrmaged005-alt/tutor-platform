# UX/UI Audit — Coursaty Tutor Platform

**Scope:** Page-by-page UX review of the highest-traffic surfaces, the landing-page "book metaphor" concept, design-system consistency spot checks, and a simplicity audit.

**Method limitation (read before relying on this document):** No browser automation tool was available in this environment. Findings are derived from reading component source (JSX structure, conditional rendering, CSS classes/custom properties, animation library usage, `prefers-reduced-motion` handling in code) rather than live interaction or screenshots. Anything requiring visual judgment — actual spacing rhythm as rendered, real animation smoothness, computed contrast ratios, how a layout actually reflows at a given viewport — is explicitly marked "not verifiable in this pass" rather than asserted.

**Ground truth reused from prior passes:** `audit/06-content-localization-rtl-audit.md` (i18n gaps), `audit/08-functional-connections-audit.md` (dead controls / unwired buttons), `audit/09-security-accessibility-performance-seo.md` (referenced where relevant to performance/accessibility claims below).

---

## Finding format

Each finding uses: **Finding ID**, **Severity**, **Priority** (P0-P4), **Evidence** (`file:line`), **Recommendation**, **Complexity**.

---

## 1. Page-by-page UX findings

### Landing (`app/page.tsx` → `app/Landing.tsx` → `HeroSection.tsx`)

Server component fetches 6 tutors + 6 classes and passes them into a client-rendered, scroll-jacked "book" hero followed by 8 more sections (`TrendingSection`, `FeaturedTutorsSection`, `FeaturedClassesSection`, `RecommendationsSection`, `HowItWorksSection`, `StatsSection`, `TestimonialsSection`, `CTASection` — `app/Landing.tsx:24-31`). See Section 2 below for the full book-metaphor assessment (UX-001 through UX-004). Beyond the hero itself, stacking 8 additional sections after a ~600svh scroll sequence is a lot of surface area for a marketplace landing page whose job is simply "get the visitor into `/tutors` or `/classes` fast."

#### UX-005 — Landing page has 9 total sections after a heavy animated hero; likely far more than needed to convert
- **Severity:** MEDIUM | **Priority:** P2
- **Evidence:** `app/Landing.tsx:24-31` — `TrendingSection`, `FeaturedTutorsSection`, `FeaturedClassesSection`, `RecommendationsSection`, `HowItWorksSection`, `StatsSection`, `TestimonialsSection`, `CTASection`, all rendered unconditionally after the 6-chapter hero
- **Recommendation:** Merge overlapping sections (`FeaturedTutorsSection`/`FeaturedClassesSection`/`RecommendationsSection` all show similar "browse now" cards; `StatsSection` content already appears inside the hero's cover chapter via `StatCard`, `HeroSection.tsx:76-81`). Target 3-4 sections total below the hero.
- **Complexity:** Medium — content consolidation, not new engineering.

### Tutors list (`app/tutors/page.tsx` + `TutorsClient.tsx`, 783 lines)

Server component fetches 12 tutors and delegates all UX to `TutorsClient.tsx`, which implements: a desktop filter panel and a separate `MobileTutorFilterDrawer` (subject multi-select, city, min rating, search — `TutorsClient.tsx:187-344`), infinite scroll (`useInfiniteScroll`, `TutorsClient.tsx:441`), and a three-tier result segmentation (`featured` ≥4.5, `topRated` 4-4.5, `newTutors` null rating — `TutorsClient.tsx:425-427`). Uses `var(--...)` CSS custom properties consistently (80 occurrences, 0 hardcoded hex), suggesting good adherence to the shared token system on this page specifically. `TutorsClient.tsx` sits at 783 lines, just under the project's stated 800-line file-size ceiling — a legitimate refactor candidate before it grows further (filter drawer, main list, and card renderer read as three separable concerns).

#### UX-006 — Duplicate filter UI maintained in parallel (desktop panel + `MobileTutorFilterDrawer`) inside one 783-line file
- **Severity:** LOW | **Priority:** P3
- **Evidence:** `app/tutors/TutorsClient.tsx:187-344` (`MobileTutorFilterDrawer`) duplicates the subject/city/rating filter controls defined earlier in the same file for desktop (`TutorsClient.tsx:45-71` area)
- **Recommendation:** Extract a single `<TutorFilters>` presentational component parameterized by layout (`variant="panel" | "drawer"`), and split `TutorsClient.tsx` into `TutorsClient.tsx` (data/state), `TutorFilters.tsx`, and `TutorCard.tsx` — keeps each file under ~300 lines per the project's file-size guidance.
- **Complexity:** Medium.

### Tutor profile (`app/tutors/[id]/page.tsx` + `TutorProfileClient.tsx`, 613 lines)

Reasonably scoped seller-profile page: bio expand/collapse, class-type filter, review pagination toggle, sign-in modal gate for unauthenticated messaging, "start conversation" trigger (`TutorProfileClient.tsx:242-246`). This is appropriately featured for a profile page that needs to support both browsing and conversion (message/book) — no obvious over-build here in the code structure itself. Not independently re-audited for i18n; see `audit/06-content-localization-rtl-audit.md`.

### Classes list (`app/classes/page.tsx` + `ClassesClient.tsx`, 539 lines)

Structurally mirrors the tutors list (server fetch of 12 + client-side filter/search/infinite-scroll). No hardcoded hex found in a spot check, consistent with the token system elsewhere. Not fully re-read line-by-line in this pass given the close structural similarity to `TutorsClient.tsx` already audited above; flag for a follow-up pass if a deeper look is needed.

### Class detail (`app/classes/[id]/page.tsx` + `ClassDetailClient.tsx`, 724 lines)

#### UX-007 (re-confirms CONN-007 from `audit/08-functional-connections-audit.md`) — "Write review" button is a dead end
- **Severity:** HIGH | **Priority:** P1
- **Evidence:** `app/classes/[id]/ClassDetailClient.tsx:239` — `{isEligible && <button type="button" className="btn-secondary" ...>Write review</button>}` has no `onClick` at all. This is the only interactive element on the page found with zero handler during this pass (every other button/onClick in the file — waitlist join, sign-in, favorite toggle, time-slot select — is wired, `ClassDetailClient.tsx:366,420,427,450,480`).
- **Recommendation:** Wire to a review-submission modal/route, or hide the button entirely until that flow ships (a visible dead button is worse for trust than no button).
- **Complexity:** Small if just hiding it now; Medium if building the review flow.

No hardcoded hex found in this file (consistent `var(--...)` usage). Page structure itself (hero image, class meta, schedule/time-slot picker, booking CTA, reviews) is appropriately scoped to a single job: get the visitor to book. The dead review button is the main defect found in this pass.

### Booking checkout (`app/classes/[id]/book/BookingCheckout.tsx`, 1,437 lines)

Content/i18n issues are already fully catalogued as I18N-001 in `audit/06-content-localization-rtl-audit.md` (fake "May 2025" calendar, mostly hardcoded English, placeholder student defaults) — not re-derived here. Flow structure itself is reasonable: a single scrolling page with four numbered sections — "1. Choose date", "2. Choose time", "3. Student details", "4. Payment method" (`BookingCheckout.tsx:195,233,250,270`) — rather than a click-through wizard, which is the right call for a short checkout (avoids extra navigation friction). Two additional UX defects found in this pass, independent of I18N-001:

#### UX-008 — `StepIndicator` is decorative only; never reflects actual progress
- **Severity:** MEDIUM | **Priority:** P2
- **Evidence:** `BookingCheckout.tsx:336-347` — `["Schedule", "Details", "Pay"].map((label, index) => (<li className={index === 0 ? "active" : ""} ...>` — `index === 0` is hardcoded, so "Schedule" is permanently marked active/current regardless of what the user has actually filled in or scrolled to. `StepIndicator` takes no props.
- **Recommendation:** Either drive the indicator off real scroll position/form-completion state (matches the numbered-sections layout already in place), or remove it — a progress indicator that never moves is actively misleading, worse than no indicator.
- **Complexity:** Small.

#### UX-009 — Hardcoded fake trust signals in the class summary card at the point of payment
- **Severity:** HIGH | **Priority:** P1
- **Evidence:** `BookingCheckout.tsx:363` (`<Star .../> 4.9 (128)` — fixed rating and review count, not from `cls` data), `BookingCheckout.tsx:366` (`{cls.spotsLeft ?? 20} seats left` — fabricated fallback of "20" when real data is absent), `BookingCheckout.tsx:372` (`60 min` hardcoded duration regardless of the actual class schedule)
- **Recommendation:** Pass real rating/review-count/duration through `ClassSummary` props (the data already exists upstream in `class` records used elsewhere on the site) or omit these fields rather than fabricate numbers at the exact moment a user is deciding whether to pay.
- **Complexity:** Small (prop threading) to Medium (if duration isn't currently modeled per class).

### Dashboard (`app/dashboard/page.tsx`, 203 lines + `DashboardClient.tsx`, 311 lines)

Single dashboard route serving three different roles (STUDENT, TUTOR, CENTER_ADMIN) via server-side role branching in `page.tsx` and conditional rendering in the client (`DashboardClient.tsx:57,68,78,82,118`). No hardcoded hex found. No tab UI — sections are simply conditionally rendered based on role, which keeps the "one primary job per visit" intact (a student sees their bookings; a tutor sees their classes/revenue; a center admin sees their roster) rather than presenting irrelevant controls. This is a reasonable shape for a role-differentiated dashboard and no P0-P2 findings surfaced in this pass; flag for a deeper interaction-level look (loading states, empty states, error states) in a future pass since this one focused on structural read-through rather than every conditional branch.

---

## 2. Landing-page book-metaphor section

**Component chain:** `app/page.tsx` (server, fetches tutors/classes) → `app/Landing.tsx` → `app/components/landing/HeroSection.tsx` (`"use client"`) → `app/components/landing/LandingBookScroller.tsx` (`BookScroller`/`MobileBookScroller`), styled by `app/components/landing/LandingStyles.ts`, which concatenates four separate style modules (`LandingStylesA/B/C/D.ts`) into one `BOOK_CSS` string injected via a raw `<style>{BOOK_CSS}</style>` tag (`HeroSection.tsx:274`).

**Is the book/page-flip metaphor actually implemented?** Yes, and it is elaborate, not a simplified take on the unshipped prototype. `HeroSection.tsx` builds 6 "chapters" (`cover`, `contents`, `find`, `compare`, `book`, `learn`, `HeroSection.tsx:59-261`) each with left/right page content. `LandingBookScroller.tsx` drives a `framer-motion` `useMotionValue`/`useSpring` progress value off raw scroll position (`rect.top` vs viewport, `LandingBookScroller.tsx:158-166`) and maps it through `useTransform` to per-layer `opacity`, `x`, `y`, `rotateY`, `scale`, plus a separate "page-turn-leaf" overlay with its own rotate/opacity curve to fake a turning page (`LandingBookScroller.tsx:35-84`). This is a materially more complex build than a typical hero section — closer to a scrollytelling set piece than a landing hero.

**Does it gate content behind scroll/animation?** Yes, structurally. `.book-scroll { height: calc(var(--page-count) * 100svh) }` (`LandingStylesA.ts:56`) means with 6 chapters the scroll container alone is **~600svh tall** — visitors must scroll roughly six full viewport-heights of animated page-flips before reaching `TrendingSection`, `FeaturedTutorsSection`, `HowItWorksSection`, etc. (`app/Landing.tsx:24-31`). There is a bookmark rail (`nav.bookmark-rail`, `LandingBookScroller.tsx:210-239`) that lets a user jump directly to a chapter by anchor, and Prev/Next buttons (`LandingBookScroller.tsx:268-276`), which act as a partial escape hatch — but there is no single "skip to browse classes" control that exits the whole book sequence in one action; the fastest way out is clicking a `book-btn` CTA inside the cover chapter itself (`HeroSection.tsx:69-74`, links to `/classes` and `/tutors`), which does work as a de facto skip-intro.

**`prefers-reduced-motion` handling — partial, not a real fallback.** `BookScroller` calls framer-motion's `useReducedMotion()` and combines it with a mobile check into a `simpleMotion` boolean (`LandingBookScroller.tsx:120, 202`) that only *reduces the magnitude* of translate/rotate values (e.g. `incomingX` 82→34, `incomingRotate` 34→0) — the opacity/position animation still runs, still scrubs with scroll, and the 600svh scroll-gate is completely unaffected by this flag. Searching the entire style bundle for an actual `@media (prefers-reduced-motion: reduce)` block found exactly one match, in `LandingStylesB.ts:119-121`, and it only turns off an unrelated `online-pulse` dot animation — **the book scroll-hijack itself has no CSS-level reduced-motion fallback at all.** A user with `prefers-reduced-motion: reduce` set at the OS level still gets the full scroll-driven page-flip experience, just with slightly smaller offsets.

**RTL bug not caught by prior i18n passes:** none of `HeroSection.tsx`, `LandingBookScroller.tsx`, or the four `LandingStyles*.ts` files reference `dir`, `rtl`, or `[dir=...]` selectors (only `HowItWorksSection.tsx` elsewhere in `landing/` does). The page-flip transforms use hardcoded physical-direction pixel values (`incomingX = 82`, `outgoingX = -96`, `LandingBookScroller.tsx:45-46`) with no logical-direction (`isRTL`) branch. In Arabic mode the "next chapter" animation will still slide/rotate in the LTR physical direction while the DICT text and reading order flip — pages will visually "turn" backwards relative to Arabic reading direction. This compounds A11Y-001 (`dir` never set server-side) since it's not just a static layout mirroring gap but an animated-direction bug baked into JS transform math.

**Relation to `book-landing.html`:** confirmed by `audit/02-route-and-feature-inventory.md` (ROUTE-010) as the direct design source — shared CSS custom-property names (`--book-w`, `--spine`, `--flip-dur`, `--open-dur`) and the same `book-landing` class name (used live at `HeroSection.tsx:266`). The live version is not a simplified take; it is a full React/framer-motion port of the static prototype's scroll-jacking concept, now feeding live tutor/class data into the chapters instead of static mockup content.

**Performance tie-in (PERF-001):** this is the single most animation- and JS-heavy component on the site's highest-traffic route, and it sits on the page that `audit/09-security-accessibility-performance-seo.md` already flags as unable to statically generate at all (root cause: `app/Navbar.tsx` calling `auth()` without a Suspense boundary). A ~600svh scroll-jacked hero with per-frame `useTransform` recalculation across 6 layers is exactly the kind of surface where that missing static generation is most costly — there's no static shell to paint while the client JS (framer-motion, 4 concatenated style modules, icon set) hydrates.

### UX-001 — Landing hero forces ~600svh of scroll-gated animation before real content
- **Severity:** HIGH | **Priority:** P1
- **Evidence:** `app/components/landing/LandingStylesA.ts:56` (`height: calc(var(--page-count) * 100svh)`), `app/Landing.tsx:23-31` (real sections start after `HeroSection`), `app/components/landing/HeroSection.tsx:59-261` (6 chapters)
- **Recommendation:** Cap the scroll-jacked sequence to 2-3 chapters (cover + one value-prop spread), or convert the remaining chapters to normal, non-scroll-jacked static sections that render immediately below the fold. Keep the page-flip visual for the cover only, where it has the most novelty value and the least opportunity cost.
- **Complexity:** Medium (mostly deletion/restructuring of existing chapter data + `BookScroller`'s page-count assumptions; no new animation code needed).

### UX-002 — `prefers-reduced-motion` is only partially honored; scroll-hijack itself has no CSS fallback
- **Severity:** HIGH | **Priority:** P1
- **Evidence:** `app/components/landing/LandingBookScroller.tsx:120,202` (`simpleMotion` only shrinks offsets), `app/components/landing/LandingStylesB.ts:119-121` (only reduced-motion CSS rule in the bundle, unrelated to the book scroller)
- **Recommendation:** Add a `@media (prefers-reduced-motion: reduce)` rule that collapses `.book-scroll` to `height: auto` and stacks chapters as normal static blocks (same code path as `MobileBookScroller`, which is already a reasonable non-hijacked fallback). Reuse the mobile rendering path for reduced-motion users on desktop too.
- **Complexity:** Small-Medium (branch `BookScroller` to render `MobileBookScroller`'s layout when `prefersReduced` is true, not just on mobile viewport).

### UX-003 — Book page-flip animation direction is not RTL-aware
- **Severity:** MEDIUM | **Priority:** P2
- **Evidence:** `app/components/landing/LandingBookScroller.tsx:45-46` (`incomingX`/`outgoingX` hardcoded physical-direction values), no `dir`/`rtl` reference anywhere in `LandingBookScroller.tsx`, `HeroSection.tsx`, or `LandingStyles[A-D].ts`
- **Recommendation:** Read the current locale/direction (the codebase already has `useI18n()` available in `HeroSection.tsx:49`) and mirror `incomingX`/`outgoingX`/`incomingRotate`/`outgoingRotate` signs when `dir === "rtl"`.
- **Complexity:** Small (sign-flip on a handful of constants, threaded through `BookScroller`/`BookLayer` props).

### UX-004 — Landing hero styling fragmented across four concatenated files with no clear ownership boundary
- **Severity:** LOW | **Priority:** P3
- **Evidence:** `app/components/landing/LandingStyles.ts:1-6` (`[BOOK_CSS_A, BOOK_CSS_B, BOOK_CSS_C, BOOK_CSS_D].join("\n")`)
- **Recommendation:** Consolidate or clearly section-comment the four files by concern (layout/tokens, page-content components, badges/cards, responsive/reduced-motion) rather than by apparent chronological accretion (A/B/C/D). Low urgency — functions correctly today, but raises maintenance risk for the next person touching this hero.
- **Complexity:** Small (rename/reorganize, no behavior change).

---

## 3. Design-system consistency

**Token source of truth:** `app/globals.css` defines a single centralized `:root { ... }` block (colors, e.g. `--bg-card: #fbfaf6`, `--accent: #0d5946`, `--accent-hover`, `--accent-active`, `--accent-fg`, `--accent-bg`, `--accent-bg-soft`, `--accent-border`, `app/globals.css:2-36`) plus a parallel `:root[data-theme="dark"] { ... }` override block (`app/globals.css:127-154`) for dark mode. This is a real, working dark-mode-capable token system, not just a light-mode palette.

**Spot-checked components:**

| Component | Hardcoded hex found | `var(--...)` usage |
|---|---|---|
| `app/tutors/TutorsClient.tsx` (783 lines) | 0 | 80 occurrences |
| `app/classes/[id]/ClassDetailClient.tsx` (724 lines) | 0 | consistent |
| `app/dashboard/DashboardClient.tsx` (311 lines) | 0 | consistent |
| `app/classes/[id]/book/BookingCheckout.tsx` (1,437 lines) | 4 — 2 are a legit third-party brand mark (`.fawry-logo { color: #244498; background: #ffe01b }`, `BookingCheckout.tsx:1061-1062`, correctly hardcoded since it's a payment-provider logo, not a design token), 2 are a decorative gradient reusing the paper-white hex directly instead of a variable (`linear-gradient(180deg, #fbfaf6 0%, var(--bg) 100%)`, `BookingCheckout.tsx:568,1335`) | mixed |
| `app/components/landing/LandingStylesA.ts` (hero) | 12 — but 8 of these are the **definitions** of a second, parallel token set local to the landing hero only (`--paper`, `--paper-alt`, `--paper-edge`, `--bronze`, `--muted`, redefined again inside a dark-mode block at lines 29-46) | mixed |

**Finding: the landing hero maintains its own parallel color-token vocabulary instead of extending the global tokens in `app/globals.css`.**

### UX-010 — Landing hero defines a second, separate design-token set (`--paper`, `--bronze`, etc.) instead of reusing global tokens
- **Severity:** MEDIUM | **Priority:** P2
- **Evidence:** `app/components/landing/LandingStylesA.ts:3-14` defines `--paper: #fbfaf6`, `--paper-alt: #f4efe2`, `--paper-edge: #ddd3bd`, `--bronze: #8a5a14` as new custom properties scoped to `.book-landing`, duplicating/near-duplicating values already expressed as `--bg-card: #fbfaf6` etc. in `app/globals.css:7`. Two spots (`LandingStylesA.ts:282,284`) then bypass even this local token set and hardcode `#0d5946`/`#073327`/`#fbfaf6` directly in a `linear-gradient`, even though `#0d5946` is literally the value of the global `--accent` token (`app/globals.css:30`).
- **Recommendation:** Either (a) have the hero's "paper" palette explicitly derive from/alias the global tokens (`--paper: var(--bg-card)`), or (b) if the book metaphor genuinely needs a bespoke sepia/paper palette distinct from the rest of the site, document that as an intentional exception rather than an accidental drift — right now it reads as drift, since `#fbfaf6` is reused verbatim in three different places (global token, local token, and a raw gradient) instead of one.
- **Complexity:** Small (value substitution, no visual change if done correctly).

**Overall assessment:** outside the landing hero, the token system is followed consistently and thoroughly across every other spot-checked page-level component (zero unexplained hardcoded hex in `TutorsClient`, `ClassDetailClient`, `DashboardClient`; the only hex in `BookingCheckout.tsx` is a legitimate third-party brand mark plus two low-stakes gradient literals). The landing hero is the one place where a second token vocabulary was introduced, consistent with it being the most heavily and separately iterated-on surface in the codebase (evidenced by the four `LandingStylesA/B/C/D.ts` files, see UX-004).

---

## 4. Simplicity audit

For each page: primary job, what's required to do it, what could be removed/deferred/merged.

**Landing (`app/page.tsx`)**
- Primary job: convince a first-time visitor this marketplace is legitimate and get them into `/tutors` or `/classes`.
- Required: a headline/value prop, proof of scale (tutor/class/booking counts), one clear CTA into browsing.
- Could remove/defer: the 600svh scroll-jacked 6-chapter book sequence (UX-001) is far more than "required" — a single cover chapter with the existing `StatCard` counts and two CTAs already covers the "required" list above. `RecommendationsSection`, `StatsSection` (duplicate of the hero's own stat cards), and one of `FeaturedTutorsSection`/`FeaturedClassesSection` are candidates to merge or cut (UX-005).

**Tutors list (`app/tutors/page.tsx`)**
- Primary job: let a visitor filter down to a tutor and click into their profile.
- Required: search, subject filter, list/cards, pagination.
- Could remove/defer: the `featured`/`topRated`/`newTutors` three-way segmentation (`TutorsClient.tsx:425-427`) adds a categorization layer on top of filtering that a simple sort-by-rating control would achieve with less code and less visual complexity; worth validating whether it earns its keep against a plain sorted list.

**Tutor profile (`app/tutors/[id]/page.tsx`)**
- Primary job: let a visitor decide whether to message or book this specific tutor.
- Required: bio, subjects, classes offered, reviews, contact/book CTA.
- Nothing found in this pass that looks like unnecessary scope — the feature set (bio expand, class filter, review pagination, sign-in gate) all maps directly to that job.

**Classes list (`app/classes/page.tsx`)**
- Primary job: let a visitor filter down to a bookable class.
- Same shape as tutors list; same note about validating the segmentation/filter overlap applies if `ClassesClient.tsx` mirrors the same pattern (not independently re-read line-by-line this pass).

**Class detail (`app/classes/[id]/page.tsx`)**
- Primary job: get the visitor to click "book."
- Required: what/when/where, price, spots left, tutor identity, book CTA.
- Could remove/defer: the dead "Write review" button (UX-007) — either finish it or cut it; a non-functional control actively works against the primary job by making the page feel unfinished.

**Booking checkout (`BookingCheckout.tsx`)**
- Primary job: convert a decided visitor into a paid booking with minimal friction.
- Required: date, time, student details, payment method, confirm.
- Already reasonably minimal as a single-scroll 4-section flow (no unnecessary click-through wizard). The simplification opportunity here isn't scope — it's correctness: a broken calendar (I18N-001), a progress indicator that lies (UX-008), and fabricated trust numbers (UX-009) all need fixing before this page reduces friction the way its structure intends.

**Dashboard (`app/dashboard/page.tsx`)**
- Primary job: let a logged-in user see and manage what belongs to them (their bookings if a student; their classes/students/revenue if a tutor; their roster if a center admin).
- Required: role-appropriate data, cancel/delete actions.
- Appropriately scoped — conditional rendering by role rather than one generic UI trying to serve three roles, and no evidence of over-build found in this pass (see caveat in Section 1 that empty/loading/error states weren't individually traced).

**Cross-cutting simplicity observation:** the landing page is the clear outlier in this audit. Every other page in this pass (tutors, classes, tutor profile, class detail, checkout, dashboard) maps its feature surface fairly directly to a single conversion job. The landing page alone carries a second, competing "showcase our craft" job (the book metaphor) layered on top of its actual job (get visitors browsing), and that second job is what generates most of the findings in this document (UX-001 through UX-004, UX-010) as well as the PERF-001 tie-in from the prior performance pass.
