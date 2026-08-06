# Prompt for the next Claude Code session

State as of `a51b62b` (2026-08-06, late). Supersedes every earlier version of this file.
Copy everything below the line into a fresh session in `c:\Users\Amr\tutor-platform`.

---

You are the coordination lead for the TutorPlatform overhaul. A Codex session runs concurrently in
`../tutor-platform-worktrees/` and writes to the same progress log — read it before claiming anything.

**Read, in order:** `overhaul/progress-log.md` (authoritative event trail — the last ~25 lines are this
session's verdicts), `overhaul/handoffs/2026-08-06-to-codex-round-2.md` (the current instruction set
Codex is working from — do not re-derive it), `overhaul/tasks.json`,
`overhaul/03-agent-responsibility-matrix.md`, `overhaul/07-shared-foundations-and-file-ownership.md`,
`overhaul/09-review-validation-and-handoff.md`. Everything else in `overhaul/` is lookup-by-ID.

## What changed last session — don't redo any of it

- **T0-01 is DONE.** 28/28 baseline shots at `overhaul/baseline/`. Read
  `overhaul/baseline/CAPTURE-EVIDENCE.md` before comparing against them — it records per-shot auth
  state and one honesty caveat about `/centers`. **Wave 2's baseline gate is satisfied; T1-11 is the
  only remaining Wave 2 blocker.**
- **`npm audit` is 0.** T1-07/T1-08 merged: `next` 16.3.0, `next-auth` beta.32. Was 18 vulns
  (2 critical, 12 high).
- **`origin/main` is synced** (fast-forwarded, nothing rewritten). The old "diff against
  `git merge-base`, never `main`" gotcha **only applies to branches created before `4b7cb15`**.
- **PRs work again.** The 403 was the MCP integration's credential, not the owner's account — the owner
  has ADMIN. Four PRs are open (#1–#4). Codex's automatic PR review is back as the independent check.
- Merged this session: **T1-07/T1-08**, **T1-10**, **T0-01**.

## Environment gotchas that cost real time last session

1. **`gh` is authenticated and working** — logged in as `amrmaged005-alt`, scopes `gist`, `read:org`,
   `repo`, token in the OS keyring. `gh pr create/list/view` all work with no token juggling. The only
   catch: it lives at `C:\Program Files\GitHub CLI\gh.exe` and may not be on PATH in a shell started
   before it was installed — call it by full path if `gh` is not found. No `GH_TOKEN` export is needed
   and no token is stored in any project file.
2. **Worktrees have no `.env`.** A build failing there is probably environmental, not a regression —
   `main` fails identically without `.env`. Copy `.env` in, build, then delete it. This exact thing made
   a green branch look broken.
3. **Playwright MCP cannot take full-page screenshots** — `fullPage: true` blows its fixed 5 s tool
   timeout on the 10,763 px landing page. Use `overhaul/baseline/capture-baseline.mjs`, with
   `playwright` junctioned into `node_modules` from the MCP's own copy (match the chromium revision —
   1.62.1 matches build 1234; 1.63.0-alpha does not). `node_modules` is a build artifact, so this needs
   no `package.json` change.
4. **`next lint` no longer exists** in Next 16. The repo's `lint` script already calls `eslint`.
5. `npm ci` will fail while a dev server holds `next-swc...node`. Stop it first.
6. Scope grants belong in **`tasks.json`**, not prose. Codex validates `filesAffected` and correctly
   refuses out-of-scope edits.

## Open PRs — all four have a written verdict already

