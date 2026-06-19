# Meduso AI — Executive Summary

**Product:** Automated customer feedback and recovery platform for local businesses  
**Status:** MVP complete (customer intake, SMS/voice outreach, AI analysis, alerts, analytics, billing, Zapier)  
**Audience:** Business owners and executive stakeholders

---

## The Problem

Unhappy customers often leave quietly — a bad review, no return visit, no direct complaint. By the time a business notices, the relationship is already lost.

## The Solution

Meduso AI reaches out shortly after a visit (usually by text), asks how the experience was, and uses AI to understand the response. When something needs attention, it surfaces an **alert** on a dashboard so staff can follow up before damage spreads.

**In short:** automated check-in + smart inbox for problems worth a human response.

---

## How It Works

| Step | What happens |
|------|----------------|
| 1. **Import** | Customers enter via spreadsheet upload, manual entry, API, or Zapier |
| 2. **Outreach** | After a configurable delay (default 24h), Meduso sends a friendly SMS |
| 3. **Conversation** | Customer replies; AI continues the thread naturally (with opt-out support) |
| 4. **Analysis** | When the conversation ends, AI scores sentiment and flags complaint themes |
| 5. **Action** | Alerts appear on the dashboard; staff review and log recovery steps |
| 6. **Optional voice** | AI phone calls available for high-touch follow-up on individual customers |

---

## What Your Team Uses

| Screen | Purpose |
|--------|---------|
| **Dashboard** | KPIs, alerts needing action, usage warnings |
| **Customers** | Manage contacts, CSV import |
| **Conversations** | Full SMS/voice history and transcripts |
| **Alerts** | Recovery inbox (updates in real time) |
| **Analytics** | Complaint trends by category |
| **Billing** | Plan, usage, upgrade |

---

## Plans at a Glance

| Plan | SMS/mo | Voice | Imports/mo |
|------|--------|-------|------------|
| Free | 50 | — | 100 |
| Starter | 500 | 60 min | 1,000 |
| Growth | 2,000 | 300 min | 5,000 |
| Enterprise | Unlimited | Unlimited | Unlimited |

Outreach pauses when limits are hit or billing is past due.

---

## Technology Partners (Managed by Your Technical Team)

| Partner | Role |
|---------|------|
| **Supabase** | Database, login, file storage |
| **Vercel** | Website hosting |
| **AgentPhone** | SMS and voice |
| **OpenAI** | AI replies and analysis |
| **Retell** | AI voice calls (legacy fallback when `TELEPHONY_PROVIDER=legacy`) |
| **Stripe** | Subscriptions |
| **Zapier** | Connect to CRMs and 6,000+ apps |
| **Inngest** | Background automation |

Setup: [CREDENTIALS.md](./CREDENTIALS.md) · Go-live: [PRE_LAUNCH_CHECKLIST.md](./PRE_LAUNCH_CHECKLIST.md) · Product guide: [CLIENT_HANDOFF.md](./CLIENT_HANDOFF.md)

---

## Business Outcomes

- **Earlier warning** — catch dissatisfaction before public reviews
- **Less manual work** — outreach and first-pass analysis run automatically
- **Clear accountability** — alerts, recovery logs, and analytics in one place
- **Scales with volume** — tiered plans and API/Zapier for growing customer lists

---

## Ownership Split

| **You** | **Technical partner** |
|---------|----------------------|
| Pilot onboarding and staff training | Deploy and maintain infrastructure |
| Alert response and recovery policy | API keys, webhooks, and integrations |
| Plan selection and billing management | Error monitoring and code changes |

---

*Meduso AI · Executive Summary v1.0 · June 2026*
