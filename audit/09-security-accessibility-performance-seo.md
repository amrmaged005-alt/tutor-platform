# 09 — Security, Accessibility, Performance & SEO Audit

Scope: security posture across web + mobile API surfaces, static-review accessibility (WCAG 2.2 AA lens), performance (build-output + static code review), and SEO/metadata. Findings are grouped into four independent sections per the master spec.

**Methodology note (disclosed gap):** Accessibility and performance analysis in this document were done via **static code review only** — grepping for semantic HTML/ARIA/`alt`/focus patterns, reading design-token CSS and computing contrast ratios directly, and inspecting `next.config.ts`/build output. **No live Lighthouse run and no automated accessibility scanner (axe, Playwright a11y) were executed** — no browser-automation tool was confirmed available in this environment. Findings below are evidence-backed from source, but anything that only manifests at runtime (actual paint timing, real computed contrast after CSS cascade/opacity, screen-reader announcement behavior) is **not verified** and should be spot-checked with Lighthouse/axe before treating this as a final sign-off.

---

## 1. Security

### Starting point: `SECURITY_AUDIT.md` (2026-05-27) — spot-check verdict

That prior pass covered 44 web routes (0 critical, 1 high fixed, 2 low-risk medium notes) and explicitly excluded `/api/mobile/*`. Spot-checked 3 of its claims against current code:

- **CSRF same-origin check** — confirmed present and consistent in `app/api/classes/route.ts:106-110`, `app/api/reviews/route.ts:7-11`, `app/api/admin/verify-user/route.ts:6-10` (identical `new URL(origin).host === host` pattern). Accurate.
- **Webhook HMAC verification precedes any DB write** — confirmed in `app/api/webhooks/paymob/route.ts`: HMAC computed and checked with `timingSafeEqual` at lines 35-45, request rejected at line 84 (`401`) **before** the first `prisma` call at line 109. Not just present-but-bypassable — genuinely gates all writes. Accurate.
- **Admin route role check** — confirmed `app/api/admin/verify-user/route.ts:22-32` checks `session` then `adminUser.role !== "ADMIN"`. Accurate.

The prior audit's conclusions still hold for the routes it covered. This pass adds: mobile route audit, dependency vulnerabilities, secret scan, and two new findings (open redirect, mobile rate-limit gap) it didn't have in scope.

### SEC-001 — Critical/High CVEs in the installed Auth.js (`next-auth`) beta stack
- **Severity:** Critical
- **Priority:** P0
- **Evidence:** `npm audit --json` reports **2 critical** vulnerabilities directly against `next-auth@5.0.0-beta.30` and its `@auth/core` dependency (installed `@auth/core@0.41.0`/`0.41.1`, vulnerable range `<=0.41.2`):
  - "Auth.js: `getToken()` throws an uncaught exception on malformed Bearer authorization headers" — directly relevant because `proxy.ts:2` imports and calls `getToken()` from `next-auth/jwt` on every non-API page request.
  - "Auth.js: Configuration errors can cause existence-based auth checks to fail open (auth object populated with an error)" — relevant to every `await auth()` call gating pages (`app/Navbar.tsx:6`, `app/dashboard/page.tsx`, `app/admin/page.tsx`, 15+ other call sites).
  - "Auth.js: Email normalizer validates the address before Unicode normalization, allowing a homoglyph `@` bypass."
  - "Auth.js: OAuth state, nonce, and PKCE check cookies are not bound to the provider that created them."
  - `npm audit` reports `fixAvailable: true` for both `next-auth` and `@auth/core`, but as a beta-line package a patch may require a semver-major/beta bump — verify in a branch before applying.
- **Current behavior:** Running with known-vulnerable auth middleware in production.
- **User impact:** Auth is the single highest-blast-radius subsystem in a platform serving minors' data. A fail-open existence check or a malformed-header crash in the exact function gating `/admin`, `/dashboard`, `/centers` is a direct path to broken access control.
- **Recommendation:** Track and apply the next-auth v5 patch/RC as soon as available; this reinforces the already-flagged "NextAuth v5 beta in production" risk with concrete CVEs rather than just version-number caution. In the interim, monitor Auth.js security advisories directly (GitHub Security Advisories for `nextauthjs/next-auth`) since this is pre-1.0 and moving fast.
- **Complexity:** M (dependency bump + regression test of all auth flows — login, OAuth linking, lockout, session-version invalidation).

### SEC-002 — High-severity Next.js CVEs, including Middleware/Proxy bypass classes
- **Severity:** High
- **Priority:** P0
- **Evidence:** `npm audit` flags installed `next@16.1.6` as vulnerable (fix available: `16.3.0`, non-major bump) across a large CVE set, the most relevant being:
  - "Next.js has a Middleware / Proxy bypass in App Router applications via segment-prefetch routes" (+ "Incomplete Fix Follow-Up" variant)
  - "Next.js has a Middleware / Proxy bypass through dynamic route parameter injection"
  - "Next.js: Middleware / Proxy bypass in App Router applications using Turbopack and single locale"
  - "Next.js: null origin can bypass Server Actions CSRF checks"
  - "Next.js's Middleware / Proxy redirects can be cache-poisoned"
  - Plus SSRF-in-rewrites, cache poisoning, and DoS variants (full list retained in the raw `npm audit` output, omitted here for brevity).
- **Current behavior:** This app's *entire* page-level access control (`/admin`, `/centers`, `/dashboard`, role gates) is implemented in `proxy.ts` — i.e., exactly the Next.js Middleware/Proxy mechanism these CVEs target.
- **User impact:** A middleware-bypass class vulnerability in the framework your access control is built on is a direct, framework-level access-control risk — independent of how correct `proxy.ts`'s own logic is (and it is correct, per review above).
- **Recommendation:** Upgrade to `next@16.3.0` (audit reports this as a non-major fix). Re-run `npm run build` + `tsc --noEmit` + full auth-flow smoke test after upgrading, since Next 16 is new and minor bumps have occasionally shifted App Router behavior.
- **Complexity:** S–M (dependency bump; verify build/lint/typecheck stay green, which per ground truth they currently are).

