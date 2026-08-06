# 02 — Claude Code & Codex Capability Matrix

Condensed from `audit/11-claude-codex-tooling-opportunities.md`, which is the fully-sourced research pass (official-docs citations for every claim). This document reformats it as a decision matrix for the execution plan; it does not re-verify anything — see `audit/11` for citations and caveats. Verified 2026-08-04–06; the "already configured" column also reflects the `.mcp.json` change confirmed in `overhaul/01-audit-drift-report.md` item 3.

## Claude Code

| Capability | Available? | Already configured here? | How this project uses it | Use now? | Limitations / config needed |
|---|---|---|---|---|---|
| Repo-scale analysis, planning | Yes | Used to produce this plan | Coordination-layer work: this document set | Yes | None |
| Subagents (`.claude/agents/`) | Yes | **No** — none defined | Candidate: `i18n-check` (greps for hardcoded strings outside `DICT`/`useI18n`) | Optional, low urgency | Not blocking; `general-purpose` covers ad hoc versions today |
| Skills | Yes | Yes — Impeccable (`.agents/skills/impeccable`, mirrored to `.claude/skills/`) is mature and covers craft/audit/polish/harden/i18n-review | Frontend/UI task packets should load Impeccable before editing, per `AGENTS.md` | Yes, already in use | Two copies exist (`.claude/skills` vs `.agents/skills`) — not confirmed which is source of truth; note added to `AGENTS.md` |
| Hooks | Yes | **No** — zero configured | `PostToolUse` `tsc --incremental` and `eslint --fix` after `.ts`/`.tsx` edits, catching type/lint drift per-task | Recommended for Wave 1+ | `Stop`-level `npm run build` hook deferred — no CI to mirror against yet, would slow every session |
| MCP — Supabase | Yes | **Yes**, now project-scoped (`read_only=true`) per drift item 3 | Schema inspection during DB-touching tasks (T4-04 migration history, any Prisma work) | Yes | Read-only by config — write operations still need `apply_migration` via an authenticated session |
| MCP — GitHub | Yes | **Yes**, new since audit (drift item 3) | Enables the PR-based Claude↔Codex handoff model this plan uses (Wave-based branches → PRs → review) | Yes | Repo still commits straight to `main` today — adopting PRs is itself a Phase 0 workflow decision, see `06-parallel-execution-waves.md` |
| MCP — Playwright/browser automation | Yes (`claude mcp add playwright npx @playwright/mcp@latest --scope project`) | **No** — the one real gap with hard evidence of need (audit's own biggest limitation) | Screenshot baseline (P0-A), live UX/mobile/RTL verification for every Wave 2+ task packet | **Yes — add in Phase 0**, this is the single highest-value new capability for this plan | One command, `--scope project` to commit to `.mcp.json` |
| CLAUDE.md project memory | Yes | **No** — `AGENTS.md` exists, `CLAUDE.md` does not, so Claude Code has never read project instructions | Carries the product/engineering rules (§4 of the original brief) that both agents must follow | **Yes — created this session**, see repo-root `CLAUDE.md` | One-line `@AGENTS.md` import, documented in `audit/11` §1.6 |
| Figma MCP | Yes (account-level connector, seen this session) | Not project-committed | No evidenced need — Impeccable's own `image_gen` mock workflow already owns visual direction | **No** | Would duplicate Impeccable |
| Permission controls / `settings.local.json` | Yes | Yes, allowlist-only | Unchanged | N/A | N/A |

## Codex

| Capability | Available? | Already configured here? | How this project uses it | Use now? | Limitations / config needed |
|---|---|---|---|---|---|
| Parallel agents / worktrees | Yes (Local / Worktree / Cloud modes) | No local `.codex/` config found | Primary execution mechanism for this plan's Wave 2+ tasks — one worktree per task packet | Yes, from Wave 1 onward | Clean up the *existing* stray Claude worktree (`.claude/worktrees/friendly-raman-8e4a6e`) first — don't let Codex worktrees accumulate the same way |
| Cloud environments | Yes, network off by default | Not configured | Not needed yet — no evidenced background/long-running task in this plan requires it | Not now | Would need `*.supabase.co` and `registry.npmjs.org` explicitly allowlisted if adopted later |
| CLI / IDE integration | Yes | No `.codex/config.toml` found | Per-developer setup, not a repo concern | N/A | Not deep-dived (`audit/11` couldn't verify against a primary doc) |
| GitHub PR review (`@codex review`, auto-review) | Yes, reads `AGENTS.md`'s `## Code Review Rules` section | `.mcp.json` now has a GitHub server (drift item 3), but `AGENTS.md` has no review-rules section yet, and repo still commits to `main` | Once this plan's branch/PR workflow is adopted (`06`), add a `## Code Review Rules` section to `AGENTS.md` so Codex's automatic PR review reuses the same rules Claude Code task packets already reference | Add the `AGENTS.md` section now; full activation depends on adopting PR-based commits | Needs Codex cloud connected to the repo (out of scope to configure from this session) |
| Native image generation (`image_gen`, `gpt-image-2`) | Yes, per OpenAI's April 2026 update — confirmed by this repo's own `.agents/skills/impeccable/reference/codex.md` | **Yes, unused** — a fully-built workflow (steps A–F) exists and has never been run | Directly unblocks the 6+ queued image briefs in `REMAINING_LIMITATIONS.md`, currently stalled on Higgsfield's 0.92 free-tier credits | **Yes — highest-value Codex action in this plan**, see task T6-03 | Exact `image_gen` invocation docs not independently verified against a single canonical OpenAI page — treat quality/availability as "confirmed by repo config + multiple consistent sources," not primary-source-confirmed |
| Test execution / TDD | Yes (general Codex capability) | No test framework installed yet (`TEST-001`) | Codex writes Phase 5 test tranche 1 (webhook, seat-lock concurrency, auth gating, rate limiters) against Claude-authored acceptance criteria | Yes, once a framework is chosen (Vitest recommended — matches Next.js 16/Vite-adjacent tooling, no existing precedent to contradict) | Framework choice is a Type-A Claude decision, not yet made — flagged in `13-open-owner-decisions.md` only if the product owner wants to override; otherwise Claude decides directly during T5-01's task packet |
| Visual/browser inspection | Implied by Codex's browser-based verification capability; not separately deep-dived in `audit/11` | No | UX/mobile task-packet evidence collection (screenshots at defined breakpoints/languages) | Yes, paired with the Playwright MCP baseline once it exists | Depends on Phase 0's Playwright MCP addition landing first |
| Web search | Yes, general capability | N/A | Not needed for implementation tasks in this plan — all evidence is already sourced in `audit/` | No | N/A |
| Deployment verification | Not evidenced in this repo (no `.github/`, no CI) | No | Out of scope until CI exists | No | N/A |

## What was not verified (carried from `audit/11`, unchanged)

- `image_gen`/`gpt-image-2`'s exact current invocation syntax against one canonical OpenAI docs page.
- Codex CLI/IDE-specific `.codex/` config mechanics — no such config exists here to check against.
- Whether `skills-lock.json`'s hash-pinning actually covers the Impeccable skill (it's on disk but not listed).

## Practical implication for this plan

Two capability gaps directly shape the Wave plan: **no Playwright MCP** (blocks automated visual verification for every UX/mobile task until Phase 0 closes it) and **no test framework** (blocks Phase 5's test tranche until a framework is picked, which is itself a small Phase 0/1 decision). Both are addressed as Wave 0 actions in `06-parallel-execution-waves.md`, not deferred.
