# 11. Claude Code & Codex Tooling Opportunities

Research pass only — no code changes. Every capability claim below is sourced from an
official Anthropic (`code.claude.com`, `platform.claude.com`) or OpenAI
(`developers.openai.com`, `learn.chatgpt.com`) page fetched during this audit, or from a
live check against this repo/session. Third-party blog claims (e.g. "best Claude model")
are flagged as such and not treated as authoritative. Per the audit brief: nothing here is
recommended just because it's new — each item states whether it's already present in this
repo, and if so, this document says "use what's there," not "install X."

---

## 0. What's actually configured here today (inspected first)

| Item | Status found |
| --- | --- |
| `.claude/` | Exists. Contains `settings.local.json` (permission allowlist only, no `hooks` key), `.claude/skills/impeccable/` (a duplicate copy of `.agents/skills/impeccable/`), and `.claude/worktrees/friendly-raman-8e4a6e/` (a stray worktree, not touched per instructions — see note below). **No `.claude/agents/` directory** — this repo defines zero custom Claude Code subagents. **No `.claude/hooks/`** and no `hooks` block in any settings file. |
| `.mcp.json` | Does not exist anywhere in the repo. No project-scoped MCP servers are committed. |
| `CLAUDE.md` | Does not exist at the repo root or `.claude/CLAUDE.md`. |
| `AGENTS.md` | Exists at repo root (4 lines). Points readers at `.agents/skills/impeccable/SKILL.md`, `PRODUCT.md`, `DESIGN.md`, and `.impeccable/design.json`. |
| `.agents/skills/` | 12 skills installed via `skills-lock.json`, sourced from `Leonxlnx/taste-skill` on GitHub. Includes `impeccable` (the project's primary design workflow, also mirrored into `.claude/skills/`), plus `brandkit`, `design-taste-frontend` (v1 and v2), `gpt-taste`, `high-end-visual-design`, `image-to-code`, `imagegen-frontend-mobile/-web`, `industrial-brutalist-ui`, `minimalist-ui`, `redesign-existing-projects`, `stitch-design-taste`. |
| `.impeccable/` | `design.json` (machine-readable design tokens sidecar) and `live/config.json` (pre-wired for Impeccable's in-browser "live" iteration mode, targeting `app/layout.tsx`). |
| `skills-lock.json` | Present at root; pins the 12 `.agents/skills/*` installs to a specific GitHub source and content hash. |
| `.github/` | Does not exist. No GitHub Actions workflows, no `claude-code-action`, no Codex GitHub App wiring. |
| Test suite | `package.json` has no `test` script and no test framework (`jest`/`vitest`/`playwright`/`cypress`) in `dependencies` or `devDependencies`. Confirms the gap other audit agents will also flag. |
| Package manager | npm (`package-lock.json`, `postinstall: prisma generate`). No `pnpm-lock.yaml`. |
| Prior browser automation evidence | `.claude/worktrees/friendly-raman-8e4a6e/.playwright-cli/` contains ~20 console logs, page snapshots, and screenshots dated May 16, 2026 — proof a Playwright CLI tool was used ad hoc inside that worktree session. Separately, `CODEX_HANDOFF.md` records "Browser smoke tests passed with Chrome DevTools at desktop and 390x844 mobile widths" across 10 routes on May 31, 2026. **Neither tool is configured persistently anywhere in this repo** — both were one-off, session-local capabilities that left no reusable config behind. This is the concrete evidence behind the "no browser automation available to this audit pass" gap named in the task brief. |
| Higgsfield image-gen credits | Live-checked via the connected `higgsfield` MCP tool during this audit: **0.92 credits, free plan** — unchanged from what `REMAINING_LIMITATIONS.md` recorded. The 6+ queued image briefs are still blocked on this path. |
| Codex-native image gen hook | `.agents/skills/impeccable/reference/codex.md` already exists in this repo and opens with: *"This file is loaded by `$impeccable craft` when the harness has native image generation (currently Codex via `image_gen`)."* This is a **pre-built, unused bridge** — see §2.5. |
| Claude.ai connectors visible to this session | This audit session had live tool access to `claude.ai` connectors for Figma, Supabase, Vercel, Gmail, Google Calendar, and Higgsfield. These are **account-level claude.ai connectors, not project config** — nothing in the repo (`.mcp.json`, settings) wires them up, so a teammate running Claude Code CLI without this Anthropic account would not have them. See §1.5. |

**Note on the stray worktree**: `.claude/worktrees/friendly-raman-8e4a6e/` contains a full second checkout (its own `.git`, `node_modules`-adjacent files, `CODEX_HANDOFF.md`, and clones of `everything-claude-code` and `get-shit-done` reference repos). Per the task instructions this was not modified or explored further. If it's not an active session, it's worth `git worktree remove`-ing manually — it's a few hundred MB of duplicated repo state sitting inside version control's blast radius (it appears to be gitignored, but confirm before assuming it's harmless).

---

## Part 1 — Claude Code

### 1.1 Current models (verified against `platform.claude.com/docs/en/about-claude/models/overview`, fetched live)

The generally-available model family as of this audit: **Claude Fable 5** (`claude-fable-5`, most capable, long-running agents), **Claude Opus 5** (`claude-opus-5`, "for complex agentic coding and enterprise work"), **Claude Sonnet 5** (`claude-sonnet-5`, "best combination of speed and intelligence"), **Claude Haiku 4.5** (`claude-haiku-4-5`, fastest/cheapest). This session itself runs on `claude-sonnet-5`.

Several third-party blog results returned by web search (e.g. "Sonnet 4.6 is the everyday default," "Opus 4.8 is the quality leader") describe the **previous** generation and read as stale or SEO-generated content — the official docs list Opus 4.8/4.7/4.6 and Sonnet 4.6 under a "Legacy models" accordion, i.e. superseded. **Do not trust model-comparison blog posts over the live models page** for this decision; they were already out of date at the time of this fetch.

Practical implication for this repo: nothing to change. Sessions default to whatever the CLI/account resolves (`inherit` for subagents), which is the intended behavior. If cost matters for high-volume subagent work (e.g. an `Explore`-style file search), pin `model: haiku` in a subagent definition — but see 1.2, this repo has no custom subagents to pin.

### 1.2 Subagents — none defined; low-cost opportunity, not urgent

`.claude/agents/` does not exist in this repo, so every Claude Code session here relies entirely on the built-in `Explore`, `Plan`, and `general-purpose` agents (confirmed via `code.claude.com/docs/en/sub-agents`). That's a reasonable default for a single-developer repo; custom subagents pay off when the same specialized worker gets spawned repeatedly with the same instructions.

Concrete candidates specific to this codebase, if the developer wants to invest:
- An **i18n-check** subagent (`tools: Read, Grep, Glob`) that greps for hardcoded English strings outside the `DICT`/`useI18n` pattern — directly targets the i18n drift risk this audit pass flags, and the same check would have caught the "Center Admin Module Is English-Only" item in `REMAINING_LIMITATIONS.md` before it shipped.
- A **prisma-schema-guard** subagent scoped to `prisma/schema.prisma` and migration files, since this project's workflow note (`project_db_workflow.md` in memory) already calls out `prisma db push`/Supabase MCP `apply_migration` as a nonstandard, error-prone path worth double-checking.

Neither is urgent; the built-in `general-purpose` agent already covers ad hoc versions of both tasks. Not recommending adoption for its own sake.

### 1.3 Skills — Impeccable is already installed and does more than "design"; don't duplicate it

`.agents/skills/impeccable/SKILL.md` (mirrored at `.claude/skills/impeccable/SKILL.md`) is a mature, actively-maintained project-local skill covering the full frontend lifecycle: `craft`, `shape`, `audit`, `polish`, `bolder`/`quieter`, `harden` (production-readiness incl. i18n/edge cases), `animate`, `colorize`, `typeset`, `layout`, `clarify` (UX copy), `adapt` (responsive), `optimize` (perf), and a `live` in-browser iteration mode wired to `app/layout.tsx` via `.impeccable/live/config.json`. It also embeds hard anti-slop rules (contrast minimums, banned gradient-text/glassmorphism/eyebrow patterns, and a section of **Codex-specific defects to refuse-and-rewrite** — ghost-card borders, over-rounded corners, sketchy SVG illustrations, stripe backgrounds, "X theater" copy).

This means: any recommendation in this audit to "add a generic UI-quality skill" or "add an accessibility-review skill" would be duplicating work already done here, better, with project-specific tuning. The one real gap in the Impeccable setup is that it's duplicated in two locations (`.claude/skills/impeccable` and `.agents/skills/impeccable`) — harmless today since Claude Code discovers project skills from `.claude/skills/`, but a future skill update via whatever installer manages `.agents/skills/` (the `skills-lock.json` hash-pinning mechanism, source `Leonxlnx/taste-skill`... though note `impeccable` itself is *not* listed in `skills-lock.json`'s tracked skills, so it's unclear what keeps the two copies in sync) could silently drift out of sync with the `.claude/` copy Claude Code actually loads. Worth a one-line note in `AGENTS.md` clarifying which copy is source-of-truth.

### 1.4 Hooks — none configured; two are worth adding, most are not

Verified hook mechanics against Claude Code's hooks docs (referenced from the sub-agents page; not separately fetched in full, but the mechanism — `PreToolUse`/`PostToolUse`/`Stop`/`SubagentStart`/`SubagentStop`, JSON stdin, exit-code-2 blocking — is documented and consistent with what the user's global `web/hooks.md` rule file already describes). This repo currently has zero hooks (`.claude/settings.local.json` has only a `permissions.allow` list).

Given this is npm (not pnpm, contradicting the example commands in the global `web/hooks.md` rule), a project-scoped `PostToolUse` hook for `tsc --incremental` after `.ts`/`.tsx` edits would catch the kind of type drift this audit's other passes are likely finding manually. `eslint --fix` similarly. A `Stop`-level `npm run build` hook is more debatable for a single-dev workflow — it would slow down every session end noticeably on a Next.js 16 project and there's no CI to mirror it against yet (no `.github/`), so the payoff is lower until CI exists. Recommend the two `PostToolUse` hooks now, defer the `Stop` build-verification hook until either CI exists or build times are confirmed acceptable.

### 1.5 MCP servers

**Supabase MCP**: `REMAINING_LIMITATIONS.md` and the project's own memory (`project_db_workflow.md`) already state the team uses Supabase MCP's `apply_migration` for schema changes (in preference to `prisma db push`, which had connectivity issues). This audit session had live `mcp__claude_ai_Supabase__*` tools available, confirming the connector works — **but it's a claude.ai account-level connector**, not a project-committed `.mcp.json` entry. Nothing to newly install; the one real gap is portability: if this project is ever handed to another developer or CI runner, the Supabase access won't exist until they separately connect it in their own claude.ai account or the project adds a proper `.mcp.json` entry with `supabase-mcp` (the official npm-published server) and a service-role key via env var. Given this is presently a solo project per the memory notes, this is a low-priority note, not an action item.

**Figma MCP**: also present as a claude.ai connector in this session, unused by the project (no design-handoff workflow referenced in `AGENTS.md`, `DESIGN.md`, or the Impeccable skill beyond its own `image_gen`-driven mock workflow). Given Impeccable already owns visual-direction and asset production end-to-end (§1.3, §2.5), there's no evidenced need for Figma handoff on this project — recommend not wiring it up unless a designer starts producing Figma files that need to be implemented, which isn't the current workflow.

**GitHub**: no MCP GitHub server configured, and `gh` was not found on this session's `PATH` either (checked via `gh --version`). Anthropic's official GitHub MCP setup (`claude mcp add --transport http github https://api.githubcopilot.com/mcp/ --header "Authorization: Bearer <PAT>"`, per `code.claude.com/docs/en/mcp`) is one command if the developer wants Claude Code to read/comment on PRs directly instead of through `gh`. Given there's no `.github/` and seemingly no active PR-based workflow (commits go straight to `main` per `git status`/recent log), this is low priority until the project adopts a PR-based workflow.

**Browser automation — the one gap with hard evidence of actual need**: neither Playwright MCP nor Chrome DevTools MCP is configured anywhere in this repo, despite both having been used ad hoc in prior sessions (see §0). Official setup, per `playwright.dev/mcp/clients/claude-code` and confirmed against Claude Code's own MCP reference: `claude mcp add playwright npx @playwright/mcp@latest` (add `--scope project` to commit it to `.mcp.json` so every future session — and every parallel audit agent — has it without reinstalling). This is genuinely useful here: this audit's own instructions note "no browser automation tool was available to earlier agents in this session for live route/visual testing," and `CODEX_HANDOFF.md`'s manual verification list (10 routes checked by hand across two viewport widths) is exactly the kind of repeatable check a committed Playwright MCP server would let a future Claude Code or subagent run unattended and repeatably, instead of a human clicking through routes each release. Recommend adding it at **project scope**, which is the one MCP addition in this whole audit that closes an evidenced, repeated gap rather than a hypothetical one.

### 1.6 CLAUDE.md vs AGENTS.md — this repo has the gap, and there's an official one-line fix

Verified directly against `code.claude.com/docs/en/memory` (fetched in full): **"Claude Code reads `CLAUDE.md`, not `AGENTS.md`."** There is no fallback and no auto-detection. The officially documented fix is exactly the situation this repo is in — a repo with `AGENTS.md` but no `CLAUDE.md`:

```markdown
@AGENTS.md

## Claude Code
<any Claude-specific instructions go here>
```

placed at `./CLAUDE.md`. This loads `AGENTS.md`'s content into Claude Code's context via the `@`-import syntax (both tools then read the same source of truth, no duplication) and lets Claude-only instructions live below it. A plain symlink (`ln -s AGENTS.md CLAUDE.md`) also works but requires Administrator/Developer Mode on Windows, so the import form is the right choice for this repo's environment. This is a **concrete, near-zero-effort fix**: right now, any Claude Code session in this repo is not reading `AGENTS.md` at all — the "Design Context" pointer to Impeccable, `PRODUCT.md`, and `DESIGN.md` in `AGENTS.md` is silently invisible to Claude Code specifically, even though `.claude/skills/impeccable` is present and would otherwise be discovered and loaded correctly by the Skill mechanism itself (skills are auto-discovered independent of CLAUDE.md). The practical effect: Claude Code sessions currently rely on skill auto-discovery working correctly rather than being explicitly pointed at `.agents/skills/impeccable/SKILL.md` the way `AGENTS.md` intends, and they never see the "Impeccable live mode is preconfigured..." pointer at all.

Note also that `code.claude.com` documents Claude Code's `/init` command reading `AGENTS.md` automatically to *seed* a new `CLAUDE.md`, but only when `CLAUDE_CODE_NEW_INIT=1` is set (an opt-in interactive flow flag) — the default `/init` behavior does not read `AGENTS.md`. Manually creating the one-line import file is more reliable than relying on that flag.

---

## Part 2 — Codex

### 2.1 Parallel agents / worktrees (verified: `developers.openai.com/codex/app/worktrees`, via search snippet + cross-reference)

Codex supports git worktrees as a first-class mode (Local / Worktree / Cloud), letting a task run in an isolated checkout so an experiment doesn't touch the active working directory. This is directly analogous to Claude Code's own `isolation: worktree` field on subagents and its "agent teams" feature (documented at `/docs/en/agent-teams`, referenced from the sub-agents page but not independently fetched here) — both ecosystems now have this. Given the repo already has one stray Claude Code worktree sitting unmanaged (`.claude/worktrees/friendly-raman-8e4a6e/`, §0), the actionable note here isn't "adopt worktrees" (both tools already support them) — it's **clean up the existing one and, if worktrees get used going forward with either tool, treat them as disposable and remove them promptly** rather than letting them accumulate as this one has.

### 2.2 Cloud environments

Codex cloud environments (`developers.openai.com/codex/cloud/environments`) let Codex run cloud-hosted tasks with a configured setup script, dependency installation, and — importantly — internet access that is **off by default at runtime** and must be explicitly allowlisted per domain. For this project specifically: Codex cloud would need network access to Supabase (`*.supabase.co`) explicitly allowlisted if it's ever used for tasks touching the database, and to `registry.npmjs.org` for `npm install`. This is a real setup step, not a formality, and worth remembering if the project ever adopts Codex cloud for background tasks — it is not evidenced as currently used here (no `.codex/` config directory or cloud environment file found in the repo).

### 2.3 CLI/IDE integration

Not independently deep-dived beyond confirming Codex CLI and IDE extension existence via search; no evidence in this repo of Codex CLI config (no `.codex/config.toml` or equivalent found). `CODEX_HANDOFF.md`'s existence and content (a completed-work handoff document, written in the past tense, describing a session that already ran browser smoke tests) is the only direct evidence Codex was used on this repo, and it was used as a one-shot session, not with any persistent local config checked in.

### 2.4 PR review automation (verified: `learn.chatgpt.com/docs/third-party/github`, fetched in full)

Codex has a documented GitHub PR review integration, gated on Codex cloud being connected to the repo. Two trigger modes: a `@codex review` PR comment (manual, per-PR), or an **"Automatic reviews"** toggle in Codex settings that reviews every new PR without a mention. Critically: **it reads `AGENTS.md` for custom review rules** via a `## Code Review Rules` section, with guidance to scope rules by directory (root file for repo-wide rules, nested `AGENTS.md` files for service-specific ones) and to focus on consequential behavior rather than mechanical lint/format checks (leave those to CI). This repo's `AGENTS.md` currently has no `## Code Review Rules` section — if the project ever moves to a PR-based workflow (it currently commits straight to `main`), this is a direct, low-effort addition, and it reuses the exact file Claude Code would also be pointed at via the `@AGENTS.md` import in §1.6, so the two tools' review guidance stays in one place. Not actionable today given the commit-to-main workflow, but worth flagging as ready-to-use the moment that changes.

### 2.5 Image generation — the concrete alternative to the blocked Higgsfield path

This is the highest-value finding of this whole document. `REMAINING_LIMITATIONS.md` §1 lists 6+ queued AI image-generation briefs (Cairo skyline hero, empty-state illustrations, per-subject academic imagery, a center-classroom photo) blocked purely on Higgsfield credits — confirmed still at 0.92 credits, free plan, via a live balance check during this audit (§0).

Per OpenAI's official announcements (cross-referenced across `openai.com/index/introducing-upgrades-to-codex/`-style coverage and confirmed independently by this repo's own `.agents/skills/impeccable/reference/codex.md`, which is first-party evidence, not a blog claim): **Codex has native image generation via an `image_gen` tool**, using `gpt-image-2` as of the April 2026 update — invoked directly inside a Codex session with no separate API key, billing setup, or context switch. This is not a hypothetical recommendation; it's confirmed by this repo's own skill file, which already has an entire structured workflow (`reference/codex.md`, steps A through F: direction Q&A → palette generation → mock generation → approval loop → asset-fidelity inventory → asset slicing via a dedicated `impeccable_asset_producer` subagent) written specifically for "when the harness has native image generation (currently Codex via `image_gen`)."

**In plain terms: this project already has a documented, ready-to-run Codex workflow for exactly the kind of imagery the 6 queued Higgsfield briefs describe, and it has apparently never been invoked for them.** The queued briefs in `REMAINING_LIMITATIONS.md` (photorealistic Cairo skyline, academic-themed empty states, per-subject illustrations, classroom photography) are a closer fit for Codex's `image_gen`/`gpt-image-2` path — which needs no external credit balance — than for continuing to wait on Higgsfield credits. This doesn't require adopting anything new; it requires running `$impeccable craft` (or the equivalent asset-production step) in a Codex session against the existing queued brief list.

One caveat, stated honestly: this audit could not independently verify `gpt-image-2`'s output quality or exact current availability against a primary OpenAI docs page (the search results were consistent across an OpenAI announcement post and several secondary sources, but the specific `image_gen` tool-invocation docs page wasn't directly fetched in this pass). Treat "Codex can generate these assets" as confirmed-by-repo-config-and-multiple-consistent-sources, not independently confirmed against a single canonical OpenAI reference page.

