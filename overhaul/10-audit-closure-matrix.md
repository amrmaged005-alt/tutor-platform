# 10 — Audit Closure Matrix

Full row-by-row mapping: `audit-closure.csv`. This document explains the categories and flags one reconciliation issue found while building it.

## Reconciliation note: finding count

The audit's prose (executive summary, index, this plan's own earlier documents) states "94 findings" throughout. `audit-findings.csv`, the machine-readable source of truth, actually contains **121 rows**. This closure matrix maps every row present in the CSV — the more complete, more authoritative artifact — rather than truncating to match the prose figure. This is noted here rather than silently resolved because it's exactly the kind of duplicated/conflicting-findings reconciliation the planning process should surface, not paper over. It does not change any task's scope; it means the audit's own summary undercounted its findings by roughly 22%, most likely because the "94" figure was fixed early and the CSV kept growing through the final consolidation pass. No action item results from this beyond the note itself.

## Categories

| Resolution path | Count | Meaning |
|---|---|---|
| `task` | 87 | Directly owned by one of the 50 tasks in `tasks.json`, 1:1 or as one of a task's multiple finding IDs |
| `folded_into_task` | 24 | Low/Info-severity or narrowly-scoped findings not given their own task ID — absorbed into the nearest task touching the same file/area, named explicitly per row so nothing silently disappears |
| `requires_owner_decision` | 4 | Blocked purely on `13-open-owner-decisions.md`, not on any code-side dependency: `UX-JOURNEY-007`/`T6-01` (parent accounts), `UX-JOURNEY-008`/`T1-04` (centers), `CONN-009`/`T4-05` (notifications), and — via `CONN-011`/`SEC-007`/`T4-01` — email verification |
| `deferred` | 2 | `ROUTE-008` (waitlist UI trigger) and `A11Y-006` (needs a manual spot check before it's actionable) — neither made it into the audit's own `roadmap.csv`, so this plan doesn't invent a task for them either; both are candidates for a future wave, named so they aren't lost |
| `invalidated_or_no_action` | 1 | `ROUTE-010` — confirmed unshipped design prototype, no code path reaches it, audit itself says no action needed |
| `already_resolved` | 3 | `SEC-002`, `SEC-003`, `SEC-010` — resolved by the uncommitted `next@16.3.0` dependency bump found in `overhaul/01-audit-drift-report.md`; status is `verify-and-commit`, not `done`, until that commit lands |

**No finding was dropped.** Every one of the 121 rows in `audit-findings.csv` has exactly one row in `audit-closure.csv`.

## Reading the status column

- `ready` — no blocker, can start as soon as its wave opens.
- `blocked-by-wave` — depends on an earlier wave's task landing first (see `tasks.json`'s `dependsOn`), not on a decision.
- `blocked-by-decision` — depends on `13-open-owner-decisions.md`, not on any prior wave.
- `verify-and-commit` — code-level fix already exists in the working tree; remaining work is verification and committing, not implementation.
- `done-this-session` — closed as part of producing this plan (`CLAUDE.md`).
- `deferred` / `closed` — terminal states, no task ID.

## Severity coverage check

All 7 Critical-severity findings (`UX-JOURNEY-008`, `CONN-001`, `CONN-004`, `I18N-001`, `SEC-001`, `TEST-001`, plus `PERF-001` scored Critical in `audit-findings.csv`) map to a task with `ready` or `blocked-by-decision` status — none are in `deferred` or `folded_into_task`. This is the load-bearing check: nothing severe was quietly absorbed into a cleanup pass.
