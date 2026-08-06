# 08 — Agent Task Packets (Wave 0 + Wave 1)

Packets for later waves follow the same template and are generated from `tasks.json` at the start of each wave (once the prior wave's exit criteria are met) rather than pre-written now — writing all 50 up front would go stale against Wave 1's actual merged state. This document instantiates the template for the two waves ready to start immediately.

## Claude task packet format

`Task ID · Audit evidence (finding IDs) · Decision required · Systems involved · Constraints · Alternatives considered · Recommended decision · Downstream implications · Architecture record · Codex handoff requirements`

## Codex task packet format

`Task ID · Objective · Finding refs · Branch/worktree · Allowed files · Restricted files · Required implementation · Non-goals · Contract to follow · Acceptance criteria · Tests to run · Browser routes/breakpoints/languages/roles to check · Evidence to attach · Handoff format`

---

## Wave 0 (all Claude-led, Type A — packets are short by design)

**T0-01 — Playwright MCP + baseline**
Decision: add at project scope now (audit's own biggest verification gap). Command: `claude mcp add playwright npx @playwright/mcp@latest --scope project`. After adding, capture one screenshot per: `/`, `/tutors`, `/classes`, `/classes/[id]`, `/classes/[id]/book`, `/dashboard`, `/centers` — at 1280px and 390px, in `en` and `ar`. Store under `overhaul/baseline/` (new). Downstream: every Wave 2+ UX/mobile task packet references this baseline for before/after comparison.

**T0-02 — CLAUDE.md**
Decision: one-line `@AGENTS.md` import per `audit/11`§1.6's verified official pattern. Done this session — see repo-root `CLAUDE.md`.

**T0-03 — Commit audit/ + overhaul/**
Decision: commit both directories as one Phase-0 commit; commit `.mcp.json` alongside (no secrets present, OAuth-backed endpoints only). Downstream: this is the artifact every later task packet cites — losing it uncommitted would silently invalidate every finding-ID reference in this plan.

**T0-04 — Worktree cleanup**
Decision: confirm `.claude/worktrees/friendly-raman-8e4a6e/` is gitignored (per `audit/11`§0's open question) before deleting. If tracked, extract anything valuable (its `.playwright-cli` logs are historical evidence, not needed) then remove via `git worktree remove`.

**T0-05 — Test framework**
Decision: Vitest. Reasoning: no existing precedent to contradict, integrates cleanly with Next.js 16 App Router and TypeScript without additional config layers Jest would need, and is the framework `T5-01`'s risk-ordered tranche (webhook/concurrency/auth/rate-limit tests) can be written against directly. Add `vitest`, `vitest.config.ts`, one trivial passing test, and an `npm test` script.

**T0-06 — Workflow decision**
Decision: adopt PR-based commits for this overhaul specifically (branches per `tasks.json`'s `branch` field → PR → Claude review → merge), while leaving non-overhaul hotfixes on the existing commit-to-main pattern if the product owner prefers speed there. Add a `## Code Review Rules` section to `AGENTS.md` (see repo-root `AGENTS.md`, updated this session) so Codex's PR-review automation reads the same rules Claude Code task packets reference.

---

## Wave 1 (Critical Repairs)

### T1-01 + T1-02 — Booking seat-lock + checkout re-port (Type E, paired)

**Claude packet:**
- Decision required: port `lockSeat()`'s transaction logic *into* `app/api/bookings/route.ts` (preserving promo/package-option support `lockSeat()` currently lacks) rather than retiring the route — lower-risk than swapping the client to a new server action mid-overhaul.
- Constraints: must not regress Paymob redirect handling fixed in `e500435`; must not reintroduce the fake May-2025 calendar.
- Risk model: concurrent-write race on the last seat in a class; abandoned-checkout capacity leak. Rollback: revert to pre-merge `main` (single squash commit), Paymob webhook is unaffected either way (untouched by this task).
- Acceptance criteria (binding for Codex): two concurrent `POST /api/bookings` for the last seat → exactly one confirmed booking, one clean rejection (not a 500); abandoned lock reclaimed by `cron/cleanup-locks` within TTL; `BookingCheckout.tsx` calendar shows real dates from `class.schedule`; all copy through `t()`; identity fields default to session user's real name/school, no hardcoded placeholders.

**Codex packet:**
- Branch: `overhaul/booking-seat-lock`. Allowed files: `app/api/bookings/route.ts`, `app/actions/bookings.ts`, `app/classes/[id]/book/BookingCheckout.tsx`, `app/api/cron/cleanup-locks/route.ts`. Restricted: `lib/paymob.ts` (do not touch — audited as already correct).
- Required: diff current `BookingCheckout.tsx` against commit `e500435` and re-port the honest-scheduling/i18n logic forward on top of the newer profile-editing code from `51b48a1`; wire `lockSeat()`'s serializable-transaction pattern into the live write path; delete the losing implementation, don't leave both.
- Non-goals: no checkout redesign, no new steps in the flow, no touching the Paymob webhook.
- Tests to run: manual two-tab concurrent-booking test against the last seat of a seeded class; confirm cron reclaims a manually-created stale lock.
- Evidence to attach: before/after screenshots (Playwright baseline routes `/classes/[id]/book`, en+ar, 1280px+390px), the concurrency test transcript.
- Handoff: PR against `main` with the acceptance criteria above checked off individually.

### T1-03 — Centers gate fix (Type B, Codex)

Branch `overhaul/centers-gate-fix`. Allowed: `proxy.ts` only. Required: remove the `CENTER_ADMIN`/`ADMIN` role restriction on `/centers` and `/centers/[id]`, matching the page-level logic which is already public-permissive. Non-goals: do not touch `/centers/[id]/admin` (that one *should* stay gated). Test: load `/centers` and any seeded `/centers/[id]` as anonymous, student, and tutor sessions — none should see `/unauthorized`. Evidence: 3 screenshots (one per role).

### T1-04 — Centers create-or-hide (BLOCKED)

No packet issued until Open Decision #1 resolves. Once resolved, this packet is generated from the chosen option using the same template.

### T1-05 — Dashboard revenue gate (Type E, paired)

**Claude packet:** Decision: gate at the data layer, not just the render layer — `dashboard/page.tsx`'s Prisma query itself must branch on `centerAccessLevel` so restricted tutors never receive the raw payload, matching the pattern already correct in `dashboard/export/route.ts`. Acceptance: all 7 surfaces from `CONN-003`'s table pass (not just the new 4); a LIMITED/VIEW_ONLY tutor's network response contains zero revenue/PII fields, verified by inspecting the actual JSON payload, not just what's rendered.

**Codex packet:** Branch `overhaul/dashboard-revenue-gate`. Allowed: `app/dashboard/page.tsx`, `app/dashboard/components/DashboardStats.tsx`, `app/api/dashboard/payouts/route.ts`, `app/api/dashboard/analytics/route.ts`. Add the same 403 pattern from `dashboard/export/route.ts` to the two API routes; branch the page query on `accessLevel`. Evidence: three test accounts (FULL/LIMITED/VIEW_ONLY) with captured network responses attached to the PR.

### T1-06 — Flutter mock-data fix (Type B, Codex)

Branch `overhaul/flutter-mock-data-fix`. Allowed: mobile repo's `services.dart` (or wherever `MarketplaceRepository.classes()` lives). Fix: `data['classes']` → `data['items']`, matching `/api/mobile/classes`'s actual response shape — check that route first to confirm the key name rather than assuming. Evidence: screenshot of the browse screen showing real (non-mock) data.

### T1-07 / T1-08 — Dependency verification (Type B / Type E)

**T1-07 (Codex, Type B):** Branch `overhaul/dep-upgrade-next`. Confirm `npm run build`/`lint`/`tsc --noEmit` all clean against the working-tree `next@16.3.0` bump (already true per `overhaul/01` drift item 1), then commit `package.json`/`package-lock.json`.

**T1-08 (paired, Type E):** Claude packet — check the `next-auth@5.0.0-beta.32` changelog/GitHub Security Advisory against the specific fail-open auth-existence-check CVE named in `SEC-001`; if unconfirmed, do not treat the bump alone as sufficient. Codex packet — run a full auth-flow smoke test on the same branch: login, OAuth linking, 5-attempt lockout, session invalidation. Evidence: pass/fail per flow, attached to the PR before Claude's second review pass (Type E requires two).

### T1-09 — Open redirect fix (Type B, Codex)

Branch `overhaul/login-open-redirect-fix`. Allowed: `app/login/page.tsx` only. Fix: `callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")`. Test: `/login?callbackUrl=//evil.example.com` no longer navigates off-origin post-auth.

### T1-10 — Refund relabel (Type C, paired)

Claude packet: relabel now regardless of the automate-or-not decision (Open Decision #3's own lean) — change the button text to not imply automation. Codex packet: branch `overhaul/refund-relabel`, edit the admin refund-approval UI copy only; do not implement `refundPaymobPayment()` unless a follow-up packet is issued after the decision resolves.

### T1-11 — Suspense boundary (Type E, paired, solo parallel group)

**Claude packet:** Decision: wrap the auth-dependent portion of `Navbar` in `<Suspense>` inside `app/layout.tsx`, not remove the `auth()` call — the nav still needs to know session state, it just shouldn't block the rest of the tree. Risk: touches every one of 31 pages + 84 API routes' rendering mode; regression surface is the entire app. Rollback: single revert commit, isolated branch, easy to back out since no other Wave 1 task touches this file.

**Codex packet:** Branch `overhaul/perf-suspense-navbar`. Allowed: `app/layout.tsx`, `app/Navbar.tsx`. Required: Suspense boundary + a lightweight fallback (skeleton nav, not a blank flash). Test: `npm run build` output — confirm `○`/`◐` appears for the landing page and other auth-independent routes, not `ƒ` across all 115 routes. Evidence: full before/after build-output route table attached to the PR (not a sample — every route, since this is the one task in the plan with app-wide blast radius).
