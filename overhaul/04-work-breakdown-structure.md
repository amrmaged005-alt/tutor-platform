# 04 — Work Breakdown Structure

Full per-task detail (owner, execution type, files, acceptance criteria, dependencies) lives in `tasks.json` — this document organizes those 50 tasks into workstreams and states scope/non-scope per stream. Every task ID below is looked up in `tasks.json`; nothing here duplicates its fields.

| # | Workstream | Task IDs | In scope this overhaul | Explicitly out of scope |
|---|---|---|---|---|
| 1 | Project recovery & environment | T0-01…T0-06 | Playwright MCP, CLAUDE.md, committing the audit, worktree cleanup, test framework choice, workflow decision | CI/CD pipeline setup (no `.github/` exists; not requested by the audit) |
| 2 | Architecture & shared foundations | T1-11, T4-02, T4-04 | Suspense boundary, CSRF contract, migration-history process | New framework/stack choices — none flagged as needed |
| 3 | Product simplification | T1-03, T1-04, T2-01 | Centers gate + creation-or-hide, landing-page scope | Any feature not named in `audit/12` |
| 4 | Navigation & information architecture | T2-02 | Orphaned-page resolution, `/profile` nav link | Full nav redesign — not flagged as needed |
| 5 | Design system | T3-05, T3-06 | Shared icon-button + Modal components | New token system — existing one scores 75/100, reused as-is |
| 6 | Landing page | T2-01 | Scroll-gate cap/relocation, token unification, RTL page-flip | New landing content — copy from cut chapters is preserved, not rewritten |
| 7 | Browse & search | T3-01 (ClassCard portion) | i18n wiring only | Filter-logic changes — not flagged as broken |
| 8 | Tutor profiles | T2-05 | Review-button wiring | New profile fields — none requested |
| 9 | Authentication & onboarding | T1-08, T1-09, T4-01 | Auth CVE verification, open-redirect fix, email-verification gate | Auth provider replacement — Open Decision #6 leans against this |
| 10 | Booking & scheduling | T1-01, T1-02, T2-04, T2-08 | Seat-lock wiring, checkout re-port, promo field, cancel-path consolidation | Checkout redesign — explicitly ruled out in `00-target-product.md` |
| 11 | Payments | T1-10 | Refund-approval relabel/automate decision | New payment provider — Paymob webhook is untouched, already solid |
| 12 | Messaging & notifications | T4-05 | Notification system build-or-defer decision | Messaging itself — not flagged as broken, no tasks needed |
| 13 | Student dashboard | — | No tasks — not flagged as broken | N/A |
| 14 | Tutor dashboard | T1-05 | Revenue-leak closure (server-side gating) | Dashboard redesign |
| 15 | Parent experience | T6-01 | Decision-gate only | All implementation, pending Open Decision #2 |
| 16 | Admin operations | T2-06, T2-07 | 5 dead buttons, legal pages | New admin features |
| 17 | Arabic, English, RTL | T3-01, T3-02, T3-03, T3-04, T3-09 | i18n wiring, RTL CSS, formatting, terminology, SSR lang/dir | New i18n library/pattern — explicitly ruled out |
| 18 | Media & visual assets | T6-03, T5-03 | Queued image briefs via Codex `image_gen`, OG image | New visual direction — Impeccable already owns this |
| 19 | Mobile & responsive | T1-06, T3-05, T3-06, T3-07 | Flutter fix, shared components, breakpoint unification | New mobile app features |
| 20 | Accessibility | T3-09, (A11Y-002/004/005/006 folded into T5-07/T5-08 cleanup passes) | `lang`/`dir` SSR, contrast/`next/image`/reduced-motion as touched | Full WCAG re-audit — `audit/09` is the audit of record |
| 21 | Performance | T1-11, T5-07 | Suspense fix, analyze script, dict splitting, image patterns | New caching layer — not requested |
| 22 | Security | T1-08, T1-09, T3-08, T4-02, T4-03 | CVE verification, open redirect, CSP nonce, CSRF, mobile parity | Penetration testing — out of this plan's scope |
| 23 | Testing | T0-05, T5-01 | Framework choice, risk-ordered tranche 1 | Blanket 80%+ coverage — `TEST-001` explicitly recommends against this as a first move |
| 24 | Analytics & monitoring | — | No tasks — not requested by the audit | Full analytics build-out |
| 25 | Documentation | T0-02, T0-06, T5-06 | CLAUDE.md, `## Code Review Rules`, README rewrite | N/A |
| 26 | Deployment & release readiness | (Wave 6 checklist, `12-full-overhaul-roadmap.md`) | Manual release checklist | CI/CD — no pipeline exists |
| 27 | Optional differentiators | T6-01, T6-02, T6-03 | Only after Waves 0–5 are stable | Any new speculative feature |
| 28 | SEO | T5-02, T5-04 | Sitemap, robots, structured data, hreflang, title-suffix fix | N/A |

## Coverage check

50 tasks trace to all 94 findings via `10-audit-closure-matrix.md` (some findings, e.g. `DB-002`/`DB-003`/`ROUTE-009`/`ROUTE-010`/`LINK-007`/`LINK-011`/`LINK-012`/`ARCH-004`/`CODE-002`/`CODE-003`/`A11Y-002`/`A11Y-004`/`A11Y-005`/`A11Y-006`/`DB-004`/`SEO-004`, are Low/Info severity and folded into the nearest cleanup task rather than given a dedicated task ID — traced explicitly in the closure matrix, not dropped).