---

## Part 3 — Combined recommendation for this project's actual gaps

Phrased as the audit brief requested: use X to solve Y, where Y is a gap this audit pass (or the repo's own `REMAINING_LIMITATIONS.md`) actually found.

1. **Use a project-scoped Playwright MCP server (`claude mcp add playwright npx @playwright/mcp@latest --scope project`) to solve the no-browser-automation gap** this audit session hit directly, and that `CODEX_HANDOFF.md` shows was previously bridged only by manual, non-repeatable route-by-route checking. Committing it to `.mcp.json` means the next audit pass, and the next Codex/Claude session, gets repeatable live-route and visual verification without re-deriving ad hoc tooling each time (as the `.playwright-cli` and Chrome DevTools evidence shows happened twice already, in two different tools, neither persisted).

2. **Use the existing but unread `.agents/skills/impeccable/reference/codex.md` workflow in an actual Codex session to solve the 6+ queued image-generation briefs** blocked in `REMAINING_LIMITATIONS.md` §1. The Higgsfield credit balance (0.92, confirmed live) isn't going to refill itself, and the project has had a documented Codex-native path since before this audit — it's simply never been run against the queued brief list.

3. **Use a `CLAUDE.md` that imports `AGENTS.md` (one file, four lines: `@AGENTS.md` plus a `## Claude Code` heading) to solve the fact that Claude Code sessions in this repo have never actually read `AGENTS.md`.** This is the cheapest fix in this document and closes a real, confirmed-by-official-docs gap, not a hypothetical one.

4. **Add an `i18n-check` custom subagent (`.claude/agents/i18n-check.md`, read-only tools) to solve the i18n drift risk** this audit pass and prior ones (`REMAINING_LIMITATIONS.md` §3, center admin module still English-only) keep re-discovering by hand. A subagent that greps for hardcoded strings outside the `DICT`/`useI18n` pattern, scoped and reusable, turns a recurring manual audit finding into a one-line ask ("run the i18n-check subagent against `app/centers/[id]/admin`").

5. **Do not add**: Figma MCP (no evidenced design-handoff need — Impeccable's own `image_gen` mock workflow already covers visual direction end-to-end), a GitHub MCP server (no PR-based workflow exists yet — commits go straight to `main`), or any additional design/UI-quality skill (Impeccable already covers critique, audit, polish, harden, and i18n/edge-case review in more project-specific depth than a generic addition would).

6. **No automated test suite exists** (confirmed via `package.json`, §0) — this is the one gap in the brief that neither Claude Code nor Codex tooling solves by itself; it requires actually writing tests. Once a test framework exists, both a Claude Code `PostToolUse` hook (`npm test -- --related` after edits) and Codex's PR-review "leave mechanical checks to CI" guidance become meaningfully actionable. Right now there's nothing for either tool's automation to hook into.

---

## What this audit could not verify

- The exact current OpenAI docs page for `image_gen`/`gpt-image-2` tool invocation syntax inside Codex CLI/cloud sessions was not directly fetched (search results and this repo's own skill file were consistent, but not cross-checked against one canonical primary source).
- Codex CLI/IDE-specific configuration mechanics (`.codex/` directory format, IDE extension settings) were not deep-dived; no such config exists in this repo to check against.
- Whether `skills-lock.json`'s hash-pinning mechanism actually covers `.agents/skills/impeccable` (it is present on disk but not listed among the 12 skills tracked in `skills-lock.json`) — flagged as an open question in §1.3, not resolved.
- Whether the `.claude/worktrees/friendly-raman-8e4a6e/` directory is gitignored or actually tracked in version control was not confirmed; flagged for manual check in §0.
