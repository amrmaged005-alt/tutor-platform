# 16 — Packets for Tasks Proceeding on a Defaulted Decision

Three tasks (`T1-04`, `T4-01`, `T4-05`) carry a `blockedBy` field in `tasks.json`. A Codex session
logged all three as `skipped-blocked-decision` at 15:02 on 2026-08-06.

**That skip is overridden.** Per `overhaul/15-kickoff-prompts.md` step 8, a `blockedBy` task does not
stall the run — it applies the stated default from `overhaul/13-open-owner-decisions.md`, logs the
assumption, and proceeds. Each default below is **reversible**; none forecloses the product owner's
eventual answer.

Packets follow the Codex format from `overhaul/08`:
`Task ID · Objective · Finding refs · Branch · Allowed files · Restricted files · Required
implementation · Non-goals · Acceptance criteria · Tests · Evidence · Handoff`.

> **Every PR from these three packets must open with the line:**
> `Shipped on the Open Decision #N default (see overhaul/16). Not an owner-confirmed decision.`

---

## T1-04 — Centers: hide the creation path (Type C, paired)

**Open Decision #1 default: HIDE.** Rationale from `overhaul/13`: lower-risk, reversible, and
building can start later without having shipped a dead end in the meantime.

### Claude packet — decision and contract

The finding (`UX-JOURNEY-008`) is that a user can *become* a `CENTER_ADMIN` through self-serve signup,
but no center-creation flow exists — so they land in a role with `centerId = null` and no way out.
That is the dead end. Hiding means **removing the self-serve path into that role**, not removing
centers.

Three things must stay working, and this is the part that's easy to get wrong:

1. **Public `/centers` browse stays.** That's `T1-03`'s fix (`proxy.ts` gate), a *different* task on a
   *different* branch. Do not touch `proxy.ts` here — `overhaul/07` lists it as protected and owned by
   `T1-03` for this wave.
2. **Existing `CENTER_ADMIN` accounts keep full function.** Any user who already has a `centerId`
   keeps their dashboard, their `/centers/[id]/admin` surface, and the "My Center" nav entry
   (`components/NavbarClient.tsx:384` is already correctly conditional on `isCenterAdmin && centerId` —
   leave that logic alone).
3. **`ADMIN` can still assign the role.** `app/admin/AdminClient.tsx:565` offers `CENTER_ADMIN` in the
   platform-admin role selector. That is the intended provisioning path while self-serve is hidden —
   it must keep working, and it is what makes this decision reversible.

**The server-side half is mandatory, not optional.** `app/api/me/role/route.ts:14` accepts
`CENTER_ADMIN` from any authenticated caller. Hiding the dropdown option while leaving that route open
would be a cosmetic fix over a live hole — precisely the dead-parallel-implementation pattern
`AGENTS.md` names as this audit's #1 recurring defect. Client and server change together or the task
is not done.

### Codex packet

- **Branch:** `overhaul/centers-creation-or-hide` (already created, based on Wave 0 `main`).
- **Allowed files:** `app/signup/page.tsx`, `app/onboarding/role/page.tsx`, `app/api/me/role/route.ts`.
- **Restricted:** `proxy.ts` (owned by `T1-03`), `components/NavbarClient.tsx` (its center logic is
  already correct), `app/admin/**` (admin provisioning must keep working), anything under
  `app/centers/**`.

**Required implementation:**

1. `app/signup/page.tsx:138` — remove the `<option value="CENTER_ADMIN">` from the role select.
2. `app/signup/page.tsx:32` — `if (requestedRole === "center") return "CENTER_ADMIN";` maps a
   `?role=center` query param to the role. Make it fall through to the student/tutor default so the
   deep link can't bypass the removed option.
3. `app/onboarding/role/page.tsx:21-24` — remove the `CENTER_ADMIN` role card.
4. `app/api/me/role/route.ts:14` and `:33` — drop `CENTER_ADMIN` from the accepted-role allowlist and
   its TypeScript union so the route rejects it with a 400. **This is the load-bearing change.**
5. Leave a one-line comment at each removal site: `// Centers self-serve hidden per Open Decision #1
   default (overhaul/16, T1-04). Admin-assigned CENTER_ADMIN still supported.` — so the next reader
   knows this is a deliberate, reversible gate, not an oversight.

