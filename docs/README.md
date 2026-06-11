# Meduso AI — Developer Guide

SaaS platform that helps local businesses identify unhappy customers before they leave negative reviews or stop returning.

## Related documentation

| Document | Description |
|----------|-------------|
| [CLIENT_HANDOFF.md](./CLIENT_HANDOFF.md) | Non-technical product overview for clients |
| [EXECUTIVE_SUMMARY.md](./EXECUTIVE_SUMMARY.md) | One-page executive summary |
| [CREDENTIALS.md](./CREDENTIALS.md) | API keys and secrets checklist |
| [MVP_ARCHITECTURE_PLAN.md](./MVP_ARCHITECTURE_PLAN.md) | Original MVP technical blueprint |
| [PRE_LAUNCH_CHECKLIST.md](./PRE_LAUNCH_CHECKLIST.md) | Printable go-live checklist |

## Stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (Postgres, Auth, Storage, Edge Functions)
- **Jobs:** Inngest (coming in Slice 0.7)
- **Monorepo:** npm workspaces + Turborepo

## Project structure

```
├── apps/web/          # Next.js dashboard
├── packages/shared/   # Shared types and utilities
└── supabase/          # Supabase CLI config (migrations in Slice 0.2)
```

## Prerequisites

- Node.js 20+
- npm 10+
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Docker Desktop](https://docs.docker.com/desktop/) (required for local Supabase database)

## Getting started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example apps/web/.env.local

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Auth (Slice 0.4 + 0.5)

Auth pages: `/login`, `/register`, `/forgot-password`. Supports email/password and Google OAuth.

Requires Supabase env vars in `apps/web/.env.local`.

**Google OAuth setup:**

1. Create an OAuth 2.0 Client in [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Add authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
3. Enable Google in Supabase Dashboard → Authentication → Providers
4. Add redirect URLs in Supabase → URL Configuration:
   - `http://localhost:3000/auth/callback`
   - `https://your-production-domain/auth/callback`

### Inngest (Slice 0.7)

Run the Next.js dev server and Inngest dev server in separate terminals:

```bash
npm run dev
npm run dev:inngest
```

The `ping` function listens for `meduso/ping` events. Serve endpoint: `http://localhost:3000/api/inngest`.

### Database migrations

```bash
# Start local Supabase (requires Docker)
supabase start

# Apply all migrations from scratch
supabase db reset
```

Migrations live in `supabase/migrations/`. Slice 0.2 created the full schema with RLS policies.

### Onboarding (Slice 0.6)

New users complete `/onboarding` after register/login. The `onboarding` Edge Function atomically creates org, profile, subscription, and outreach settings.

```bash
# Serve Edge Functions locally (with supabase start)
supabase functions serve onboarding --env-file apps/web/.env.local
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Build all packages |
| `npm run lint` | Lint all packages |
| `npm run typecheck` | Type-check all packages |

## Development slices

This repo is built in small, reviewable slices. See [MVP_ARCHITECTURE_PLAN.md](./MVP_ARCHITECTURE_PLAN.md) for the full roadmap.

- **Slice 0.1** (current): Monorepo scaffold
- **Slice 0.2**: SQL migrations + RLS policies
- **Slice 0.3**: Shared types, enums, Zod DTOs
- **Slice 0.4**: Email auth + Supabase SSR middleware
- **Slice 0.7**: Inngest client + ping function
- **Slice 0.6**: Onboarding Edge Function + gate middleware + dashboard shell
- **Slice 0.5**: Google OAuth
- **Slice 1.1**: Customer list + detail UI (read-only)
- **Slice 1.2**: Customer create/edit/delete
- **Slice 1.3**: API keys UI + CRUD
- **Slice 1.4**: Public `POST /customers` Edge Function
- **Slice 1.5**: CSV import + Inngest parse job
- **Slice 2.1**: Twilio + OpenAI adapters (`@meduso/shared`, stub mode without credentials)
- **Slice 2.2**: `schedule-outreach` + `send-initial-sms` Inngest functions
- **Slice 2.3**: `webhooks-twilio` Edge Function (inbound SMS + AI replies)
- **Slice 2.4**: `check-conversation-timeout` + max-turns handling
- **Slice 2.5**: Conversations list + detail UI (`/conversations`)
- **Slice 3.1**: OpenAI conversation analysis adapter + alert rules
- **Slice 3.2**: `analyze-conversation` + `create-alerts` Inngest functions
- **Slice 3.3**: Alerts inbox UI + Supabase Realtime (`/alerts`)
- **Slice 3.4**: Dashboard KPI RPC + overview UI
- **Slice 4.1**: Retell adapter (`@meduso/shared`, stub mode)
- **Slice 4.2**: `initiate-retell-call` Inngest + `webhooks-retell` Edge Function
- **Slice 4.3**: Recovery workflow UI on conversation detail
- **Slice 4.4**: Analytics category trends (`/analytics`)
- **Slice 5.1**: Sentry error monitoring + API rate limits
- **Slice 5.2**: Zapier app (`integrations/zapier`) + poll/hook Edge Functions
- **Slice 5.3**: Shared empty states + polish
- **Slice 6.1**: `webhooks-stripe` Edge Function (subscription lifecycle)
- **Slice 6.2**: Usage counters + plan limit enforcement (SMS, voice, imports)
- **Slice 6.3**: Billing UI (`/settings/billing`) + Stripe Checkout / Customer Portal

See **[CREDENTIALS.md](./CREDENTIALS.md)** for every API key and where to add it.

### Billing (Slice 6.x)

Plan limits are enforced via `usage_counters` (monthly SMS, voice minutes, CSV imports).

- **Free:** 50 SMS, 0 voice, 100 imports / month
- **Starter / Growth:** higher caps (see `/settings/billing`)
- **Past due / canceled:** outreach blocked until billing is updated

Stripe webhook URL: `https://<project-ref>.supabase.co/functions/v1/webhooks-stripe`

Without Stripe env vars, limits still apply; checkout is disabled until credentials are added.

Apply migration: `supabase db push` (adds `try_consume_usage()` + `get_billing_summary()` RPCs).

### Rate limits (Slice 5.1)

- Public API: **100 requests/minute** per API key
- CSV imports: **10 imports/hour** per organization

Returns `429` with `Retry-After` when exceeded.

### Zapier (Slice 5.2)

See [`integrations/zapier/README.md`](../integrations/zapier/README.md) for publish instructions.

### SMS outreach (Slice 2.x)

New customers trigger `customer/created` → delayed outreach → initial SMS conversation.

**Stub mode:** Without Twilio/OpenAI env vars, messages are logged and canned replies are used — full flow still runs in Inngest.

**Local testing:**

```bash
# Optional: shorten delays (minutes instead of hours)
OUTREACH_DELAY_MINUTES=1
CONVERSATION_TIMEOUT_MINUTES=2

npm run dev
npm run dev:inngest
supabase functions serve --env-file apps/web/.env.local
```

Twilio inbound webhook URL: `https://<project-ref>.supabase.co/functions/v1/webhooks-twilio`

### Analysis + alerts (Slice 3.x)

When a conversation ends, Inngest runs `analyze-conversation` → `create-alerts`.

**Stub mode:** Without `OPENAI_API_KEY`, heuristic analysis still runs and can create alerts from negative keywords.

Apply migration: `supabase db push` (adds `get_analytics_overview()` RPC).

### Voice outreach (Slice 4.x)

Trigger a voice call from the customer detail page or `POST /api/outreach/voice/:customerId`.

Retell webhook URL: `https://<project-ref>.supabase.co/functions/v1/webhooks-retell`

Without Retell credentials, stub mode simulates a 5-second call and runs analysis.

### Public API (Slice 1.4)

```bash
curl -X POST "https://<project-ref>.supabase.co/functions/v1/customers" \
  -H "X-Api-Key: med_..." \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: crm-12345" \
  -d '{
    "name": "John Smith",
    "phone": "+15551234567",
    "email": "john@example.com",
    "visitDate": "2026-06-08",
    "location": "Downtown",
    "externalId": "crm-12345"
  }'
```

### CSV import (Slice 1.5)

Expected columns: `Name`, `Phone`, `Email`, `Visit Date`, `Location` (last three optional).

Requires `supabase functions serve` for `import` and `npm run dev:inngest` for background parsing.
