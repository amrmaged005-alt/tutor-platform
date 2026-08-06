# 07 — Shared Foundations & File Ownership

## Protected files — single-owner, no free parallel editing

| File / area | Owner | Editable by others? | Rule |
|---|---|---|---|
| `app/layout.tsx` | Claude (architecture), implementation by the task's assigned Codex worktree only | No — one task at a time | Touched by `T1-11`, `T3-08`, `T3-09`. Sequenced, never parallel (see `05`'s "do not parallelize" table). Any other task needing a root-layout change must be added to this sequence, not opened as a side branch. |
| `app/Navbar.tsx` | Claude + `T1-11`'s Codex worktree | No | Same rule as above — this is the root cause of `PERF-001`; no other task touches it this overhaul. |
| `proxy.ts` | Claude (architecture) | Only via the specific task that owns the change (`T1-03` for the centers gate, `T3-08` for CSP nonce) | Two unrelated tasks touch this file in different waves — confirm no overlap before starting `T3-08`; re-diff against `T1-03`'s merged state first. |
| `prisma/schema.prisma` | Claude (all schema decisions are Type E) | No direct Codex edits without a Claude-reviewed migration spec | `T4-04` establishes the process; `T4-05` (if built) would be the first schema change to go through it. |
| `package.json` / `package-lock.json` | Claude approves every change; Codex executes via `npm install`/version pins | No — one dependency task active at a time | `T1-07`, `T1-08`, `T0-05`, `T5-05` all touch this file across different waves; never two simultaneously. |
| `lib/security.ts` (extracted in `T4-02`) | Claude defines the contract once; Codex applies it across routes | Yes, for *applying* the check to a new route — not for changing the function's contract | Once `T4-02` lands, any later task adding a mutation route must call this helper, not hand-roll a new check. |
| `components/IconButton.tsx`, `components/Modal.tsx` (new in `T3-05`/`T3-06`) | Claude defines the API; one Codex worktree builds it | Migrations to it happen only after the component merges | Component-then-migration, never simultaneous (see `05`). |
| Global CSS / design tokens | Claude (design-system contract owner) | Codex applies, does not invent new tokens | No task in this plan adds new tokens — all consolidate into the existing system per `00-target-product.md`. |
| Translation/dictionary files (`DICT`) | Claude (terminology decisions, `T3-04`) | Codex wires existing keys freely; adding *new* keys for genuinely new copy requires the terminology owner's sign-off | Per `audit/12`§8: this is wiring, not authoring — most needed keys already exist. |
| `AGENTS.md` / `CLAUDE.md` | Claude, exclusively | No | Documentation-as-source-of-truth; Codex reads these, never edits them. |
| `.mcp.json` | Claude | No | Config file for both agents' tooling; single owner prevents accidental server removal. |

## Freeze periods

- **`app/layout.tsx` / `app/Navbar.tsx`**: frozen to all tasks except the current holder of the sequence (`T1-11` → `T3-08` → `T3-09`, in that order) from Wave 1 through Wave 3.
- **`BookingCheckout.tsx`**: frozen to `T1-01`/`T1-02`'s branch (`overhaul/booking-seat-lock`) through Wave 2's follow-on tasks (`T2-04`, `T2-08`); no other task should branch off `BookingCheckout.tsx` from `main` during this window — branch off `overhaul/booking-seat-lock` instead if work must land before that branch merges.
- **`package.json`**: frozen to one active dependency task at a time, released the moment that task's PR merges.

## Adapter pattern for cross-cutting needs

Any task in Waves 2+ that needs a change to a protected file but is not the file's current task owner must request the change **through** the owning task's packet (add a line item), not open a competing edit. Example: if a Wave 3 task discovers it needs one more `app/layout.tsx` line, it's added to `T3-09`'s scope (the last item in the layout sequence), not shipped as a separate ad hoc patch.

## Non-protected files

Everything else — individual page components, API routes not named above, mobile Dart files, CSS modules scoped to one component, individual dictionary *values* (not the file structure) — is safe for any assigned task's Codex worktree to edit within its own scope, per its task packet's `filesAffected` list in `tasks.json`.

## Communication requirement

Before starting any Wave 2+ task whose `filesAffected` list (in `tasks.json`) overlaps with another *currently in-flight* task's list, the later-starting task must diff against the earlier task's branch, not `main`, to avoid silently reverting in-flight work. This is checked at task-packet creation time (`08-agent-task-packets.md`), not left to discovery at merge time.
