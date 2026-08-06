# T0-01 — baseline capture evidence

**Captured:** 2026-08-06 · **Repo state:** `38a9c3c` · **Runtime:** Next 16.1.6 (Turbopack), dev server on `:3000`
**Browser:** Chromium 1234 via Playwright 1.62.1 · **Data:** dev DB + `prisma/fixtures-acceptance.ts`

28 / 28 screenshots captured. 7 routes x {1280, 390} x {en, ar}, named
`<route-slug>__<breakpoint>__<lang>.png` per [README.md](README.md).

---

## How each shot was produced

`capture-baseline.mjs` drove 24 of the 28. Bare `import { chromium } from "playwright"` was resolved by
junctioning the Playwright MCP server's own copy into `node_modules/` — `node_modules` is a build
artifact, so **no `package.json` change was made** and the T1-07/T1-08 dependency freeze in
[overhaul/07](../07-shared-foundations-and-file-ownership.md) is intact. The first attempt failed on a
browser-revision mismatch (the MCP's 1.63.0-alpha wants chromium 1237; only 1234 is installed); the
1.62.1 copy matches and was used.

The Playwright **MCP tools could not take these shots**: `browser_take_screenshot` with `fullPage: true`
exceeds the server's fixed 5 s tool timeout on the landing page (10,763 px tall). Viewport shots
succeed. Since the README requires full-page for `/`, the script was the only route to compliant
evidence.

### Auth state per shot — read this before comparing

| Routes | Signed in as |
|---|---|
| `index`, `tutors`, `classes`, `classes-id`, `centers`, `dashboard` | `tutor-full@fixtures.coursaty.test` (TUTOR / FULL) |
| `classes-id-book` | `student@fixtures.coursaty.test` (STUDENT) |

`capture-baseline.mjs` signs in as the FULL tutor for every route. That is correct for `dashboard`, but
a tutor **cannot book**, so `/classes/[id]/book` redirected to `/classes/[id]` and the first pass of the
four checkout shots captured the wrong page. The README calls checkout *"the highest-value capture in
the set,"* so those four were re-captured as the student. **They now show the real checkout.**

Class used for `classes-id` / `classes-id-book`: `cmm6onfqx0001v2owpcdi9vav` ("Calculus 1", capacity 50,
600 EGP + 20 EGP platform fee).

---

## Finding evidence recorded during capture

### A11Y-001 — confirmed, and worse than "a flash"

The server always renders:

```html
<html lang="en" class="...">
```

`lang` is hardcoded to `en` and there is **no `dir` attribute at all**, on every route, for every user.
Arabic is applied only after client JS reads `localStorage["coursaty-lang"]` and mutates the DOM. So:

- every Arabic user gets an English-LTR first paint on every navigation;
- the served HTML tells crawlers and screen readers the page is English even when it renders Arabic;
- with JS disabled the site has no Arabic at all.

Post-hydration the switch works correctly — all 14 AR shots verified `document.documentElement.dir === "rtl"`
and `lang === "ar"`. This is baseline evidence for A11Y-001 / T3-09, **not** a bug to fix now.

### Checkout is RTL-but-untranslated (T1-02 before-state)

`classes-id-book__*__ar.png` shows correct RTL layout with **English strings** — "Order summary",
"Class session", "Platform fee", "Total", "Confirm booking", "Protected checkout", "Choose date",
"May 2025", and English weekday names. This is exactly the gap T1-02's 44 `t()` calls close, captured
before the fix lands.

### Redirects

| Route | Observed |
|---|---|
| `/classes/[id]/book` as **TUTOR** | 200 → redirected to `/classes/[id]` (role-gated; not a defect) |
| `/classes/[id]/book` as **STUDENT** | 200, stays on `/book` — captured |
| `/dashboard` anonymous | 307 → `/login?callbackUrl=%2Fdashboard` (signed in for capture) |

### Console errors

1 console error on `/classes` in **ar** at both breakpoints (0 everywhere else, all 4 en/ar × bp
combinations of every other route). Not reproducible on a warm navigation to the same route, and the
capture script recorded only counts, not text. Flagged for whoever owns **T3-01** (ClassCard i18n) to
characterise — not diagnosed here.

---

## Honesty caveat on "pre-overhaul"

The README describes this directory as the **pre-overhaul** baseline. It was captured at `38a9c3c`,
which already contains all of Wave 0 plus merged **T1-03** and **T1-06**. Two consequences:

- **`/centers` is not the broken state the README anticipated.** The README expected to capture a 403
  for most roles as `UX-JOURNEY-002`'s before-state. T1-03's proxy fix has already merged, so these
  shots show the partially-fixed page. The remaining half of T1-03 (`app/centers/page.tsx:19-22`
  redirecting anonymous users) is still open, so the *anonymous* broken state was never captured and
  now cannot be.
- `/classes` reflects T1-06's honest-empty-state change.

Every other route predates any Wave 1 merge and is a true before-state.

---

## Re-capture policy

Unchanged from the README: this directory is not overwritten. Post-merge verification writes to
`overhaul/baseline/post/<task-id>/`.