**Non-goals:** do not build a center-creation flow; do not delete the `CENTER_ADMIN` enum value from
the Prisma schema (that file is protected and this must stay reversible); do not touch the centers
API routes; do not remove the `/centers` nav link.

**Acceptance criteria:**

- A new signup offers only Student and Tutor. `?role=center` does not produce a `CENTER_ADMIN`.
- `POST /api/me/role` with `{"role":"CENTER_ADMIN"}` returns 400 — verify with an actual authenticated
  request, not by reading the code.
- A seeded existing `CENTER_ADMIN` with a `centerId` still reaches `/centers/[id]/admin` and still
  sees "My Center" in nav.
- A platform `ADMIN` can still set a user's role to `CENTER_ADMIN` from `/admin`.
- `npm run build`, `npm run lint`, `npx tsc --noEmit` clean.

**Evidence:** the `POST /api/me/role` 400 response body; screenshots of the signup role select and
`/onboarding/role` (en + ar, 1280 + 390); one screenshot proving an existing center admin is unaffected.

---

## T4-01 — Email verification: honest UI, gate stays off (Type C, paired)

**Open Decision #7 default: CONTINUE DISABLED, fix the misleading UI regardless.** The
re-enable half genuinely cannot proceed — it needs a Resend deliverability confirmation this plan
cannot perform. The UI half needs no such confirmation and ships now.

### Claude packet — decision and contract

`lib/auth.ts:119-126` has the verification gate commented out behind
`// TEMP: email verification disabled — re-enable this block before going to production.`
Project memory confirms this was a deliberate pre-production choice.

The defect (`CONN-011`) is the mismatch: `components/EmailVerificationBanner.tsx` tells the user
**"Email verification required — verify your email to unlock bookings."** That is false. Bookings are
not gated on verification; the login gate is commented out. A user who ignores the banner loses
nothing, and a user who obeys it is complying with a rule that does not exist.

**Scope is the banner copy only. Do not touch `lib/auth.ts`.** Uncommenting that block is the *other*
half of this task and stays blocked on Open Decision #7. The verification endpoints
(`/api/auth/send-verification`, `/api/auth/verify-email`) work and stay wired — verification is
genuinely available, it is simply not *required*. The copy must say that.

### Codex packet

- **Branch:** `overhaul/email-verification-gate` (create from Wave 0 `main`).
- **Allowed files:** `components/EmailVerificationBanner.tsx`, dictionary files (for the new copy).
- **Restricted:** `lib/auth.ts` — **do not uncomment the gate**; `app/api/auth/**`.

**Required implementation:**

Rewrite the banner copy so it describes what is actually true: verification is available and
recommended, not required, and nothing is locked behind it.

- `:54` — `"Email verification required"` → a non-coercive heading (e.g. `"Verify your email"`).
- `:57` — `"— verify your email to unlock bookings."` must go. Nothing is unlocked. Replace with an
  honest benefit (account recovery / securing the account), or drop the clause entirely.
- Retune the visual severity to match: the amber warning treatment (`--rating` / `--warning`,
  `⚠`) signals a blocking problem. This is informational. Soften it, and keep the dismiss/resend
  affordance working.
- Copy goes through `t()` with `DICT` keys in both `en` and `ar` — `AGENTS.md` requires it and this
  component is currently 100% hardcoded English. Reuse existing keys where they exist; new keys for
  genuinely new copy need the terminology owner's sign-off per `overhaul/07`.

**Non-goals:** do not enable the gate; do not remove the banner entirely (verification is still a real
feature worth offering); do not change the resend endpoint's behavior.

**Acceptance criteria:**

- No string in the banner claims verification is required or that any feature is locked behind it.
- Banner renders correctly in `en` and `ar` with correct `dir`.
- "Resend email" still sends and still shows the success state.
- The `lib/auth.ts` diff is **empty**.
- Build / lint / tsc clean.

**Evidence:** before/after screenshots, en + ar, 1280 + 390. `git diff lib/auth.ts` showing no output.

