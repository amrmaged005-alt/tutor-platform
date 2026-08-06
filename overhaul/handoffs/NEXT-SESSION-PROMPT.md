# Prompt for the next Claude Code session

The full `overhaul/15` execution loop, updated for the state as of `38a9c3c`. This supersedes the
original Claude prompt in `overhaul/15-kickoff-prompts.md` — that one assumed Wave 0 hadn't started.
Copy everything below the line into a fresh session in `c:\Users\Amr\tutor-platform`.

---

You are the coordination lead for the TutorPlatform overhaul. A Codex session runs concurrently in
`../tutor-platform-worktrees/` and writes to the same progress log — check it before claiming
anything.

**Read, in order:** `overhaul/progress-log.md` (authoritative event trail — read the last ~40 lines
carefully), `overhaul/handoffs/2026-08-06-from-claude-review-verdicts.md` (Wave 1 verdicts already
written — do not re-derive them), `overhaul/handoffs/2026-08-06-to-claude.md` (Codex's handoff),
`overhaul/tasks.json`, `overhaul/03-agent-responsibility-matrix.md`,
`overhaul/07-shared-foundations-and-file-ownership.md`, `overhaul/09-review-validation-and-handoff.md`.
Everything else in `overhaul/` is lookup-by-ID reference — don't read it front to back.

## Step 0 — unblock Wave 2 before anything else

The T0-01 Playwright baseline is the single blocker holding Wave 2 shut. The MCP server is approved
and chromium is installed, so `playwright` tools should now be available — verify with a ToolSearch.

1. `npm ci` — `node_modules` drifted to 16.3.0 while `main` pins 16.1.6. Do not trust a green build
   until this runs.
2. `npx tsx prisma/fixtures-acceptance.ts` — idempotent; creates the test accounts.
3. `npm run dev`
4. Capture 7 routes x 2 breakpoints (1280/390) x 2 languages (en/ar) into `overhaul/baseline/`.
   Matrix, naming convention, and the per-shot evidence to record are in `overhaul/baseline/README.md`.
   `overhaul/baseline/capture-baseline.mjs` is a written-but-never-run fallback — read its header
   before using it. Language is client-side only (`localStorage["coursaty-lang"]`), which *is*
   finding A11Y-001 — record any first-paint LTR flash on the AR shots as baseline evidence, not as
   a bug to fix now.
5. Log T0-01 as `merged` and state plainly that Wave 2 entry is now open.

## The loop

Work tasks in dependency order per `overhaul/05`'s parallel groups, wave by wave, **without stopping
for per-task approval**. Do not end your turn to ask "should I continue?" — keep going until the stop
condition below is genuinely met.

1. **Check `overhaul/progress-log.md` first.** If Codex already started or finished a task, skip it.
2. **`agentOwner: "claude"`** → implement directly.
3. **`agentOwner: "paired"` or `"codex"`** → write/confirm the task packet (use the Wave 0/1 packets
   in `overhaul/08` and the contracts in `overhaul/17-claude-contracts.md` as templates), create the
   branch from `tasks.json`'s `branch` field, and append a `handed-off-to-codex` line. **Do not
   implement Codex-owned work yourself to move faster** — the split in `overhaul/03` exists so
   architectural review stays independent of implementation.
4. **When a branch has new commits**, review it against `overhaul/09`'s gates and its originating
   packet, and return a verdict in `overhaul/09`'s format.
5. **Type E tasks** (`executionType: "E"`): perform **both** review passes yourself, re-deriving the
   risk model from scratch on the second rather than confirming the first. Only you may merge a
   Type E branch. Never on a single pass.
6. **Type B / non-E** with green build/lint/test and no protected-file conflict: merge after one pass.
7. **Respect every freeze and protected-file rule in `overhaul/07`.** If two ready tasks touch the
   same protected file, sequence them.
8. **Blocked-on-decision tasks**: T1-04, T4-01, T4-05 already have their `overhaul/13` defaults
   applied and packets issued in `overhaul/16` — they are *not* blocked; proceed. Open Decision #5
   is **resolved by the owner** (cap the book metaphor to 2–3 chapters) — T2-01's PR must not carry a
   "shipped on a default" caveat. Open Decision #8 (CSRF scope) is still open; it changes T4-02's
   size, not its contract, so start with the Type D discovery in `overhaul/17` Contract A.
9. **Append a line to `overhaul/progress-log.md` after every task state change**, before moving on.

## Current state — `main` @ `38a9c3c`

Wave 0 fully merged. Wave 1 in progress:

| Task | State | What's needed |
|---|---|---|
| T1-01/T1-02 | **Blocked — do not merge** | Money-path overbooking race found on Type E pass 2: cron cancels an expired lock, seat is resold, then the late Paymob webhook confirms unconditionally at `app/api/webhooks/paymob/route.ts:163-171`. Two confirmed bookings on a one-seat class, first student has paid. Scope already extended in `tasks.json`; Codex is authorised. |
| T1-03 | Merged, then **reopened** | `app/centers/page.tsx:19-22` still redirects anonymous users, so `UX-JOURNEY-002` is not closed. Registry corrected. |
| T1-05 | Fabricated-zero fixed | Needs payload capture across all 7 `CONN-003` surfaces for FULL/LIMITED/VIEW_ONLY. Fixtures now exist. |
| T1-06 | **Merged** | — |
| T1-07/T1-08 | **Highest urgency** | Takes `npm audit` from 18 vulns (2 critical) to 0. T1-08 is Type E; credentials now exist. |
| T1-09 | Verified closed | I re-tested the revised guard: 0 off-origin escapes. Nit: still uses `window.location.href`, which trips a new 16.3.0 lint rule once T1-07 lands. |
| T1-10 | Not started | Scope corrected — the label lives in `app/admin/AdminClient.tsx`. Relabel only. |
| T1-11 | Acceptance not met | Suspense boundary landed but all 117 routes are still dynamic; `PERF-001` not closed. Amend scope or split the render-mode work. |

**Test credentials** — `prisma/fixtures-acceptance.ts`, password `FixturePass!234` for `student@`,
`tutor-full@`, `tutor-limited@`, `tutor-viewonly@` `fixtures.coursaty.test`. Each tutor owns a class
with a 500 EGP paid booking; `Concurrency Test Class (1 seat)` is the T1-01 race target. `--clean`
removes everything.

## Gotchas that already cost real time

1. **Diff against `git merge-base main <branch>`, never `main`.** Otherwise the diff falsely shows
   `overhaul/*` docs being deleted.
2. **Scope grants belong in `tasks.json`, not prose.** Codex validates `filesAffected` and correctly
   refuses out-of-scope edits. A grant written only in a handoff doc was inert and Codex refused it —
   correctly. Two Wave 1 tasks stalled on under-scoped registry entries.
3. **Verify a packet's factual claims before approving on them.** T1-03 was approved on the packet's
   assertion that page logic was "already public-permissive." It wasn't. Codex caught it, not me.
4. **Check `components/` and `lib/` before accepting any "new" component.** The audit's #1 defect is
   dead-parallel implementations; `SignInRequiredModal` and `PromoCodeInput` already exist and are
   the intended bases for T3-06 and T2-04.

## Stop condition

Stop only when every task in `tasks.json` is `merged`, `skipped-blocked-decision`, or
`awaiting-review` with no Claude-side action left. Then produce one report: waves closed, tasks still
awaiting Codex, decisions shipped on a default that should be revisited, and the severity check from
`overhaul/10-audit-closure-matrix.md` confirming zero Critical/High findings remain in `ready` limbo.

Wave 2's entry criteria are `T1-11` merged plus the baseline — do not open Wave 2 UI work before
both. `overhaul/06` is your authority to proceed between waves, not a checkpoint to pause at.

## Reporting style

The owner has granted blanket approval to proceed without per-step confirmation and is
**non-technical**. Report outcomes in plain language — what works, what's broken, what you need from
them — not in task IDs and jargon. Flag anything that writes to their real database or costs money
before doing it. PR creation currently returns `403` and `gh` isn't installed, so branches merge
locally; mention it once, don't block on it.
