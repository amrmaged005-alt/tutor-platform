# 14 — Open Decisions

These require the product owner's judgment — they are not technical calls this audit can make on your behalf. Each includes the tradeoff and a lean toward one option where the evidence points that way, but the decision itself is yours.

---

### 1. Centers feature: invest or deprioritize?

**The situation:** The center-admin dashboard is fully built and localized. Nothing creates the `LearningCenter` a center-admin account needs to use it (UX-JOURNEY-008), and the public browse routes are also currently mis-gated (UX-JOURNEY-002). Right now it's a visible nav link leading most users to `/unauthorized`, and any new center-admin signup to a permanently empty dashboard.

**Options:**
- **Build it properly**: a center-creation flow (form → API → owned center), fix the route gate. Roadmap Phase 1 estimates this at S (gate) + M (creation flow).
- **Hide it for now**: remove the nav entry and gate signup away from the CENTER_ADMIN role until the flow exists, ship the rest of the roadmap, revisit later.

**Lean:** if centers (tutoring institutes, not individual tutors) are a near-term acquisition channel for the Egyptian market, build it — the cost is moderate and the dashboard work is already sunk. If centers were more exploratory, hide it rather than leave a dead end live.

---

### 2. Parent/guardian accounts: build now or defer?

**The situation:** No parent/guardian role exists anywhere in the schema, onboarding, or signup (UX-JOURNEY-007, confirmed absent, not partially built). Today, a parent must use a Student account to book/pay for their child.

