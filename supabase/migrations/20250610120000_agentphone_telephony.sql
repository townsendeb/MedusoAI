-- AgentPhone telephony: webhook provider + generic voice call ID

ALTER TYPE public.webhook_provider ADD VALUE IF NOT EXISTS 'AGENTPHONE';

ALTER TABLE public.conversations
  RENAME COLUMN retell_call_id TO provider_call_id;

CREATE INDEX IF NOT EXISTS conversations_provider_call_id_idx
  ON public.conversations (provider_call_id)
  WHERE provider_call_id IS NOT NULL;
