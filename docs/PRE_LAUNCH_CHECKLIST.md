# Meduso AI — Pre-Launch Checklist

**Purpose:** Tick every box before putting a real business on Meduso.  
**Audience:** Technical lead, DevOps, or agency deploying the MVP.  
**Related docs:** [CREDENTIALS.md](./CREDENTIALS.md) · [Developer guide](./README.md) · [Client handoff](./CLIENT_HANDOFF.md)

---

**Launch target date:** _______________  
**Production URL:** _______________  
**Supabase project ref:** _______________  
**Completed by:** _______________

---

## How to use this checklist

| Phase | Required for… | Skip if… |
|-------|---------------|----------|
| **1–4** | Any real-user launch | Never skip |
| **5** | Pilot with live SMS | Running stub/demo only |
| **6** | Voice calls | SMS-only pilot |
| **7** | Paid upgrades | Free-plan pilots only |
| **8** | Zapier integrations | Manual/API import only |
| **9** | Public/commercial launch | Private pilot only |

**Minimum viable pilot:** Complete Phases 1–5. Add 6–8 based on pilot needs.

---

## Phase 1 — Database & infrastructure

### Supabase (production)

- [ ] Production Supabase project created
- [ ] Staging Supabase project created (recommended)
- [ ] All migrations applied (`supabase db push` against production)
  - [ ] `20250609120000_initial_schema`
  - [ ] `20250609120001_rls_policies`
  - [ ] `20250609130000_onboarding_rpc`
  - [ ] `20250609140000_storage_imports_bucket`
  - [ ] `20250609150000_analytics_overview_rpc`
  - [ ] `20250609160000_analytics_categories_rpc`
  - [ ] `20250609170000_rate_limits_and_zapier`
  - [ ] `20250609180000_billing_usage`
  - [ ] `20250609190000_billing_review_fixes`
- [ ] Storage bucket `imports` exists and policies allow uploads
- [ ] Realtime enabled for `alerts` table
- [ ] Email auth provider enabled
- [ ] Google OAuth enabled (optional)
- [ ] Redirect URLs configured:
  - [ ] `https://<production-domain>/auth/callback`
  - [ ] `http://localhost:3000/auth/callback` (for local dev)

### Vercel (production)

- [ ] Repo connected; `apps/web` set as app root (or monorepo configured)
- [ ] Production domain assigned (custom domain or `*.vercel.app`)
- [ ] Production build succeeds (`npm run build`)
- [ ] Inngest Vercel integration installed

---

## Phase 2 — Credentials & secrets

Copy every value per [CREDENTIALS.md](./CREDENTIALS.md). Confirm each is set in the right place.

### Required (Vercel + Supabase where noted)

| Secret | Vercel | Supabase Edge | Done |
|--------|--------|---------------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✓ | auto | [ ] |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✓ | — | [ ] |
| `SUPABASE_SERVICE_ROLE_KEY` | ✓ | ✓ | [ ] |
| `INNGEST_EVENT_KEY` | ✓ | ✓ | [ ] |
| `INNGEST_SIGNING_KEY` | ✓ | — | [ ] |
| `TWILIO_ACCOUNT_SID` | ✓ | ✓ | [ ] |
| `TWILIO_AUTH_TOKEN` | ✓ | ✓ | [ ] |
| `TWILIO_PHONE_NUMBER` | ✓ | ✓ | [ ] |
| `OPENAI_API_KEY` | ✓ | ✓ | [ ] |

### Recommended

| Secret | Vercel | Supabase Edge | Done |
|--------|--------|---------------|------|
| `NEXT_PUBLIC_SENTRY_DSN` | ✓ | — | [ ] |
| `RETELL_API_KEY` | ✓ | ✓ | [ ] |
| `RETELL_AGENT_ID` | ✓ | ✓ | [ ] |

### Paid plans only (Phase 7)

