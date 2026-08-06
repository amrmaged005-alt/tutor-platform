# 15 — Kickoff Prompts

Two self-sufficient prompts, one per tool. Each assumes the receiving session has **no memory of this conversation** — everything it needs is a file path into `overhaul/` or `audit/`. Paste the Claude Code prompt into a Claude Code session in this repo; paste the Codex prompt into a Codex session (CLI, worktree, or cloud) in the same repo. They coordinate through git branches and `overhaul/progress-log.md`, not through each other directly.

Both are written for **continuous, unattended execution** — work through every ready task without stopping to ask permission per-task. Each still stops itself at the boundaries defined below (genuine decision blocks, Type E merge authority, and end-of-available-work) — those aren't optional pauses, they're where stopping is actually correct.

---

## Prompt for Claude Code

```
You are the coordination lead for the TutorPlatform overhaul. Read, in order:
overhaul/14-overhaul-index.md, overhaul/00-target-product.md, overhaul/tasks.json,
overhaul/03-agent-responsibility-matrix.md, overhaul/07-shared-foundations-and-file-ownership.md,
overhaul/09-review-validation-and-handoff.md, overhaul/progress-log.md (check what's already
in flight before starting anything).

Then work through tasks.json wave by wave, starting at Wave 0, without stopping for
per-task approval. Keep going until every task that CAN proceed has proceeded — do not
end your turn to ask "should I continue?" between tasks. For each task, in dependency order
per overhaul/05-task-dependency-graph.md's parallel groups:

1. Check overhaul/progress-log.md — if another session already started or finished this
   task, skip it and move on.
2. If the task's agentOwner is "claude": implement it directly (Wave 0's T0-01…T0-06 are
   the first of these — several may already be done, verify before redoing).
3. If the task's agentOwner is "paired" or "codex": write/confirm its task packet (use the
   Wave 0/1 packets already in overhaul/08-agent-task-packets.md as the template for later
   waves), create its branch per the `branch` field in tasks.json, and leave it for a Codex
   session to implement. Append a `handed-off-to-codex` line to overhaul/progress-log.md.
   Do not implement Codex-owned work yourself just to move faster — the point of the split
   in overhaul/03 is architectural review staying independent of implementation.
4. When a branch with completed Codex work appears (check `git branch -a` and open PRs),
   review it against overhaul/09-review-validation-and-handoff.md's gates and the originating
   packet. Return a verdict in the format overhaul/09 specifies.
5. For Type E tasks (see tasks.json's executionType field): perform BOTH required review
   passes yourself, re-deriving the risk model fresh on the second pass rather than
   confirming the first. Only you may merge a Type E branch to main — never merge one on a
   single pass, and never let a Codex session merge one autonomously.
6. For Type B/non-E tasks with a green build/lint/test and no protected-file conflict: merge
   after one review pass.
7. Respect every freeze period and protected-file rule in overhaul/07 — if two ready tasks
   would touch the same protected file, sequence them, don't parallelize.
8. If a task is blocked on an open decision (blockedBy field in tasks.json — currently
   T1-04, T4-01, T4-05, T6-01), do NOT stop the whole run for it. Apply the stated default
   from overhaul/13-open-owner-decisions.md, log the assumption clearly in
   overhaul/progress-log.md and in the task's PR description, and continue. Exception:
   Open Decision #5 (landing page) and #8 (CSRF strategy) — apply their stated defaults too,
   but flag both explicitly and loudly in your end-of-run report as "shipped on a default,
   recommend explicit confirmation" rather than treating them as silently resolved.
9. After every task's status changes, append a line to overhaul/progress-log.md before
   moving to the next task.

Stop only when: every task in tasks.json is `merged`, `skipped-blocked-decision`, or
`awaiting-review` with no Claude-side action left to take. At that point, produce one
final report: which waves closed, which tasks are still awaiting Codex, which decisions
were defaulted and should be revisited, and the updated severity coverage check from
overhaul/10-audit-closure-matrix.md (confirm zero Critical/High findings remain in `ready`
limbo). Do not wait for further instructions to start Wave 2 once Wave 1 exits — the wave
plan in overhaul/06-parallel-execution-waves.md is your authority to proceed, not a
checkpoint to pause at.
```

---

## Prompt for Codex

```
You are the implementation engine for the TutorPlatform overhaul. Read, in order:
overhaul/14-overhaul-index.md, overhaul/tasks.json, overhaul/08-agent-task-packets.md,
overhaul/07-shared-foundations-and-file-ownership.md, overhaul/progress-log.md (check
what's already in flight before starting anything).

Work through every task in tasks.json where agentOwner is "codex" or "paired", in the
dependency order given by each task's dependsOn field and overhaul/05-task-dependency-graph.md's
parallel groups. Use worktrees to run independent tasks within the same parallel group
concurrently where your environment supports it; otherwise work them in sequence. Do not
stop between tasks to ask permission — keep working through every ready task until none
remain.

For each task:
1. Check overhaul/progress-log.md — if another session already claimed or finished this
   task, skip it.
2. Append a `started` line to overhaul/progress-log.md, naming the task ID and branch.
3. Create the branch named in tasks.json's `branch` field (or reuse it if it already exists
   from a prior related task — several tasks intentionally share a branch, e.g. T1-01/T1-02).
4. Work strictly within the task's `filesAffected` list. If you discover you need to touch
   a protected file (app/layout.tsx, app/Navbar.tsx, proxy.ts, prisma/schema.prisma,
   package.json — full list in overhaul/07), stop and check whether a task packet already
   owns that file this wave; if it's not yours, do not touch it — note the need in your
   handoff instead.
5. Implement against the task's acceptance criteria (tasks.json `acceptance` field, or the
   fuller packet in overhaul/08 for Wave 0/1 tasks). Run npm run build / lint / tsc --noEmit
   and any task-specific test before considering it done.
6. If the task is blocked (`blockedBy` field set in tasks.json), skip it, append a
   `skipped-blocked-decision` line to the log, and move to the next ready task — do not wait
   on it.
7. Produce the structured handoff from overhaul/09-review-validation-and-handoff.md and open
   a PR against main.
8. Merge authority: if the task's executionType (tasks.json) is B or D and your own
   build/lint/test checks are green, you may merge it yourself. If executionType is C or E,
   or agentOwner is "paired", do NOT merge — mark the PR "AWAITING CLAUDE REVIEW", append an
   `awaiting-review` line to the log, and move on to your next ready task rather than
   waiting idle for that review.
9. Never merge two branches that touch the same protected file in the same run without
   confirming the first is fully merged and you've re-pulled main.

Keep going wave by wave — once Wave 1's Codex-owned tasks are exhausted, move to Wave 2's,
then Wave 3's, etc., per overhaul/06-parallel-execution-waves.md's entry criteria (check
whether the wave's prerequisite tasks are merged before starting its tasks; if not yet
merged, work on a different ready wave's tasks instead of idling).

Stop only when every codex/paired task in tasks.json is `merged` or `awaiting-review` or
`skipped-blocked-decision`. Produce a final report listing what's awaiting Claude's review,
what was skipped and why, and any protected-file conflicts you deferred.
```

---

## Before pasting either prompt

Both prompts assume `overhaul/progress-log.md` exists (it does, seeded empty) and that Wave 0's items are either done or about to be picked up fresh — Claude's prompt re-verifies T0-01/T0-02/etc. rather than assuming this conversation's earlier work persisted into the new session. Nothing else needs to be prepared; both prompts are self-bootstrapping from the files already in `overhaul/` and `audit/`.
