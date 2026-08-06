# 09 — Review, Validation Gates & Handoff Formats

## Validation gates (checked at every task merge, not just wave boundaries)

**Code gate:** `npm run build`, `npm run lint`, `npx tsc --noEmit` all clean; no new dependency without a one-line justification in the PR; no suppressed lint rule without a documented reason; no secret in the diff.

**Product gate:** the task resolves the finding ID(s) it claims to (checked against `10-audit-closure-matrix.md`); no unrequested complexity added; matches `00-target-product.md`'s relevant section; any removed functionality is named explicitly in the PR description.

**UX gate:** desktop + mobile verified (Playwright baseline screenshots, both breakpoints); loading/empty/error states checked where the task touches a data-fetching surface; keyboard navigation checked for any new interactive element; both `en` and `ar` checked where the task touches a user-facing surface.

**Accessibility gate:** automated scan (axe or equivalent, once available) where touched; manual focus-order check for new/changed interactive elements; contrast checked against `A11Y-002`'s documented minimum; `prefers-reduced-motion` respected for any new animation.

**Security gate — mandatory for any Type E task:** auth, authorization, payments, uploads, admin tools, user data, or DB changes. No task in this category merges on a single review pass.

**Integration gate:** no conflict with other completed work in the same wave (checked against `07-shared-foundations-and-file-ownership.md`'s protected-file list); shared contracts (CSRF helper, icon-button/Modal APIs, dictionary keys) remain valid for all existing callers, not just the new one.

**Browser gate:** for any task with a `filesAffected` entry under `app/**` UI components — Playwright MCP screenshots at 1280px and 390px, `en` and `ar`, for every route the task touches, plus a console-error check.

## Structured Codex → Claude handoff (required for every task)

```
Task ID:
Branch/worktree:
Summary of implementation:
Files changed:
Architecture decisions followed (cite the Claude packet):
Deviations from the packet (if any, with reasoning):
Tests run and results:
Browser checks (routes x breakpoints x languages):
Screenshots attached:
Accessibility checks performed:
Known limitations:
Risks:
Follow-up tasks proposed (if any — do not silently expand scope):
Merge dependencies (which other branches must land first/alongside):
Audit findings addressed (finding IDs, cross-checked against tasks.json):
```

## Structured Claude review response (required for every task)

```
Verdict: Approved | Approved with follow-up | Changes requested | Rejected
Product alignment:
Architecture alignment:
Code concerns:
Security concerns:
UX concerns:
Missing tests:
Required changes (if any):
Recommended merge order relative to other in-flight branches:
```

Verdicts other than "Approved" block merge. "Approved with follow-up" requires the follow-up to be filed as a new row in `tasks.json` before merge, not left implicit.

## Type E second-pass requirement

For `T1-01/02`, `T1-05`, `T1-08`, `T1-11`, `T3-08`, `T4-02` (conditionally), `T4-04`, `T4-05` (if built): after the first Claude review returns "Approved," a second, independent pass re-reads the diff and test evidence fresh (not a rubber-stamp of the first pass) before the merge actually happens. If the same Claude session did both passes, the second pass must explicitly re-derive the risk model rather than confirm the first pass's conclusion.

## Rollback requirement

Every Type E task packet states a rollback method before implementation starts (see each Wave 1 packet in `08` for examples — typically "single revert commit, isolated branch"). No Type E task merges without this line filled in.

## Post-merge verification

For any merged task with browser-verifiable output, a Codex post-merge pass re-runs the Playwright baseline against the merged `main` state (not the pre-merge branch) to catch integration regressions invisible to the isolated worktree. This is the "post-merge Codex verification agent" role — see the ready-to-run prompt in the final response.
