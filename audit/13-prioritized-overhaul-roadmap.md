# 13 — Prioritized Overhaul Roadmap

Synthesized from all completed audit passes (`audit/01` through `audit/12`) and `audit/audit-findings.csv` (94 finding IDs). Organized into six phases per the audit brief. Every item cites the finding ID(s) it resolves — cross-reference `audit/audit-findings.csv` or the source doc for full evidence (file:line) rather than re-deriving it here.

**Priority scale:** P0 (blocking/dangerous) → P4 (optional). **Complexity:** S/M/L/XL.

---

## Phase 0 — Preservation & Project Recovery

Status: **largely complete as a byproduct of this audit.** Git state was clean at the start (no uncommitted work to lose), `npm run build`/`lint`/`tsc --noEmit` all verified green, and the full architecture map now exists at `audit/01-current-architecture.md`. Two gaps remain:

| Item | Problem | Action | Complexity | Priority |
|---|---|---|---|---|
| P0-A | No screenshot baseline exists (no browser-automation tool was available this pass) | Add a Playwright MCP server (see `audit/11`, TOOL-002) and capture a screenshot set across breakpoints/languages before starting Phase 2 UI work, so visual regressions are catchable | S | P1 |
| P0-B | `CLAUDE.md` doesn't exist — Claude Code has never read `AGENTS.md`'s project instructions (TOOL-001) | Create `CLAUDE.md` importing `AGENTS.md` | XS | P1 |

---

## Phase 1 — Critical Repairs

These are live, user-facing correctness/trust/security problems. None require architectural rework — all are fixes within the existing design.

### 1.1 Booking integrity (the highest-value cluster — one root cause, four symptoms)
- **Problem:** `lockSeat()` (`app/actions/bookings.ts`) is a correctly-built serializable-transaction fix for double-booking and sits completely unused. The live path (`POST /api/bookings`) does a non-transactional read-then-write, creating a real overbooking race (**CONN-001**, Critical/P0). Because the live path never sets `lockedAt`/`lockedUntil`, the cleanup cron that reclaims abandoned checkouts is a no-op (**CONN-002**, High/P1), and the existing `REQUIRE_EMAIL_VERIFICATION` gate that would come alive "for free" through `lockSeat()` stays dormant (part of **CONN-011**).
- **Fix:** Port `lockSeat()`'s transaction logic into `app/api/bookings/route.ts` (preserving its promo-code/package-option support, which `lockSeat()` currently lacks), or retire the route and point `BookingCheckout.tsx` at a server action built on `lockSeat()`. Delete whichever implementation loses.
- **Files:** `app/api/bookings/route.ts`, `app/actions/bookings.ts`, `app/classes/[id]/book/BookingCheckout.tsx`.
- **User impact:** Prevents overselling class capacity; recovers seats stuck behind abandoned checkouts.
- **Complexity:** M. **Dependencies:** none — can start immediately. **Parallelizable:** yes, independent of everything else in Phase 1.
- **Acceptance criteria:** Two concurrent `POST /api/bookings` requests for the last seat in a class result in exactly one confirmed booking and one rejection; an abandoned unpaid booking is reclaimed by the cron within its lock TTL.

