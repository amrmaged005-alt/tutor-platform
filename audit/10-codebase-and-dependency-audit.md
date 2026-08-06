# 10 — Codebase, Dependency & Testing Audit

Scope: `app/`, `lib/`, `components/`, root config/docs, `package.json`. Covers master spec section 23 (testing audit) — there is no separate testing deliverable, it lives here.

Verified ground truth (re-confirmed, not re-derived):
- `npm run lint` → clean. `npx tsc --noEmit` → clean. `npm run build` → exit 0.
- 84 API routes, 31 page routes (34 `page.tsx` files found by this audit — see note in CODE-004), 26 Prisma models.
- `package.json` has zero test-related dependencies and no `test` script. No stray `*.test.ts(x)` / `*.spec.ts(x)` files exist anywhere in `app/`, `lib/`, or `components/` (confirmed via filesystem search — none found).

---

## 1. Testing gap (spec §23)

### TEST-001 — Zero automated test coverage across the entire application
- **Severity:** Critical
- **Priority:** P0
- **Evidence:** `package.json` — no Jest/Vitest/Playwright/Testing Library/Cypress in `dependencies` or `devDependencies`, no `test` script. Filesystem search for `*.test.ts(x)`/`*.spec.ts(x)` under `app/`, `lib/`, `components/` returns zero files.
- **Impact:** 84 API routes and 31+ pages, including payment webhook handling, booking concurrency logic, and role-based access control, ship with no regression safety net. Every change is a manual-QA-or-pray change.
- **Recommendation:** Do not chase 80% coverage retroactively — that is the wrong first move for a solo/small team on a live app with this much surface area (per master spec guidance against recommending hundreds of low-value tests). Instead, adopt a **lean, risk-ranked testing strategy** (below) and grow coverage only where a regression would be expensive or hard to detect manually.
- **Complexity:** XL (as a full program); the first tranche below is M.

### Recommended lean testing strategy — priority order

Rather than a blanket coverage target, add tests in this order, stopping to reassess after each tranche. Rationale: rank by (a) blast radius of a silent failure and (b) how hard the bug is to catch by eye during manual QA.

1. **Payment webhook handling — `app/api/webhooks/paymob/route.ts` (217 lines).** Highest priority: this is the one code path where a bug means real money is lost or a customer is charged without a confirmed booking, and webhook bugs are notoriously hard to catch manually (they only fire from an external system, are easy to leave broken for weeks, and idempotency bugs only show up under retries/duplicate deliveries). Write integration tests for: signature/HMAC verification rejection, duplicate-webhook idempotency (the code already guards this at route.ts:114 and :154 — assert it holds), and both the success (`:185`) and failure (`:204`) booking-status transitions.
2. **Booking seat-lock / concurrency — `app/actions/bookings.ts` (`lockSeat`, line 12; 423 lines total).** Race conditions in seat locking are the classic "works every time you test it manually, fails under concurrent load in production" bug class — exactly what unit/integration tests catch that manual QA won't. Note: this audit found `lockSeat` is defined but has **no callers anywhere in the codebase** (see CODE-006) — resolve that ambiguity (dead code vs. a missing integration) before or as part of writing its tests, since testing a function nothing calls is wasted effort.
3. **Auth / role-gating — `auth.config.ts`, `lib/auth.ts` (219 lines), and the centers/dashboard access-level checks noted in prior audit passes.** Authorization bugs are high-blast-radius (data leakage across tutors/centers/students) and silent — a broken gate doesn't throw, it just quietly lets the wrong request through. Cover: role-to-route matrix (student/tutor/center-admin/admin), and the center access-level gating added per recent commits (`3adf2cf`, `786df84`).
4. **Rate limiters — `lib/ratelimit.ts` (104 lines).** Lower urgency than 1–3 but cheap to test and protects against abuse; verify the Upstash-backed limiter actually blocks past threshold and fails open/closed as intended if Redis is unreachable (this determines whether a Redis outage becomes a DoS or an open door — worth asserting explicitly either way).

