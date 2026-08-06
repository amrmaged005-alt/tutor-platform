# Progress Log

Append-only. Both the Claude Code and Codex kickoff sessions (see `overhaul/15-kickoff-prompts.md`) write one line per task-state-change here before starting new work, so two independently-running sessions don't duplicate or collide on the same task. Format:

`YYYY-MM-DD HH:MM | task_id | agent | event | note`

Events: `started`, `blocked`, `handed-off-to-claude`, `handed-off-to-codex`, `pr-opened`, `awaiting-review`, `merged`, `skipped-blocked-decision`.

---

2026-08-06 15:02 | T1-04 | codex | skipped-blocked-decision | blockedBy open-decision-1; center creation-or-hide requires the product-owner decision before implementation
2026-08-06 15:02 | T4-01 | codex | skipped-blocked-decision | blockedBy open-decision-7; email verification gate requires Resend deliverability confirmation
2026-08-06 15:02 | T4-05 | codex | skipped-blocked-decision | blockedBy open-decision-4; notification system requires a product-priority decision
2026-08-06 15:10 | T1-07 | codex | started | branch overhaul/dep-upgrade-next; rebasing Claude's parked dependency commit onto local Wave 0 main, then verifying audit/build/lint/tsc
2026-08-06 15:10 | T1-08 | codex | started | shared branch overhaul/dep-upgrade-next; paired Type E auth advisory and regression validation, will not merge without two Claude review passes
2026-08-06 15:14 | T1-05 | codex | started | branch overhaul/dashboard-revenue-gate; paired Type E server-payload authorization fix in an isolated worktree
2026-08-06 15:14 | T1-06 | codex | started | branch overhaul/flutter-mock-data-fix; live API response contract and truthful fallback fix in an isolated worktree
2026-08-06 15:15 | T1-01 | codex | started | branch overhaul/booking-seat-lock; paired Type E serializable seat-lock integration in an isolated worktree
2026-08-06 15:15 | T1-02 | codex | started | shared branch overhaul/booking-seat-lock; sequential checkout regression re-port after T1-01

