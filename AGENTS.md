# Agent Context

## Design Context

For frontend, mobile UI, UX, visual design, or interface-polish work, load the project-local Impeccable skill at `.agents/skills/impeccable/SKILL.md` before editing.

Use `PRODUCT.md` for product strategy and voice. Use `DESIGN.md` for visual decisions, tokens, component treatment, accessibility expectations, Arabic/RTL support, and web/mobile consistency. The machine-readable live-panel sidecar is `.impeccable/design.json`.

Impeccable live mode is preconfigured for the Next.js App Router in `.impeccable/live/config.json`. Start it only when interactive browser iteration is useful.

## Overhaul Plan

This repo is executing a coordinated Claude Code + Codex overhaul against a full-repository audit. Start at `overhaul/14-overhaul-index.md` for the document map, `overhaul/00-target-product.md` for what the product is becoming, and `overhaul/tasks.json` for the canonical task registry (50 tasks across 7 waves, each with an owning agent, execution type, files, and acceptance criteria). Full evidence for every task lives in `audit/` (121 tracked findings, 15 audit passes) — cite finding IDs, don't re-derive them.

**Non-negotiable rules (both agents, every task):**

Product:

- The platform stays recognizably Coursaty/TutorPlatform — its Egyptian identity and book-metaphor landing sequence are preserved, not diluted (see `overhaul/00-target-product.md`).
- Every major page has one clear primary purpose. Content (tutors, classes) stays visually dominant over search chrome and filters.
- Mobile behavior is designed deliberately, not derived by shrinking desktop layouts — the mobile layer already scores highest in the audit; don't regress it.
- Arabic and English are both first-class. No new i18n pattern — wire the existing `DICT`/`useI18n` system.
- A new feature must resolve a named finding ID or serve `overhaul/00-target-product.md` directly. No speculative additions.

Engineering:

- Don't edit a protected file (`app/layout.tsx`, `app/Navbar.tsx`, `proxy.ts`, `prisma/schema.prisma`, `package.json`) outside the task that currently owns it — see `overhaul/07-shared-foundations-and-file-ownership.md`.
- Don't add a dependency without a one-line justification in the PR.
- Don't duplicate an existing utility/component — check `components/` and `lib/` first.
- Don't bypass `tsc`/`eslint`; don't suppress a lint rule without a documented reason.
- Don't expose secrets; don't weaken server-side authorization to make a UI change easier.
- Don't replace real functionality with mock data — this audit's #1 recurring defect pattern is exactly that (dead-parallel implementations: a correct version sitting unused next to a live, flawed one).
- Don't declare a task complete without running its `tasks.json` acceptance criteria.
- Don't merge code that breaks `npm run build`.
- Don't remove existing functionality unless `overhaul/00-target-product.md` or `overhaul/13-open-owner-decisions.md` explicitly approves it.

## Code Review Rules

For Codex's automatic/`@codex review` PR review on this repo:

- Prioritize consequential behavior over mechanical lint/format issues (no CI exists yet to catch those separately — flag but don't block on style alone).
- Any change touching auth, payments, booking concurrency, or dashboard data-exposure is Type E per `overhaul/03-agent-responsibility-matrix.md` — require evidence of Claude's two-pass review before approving, don't self-approve.
- Any change to a protected file (list above) must cite the `tasks.json` task ID that currently owns it.
- Reject a PR that fabricates data, adds a hardcoded placeholder, or ships a second implementation of something that already has one — this is the audit's single most common defect pattern.