Stop here for the first tranche. Do not proceed to broad component/unit test coverage of UI until 1–4 are in place — those are the tests whose absence has already produced customer-visible risk; general UI coverage is comparatively low-value for a small team's time budget right now.

**Framework recommendation:** Vitest (fast, ESM-native, works cleanly with Next 16 App Router server actions/route handlers) for 1–4, plus Playwright only if/when a handful of true end-to-end smoke flows (login → book a class → pay) are wanted later. Do not install both a unit runner and an E2E runner in the same pass — that's scope creep against the "lean" goal.

---

## 2. Code architecture & quality

### CODE-001 — Several files exceed the 800-line file-size guideline
- **Severity:** Medium
- **Priority:** P2
- **Evidence:** Top of `wc -l` across `app/**/*.ts(x)` and `lib` (generated Prisma client files excluded as non-authored):

  | Lines | File |
  |---|---|
  | 1437 | `app/classes/[id]/book/BookingCheckout.tsx` |
  | 1114 | `app/components/i18n.tsx` |
  | 910 | `app/book/BookClient.tsx` |
  | 835 | `app/admin/AdminClient.tsx` |
  | 783 | `app/tutors/TutorsClient.tsx` |
  | 724 | `app/classes/[id]/ClassDetailClient.tsx` |
  | 654 | `app/classes/ClassClient.tsx` **(dead code — see CODE-006)** |
  | 652 | `components/NavbarClient.tsx` |
  | 635 | `app/ClassSearch.tsx` **(dead code — see CODE-006)** |
  | 613 | `app/tutors/[id]/TutorProfileClient.tsx` |
  | 566 | `app/book/BookMobile.tsx` |
  | 556 | `app/tutors/[id]/edit/TutorEditClient.tsx` |
  | 539 | `app/classes/ClassesClient.tsx` |
  | 521 | `app/centers/CentersClient.tsx` |
  | 514 | `app/centers/[id]/CenterProfileClient.tsx` |