| PR | Task | State | What's needed |
|---|---|---|---|
| [#1](https://github.com/amrmaged005-alt/tutor-platform/pull/1) | T1-01/T1-02 | changes-requested | **One blocker.** The expired-lock branch in the Paymob webhook never checks capacity, so a student who pays at minute 16 of a 15-min lock is cancelled and refund-queued **even when the class is nearly empty**. Fix: count occupied seats in *both* branches; conflict only when capacity is genuinely exceeded. Everything else on this branch is verified good. |
| [#2](https://github.com/amrmaged005-alt/tutor-platform/pull/2) | T1-05 | changes-requested | LIMITED tutors can call `deleteClass` (`dashboard-actions.ts:31` gates only VIEW_ONLY). Scope already extended. Audit **every** exported action in that file — a data-layer read gate does not protect server actions. Still owed: 7 CONN-003 payloads across FULL/LIMITED/VIEW_ONLY. |
| [#3](https://github.com/amrmaged005-alt/tutor-platform/pull/3) | T1-04 | awaiting-review | Contract corrected: `overhaul/16`'s "an admin can still assign CENTER_ADMIN" is FALSE. Accepted that HIDE closes new provisioning entirely. **Must not claim provisioning acceptance.** |
| [#4](https://github.com/amrmaged005-alt/tutor-platform/pull/4) | T1-11 | changes-requested | Architecture decided: **Option A**, bounded client-session Navbar. Files and acceptance in `tasks.json`. **This is the last Wave 2 blocker.** |

## New tasks opened last session — not yet handed to Codex

- **T1-12 (P0)** — `app/api/mobile/book-class/route.ts` still does a non-transactional read-then-create,
  so the overbooking race is fully reachable from the mobile app. **`CONN-001` does not close on T1-01
  alone.** The two paths also disagree on what occupies a seat.
- **T1-14 (P1, security)** — `auth.config.ts:31-34` validates redirects by prefix; 4 proven off-origin
  escapes including `https://coursaty.com@evil.net`. Separate branch, do not fold in.
- **T1-15 (P1)** — `initiatePayment` overwrites `paymobOrderId`, so a superseded attempt that later
  succeeds is captured money with **no booking and no refund row** — nothing in the queue to catch it.
  Touches `prisma/schema.prisma` (protected).
- **T1-13 (P2, owner decision)** — should new tutoring centres be onboardable before launch? Right now
  no actor can create a CENTER_ADMIN.

## The loop

Work in dependency order per `overhaul/05`, wave by wave, **without stopping for per-task approval**.

1. Check `overhaul/progress-log.md` first — skip anything Codex already took.
2. `agentOwner: "claude"` → implement. `"paired"`/`"codex"` → write the packet, create the branch from
   `tasks.json`'s `branch` field, log `handed-off-to-codex`. Don't implement Codex-owned work yourself;
   the split exists so review stays independent of implementation.
3. **Type E** (`executionType: "E"`): do **both** passes yourself, re-deriving the risk model from
   scratch on the second rather than confirming the first. Only you may merge a Type E branch.
   *Both new findings last session came from pass 2, not pass 1.*
4. Type B / non-E with green gates and no protected-file conflict: merge after one pass.
5. Respect every freeze and protected-file rule in `overhaul/07`.
6. Append to `overhaul/progress-log.md` after **every** state change.

**Verify a packet's factual claims before approving on them.** T1-03 was approved on an unverified
assertion and had to be reopened. Last session that habit paid twice: the refund-queue claim checked out
(read the actual admin query), and Codex's "build fails" report turned out to be environmental.

## Stop condition

Stop when every task in `tasks.json` is `merged`, `skipped-blocked-decision`, or `awaiting-review` with
no Claude-side action left. Then report: waves closed, tasks still awaiting Codex, decisions shipped on a
default that should be revisited, and the `overhaul/10` severity check confirming zero Critical/High
findings remain in `ready` limbo.

Wave 2 entry needs **T1-11 merged** — the baseline half is already done.

## Reporting style

The owner has granted blanket approval to proceed without per-step confirmation and is
**non-technical**. Report in plain language: what works, what's broken, what you need from them. Flag
anything that writes to their real database or costs money before doing it. The dev DB is real — the
fixtures script (`prisma/fixtures-acceptance.ts`, password `FixturePass!234`, accounts `student@`,
`tutor-full@`, `tutor-limited@`, `tutor-viewonly@` `fixtures.coursaty.test`) is namespaced, idempotent,
and safe to re-run; `--clean` removes it.

**No outstanding owner actions.** `gh` is authenticated, `origin/main` is synced, the baseline exists,
and all four live branches have open PRs carrying their verdicts. The one open *decision* is T1-13 —
whether new tutoring centres need to be onboardable before launch — and it blocks nothing in Wave 1.