### 1.2 Booking checkout regression revert
- **Problem:** The latest commit (`51b48a1`) regressed `BookingCheckout.tsx` from a working, honest, localized 340-line component (commit `e500435`) to a 1,437-line version with a fake hardcoded "May 2025" calendar, mostly-hardcoded English despite `t()`/DICT being imported and unused nearby, and placeholder student-identity defaults (`"Omar Hossam"`, a specific school name) that ship on real bookings (**I18N-001**/**LINK-006**/**UX-JOURNEY-005**/**RTL-001**, Critical→High cluster). Selected date/time are folded into a free-text note and never sent as structured data.
- **Fix:** Re-port the honest-scheduling + i18n work from `e500435` on top of whatever new "profile editing" functionality `51b48a1` intended to add — this is a merge/reconciliation task, not a rewrite, since the correct version exists in git history. Default identity fields to the logged-in user's real profile, not hardcoded placeholders.
- **Files:** `app/classes/[id]/book/BookingCheckout.tsx`.
- **User impact:** Removes fabricated dates/ratings/seat-counts from the highest-stakes form in the product; restores bilingual support to the checkout flow.
- **Complexity:** M. **Dependencies:** best done together with 1.1 since both touch the same file and the same booking-data contract.
- **Acceptance criteria:** Calendar shows real, current dates derived from the class's actual `schedule` field; all UI copy routes through `t()`; student identity fields default to the session user's real name/school.

### 1.3 Centers feature is structurally broken for real users
- **Problem:** `/centers` and `/centers/[id]` are role-gated to CENTER_ADMIN/ADMIN in `proxy.ts` even though meant to be publicly browsable — most users clicking "Centers" hit `/unauthorized` (**UX-JOURNEY-002**, High/P1). Worse: there is no `POST /api/centers` and no create-center UI anywhere — every `LearningCenter` row that will ever exist beyond the seed data must be created manually, so signing up as a center admin is a dead end today (**UX-JOURNEY-008**, Critical/P0).
- **Fix (two parts, can ship independently):** (a) Fix the `proxy.ts` role gate so `/centers` and `/centers/[id]` are public, matching the page-level logic that's already more permissive. (b) Build a minimal center-creation flow (form → `POST /api/centers` → owning user's `centerId` set), or explicitly hide the "become a center" path from signup/nav until that flow exists — don't leave a reachable dead end live in the meantime.
- **Files:** `proxy.ts`, new `app/api/centers/route.ts` (POST), center-admin onboarding UI.
- **User impact:** Restores an entire browsable marketplace section; makes the center-admin account type actually usable by new users, not just seed data.
- **Complexity:** S (gate fix) + M (creation flow). **Priority:** P0 for the gate fix (trivial, high-impact), P1 for creation flow.
- **Acceptance criteria:** An anonymous/student/tutor user can browse `/centers` and any `/centers/[id]` without hitting `/unauthorized`. A new CENTER_ADMIN signup either can create a center or is not offered that role until it can.

### 1.4 Dashboard revenue leak to restricted tutors
- **Problem:** Tutor access-level enforcement (commit `786df84`, claimed "shipped") is real for 3 of 7 checked surfaces and cosmetic-only for 4, including the dashboard's headline gross-revenue stat card, which still shows real revenue to LIMITED/VIEW_ONLY tutors (**CONN-003**/**UX-JOURNEY-006**, High/P1). Root cause pinpointed: `DashboardStats` renders outside the `canSeeRevenue` gate that correctly protects the panel below it.
- **Fix:** Gate `DashboardStats`'s revenue tile behind `accessLevel === "FULL"`; branch the `dashboard/page.tsx` Prisma query itself on `centerAccessLevel` so restricted tutors never receive the raw booking/revenue payload; add the same 403 pattern already used in `dashboard/export/route.ts` to `dashboard/payouts/route.ts` and `dashboard/analytics/route.ts`.
- **Files:** `app/dashboard/page.tsx`, `app/dashboard/components/DashboardStats.tsx`, `app/api/dashboard/payouts/route.ts`, `app/api/dashboard/analytics/route.ts`.
- **Complexity:** S-M. **Priority:** P1.
- **Acceptance criteria:** All 7 surfaces from the CONN-003 table pass; a LIMITED/VIEW_ONLY tutor's dashboard payload contains no revenue/PII fields server-side, not just client-hidden ones.

### 1.5 Flutter mobile app silently shows fake data
- **Problem:** `MarketplaceRepository.classes()` reads `data['classes']` from a response that actually returns `{items, total, hasMore}` — a field-name mismatch wrapped in a silent try/catch, so the mobile app's entire class-browsing screen has always fallen through to hardcoded `MockData` with no observable symptom (**CONN-004**, Critical/P0 — "most severe finding" per the connections audit).
- **Fix:** One-line change in `services.dart` (`data['classes']` → `data['items']`), or standardize the API response key — check `/api/mobile/classes` for the convention used elsewhere first.
- **Complexity:** S. **Priority:** P0 — ship as an emergency patch, independent of everything else.
- **Acceptance criteria:** Mobile app's class-browse screen reflects live database content; `MockData` fallback only triggers on genuine network failure.

