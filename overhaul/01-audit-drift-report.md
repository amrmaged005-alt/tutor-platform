# 01 — Audit-to-Repository Drift Report

Verified 2026-08-06, same day the audit closed. Compares `audit/*` (dated 2026-08-04 → 2026-08-06, HEAD at that time = `51b48a1`) against the live repository right now. **Net conclusion: near-zero drift.** The audit's own HEAD commit is still HEAD — nothing has merged since — but there *is* uncommitted work sitting in the working tree that the audit could not have seen because it inspects source, not working-tree state at read time. That uncommitted work resolves part of Phase 1 already.

## Repository state checked

| Check | Result |
|---|---|
| Branch | `main`, up to date with `origin/main` |
| HEAD commit | `51b48a1` — same commit the audit's I18N-001 finding is *about* (the checkout regression). Audit is current with HEAD. |
| Uncommitted changes | `package.json`, `package-lock.json` modified; `.mcp.json` and `audit/` untracked |
| Stray worktree | `.claude/worktrees/friendly-raman-8e4a6e/` still present (branch `claude/friendly-raman-8e4a6e`) — exactly as flagged in `audit/11` §0, not yet cleaned up |
| `npm run build` | **Clean.** Compiles successfully, zero errors |
| `npm run lint` / `tsc --noEmit` | Not re-run this pass; audit already verified clean and no source files changed since |
| `npm audit` (prod deps) | **0 critical / 0 high / 0 moderate / 0 low** — see drift item 1 below |
| `CLAUDE.md` | Still does not exist (TOOL-001 still open) |
| `AGENTS.md` | Unchanged, 4 lines, as audited |

## Drift items

### 1. SEC-001 / SEC-002 / SEC-003 / SEC-010 (CVE cluster) — likely already resolved, uncommitted

The working tree has an uncommitted dependency bump that matches roadmap item **Phase 1.6** almost exactly:

| Package | Audited version | Working-tree version |
|---|---|---|
| `next` | 16.1.6 | **16.3.0** ✅ (exact version the roadmap recommends) |
| `next-auth` | `5.0.0-beta.30` | **`5.0.0-beta.32`** |
| `@auth/prisma-adapter` | `^2.11.1` | `2.11.3`, pinned |
| `prisma` / `@prisma/client` | `^6.19.2` | `6.19.3`, pinned |
| `resend` | `^6.9.3` | `6.18.1` |
| `@next/bundle-analyzer`, `eslint-config-next` | `16.1.6`/`^16.2.6` | `16.3.0` |

`npm audit --omit=dev` on the working tree returns **zero findings at any severity**, versus the audit's SEC-010 count of 18 (2 critical, 12 high, 3 moderate, 1 low). This strongly suggests SEC-001/002/003 are fixed by version bump alone.

**Still valid / not fully closed:**
- This is **uncommitted**. Nothing is shipped until it's committed — treat it as "fix exists in working tree," not "fix is live."
- The roadmap's acceptance criteria for SEC-001 also requires "full auth-flow smoke test passes post-upgrade" — not yet done. `next-auth` is still a pre-1.0 beta; a version bump silencing `npm audit` is not the same as confirming the specific fail-open auth-check bug SEC-001 named is patched in `beta.32`'s changelog. **Priority changed: from "apply the patch" to "verify + regression-test + commit."**
- Open Decision #6 (NextAuth: stay/pin/reconsider) is **unaffected** — the lean (patch-and-stay, pin exact version) is already the shape of what's in the working tree (`5.0.0-beta.32` is pinned, not a `^` range). Worth confirming that was intentional.

**Action:** Task T1-08 (§`04-work-breakdown-structure.md`) is redefined as *verify the beta.32 changelog against the SEC-001 CVE, run the auth-flow regression suite, then commit* — not "apply a patch," which is already partially done.

### 2. PERF-001 (zero static generation) — confirmed still present, not fixed by the dependency bump

Ran `npm run build` against current working tree. Every one of the 31 pages and 84 API routes is marked `ƒ` (dynamic, server-rendered on demand) in the build output, including `/` (landing) and every other auth-independent route. **Zero `○` (static) or `◐` (ISR) routes exist.** The dependency bump did not touch `app/Navbar.tsx` or `app/layout.tsx`. This finding, and its fix (Suspense boundary around the `auth()` call), is **unchanged and still the single highest-leverage performance task in the roadmap.**

### 3. `.mcp.json` now exists — new since the audit, partially closes a TOOL gap

`audit/11-claude-codex-tooling-opportunities.md` §0 states flatly: *"`.mcp.json` does not exist anywhere in the repo."* It now does (untracked), with two project-scoped servers:

```json
{ "mcpServers": {
    "supabase": { "type": "http", "url": "https://mcp.supabase.com/mcp?project_ref=sapgtenfshpkfnbvxjcg&read_only=true" },
    "github":   { "type": "http", "url": "https://api.githubcopilot.com/mcp" }
}}
```

**What this changes:**
- Partially resolves the §1.5 portability gap for Supabase MCP (now project-committed, `read_only=true` — a sensible default for a schema-inspection connector).
- Adds a **GitHub MCP server that did not exist at audit time**, which the audit's §2.4 (Codex PR-review automation) and the master overhaul plan's PR-based coordination model both assume. This is a **positive, unplanned enabler** — it means the "no PR-based workflow" caveat in `audit/11` §2.4 and §1.5 is now partly stale; a PR-based Claude/Codex handoff flow (this plan's Wave-based execution model) is easier to stand up than the audit assumed.
- **Does NOT include Playwright/browser-automation MCP** — TOOL-002 / roadmap P0-A is still fully open. This is the one browser-verification gap that most affects this plan's UX/mobile task packets (all currently written to require manual/Playwright verification because no automated baseline exists yet).
- **Not yet committed** (untracked). No secrets are embedded (both are OAuth-backed HTTP MCP endpoints, no keys in the file), so committing it is low-risk — flagged as a Phase 0 action in this plan rather than decided unilaterally here.

### 4. `audit/` itself is untracked

All 22 audit deliverables (findings, evidence, this plan's entire input) currently exist only in the working tree, uncommitted. If this machine's working tree is lost before a commit, the audit is lost. **Recommend committing `audit/` and `overhaul/` together as the first Phase 0 commit** — treated as a plan action, not decided here.

### 5. Everything else in the 94-finding list: assumed unchanged, not independently re-verified

No source files changed between the audit's read and this check other than `package.json`/`package-lock.json`. All UX, i18n, connection, mobile, and route findings (`UX-*`, `I18N-*`, `CONN-*`, `MOBILE-*`, `ROUTE-*`, etc.) are treated as **still valid as written** — this drift pass did not re-run those specialist audits, only checked build/lint/audit/git state and the two files that actually changed.

## Summary for the plan

- **Phase 1.6 (dependency/CVE upgrades)** collapses from "apply patches" to "verify, regression-test, commit" — lower remaining effort than the roadmap assumed, see T1-07/T1-08.
- **Phase 0** gains two ready-made actions: commit `audit/` + `overhaul/`, and decide whether to commit `.mcp.json` (recommend yes).
- **PERF-001 / T1-11** is unchanged and remains the top performance priority.
- **CLAUDE.md (T0-02)** is unchanged and remains fully open — done as part of this response, see `overhaul/../CLAUDE.md`.
- No finding in the 94-item list needs its severity or priority downgraded except the SEC cluster's remaining-effort estimate.