### SEC-003 — `sharp` (image optimization) has known libvips CVEs
- **Severity:** High
- **Priority:** P1
- **Evidence:** `npm audit`: `sharp@0.34.5` (installed, via `next`) is vulnerable at `<0.35.0` — "sharp inherited vulnerabilities in libvips: CVE-2026-33327, CVE-2026-33328, CVE-2026-35590, CVE-2026-35591." Fix ships bundled with the `next@16.3.0` upgrade in SEC-002 (audit lists the same fix target).
- **Impact:** `sharp` processes every image through `next/image`'s optimization pipeline, including user-influenced inputs (tutor/center photo URLs, per `remotePatterns: { hostname: "**" }` in `next.config.ts:61` — see also PERF note on that wildcard). A libvips memory-safety CVE in an image-processing library that ingests remote, less-trusted image URLs is a real attack surface.
- **Recommendation:** Resolved by the SEC-002 Next.js upgrade. Also consider narrowing `images.remotePatterns` from `hostname: "**"` (any HTTPS host) to the actual set of hosts used (Supabase storage domain, etc.) — the current wildcard means `next/image` will fetch and process images from *any* HTTPS host an attacker can get a URL field to point at, which combined with any image-processing CVE widens the blast radius unnecessarily.
- **Complexity:** S (bundled with SEC-002) + S (remotePatterns tightening, separate change).

### SEC-004 — Mobile booking endpoint has no rate limiting (unlike its web counterpart)
- **Severity:** Medium
- **Priority:** P1
- **Evidence:** `app/api/mobile/book-class/route.ts` — full file reviewed. Auth via `requireMobileUser()` (line 6) is present and correct, but there is no `isRateLimited`/`*Limiter` call anywhere in the file. Compare to `SECURITY_AUDIT.md`'s own HIGH finding (now fixed) that `POST /api/bookings` (the **web** equivalent) was missing `bookingLimiter` and got it added. The mobile path creates/updates `Booking` rows (lines 58-79) with the same seat-lock and payment-amount implications as the web route, but was never brought in line with that fix.
- **User impact:** A valid mobile Bearer token holder can hit `book-class` in an unbounded loop, seat-locking classes or generating unbounded `Booking`/audit rows — the exact risk the web-side fix was written to close, left open on mobile.
- **Recommendation:** Import `bookingLimiter` (already defined in `lib/ratelimit.ts`) into `app/api/mobile/book-class/route.ts` and apply the same `isRateLimited(bookingLimiter, user.id)` check used on the web route, immediately after the `requireMobileUser` check.
- **Complexity:** S.

### SEC-005 — Rate limiting is not applied across `/api/mobile/*` generally
- **Severity:** Medium
- **Priority:** P2
- **Evidence:** `grep -rn "isRateLimited\|Limiter" app/api/mobile/` returns **zero matches** across all 11 mobile route files (`book-class`, `bookings`, `tutors`, `classes`, `search`, `favorites`, `notifications`, `push-token`, `me`, `tutors/[id]`, `classes/[id]`). By contrast, `generalLimiter` is applied on the web side in `app/api/classes/route.ts:133`.
- **User impact:** Every mobile-facing read and write endpoint — including `search` and `favorites`, which are the kind of endpoints most likely to be hit by scraping/enumeration — has no throttle beyond whatever is enforced upstream (none observed).
- **Recommendation:** Apply `generalLimiter` (or a mobile-specific limiter keyed by `user.id`) as a shared wrapper inside `requireMobileUser()` or via a small helper called at the top of each mobile route, rather than one-off per-route imports, to avoid this gap recurring as new mobile routes are added.
- **Complexity:** M (touches all 11 mobile route files, but mechanically simple).

### SEC-006 — Open redirect via `callbackUrl` on the login page
- **Severity:** Medium
- **Priority:** P1
- **Evidence:** `app/login/page.tsx:66-67`:
  ```ts
  const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");
  window.location.href = callbackUrl?.startsWith("/") ? callbackUrl : "/dashboard";
  ```
  The guard only checks `startsWith("/")`. A **protocol-relative URL** like `//evil-phishing-site.com` also starts with `"/"` and browsers resolve `window.location.href = "//evil-phishing-site.com"` as a full off-site navigation using the current page's protocol. (`proxy.ts`'s own generation of `callbackUrl` at line 60 is safe — it's derived from `req.nextUrl.pathname` of the real request, not attacker-suppliable — the vulnerable path is specifically the client-side read of the URL param on the login page, which an attacker can craft and share directly: `https://coursaty.com/login?callbackUrl=//evil.example.com`.)
- **User impact:** Phishing vector — a victim clicks a legitimate-looking `coursaty.com/login` link, authenticates on the real site (so nothing looks wrong up to that point), and is then silently redirected off-platform, where an attacker-controlled page can continue the con (fake "session expired, re-enter password" page, fake payment page, etc.).
- **Recommendation:** Change the check to reject protocol-relative and any non-same-origin-path value, e.g. `callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")`, or better, validate with `new URL(callbackUrl, window.location.origin).origin === window.location.origin`.
- **Complexity:** S.

