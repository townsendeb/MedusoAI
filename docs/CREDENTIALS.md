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
| Twilio Account SID      | [Twilio Console](https://console.twilio.com/)                       | `TWILIO_ACCOUNT_SID`            | Yes    | `TWILIO_ACCOUNT_SID`        |
| Twilio Auth Token       | Twilio Console                                                      | `TWILIO_AUTH_TOKEN`             | Yes    | `TWILIO_AUTH_TOKEN`         |
| Twilio phone number     | Twilio → Phone Numbers (E.164)                                      | `TWILIO_PHONE_NUMBER`           | Yes    | `TWILIO_PHONE_NUMBER`       |
| OpenAI API key          | [OpenAI Platform](https://platform.openai.com/api-keys)             | `OPENAI_API_KEY`                | Yes    | `OPENAI_API_KEY`            |
| Retell API key          | [Retell Dashboard](https://dashboard.retellai.com/)                 | `RETELL_API_KEY`                | Yes    | `RETELL_API_KEY`            |
| Retell agent ID         | Retell → Agents                                                     | `RETELL_AGENT_ID`               | Yes    | `RETELL_AGENT_ID`           |
| Sentry DSN              | [Sentry](https://sentry.io/) → Project Settings                     | `NEXT_PUBLIC_SENTRY_DSN`        | Yes    | —                           |
| Stripe secret key       | [Stripe Dashboard](https://dashboard.stripe.com/apikeys)            | `STRIPE_SECRET_KEY`             | Yes    | `STRIPE_SECRET_KEY`         |
| Stripe webhook secret   | Stripe → Webhooks → signing secret                                  | `STRIPE_WEBHOOK_SECRET`         | —      | `STRIPE_WEBHOOK_SECRET`     |
| Stripe Starter price ID | Stripe → Products → Starter price                                   | `STRIPE_PRICE_STARTER`          | Yes    | `STRIPE_PRICE_STARTER`      |
| Stripe Growth price ID  | Stripe → Products → Growth price                                    | `STRIPE_PRICE_GROWTH`           | Yes    | `STRIPE_PRICE_GROWTH`       |


---

## 1. Supabase

- [x] Create project (staging + production recommended)
- [x] Run migrations: `supabase db push` or `supabase db reset` locally
- [ ] Enable **Google** auth provider (Authentication → Providers) when using OAuth
- [ ] Add redirect URLs (Authentication → URL Configuration):
  - `http://localhost:3000/auth/callback`
  - `https://<your-domain>/auth/callback`
- [ ] Enable **Realtime** replication for `alerts` (included in migrations)
- [x] Deploy Edge Functions: `customers`, `import`, `onboarding`, `webhooks-twilio`, `webhooks-retell`, `webhooks-stripe`

```bash
# Edge Function secrets (repeat per deployed project)
supabase secrets set \
  INNGEST_EVENT_KEY=... \
  TWILIO_ACCOUNT_SID=... \
  TWILIO_AUTH_TOKEN=... \
  TWILIO_PHONE_NUMBER=... \
  OPENAI_API_KEY=... \
  RETELL_API_KEY=... \
  RETELL_AGENT_ID=...
```

---

## 2. Google OAuth (optional — email auth works without it)

- [ ] [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → OAuth 2.0 Client ID
- [ ] Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
- [ ] Paste **Client ID** + **Client Secret** into Supabase → Authentication → Google

---

## 3. Vercel (Next.js + Inngest)

- [ ] Import repo, set root to monorepo / `apps/web` per your setup
- [ ] Add all env vars from the table above
- [ ] Install [Inngest Vercel integration](https://www.inngest.com/docs/deploy/vercel) (syncs signing key + registers `/api/inngest`)
- [ ] Set production `NEXT_PUBLIC_SUPABASE_URL` to production Supabase project

---

## 4. Inngest

- [x] Create account / app
- [x] Copy **Event Key** → `INNGEST_EVENT_KEY` (Edge Functions + local `.env.local`)
- [x] Copy **Signing Key** → `INNGEST_SIGNING_KEY` (Vercel / Next.js only)
- [ ] Local dev: run `npm run dev:inngest` alongside `npm run dev`

---

## 5. Twilio (SMS — Sprint 2)

- [ ] Create Twilio account
- [ ] Buy a phone number (SMS-capable)
- [ ] **10DLC registration** for US outbound (start early — can take days)
- [ ] Configure inbound SMS webhook:
  - `https://<project-ref>.supabase.co/functions/v1/webhooks-twilio`
- [ ] Leave vars unset locally to use **stub mode** (no real SMS)

---

## 6. OpenAI (SMS replies + analysis — Sprints 2–3)

- [ ] Create API key with chat/completions access
- [ ] Set `OPENAI_API_KEY` in Vercel + Supabase secrets
- [ ] Leave unset locally to use **stub mode** (canned replies + heuristic analysis)

---

## 7. Retell AI (Voice — Sprint 4)

- [ ] Create Retell account
- [ ] Create a **voice agent** (post-visit feedback script)
- [ ] Copy **Agent ID** → `RETELL_AGENT_ID`
- [ ] Copy **API key** (with webhook badge) → `RETELL_API_KEY`
- [ ] Set agent or account webhook URL:
  - `https://<project-ref>.supabase.co/functions/v1/webhooks-retell`
- [ ] Enable webhook events: `call_started`, `call_ended` (minimum)
- [ ] Link Retell to your Twilio number for outbound calls
- [ ] Allowlist Retell IP if needed: `100.20.5.228`
- [ ] Leave unset locally to use **stub mode** (simulated call IDs)

---

## 8. Local development template

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# Optional — stub mode when omitted
# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
# TWILIO_PHONE_NUMBER=
# OPENAI_API_KEY=
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
| Twilio      | Logs SMS, fake message SID      | Real send/receive                     |
| OpenAI      | Canned SMS + heuristic analysis | Live AI replies + structured analysis |
| Retell      | Fake call ID, no dial           | Real outbound voice calls             |
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
- [ ] Twilio webhook receives inbound SMS (production)
- [ ] Retell webhook receives `call_ended` (production)