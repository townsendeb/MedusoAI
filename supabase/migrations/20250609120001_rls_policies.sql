-- Meduso AI — Row Level Security policies (Slice 0.2)

ALTER TABLE public.conversation_analyses
  ADD CONSTRAINT conversation_analyses_sentiment_score_range
  CHECK (sentiment_score >= -1 AND sentiment_score <= 1);

-- =============================================================================
-- Enable RLS on all tenant tables
-- =============================================================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_counters ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- organizations
-- Onboarding inserts use service role. Members can read/update their org.
-- =============================================================================
CREATE POLICY organizations_select_own ON public.organizations
  FOR SELECT
  TO authenticated
  USING (id = public.current_organization_id());

CREATE POLICY organizations_update_own ON public.organizations
  FOR UPDATE
  TO authenticated
  USING (id = public.current_organization_id())
  WITH CHECK (id = public.current_organization_id());

-- =============================================================================
-- profiles
-- =============================================================================
CREATE POLICY profiles_select_org ON public.profiles
  FOR SELECT
  TO authenticated
  USING (organization_id = public.current_organization_id());

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND organization_id = public.current_organization_id()
  );

-- =============================================================================
-- Org-scoped tables (direct organization_id column)
-- =============================================================================
CREATE POLICY subscriptions_org_all ON public.subscriptions
  FOR ALL
  TO authenticated
  USING (organization_id = public.current_organization_id())
  WITH CHECK (organization_id = public.current_organization_id());

CREATE POLICY locations_org_all ON public.locations
  FOR ALL
  TO authenticated
  USING (organization_id = public.current_organization_id())
  WITH CHECK (organization_id = public.current_organization_id());

CREATE POLICY outreach_settings_org_all ON public.outreach_settings
  FOR ALL
  TO authenticated
  USING (organization_id = public.current_organization_id())
  WITH CHECK (organization_id = public.current_organization_id());

CREATE POLICY customers_org_all ON public.customers
  FOR ALL
  TO authenticated
  USING (organization_id = public.current_organization_id())
  WITH CHECK (organization_id = public.current_organization_id());

CREATE POLICY customer_imports_org_all ON public.customer_imports
  FOR ALL
  TO authenticated
  USING (organization_id = public.current_organization_id())
  WITH CHECK (organization_id = public.current_organization_id());

CREATE POLICY conversations_org_all ON public.conversations
  FOR ALL
  TO authenticated
  USING (organization_id = public.current_organization_id())
  WITH CHECK (organization_id = public.current_organization_id());

CREATE POLICY alerts_org_all ON public.alerts
  FOR ALL
  TO authenticated
  USING (organization_id = public.current_organization_id())
  WITH CHECK (organization_id = public.current_organization_id());

CREATE POLICY api_keys_org_all ON public.api_keys
  FOR ALL
  TO authenticated
  USING (organization_id = public.current_organization_id())
  WITH CHECK (organization_id = public.current_organization_id());

CREATE POLICY usage_counters_org_all ON public.usage_counters
  FOR ALL
  TO authenticated
  USING (organization_id = public.current_organization_id())
  WITH CHECK (organization_id = public.current_organization_id());

-- =============================================================================
-- Child tables scoped via conversations
-- =============================================================================
CREATE POLICY messages_org_all ON public.messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND c.organization_id = public.current_organization_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND c.organization_id = public.current_organization_id()
    )
  );

CREATE POLICY conversation_analyses_org_all ON public.conversation_analyses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id = conversation_analyses.conversation_id
        AND c.organization_id = public.current_organization_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id = conversation_analyses.conversation_id
        AND c.organization_id = public.current_organization_id()
    )
  );

CREATE POLICY recovery_actions_org_all ON public.recovery_actions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id = recovery_actions.conversation_id
        AND c.organization_id = public.current_organization_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id = recovery_actions.conversation_id
        AND c.organization_id = public.current_organization_id()
    )
    AND user_id = auth.uid()
  );

-- =============================================================================
-- webhook_events — service role only (no policies for authenticated/anon)
-- =============================================================================
-- RLS enabled with zero policies: denies all access except service_role bypass.

-- =============================================================================
-- Realtime (alerts) — enable replication for dashboard live updates
-- =============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