### 1.6 Security dependency upgrades
- **Problem:** `npm audit` found 2 critical CVEs in `next-auth`/`@auth/core` — including a fail-open auth-existence-check bug directly relevant to every `await auth()` call gating `/admin`, `/dashboard`, `/centers` (**SEC-001**, Critical/P0) — plus Next.js middleware/proxy-bypass CVEs directly relevant since this app's entire page-level access control runs through `proxy.ts` (**SEC-002**, High/P0), and `sharp` libvips CVEs affecting the image-optimization pipeline (**SEC-003**, High/P1, fixed by the same upgrade).
- **Fix:** Upgrade `next` to `16.3.0` (non-major, resolves SEC-002 + SEC-003). Track and apply the `next-auth`/`@auth/core` patch as soon as available (pre-1.0, moving fast — monitor GitHub Security Advisories directly); regression-test all auth flows (login, OAuth linking, lockout, session invalidation) after.
- **Complexity:** S (Next bump) + M (auth bump + regression test). **Priority:** P0/P1.
- **Acceptance criteria:** `npm audit` reports zero critical/high findings in production dependencies; full auth-flow smoke test passes post-upgrade; `npm run build`/`lint`/`tsc --noEmit` stay green.

### 1.7 Login open redirect
- **Problem:** `callbackUrl` on the login page only checks `startsWith("/")`, which a protocol-relative URL (`//evil.example.com`) also satisfies — a genuine phishing vector against a login link that looks legitimate (**SEC-006**, Medium/P1).
- **Fix:** `callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")`, or validate via `new URL(callbackUrl, origin).origin === origin`.
- **Files:** `app/login/page.tsx:66-67`. **Complexity:** S. **Acceptance criteria:** `/login?callbackUrl=//evil.example.com` no longer navigates off-origin after auth.

### 1.8 Refund approval doesn't move money
- **Problem:** Admin "Approve" on a refund request sets `paymentStatus: REFUNDED` in the database with no corresponding Paymob API call — no refund function exists in `lib/paymob.ts` (**CONN-008**, Medium/P2, but trust-critical).
- **Fix:** If Paymob refund API access exists for the merchant account, implement and call it before the status flip. If manual refunding is the accepted interim process, relabel the button ("Mark refund processed") so it doesn't imply automation that doesn't exist.
- **Files:** `app/api/admin/refund-requests/[id]/approve/route.ts`, `lib/paymob.ts`. **Complexity:** M (depends on Paymob refund API availability).

### 1.9 Performance root-cause fix (unlocks static generation everywhere)
- **Problem:** `app/Navbar.tsx`, a Server Component rendered directly in `layout.tsx` with no Suspense boundary, calls `auth()` on every request — one call that poisons the entire app into dynamic rendering, silently overriding the homepage's `revalidate = 60` (**PERF-001**, Critical/P0).
- **Fix:** Wrap the auth-dependent portion of the nav in a `<Suspense>` boundary so the rest of each page tree can be statically/ISR-rendered.
- **Files:** `app/layout.tsx`, `app/Navbar.tsx`. **Complexity:** M (touches root layout, needs careful regression check across all 31 pages). **Priority:** P0 — single highest-leverage performance fix in the codebase; unblocks CDN caching on the landing page specifically, which also carries the heaviest client-side animation weight (UX-001).
- **Acceptance criteria:** `npm run build` shows static (○) or ISR (◐) rendering for the landing page and other auth-independent routes, not `ƒ` for all 31+84 routes.

---

## Phase 2 — Product Simplification

