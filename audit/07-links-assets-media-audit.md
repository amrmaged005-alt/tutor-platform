# 07 — Links, Assets & Media Audit

Coursaty / TutorPlatform. Scope: dead-end interactive elements (`href="#"`, empty hrefs,
buttons with no handler), hardcoded `localhost` URLs, `public/` asset inventory vs. code
references (broken references + unused files), alt-text coverage (especially EN/AR parity),
and favicon/App-icon/Open Graph setup.

**Verification method & limitation (disclosed):** Static analysis (`grep`/`Read`) across
`app/`, `components/`, `public/`, plus a live `npm run dev` + `curl` reachability pass for a
sample of routes and response headers. No browser automation — visual rendering of images,
actual broken-image icons, computed alt text in a screen reader, and OG image preview
rendering (e.g., in a Twitter/Slack unfurl) were **not** observed directly; conclusions below
are drawn from source code and file-existence checks, which is a reliable but not 100%
equivalent substitute for an in-browser pass.

---

## 1. Dead-end interactive elements

### 1a. `href="#"` / empty `href`

Grepped `app/**` for `href="#"`, `href={'#'}`, `href=""`. **Zero matches.** This codebase does
not use the classic dead-anchor-hash pattern.

### 1b. Buttons with no click handler

| Finding | File:line | Element | Evidence |
|---|---|---|---|
| LINK-001 | `app/admin/AdminClient.tsx:364-366` | "Export CSV" header button | No `onClick`; only `onMouseOver`/`onMouseOut` hover styling |
| LINK-002 | `app/admin/AdminClient.tsx:367-369` | "Broadcast" header button | No `onClick`; hover styling only |
| LINK-003 | `app/admin/AdminClient.tsx:613` | "Edit user" icon button (users table) | `aria-label="Edit user"`, no `onClick` |
| LINK-004 | `app/admin/AdminClient.tsx:614` | "Delete user" icon button (users table) | `aria-label="Delete user"`, no `onClick` |
| LINK-005 | `app/admin/AdminClient.tsx:663` | "Delete class" icon button (classes table) | `aria-label="Delete class"`, no `onClick` |
| LINK-006 | `app/classes/[id]/book/BookingCheckout.tsx` (month-nav control, ~line 196 per prior pass) | Calendar month-navigation button | No `onClick` — dead control on a calendar UI whose selected values (`selectedDay`/`selectedTime`) are also never sent to the booking API (see cross-reference below) |

**Not a finding — resolved on inspection:** `app/book/BookClient.tsx`'s sound-toggle
(`#bk-sound-btn`) and prev/next controls (`#bk-prev`/`#bk-next`) were flagged by the prior
audit pass as "id-based markup with no React onClick — not confirmed, flagged for follow-up."
This pass confirms they **are** wired, just imperatively via `document.getElementById(...)` +
`addEventListener("click", ...)` inside a `useEffect` (lines 520, 654-657, cleaned up at
lines 674-676) rather than JSX `onClick` props. This is a non-idiomatic React pattern (direct
DOM manipulation instead of refs/state) but it is **functional**, not dead UI. Downgrading
this from the prior "flagged" status to confirmed-working.

### 1c. `href="\dashboard"` — malformed but functionally accidental

| Finding | File:line | Detail |
|---|---|---|
| LINK-007 | `app/admin/AdminClient.tsx:370` | `<Link href="\dashboard">` uses a **backslash**, not `/dashboard`. Browsers normalize backslashes to forward slashes in URL paths, so this happens to work at the HTTP layer, but it is non-standard, fails strict URL validation, and is a maintainability/copy-paste risk. Low severity because it currently functions, but should be fixed to `href="/dashboard"`. |

---

## 2. Hardcoded `localhost` URLs

Grepped the full repo (`.ts`/`.tsx`/`.js`/`.jsx`) for `localhost`. Two files match, both
legitimate dev-only configuration, **not findings**:

- `next.config.ts:11` — `http://localhost:8400` appended to CSP `script-src`/`connect-src`
  only when `NODE_ENV === "development"` (for the "Impeccable" live-design tool). Correctly
  gated, does not ship to production CSP.
- `proxy.ts:15-18` — `ALLOWED_ORIGINS` set for CORS handling on `/api/*`, includes
  `http://localhost:3000`, `:5000`, `:8080`, `127.0.0.1:3000` alongside the real production
  origin `https://coursaty.com`. This is intentional: the Flutter mobile app
  (`flutter_application_1/`) hits these local API routes during development on various local
  ports. The CORS fallback (`corsHeaders`, line 25) returns `"*"` for any *unrecognized*
  origin anyway, so the localhost entries are redundant rather than dangerous — they don't
  weaken security beyond what the wildcard fallback already does. No action required, noting
  for completeness per the audit brief.

