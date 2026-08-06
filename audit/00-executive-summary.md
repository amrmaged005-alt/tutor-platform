# 00 — Executive Summary

**Audit date:** 2026-08-04 through 2026-08-06. **Scope:** full-repository audit of TutorPlatform/Coursaty per the master audit brief — 15 specialist agent passes across architecture, routes, journeys, UX, mobile, i18n/RTL, links/media, functional connections, security/accessibility/performance/SEO, code quality/dependencies, and Claude/Codex tooling. 94 individually-tracked findings (`audit/audit-findings.csv`). All findings are evidence-based (file:line citations in each source document); this summary synthesizes, it does not introduce new claims.

**Correction to the audit brief's premise:** the brief assumes "a project that has not been actively worked on for several months" requiring cold re-entry. That was not true — this is an actively maintained repo with commits through the audit's start date, an existing `SECURITY_AUDIT.md` (2026-05-27) and `REMAINING_LIMITATIONS.md` (2026-06-12) that were both spot-verified rather than discarded. Several of this audit's most important findings are specifically about **drift since those documents were written** (see below) — not gaps they missed.

---

## Current overall condition

The foundation is sound: `npm run build`, `npm run lint`, and `npx tsc --noEmit` are all clean; the architecture (Next.js 16 App Router, Prisma/Supabase, NextAuth v5, Paymob, Resend, Upstash) is a coherent, appropriate choice for the product; the design-token system, i18n architecture, and mobile-responsive patterns are well-built where they've actually been applied. Nothing found in this audit requires a rewrite.

But the product has accumulated a **specific, recurring failure pattern**: features get built correctly at the data/API layer and then never fully wired to the UI, or a correct implementation is later shadowed by an unsafe live path. This shows up independently in at least five places — booking seat-locking, review creation, promo codes, the center-creation flow, and tutor access-level enforcement — which means it's a process gap (nothing catches "this feature has two implementations, or zero wired ones" before ship), not five unrelated bugs.

Layered on top of that: one recent commit (`51b48a1`) regressed a previously-fixed, previously-documented feature (honest booking scheduling) back to a broken, fake-data state — meaning **`REMAINING_LIMITATIONS.md` is now stale on that specific point**, through no fault of the audit process that produced it.

---

## Scores (out of 100)

These are synthesis judgments grounded in the evidence across all 15 audit passes, not a formula — read the reasoning, not just the number.

| Dimension | Score | Why |
|---|---|---|
| Overall health | **60** | Clean build/lint/types, sound architecture, but multiple critical live-data-integrity bugs and two P0 CVE clusters |
| Product clarity | **55** | Landing page carries two competing jobs (conversion vs. book-metaphor showcase); once past it, most pages have a clear single purpose |
| UX | **50** | Real dead ends: centers (structurally broken), reviews (no working button), referral, promo, 5 admin controls, orphaned `/profile` |
| Mobile | **72** | Genuinely the strongest audited dimension — accessible nav drawer, well-built filter bottom-sheet, correct RTL logical properties, reduced-motion respected on the landing page specifically |
| Visual consistency | **75** | Global token system followed almost everywhere; only the landing hero maintains a second, drifting token set |
| Accessibility | **58** | Solid modal/focus-trap coverage, but `lang`/`dir` unset server-side, `prefers-reduced-motion` covered in only ~39% of animation usage |
| Performance | **55** | One root-cause bug (`Navbar` `auth()` call, no Suspense) forces zero static generation app-wide — high floor once fixed, currently a ceiling |
| Security | **52** | Sound rate-limiting/webhook/CSRF-in-3-places architecture undermined by 2 critical framework CVEs, an open redirect, and CSRF applied to only 3 of ~85 mutation routes |
| Code maintainability | **55** | Clean lint/types, consistent `*Client.tsx` patterns, but zero test coverage and a recurring dead-parallel-implementation pattern |
| Core-feature completeness | **45** | Booking, centers, reviews, referral, promo, refunds, and notifications each have a real, current gap between "looks done" and "is done" |

---

## The five strongest parts of TutorPlatform

1. **The mobile-responsive layer.** Accessible drawer nav with focus trap and body-scroll lock, a genuinely well-built filter bottom-sheet with drag-to-dismiss, correct RTL logical-property usage throughout, and — notably — the landing page's mobile path already does the *right* thing with `prefers-reduced-motion` (swaps to a simplified native-scroll-snap component rather than just shrinking animation offsets). This is the part of the product least in need of intervention.
2. **Payment webhook integrity.** HMAC verification with `timingSafeEqual`, idempotency guarding, and the check genuinely gates every write — not just present-but-bypassable.
3. **The i18n architecture itself.** The dictionary/hook pattern, RTL CSS centralization in `globals.css`, and locale-aware date formatting are well-designed; most of the audit's i18n findings are "not yet wired to this component," not "the system is wrong."
4. **Rate-limiting and auth architecture on the web side.** Nine distinct limiters, account lockout after 5 failed attempts, constant-time comparison to resist enumeration — solid design, just inconsistently extended to the mobile surface.
5. **Clean baseline engineering hygiene.** Zero lint errors, zero type errors, a successful production build, no hardcoded secrets found anywhere in the codebase.

## The ten most serious issues

