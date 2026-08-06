# 11 — First Implementation Sprint

This is Wave 0 + Wave 1 from `06-parallel-execution-waves.md`, restated as a standalone sprint brief. It does not attempt Waves 2+.

## Sprint objective

Close every Critical-severity finding, land the one uncommitted-but-already-fixed CVE cluster, and stand up the tooling (Playwright MCP, CLAUDE.md, test framework) every later wave depends on — without touching product simplification, design-system consolidation, or any decision-gated work.

## Included

All of Wave 0 (T0-01…T0-06) and all of Wave 1 except `T1-04` (blocked on Open Decision #1). 16 tasks total.

## Excluded

Everything in Waves 2–6. Specifically excluded even though tempting to bundle: the landing-page work (`T2-01`) — it explicitly depends on `T1-11` landing first, and starting it early risks exactly the kind of parallel-redesign conflict `03-agent-responsibility-matrix.md` warns against.

## Claude assignments

T0-01, T0-02, T0-03, T0-04, T0-05, T0-06 (direct). Spec/review role on T1-01, T1-02, T1-05, T1-08, T1-11 (Type E, paired). Review-only on T1-03, T1-06, T1-07, T1-09, T1-10 (Type B, Codex-led).

## Codex assignments

Implementation on all Type E pairs above (T1-01, T1-02, T1-05, T1-08, T1-11) once Claude's packet is issued. Full ownership of T1-03, T1-06, T1-07, T1-09, T1-10.

## Parallel groups (from `05-task-dependency-graph.md`)

`0-all` (6, Wave 0) → then, once Wave 0 exits: `1-a` (T1-01+T1-02, sequential pair), `1-b` (T1-03/T1-06/T1-07/T1-09/T1-10, 5-way parallel), `1-c` (T1-05+T1-08, parallel to each other), `1-d-solo` (T1-11, isolated). **Maximum concurrent worktrees in this sprint: 5** (group `1-b`).

## Dependencies

Wave 1 as a whole depends on Wave 0's Playwright baseline existing before any Type E task's review can close (screenshots are part of the acceptance evidence for `T1-01/02`, `T1-05`, `T1-11`). Within Wave 1, only `T1-01`→`T1-02` is a hard sequential dependency.

## Merge sequence

1. Wave 0 tasks merge in any order (no overlap).
2. `1-b` tasks merge as each completes — no ordering constraint between them.
3. `1-c` tasks (`T1-05`, `T1-08`) merge independently of each other and of `1-b`.
4. `1-a` pair merges as one unit once both `T1-01` and `T1-02`'s acceptance criteria pass together.
5. `T1-11` merges last — deliberately, since it's the only task with app-wide blast radius (all 31+84 routes) and benefits from landing against a `main` that already has the rest of the sprint's fixes in it, reducing the surface it needs to be regression-checked against twice.

## Exit criteria (this sprint is done when)

- `npm audit` clean **and committed**.
- `npm run build` shows static/ISR rendering for the landing page and other auth-independent routes.
- Two concurrent last-seat booking requests produce exactly one success.
- `/centers` is publicly browsable (gate fixed); center-*creation* remains explicitly out of scope for this sprint (`T1-04` blocked).
- Flutter browse screen shows live data.
- All 7 `CONN-003` dashboard surfaces are gated correctly.
- Login open-redirect is closed.
- Refund-approval button is honestly labeled.
- Playwright MCP is committed with a baseline screenshot set.
- `CLAUDE.md` exists; `audit/` and `overhaul/` are committed; the stray worktree is gone; a test framework is chosen; `AGENTS.md` has a `## Code Review Rules` section.

## Demonstrable product outcome

A fresh visitor can browse `/centers` without a 403, book the last seat in a class without a race condition, and see a checkout with real dates and their own name — three of the audit's ten most serious issues, fixed and demonstrable in one sprint, with zero remaining Critical-severity findings in `ready`/`blocked-by-decision` limbo (the two still open, `T1-04`/`UX-JOURNEY-008` and its dependents, are blocked purely on a product decision, not on engineering capacity).
