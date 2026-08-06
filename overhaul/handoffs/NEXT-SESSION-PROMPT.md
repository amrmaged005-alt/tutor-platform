# Prompt for the next Claude Code session

Copy everything below the line into a fresh session in `c:\Users\Amr\tutor-platform`.

---

You are the coordination lead for the TutorPlatform overhaul. A Codex session runs
concurrently in `../tutor-platform-worktrees/` and writes to the same progress log.

**Read first, in order:** `overhaul/progress-log.md` (the authoritative event trail — read the
last ~30 lines carefully), `overhaul/handoffs/2026-08-06-from-claude-review-verdicts.md`
(my Wave 1 verdicts — do not re-derive them), `overhaul/handoffs/2026-08-06-to-claude.md`
(Codex's own handoff), `overhaul/tasks.json`, then `overhaul/15-kickoff-prompts.md` for the
governing loop. Everything else in `overhaul/` is lookup-by-ID reference.

## Do this first

**Capture the T0-01 Playwright baseline.** The MCP server is now approved and chromium is
installed, so `playwright` tools should be available to you — verify with a ToolSearch. This is
the single blocker holding Wave 2 shut.

1. `npm ci` (my `node_modules` drifted to 16.3.0 while `main` pins 16.1.6 — do not trust a
   green build until you do this)
2. `npx tsx prisma/fixtures-acceptance.ts` (idempotent; creates the test accounts)
3. `npm run dev`
4. Capture 7 routes x 2 breakpoints (1280/390) x 2 languages (en/ar) into `overhaul/baseline/`.
   The matrix, naming convention, and per-shot evidence to record are in
   `overhaul/baseline/README.md`. `overhaul/baseline/capture-baseline.mjs` is a written-but-never-run
   fallback if the MCP tools are missing — read its header before using it.
   Language is client-side only (`localStorage["coursaty-lang"]`) — that is finding A11Y-001, so
   note any first-paint LTR flash on the AR shots as baseline evidence rather than a bug to fix.

Then continue the `overhaul/15` loop: review Codex branches, run both Type E passes yourself, merge
what qualifies, log every state change.

## State

`main` @ `7f00301`. Merged: all of Wave 0, plus T1-03 (partially — see below) and T1-06.

Open Wave 1, with my verdicts already written:

- **T1-01/T1-02** — the serious one. Both Type E passes done. Pass 2 found a **money-path
  overbooking race**: the cron cancels an expired lock, the seat is resold, then the late Paymob
  webhook confirms unconditionally at `app/api/webhooks/paymob/route.ts:163-171`. Two confirmed
  bookings on a one-seat class, first student has paid. Scope is already extended in `tasks.json`
  so Codex is authorised to fix it. **Do not merge until it is fixed.**
- **T1-03** — merged, then reopened. `app/centers/page.tsx:19-22` still redirects anonymous users,
  so `UX-JOURNEY-002` is not closed. Registry corrected; Codex can finish it.
- **T1-05** — Codex fixed the fabricated-zero finding. Remaining: capture payloads for all 7
  `CONN-003` surfaces across FULL/LIMITED/VIEW_ONLY. The fixtures now exist for this.
- **T1-09** — I re-tested Codex's revised guard: 0 off-origin escapes, `SEC-006` closed. One nit:
  it still uses `window.location.href`, which trips a new 16.3.0 lint rule once T1-07 lands.
- **T1-07/T1-08** — highest-urgency merge: takes `npm audit` from 18 vulns (2 critical) to 0.
  T1-08 is Type E and now has credentials available (below).
- **T1-11** — Suspense boundary landed but all 117 routes are still dynamic; `PERF-001` is not
  closed. Either amend scope or split the render-mode work.

## Test credentials

`prisma/fixtures-acceptance.ts` — password `FixturePass!234` for all:
`student@`, `tutor-full@`, `tutor-limited@`, `tutor-viewonly@` `fixtures.coursaty.test`.
Each tutor owns a class with a 500 EGP paid booking; there is a capacity-1 class
(`Concurrency Test Class (1 seat)`) as the T1-01 race target. `--clean` removes everything.

## Gotchas that already cost time

1. **Diff against `git merge-base main <branch>`, never `main`.** Otherwise the diff falsely shows
   `overhaul/*` docs being deleted.
2. **Scope grants must go in `tasks.json`, not prose.** Codex validates `filesAffected` and will
   correctly refuse out-of-scope edits. I authorised a fix in a handoff doc once and it was inert —
   Codex refused, correctly. Two Wave 1 tasks stalled on under-scoped registry entries.
3. **Verify packet claims before approving.** I approved T1-03 on the packet's assertion that page
   logic was "already public-permissive" without checking. It wasn't. Codex caught it, not me.
4. Owner has granted blanket approval to proceed without per-step confirmation, and is
   non-technical — report outcomes plainly, not in jargon.

## Still needs the owner

PR creation returns `403` and `gh` is not installed, so branches are being merged locally rather
than through PRs. That is workable but costs Codex's automatic PR review as an independent check on
your reviews — which already caught one of my misses. Flag it once; do not block on it.
