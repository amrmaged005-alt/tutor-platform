# 15 — Audit Index

Full audit of TutorPlatform/Coursaty, conducted 2026-08-04 to 2026-08-06. 15 specialist-agent passes, 94 tracked findings. Start with `00-executive-summary.md` if you're reading one document.

## How to use this audit

1. Read `00-executive-summary.md` for the overall picture, scores, and top-10 issues.
2. Read `13-prioritized-overhaul-roadmap.md` for the phased fix plan — it cites every finding ID it resolves, so you can trace any roadmap item back to its evidence.
3. Read `14-open-decisions.md` for the handful of calls that need your judgment, not more analysis.
4. Use `audit-findings.csv` as the master lookup table (94 rows: id, source doc, area, severity, priority, title, complexity) when you want the full list sorted/filtered your own way.
5. Go to the individual numbered documents (`01`–`12`) when you need full evidence — exact file:line citations, code excerpts, and reasoning — for a specific finding.

## Document map

| File | Contents | Key findings prefix |
|---|---|---|
| `00-executive-summary.md` | Scores, top issues, direction recommendation, sprint plan | — |
| `01-current-architecture.md` | Tech stack, data flow, DB/data-model audit, dependency table | `ARCH-*`, `DB-*` |
| `02-route-and-feature-inventory.md` | Every page route + feature classification | `ROUTE-*` |
| `03-user-journey-audit.md` | Six user journeys traced end-to-end through code | `UX-JOURNEY-*` |
| `04-ux-ui-audit.md` | Page-by-page UX + the landing-page book-metaphor deep dive | `UX-*` |
| `05-mobile-responsive-audit.md` | Responsive/mobile-web audit (static analysis) | `MOBILE-*` |
| `06-content-localization-rtl-audit.md` | i18n, RTL, terminology, formatting | `I18N-*`, `RTL-*`, `FORMAT-*`, `TERM-*` |
| `07-links-assets-media-audit.md` | Broken links, dead buttons, media/SEO metadata | `LINK-*` |
| `08-functional-connections-audit.md` | Frontend → API → DB trace for every major feature | `CONN-*` |
| `09-security-accessibility-performance-seo.md` | Security, WCAG, performance, SEO | `SEC-*`, `A11Y-*`, `PERF-*`, `SEO-*` |
| `10-codebase-and-dependency-audit.md` | Test coverage, code quality, dependency risk | `TEST-*`, `DEP-*`, `CODE-*`, `DOC-*` |
| `11-claude-codex-tooling-opportunities.md` | Current Claude Code/Codex capabilities mapped to this project's actual gaps | `TOOL-*` |
| `12-simplified-product-proposal.md` | Proposed simplified nav/homepage/browse/booking/dashboards/accounts | — |
| `13-prioritized-overhaul-roadmap.md` | Six-phase fix plan citing every finding above | — |
| `14-open-decisions.md` | Ten decisions requiring product-owner judgment | — |

## Machine-readable companions

| File | Contents |
|---|---|
| `audit-findings.csv` | All 94 findings: id, source_doc, area, severity, priority, title, complexity |
| `roadmap.csv` | Roadmap items by phase with finding IDs, priority, complexity, dependencies |
| `routes.json` | All 31 page routes with auth requirement, role, status |
| `connection-matrix.csv` | Feature → UI component → API route → DB models → auth/validation status |
| `dependencies.csv` | Package-by-package upgrade risk assessment |
| `broken-links.csv` | Every broken/dead link and control found |
| `assets.csv` | Media/image inventory: referenced vs. missing vs. unused |

## What this audit did not cover live

No browser-automation tool was available in this environment (see `00-executive-summary.md`'s final section and roadmap item P0-A). Every UX/mobile/visual finding is a code-reading inference, explicitly flagged as such in each source document. Recommendation: add a Playwright MCP and capture a live screenshot/interaction baseline before starting Phase 2 of the roadmap.