1. **UX-JOURNEY-008 (Critical/P0)** — No code path creates a `LearningCenter`; center-admin signup is a dead end.
2. **CONN-001 (Critical/P0)** — Real booking overbooking race; the correct fix (`lockSeat()`) exists as dead code.
3. **CONN-004 (Critical/P0)** — The Flutter mobile app has silently shown fake mock data on its primary browse screen since a field-name typo, with zero observable symptom.
4. **I18N-001 (Critical/P0)** — The most recent commit regressed the booking checkout to a fake calendar + hardcoded English + fake placeholder identity data.
5. **SEC-001 (Critical/P0)** — Two critical CVEs in the production auth stack, including a fail-open auth-check bug.
6. **SEC-002 (High/P0)** — Next.js middleware/proxy-bypass CVEs directly targeting the exact mechanism (`proxy.ts`) this app's entire access control runs on.
7. **UX-JOURNEY-002 (High/P1)** — `/centers` is role-gated to admins even though it's meant to be public; most users hit `/unauthorized`.
8. **CONN-003 (High/P1)** — Tutor access-level restrictions leak real revenue data on 4 of 7 checked surfaces despite being reported "shipped."
9. **TEST-001 (Critical/P0, XL)** — Zero automated test coverage across 84 API routes and 31 pages.
10. **CONN-012 (Medium/P2, but structurally important)** — CSRF same-origin checking exists but is applied to only 3 of roughly 85 mutation routes.

## The five most important simplifications

1. **Fix or hide the Centers feature** before doing anything else to it — a broken, structurally-dead-end feature is worse than a hidden one.
2. **Collapse the landing page's two competing jobs.** Cap the book metaphor (currently ~600vh of forced scroll) or move it below an immediately-useful fold; stop asking every visitor to sit through a showcase before they can act.
3. **Finish or delete, don't leave dangling.** Referral, promo codes, and review-writing all have correct backend logic and zero UI wiring — each is a small, cheap fix, and collectively they remove three "this looks broken" moments from the product.
4. **One shared icon-button component and one shared Modal component** would resolve a double-digit count of small, scattered findings (MOBILE-003/005/007/009) in one motion instead of many.
5. **Stop the booking checkout from carrying so much weight.** At 1,437 lines with a fake calendar, fabricated ratings, and a non-functional step indicator, it's the single highest-risk file in the product — reverting to the honest, smaller `e500435` version and rebuilding forward is lower-risk than continuing to extend the current one.

---

## Recommended direction: repair incrementally

**Not** partial rebuild, **not** full rebuild, **not** rebuild-around-backend-or-frontend. Every finding in this audit — including the Critical/P0 ones — is fixable within the existing architecture, and most are small and mechanical (a Suspense boundary, a field-name fix, wiring an existing button to an existing endpoint, a non-major dependency bump). The codebase's bones (clean types, clean lint, coherent stack choice, working payment/auth infrastructure) are not in question; what needs work is finishing what's already started and closing the gap between "looks wired" and "is wired." A rebuild would throw away the parts of this audit that came back positive (mobile layer, i18n architecture, webhook security) to re-solve problems that don't require it.

---

## Recommended first sprint (Phase 1 of `audit/13-prioritized-overhaul-roadmap.md`)

In rough priority order, all independently shippable: (1) fix the Flutter mock-data bug — one line; (2) fix the `/centers` `proxy.ts` role gate — one config change; (3) fix the login open redirect; (4) wire `lockSeat()` into the live booking path; (5) revert/re-port the booking-checkout regression from `e500435`; (6) upgrade `next` to `16.3.0`; (7) close the four dashboard revenue-leak surfaces. None of these depend on each other except #4/#5 (same file, do together).

## Recommended use of Claude Code going forward

Per `audit/11-claude-codex-tooling-opportunities.md`: add a project-scoped Playwright MCP (this audit's own biggest limitation was the total absence of live browser verification — every UX/mobile/journey finding is a code-reading inference, not an observed one); create `CLAUDE.md` importing `AGENTS.md` (Claude Code has never actually read this project's own agent instructions until this is fixed); the existing project-local Impeccable skill is sufficient for frontend work, no additional design skill is needed.

## Recommended use of Codex

Per the same document: the project already has an installed, unused Codex-native image-generation workflow (`.agents/skills/impeccable/reference/codex.md`) that could unblock the 6+ image briefs in `REMAINING_LIMITATIONS.md` currently stalled on Higgsfield's 0.92 free-tier credits — worth running before spending money on Higgsfield credits.

## Where every deliverable lives

All in `audit/`: `01`–`12` are the detailed per-domain audits (see `15-audit-index.md` for the full map and reading order), `13` is this roadmap's detail, `14` lists decisions only the product owner can make, `audit-findings.csv`/`roadmap.csv`/`routes.json`/`connection-matrix.csv`/`dependencies.csv`/`broken-links.csv`/`assets.csv` are the machine-readable companions.

## What this audit could not verify, and why

No browser-automation tool (Playwright or equivalent) was available in this environment. Every UX, mobile, and journey finding is derived from reading component source — conditional rendering, props, CSS classes, animation logic — not from loading the app and observing it. This means: actual rendered visual polish, real animation smoothness/timing, real touch-gesture behavior, computed color contrast as actually rendered, and real on-screen-keyboard behavior were **not** verified and should be treated as code-reading inferences, flagged as such throughout the source documents, until confirmed live. The linked Supabase project was also found paused (`INACTIVE`) mid-audit, which blocked a live schema/advisor cross-check in `audit/01`. Recommendation P0-A in the roadmap (add Playwright MCP, capture a screenshot baseline) exists specifically to close this gap before Phase 2 UI work begins.