Depends on Phase 1 landing (don't redesign around broken data). See `audit/12-simplified-product-proposal.md` for the full information-architecture proposal — this section lists the concrete execution items.

| Item | Finding(s) | Action | Complexity |
|---|---|---|---|
| Landing page scroll-gate | UX-001, UX-002, UX-003, UX-010 | Cap the book metaphor to 2-3 chapters or drop the scroll-jack below the fold; make `prefers-reduced-motion` actually remove the scroll-gate (reuse `MobileBookScroller`'s native scroll-snap as the real fallback, not just shrunk offsets); RTL-branch the page-flip transform; fold the hero's parallel token set into global tokens | M-L |
| Orphaned pages | ROUTE-003, ROUTE-004, ROUTE-007 | Delete `/messages/new` (dead code); link `/onboarding/role` from wherever role-selection is meant to be entered, or confirm it's superseded and remove; link `/profile` from nav/dashboard settings | S |
| Wire dead-but-built features | CONN-005 (referral), CONN-006 (promo), CONN-007 (reviews), UX-007 | Capture `?ref=` on signup + call `/api/me/referral/complete` on first confirmed booking; add a promo-code input field to checkout (backend already correct); wire the "Write review" button to a form and resolve its auth-helper mismatch (`requireMobileUser` vs `auth()`) | S each |
| Dead admin buttons | LINK-001 – LINK-005, UX-JOURNEY-009 | Wire Export CSV / Broadcast / Edit user / Delete user / Delete class, or remove the buttons if genuinely out of scope for now — don't leave dead controls indistinguishable from working ones | S |
| Missing legal pages | ROUTE-005, ROUTE-006 | Add `/privacy` and `/terms` pages (footer links 404 on every page today) | S |
| Booking cancel consolidation | CONN-010 | Extract a shared `notifyWaitlistOnCancel(classId)` helper and call it from all three cancel entry points | S |

---

## Phase 3 — Design-System Consolidation

| Item | Finding(s) | Action | Complexity |
|---|---|---|---|
| Core-surface i18n gaps | I18N-002 (ClassDetailClient), I18N-003 (ClassCard — highest leverage, reused on ~10 pages), I18N-004 (public CenterProfileClient), I18N-005, I18N-006, I18N-007 | Route through `t()`/DICT — keys already exist unused in most cases | S-M each, do ClassCard first for max leverage |
| RTL fixes | RTL-001–004, UX-003 | Swap physical left/right for logical `inset-inline-*` properties; RTL-flip back-arrow icons to match the pattern already correct in `ThreadClient.tsx` | S each |
| Locale-aware formatting | FORMAT-001–004 | Replace hardcoded `en-US`/`en-EG`/raw `.toLocaleString()` with the active-locale-aware pattern already used elsewhere | S each |
| Terminology | TERM-001, TERM-002 | Standardize حصة/جلسة and the two "Center Admin" translations | S |
| Touch targets | MOBILE-003, MOBILE-005, MOBILE-009 | Build one shared icon-button component enforcing a 44px minimum hit area; migrate the ~4 identified offenders (hamburger, drawer-close, filter-sheet-close, favorite-heart) plus the broader systemic instances found in messages/dashboard | M (component) + S (migration, parallelizable per-component) |
| Shared Modal component | MOBILE-007 | Consolidate the 3 duplicated modal implementations into one that caps height and scrolls internally | M |
| Mobile nav breakpoint mismatch | MOBILE-001, MOBILE-002 | Standardize the 768px CSS switch and 640px JS `matchMedia` switch on one breakpoint; consider a CSS-only fallback for the bottom nav to remove the hydration pop-in | S |
| CSP hardening | SEC-CSP | Nonce-based `script-src` via `proxy.ts`-generated per-request nonce — do this *after* PERF-001 (Phase 1.9) so caching and nonce generation don't fight each other | M |
| `lang`/`dir` SSR gap | A11Y-001 | Persist language preference in a cookie (not just `localStorage`) so `app/layout.tsx` can set `lang`/`dir` correctly on first server-rendered response | M |

---

## Phase 4 — Core Feature Completion

| Item | Finding(s) | Action | Complexity |
|---|---|---|---|
| Email verification enforcement | CONN-011, SEC-007 | Confirm Resend deliverability, then uncomment `lib/auth.ts:121-126`; remove the misleading "resend verification" UI if verification stays disabled, or enable the gate — don't ship the current mismatch | XS (code) + verification step |
| CSRF consistency | CONN-012 | Extract the duplicated `isSameOrigin()` into `lib/security.ts`, apply to all session-authenticated mutation routes (currently only 3 of ~85 have it) — or confirm `SameSite` cookie config is the actual primary defense and document that explicitly | S |
| Mobile auth/rate-limit parity | SEC-004, SEC-005, ARCH-003 | Add `bookingLimiter` to `mobile/book-class`; add a shared limiter wrapper to `requireMobileUser()` for all 11 mobile routes; add account-lockout tracking to mobile login to match web | S-M |
| Migration history / DB drift | DB-001 | Establish a real `prisma/migrations/` history going forward instead of ad hoc `db push`/MCP `apply_migration` | M (process change, not a one-time fix) |
| Notification system | CONN-009 | Net-new: add a `Notification` model, write from existing trigger points already identified per-feature in this audit, wire the mobile feed to real data with working read-state, connect stored `PushToken`s to an actual push provider — or explicitly deprioritize and stop implying a feed exists in Settings preferences | L (net-new feature, not a bug fix) |

---

## Phase 5 — Performance, SEO, Testing, Documentation

| Item | Finding(s) | Action | Complexity |
|---|---|---|---|
| Test coverage, tranche 1 | TEST-001 | Lean, risk-ordered: (1) Paymob webhook, (2) booking seat-lock concurrency (validates Phase 1.1's fix), (3) auth/role-gating, (4) rate limiters. Not a blanket coverage target. | M for tranche 1, XL if pursued exhaustively (don't) |
| SEO baseline | SEO-001 (no sitemap/robots), SEO-002 (generateMetadata on 3/34 pages), SEO-003 (no structured data), SEO-005 (auth routes indexable), SEO-006 (no hreflang) | Add `sitemap.ts`/`robots.ts`; extend `generateMetadata` to all public pages; add `noindex` to authenticated routes; add hreflang for AR/EN | M |
| Social preview | LINK-009, LINK-010 | Add an `opengraph-image` and apple-touch-icon | S |
| Title-tag bug | LINK-008 | Fix the `layout.tsx` title template duplicating `" | Coursaty"` on pages that already include it | XS |
| Dependency maintenance | DEP-001 (pin/track next-auth), DEP-002 (routine updates) | Batch into a routine maintenance pass once Phase 1.6 lands | S-M |
| Documentation | DOC-001, TOOL-001 | Rewrite `README.md` with real project onboarding (point to `AGENTS.md`/`PRODUCT.md`/`DESIGN.md`); add `CLAUDE.md` (Phase 0-B) | S |
| Perf polish | PERF-002 (no analyze script), PERF-003 (1,114-line i18n dict ships client-side), PERF-004 (image remotePatterns wildcard) | Add `analyze` npm script; consider splitting/lazy-loading the i18n dictionary; narrow `images.remotePatterns` from `hostname: "**"` to actual hosts used | S each |
| Code cleanup | CODE-001 (oversized files), CODE-006 (26 dead files) | Split `BookingCheckout.tsx` and other 800+ line files as they're touched anyway in Phase 1-2; remove confirmed-dead files (`ClassClient.tsx`, `ClassSearch.tsx` admin-only, etc.) after one more confirmation pass | M |

---

## Phase 6 — Differentiators

Only after Phases 1-5 are stable. Not detailed here in depth per the audit brief's instruction to avoid recommending speculative features — see `audit/12-simplified-product-proposal.md` and `audit/14-open-decisions.md` for what's deliberately deferred (Parent accounts, notification system build-out if not done in Phase 4, browser-automation MCP for ongoing visual QA, resuming the queued AI image-generation briefs once Higgsfield credits are available).

---

## Cross-cutting notes

- **Dead-parallel-implementation is a recurring pattern**, not three isolated bugs: booking seat-locking (CONN-001), review creation (CONN-007), and promo codes (CONN-006) all have a correct-but-unused implementation sitting next to a live-but-flawed one. Worth a lightweight process fix (a pre-merge checklist item: "does this feature have exactly one live implementation?") alongside the individual fixes.
- **UI-only enforcement is a recurring pattern**: the tutor-access-level gate (CONN-003) and several dead admin buttons share the same shape — something that *looks* finished in the UI isn't actually enforced or wired server-side. Worth the same process note.
- Full finding list with severity/priority/complexity: `audit/audit-findings.csv`. Machine-readable roadmap: `audit/roadmap.csv`.
