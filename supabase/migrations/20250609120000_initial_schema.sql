-- Meduso AI — initial schema (Slice 0.2)
-- Multi-tenant B2B SaaS: organizations, customers, conversations, alerts

-- =============================================================================
-- Extensions
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- Enums
-- =============================================================================
CREATE TYPE public.user_role AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

CREATE TYPE public.subscription_plan AS ENUM (
  'FREE',
  'STARTER',
  'GROWTH',
  'ENTERPRISE'
);

CREATE TYPE public.subscription_status AS ENUM (
  'TRIALING',
  'ACTIVE',
  'PAST_DUE',
  'CANCELED'
);

CREATE TYPE public.customer_source AS ENUM ('CSV', 'API', 'ZAPIER', 'MANUAL');

CREATE TYPE public.import_source AS ENUM ('CSV', 'API', 'ZAPIER');

CREATE TYPE public.import_status AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');

CREATE TYPE public.conversation_channel AS ENUM ('SMS', 'VOICE');

CREATE TYPE public.conversation_status AS ENUM (
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'FAILED',
  'OPTED_OUT'
);

CREATE TYPE public.recovery_status AS ENUM (
  'OPEN',
  'IN_RECOVERY',
  'RECOVERED',
  'RESOLVED',
  'LOST'
);

CREATE TYPE public.message_role AS ENUM ('SYSTEM', 'ASSISTANT', 'CUSTOMER');

CREATE TYPE public.churn_risk AS ENUM ('LOW', 'MEDIUM', 'HIGH');

CREATE TYPE public.alert_type AS ENUM (
  'NEGATIVE_SENTIMENT',
  'HIGH_CHURN_RISK',
  'ESCALATION_REQUESTED'
);

CREATE TYPE public.alert_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

CREATE TYPE public.alert_status AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED');

CREATE TYPE public.recovery_action_type AS ENUM (
  'NOTE',
  'MARK_RECOVERED',
  'MARK_RESOLVED',
  'CONTACT_CUSTOMER'
);

CREATE TYPE public.webhook_provider AS ENUM ('TWILIO', 'RETELL', 'STRIPE');