---

## 3. Public asset inventory: referenced vs. on-disk

All 14 files under `public/` cross-checked against every `src="/..."` string and `next/image`
`src=` prop found in `app/` and `components/`. Full detail in `audit/assets.csv`. Summary:

### 3a. Unused files (exist on disk, zero code references — reported only, not deleted)

- `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`,
  `public/window.svg` — these are the **default Next.js scaffold SVGs** created by
  `create-next-app`, never imported or referenced anywhere in `app/`, `components/`, or `lib/`.
- `public/landing/student-portrait.webp` — exists on disk, part of the same brand-photo set as
  the other `public/landing/*.webp` files (all of which **are** referenced from
  `HeroSection.tsx`/`LandingCards.tsx`), but this one specific file has no `src=` reference
  anywhere in the codebase. Possibly a leftover from an earlier hero layout iteration.

### 3b. Broken references (referenced in code, missing on disk)

**None found.** Every `/landing/*.webp` and `/higgsfield/*.webp` path referenced in
`HeroSection.tsx`, `LandingCards.tsx`, `TutorsClient.tsx`, `CentersClient.tsx`,
`BookingConfirmedClient.tsx`, and `components/ui/AuthShell.tsx` resolves to an existing file
under `public/`. This matches REMAINING_LIMITATIONS.md's note that the AI-image-generation
backlog (queued files like `public/landing/cairo-skyline-golden-hour.jpg`,
`public/assets/empty-state-book.webp`, `public/assets/404-books.webp`, per-subject icons) is
correctly *not yet referenced in code* — those are future assets, not current broken links.
Confirmed still accurate; not re-reported as a new discovery.

### 3c. Dynamic/user-generated images (not part of static-asset audit)

Tutor/center/user avatars (`photoUrl`, `logoUrl`) and class banners are DB-driven URLs
(`next/image src={photoUrl}` etc.) or generated via a `classBanner(...)` / `getClassImage(...)`
helper — these are runtime data, not static files under `public/`, and are out of scope for a
static asset inventory. Not flagged.

---

## 4. Alt-text coverage

Grepped every `<Image`/`<img` + surrounding `alt=` across `app/`. Overall coverage is
**good**, with a mix of deliberate decorative-empty (`alt=""`) and descriptive patterns:

- **Bilingual alt text confirmed present** on the landing page's hero imagery —
  `app/components/landing/HeroSection.tsx:98,132,150,209,242` and
  `LandingCards.tsx:49-50` compute `alt={lang === "ar" ? "..." : "..."}` per image, e.g.
  `"مكتب دراسة منظّم"` / `"Organized study desk"`. This directly **contradicts the audit
  brief's stated concern** that bilingual pages might carry English-only alt text — on this
  codebase's primary marketing surface, alt text is correctly localized. Reporting this as a
  positive finding, not a gap.
- Decorative/background images (`/higgsfield/*.webp` hero banners in `CentersClient.tsx`,
  `TutorsClient.tsx`, `BookingConfirmedClient.tsx`) correctly use `alt=""` alongside
  `aria-hidden="true"` on their wrapper — appropriate for pure-decoration imagery.
- Avatar images (tutor/user/center photos across `TutorCard.tsx`, `TutorCardParts.tsx`,
  `CenterProfileClient.tsx`, `MessagesClient.tsx`, `ThreadClient.tsx`, `ClassCard.tsx`,
  `ClassDetailClient.tsx`, `SearchClient.tsx`, `ProfileClient.tsx`,
  `CenterAdminTutors.tsx`) split into two patterns:
  - Where the person's name is rendered as adjacent visible text, `alt={name}` (correct,
    non-redundant) — e.g., `TutorCard.tsx:118`, `TutorProfileClient.tsx:82`.
  - Where the avatar is a small supplementary thumbnail next to other identifying text
    (message threads, class-card tutor pill), `alt=""` — acceptable, avoids redundant
    screen-reader announcements.
- `app/centers/[id]/admin/CenterAdminSettings.tsx:132` — logo preview `<img>` uses
  `alt={t("centerAdmin.settings.logoPreview")}`, i.e. a translated string, **despite**
  REMAINING_LIMITATIONS.md item 3 describing the center-admin module as English-only pre-V2.
  Consistent with routes.json's finding that this item is now stale (commit `e3cf7cc`
  localized the module).

**No missing/broken alt attributes found** on any `<img>`/`<Image>` in this pass.

---

## 5. Favicon / App Icon / Open Graph setup

