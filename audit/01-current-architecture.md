# 01 — Current Architecture

Audit date: 2026-08-04
Scope: full technology/repo map, database & data-model audit (folds in master-spec §18), dependency audit (§25), and data-flow/integrations diagram.
Repo: `c:\Users\Amr\tutor-platform` ("Coursaty" tutoring marketplace), branch `main`, HEAD at `51b48a1`.

---

## 1. Technology & Repo Map

### 1.1 Stack inventory

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.1.6 | Every route renders `ƒ` (dynamic) at build time — see ARCH-001 |
| UI runtime | React / React DOM | 19.2.3 | |
| Language | TypeScript | ^5 (strict mode) | `npx tsc --noEmit` clean |
| Styling | Tailwind CSS | ^4 (`@tailwindcss/postcss`) | No component library (no shadcn/ui, no MUI) — hand-rolled components under `components/ui/` and `app/components/` |
| Validation | Zod | ^4.3.6 | Zod 4 is a rewrite vs Zod 3; confirm no stale v3-style error handling remains |
| ORM | Prisma | 6.19.2 | Client output redirected to `app/generated/prisma` (non-default location — see DB-002) |
| Database | Supabase-hosted PostgreSQL 17.6 | — | Pooled (`DATABASE_URL`, pgbouncer) + direct (`DIRECT_URL`) connection strings |
| Auth (web) | NextAuth v5 (Auth.js) | `5.0.0-beta.30` | **Beta** — see ARCH-002 |
| Auth (mobile) | Custom Bearer JWT via `jose`, `HS256`, signed with `AUTH_SECRET` | — | See §4.2 and ARCH-003 |
| Rate limiting | Upstash Ratelimit + Upstash Redis (REST) | 2.0.8 / 1.36.3 | 9 distinct limiters in `lib/ratelimit.ts` (auth, booking, review, message, signup, forgot/reset password, resend-verify, promo, general) |
| Payments | Paymob (Egyptian payment gateway) | custom client in `lib/paymob.ts` | Webhook at `app/api/webhooks/paymob/route.ts`, HMAC-verified, idempotency-guarded via `WebhookEvent` model |
| Email | Resend | 6.9.3 | `lib/email.ts` — verification, login alerts, welcome, receipts |
| Password hashing | bcryptjs (pure JS) | 3.0.3 | 12 rounds; constant-time dummy-hash comparison used to resist user-enumeration timing attacks |
| State management | No global client store (no Redux/Zustand/Jotai) | — | Local `useState`/Server Components + a few React Contexts (`I18nProvider`, `ThemeProvider`, `ToastProvider`) |
| i18n | Hand-rolled dictionary-based `I18nProvider` (`app/components/i18n.tsx`) | — | EN/AR, RTL-aware, `localStorage`-persisted, bootstrap inline script avoids FOUC/wrong-lang flash |
| Analytics | None found | — | No PostHog/GA/Segment/Vercel Analytics wiring detected |
| Search | Direct Prisma queries (`ILIKE`/filter-based) against Postgres, `SearchLog` model records query telemetry | — | No dedicated search engine (Algolia/Meilisearch/Elasticsearch) |
| AI services | None found | — | Higgsfield referenced only for planned image asset generation (`REMAINING_LIMITATIONS.md` §1), not a runtime dependency |
| Deployment target | Implied Vercel (README boilerplate says so; no `vercel.json`) | — | No explicit `vercel.json`; CSP headers in `next.config.ts` allowlist Paymob iframe origins — see ARCH-004 |
| Testing | **None** | — | No `*.test.*`/`*.spec.*` files, no Playwright/Jest/Vitest config found anywhere in the repo (an `output/playwright` directory exists but holds only screenshot artifacts, not a test suite) — see ARCH-005 |
| Linting | ESLint 9 (flat config) via `eslint-config-next` | 9.39.3 | `npm run lint` clean |
| Package manager | npm | — | Single `package-lock.json` present; no `pnpm-lock.yaml`/`yarn.lock`/`bun.lockb` — no manager ambiguity |
| Monorepo? | No | — | Single Next.js app at repo root; `flutter_application_1/` is a separate, self-contained Flutter project (its own `pubspec.yaml`/`pubspec.lock`), not wired into any workspace tooling |
| Bundle analysis | `@next/bundle-analyzer`, opt-in via `ANALYZE=true npm run build` | 16.2.6 | |
| Edge middleware | `proxy.ts` (Next.js 16's replacement for `middleware.ts`) | — | See §3 |

### 1.2 Related repos / apps

- **`flutter_application_1/`** — Flutter mobile app ("Coursaty mobile app for students, tutors, centers, and admins" per its `pubspec.yaml` description). Consumes the `/api/mobile/*` REST contract via `dio`, routes via `go_router`, secures tokens via `flutter_secure_storage`. It also directly initializes a `supabase_flutter` client (`lib/core/supabase_config.dart`) with a public anon key — **but a repo-wide grep found `SupabaseConfig.client` is never actually invoked anywhere else in the Flutter codebase.** Either this is dead scaffolding for a planned direct-to-Supabase feature (e.g. Realtime or Storage), or an already-abandoned approach. Worth a one-line confirmation with whoever owns the mobile app before assuming it's unused.

### 1.3 Repo-root inventory & hygiene notes

- `README.md` is unmodified `create-next-app` boilerplate (mentions "Geist" font, generic getting-started steps) — not reflective of this project at all. Should be replaced with an actual project README (stack, setup, env vars, scripts).
- Root carries a large set of historical AI-handoff/planning docs: `AGENTS.md`, `PRODUCT.md`, `DESIGN.md`, `REMAINING_LIMITATIONS.md` (2026-06-12), `SECURITY_AUDIT.md` (2026-05-27, 44 routes), `CODEX_HANDOFF.md`, `CODEX_UI_OVERHAUL_PROMPT.md` (43KB), `FABLE_UI_PROMPT_V2.md` (40KB), `AGENT_PROGRESS.md`. These are useful project memory but are mixed into repo root rather than a `/docs` directory — consider consolidating.
- `book-landing.html` (67KB, standalone HTML file) sits at repo root, unreferenced by the Next.js app — looks like a legacy/scratch landing page mockup left in place.
- **`.claude/worktrees/friendly-raman-8e4a6e/everything-claude-code/`** — an entire unrelated project's scaffold (its own `.git`, `.env.example`, `.agents/skills/cavecrew`, `.claude/skills/caveman-*`, Playwright console logs) is checked into this repo's working tree under `.claude/worktrees/`. This is almost certainly leftover Claude Code worktree state from an unrelated session, not project code — flagged as a repo-hygiene oddity only; **not touched** per audit instructions. Recommend the project owner review and delete it, and confirm `.claude/worktrees/` is gitignored going forward.
- Several tool-scaffolding directories exist at root with unclear ongoing purpose: `.agents/skills`, `.kombai/resources`, `.impeccable/{design.json,live}`, `.playwright-cli/`. None of these appear to be consumed by the Next.js build; they're local tooling state.
- `output/` at repo root contains ad-hoc screenshots (`booking-checkout-laptop.png`, `class-detail-final.png`, etc.) from prior manual/agent QA passes — not part of the app, not gitignored as far as observed.
- `tsconfig.tsbuildinfo` (270KB) is committed at repo root — this is a build cache artifact that normally belongs in `.gitignore`, not version control.

---

## 2. Rendering Architecture — Zero Static Generation (ARCH-001)

**Finding ID:** ARCH-001
**Title:** Every route (31 pages + 84 API routes... actually 34 pages + 83 API routes measured directly) renders fully dynamic — zero static generation anywhere, including the marketing landing page
**Area:** Rendering / performance architecture
**Severity:** HIGH
**Priority:** P1

**Evidence:**
- `app/layout.tsx` renders `<Navbar />` (line 94) unconditionally on every request, for every route in the app (it's in the root layout, not scoped to any sub-tree).
- `app/Navbar.tsx` is a Server Component that calls `await auth()` from `next-auth` (line 6) on every render, then does a Prisma lookup keyed off the session.
- NextAuth v5's `auth()` reads the session cookie via Next's `cookies()` API under the hood. Any use of a Dynamic API (`cookies()`, `headers()`, `searchParams`, etc.) anywhere in a Server Component render tree forces the **entire route** — and in this case, because it's invoked from the shared root layout wrapping every single page, effectively the **entire app** — to opt out of static rendering / ISR, unless that component is isolated behind its own `<Suspense>` boundary. `Navbar` is rendered directly in `layout.tsx`'s body with no Suspense wrapper (`app/layout.tsx` lines 89–103).
- This explains why `app/page.tsx` (the homepage) sets `export const revalidate = 60;` (line 5) — clearly signaling ISR intent — yet the confirmed `next build` output still shows it as `ƒ` (dynamic, server-rendered on demand). The `revalidate` directive is silently neutralized by the dynamic API usage upstream in the shared layout.
- `lib/auth.ts` additionally calls `headers()` directly (line 34, inside the Credentials `authorize()` callback) — this only executes on POST to the auth route, not on every page render, so it isn't itself the root cause, but it reinforces that cookie/header reads are pervasive in the auth path.
- Only one route (`app/bookings/page.tsx`) sets an explicit `export const dynamic = "force-dynamic"` — meaning the rest of the app doesn't even have to opt in explicitly; it's dynamic by side effect, not by design.

**Current behavior:** Every page, including the public marketing homepage and public class/tutor listing pages, is rendered fresh on every request. No CDN-cacheable static HTML is ever produced. `export const revalidate = 60` on the homepage has no effect.

**Expected behavior:** Public, non-personalized content (landing page, public class listings, public tutor profiles) should be statically generated or ISR-cached, with the personalized navbar rendered as an isolated Client Component (fetching session client-side) or a Server Component wrapped in its own `<Suspense>` boundary so it doesn't poison the parent route's render mode.

**Recommendation:**
1. Convert `Navbar`'s auth-dependent portion into a small Client Component that fetches `/api/auth/session` (or reads a lightweight cookie-derived flag) after mount, OR wrap `<Navbar />` in `<Suspense fallback={...}>` in `layout.tsx` so the dynamic cookie read is scoped to that boundary instead of the whole page.
2. Re-verify with `next build` that `/` and other public pages regain static/ISR status (`○`/`◐` markers) once Navbar is isolated.
3. Audit other shared components in the render tree (`FooterContent`, `MobileBottomNav`, `ThemeProvider`, `I18nProvider`) for any additional `cookies()`/`headers()`/`auth()` calls that could re-introduce the same issue.

**Complexity:** M (touches the root layout and navbar architecture, but is a well-understood, mechanical Next.js pattern — no data-model changes).

---

## 3. Routing, Middleware & Auth Architecture

### 3.1 Edge middleware (`proxy.ts`)

Next.js 16 renamed `middleware.ts` to `proxy.ts` as the edge-entrypoint convention; this repo already uses the new name.

- Runs on a matcher covering protected pages (`/admin`, `/centers`, `/dashboard`, `/create-class`, `/messages`, `/favorites`, `/settings`, `/referral`, `/bookings`), the auth screens (`/login`, `/signup`, `/forgot-password`, `/reset-password`), and all `/api/:path*`.
- For page routes: reads the NextAuth JWT via `getToken()`, redirects unauthenticated users to `/login?callbackUrl=...`, enforces role gates (`/admin` → `ADMIN`; `/centers` → `CENTER_ADMIN`/`ADMIN`), and redirects already-authenticated users away from auth screens.
- For `/api/*`: does **not** duplicate auth (comment confirms "API routes guard themselves with auth() server-side") — it only handles CORS (OPTIONS preflight + allow-listed origins for `localhost:3000/5000/8080`, `127.0.0.1:3000`, `https://coursaty.com`; falls back to `"*"` for unrecognized origins on the `Access-Control-Allow-Origin` echo).
- Note: `next.config.ts` **also** sets `Access-Control-Allow-Origin: *` for `/api/:path*` via the `headers()` config (lines 17–24), independently of `proxy.ts`'s CORS logic. Two separate CORS mechanisms exist for the same route prefix — worth consolidating so there's one source of truth (see ARCH-004 below).

### 3.2 Dual authentication systems

| | Web (browser) | Mobile (Flutter) |
|---|---|---|
| Mechanism | NextAuth v5 session, JWT strategy, httpOnly cookie | Custom Bearer JWT (`jose`, HS256) |
| Issued by | NextAuth's built-in `/api/auth/*` handlers (Credentials + Google OAuth) | `POST /api/auth/mobile-token` (`app/api/auth/mobile-token/route.ts`) |
| Verified by | `auth()` from `lib/auth.ts` / `getToken()` in `proxy.ts` | `requireMobileUser()` in `app/api/mobile/_utils.ts`, via `jwtVerify()` |
| Secret | `AUTH_SECRET` (NextAuth's own JWE encoding) | **Same `AUTH_SECRET`**, but hand-signed as a plain HS256 JWT via `jose`'s `SignJWT` |
| Expiry | 30 days | 30 days |
| Account lockout (5 failed attempts / 15 min) | ✅ Enforced (`lib/auth.ts` lines 88–117) | ❌ **Not enforced** — see ARCH-003 |

**Finding ID:** ARCH-002
**Title:** Production auth stack depends on a 2+ year beta release of NextAuth (Auth.js v5)
**Area:** Authentication / dependency risk
**Severity:** HIGH
**Priority:** P1
**Evidence:** `package.json` — `"next-auth": "^5.0.0-beta.30"`. Auth.js v5 has been in beta since 2023 with no stable GA at the time of this audit; breaking changes have historically landed between beta point releases.
**Current behavior:** The entire web session/auth system (cookie encoding, JWT callbacks, adapter behavior, CSRF handling) rests on pre-release code.
**Expected behavior:** Production auth for a payments-handling marketplace should run on a stable release, or the beta dependency should be a deliberate, documented, monitored risk with a rollback plan.
<br>**Recommendation:** Pin the exact beta version (currently `^5.0.0-beta.30` allows any beta-to-beta patch drift including potential breaking changes); track Auth.js release notes on every bump; add integration coverage for login/logout/session-refresh before any version change lands. If Auth.js GA ships during the project's lifetime, prioritize the upgrade.
**Complexity:** S now (pin/monitor), L later (actual GA migration, unknown scope until release notes exist).

**Finding ID:** ARCH-003
**Title:** Mobile login endpoint bypasses the account-lockout brute-force protection that the web login enforces
**Area:** Authentication / security
**Severity:** MEDIUM
**Priority:** P2
**Evidence:** `app/api/auth/mobile-token/route.ts` — checks `isRateLimited(authLimiter, ...)` (IP-based, 5/15min) and does a plain `compare(password, user.password)`, but never reads or updates `user.failedLoginCount` / `user.lockedUntil`, unlike `lib/auth.ts`'s Credentials `authorize()` (lines 88–117) which locks the account for 15 minutes after 5 failed attempts. It also doesn't record a `LoginAuditLog` entry on failure/success, unlike the web path.
**Current behavior:** An attacker distributing password-guessing attempts across many source IPs (defeating the IP-based rate limiter) can brute-force a specific account's password via the mobile endpoint indefinitely, with no per-account lockout and no audit trail — while the exact same account is protected on the web login path.
**Expected behavior:** Both auth entry points should enforce identical account-level protections since they authenticate the same `User` records against the same password hash.
**Recommendation:** Extract the lockout-check + lockout-increment + `LoginAuditLog` write logic from `lib/auth.ts`'s `authorize()` into a shared helper (e.g. `lib/loginSecurity.ts`) and call it from both `lib/auth.ts` and `app/api/auth/mobile-token/route.ts`.
**Complexity:** S.

**Finding ID:** ARCH-004
**Title:** Two independent, slightly-divergent CORS configurations for `/api/*`
**Area:** Config / security hygiene
**Severity:** LOW
**Priority:** P3
**Evidence:** `next.config.ts` `headers()` sets `Access-Control-Allow-Origin: *` unconditionally for `/api/:path*` (lines 17–24, methods limited to `GET,POST,OPTIONS`). `proxy.ts`'s `corsHeaders()` (lines 22–30) computes an origin-reflected value gated by an allow-list, but **falls back to `"*"` for any origin not on the list** (line 25: `ALLOWED_ORIGINS.has(origin) ? origin : "*"`) and allows a wider method set (`GET,POST,PUT,PATCH,DELETE,OPTIONS`). Because both configs apply, the effective behavior is whichever header Next.js resolves last, and the allow-list in `proxy.ts` provides no real restriction since non-listed origins still get `*`.
**Current behavior:** The origin allow-list in `proxy.ts` (`localhost:3000/5000/8080`, `127.0.0.1:3000`, `coursaty.com`) is effectively decorative — any origin gets `Access-Control-Allow-Origin: *` one way or another.
**Expected behavior:** A single, intentional CORS policy. If the API is meant to be broadly public (many `/api/*` routes are read-only and public per `SECURITY_AUDIT.md`), `*` may be fine for those; but routes returning user-specific data behind Bearer/cookie auth should not have `Access-Control-Allow-Origin: *` if `Access-Control-Allow-Credentials` is ever added later.
**Recommendation:** Consolidate CORS handling into `proxy.ts` only (remove the `headers()` CORS block from `next.config.ts`), and make the allow-list fallback actually reject/omit the header for non-listed origins rather than defaulting to `*`.
**Complexity:** S.

---

## 4. Data Flow & Integrations Diagram

```
                                   ┌─────────────────────┐
                                   │   Browser (Web)      │
                                   └──────────┬───────────┘
                                              │ HTTPS
                                              ▼
                          ┌──────────────────────────────────────┐
                          │  proxy.ts (Next.js 16 edge middleware) │
                          │  - getToken() reads NextAuth JWT cookie │
                          │  - page route auth + role gates         │
                          │  - CORS headers for /api/*               │
                          └───────────────┬──────────────────────┘
                                          │
                        ┌─────────────────┼───────────────────────┐
                        ▼                                         ▼
             ┌─────────────────────┐                  ┌───────────────────────┐
             │  Page (Server Comp.) │                  │  API Route Handler     │
             │  app/**/page.tsx     │                  │  app/api/**/route.ts   │
             │  - auth() (cookie)   │                  │  - auth() or           │
             │  - direct Prisma     │                  │    requireMobileUser() │
             │    reads (no cache   │                  │  - Zod validation      │
             │    layer)            │                  │  - isRateLimited()     │
             └──────────┬───────────┘                  │    (Upstash)           │
                        │                               └───────────┬───────────┘
                        └───────────────┬───────────────────────────┘
                                        ▼
                          ┌─────────────────────────────┐
                          │  Prisma Client                │
                          │  (app/generated/prisma output)│
                          └───────────────┬───────────────┘
                                          │ pgbouncer pooled (DATABASE_URL)
                                          │ / direct (DIRECT_URL) for migrations
                                          ▼
                          ┌─────────────────────────────┐
                          │  Supabase-hosted PostgreSQL 17 │
                          │  (project ref sapgtenfshpkfnbvxjcg, │
                          │   eu-west-1; status INACTIVE  │
                          │   at time of this audit — see │
                          │   DB-004)                       │
                          └─────────────────────────────┘

  Side integrations, triggered from specific API routes / server actions:

  ┌─────────────────────┐   HMAC-verified webhook   ┌───────────────────┐
  │  Paymob (payments)   │ ─────────────────────────▶│ /api/webhooks/paymob│
  │  iframe checkout UI  │   idempotency via          │ → WebhookEvent →     │
  │  (CSP-allowlisted:    │   WebhookEvent.paymobTx…   │   Booking/Payout     │
  │  iframe.paymob.com,   │                            └───────────────────┘
  │  accept.paymobsolutions.com)

  ┌─────────────────────┐
  │  Resend (email)       │◀── lib/email.ts: verification, login alerts,
  └─────────────────────┘     welcome, receipts (fire-and-forget, .catch(()=>{}))

  ┌─────────────────────┐
  │  Upstash Redis (REST) │◀── lib/ratelimit.ts: 9 named limiters
  └─────────────────────┘     (fails OPEN on Redis outage — see DB/ARCH note below)

  ┌──────────────────────────┐   Bearer JWT (HS256, jose, AUTH_SECRET)
  │  Flutter mobile app        │──────────────────────────────▶ app/api/mobile/*
  │  (dio HTTP client)          │                                  routes only
  │  + supabase_flutter client  │   (direct-to-Supabase path defined
  │    initialized but unused    │    but not currently called anywhere
  │    anywhere in the app       │    in the Flutter codebase)
  └──────────────────────────┘
```

**Notable branch points:**
- **Mobile bypasses `proxy.ts` page-auth entirely** — it only ever calls `/api/mobile/*`, which self-authenticates via `requireMobileUser()` reading the `Authorization: Bearer` header (JWT verified with `jose`, same `AUTH_SECRET` as NextAuth — see ARCH-002/ARCH-003 above for the shared-secret and lockout gaps).
- **Rate limiting fails open**: `lib/ratelimit.ts`'s `isRateLimited()` catches any Upstash error and returns `false` (not limited) — i.e., if Redis is unreachable, every rate-limited endpoint (including login and booking) silently loses its protection rather than failing closed. This is a deliberate availability-over-security tradeoff (comment: "allowing request") worth being aware of, not necessarily wrong for this product, but should be a documented decision rather than an implicit one.
- **Paymob** is the only outbound integration with signature verification (HMAC) and replay protection (`WebhookEvent.paymobTransactionId` unique constraint + `processed` flag).
- **Email (Resend) is always fire-and-forget** — every call site is `.catch(() => {})`'d so email failures never block the primary request (login, signup, booking), which is a reasonable pattern but means email delivery failures are currently silent (no dead-letter queue, no retry, no alerting observed).

---

## 5. Database & Data-Model Audit

`prisma/schema.prisma` — 658 lines, 26 models, 8 enums (`Role`, `CenterAccessLevel`, `BookingStatus`, `PaymentStatus`, `PayoutStatus`, `ClassFormat`, `PaymentType`, `Curriculum`).

### 5.1 Migration strategy & drift risk (DB-001)

**Finding ID:** DB-001
**Title:** No `prisma/migrations/` directory exists — schema is managed via `prisma db push` and ad-hoc Supabase MCP `apply_migration` calls, with no migration history in version control
**Area:** Database / drift risk
**Severity:** HIGH
**Priority:** P1
**Evidence:**
- `find prisma/migrations` → does not exist.
- `prisma.config.ts` declares `migrations: { path: "prisma/migrations", seed: ... }` — the tooling expects migrations to exist, but none are committed.
- `REMAINING_LIMITATIONS.md` (§ "RESOLVED in the V2 pass") explicitly documents: *"Migration `add_center_access_level` applied to Supabase via MCP."* — confirming the live database has received at least one schema change that was applied directly against Supabase (via the Supabase MCP `apply_migration` tool) rather than through a versioned Prisma migration checked into the repo.
- Live cross-check attempted during this audit: `mcp__claude_ai_Supabase__list_tables` and `list_migrations` against project `sapgtenfshpkfnbvxjcg` both **timed out** ("Connection terminated due to connection timeout") because the Supabase project's status is currently `INACTIVE` (auto-paused). This itself is a finding — see DB-004.
**Current behavior:** `schema.prisma` is the only source of truth for the intended schema; the actual live database schema's history is untracked in git. Any drift between `schema.prisma` and the live DB (e.g., a manual Supabase dashboard change, or a partially-applied MCP migration) would be invisible until a `prisma db push`/`prisma migrate diff` is run.
**Expected behavior:** Schema changes should be captured as versioned, reviewable migration files (`prisma migrate dev` locally, `prisma migrate deploy` in CI/CD), even when applied to Supabase — Prisma supports "baselining" an existing DB to reconcile this.
**Recommendation:** Run `prisma migrate diff` against the live DB to detect current drift, then either (a) adopt `prisma migrate dev`/`deploy` going forward with a baselined initial migration, or (b) if `db push` is a deliberate choice for this project's iteration speed, document that decision explicitly (e.g. in `AGENTS.md`) so future contributors don't assume migration history exists.
**Complexity:** M.

### 5.2 Relations, constraints, indexing

- **Cascade behavior is inconsistent but largely intentional-looking:** most child records that should die with their parent use `onDelete: Cascade` (`Account`, `Session`, `EmailVerificationToken`, `PasswordResetToken`, `Favorite`, `Message`, `PushToken`, `Waitlist`, `AttendanceRecord`, `Referral`). `LoginAuditLog.user` uses `onDelete: SetNull` (correctly preserves audit trail after user deletion) and `SearchLog.user` does the same. However, **`Class.center`, `Class.owner`, `Booking.class`, `Booking.student`, `Review.class`/`.student`, `Material.class`, `ClassTutor.class`/`.tutor`, `MessageThread.student`/`.tutor`, `Payout.recipient`, `PromoCode.createdBy` all have no explicit `onDelete` behavior**, which defaults to Prisma's `Restrict`-like referential-action-omitted mode (Postgres default `NO ACTION`) — meaning attempting to delete a `Class`, `User`, or `Booking` that has any dependent rows will throw a foreign-key constraint error rather than cascading or nulling. This may be intentional (financial/audit records should never cascade-delete), but it's inconsistent with no visible policy documented, and `LearningCenter` deletion, `Class` deletion, and `User` deletion (of a tutor/student with bookings) will all hard-fail unless the app layer manually cleans up dependents first.
- **Soft-deletion pattern: none.** There is no `deletedAt`/`isDeleted` convention anywhere in the schema. `Class.isActive` and `PromoCode.isActive`/`User.isSuspended` serve as ad-hoc status flags for their specific models, but there's no uniform soft-delete strategy — e.g., a cancelled `Booking` is a status enum value (`CANCELLED`), not a soft delete, which is fine, but a `Review` has no way to be hidden other than `isApproved: false` (which conflates "never approved" with "later hidden").
- **Audit fields:** `createdAt`/`updatedAt` are present on most primary models (`User`, `LearningCenter`, `Class`, `Booking`, `Review`, `MessageThread`, `PushToken`, `Payout`) but **absent on some** — `Material` has `createdAt` only (no `updatedAt`, despite being editable), `ClassTutor` has neither timestamp, `Favorite`/`Waitlist`/`AttendanceRecord`/`Referral`/`SearchLog`/`WebhookEvent`/`AuditLog`/`LoginAuditLog`/`EmailVerificationToken`/`PasswordResetToken` have `createdAt` only (append-only/immutable by design, which is reasonable for audit-log-shaped models but worth confirming is intentional for `Favorite`/`Waitlist` too, which can logically be "updated").
- **Indexing is generally good** on high-traffic query paths: `Class` has 9 explicit indexes (subject, city, format, curriculum, ownerId, centerId, priceEgp, isActive, title, createdAt — 10 actually), `Booking` has 6, `User` has 4. No glaring missing-index red flags were found on FK columns that are also filtered/joined on frequently.
- **Status-field pattern:** consistent use of Prisma enums for state machines (`BookingStatus`, `PaymentStatus`, `PayoutStatus`) rather than free-text strings — good practice. `Class.recurrence` and `Payout.recipientType` are notable exceptions using raw `String?`/`String` instead of an enum (`"tutor" | "center"` documented only in a comment, not enforced at the type/DB level) — minor type-safety gap (DB-003 below).

### 5.3 Dead/unused field (DB-002)

**Finding ID:** DB-002
**Title:** `User.trustScore` is persisted and defaulted but has no reader or writer anywhere in application code
**Area:** Data model hygiene
**Severity:** LOW
**Priority:** P3
**Evidence:** `prisma/schema.prisma` line 176: `trustScore Int @default(50)` under the "Trust & verification" comment block. A repo-wide grep for `trustScore` across `app/` and `lib/` (`.ts`/`.tsx`) returned **zero matches** outside the schema and its generated Prisma client artifacts.
**Current behavior:** Every `User` row carries a `trustScore` column that is always `50` and never read or updated by any route, server action, or UI component.
**Expected behavior:** Either the trust-score feature was planned but never built (in which case the field is speculative/YAGNI cruft), or it's meant to be computed/displayed somewhere and the wiring was dropped.
**Recommendation:** Decide and either (a) implement the trust-score computation + surface it in tutor/center profile UI, or (b) remove the column via a migration to avoid maintaining dead schema surface.
**Complexity:** S (removal) / M (implementation, if pursued).

### 5.4 Minor type-safety gap (DB-003)

**Finding ID:** DB-003
**Title:** `Payout.recipientType` and `Class.recurrence` are free-text `String` fields standing in for what should be enums
**Area:** Data model type safety
**Severity:** LOW
**Priority:** P4
**Evidence:** `Payout.recipientType String // "tutor" | "center"` (schema.prisma line 516) and `Class.recurrence String? // "weekly" | "biweekly" | "once"` (line 280) — both document their valid values only in a comment, with no DB-level `CHECK` constraint or Prisma enum enforcing it.
**Current behavior:** Nothing prevents an application bug or manual DB edit from writing an out-of-range value (e.g. `recipientType: "TUTOR"` vs `"tutor"` casing mismatch would silently break any downstream `.filter()`/`.where()` logic comparing against the lowercase literal).
**Recommendation:** Convert both to Prisma enums (`RecipientType`, `ClassRecurrence`) in a follow-up migration.
**Complexity:** S.

### 5.5 Live Supabase project status (DB-004)

**Finding ID:** DB-004
**Title:** The linked Supabase project is currently `INACTIVE` (paused)
**Area:** Infrastructure / operational readiness
**Severity:** MEDIUM
**Priority:** P2
**Evidence:** `mcp__claude_ai_Supabase__list_projects` returned project `sapgtenfshpkfnbvxjcg` ("Tutor Project", eu-west-1, Postgres 17.6.1) with `"status":"INACTIVE"`. Both `list_tables` and `list_migrations` calls against it timed out with "Connection terminated due to connection timeout." `get_advisors` (security and performance) returned empty `lints: []` for both categories — but given the project is paused, this is likely a reflection of the pause state rather than a genuine clean bill of health, so it should **not** be read as "Supabase found zero issues."
**Current behavior:** If this project is the one backing production (vs. a stale/dev project no longer in use), the app would currently be unable to serve any database-backed request — Supabase free/low tiers auto-pause after a period of inactivity.
**Expected behavior:** A project serving a live product should either be on a plan tier that doesn't auto-pause, or have monitoring that alerts before a pause impacts users.
**Recommendation:** Confirm with the project owner whether `sapgtenfshpkfnbvxjcg` is the active production/dev database referenced by the local `.env` `DATABASE_URL`. If yes, un-pause it and consider upgrading off the auto-pausing tier before any real traffic. If this project is stale (superseded by a different Supabase project not visible to this audit's credentials), update `README`/`AGENTS.md` to point at the correct one to avoid future confusion.
**Complexity:** S (just requires an operational decision, not code).

### 5.6 UI concepts without a clearly backing model

A light grep pass for feature keywords not obviously covered by the 26-model schema found no major gaps — most product surfaces map cleanly to models (bookings→`Booking`, messaging→`MessageThread`/`Message`, favorites→`Favorite`, waitlist→`Waitlist`, promo→`PromoCode`, referrals→`Referral`, attendance→`AttendanceRecord`, push notifications→`PushToken`). Two soft observations:
- **Certificates/credentials for tutors** are mentioned qualitatively in product docs (`PRODUCT.md`/`DESIGN.md` — "verified tutors") but the only backing signal in the schema is the boolean `User.isVerified` — there's no `Credential`/`Document` model for what verification is based on, so "verification" is presumably a manual/admin-set flag rather than a documented, auditable process. Not necessarily wrong for current scale, but worth knowing if "verified tutor" claims ever need to be defensible.
- **Wallet balance** (`User.walletBalanceEgp`) exists and is read/written (5 files reference it, tied to the referral-credit flow), but there's no `WalletTransaction`/ledger model — the balance is a single mutable integer with no audit trail of how it changed over time, unlike `Payout` (which does have a proper record per transfer). If wallet balance is ever debited (e.g. spent on a booking), there'd be no way to reconstruct the history. Currently it only appears to be credited via the referral flow, so this may be a non-issue today, but flag it before wallet spend is implemented.

---

## 6. Dependency Audit

Full detail in `audit/dependencies.csv`. Headline findings (see ARCH-002 above for the NextAuth beta risk, folded into that section since it's primarily an architecture concern):

- **`prisma`/`@prisma/client` 6.19.2** — one patch behind (6.19.3); a major v7 exists but should not be adopted opportunistically given the non-default `app/generated/prisma` output path and driver-adapter changes historically bundled into Prisma majors.
- **`next` 16.1.6** — two minor releases behind (16.3.0 available), notable because ARCH-001's rendering-mode investigation benefits from being on the latest 16.x patch train for any caching/rendering bugfixes.
- **`next-auth` beta** — see ARCH-002.
- Everything else (`resend`, `recharts`, `lucide-react`, `framer-motion`, `@upstash/*`, `@types/*`, `eslint`) is behind by patch/minor versions only — routine maintenance, no urgent action, itemized with specific target versions in the CSV.
- **No dependency in `package.json` is unmaintained/abandoned** — all packages checked have recent releases and active repos.

---

## 7. Summary of Findings

| ID | Title | Severity | Priority |
|---|---|---|---|
| ARCH-001 | Zero static generation sitewide — Navbar's `auth()` call in root layout forces full dynamic rendering | HIGH | P1 |
| ARCH-002 | Production auth stack (NextAuth v5) is a long-running beta release | HIGH | P1 |
| ARCH-003 | Mobile login bypasses account-lockout brute-force protection enforced on web | MEDIUM | P2 |
| ARCH-004 | Duplicate/divergent CORS configuration between `next.config.ts` and `proxy.ts` | LOW | P3 |
| DB-001 | No committed migration history; schema managed via `db push`/Supabase MCP ad hoc | HIGH | P1 |
| DB-002 | `User.trustScore` field is dead — never read or written by app code | LOW | P3 |
| DB-003 | `Payout.recipientType` / `Class.recurrence` are unenforced free-text enums | LOW | P4 |
| DB-004 | Linked Supabase project is currently paused (`INACTIVE`) | MEDIUM | P2 |
| (repo hygiene) | Generic boilerplate `README.md`, stray `.claude/worktrees/` foreign project, committed `tsconfig.tsbuildinfo`, root-level scratch files (`book-landing.html`, `output/*.png`) | LOW | P4 |

Note: ARCH-005 (zero automated test coverage) is recorded here as a stack fact in §1.1 rather than duplicated as a full finding, since the master audit almost certainly has a dedicated testing-audit section elsewhere that will own it in more depth.