-- =============================================================================
-- Utility functions
-- =============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =============================================================================
-- Core tenant tables
-- =============================================================================
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  industry TEXT,
  settings JSONB NOT NULL DEFAULT jsonb_build_object(
    'defaultOutreachDelayHours', 24,
    'smsEnabled', true,
    'voiceEnabled', false,
    'avgCustomerValue', 0
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER organizations_set_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'OWNER',
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX profiles_organization_id_idx ON public.profiles (organization_id);

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Resolves the organization for the currently authenticated user.
CREATE OR REPLACE FUNCTION public.current_organization_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id
  FROM public.profiles
  WHERE id = auth.uid()
$$;

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE REFERENCES public.organizations (id) ON DELETE CASCADE,
  plan public.subscription_plan NOT NULL DEFAULT 'FREE',
  status public.subscription_status NOT NULL DEFAULT 'TRIALING',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  trial_ends_at TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER subscriptions_set_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  external_id TEXT,
  address JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX locations_organization_id_idx ON public.locations (organization_id);

CREATE TRIGGER locations_set_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.outreach_settings (
  organization_id UUID PRIMARY KEY REFERENCES public.organizations (id) ON DELETE CASCADE,
  sms_delay_hours INTEGER NOT NULL DEFAULT 24,
  sms_template TEXT NOT NULL DEFAULT 'Hi {{name}}, thanks for visiting {{businessName}}! How was your experience?',
  voice_enabled BOOLEAN NOT NULL DEFAULT false,
  max_sms_turns INTEGER NOT NULL DEFAULT 6,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER outreach_settings_set_updated_at
  BEFORE UPDATE ON public.outreach_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- Customers & imports
-- =============================================================================
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.locations (id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone_e164 TEXT NOT NULL,
  email TEXT,
  last_visit_date DATE,
  source public.customer_source NOT NULL DEFAULT 'MANUAL',
  external_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX customers_organization_id_idx ON public.customers (organization_id);
CREATE INDEX customers_phone_e164_idx ON public.customers (phone_e164);
CREATE INDEX customers_created_at_idx ON public.customers (created_at DESC);
CREATE UNIQUE INDEX customers_org_phone_active_uidx
  ON public.customers (organization_id, phone_e164)
  WHERE deleted_at IS NULL;

CREATE TRIGGER customers_set_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.customer_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  file_name TEXT,
  source public.import_source NOT NULL,
  status public.import_status NOT NULL DEFAULT 'PROCESSING',
  total_rows INTEGER NOT NULL DEFAULT 0,
  success_rows INTEGER NOT NULL DEFAULT 0,
  failed_rows INTEGER NOT NULL DEFAULT 0,
  error_report JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX customer_imports_organization_id_idx ON public.customer_imports (organization_id);
CREATE INDEX customer_imports_created_at_idx ON public.customer_imports (created_at DESC);

CREATE TRIGGER customer_imports_set_updated_at
  BEFORE UPDATE ON public.customer_imports
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- Conversations & messages
-- =============================================================================
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers (id) ON DELETE CASCADE,
  channel public.conversation_channel NOT NULL,
  status public.conversation_status NOT NULL DEFAULT 'SCHEDULED',
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  twilio_conversation_sid TEXT,
  retell_call_id TEXT,
  recording_url TEXT,
  transcript_raw TEXT,
  recovery_status public.recovery_status NOT NULL DEFAULT 'OPEN',
  provider_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX conversations_organization_id_idx ON public.conversations (organization_id);
CREATE INDEX conversations_customer_id_idx ON public.conversations (customer_id);
CREATE INDEX conversations_status_idx ON public.conversations (status);
CREATE INDEX conversations_created_at_idx ON public.conversations (created_at DESC);

CREATE TRIGGER conversations_set_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations (id) ON DELETE CASCADE,
  role public.message_role NOT NULL,
  content TEXT NOT NULL,
  channel public.conversation_channel NOT NULL,
  provider_message_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX messages_conversation_id_idx ON public.messages (conversation_id);
CREATE INDEX messages_created_at_idx ON public.messages (created_at);

CREATE TABLE public.conversation_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL UNIQUE REFERENCES public.conversations (id) ON DELETE CASCADE,
  sentiment_score NUMERIC(4, 3) NOT NULL,
  satisfaction_score INTEGER NOT NULL CHECK (satisfaction_score BETWEEN 1 AND 10),
  churn_risk public.churn_risk NOT NULL,
  complaint_categories TEXT[] NOT NULL DEFAULT '{}',
  praise_categories TEXT[] NOT NULL DEFAULT '{}',
  summary TEXT NOT NULL,
  recommended_action TEXT NOT NULL,
  model TEXT NOT NULL,
  raw_response JSONB NOT NULL DEFAULT '{}'::jsonb,
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX conversation_analyses_analyzed_at_idx
  ON public.conversation_analyses (analyzed_at DESC);

-- =============================================================================
-- Alerts & recovery
-- =============================================================================
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.conversations (id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers (id) ON DELETE CASCADE,
  type public.alert_type NOT NULL,
  severity public.alert_severity NOT NULL,
  status public.alert_status NOT NULL DEFAULT 'OPEN',
  summary TEXT NOT NULL,
  recommended_action TEXT NOT NULL,
  acknowledged_by_user_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX alerts_organization_id_idx ON public.alerts (organization_id);
CREATE INDEX alerts_status_idx ON public.alerts (status);
CREATE INDEX alerts_created_at_idx ON public.alerts (created_at DESC);

CREATE TRIGGER alerts_set_updated_at
  BEFORE UPDATE ON public.alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.recovery_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  action public.recovery_action_type NOT NULL,
  note TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX recovery_actions_conversation_id_idx ON public.recovery_actions (conversation_id);

-- =============================================================================
-- Integrations & billing guardrails
-- =============================================================================
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX api_keys_organization_id_idx ON public.api_keys (organization_id);
CREATE INDEX api_keys_key_hash_idx ON public.api_keys (key_hash);

CREATE TRIGGER api_keys_set_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider public.webhook_provider NOT NULL,
  external_event_id TEXT NOT NULL UNIQUE,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX webhook_events_provider_idx ON public.webhook_events (provider);
CREATE INDEX webhook_events_created_at_idx ON public.webhook_events (created_at DESC);

CREATE TABLE public.usage_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  sms_sent INTEGER NOT NULL DEFAULT 0,
  voice_minutes INTEGER NOT NULL DEFAULT 0,
  customers_imported INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, period)
);

CREATE INDEX usage_counters_organization_id_idx ON public.usage_counters (organization_id);

CREATE TRIGGER usage_counters_set_updated_at
  BEFORE UPDATE ON public.usage_counters
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