| Secret | Vercel | Supabase Edge | Done |
|--------|--------|---------------|------|
| `STRIPE_SECRET_KEY` | ✓ | ✓ | [ ] |
| `STRIPE_WEBHOOK_SECRET` | — | ✓ | [ ] |
| `STRIPE_PRICE_STARTER` | ✓ | ✓ | [ ] |
| `STRIPE_PRICE_GROWTH` | ✓ | ✓ | [ ] |

**Supabase secrets command run:** [ ]  
**Vercel env vars saved and redeployed:** [ ]

---

## Phase 3 — Deploy Edge Functions

Deploy to production Supabase (`supabase functions deploy <name>`):

| Function | Deployed | Notes |
|----------|----------|-------|
| `onboarding` | [ ] | New business signup |
| `customers` | [ ] | Public API + Zapier create customer |
| `import` | [ ] | CSV upload |
| `webhooks-twilio` | [ ] | Inbound SMS |
| `webhooks-retell` | [ ] | Voice call completion |
| `webhooks-stripe` | [ ] | Billing events (if using Stripe) |
| `zapier-alerts` | [ ] | Zapier trigger (optional) |
| `zapier-conversations` | [ ] | Zapier trigger (optional) |
| `zapier-hooks` | [ ] | Zapier subscribe (optional) |
| `outreach-voice` | [ ] | Zapier voice action (optional) |

---

## Phase 4 — External webhooks & partner setup

### Twilio

- [ ] SMS-capable phone number purchased
- [ ] US 10DLC / A2P registration submitted (start early — can take days)
- [ ] Inbound SMS webhook URL set:
  - `https://<project-ref>.supabase.co/functions/v1/webhooks-twilio`
- [ ] Test inbound webhook returns 200 in Twilio debugger

### Inngest

- [ ] Production app created
- [ ] Functions visible in Inngest dashboard after Vercel deploy
- [ ] All 11 functions registered (see Inngest → Functions)

### OpenAI

- [ ] API key active with billing configured
- [ ] Usage limits / alerts set in OpenAI dashboard

### Retell (if using voice — Phase 6)

- [ ] Voice agent created with post-visit script
- [ ] Webhook URL set:
  - `https://<project-ref>.supabase.co/functions/v1/webhooks-retell`
- [ ] Events enabled: `call_ended` (minimum)
- [ ] Twilio number linked for outbound calls

### Stripe (if charging — Phase 7)

- [ ] Starter and Growth products/prices created
- [ ] Webhook endpoint created:
  - `https://<project-ref>.supabase.co/functions/v1/webhooks-stripe`
