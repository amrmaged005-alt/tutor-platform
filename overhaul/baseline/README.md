# Visual Baseline (T0-01)

Pre-overhaul screenshot baseline. Every Wave 2+ UX/mobile task packet compares against this set
(`overhaul/09-review-validation-and-handoff.md` — Browser gate).

## Status

- **MCP config: done.** `playwright` added to `.mcp.json` at project scope (stdio, `npx @playwright/mcp@latest`).
- **Capture: PENDING.** Not performed in the coordination session that added the config — the MCP server
  is only available after a session restart, and capture additionally needs a running dev server
  (`npm run dev`) with seeded data. This is a blocking prerequisite for **T2-01** and any Wave 2+ task
  with a `filesAffected` entry under `app/**`.

## Capture matrix (28 screenshots)

7 routes x 2 breakpoints x 2 languages.

| Route | Notes |
|---|---|
| `/` | Landing — the T2-01 before-state. Capture full-page scroll height, not just the fold. |
| `/tutors` | Browse — tutors |
| `/classes` | Browse — classes (ClassCard, the T3-01 i18n target) |
| `/classes/[id]` | Class detail (ClassDetailClient — T3-01) |
| `/classes/[id]/book` | Checkout — the T1-01/T1-02 before-state. Highest-value capture in the set. |
| `/dashboard` | Tutor dashboard — capture as a FULL-access tutor (T1-05 compares LIMITED/VIEW_ONLY after) |
| `/centers` | Currently 403s for most roles (UX-JOURNEY-002) — capture the broken state as T1-03's before |

- Breakpoints: **1280px** (desktop) and **390px** (mobile).
- Languages: **en** and **ar** (ar must be captured with `dir=rtl` actually applied — see A11Y-001;
  today this requires a client-side language switch, which is itself the T3-09 finding).

## Naming

`<route-slug>__<breakpoint>__<lang>.png` — e.g. `classes-id-book__390__ar.png`.
Use `index` for `/`.

## Re-capture policy

This directory is the **pre-overhaul** baseline and is not overwritten. Post-merge verification
(`overhaul/09` — Post-merge verification) writes to `overhaul/baseline/post/<task-id>/` instead.
