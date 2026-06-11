-- Billing review fixes: plan_limit_config table, check vs increment usage, webhook retry support

CREATE TABLE public.plan_limit_config (
  plan public.subscription_plan PRIMARY KEY,
  sms_limit INTEGER,
  voice_limit INTEGER,
  import_limit INTEGER
);

INSERT INTO public.plan_limit_config (plan, sms_limit, voice_limit, import_limit) VALUES
  ('FREE', 50, 0, 100),
  ('STARTER', 500, 60, 1000),
  ('GROWTH', 2000, 300, 5000),
  ('ENTERPRISE', NULL, NULL, NULL);

COMMENT ON TABLE public.plan_limit_config IS
  'Authoritative plan limits. Keep in sync with packages/shared/src/billing/plans.ts';

CREATE OR REPLACE FUNCTION public.plan_usage_limits(p_plan public.subscription_plan)
RETURNS TABLE (
  sms_limit INTEGER,
  voice_limit INTEGER,
  import_limit INTEGER
)
LANGUAGE sql
STABLE
AS $$
  SELECT plc.sms_limit, plc.voice_limit, plc.import_limit
  FROM public.plan_limit_config plc
  WHERE plc.plan = p_plan;
$$;

CREATE OR REPLACE FUNCTION public._usage_context(
  p_organization_id UUID,
  p_metric TEXT,
  p_amount INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan public.subscription_plan;
  v_status public.subscription_status;
  v_period TEXT := public.current_usage_period();
  v_sms_limit INTEGER;
  v_voice_limit INTEGER;
  v_import_limit INTEGER;
  v_limit INTEGER;
  v_current INTEGER;
BEGIN
  IF p_amount < 1 THEN
    RAISE EXCEPTION 'p_amount must be at least 1';
  END IF;

  IF p_metric NOT IN ('sms_sent', 'voice_minutes', 'customers_imported') THEN
    RAISE EXCEPTION 'invalid metric: %', p_metric;
  END IF;

  SELECT s.plan, s.status
  INTO v_plan, v_status
  FROM public.subscriptions s
  WHERE s.organization_id = p_organization_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'subscription_not_found',
      'metric', p_metric,
      'current', 0,
      'limit', 0,
      'plan', 'FREE',
      'status', 'CANCELED'
    );
  END IF;

  IF v_status IN ('PAST_DUE', 'CANCELED') THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'subscription_inactive',
      'metric', p_metric,
      'current', 0,
      'limit', 0,
      'plan', v_plan,
      'status', v_status
    );
  END IF;

  SELECT sms_limit, voice_limit, import_limit
  INTO v_sms_limit, v_voice_limit, v_import_limit
  FROM public.plan_usage_limits(v_plan);

  v_limit := CASE p_metric
    WHEN 'sms_sent' THEN v_sms_limit
    WHEN 'voice_minutes' THEN v_voice_limit
    ELSE v_import_limit
  END;

  SELECT
    CASE p_metric
      WHEN 'sms_sent' THEN COALESCE(uc.sms_sent, 0)
      WHEN 'voice_minutes' THEN COALESCE(uc.voice_minutes, 0)
      ELSE COALESCE(uc.customers_imported, 0)
    END
  INTO v_current
  FROM public.usage_counters uc
  WHERE uc.organization_id = p_organization_id
    AND uc.period = v_period;

  IF NOT FOUND THEN
    v_current := 0;
  END IF;

  IF v_limit IS NOT NULL AND v_current + p_amount > v_limit THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'usage_limit_exceeded',
      'metric', p_metric,
      'current', v_current,
      'limit', v_limit,
      'plan', v_plan,
      'status', v_status
    );
  END IF;

  RETURN jsonb_build_object(
    'allowed', true,
    'metric', p_metric,
    'current', v_current,
    'limit', v_limit,
    'plan', v_plan,
    'status', v_status
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.check_usage_allowed(
  p_organization_id UUID,
  p_metric TEXT,
  p_amount INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public._usage_context(p_organization_id, p_metric, p_amount);
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_usage(
  p_organization_id UUID,
  p_metric TEXT,
  p_amount INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_context JSONB;
  v_period TEXT := public.current_usage_period();
  v_counter_id UUID;
  v_current INTEGER;
  v_limit INTEGER;
  v_plan public.subscription_plan;
  v_status public.subscription_status;
BEGIN
  v_context := public._usage_context(p_organization_id, p_metric, p_amount);

  IF NOT (v_context->>'allowed')::BOOLEAN THEN
    RETURN v_context;
  END IF;

  v_plan := (v_context->>'plan')::public.subscription_plan;
  v_status := (v_context->>'status')::public.subscription_status;
  v_limit := NULLIF(v_context->>'limit', '')::INTEGER;

  INSERT INTO public.usage_counters (organization_id, period)
  VALUES (p_organization_id, v_period)
  ON CONFLICT (organization_id, period) DO NOTHING;

  SELECT id
  INTO v_counter_id
  FROM public.usage_counters
  WHERE organization_id = p_organization_id
    AND period = v_period
  FOR UPDATE;

  v_current := CASE p_metric
    WHEN 'sms_sent' THEN (SELECT sms_sent FROM public.usage_counters WHERE id = v_counter_id)
    WHEN 'voice_minutes' THEN (SELECT voice_minutes FROM public.usage_counters WHERE id = v_counter_id)
    ELSE (SELECT customers_imported FROM public.usage_counters WHERE id = v_counter_id)
  END;

  IF v_limit IS NOT NULL AND v_current + p_amount > v_limit THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'usage_limit_exceeded',
      'metric', p_metric,
      'current', v_current,
      'limit', v_limit,
      'plan', v_plan,
      'status', v_status
    );
  END IF;

  IF p_metric = 'sms_sent' THEN
    UPDATE public.usage_counters SET sms_sent = sms_sent + p_amount WHERE id = v_counter_id;
  ELSIF p_metric = 'voice_minutes' THEN
    UPDATE public.usage_counters SET voice_minutes = voice_minutes + p_amount WHERE id = v_counter_id;
  ELSE
    UPDATE public.usage_counters SET customers_imported = customers_imported + p_amount WHERE id = v_counter_id;
  END IF;

  RETURN v_context || jsonb_build_object('current', v_current + p_amount);
END;
$$;

CREATE OR REPLACE FUNCTION public.try_consume_usage(
  p_organization_id UUID,
  p_metric TEXT,
  p_amount INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.increment_usage(p_organization_id, p_metric, p_amount);
END;
$$;

REVOKE ALL ON FUNCTION public.check_usage_allowed(UUID, TEXT, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_usage_allowed(UUID, TEXT, INTEGER) TO service_role;

REVOKE ALL ON FUNCTION public.increment_usage(UUID, TEXT, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_usage(UUID, TEXT, INTEGER) TO service_role;