2026-08-06 15:05 | T0-04 | claude | merged | stray worktree .claude/worktrees/friendly-raman-8e4a6e removed; confirmed gitignored (.gitignore:44) and branch claude/friendly-raman-8e4a6e was an ancestor of main (zero unique commits) before deletion. git worktree list now shows only main.
2026-08-06 15:05 | T0-01 | claude | awaiting-review | PARTIAL. Config done: playwright added to .mcp.json at project scope (stdio, npx @playwright/mcp@latest). Baseline CAPTURE NOT DONE — MCP server needs a session restart and a running dev server with seeded data. Matrix + naming spec written to overhaul/baseline/README.md. Bonus evidence captured without Playwright: overhaul/baseline/build-routes-before-T1-11.txt (full route table, 0 static / 0 ISR / all dynamic — confirms PERF-001). BLOCKS T2-01 and any Wave 2+ app/** UI task until the 28-screenshot set exists.
2026-08-06 15:05 | T0-02 | claude | merged | CLAUDE.md exists at repo root with @AGENTS.md import; verified present and now committed (was untracked).
2026-08-06 15:05 | T0-06 | claude | merged | AGENTS.md ## Code Review Rules section present and now committed. Workflow decision: PR-based per-branch for overhaul tasks, per overhaul/08 T0-06 packet.
2026-08-06 15:05 | T0-05 | claude | merged | Vitest chosen and installed. vitest.config.mts (node env, @/ alias mirrored from tsconfig), tests/harness.test.ts (2 passing, exercises lib/classImage.ts through the alias), npm test + npm run test:watch scripts. ADR at overhaul/adr/0001-test-framework.md. Gates: npm test PASS, tsc --noEmit clean, eslint clean, npm run build green. Unblocks T5-01.
2026-08-06 15:05 | T1-07 | claude | handed-off-to-codex | Working-tree next@16.3.0 + next-auth@5.0.0-beta.32 bump PARKED on branch overhaul/dep-upgrade-next (commit 3b85855) so T0-05 could touch package.json without violating overhaul/07's one-dependency-task-at-a-time rule. NOT verified — Codex still owns build/lint/tsc verification. Branch must rebase onto main after Wave 0 lands. NOTE: main currently reports 18 npm audit vulns (2 critical, 12 high); this branch is what clears them.
2026-08-06 15:05 | T1-08 | claude | handed-off-to-codex | Shares branch overhaul/dep-upgrade-next with T1-07. Type E — needs SEC-001 changelog confirmation + full auth regression suite + TWO Claude review passes. Do not merge on Codex evidence alone.
2026-08-06 15:05 | T0-03 | claude | merged | audit/ (26 files) + overhaul/ (26 files) + CLAUDE.md + AGENTS.md + .mcp.json committed as the plan baseline. .mcp.json committed (not gitignored) — no secrets, OAuth-backed HTTP endpoints + one stdio npx server only.

2026-08-06 15:06 | T1-04 | claude | started | OVERRIDES the 15:02 codex skip. Per overhaul/15-kickoff-prompts.md step 8, a blockedBy task applies its overhaul/13 default rather than stalling the run. Open Decision #1 default = HIDE the centers creation path. Packet issued; assumption logged. Revisit if the product owner chooses "build".
2026-08-06 15:06 | T4-01 | claude | started | OVERRIDES the 15:02 codex skip. Open Decision #7 default = KEEP VERIFICATION DISABLED but fix the misleading resend-verification UI so it matches the actual disabled state. That half needs no deliverability confirmation and ships now. Packet issued.
2026-08-06 15:06 | T4-05 | claude | started | OVERRIDES the 15:02 codex skip. Open Decision #4 default = STOP IMPLYING notifications exist — relabel the Settings toggles honestly. No Notification model, no schema change, no push provider. Packet issued; the build option stays available and reversible.

2026-08-06 15:20 | T1-04 | claude | handed-off-to-codex | Packet written: overhaul/16-defaulted-decision-packets.md § T1-04. Branch overhaul/centers-creation-or-hide created off Wave 0 main. HIDE default. Load-bearing change is server-side (app/api/me/role/route.ts must 400 on CENTER_ADMIN) — hiding only the signup dropdown would leave the hole open and is NOT acceptance. proxy.ts is restricted (owned by T1-03).
2026-08-06 15:20 | T4-01 | claude | handed-off-to-codex | Packet written: overhaul/16 § T4-01. Branch overhaul/email-verification-gate created. Scope is EmailVerificationBanner.tsx copy only; lib/auth.ts diff must be empty. Verified the false claim first-hand: banner says "verify your email to unlock bookings" while the login gate at lib/auth.ts:119-126 is commented out and nothing gates bookings.
2026-08-06 15:20 | T4-05 | claude | handed-off-to-codex | Packet written: overhaul/16 § T4-05. Branch overhaul/notifications-system created. Downgraded Type E -> Type C: the defaulted path touches no schema, so one review pass, not two. Verified CONN-009 fresh: the 3 persisted toggles have Prisma columns that NOTHING in app/ or lib/ reads, and pushOnBooking has no column at all. prisma/schema.prisma diff must be empty.
2026-08-06 15:20 | T1-03 | claude | handed-off-to-codex | Branch overhaul/centers-gate-fix created off Wave 0 main. Packet already exists at overhaul/08 § T1-03. Unclaimed by codex as of this timestamp. Sequencing note: T1-03 owns proxy.ts for Wave 1; T1-04 and T3-08 must not touch it.
2026-08-06 15:20 | T1-09 | claude | handed-off-to-codex | Branch overhaul/login-open-redirect-fix created off Wave 0 main. Packet at overhaul/08 § T1-09. Unclaimed as of this timestamp.
2026-08-06 15:20 | T1-10 | claude | handed-off-to-codex | Branch overhaul/refund-relabel created off Wave 0 main. Packet at overhaul/08 § T1-10. Relabel half only; Open Decision #3 automation half stays unbuilt (no default proceeds on it — nothing in the plan automates a refund without an explicit yes).
2026-08-06 15:20 | T1-11 | claude | handed-off-to-codex | Branch overhaul/perf-suspense-navbar created off Wave 0 main. Packet at overhaul/08 § T1-11. BEFORE-STATE EVIDENCE ALREADY CAPTURED by Claude: overhaul/baseline/build-routes-before-T1-11.txt — full route table off Wave 0 main, 0 static / 0 ISR / 100% dynamic. Codex must diff its after-state against that exact file, full table not a sample. app/layout.tsx + app/Navbar.tsx are frozen to this task through Wave 3.