**Options:**
- **Defer** (the audit's lean, given the volume of Critical/P0 items already open — see `audit/12-simplified-product-proposal.md`): the Student-account workaround functions today; building a distinct role, child-management UI, and permission model is an L-complexity net-new feature that competes for the same engineering time as the booking/centers fixes.
- **Build now**: if parent trust/oversight (viewing a child's sessions, controlling payment separately from the child's own login) is a specific, evidenced blocker for adoption in your market, this may outweigh the sequencing argument.

---

### 3. Refund approval: automate or relabel?

**The situation:** Clicking "Approve" on a refund request marks it `REFUNDED` in the database with no Paymob API call — no money actually moves (CONN-008).

**Options:**
- **Automate**: implement a `refundPaymobPayment()` call, contingent on whether your Paymob merchant account actually has refund-API access (needs a support ticket / dashboard check to confirm — this audit could not verify it).
- **Relabel + keep manual**: rename the action ("Mark refund processed") so the UI stops implying automation that doesn't exist, and refunds continue through whatever out-of-band process (Paymob merchant dashboard, bank transfer) is currently used.

**Lean:** relabel immediately regardless of which path you choose long-term — the current label actively misrepresents what the button does, which is a trust risk independent of the automation decision.

---

### 4. Notifications: build the real system or stop implying one exists?

**The situation:** No `Notification` model exists; nothing is ever persisted. The mobile feed synthesizes fake unread items from `AuditLog`/`Booking` on every request (always `read: false`, nothing can be marked read), the Flutter notifications screen doesn't even call it, and collected `PushToken`s are never used by any push provider (CONN-009). Meanwhile, `User` has real notification-preference toggles in Settings.

**Options:**
- **Build it**: net-new `Notification` model + write-on-trigger + real mobile feed + push integration. L complexity, not a quick fix.
- **Defer, and stop implying it exists**: remove or clearly label the Settings preference toggles as "not yet active" until the feature is real.

**Lean:** this is genuinely a product-priority call, not something the evidence points one way on — but whichever you choose, closing the gap between "Settings says this works" and "nothing is ever sent" is worth doing regardless (even if the fix is just honest copy, not a build-out).

---

### 5. Landing-page book metaphor: how much to keep?

**The situation:** A real, well-executed 6-chapter scroll-jacked implementation exists, forcing ~600vh of scroll before ordinary content (UX-001). The mobile fallback is already well-built (reduced-motion respected via native scroll-snap). The desktop/reduced-motion-off experience is the open question.

**Options:**
- **Cap to 2-3 chapters**, keep the cultural/brand identity, cut the length.
- **Drop the scroll-jack below the fold entirely** — a short opening beat, then normal scrolling to content (one of the alternatives the original audit brief itself suggested).
- **Keep as-is** — if the metaphor is a deliberate, working brand differentiator and the performance cost is judged acceptable once PERF-001 (the unrelated static-generation bug) is fixed.

**Lean:** this is a brand/creative decision more than a technical one — the audit's role is to flag that it currently has real costs (forced scroll length, partial reduced-motion honoring, a maintained-separately color-token set), not to tell you how much book metaphor is "enough."

---

### 6. NextAuth v5 beta: stay, pin, or reconsider?

**The situation:** The entire production auth stack runs on a pre-1.0 beta (`5.0.0-beta.30`) that currently has 2 critical CVEs, one of which is a fail-open auth-existence-check bug (SEC-001).

**Options:**
- **Patch and stay**: apply the fix when Auth.js ships one (usually fast for critical CVEs), keep tracking beta releases.
- **Pin the current patched version once available** and stop auto-tracking beta churn until v5 goes stable.
- **Re-evaluate the auth provider** entirely — a larger, harder-to-justify move given nothing else in this audit suggests NextAuth itself is a bad fit, only that its release channel carries beta risk.

**Lean:** patch-and-stay, with a pinned exact version (not a `^` range) rather than an open-ended beta risk. Full re-evaluation isn't supported by the evidence here.

---

### 7. Email verification: re-enable now or continue testing unverified?

**The situation:** Verification is fully built (send/verify/resend all work) but the login-time enforcement gate is commented out (CONN-011). This was a deliberate testing choice, already tracked in project memory as a pre-production TODO.

**Options:**
- **Re-enable now**, contingent on confirming Resend deliverability first (this audit did not verify actual email delivery in production).
- **Keep disabled** until closer to a public launch, but fix the misleading "resend verification" UI in the meantime (UX-JOURNEY-003) so it doesn't imply an active gate.

**Lean:** this is explicitly a "before production" item already, per the code comment and project memory — the only new information this audit adds is that the surrounding UI is currently misleading either way, which is worth fixing regardless of timing.

---

### 8. CSRF strategy: per-route checks everywhere, or document `SameSite` as the primary defense?

**The situation:** `isSameOrigin()` exists but is duplicated and applied to only 3 of ~85 mutation routes (CONN-012). Actual exploitability depends on the session cookie's `SameSite` configuration, which this audit did not verify.

**Options:**
- **Extend per-route checks everywhere** (consistent, explicit, more code).
- **Confirm and document `SameSite=Lax/Strict`** as the primary defense, treating the 3 existing checks as defense-in-depth rather than the only layer — less new code, but requires verifying the NextAuth cookie config first.

**Lean:** verify the `SameSite` setting in `auth.config.ts` before deciding — this is a five-minute check that determines whether this is a P1 gap or a P3 one.

---

### 9. Supabase project auto-pause: acceptable or needs an always-on plan?

**The situation:** The linked Supabase project was found `INACTIVE` (paused) mid-audit, blocking a live schema cross-check (DB-004). This is standard free-tier behavior after a period of inactivity, not necessarily a bug.

**Options:**
- **Acceptable for current dev/staging usage** — no action needed, it resumes on next request.
- **Needs an always-on (paid) plan** if this is meant to represent a production environment that should never be cold.

---

### 10. Migration workflow: commit to real migrations, or continue `db push`/MCP?

**The situation:** No `prisma/migrations/` history exists; schema changes go through `db push` or ad hoc Supabase MCP `apply_migration` calls (DB-001), which is real drift risk with no rollback path.

**Options:**
- **Start a real migration history now** — moderate one-time cost (baseline the current schema as migration zero), ongoing small cost per change, real safety benefit.
- **Continue the current workflow** if the team is small enough that drift risk is being managed informally and the switching cost isn't worth it yet.

**Lean:** worth doing before the team or schema surface grows further, but not urgent relative to the Phase 1 items — this is a Phase 4 item in the roadmap for a reason.