### SEC-007 — Email verification is disabled in the live auth code path
- **Severity:** Medium (tracked risk, not a new discovery — precision added per task instructions)
- **Priority:** P2
- **Evidence:** `lib/auth.ts:119-126` — the `isEmailVerified` gate in `Credentials.authorize()` is fully commented out:
  ```ts
  // TEMP: email verification disabled — re-enable this block before going to production.
  // Correct password but email not verified.
  // if (!user.isEmailVerified) { ... throw new LoginError("Please verify your email...") }
  ```
  `POST /api/auth/send-verification` and `GET /api/auth/verify-email` are both stubbed/disabled per `SECURITY_AUDIT.md`. This matches the project's own memory note ("Email verification currently DISABLED for testing").
- **User impact:** Any email/password can sign up and use the platform without proving ownership of the email address. Combined with this being a platform for booking tutoring sessions for (likely, in some cases minor) students, an unverified account can message tutors, book classes, and receive/send platform communications under an unverified identity.
- **Recommendation:** Already tracked in project memory as a pre-production TODO — re-affirming here so it appears in the consolidated security findings list. Uncomment `lib/auth.ts:121-126` and re-enable `/api/auth/send-verification` + `/api/auth/verify-email` before any production/public launch.
- **Complexity:** S (the code already exists, commented out).

### SEC-008 — No hardcoded secrets found
- **Severity:** Informational
- **Priority:** —
- **Evidence:** Regex sweep across `app/`, `lib/`, and config files for API-key/password/token-shaped literals (`sk_live`, `sk_test`, AWS key patterns, `AIzaSy...`, inline `password=`/`secret=`/`api_key=` string literals) returned **zero matches**. `.env` is properly gitignored (`.gitignore` line: `.env*` with `!.env.example` exception); `git ls-files | grep env` shows only `.env.example` is tracked.
- **Recommendation:** None required. Maintain current discipline; consider adding a pre-commit secret scanner (gitleaks/truffleHog) as a hook to keep this true going forward.

### SEC-009 — Mobile route audit (not covered by `SECURITY_AUDIT.md`)
- **Severity:** Informational (positive finding, with the gaps already called out in SEC-004/SEC-005)
- **Priority:** —
- **Evidence:** All 11 `/api/mobile/*` route files call `requireMobileUser(req)` and correctly short-circuit (`if (user instanceof NextResponse) return user;`) before touching data. `app/api/mobile/_utils.ts:29-39` — the Bearer-JWT-authenticated user lookup uses `select: { id, email, fullName, name, role, isSuspended }`, i.e. it does **not** fetch the password hash, which is actually a tighter pattern than the web-side `MEDIUM` note in `SECURITY_AUDIT.md` about `mobile-token/route.ts` fetching the full row. `book-class` (SEC-004) correctly checks `user.role !== "STUDENT"` (line 9) before allowing booking creation, validates class existence/active status (line 38), prevents double-booking (line 47), and checks capacity (line 54) — the logic itself is sound, just missing rate limiting.
- **Recommendation:** None beyond SEC-004/SEC-005.

