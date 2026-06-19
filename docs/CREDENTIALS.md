# Meduso AI — Credentials & Secrets Checklist

Track every credential needed to run Meduso locally and in production. Copy values into `apps/web/.env.local` for local dev; mirror them in Vercel and Supabase for deployed environments.

**Never commit real secrets.** Use `.env.local` (gitignored) only.

---

## Quick reference


| Credential              | Where to get it                                                     | Local (`apps/web/.env.local`)   | Vercel | Supabase Edge secrets       |
| ----------------------- | ------------------------------------------------------------------- | ------------------------------- | ------ | --------------------------- |
| Marketing site URL      | Your domain registrar / DNS                                         | `NEXT_PUBLIC_MARKETING_URL`     | Yes    | —                           |
| App URL                 | Vercel → Domains (`app.medusoai.com`)                               | `NEXT_PUBLIC_APP_URL`           | Yes    | —                           |
| Supabase URL            | [Supabase](https://supabase.com/dashboard) → Project Settings → API | `NEXT_PUBLIC_SUPABASE_URL`      | Yes    | `SUPABASE_URL` (auto)       |
| Supabase anon key       | Same                                                                | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes    | —                           |
| Supabase service role   | Same (**server only**)                                              | `SUPABASE_SERVICE_ROLE_KEY`     | Yes    | `SUPABASE_SERVICE_ROLE_KEY` |
| Inngest event key       | [Inngest](https://www.inngest.com/) → Manage → Keys                 | `INNGEST_EVENT_KEY`             | Yes    | `INNGEST_EVENT_KEY`         |
| Inngest signing key     | Inngest → Signing key                                               | `INNGEST_SIGNING_KEY`           | Yes    | —                           |
| Telephony provider      | `agentphone` (default) or `legacy` for Twilio/Retell                | `TELEPHONY_PROVIDER`            | Yes    | —                           |
| AgentPhone API key      | [AgentPhone Dashboard](https://agentphone.ai/dashboard)             | `AGENTPHONE_API_KEY`              | Yes    | `AGENTPHONE_API_KEY`        |
| AgentPhone agent ID     | AgentPhone → Agents                                                 | `AGENTPHONE_AGENT_ID`             | Yes    | `AGENTPHONE_AGENT_ID`       |
| AgentPhone number ID    | AgentPhone → Numbers (optional)                                     | `AGENTPHONE_NUMBER_ID`            | Yes    | `AGENTPHONE_NUMBER_ID`      |
| AgentPhone webhook secret | AgentPhone → Webhooks → signing secret                            | `AGENTPHONE_WEBHOOK_SECRET`       | —      | `AGENTPHONE_WEBHOOK_SECRET` |
| OpenAI API key          | [OpenAI Platform](https://platform.openai.com/api-keys)             | `OPENAI_API_KEY`                | Yes    | `OPENAI_API_KEY`            |
| Sentry DSN              | [Sentry](https://sentry.io/) → Project Settings                     | `NEXT_PUBLIC_SENTRY_DSN`        | Yes    | —                           |
| Stripe secret key       | [Stripe Dashboard](https://dashboard.stripe.com/apikeys)            | `STRIPE_SECRET_KEY`             | Yes    | `STRIPE_SECRET_KEY`         |
| Stripe webhook secret   | Stripe → Webhooks → signing secret                                  | `STRIPE_WEBHOOK_SECRET`         | —      | `STRIPE_WEBHOOK_SECRET`     |
| Stripe Starter price ID | Stripe → Products → Starter price                                   | `STRIPE_PRICE_STARTER`          | Yes    | `STRIPE_PRICE_STARTER`      |
| Stripe Growth price ID  | Stripe → Products → Growth price                                    | `STRIPE_PRICE_GROWTH`           | Yes    | `STRIPE_PRICE_GROWTH`       |


---

## 1. Supabase

- [x] Create project (staging + production recommended)
- [x] Run migrations: `supabase db push` or `supabase db reset` locally
- [x] Enable **Google** auth provider (Authentication → Providers) when using OAuth
- [x] Add redirect URLs (Authentication → URL Configuration):
  - `http://localhost:3000/auth/callback`
  - `https://<your-domain>/auth/callback`
- [x] Enable **Realtime** replication for `alerts` (included in migrations)
- [ ] Deploy Edge Functions: `customers`, `import`, `onboarding`, `webhooks-agentphone`, `webhooks-stripe` (+ `webhooks-twilio`, `webhooks-retell` for legacy fallback)

```bash
# Edge Function secrets (repeat per deployed project)
supabase secrets set \
  INNGEST_EVENT_KEY=... \
  AGENTPHONE_API_KEY=... \
  AGENTPHONE_AGENT_ID=... \
  AGENTPHONE_WEBHOOK_SECRET=... \
  OPENAI_API_KEY=...
```

---

## 2. Google OAuth (optional — email auth works without it)

- [x] [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → OAuth 2.0 Client ID
- [x] Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
- [x] Paste **Client ID** + **Client Secret** into Supabase → Authentication → Google

---

## 3. Vercel (Next.js + Inngest)

- [x] Import repo, set root to monorepo / `apps/web` per your setup
- [ ] Add all env vars from the table above
- [x] Install [Inngest Vercel integration](https://www.inngest.com/docs/deploy/vercel) (syncs signing key + registers `/api/inngest`)
- [x] Set production `NEXT_PUBLIC_SUPABASE_URL` to production Supabase project

---

## 4. Inngest

- [x] Create account / app
- [x] Copy **Event Key** → `INNGEST_EVENT_KEY` (Edge Functions + local `.env.local`)
- [x] Copy **Signing Key** → `INNGEST_SIGNING_KEY` (Vercel / Next.js only)
- [ ] Local dev: run `npm run dev:inngest` alongside `npm run dev`

---

## 5. AgentPhone (SMS + voice — primary)

- [ ] Create [AgentPhone](https://agentphone.ai) account
- [ ] Copy **API key** → `AGENTPHONE_API_KEY`
- [ ] Copy **Agent ID** → `AGENTPHONE_AGENT_ID`
- [ ] Optional: **Number ID** → `AGENTPHONE_NUMBER_ID` (if agent has multiple numbers)
- [ ] **10DLC / A2P registration** for US outbound SMS (start early — can take days)
- [ ] Configure webhook URL:
  - `https://<project-ref>.supabase.co/functions/v1/webhooks-agentphone`
- [ ] Save webhook **signing secret** → `AGENTPHONE_WEBHOOK_SECRET` (Supabase Edge secrets)
- [ ] Set `TELEPHONY_PROVIDER=agentphone` on Vercel (default if omitted)
- [ ] Leave vars unset locally to use **stub mode** (no real SMS or calls)

---

## 6. OpenAI (SMS replies + analysis — Sprints 2–3)

- [ ] Create API key with chat/completions access
- [ ] Set `OPENAI_API_KEY` in Vercel + Supabase secrets
- [ ] Leave unset locally to use **stub mode** (canned replies + heuristic analysis)

---

## 7. Secondary telephony (Twilio + Retell — fallback only)

Use when `TELEPHONY_PROVIDER=legacy`.

### Twilio (SMS)

- [ ] `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- [ ] Inbound webhook: `https://<project-ref>.supabase.co/functions/v1/webhooks-twilio`

### Retell (voice)

- [ ] `RETELL_API_KEY`, `RETELL_AGENT_ID`
- [ ] Webhook: `https://<project-ref>.supabase.co/functions/v1/webhooks-retell`
- [ ] Events: `call_ended` (minimum)
- [ ] `TWILIO_PHONE_NUMBER` as Retell `from_number` when placing calls

---

## 8. Local development template

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

TELEPHONY_PROVIDER=agentphone

# Primary — stub mode when omitted
# AGENTPHONE_API_KEY=
# AGENTPHONE_AGENT_ID=
# AGENTPHONE_NUMBER_ID=
# AGENTPHONE_WEBHOOK_SECRET=
# OPENAI_API_KEY=

# Secondary (TELEPHONY_PROVIDER=legacy)
# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
# TWILIO_PHONE_NUMBER=
# RETELL_API_KEY=
# RETELL_AGENT_ID=

# Optional dev shortcuts
# OUTREACH_DELAY_MINUTES=1
# CONVERSATION_TIMEOUT_MINUTES=2
```

---

## 9. Stub mode vs production


| Integration | Without credentials             | With credentials                      |
| ----------- | ------------------------------- | ------------------------------------- |
| AgentPhone  | Logs SMS/calls, fake IDs        | Real send/receive SMS + voice         |
| Twilio      | Logs SMS, fake message SID      | Real send/receive (legacy mode)       |
| OpenAI      | Canned SMS + heuristic analysis | Live AI replies + structured analysis |
| Retell      | Fake call ID, no dial           | Real outbound voice (legacy mode)     |
| Inngest     | Required for background jobs    | Same                                  |


---

## 10. Zapier (Sprint 5.2)

- [ ] Create API key in Meduso with `customers:write` scope
- [ ] Deploy Edge Functions: `zapier-alerts`, `zapier-conversations`, `zapier-hooks`, `outreach-voice`
- [ ] Install Zapier CLI: `npm install -g zapier-platform-cli`
- [ ] From `integrations/zapier`: `npm install && zapier push`
- [ ] Users connect with API key + `https://<ref>.supabase.co/functions/v1`

## 11. Stripe (Sprint 6)

- [ ] Create products/prices for **Starter** and **Growth** in Stripe
- [ ] Copy price IDs → `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_GROWTH`
- [ ] Copy **Secret key** → `STRIPE_SECRET_KEY` (Vercel + Edge secrets)
- [ ] Create webhook endpoint:
  - URL: `https://<project-ref>.supabase.co/functions/v1/webhooks-stripe`
  - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`
- [ ] Copy webhook **Signing secret** → `STRIPE_WEBHOOK_SECRET` (Supabase Edge secrets only)

```bash
supabase secrets set \
  STRIPE_SECRET_KEY=sk_live_... \
  STRIPE_WEBHOOK_SECRET=whsec_... \
  STRIPE_PRICE_STARTER=price_... \
  STRIPE_PRICE_GROWTH=price_...
```

**Without Stripe credentials:** usage limits still enforce on the Free plan; checkout buttons show a configuration message.

---

## Verification checklist

- [ ] `npm run dev` — app loads, login works
- [ ] `npm run dev:inngest` — functions register at `/api/inngest`
- [ ] `supabase functions serve --env-file apps/web/.env.local` — Edge Functions respond
- [ ] Create customer → conversation scheduled (Inngest dashboard)
- [ ] CSV import completes (Storage + import function)
- [ ] AgentPhone webhook receives inbound SMS (production)
- [ ] AgentPhone webhook receives `agent.call_ended` (production voice)