| Item | Status | Evidence |
|---|---|---|
| Favicon | Present (implicit) | `app/favicon.ico` exists and is picked up automatically by Next.js file-convention metadata — no explicit `<link rel="icon">` needed. |
| Apple touch icon | **Missing** | No `app/icon.png`, `app/apple-icon.png`, or `app/apple-icon.*` of any kind found (`Glob` for both returned zero results). iOS "Add to Home Screen" will fall back to a screenshot instead of a branded icon. |
| `icon.tsx` / dynamic icon generation | **Missing** | Not used; not required if a static icon is added instead. |
| Open Graph image | **Missing** | `app/layout.tsx`'s `metadata.openGraph` block (lines 56-63) sets `type`, `locale`, `siteName`, `title`, `description` — but no `images` array. Social shares (Slack/Twitter/WhatsApp/iMessage unfurls) of any page on the site will render with no preview image. |
| `opengraph-image` file convention | **Missing** | `Glob` for `app/opengraph-image.*` returned zero results. |
| Twitter card | Partially configured | `card: "summary_large_image"` is set (layout.tsx:65), which *requires* an image to render correctly — but no image is provided anywhere in the metadata tree, so the card type is misconfigured relative to its own requirement. |
| `theme-color` | Present | `other: { "theme-color": "#181715" }` (layout.tsx:72) |
| `robots` (site-wide default) | Present, sensible | `{ index: true, follow: true }` at root; correctly overridden to `{ index: false, follow: false }` on `/profile` (`app/profile/page.tsx:9`) |

---

## 6. Metadata title-template bug (found during this pass, not link-specific but discovered via response-header verification)

While curling routes to verify status codes, the `<title>` returned for `/profile` was
observed as **`Your Profile | Coursaty | Coursaty`** — a duplicated suffix. Root cause:
`app/layout.tsx:49-52` defines a title template (`template: "%s | Coursaty"`), and at least 9
page-level `metadata.title` exports **already include `" | Coursaty"` themselves**, so the
template appends it a second time:

`app/classes/page.tsx:9,16`, `app/tutors/page.tsx:9,16`, `app/centers/page.tsx:11`,
`app/centers/[id]/admin/page.tsx:9`, `app/search/page.tsx:6`, `app/referral/page.tsx:8`,
`app/settings/page.tsx:8`, `app/profile/page.tsx:8`, `app/classes/[id]/book/page.tsx:17`.

This affects every browser tab title and search-engine result snippet for these routes
site-wide. `app/book/page.tsx:5` (`"Coursaty - An Interactive Story"`) has the same issue in
milder form (no `|` separator, but still duplicates the brand name).

**LINK-008 (SEO/metadata, new finding this pass).**

---

## 7. Findings Summary Table

| ID | Severity | Priority | Area | Summary | Complexity |
|---|---|---|---|---|---|
| LINK-001 | MEDIUM | P2 | Admin | "Export CSV" button has no handler | S |
| LINK-002 | MEDIUM | P2 | Admin | "Broadcast" button has no handler | S |
| LINK-003 | MEDIUM | P2 | Admin | "Edit user" icon button has no handler | S |
| LINK-004 | MEDIUM | P2 | Admin | "Delete user" icon button has no handler | S |
| LINK-005 | MEDIUM | P2 | Admin | "Delete class" icon button has no handler | S |
| LINK-006 | HIGH | P1 | Booking | Calendar month-nav dead control + selected date/time silently dropped before hitting the booking API (data-loss bug, not just a UI nit — cross-ref REMAINING_LIMITATIONS.md item 2, which incorrectly claims this is resolved) | M |
| LINK-007 | LOW | P3 | Admin | `href="\dashboard"` malformed (works by accident) | XS |
| LINK-008 | MEDIUM | P2 | SEO/metadata | Page titles duplicate " \| Coursaty" suffix on 9+ routes | S |
| LINK-009 | MEDIUM | P2 | SEO/social | No Open Graph / Twitter preview image anywhere on the site despite `summary_large_image` card type | S |
| LINK-010 | LOW | P3 | PWA/mobile | No apple-touch-icon / `app/icon.png` | XS |
| LINK-011 | LOW | P3 | SEO | `/global-states` (internal dev tool) has no `robots: noindex`, is publicly indexable | XS |
| LINK-012 | INFO | P4 | Assets | 6 unused static files in `public/` (5 default Next.js scaffold SVGs + 1 orphaned landing photo) — reported only, not deleted per instructions | XS |

Resolved/downgraded from prior pass: `app/book/BookClient.tsx` sound/prev/next controls
confirmed functional (imperative DOM wiring, not dead).
