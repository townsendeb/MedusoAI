# Meduso AI — Zapier Integration

## Setup

1. Install the Zapier CLI: `npm install -g zapier-platform-cli`
2. From this directory: `npm install`
3. `zapier login`
4. `zapier register "Meduso AI"` (first time only)
5. `zapier push`

## Authentication

Users need:

- **API Key** from Meduso → Settings → API keys (`customers:write` scope for actions)
- **Supabase Functions URL**: `https://<project-ref>.supabase.co/functions/v1`

## Triggers

| Trigger | Type | Description |
|---------|------|-------------|
| New Alert | REST hook + polling fallback | Fires when a recovery alert is created |
| Conversation Completed | REST hook + polling fallback | Fires when SMS/voice conversation ends |

## Actions

| Action | Endpoint |
|--------|----------|
| Create Customer | `POST /customers` |
| Trigger Voice Call | `POST /outreach-voice` |

## Local testing

```bash
zapier test
zapier validate
```
