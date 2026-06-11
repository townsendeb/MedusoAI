-- Billing usage counters + plan limits (Slice 6.2)

CREATE OR REPLACE FUNCTION public.plan_usage_limits(p_plan public.subscription_plan)
RETURNS TABLE (
  sms_limit INTEGER,
  voice_limit INTEGER,
  import_limit INTEGER
)
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT
    CASE p_plan
      WHEN 'FREE' THEN 50
      WHEN 'STARTER' THEN 500
      WHEN 'GROWTH' THEN 2000
      ELSE NULL
    END,
    CASE p_plan
      WHEN 'FREE' THEN 0
      WHEN 'STARTER' THEN 60
      WHEN 'GROWTH' THEN 300
      ELSE NULL
    END,
    CASE p_plan
      WHEN 'FREE' THEN 100
      WHEN 'STARTER' THEN 1000
      WHEN 'GROWTH' THEN 5000
      ELSE NULL
    END;
$$;

CREATE OR REPLACE FUNCTION public.current_usage_period()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT to_char(timezone('UTC', now()), 'YYYY-MM');
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
DECLARE
  v_plan public.subscription_plan;
  v_status public.subscription_status;
  v_period TEXT := public.current_usage_period();
  v_sms_limit INTEGER;
  v_voice_limit INTEGER;
  v_import_limit INTEGER;
  v_limit INTEGER;
  v_current INTEGER;
  v_counter_id UUID;
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

  RETURN jsonb_build_object(
    'allowed', true,
    'metric', p_metric,
    'current', v_current + p_amount,
    'limit', v_limit,
    'plan', v_plan,
    'status', v_status
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_billing_summary()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID := public.current_organization_id();
  v_plan public.subscription_plan;
  v_status public.subscription_status;
  v_period TEXT := public.current_usage_period();
  v_sms_limit INTEGER;
  v_voice_limit INTEGER;
  v_import_limit INTEGER;
  v_usage public.usage_counters%ROWTYPE;
  v_subscription public.subscriptions%ROWTYPE;
BEGIN
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT *
  INTO v_subscription
  FROM public.subscriptions
  WHERE organization_id = v_org_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'subscription not found';
  END IF;

  v_plan := v_subscription.plan;
  v_status := v_subscription.status;

  SELECT sms_limit, voice_limit, import_limit
  INTO v_sms_limit, v_voice_limit, v_import_limit
  FROM public.plan_usage_limits(v_plan);

  SELECT *
  INTO v_usage
  FROM public.usage_counters
  WHERE organization_id = v_org_id
    AND period = v_period;

  IF NOT FOUND THEN
    v_usage.sms_sent := 0;
    v_usage.voice_minutes := 0;
    v_usage.customers_imported := 0;
  END IF;

  RETURN jsonb_build_object(
    'plan', v_plan,
    'status', v_status,
    'period', v_period,
    'trial_ends_at', v_subscription.trial_ends_at,
    'current_period_end', v_subscription.current_period_end,
    'stripe_customer_id', v_subscription.stripe_customer_id,
    'usage', jsonb_build_object(
      'sms_sent', v_usage.sms_sent,
      'voice_minutes', v_usage.voice_minutes,
      'customers_imported', v_usage.customers_imported
    ),
    'limits', jsonb_build_object(
      'sms_sent', v_sms_limit,
      'voice_minutes', v_voice_limit,
      'customers_imported', v_import_limit
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.try_consume_usage(UUID, TEXT, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.try_consume_usage(UUID, TEXT, INTEGER) TO service_role;

REVOKE ALL ON FUNCTION public.get_billing_summary() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_billing_summary() TO authenticated;
