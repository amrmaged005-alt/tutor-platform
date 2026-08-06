# ADR 0001 — Test framework: Vitest

- **Status:** Accepted
- **Date:** 2026-08-06
- **Task:** T0-01…T0-06 wave — specifically **T0-05**
- **Finding:** `TEST-001` (no test framework, no tests, zero coverage)
- **Decider:** Claude Code (coordination lead), per `overhaul/03-agent-responsibility-matrix.md` → Testing row ("Claude owns the framework choice")

## Context

The audit found the repo has **no test framework and no tests at all** (`TEST-001`). That is a hard
blocker for the plan's highest-risk task: `T1-01` fixes a seat-booking race condition, and
`overhaul/09-review-validation-and-handoff.md` requires its concurrency test to "pass twice
independently" before a Type E merge. There is nothing to run that test in.

So the framework decision has to land in Wave 0, before Wave 1 writes any code it needs to prove.

Constraints:

- The repo is Next.js 16 (App Router), React 19, TypeScript 5, ESM-leaning, with a `@/*` → `./*`
  tsconfig path alias.
- No existing test precedent to preserve or contradict — greenfield choice.
- `T5-01`'s tranche is **server-side**: Paymob webhook, seat-lock concurrency, auth/role gating,
  rate limiters. None of it needs a DOM.
- No CI exists yet (`overhaul/03` — Deployment row). The runner must be pleasant to invoke locally
  since local runs are the only gate for now.

## Decision

**Vitest**, configured in `vitest.config.mts`, invoked via `npm test` (`vitest run`) and
`npm run test:watch`.

- `environment: "node"` — every `T5-01` target is server-side. A `jsdom` project gets added only if
  component tests are actually scoped, rather than paying that cost speculatively.
- `include: ["tests/**/*.test.ts"]` — matches `T5-01`'s `filesAffected` (`tests/ (new)`).
- The `@` alias is mirrored from `tsconfig.json` so tests import exactly as app code does.
- Config uses the `.mts` extension and `import.meta.dirname` so it loads cleanly under Vite's
  `configLoader: 'native'`, which becomes the default in a future major.

## Alternatives considered

**Jest.** The incumbent default and better known. Rejected: with Next.js 16 + ESM + TS it needs an
additional transform layer (`next/jest` or `ts-jest` / SWC config) that Vitest does not, and the plan
has no existing Jest investment to protect. More config surface for identical value here.

**`node:test` (built-in runner).** Zero dependencies, genuinely attractive on a
don't-add-a-dependency basis. Rejected: no path-alias resolution without a loader shim, and weaker
ergonomics for the concurrency/mocking work `T5-01` needs. The dependency saving isn't worth
hand-rolling the gaps.

**Playwright only (no unit runner).** Playwright is arriving anyway via `T0-01`/`T6-02`. Rejected:
it's the wrong tool for `T5-01`'s actual list — a webhook signature check and a rate limiter are unit
concerns, and driving them through a browser would be slower and less precise. The two are
complementary, not substitutes: Playwright covers the Browser gate in `overhaul/09`, Vitest covers
the Code gate.

## Consequences

- One new devDependency: `vitest`. Justification for the PR, per `AGENTS.md`'s
  no-dependency-without-justification rule: **closes `TEST-001`; hard prerequisite for `T5-01`, which
  is itself the acceptance evidence for `T1-01`'s Type E merge.**
- `T5-01` writes against this harness with no further setup decisions.
- `tests/harness.test.ts` is a smoke test, not coverage. It deliberately imports a real module
  (`lib/classImage.ts`) through the `@/` alias to prove the harness reaches app code — the thing
  `T5-01` actually depends on. It is not a placeholder to be deleted; it is the alias regression test.
- The 80%-coverage bar in the global ECC rules is **not** met by this ADR and is not claimed to be.
  `T5-01` is explicitly scoped as a risk-ordered tranche ("Not blanket coverage") — closing the full
  coverage gap is out of scope for this overhaul.
- `package.json` was touched by this task. Per `overhaul/07`, that file is frozen to one dependency
  task at a time; the concurrent `next`/`next-auth` bump was parked on `overhaul/dep-upgrade-next`
  first so the two never edit it simultaneously. That branch must rebase onto `main` after this lands.
