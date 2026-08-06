# 14 — Overhaul Index

Everything in this directory turns `audit/` (94-stated/121-actual findings, 15 audit passes) into an executable, dual-agent plan. Read order for a first pass: `00` → `01` → `13-open-owner-decisions.md` → `06` → `11`. Everything else is reference material, looked up by task ID or finding ID as needed.

| File | Contents | Read when |
|---|---|---|
| `00-target-product.md` | What TutorPlatform becomes: promise, journeys, in/out scope, measurable simplicity targets | Before evaluating whether any task's output is "done" |
| `01-audit-drift-report.md` | What changed in the repo since the audit closed (near-zero — one CVE fix already in the working tree, uncommitted) | First — establishes the actual current state |
| `02-claude-codex-capability-matrix.md` | What Claude Code and Codex can actually do here, verified against official docs | Before assigning any new task type not already in `tasks.json` |
| `03-agent-responsibility-matrix.md` | Who owns what, per workstream, and why | Before spawning any agent |
| `04-work-breakdown-structure.md` | 28 workstreams mapped to task IDs, scope/non-scope per stream | When scoping a new task not yet in `tasks.json` |
| `05-task-dependency-graph.md` | Critical path, parallel groups, "do not parallelize" pairs | Before scheduling any two tasks concurrently |
| `06-parallel-execution-waves.md` | Entry/exit criteria and merge order per wave | At the start/end of every wave |
| `07-shared-foundations-and-file-ownership.md` | Protected files, freeze periods, the adapter pattern for cross-cutting changes | Before touching `app/layout.tsx`, `proxy.ts`, `package.json`, or any new shared component |
| `08-agent-task-packets.md` | Full packets for Wave 0 + Wave 1; template for generating later waves' packets | When starting a task |
| `09-review-validation-and-handoff.md` | Validation gates, handoff formats, Type-E second-pass rule | Before merging any task |
| `10-audit-closure-matrix.md` | Every one of 121 findings mapped to a resolution path | When checking whether a finding is actually closed |
| `11-first-implementation-sprint.md` | Standalone brief for Wave 0 + Wave 1, ready to hand to agents today | To start work right now |
| `12-full-overhaul-roadmap.md` | Full timeline, phase narrative, Wave 6 release checklist | For the big picture / stakeholder update |
| `13-open-owner-decisions.md` | 10 decisions, which tasks each blocks, defaults if unanswered | Before Wave 2/4/6 start, or whenever a decision needs to be made |
| `tasks.json` | The 50-task registry — every other document derives from this | Canonical lookup for any task field |
| `task-dependencies.json` | Machine-readable dependency/parallel-group data, generated from `tasks.json` | Tooling / automation |
| `agent-assignments.csv` | Task → owner/reviewer/type/status, generated from `tasks.json` | Spreadsheet view of ownership |
| `file-ownership.csv` | File → owning task, protected flag, generated from `tasks.json` | Checking whether a file is safe to touch |
| `wave-plan.csv` | Wave → task → parallel group → dependencies → branch, generated from `tasks.json` | Scheduling |
| `audit-closure.csv` | Finding → resolution path → task → status, hand-built against `audit/audit-findings.csv` | Full findings-to-tasks lookup |
| `15-kickoff-prompts.md` | Ready-to-paste, self-sufficient prompts for an unattended Claude Code + Codex execution run | To actually start the overhaul |
| `progress-log.md` | Append-only cross-session coordination log both kickoff prompts write to | Checked automatically by both agents before claiming a task |

## Relationship to `audit/`

This directory transforms `audit/` — it does not replace it. Every finding ID, file:line citation, and evidence trail referenced above lives in `audit/01`–`15` and the CSVs there. When a task packet needs "why," it points back to `audit/`; when it needs "what to do next," it points here.