- **Recommendation:** Prioritize splitting the two genuinely live files over 900 lines first — `BookingCheckout.tsx` (1437) and `i18n.tsx` (1114) — since those are both high-traffic, high-risk (payment flow; every page's translation layer). `i18n.tsx` in particular is very likely a large translation-string dictionary rather than logic; if so, extract the string tables into `.json`/data files and keep only the hook/provider logic in the `.tsx`, which resolves the line count without behavior risk. For `BookingCheckout.tsx`, split by concern (payment method selection, seat/schedule selection, price summary, form validation) into sibling files per the existing `*Client.tsx` co-location convention. The two dead files (`ClassClient.tsx`, `ClassSearch.tsx`) should simply be deleted, not split (see CODE-006).
- **Complexity:** M per file.

### CODE-002 — `any` typing is rare and concentrated, not widespread
- **Severity:** Low
- **Priority:** P3
- **Evidence:** Excluding the generated Prisma client (`app/generated/prisma/*`, which is not hand-authored and out of scope): `: any` appears 6 times total (5 in `app/dashboard/page.tsx`, 1 in `app/api/classes/route.ts`). `as any` appears 38 times total, concentrated in `app/dashboard/page.tsx` (15), `app/classes/[id]/page.tsx` (13), `app/tutors/[id]/edit/page.tsx` (4), `app/actions/bookings.ts` (3), plus single occurrences elsewhere.
- **Recommendation:** This is a narrow, tractable cleanup, not a systemic type-safety problem — good news relative to a codebase this size. Focus on `app/dashboard/page.tsx` and `app/classes/[id]/page.tsx` first (28 of the 44 total occurrences between them); these are very likely Prisma `include`/`select` shape mismatches that a properly derived `Prisma.XArgs` or `Prisma.XGetPayload<...>` type would eliminate without runtime changes.
- **Complexity:** S–M.

### CODE-003 — No dedicated logger; `console.*` used directly, including in the payment webhook
- **Severity:** Low
- **Priority:** P3
- **Evidence:** No `logger` module exists anywhere in `lib/` or `app/` (searched `*logger*`, none found). `console.error`/`console.warn` appear across 33 files (reasonable as ad hoc server-side error logging in the absence of a logger). `console.log` (as opposed to `.error`/`.warn`) appears only in one file: `app/api/webhooks/paymob/route.ts` (lines 114, 154, 185, 204) — informational logs tracking webhook idempotency and booking status transitions.
- **Recommendation:** Not urgent, but worth fixing alongside TEST-001 item 1 (webhook tests) since you'll be in that file anyway: replace the four `console.log` calls with `console.info` or, if the app ever adds structured logging/observability (Sentry, Axiom, etc.), route through that instead — plain `console.log` in a webhook handler is easy to lose in production log noise and gives no request correlation ID.
- **Complexity:** S.

### CODE-004 — `eslint-disable` used sparingly (10 files), no `@ts-ignore`/`@ts-expect-error` anywhere
- **Severity:** Info
- **Priority:** P4
- **Evidence:** `eslint-disable` found in: `CenterAdminSettings.tsx`, `CenterAdminTutors.tsx`, `ClassCard.tsx`, `ClassDetailClient.tsx`, `DashboardClasses.tsx`, `MessagesClient.tsx`, `ThreadClient.tsx`, `ProfileClient.tsx`, `SearchClient.tsx`, `TutorCard.tsx` — 10 files, no `.ts`/`.tsx` file has more than a couple of suppressions. Zero `@ts-ignore`/`@ts-expect-error` anywhere in the codebase.
- **Recommendation:** This is a genuinely clean result — no action needed beyond periodically confirming these 10 suppressions still have a valid reason (typically `react-hooks/exhaustive-deps` around intentional one-time effects). Worth a 15-minute spot check next time one of those files is touched, not a standalone task.
- **Complexity:** N/A (informational finding).

### CODE-005 — `"use client"` on page.tsx: all 7 occurrences are legitimate (auth/form pages), not an optimization gap
- **Severity:** Info
- **Priority:** P4
- **Evidence:** 7 of 34 `page.tsx` files open with `"use client"`: `app/dashboard/bookings/page.tsx`, `app/forgot-password/page.tsx`, `app/login/page.tsx`, `app/onboarding/role/page.tsx`, `app/reset-password/page.tsx`, `app/signup/page.tsx`, `app/verify-email/page.tsx`. Inspected each: the auth pages (login/signup/forgot-password/reset-password/verify-email/onboarding-role) are pure client-side forms with `useState`/`signIn()` calls and no server-fetched initial data to preserve — there is no server-component win being left on the table. `app/dashboard/bookings/page.tsx` (270 lines) does its own client-side `fetch("/api/dashboard/bookings")` in a `useEffect` (line 223) rather than fetching server-side and hydrating — this one **is** a real, if minor, missed optimization: it means an extra client-server round trip and a loading-state flash on every visit that a server component fetching the initial page and hydrating a client component for interactivity would avoid.
- **Recommendation:** Leave the 6 auth-flow pages as-is — converting them would add a wrapper file for no measurable benefit. For `dashboard/bookings/page.tsx`, consider the standard split: a server `page.tsx` that does the initial Prisma/API fetch and passes data as props into a `BookingsClient.tsx` for the interactive parts (status updates, notes) — consistent with the `*Client.tsx` pattern already used everywhere else in the app (20 such files exist). Low priority; this is one page, not a pattern-wide problem.
- **Complexity:** S.

### CODE-006 — Confirmed dead code: 26 unused files, 19 unused exports (via `knip`, manually spot-verified)
- **Severity:** Medium
- **Priority:** P2
- **Evidence:** `npx knip` ran successfully (v6.31.0) and reported 26 unused files and 19 unused exports. This audit manually verified the highest-impact ones with targeted `grep` (not just trusting the tool):
  - `app/classes/ClassClient.tsx` (**654 lines**) — grepped for `ClassClient` usage across `app/`; only self-matches and unrelated Prisma-generated `Prisma__ClassClient` type names appear. **Confirmed dead.**
  - `app/ClassSearch.tsx` (635 lines) — grepped for `ClassSearch`; no importer found outside itself. **Confirmed dead.**
  - `app/classes/components/ClassGrid.tsx`, `app/classes/components/TrendingClassesRow.tsx` — grepped; zero external references. **Confirmed dead.**
  - `components/EmailVerificationBanner.tsx`, `components/SignOutButton.tsx` — grepped; zero external references. **Confirmed dead.**
  - `app/actions/bookings.ts`'s exported `lockSeat` function (line 12) — grepped across `app/` and `lib/`; the only match is its own name inside an error-log string (`console.error("lockSeat error:", error)`), i.e. it is never called. Given seat-locking is exactly the kind of concurrency-critical logic flagged in TEST-001 item 2, this needs a decision, not just cleanup: either the app has no live seat-locking mechanism for concurrent booking attempts (a functional gap worth its own investigation) or the locking logic moved elsewhere and this is a stale leftover.
  - Other knip-flagged unused files not individually re-verified here (trust knip's static analysis, lower stakes): `app/actions/reviews.ts`, `app/components/landing/ScrollDots.tsx`, `app/components/LangToggle.tsx`, `app/components/ReviewSection.tsx`, `app/tutors/TutorSearch.tsx`, `components/email-template.tsx`, `components/ui/AttendanceGrid.tsx`, `components/ui/EmptyState.tsx`, `components/ui/ExportButton.tsx`, `components/ui/OnboardingChecklist.tsx`, `components/ui/PayoutHistory.tsx`, `components/ui/PromoCodeInput.tsx`, `components/ui/RatingStars.tsx`, `components/ui/SectionHeader.tsx`, `components/ui/SkeletonCard.tsx`, `components/ui/StatBadge.tsx`, `components/ui/SubjectTag.tsx`, `components/ui/TutorReviewResponse.tsx`, `schemas/booking.ts`, `schemas/review.ts`.
  - Also flagged: 1 unused devDependency (`@types/bcryptjs`), 3 unlisted dependencies used without being in `package.json` (`jose` — used in `app/api/auth/mobile-token/route.ts` and `app/api/mobile/_utils.ts` — and `dotenv/config` in `prisma.config.ts`), and 13 unused exported types.
- **Recommendation:** Before deleting anything, resolve the `lockSeat` question first — it's the one item on this list with functional (not just cleanup) implications. Then delete the confirmed-dead files in a dedicated cleanup PR (don't mix with feature work), and add `jose` and `dotenv` to `package.json` explicitly rather than relying on transitive/implicit resolution — an unlisted direct dependency can silently break on a clean install if a transitive path to it ever changes.
- **Complexity:** S (cleanup), M if `lockSeat` turns out to require actually building the missing concurrency control.

### CODE-007 — No duplicate/near-duplicate Dashboard or CenterAdmin components found
- **Severity:** Info
- **Priority:** P4
- **Evidence:** `app/dashboard/DashboardClient.tsx` (311 lines) and `app/centers/[id]/admin/CenterAdminClient.tsx` (92 lines) are the only two `*Client.tsx` files matching a `Dashboard*`/`CenterAdmin*` naming pattern — sizes and apparent responsibilities differ enough (general user dashboard vs. center-specific admin panel) that this does not look like copy-paste drift. No further action.
- **Recommendation:** None needed now; worth a second look only if a third similar "admin panel" surface gets added later.
- **Complexity:** N/A.

---

## 3. Naming & conventions

### CODE-008 — `*Client.tsx` server/client split pattern is applied consistently where it matters
- **Severity:** Info
- **Priority:** P4
- **Evidence:** 20 files matching `*Client.tsx` exist under `app/`, covering the major feature surfaces (booking, classes, tutors, centers, admin, messages, profile, search). The one gap identified (`dashboard/bookings/page.tsx` doing its own client fetch instead of a server+Client split) is covered in CODE-005.
- **Recommendation:** No broad remediation needed; the pattern is real and followed, not just aspirational.
- **Complexity:** N/A.

---

## 4. Dependency risk

### DEP-001 — NextAuth v5 is still in beta (`5.0.0-beta.30`) and running in production
- **Severity:** High
- **Priority:** P1
- **Evidence:** `package.json`: `"next-auth": "^5.0.0-beta.30"`. `npm outdated` shows the latest available in the beta line is `5.0.0-beta.32` — there is still no stable v5 release as of this audit. Auth is the single highest-blast-radius dependency in the app (session handling, credential/OAuth flows, role gating all route through it).
- **Recommendation:** Two concrete actions: (1) **Pin the exact version** (`"next-auth": "5.0.0-beta.30"` without the `^`) rather than floating on beta releases — a beta-to-beta patch can introduce breaking changes without a major version bump to signal it, and `^` currently allows silent upgrades to `beta.32` and beyond on any fresh install. (2) Track the NextAuth v5 stable release (watch the Auth.js GitHub releases) and schedule a deliberate, tested upgrade to stable once available — do not let this drift indefinitely as "still fine" since beta software backing production authentication is a standing risk regardless of current stability.
- **Complexity:** S (pinning now), M (eventual stable migration + testing).

### DEP-002 — `npm outdated` summary (real output, captured this audit)
- **Severity:** Low
- **Priority:** P3
- **Evidence:** Real `npm outdated` output:

  | Package | Current | Wanted | Latest |
  |---|---|---|---|
  | @auth/prisma-adapter | 2.11.1 | 2.11.3 | 2.11.3 |
  | @next/bundle-analyzer | 16.2.6 | 16.3.0 | 16.3.0 |
  | @prisma/client | 6.19.2 | 6.19.3 | **7.9.1** |
  | @tailwindcss/postcss | 4.2.1 | 4.3.3 | 4.3.3 |
  | @types/node | 20.19.35 | 20.19.43 | 26.1.2 |
  | @types/react | 19.2.14 | 19.2.18 | 19.2.18 |
  | @types/react-dom | 19.2.3 | 19.2.4 | 19.2.4 |
  | @upstash/redis | 1.36.3 | 1.38.2 | 1.38.2 |
  | eslint | 9.39.3 | 9.39.5 | **10.8.0** |
  | eslint-config-next | 16.1.6 | 16.1.6 | 16.3.0 |
  | framer-motion | 12.34.3 | 12.43.0 | 12.43.0 |
  | lucide-react | 1.16.0 | 1.28.0 | 1.28.0 |
  | next | 16.1.6 | 16.1.6 | 16.3.0 |
  | next-auth | 5.0.0-beta.30 | 5.0.0-beta.32 | 4.24.15* |
  | prisma | 6.19.2 | 6.19.3 | **7.9.1** |
  | react | 19.2.3 | 19.2.3 | 19.2.8 |
  | react-dom | 19.2.3 | 19.2.3 | 19.2.8 |
  | recharts | 3.7.0 | 3.10.1 | 3.10.1 |
  | resend | 6.9.3 | 6.18.1 | 6.18.1 |
  | tailwindcss | 4.2.1 | 4.3.3 | 4.3.3 |
  | typescript | 5.9.3 | 5.9.3 | **7.0.2** |
  | zod | 4.3.6 | 4.4.3 | 4.4.3 |

  \* `next-auth` "latest" of 4.24.15 is npm resolving the old v4 major as "latest" tag; the actively-used v5 line's newest prerelease is `beta.32` (see DEP-001).
- **Recommendation:** Most of these are routine patch/minor bumps — safe to batch-update in a single low-risk PR (`@auth/prisma-adapter`, `@upstash/redis`, `framer-motion`, `lucide-react`, `recharts`, `resend`, `tailwindcss`, `@tailwindcss/postcss`). Treat **Prisma 6→7**, **ESLint 9→10**, and **TypeScript 5→7** as separate, deliberate major-version upgrade tasks — each can carry breaking changes (Prisma 7 in particular may affect the generated client/query engine) and should not be bundled into a routine dependency-bump PR. Next.js and React are intentionally left on their current minor (16.1.6, 19.2.3) rather than latest (16.3.0, 19.2.8) — reasonable to defer those specifically until there's a reason to move, given the app is stable on the current versions.
- **Complexity:** S (routine batch), M–L each for the three major-version upgrades.

---

## 5. Documentation drift

### DOC-001 — `README.md` is unmodified `create-next-app` boilerplate; real project docs exist but aren't linked from it
- **Severity:** Medium
- **Priority:** P2
- **Evidence:** `README.md` (39 lines) is the stock `create-next-app` template — "This is a Next.js project bootstrapped with `create-next-app`", generic `npm run dev` instructions, links to nextjs.org docs and Vercel deploy. Zero project-specific content (no mention of Prisma/Supabase, NextAuth, Paymob, the `*Client.tsx` pattern, i18n, or how to run the app locally against a real database). Meanwhile substantial project-specific documentation already exists at the repo root but is undiscoverable from the README: `AGENTS.md`, `PRODUCT.md`, `DESIGN.md`, `REMAINING_LIMITATIONS.md`, `SECURITY_AUDIT.md`, `AGENT_PROGRESS.md`, `CODEX_HANDOFF.md`, `CODEX_UI_OVERHAUL_PROMPT.md`, `FABLE_UI_PROMPT_V2.md`.
- **Impact:** Someone new cloning this repo — a new contributor, a future-you six months from now, or an AI agent without prior session context — gets zero project-specific onboarding from the one file everyone reads first. They have to already know to go looking for `AGENTS.md`/`PRODUCT.md` to find anything real.
- **Recommendation:** Rewrite `README.md` to actually describe this project. At minimum: (1) one-paragraph description of what Coursaty/TutorPlatform is (tutoring marketplace, who it's for), (2) real tech stack list (Next.js 16 App Router, Prisma/Supabase, NextAuth v5-beta, Paymob payments, Resend email, Tailwind 4, i18n EN/AR with RTL), (3) actual local setup steps (env vars needed, `prisma db push` against Supabase — not migrations, per the project's own DB workflow — `npm run dev`), (4) a pointer to the deeper docs instead of duplicating them: link to `PRODUCT.md` for product scope, `DESIGN.md` for the design system, `REMAINING_LIMITATIONS.md` for known gaps, `AGENTS.md` for AI-agent working conventions. Keep it short — this is an onboarding index, not a duplicate of those files.
- **Complexity:** S.

---

## Summary table

| ID | Title | Severity | Priority | Complexity |
|---|---|---|---|---|
| TEST-001 | Zero automated test coverage | Critical | P0 | XL (M for tranche 1) |
| DEP-001 | NextAuth v5 beta in production | High | P1 | S / M |
| CODE-001 | Files exceeding 800-line guideline | Medium | P2 | M |
| CODE-006 | 26 unused files / dead code incl. `lockSeat` | Medium | P2 | S / M |
| DOC-001 | README is unmodified boilerplate | Medium | P2 | S |
| CODE-002 | `any` typing (narrow, concentrated) | Low | P3 | S–M |
| CODE-003 | No dedicated logger; raw `console.log` in webhook | Low | P3 | S |
| DEP-002 | Routine + major dependency updates outstanding | Low | P3 | S / M-L |
| CODE-004 | `eslint-disable` usage (clean) | Info | P4 | N/A |
| CODE-005 | `"use client"` on page.tsx (mostly legitimate) | Info | P4 | S |
| CODE-007 | No duplicate Dashboard/CenterAdmin components | Info | P4 | N/A |
| CODE-008 | `*Client.tsx` pattern consistently applied | Info | P4 | N/A |

## Tooling notes for reproducibility
- Dead-code analysis used `npx knip` (v6.31.0, auto-installed, ran clean with real output — not fabricated). Its top findings were spot-verified with manual `grep` cross-checks rather than trusted blindly; all manually re-checked findings matched knip's report.
- `npm outdated` output above is real command output captured during this audit, not inferred from `package.json` version ranges.
- `depcheck`/`ts-prune` were not additionally run since `knip` succeeded and covers overlapping ground (unused files, exports, and dependencies in one pass).