**Reversibility note for the PR:** when Resend deliverability is confirmed, re-enabling is
uncommenting `lib/auth.ts:119-126` and restoring required-wording on this banner. Leave a comment
pointing at this packet so that future task finds the copy it needs to revert.

---

## T4-05 — Notifications: stop implying a system exists (Type E → downgraded to Type C)

**Open Decision #4 default: STOP IMPLYING ONE EXISTS.** Relabel the Settings toggles honestly.

**Execution-type note:** `tasks.json` marks `T4-05` Type E because *building* a notification system
means a `prisma/schema.prisma` change (protected, Type E by default). The defaulted path builds
nothing and touches no schema, so it executes as **Type C** — one review pass, not two. If Open
Decision #4 later resolves toward "build," that work is a **new task** at full Type E, not a
reopening of this one.

### Claude packet — decision and contract

Verified fresh against the code, not inherited from the audit:

- `app/settings/SettingsClient.tsx:15-18` renders four toggles: `notifyBookingConfirmed`,
  `notifyNewMessage`, `notifyReviewReceived`, `pushOnBooking`.
- The first three persist to real Prisma columns via `/api/me/notifications`. **Nothing anywhere in
  `app/` or `lib/` ever reads them.** The only hits outside Settings are the generated Prisma client.
- `pushOnBooking` has **no database column at all**. It is pure client state that resets on reload —
  a toggle that stores nothing and does nothing.

So the user is offered granular control over a system that does not exist. That is `CONN-009`.

**The contract: honesty, not deletion.** Do not rip the section out. The preference columns are real
and a future notification build would use them. What changes is that the UI stops promising delivery
it cannot make.

### Codex packet

- **Branch:** `overhaul/notifications-system` (create from Wave 0 `main`).
- **Allowed files:** `app/settings/SettingsClient.tsx`, dictionary files.
- **Restricted:** `prisma/schema.prisma` (**protected — no schema change in this task, at all**),
  `app/api/me/notifications/**` (the persistence works; leave it), any push-provider integration.

**Required implementation:**

1. **Remove the `pushOnBooking` toggle.** It has no column, no persistence, and no consumer. It is not
   a preference; it is a control that lies on three levels. Removing it is not "removing
   functionality" under `AGENTS.md`'s rule, because there is no functionality — state this explicitly
   in the PR description as the rule requires.
2. **Keep the three persisted toggles**, and add one honest section-level notice above them, through
   `t()` in `en` + `ar`: these preferences are saved to the account and will apply when notification
   delivery ships; no notifications are being sent today.
3. Adjust `settings.notif.desc` if its current wording implies active delivery.
4. Do **not** phrase any of this as "coming soon" with a date. No date is committed.

**Non-goals:** no `Notification` model, no schema migration, no push provider, no in-app feed, no
mobile work. All of that is the "build" branch of Open Decision #4 and is explicitly not happening
here.

**Acceptance criteria:**

- No copy in Settings implies a notification is currently delivered.
- `pushOnBooking` gone from the UI and from `NotifPrefs`.
- The three real toggles still save and still reload correctly from `/api/me/notifications`.
- Notice renders in `en` and `ar` with correct `dir`.
- `git diff prisma/schema.prisma` is **empty**.
- Build / lint / tsc clean.

**Evidence:** before/after Settings → Notifications screenshots, en + ar, 1280 + 390. A save/reload
round-trip showing the three prefs persist. Empty schema diff.

---

## Summary for the owner

| Task | Decision | Default applied | Reversible? | Cost to reverse |
|---|---|---|---|---|
| `T1-04` | #1 Centers | Hide self-serve signup into `CENTER_ADMIN`; admin-assigned still works | Yes | Re-add the option + build the creation flow. Nothing is deleted. |
| `T4-01` | #7 Email verification | Gate stays off; banner copy made honest | Yes | Uncomment `lib/auth.ts:119-126`, restore required-wording. |
| `T4-05` | #4 Notifications | Relabel honestly; build nothing | Yes | Columns and prefs intact; a build starts from a clean base. |

None of the three is flagged for loud escalation — `overhaul/15` reserves that for Open Decisions
**#5 (landing page)** and **#8 (CSRF strategy)**, which are tracked separately in the end-of-run report.
