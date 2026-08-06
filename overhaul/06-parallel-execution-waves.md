# 06 — Parallel Execution Waves

Task-level detail: `tasks.json`. This document states entry/exit criteria and merge order per wave. Maximum safe parallel workstreams at any one time: **5** — bounded by Wave 1's largest parallel group (`1-b`, 5 tasks) and by the number of shared foundation files that require single-owner sequencing (see `07`).

## Wave 0 — Recovery & Foundations

- **Entry criteria:** none — starts immediately.
- **Tasks:** T0-01…T0-06, all in parallel group `0-all`.
- **Ownership:** all Claude-led (Type A) — these are Claude Code's own configuration/documentation actions, not implementation work to hand to Codex.
- **Exit criteria:** Playwright MCP committed and a baseline screenshot set exists; `CLAUDE.md` exists and is read by a fresh session; `audit/` and `overhaul/` are committed; the stray worktree is gone; a test framework is chosen; the branch/PR workflow decision is recorded in `AGENTS.md`.
- **Merge order:** any order — no file overlap between these 6 tasks.

## Wave 1 — Critical Repairs

- **Entry criteria:** Wave 0 exit criteria met (Playwright baseline exists before any UI-touching Wave 1 task is reviewed).
- **Tasks:** T1-01…T1-11 (T1-04 excluded pending Open Decision #1).
- **Ownership:** paired/Type E for the four highest-risk items (`T1-01`, `T1-02`, `T1-05`, `T1-08`, `T1-11`), Codex-led/Type B for the five mechanical ones (`T1-03`, `T1-06`, `T1-07`, `T1-09`, `T1-10`).
- **Parallel groups:** `1-a` (2 tasks, sequential pair), `1-b` (5 tasks, fully parallel), `1-c` (2 tasks, parallel to each other and to `1-a`/`1-b`), `1-d-solo` (1 task, isolated).
- **Exit criteria:** `npm audit` clean and **committed** (not just working-tree); `npm run build` shows static/ISR rendering for auth-independent routes; concurrent-booking test manually verified at least once (formal test lands in Wave 5); `/centers` publicly browsable; Flutter app shows live data; dashboard revenue leak closed on all 7 CONN-003 surfaces; login open-redirect fixed.
- **Merge order:** `1-b` and `1-c` tasks merge independently as they complete. `1-a`'s pair merges as one unit. `T1-11` merges last within the wave — it's the one task other in-flight Wave 1 work could theoretically conflict with if `app/layout.tsx` is touched elsewhere (verified: nothing else in Wave 1 touches it).

## Wave 2 — Independent Public Experiences

- **Entry criteria:** Wave 1 exit criteria met. Specifically: `T1-11` merged (landing simplification needs static rendering fixed first) and Playwright baseline exists.
- **Tasks:** T2-01…T2-08.
- **Parallel groups:** `2-a-solo` (`T2-01`, the landing page — isolated per the master brief's instruction not to let multiple agents redesign it independently), `2-b` (6 tasks: `T2-02`, `T2-03`, `T2-05`, `T2-06`, `T2-07`, fully parallel), `1-a-followon` (`T2-04`, `T2-08` — same branch as `T1-01`/`T1-02`, reopened for these follow-on fixes).
- **Exit criteria:** landing page has one clear above-the-fold job, per `00-target-product.md`'s metrics table; all 5 dead admin buttons resolved; referral/promo/review wiring complete; `/privacy`/`/terms` live; orphaned routes resolved.
- **Merge order:** `2-b` tasks merge in any order (no file overlap). `2-a-solo` merges once Claude has reviewed screenshots at all breakpoints/languages. `1-a-followon` merges into the same branch as Wave 1's `1-a` pair before that branch's PR closes, if timing allows — otherwise as its own follow-up PR against the same files.

## Wave 3 — Design-System Consolidation

- **Entry criteria:** Wave 1 exit criteria met (does not require Wave 2 to be complete — only 2 of 9 Wave 3 tasks have any Wave 2-adjacent relationship, and neither is a hard dependency).
- **Tasks:** T3-01…T3-09.
- **Parallel groups:** `3-a` (5 tasks: i18n, RTL, formatting, terminology, nav-breakpoint — fully parallel, each touches disjoint files), `3-b-solo` (`T3-05` + `T3-06`, built sequentially by the same owner since both are new shared components going into `components/`), `3-c-solo` (`T3-08` CSP nonce, `T3-09` lang/dir cookie — both touch `app/layout.tsx`/`proxy.ts`, sequenced one at a time, not parallel to each other).
- **Exit criteria:** the four zero-i18n surfaces named in `00-target-product.md` reach zero; RTL/formatting/terminology fixes applied; both shared components exist and migrations are complete; CSP nonce live; `lang`/`dir` correct on first paint in both languages.
- **Merge order:** `3-a` tasks merge independently. `T3-05` merges before its call-site migrations are reviewed as done (component-then-migration, not simultaneous, per `05`'s "do not parallelize" table). `T3-08` merges after `T1-11` is confirmed live (it already is, by wave ordering) and before `T3-09` to avoid two people editing `app/layout.tsx`'s `<head>` logic in the same window.

## Wave 4 — Core Feature Completion

- **Entry criteria:** Wave 1 exit criteria met.
- **Tasks:** T4-01…T4-05 (`T4-01` and `T4-05` blocked pending Open Decisions #7 and #4 respectively).
- **Parallel groups:** `4-a-solo` (`T4-01`, isolated pending its decision), `4-b` (`T4-02`, `T4-03` — parallel, disjoint files: CSRF touches API routes broadly, mobile parity touches mobile-specific routes), `4-c-solo` (`T4-04`, DB migration — isolated, Type E), `4-d-solo` (`T4-05`, isolated pending its decision).
- **Exit criteria:** CSRF applied consistently or `SameSite` documented as primary defense; mobile rate-limit/lockout parity with web; real migration history exists going forward; email-verification and notification decisions are either resolved-and-shipped or explicitly deferred with honest UI copy.
- **Merge order:** `4-b`'s two tasks merge independently. `T4-04` merges alone, reviewed twice per the Type E protocol. `T4-01`/`T4-05` only enter a merge queue once their blocking decision resolves — do not schedule them into a wave's active parallel group before then.

## Wave 5 — Quality Hardening

- **Entry criteria:** Waves 1–4's non-blocked tasks complete (T5-01 specifically needs `T0-05` and `T1-01`; T5-08 needs `T1-02`; T5-05 needs `T1-08`; T5-03 optionally reuses `T6-03`'s output but doesn't block on it).
- **Tasks:** T5-01…T5-08.
- **Parallel groups:** `5-a-solo` (`T5-01`, testing — isolated, needs focus), `5-b` (5 tasks: SEO baseline, OG image, title fix, README, perf polish — fully parallel), `5-c-solo` (`T5-05`, dependency maintenance — isolated, sequenced after `T1-08`), `5-d` (`T5-08`, code cleanup — can run alongside `5-b` since it targets different files, grouped separately only because it depends on `T1-02`).
- **Exit criteria:** 4 test suites passing (webhook, seat-lock concurrency, auth gating, rate limiters); SEO baseline live; README accurate; perf polish shipped; oversized/dead files addressed.
- **Merge order:** `5-b` merges in any order. `T5-01` merges once Claude confirms the concurrency test actually exercises the T1-01 race condition (not a happy-path stub). `T5-08` merges last in the wave since it touches files several other Wave 5 tasks may have also touched incidentally.

## Wave 6 — Release Preparation / Differentiators

- **Entry criteria:** Wave 5 exit criteria met.
- **Tasks:** T6-01 (blocked, Open Decision #2), T6-02, T6-03.
- **Exit criteria:** per `12-full-overhaul-roadmap.md`'s release checklist — production config confirmed, final link crawl via the now-mature Playwright suite, final permissions review, monitoring/analytics decision made, rollback plan documented, launch checklist signed off by Claude.
- **Merge order:** `T6-02`/`T6-03` independent. `T6-01` only if its decision resolves in favor of building — otherwise this wave closes without it.
