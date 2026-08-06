# 13 — Open Owner Decisions

Full tradeoff analysis for each of these already exists in `audit/14-open-decisions.md` — this document does not repeat it. It adds the one thing that document couldn't know at audit time: **which specific tasks in this plan are actually blocked on each decision**, and a default fallback so the plan doesn't stall indefinitely waiting on an answer.

| # | Decision | Blocks | Default if unanswered by Wave 2 start |
|---|---|---|---|
| 1 | Centers: build the creation flow, or hide the nav entry/role? | `T1-04` | **Hide.** Lower-risk, reversible, and matches the audit's own lean if centers are exploratory rather than a near-term channel. Building can start any time later without having shipped a dead end in the meantime. |
| 2 | Parent/guardian accounts: build now or defer? | `T6-01` | **Defer** — this is the audit's own explicit lean, and it's a Wave 6 item regardless, so "unanswered" and "deferred" produce the same near-term outcome. |
| 3 | Refund approval: automate or keep manual? | Only the *automation* half of `T1-10` — the relabel ships immediately either way per the audit's lean | **Relabel now, automate later.** No default needed for automation since nothing in this plan proceeds on it without an explicit yes (contingent on confirming Paymob refund-API access, which this plan cannot verify itself). |
| 4 | Notifications: build the real system or stop implying one exists? | `T4-05` | **Stop implying one exists** (relabel Settings toggles) — cheapest correct move regardless of the long-term build decision, and reversible the moment a build decision is made. |
| 5 | Landing-page book metaphor: cap to 2–3 chapters, drop below the fold, or keep as-is? | `T2-01` | **✅ RESOLVED 2026-08-06 — owner confirmed "cap to 2–3 chapters."** No longer a default. See "Decision #5 — resolved" below. |
| 6 | NextAuth v5 beta: patch-and-stay, pin, or reconsider? | Not blocking — the working tree already reflects patch-and-stay-pinned (`5.0.0-beta.32`, exact version, not a range), matching the audit's own lean | N/A — already the de facto answer; `T1-08` just needs to confirm this was intentional |
| 7 | Email verification: re-enable now or continue testing unverified? | `T4-01` | **Continue disabled**, but fix the misleading "resend verification" UI regardless — matches the audit's lean that this was already a deliberate pre-production choice; re-enabling requires a separate Resend deliverability confirmation this plan cannot perform itself |
| 8 | CSRF: extend per-route checks everywhere, or document `SameSite` as primary defense? | Shapes `T4-02`'s scope (large mechanical task vs. a documentation task) | **Verify `SameSite` config first** (a 5-minute check per the audit) before choosing — this determines the task's actual size, so resolve it at the start of Wave 4, not left to default |
| 9 | Supabase auto-pause: acceptable for now, or need an always-on plan? | Not blocking any task | **Acceptable for now** — current usage is dev/staging-shaped per project memory |
| 10 | Migration workflow: start real migration history now, or continue ad hoc? | `T4-04` | **Start now** — the audit's own lean, and `T4-04` is already scoped as a Wave 4 task on this assumption; "continue ad hoc" would mean removing `T4-04` from the plan entirely, not a default that lets it proceed |

## Decision #5 — resolved 2026-08-06

**Answer: cap the book metaphor to 2–3 chapters.** Confirmed by the product owner, not applied as a
default. `T2-01` is cleared to proceed on this shape and must **not** carry the
"shipped on a default" caveat in its PR.

Binding constraints for `T2-01`, derived from this answer plus `00-target-product.md`:

- **The metaphor is kept, not deleted.** 2–3 chapters survive. `00-target-product.md` is explicit that
  the book sequence is a genuine brand asset and Egyptian/educational identity is preserved, not
  diluted. Cutting to zero chapters would violate the target product and is not what was chosen.
- **An actionable hero goes above the sequence.** Real search bar, one CTA, at 0vh — the landing page's
  one clear job on first paint is "search for a tutor, right now."
- **Forced scroll before actionable content: ≤200vh**, down from ~600vh. That's the measurable row in
  `00-target-product.md`'s metrics table and it is the acceptance test.
- **Which 2–3 chapters survive is a design call, not a free one** — pick the ones carrying the most
  brand/identity weight, and say which ones were dropped in the PR description (removed functionality
  must be named explicitly per the Product gate in `overhaul/09`).
- Unchanged from the original packet: `MobileBookScroller` becomes the universal reduced-motion
  fallback, transforms are RTL-branched, and Playwright screenshots are required at every
  breakpoint × language.

Still gated on `T1-11` merging first (static rendering must be fixed before the landing page is
restructured) and on the `T0-01` screenshot baseline existing.

## How to answer

Nine of ten decisions have a stated default that lets the plan proceed without stalling; only #5 (landing page) and #8 (CSRF strategy, which changes task sizing rather than blocking it) genuinely benefit from an explicit answer before their wave starts. Answering any of the ten at any point simply updates the relevant task's packet in `tasks.json` — no other document needs to change.