### SEC-010 — `npm audit` full dependency summary
- **Severity:** Mixed (see breakdown)
- **Priority:** P1 (for prod-affecting) / P3 (for dev-only)
- **Evidence:** `npm audit --json`: **18 total** (2 critical, 12 high, 3 moderate, 1 low) across 555 resolved dependencies (120 prod, 400 dev, 82 optional).
  - **Production-relevant, already covered above:** `next-auth`/`@auth/core` (SEC-001), `next`/`sharp` (SEC-002/SEC-003).
  - **`prisma`/`@prisma/config`** (high) — via transitive `effect` dependency issue ("AsyncLocalStorage context lost/contaminated inside Effect fibers under concurrent load"); Prisma CLI/config-time tooling, not the query engine used at runtime — lower urgency but worth tracking since it's a direct dependency (`prisma@6.19.2`, `@prisma/client@6.19.2`).
  - **`resend`** (moderate, via `svix`/`uuid` — "Missing buffer bounds check in v3/v5/v6 when `buf` is provided") — `resend` is a direct production dependency used for transactional email; the vulnerable path is in `uuid` generation internals, low practical exploitability here but flag for the next `resend` bump.
  - **Dev/build-tooling only (not shipped to production runtime), lower priority:** `@babel/core` (low — sourcemap file-read, build-time only), `brace-expansion` (high, via glob tooling — ReDoS/DoS class, build-time), `js-yaml` (high, DoS via merge keys — build-time), `picomatch` (high, ReDoS — build-time), `postcss` (high — XSS/file-read in CSS stringify, relevant only if untrusted CSS is ever processed at build time, which it isn't here), `flatted` (high — DoS/prototype pollution, transitive dev tool dep), `defu` (high — prototype pollution via `__proto__` key, transitive dev tool dep).
- **Recommendation:** Run `npm audit fix` for the non-breaking fixes first, then handle `next`/`sharp` (SEC-002/003) and `next-auth`/`@auth/core` (SEC-001) as a dedicated, tested upgrade pass given their beta/major-version sensitivity. Dev-only tooling CVEs (Babel, brace-expansion, js-yaml, picomatch, postcss's build-time usage, flatted, defu) do not affect the deployed runtime and can be batched into routine dependency maintenance rather than treated as urgent.
- **Complexity:** S (audit fix pass) + M (the beta/major bumps, tracked separately above).

### CSP `'unsafe-inline'` on `script-src` and `style-src`
- **Severity:** Medium
- **Priority:** P2
- **Evidence:** `next.config.ts:38-39`:
  ```
  script-src 'self' 'unsafe-inline' ...
  style-src 'self' 'unsafe-inline'
  ```
  `'unsafe-inline'` on `script-src` means the CSP's XSS mitigation is largely nominal — any injected `<script>` tag or inline event handler executes regardless of CSP, defeating the primary reason to have a script-src directive at all. (`style-src 'unsafe-inline'` is a much smaller risk — CSS-only injection has a narrower exploit surface — and is a fairly common, accepted tradeoff for CSS-in-JS/inline-style-heavy apps, which this one is, per the extensive inline `style={{}}` usage seen throughout `components/ui/SignInRequiredModal.tsx` and similar files.)
- **Why it's there:** `app/layout.tsx:87` uses `<script dangerouslySetInnerHTML={{ __html: PREFS_BOOTSTRAP }} />` for the pre-hydration theme/lang bootstrap script, which requires either `'unsafe-inline'` or a nonce to execute under CSP.
- **Recommendation:** A nonce-based approach is feasible on Next 16 App Router — Next has built-in CSP nonce support via middleware injecting a `nonce` into `x-nextjs-... ` headers and reading it in `next/headers` for use on `<script nonce={nonce}>`. Concretely: generate a per-request nonce in `proxy.ts`, forward it via a response header, read it in `app/layout.tsx` via `headers()`, and add it both to the CSP header (`script-src 'self' 'nonce-{value}'`) and the bootstrap `<script>` tag. This removes `'unsafe-inline'` from `script-src` while keeping the pre-hydration bootstrap working. Note this would also make every page's response non-cacheable at a shared/CDN layer unless the nonce is stripped from cache keys correctly — worth doing *after* addressing PERF-001 (below), not before, so the two changes don't fight each other.
- **Complexity:** M.

---

## 2. Accessibility (WCAG 2.2 AA lens, static review)

### A11Y-001 — `<html lang>` is hardcoded to `"en"` server-side; `dir` is never set server-side
- **Severity:** Medium
- **Priority:** P1
- **Evidence:** `app/layout.tsx:84`: `<html lang="en" ... suppressHydrationWarning>`. The only place `lang`/`dir` are ever changed is the inline bootstrap script (`PREFS_BOOTSTRAP`, lines 32-45), which runs **client-side** and reads `localStorage.getItem("coursaty-lang")` — it never runs during SSR, so the server-rendered HTML for an Arabic-preferring user is still `lang="en"` with no `dir` attribute at all until client JS executes.
- **User impact:** Screen readers select pronunciation/language rules from the `lang` attribute; on first paint (and for any user/bot that doesn't execute JS, or during the brief pre-hydration window) Arabic content is announced with English phonetic rules, and RTL layout direction is entirely absent until the bootstrap script runs — for RTL, that's not just cosmetic, it affects reading/tab order perception. This also undermines SEO for Arabic content (see SEO-006).
- **Recommendation:** Persist the language preference in a cookie (not just `localStorage`) so it can be read server-side in `app/layout.tsx` (e.g., via `cookies()` in a Server Component) and used to set `lang`/`dir` correctly on the very first server-rendered response, keeping the client bootstrap script only as a fallback/sync mechanism for users without the cookie yet.
- **Complexity:** M (touches the language-persistence mechanism in `i18n.tsx` plus `layout.tsx`).

### A11Y-002 — Non-text (border/divider) contrast falls short of WCAG 1.4.11
- **Severity:** Low
- **Priority:** P3
- **Evidence:** Contrast ratios computed directly from `app/globals.css` custom properties (WCAG relative-luminance formula):

  | Pair | Ratio | WCAG target | Result |
  |---|---|---|---|
  | `--text` on `--bg` (light) | 15.58:1 | 4.5:1 (text) | Pass (AAA) |
  | `--accent-fg` on `--accent` (light button) | 7.93:1 | 4.5:1 | Pass (AAA) |
  | `--accent` on `--bg` (light, links) | 7.21:1 | 4.5:1 | Pass (AAA) |
  | `--text` on `--bg` (dark) | 15.86:1 | 4.5:1 | Pass (AAA) |
  | `--accent-fg` on `--accent` (dark button) | 6.71:1 | 4.5:1 | Pass |
  | `--accent` on `--bg` (dark, links) | 6.71:1 | 4.5:1 | Pass |
  | `--border` on `--bg` (light) | **1.29:1** | 3:1 (non-text UI) | **Fail** |
  | `--border` on `--bg` (dark) | **1.54:1** | 3:1 (non-text UI) | **Fail** |
- **User impact:** Text and interactive-element (button/link) contrast is excellent across both themes — no issue there. But input-field and card *borders* (`var(--border)`) fall well short of the 3:1 minimum WCAG 1.4.11 requires for UI component boundaries, meaning low-vision users may struggle to perceive where an input field, card, or divider begins/ends by border alone. Note: focus indicators use `var(--accent)` (`app/globals.css:253`, `outline: 2px solid var(--accent)`), which passes comfortably (7.21:1/6.71:1) — this only affects resting-state boundaries, not focus visibility.
- **Recommendation:** Darken `--border`/`--border-light` (light theme) and lighten the dark-theme equivalents until they clear ~3:1 against `--bg`, or rely on more shadow/elevation rather than border color alone for boundary perception on flat surfaces.
- **Complexity:** S (token value change) — verify visually across both themes after adjusting, since this is a widely-used token.

### A11Y-003 — Focus trapping and keyboard handling: solid coverage, no keyboard-trap risk found
- **Severity:** Informational (positive finding)
- **Priority:** —
- **Evidence:** A dedicated `useFocusTrap` hook (`components/ui/useFocusTrap.tsx` — referenced, not independently re-audited line-by-line) is applied consistently across all 6 custom modal/dropdown/bottom-sheet components found in the codebase: `ClassFilterBottomSheet.tsx`, `DashboardMaterials.tsx`, `DashboardPrimitives.tsx`, `TutorsClient.tsx`, `NavbarClient.tsx`, `SignInRequiredModal.tsx`. `SignInRequiredModal.tsx` (read in full) demonstrates the pattern correctly: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing at the actual heading id, Escape-key close handler, `document.body.style.overflow = "hidden"` while open, and cleanup on unmount. `SkipLink` (`components/SkipLink.tsx`) is present in the root layout and correctly targets `#main-content` (which `app/layout.tsx:95` sets as `tabIndex={-1}` on the `<main>` landmark — correct pattern for programmatic focus targets).
- **Recommendation:** None required for the sampled components. Worth a final live keyboard-only pass (Tab/Shift+Tab/Escape through each modal) before ship, since static review confirms the *pattern* is applied but can't confirm runtime behavior.

### A11Y-004 — Mixed `next/image` / raw `<img>` usage
- **Severity:** Low
- **Priority:** P3
- **Evidence:** 8 files use raw `<img>` tags (9 occurrences): `app/centers/[id]/admin/CenterAdminSettings.tsx`, `CenterAdminTutors.tsx`, `app/classes/components/ClassCard.tsx`, `app/classes/[id]/ClassDetailClient.tsx`, `app/messages/MessagesClient.tsx`, `app/messages/[threadId]/ThreadClient.tsx`, `app/profile/ProfileClient.tsx`, `app/search/SearchClient.tsx`. Separately, 9 files import `next/image`. `alt=` appears 31 times total across the codebase against 32 combined `<Image`/`<img` tags — close to 1:1, suggesting alt-text discipline is generally followed, but raw `<img>` tags don't get Next's built-in `alt` lint enforcement (`next/image` warns/errors at build time if `alt` is omitted; raw `<img>` does not).
- **User impact:** Raw `<img>` usage means these 8 files rely entirely on manual discipline for `alt` text, explicit `width`/`height` (CLS prevention), and lazy-loading — no compiler/lint backstop the way `next/image` provides.
- **Recommendation:** Migrate the 8 files to `next/image` where the image source is a known dimension (most are user-content avatars/thumbnails, a natural fit). Low priority given rough alt-text parity already observed, but worth doing opportunistically.
- **Complexity:** S per file.

### A11Y-005 — `prefers-reduced-motion` respected in some but not all `framer-motion` usage
- **Severity:** Low
- **Priority:** P3
- **Evidence:** `prefers-reduced-motion` is referenced in 5 places: a global CSS media query in `app/globals.css:948`, and per-component handling in `app/book/BookClient.tsx`, `app/book/BookMobile.tsx`, `app/classes/[id]/book/BookingCheckout.tsx`. The `framer-motion` `useReducedMotion()` hook is used in 14 files (`ClassCard.tsx`, `BookingCheckout.tsx`, `HowItWorksSection.tsx`, `LandingBookScroller.tsx`, `LandingCards.tsx`, `LandingPreviews.tsx`, `DashboardStats.tsx`, `ThreadClient.tsx`, `TutorCard.tsx`, `NavbarClient.tsx`, `AnimatedCheck.tsx`, `AuthShell.tsx`, `BackgroundFloaters.tsx`, `PageTransition.tsx`) against 36 total files importing `framer-motion` — meaningful coverage (~39%) concentrated in the landing page and high-motion components, but roughly 22 files animate without checking the user's reduced-motion preference.
- **User impact:** Users with vestibular disorders who set `prefers-reduced-motion: reduce` get motion suppressed on the landing page and checkout flow (the highest-motion surfaces, correctly covered) but not necessarily in every remaining animated component.
- **Recommendation:** Since a global CSS media-query fallback already exists (`globals.css:948`), verify it actually catches Framer Motion's inline `transform`/`opacity` style injections (CSS media queries can't override JS-driven inline styles the way they can override CSS classes) — this is the kind of thing that needs a live browser check with OS-level reduced-motion enabled, flagged here as a verify-at-runtime item.
- **Complexity:** S–M depending on the CSS-vs-inline-style verification outcome above.

### A11Y-006 — Heading structure: broad but not exhaustively verified
- **Severity:** Informational
- **Priority:** P3
- **Evidence:** 29 of 34 `page.tsx` files contain at least one `<h1>`. The remaining 5 were not individually opened to confirm whether they inherit an `<h1>` from a child client component (likely, given the `*Client.tsx` composition pattern used throughout) or are genuinely missing one.
- **Recommendation:** Spot-check the 5 non-matching pages (quick grep-diff against the full page list would identify them) to confirm each still has exactly one `<h1>` via a child component, and that heading levels descend without skipping (h1→h3 skips are a common WCAG 2.2 SC 1.3.1 finding in card-grid layouts). Not done here — flagged as a fast follow-up, not re-derived to keep this pass scoped.

---

## 3. Performance

### PERF-001 — Zero static generation across the entire app, root-caused to `Navbar`'s `auth()` call in the root layout
- **Severity:** Critical
- **Priority:** P0
- **Evidence:** Build output shows **every route (31 pages, 84 API routes) renders dynamically (ƒ)** — including `app/page.tsx`, the marketing landing page, which has no user-specific data of its own.
  - `app/layout.tsx:94` renders `<Navbar />` inside every page (it's in the root layout, so it wraps all 31 routes).
  - `app/Navbar.tsx` is an `async` **Server Component** (no `"use client"`) that calls `await auth()` unconditionally on line 6, then — if a session exists — runs a `prisma.user.findUnique` query (lines 10-16) to fetch `role`/`centerId` on **every single request**.
  - `await auth()` reads the session cookie internally; in Next.js App Router, reading cookies during render opts the entire route out of static rendering. Because `Navbar` is mounted in the root layout, this dynamic opt-out propagates to **every page in the app**, not just pages that need it.
  - Confirmed this is the *only* systemic cause: grep for `export const dynamic` across `app/` returns exactly one hit (`app/bookings/page.tsx:3`, which legitimately needs it), and grep for direct `cookies()`/`headers()` usage in non-API `app/` files returns zero hits — the dynamic behavior isn't scattered across many pages, it funnels through this one shared component.
- **User impact:**
  - No ISR/SSG anywhere means every request — including anonymous visits to the landing page — pays full SSR cost: a Next.js render pass **plus** an `auth()` cookie/JWT decode **plus**, for logged-in users, a DB round-trip, on every navigation.
  - The landing page is the single highest-traffic, most cacheable page in a marketing-funnel app (no personalization needed for anonymous visitors) and currently gets zero CDN edge-caching benefit — every visitor triggers a full server render.
  - Directly worsens TTFB platform-wide and increases origin/DB load proportional to traffic, where a static/ISR'd landing page would cost near-zero at the edge.
- **Recommendation:** Split `Navbar` into (a) a static shell (logo, nav links, search) that can be part of the statically-rendered tree, and (b) a small, isolated session-dependent slice (sign-in state, role-based menu items) wrapped in `<Suspense>` or fetched client-side after initial paint (e.g., a lightweight `/api/me` call from `NavbarClient`, which is already a Client Component per the existing split with `NavbarClient.tsx`). This lets `app/page.tsx` (and any other page with no other dynamic dependency) become statically generated / ISR'd while the nav's auth-dependent bits stream in separately. This is the single highest-leverage performance fix available in this codebase.
- **Complexity:** M — the `Navbar`/`NavbarClient` split already exists structurally, this is about moving *where* the session fetch happens (server-blocking today → streamed/client-fetched), not building new architecture.

### PERF-002 — Bundle-size visibility is configured but never exercised
- **Severity:** Medium
- **Priority:** P2
- **Evidence:** `next.config.ts:3-7` wires up `@next/bundle-analyzer`, gated behind `process.env.ANALYZE === "true"`. `package.json` `scripts` block has **no `analyze` script** — `dev`, `build`, `start`, `lint`, `postinstall` only. Running the analyzer requires a developer to remember the exact env-var incantation (`ANALYZE=true npx next build`, per the code comment) rather than a discoverable `npm run analyze`.
- **User impact:** Indirect — nobody is watching bundle size as a matter of routine, so regressions (like PERF-003 below) go unnoticed until they're large.
- **Recommendation:** Add `"analyze": "cross-env ANALYZE=true next build"` to `package.json` scripts (Windows-compatible via `cross-env`, since this repo runs on Windows per the environment).
- **Complexity:** S.

### PERF-003 — Full bilingual i18n dictionary (1,114 lines) ships as a Client Component in every page's bundle
- **Severity:** Medium
- **Priority:** P2
- **Evidence:** `app/components/i18n.tsx` is 1,114 lines, starts with `"use client"`, and contains the entire EN+AR translation dictionary inline as a JS object literal (`DICT`, sampled at lines 6+). `I18nProvider` (from this file) wraps every page via `app/layout.tsx:91`. Only **1 file in the whole codebase** uses `next/dynamic` for code-splitting — there is essentially no lazy-loading strategy in use.
- **User impact:** Every page's client JS bundle includes the complete two-language string table regardless of how many strings that specific page actually renders — a fixed tax on every route's initial JS payload.
- **Recommendation:** Two independent improvements, either is worthwhile alone: (1) extract `DICT` into a `.json`/data module so it's at least statically analyzable/tree-shakeable and easier to eventually split per-locale; (2) load only the active locale's strings (e.g., two JSON files, `en.json`/`ar.json`, fetched or dynamically imported based on the resolved language) instead of shipping both languages to every client. This overlaps with the file-size cleanup already flagged in the companion codebase audit (`audit/10-codebase-and-dependency-audit.md`, CODE-001) — same file, complementary fix (that audit recommends extracting for line-count/maintainability; this one for bundle-size/perf — same refactor solves both).
- **Complexity:** M.

### PERF-004 — `next/image` `remotePatterns` wildcard (`hostname: "**"`)
- **Severity:** Low
- **Priority:** P2 (cross-referenced with SEC-003)
- **Evidence:** `next.config.ts:59-63`: `images.remotePatterns: [{ protocol: "https", hostname: "**" }]` — allows `next/image` to fetch and optimize (via `sharp`) an image from *any* HTTPS host.
- **Impact:** Beyond the security angle already covered in SEC-003, an unbounded remote-host allowlist also means Next's image-optimization cache/compute can be pointed at arbitrary large or slow remote hosts by anything that can get a URL into an `<Image src>` prop, with no origin-based cost control.
- **Recommendation:** Narrow to the actual set of image hosts in use (Supabase storage domain and any CDN actually serving user-uploaded photos).
- **Complexity:** S.

### PERF-005 — Static assets are already reasonably optimized
- **Severity:** Informational (positive finding)
- **Priority:** —
- **Evidence:** All images in `public/` are already WebP, largest is 157KB (`public/landing/desk-flatlay.webp`); the full set of 11 hero/marketing images totals well under 1MB combined. No bloated PNG/JPEG assets found.
- **Recommendation:** None required.

### PERF-006 — No extraneous third-party script weight found
- **Severity:** Informational (positive finding)
- **Priority:** —
- **Evidence:** No analytics/tracking scripts (`gtag`, Google Tag Manager, etc.) found in `app/layout.tsx` or elsewhere. The Paymob checkout iframe (allowed via CSP `frame-src`) is scoped to checkout-flow components, not loaded globally from the root layout — it doesn't tax every page's load.
- **Recommendation:** None required now; if analytics are added later, load them via `next/script` with `strategy="lazyOnload"` or `"afterInteractive"` to avoid regressing this.

---

## 4. SEO

### SEO-001 — No sitemap and no robots.txt anywhere in the project
- **Severity:** High
- **Priority:** P1
- **Evidence:** Confirmed via glob and filesystem search: no `app/sitemap.ts`, no `app/robots.ts`, no `public/sitemap.xml`, no `public/robots.txt`. Zero files of any of these forms exist.
- **User impact:** Search engines have no structured way to discover the full set of indexable class/tutor/center detail pages beyond following on-page links, which slows and caps crawl coverage for what is otherwise a content-rich marketplace (many classes, tutors, centers = many potentially long-tail-searchable pages). No `robots.txt` also means no explicit crawl-budget guidance or defense-in-depth disallow rules (see SEO-005).
- **Recommendation:** Add `app/sitemap.ts` (Next 16 App Router native support — returns a `MetadataRoute.Sitemap` array) generating entries for all public class/tutor/center pages from the DB, plus static top-level routes. Add `app/robots.ts` referencing the sitemap and disallowing the authenticated-only path prefixes listed in SEO-005.
- **Complexity:** M (sitemap needs a DB query to enumerate dynamic routes; robots.ts is S alone).

### SEO-002 — `generateMetadata` used on only 3 of 34 pages
- **Severity:** Medium
- **Priority:** P1
- **Evidence:** `generateMetadata` exports found only in `app/classes/[id]/book/page.tsx`, `app/classes/[id]/page.tsx`, `app/tutors/[id]/page.tsx`. Every other route — notably `app/centers/[id]/page.tsx` (center detail), `app/search/page.tsx`, `app/classes/page.tsx` and `app/tutors/page.tsx` (listing pages) — falls back to the generic root-layout title/description template (`"Coursaty — Find Your Perfect Tutor in Cairo"` for every one of them).
- **User impact:** Center detail pages and search-result pages — exactly the pages most likely to rank for long-tail, location/subject-specific queries ("chemistry tutor Maadi", "[Center Name] reviews") — all share one generic title/description in search results instead of content-specific ones. This meaningfully caps organic search performance for the pages doing the most SEO work.
- **Recommendation:** Add `generateMetadata` to `app/centers/[id]/page.tsx` at minimum (same pattern already proven on `classes/[id]` and `tutors/[id]` — center name, city, and description are already fetched for the page itself, so this is populating fields from data already in hand, not a new data-fetch).
- **Complexity:** S per page (pattern already established in the codebase).

### SEO-003 — No structured data (JSON-LD) anywhere
- **Severity:** Medium
- **Priority:** P2
- **Evidence:** `grep -rn "application/ld+json\|schema.org"` across `app/` and `components/` returns zero matches.
- **User impact:** Missed rich-results opportunities that are a natural fit for this domain: `Course` schema on class detail pages (price, provider), `EducationalOrganization`/`LocalBusiness` on center pages, `AggregateRating`/`Review` schema on both (reviews already exist as a data model per `SECURITY_AUDIT.md`'s references to `isApproved`-gated reviews). Rich results (star ratings in search snippets, price display) meaningfully lift click-through rate for marketplace listings.
- **Recommendation:** Add JSON-LD via a `<script type="application/ld+json">` in the relevant `generateMetadata`-covered pages (classes/[id], tutors/[id], and centers/[id] once SEO-002 is fixed), starting with `Course` + `AggregateRating` on class pages since booking/pricing/rating data is already loaded there.
- **Complexity:** M.

### SEO-004 — No canonical URLs
- **Severity:** Low
- **Priority:** P3
- **Evidence:** No `canonical` reference found anywhere in `app/` (metadata objects or `<link rel="canonical">`).
- **User impact:** Filter/search pages (`app/search/page.tsx`, `app/classes/page.tsx` with query-string filters) can be reached via many different query-string combinations that render substantially similar content — without canonical tags, search engines may split ranking signal across near-duplicate URL variants instead of consolidating it onto one canonical form.
- **Recommendation:** Add `alternates: { canonical: ... }` to the `Metadata`/`generateMetadata` objects for filterable listing pages, pointing at the unfiltered base URL (or a normalized filter-parameter order) as canonical.
- **Complexity:** S.

### SEO-005 — Authenticated-only routes are not explicitly excluded from indexing
- **Severity:** Medium
- **Priority:** P2
- **Evidence:** `app/layout.tsx:70`: `robots: { index: true, follow: true }` is set globally at the root layout with no override anywhere for the authenticated-only path prefixes `proxy.ts:5` lists as `PROTECTED` (`/dashboard`, `/messages`, `/favorites`, `/settings`, `/referral`, `/bookings`, `/create-class`) or `ROLE_GATES` (`/admin`, `/centers`). Today's *functional* protection is `proxy.ts`'s redirect-to-`/login` for unauthenticated requests to these paths — which does prevent a crawler from ever seeing the real content — but there is no *explicit* SEO-layer statement (`noindex` meta or `robots.txt Disallow`) backing that up as defense-in-depth. Combined with SEO-001 (no `robots.txt` at all), there's currently zero SEO-layer signal about these paths.
- **User impact:** Low immediate risk (the auth redirect is doing its job), but this is a defense-in-depth gap: if the `proxy.ts` matcher or redirect logic ever regresses (see SEC-002's Next.js Middleware-bypass CVEs — a *framework-level* bypass would sail right past this with no SEO-layer backstop), there's nothing else telling search engines to stay out.
- **Recommendation:** Add explicit `Disallow` rules for the protected prefixes in the new `app/robots.ts` (SEO-001), and/or add `robots: { index: false }` to a shared metadata object for pages under those prefixes.
- **Complexity:** S (bundled with SEO-001).

### SEO-006 — No locale-based routing or `hreflang`; Arabic content is effectively invisible to locale-aware search
- **Severity:** Medium
- **Priority:** P2
- **Evidence:** The app serves English and Arabic from the **same URL** for every route, switching language client-side via `I18nProvider` reading a `localStorage` flag (`app/components/i18n.tsx`). There is no `/ar/...`-prefixed routing, and `grep -rn "hreflang"` across `app/` returns zero matches. This compounds A11Y-001 (server-rendered `lang="en"` always, `dir` never set server-side).
- **User impact:** Search engines index one language per URL. Since every URL always server-renders as `lang="en"` with English metadata (title/description are static English strings in `app/layout.tsx`, not locale-aware), Arabic-speaking users searching in Arabic have no properly-tagged, indexable Arabic version of this product to find — despite roughly half the UI strings already existing in Arabic in the `i18n.tsx` dictionary. This is a substantial missed-reach gap for a platform explicitly serving a Cairo/Egypt market where Arabic search behavior is significant.
- **Recommendation:** This is a bigger structural change than the other SEO items — flagging it here for prioritization discussion rather than prescribing a single fix. Options range from (a) minimal: server-render `lang="ar"`/`dir="rtl"` based on a cookie so at least the *served* language is correct for return visitors (ties to A11Y-001's fix), up to (b) full locale-prefixed routing (`/ar/classes/...`) with `hreflang` alternate tags and locale-aware `generateMetadata`, which is the only way to get genuinely separate, rankable Arabic search results. Recommend (a) as a near-term fix and (b) as a scoped follow-up project, not a quick patch.
- **Complexity:** S (option a) / XL (option b, full locale routing).

### SEO-007 — Baseline metadata coverage exists at the root level
- **Severity:** Informational (positive finding)
- **Priority:** —
- **Evidence:** `app/layout.tsx:48-74` — `metadataBase`, title template (`%s | Coursaty`), OpenGraph (`type`, `locale`, `siteName`, `title`, `description`), Twitter card (`summary_large_image`), and `theme-color` are all configured sensibly at the root. `metadataBase` correctly falls back through `process.env.NEXTAUTH_URL` to a hardcoded production URL rather than being unset (which would break relative OG image URLs).
- **Recommendation:** None required at the root level; the gap is per-page depth (SEO-002), not root-level absence.

---

## Summary Table

| ID | Section | Severity | Priority | One-line |
|---|---|---|---|---|
| SEC-001 | Security | Critical | P0 | Critical CVEs in next-auth beta / @auth/core |
| SEC-002 | Security | High | P0 | Next.js Middleware/Proxy-bypass CVEs; app's access control runs on this exact mechanism |
| SEC-003 | Security | High | P1 | `sharp` libvips CVEs (fixed by Next.js upgrade) |
| SEC-004 | Security | Medium | P1 | Mobile `book-class` endpoint has no rate limit (web equivalent already fixed) |
| SEC-005 | Security | Medium | P2 | No rate limiting across `/api/mobile/*` generally |
| SEC-006 | Security | Medium | P1 | Open redirect via `callbackUrl` (protocol-relative URL bypass) on `/login` |
| SEC-007 | Security | Medium | P2 | Email verification disabled in live auth path |
| SEC-008 | Security | Info | — | No hardcoded secrets found |
| SEC-009 | Security | Info | — | Mobile route audit: consistent auth, no password-hash exposure |
| SEC-010 | Security | Mixed | P1/P3 | 18 total npm audit findings (2 critical/12 high/3 moderate/1 low); prod vs dev-tooling breakdown |
| SEC-CSP | Security | Medium | P2 | CSP `script-src 'unsafe-inline'` defeats most XSS mitigation |
| A11Y-001 | Accessibility | Medium | P1 | `lang="en"` hardcoded server-side, `dir` never set server-side |
| A11Y-002 | Accessibility | Low | P3 | Border/divider contrast below WCAG 1.4.11 (3:1) non-text minimum |
| A11Y-003 | Accessibility | Info | — | Focus trap + keyboard handling well-covered across custom modals |
| A11Y-004 | Accessibility | Low | P3 | 8 files use raw `<img>` instead of `next/image` |
| A11Y-005 | Accessibility | Low | P3 | `prefers-reduced-motion` covered in ~39% of framer-motion usage |
| A11Y-006 | Accessibility | Info | P3 | 5 of 34 pages not confirmed to have an `<h1>` (needs follow-up spot check) |
| PERF-001 | Performance | Critical | P0 | Zero static generation, root-caused to `auth()` call in root-layout `Navbar` |
| PERF-002 | Performance | Medium | P2 | Bundle analyzer configured but no npm script to run it |
| PERF-003 | Performance | Medium | P2 | 1,114-line bilingual dictionary ships as client bundle on every page |
| PERF-004 | Performance | Low | P2 | `next/image` remotePatterns wildcard (cross-ref SEC-003) |
| PERF-005 | Performance | Info | — | Static assets already well-optimized (WebP, <160KB each) |
| PERF-006 | Performance | Info | — | No extraneous third-party script weight |
| SEO-001 | SEO | High | P1 | No sitemap.ts / robots.ts / robots.txt anywhere |
| SEO-002 | SEO | Medium | P1 | `generateMetadata` on only 3/34 pages; center & search pages share generic metadata |
| SEO-003 | SEO | Medium | P2 | No structured data (JSON-LD) anywhere |
| SEO-004 | SEO | Low | P3 | No canonical URLs on filterable listing pages |
| SEO-005 | SEO | Medium | P2 | No explicit noindex/robots exclusion for authenticated-only routes |
| SEO-006 | SEO | Medium | P2 | No locale routing/hreflang; Arabic content invisible to locale-aware search |
| SEO-007 | SEO | Info | — | Root-level metadata (OG/Twitter/theme-color) well-configured |

**Not performed (disclosed):** live Lighthouse run, live automated accessibility scanner (axe/Playwright a11y) — no browser-automation tool confirmed available in this environment. All accessibility and performance findings above are static-code-review-derived and should be validated live before final sign-off.
