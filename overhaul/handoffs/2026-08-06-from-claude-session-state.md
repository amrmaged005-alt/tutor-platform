# Handoff → next Claude coordination session

**From:** Claude coordination session, 2026-08-06 15:57
**Next focus:** resume Wave 1 review mid-flight; T1-01/T1-02 Type E review has not started

You are the coordination lead. Re-read the kickoff in
[overhaul/15-kickoff-prompts.md](../15-kickoff-prompts.md) — it is still the governing instruction.
**Read [overhaul/progress-log.md](../progress-log.md) first**; a Codex session runs concurrently in
`../tutor-platform-worktrees/` and writes there too.

---

## Goal of next session

Finish the Wave 1 review cycle. Specifically: complete the **T1-05** open question, run **both**
Type E passes on **T1-01/T1-02**, and merge what qualifies. Do not open Wave 2 — its entry criteria
are unmet (below).

---

## State of play

**Done (merged to `main`, now at `7394235`):**

- Wave 0 fully closed — T0-01…T0-06. Gates green: `npm test` (2/2), `tsc --noEmit`, `eslint`,
  `npm run build`.
- Open Decision **#5 resolved by the owner: cap the book metaphor to 2–3 chapters.** This is a
  confirmed answer, **not** a default — T2-01's PR must not carry the "shipped on a default" caveat.
  Constraints in [overhaul/13](../13-open-owner-decisions.md) § "Decision #5 — resolved".
- Three defaulted-decision packets issued, overriding Codex's `skipped-blocked-decision` entries for
  T1-04 / T4-01 / T4-05 → [overhaul/16](../16-defaulted-decision-packets.md).
- Four Claude-owned contracts written → [overhaul/17](../17-claude-contracts.md).
- Closure matrix updated; **zero Critical/High findings remain `blocked-by-decision`.**

**In progress — the actual pickup point:**

- **Wave 1 review.** Verdicts for T1-03, T1-06, T1-09, T1-05 are written in
  [the Codex handoff](2026-08-06-to-codex.md) — read it rather than re-deriving them.
- **T1-05 review is unfinished.** I confirmed the data-layer gate is genuine and stopped mid-way
  through tracing `totalRevenue`. Resolved: it is computed client-side at
  [DashboardClient.tsx:45](../../app/dashboard/DashboardClient.tsx#L45) from `priceEgp *
  bookingsCount`, so it evaluates to 0 for restricted tutors. **Unresolved:** whether zeroing
  `bookingsCount` for `LIMITED` tutors is a functional regression. That question is the blocker.
- **T1-01/T1-02 Type E review never started.** Branch `overhaul/booking-seat-lock` @ `ac74607`.
  Large diff: `BookingCheckout.tsx` −1535, `api/bookings/route.ts` +421, `actions/bookings.ts` −239.

**Blocking:**

- **Playwright baseline still not captured** (T0-01 partial). Needs a session restart to load the MCP
  server plus a seeded dev server. Until it exists you can review T1-01/T1-02 for correctness and
  security but **cannot close their UX gate**, and Wave 2 cannot open at all. Matrix:
  [overhaul/baseline/README.md](../baseline/README.md).
- All Codex branches are based on `89db9af`; `main` is `7394235`. Diffs against `main` falsely show
  `overhaul/*` deletions — a stale-base artifact. **Always diff against `git merge-base main <branch>`.**

---

## Open decisions

- **T1-05 `LIMITED` roster counts** — lean: fetch a PII-free `_count` separately so `LIMITED` keeps
  roster visibility while revenue stays gated. Codex proposes, you approve.
- **Open Decision #8 (CSRF)** — still unanswered. Shapes T4-02's size, not its contract. Needs a
  Type D discovery from Codex: report the actual `SameSite` value on the session cookie.
- **T1-07/T1-08 merge urgency** — the bump takes `npm audit` from 18 vulns (2 critical, 12 high) to
  **0**. Highest-urgency Wave 1 merge once T1-08's Type E evidence lands.

---

## Watch for (process, not code)

- **Do not implement Codex-owned tasks** even when unclaimed. The kickoff is explicit that
  architectural review must stay independent of implementation.
- **Type E needs two genuinely independent passes** — re-derive the risk model on pass two rather
  than confirming pass one. Applies to T1-01/02, T1-05, T1-08, T1-11.
- **The recurring defect is dead-parallel implementations.** It has already shown up twice in things
  I flagged: `SignInRequiredModal` (T3-06) and `PromoCodeInput` (T2-04). Check `components/` and
  `lib/` before accepting any "new" component.
- A background branch-watcher script exists at
  `<scratchpad>/watch-codex.sh` — re-run with `run_in_background: true` to get notified when Codex
  pushes. Note its diffstat is measured against `main`, so it inherits the stale-base artifact above.

---

## Skills to use

- `superpowers:requesting-code-review` / `receiving-code-review` — for the Type E passes.
- `security-reviewer` (agent) — T1-01's concurrency path and T1-05's payload gating.
- `superpowers:verification-before-completion` — before declaring any Wave 1 task merged.

---

## Artifacts (reference only)

- **Governing prompt:** [overhaul/15-kickoff-prompts.md](../15-kickoff-prompts.md)
- **Task registry:** [overhaul/tasks.json](../tasks.json) · **waves:** [overhaul/06](../06-parallel-execution-waves.md)
- **Verdicts written this session:** [handoff/2026-08-06-to-codex.md](2026-08-06-to-codex.md)
- **Contracts:** [overhaul/17](../17-claude-contracts.md) · **defaulted packets:** [overhaul/16](../16-defaulted-decision-packets.md)
- **Closure matrix:** [overhaul/audit-closure.csv](../audit-closure.csv)
- **T1-11 before-state:** [overhaul/baseline/build-routes-before-T1-11.txt](../baseline/build-routes-before-T1-11.txt) (0 static / 0 ISR / 117 dynamic)
- **This session's commits on `main`:** `9753e27` `89db9af` `5b43161` `446f2ca` `7394235`