- [ ] Events subscribed: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`
- [ ] Customer Portal enabled in Stripe settings

### Google OAuth (optional)

- [ ] OAuth client created in Google Cloud Console
- [ ] Redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
- [ ] Client ID + secret added to Supabase Auth → Google

---

## Phase 5 — Production smoke test (SMS pilot)

Run these on **production** with a real phone number you control.

### Auth & onboarding

- [ ] Register new account (email)
- [ ] Complete onboarding (business name, timezone)
- [ ] Land on dashboard without errors
- [ ] Sign out and sign back in

### Customer intake

- [ ] Add customer manually (Customers → Add)
- [ ] Upload small CSV (2–3 rows) and confirm import completes
- [ ] Duplicate phone rejected on second import

### Outreach flow

- [ ] New customer triggers outreach in Inngest dashboard (`schedule-outreach` → `send-initial-sms`)
- [ ] Initial SMS received on test phone (real Twilio, not stub)
- [ ] Reply to SMS; AI response received
- [ ] Conversation appears in Conversations list
- [ ] Reply **STOP**; customer opted out (no further messages)

### Analysis & alerts

- [ ] Send negative test reply (e.g. "Terrible wait, very unhappy")
- [ ] Conversation completes (timeout or natural end)
- [ ] `analyze-conversation` runs in Inngest
- [ ] Alert appears on Alerts page (real-time update)
- [ ] Dashboard KPI cards show non-zero values

### Recovery & analytics

- [ ] Open conversation detail; transcript visible
- [ ] Log a recovery action on conversation detail
- [ ] Analytics page loads category trends

### Billing & limits (Free plan)

- [ ] Settings → Billing shows plan, usage meters
- [ ] Usage banner appears when near limit (optional — test with high usage org)

**Smoke test date:** _______________  
**Test phone used:** _______________  
**Issues found (if any):** _______________

---

## Phase 6 — Voice smoke test (optional)

- [ ] Trigger voice call from customer detail page
- [ ] Call connects (or stub completes in dev)
- [ ] `webhooks-retell` receives `call_ended`
- [ ] Transcript saved on conversation detail
- [ ] Analysis + alert created from voice conversation

---

## Phase 7 — Billing smoke test (optional)

- [ ] Owner/Admin can open Settings → Billing
- [ ] Upgrade to Starter opens Stripe Checkout
- [ ] Test payment succeeds (use Stripe test mode first)
- [ ] `webhooks-stripe` updates plan in dashboard
- [ ] Manage subscription opens Stripe Customer Portal
- [ ] Usage limits reflect new plan tier

---

## Phase 8 — Integrations (optional)

### Public API

- [ ] API key created (Settings → API keys, `customers:write` scope)
- [ ] `POST /customers` succeeds with curl or Postman
- [ ] Idempotency key prevents duplicate customers
- [ ] Rate limit returns 429 after threshold (optional stress test)

### Zapier

- [ ] Zapier app pushed (`integrations/zapier`)
- [ ] Test Zap: Create Customer action
- [ ] Test Zap: New Alert trigger
- [ ] Test Zap: Conversation Completed trigger

---

## Phase 9 — Business & compliance readiness

*Not code — required before scaling beyond a friendly pilot.*

- [ ] Privacy policy published (customer phone numbers, SMS, AI analysis)
- [ ] Terms of service published
- [ ] SMS consent process documented (customers opted in to feedback texts)
- [ ] TCPA / 10DLC compliance reviewed with counsel or Twilio guidance
- [ ] Support contact email configured for pilot businesses
- [ ] Pilot onboarding guide shared ([CLIENT_HANDOFF.md](./CLIENT_HANDOFF.md))
- [ ] Internal runbook: who responds to alerts, escalation path

---

## Phase 10 — Pilot launch sign-off

| # | Pilot business | Onboarded | First SMS sent | First alert reviewed | Notes |
|---|----------------|-----------|----------------|----------------------|-------|
| 1 | | [ ] | [ ] | [ ] | |
| 2 | | [ ] | [ ] | [ ] | |
| 3 | | [ ] | [ ] | [ ] | |

**MVP exit criteria (from architecture plan):** 3 pilot businesses onboarded with working end-to-end flow.

---

## Final sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Technical lead | | | |
| Product / business owner | | | |

### Launch decision

- [ ] **Go** — Phases 1–5 complete; ready for pilot #1
- [ ] **Go with limits** — Pilot on Free plan, SMS only, no Zapier (note exceptions): _______________
- [ ] **No-go** — Blockers to resolve first: _______________

---

## Quick reference — production URLs

Replace `<project-ref>` and `<domain>` with your values.

| Service | URL |
|---------|-----|
| App | `https://<domain>` |
| Twilio webhook | `https://<project-ref>.supabase.co/functions/v1/webhooks-twilio` |
| Retell webhook | `https://<project-ref>.supabase.co/functions/v1/webhooks-retell` |
| Stripe webhook | `https://<project-ref>.supabase.co/functions/v1/webhooks-stripe` |
| Public API | `https://<project-ref>.supabase.co/functions/v1/customers` |
| Inngest dashboard | `https://app.inngest.com` |

---

*Meduso AI · Pre-Launch Checklist v1.0 · June 2026*
