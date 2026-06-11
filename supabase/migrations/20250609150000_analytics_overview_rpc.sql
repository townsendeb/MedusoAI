-- Dashboard KPI RPC (Slice 3.4)

CREATE OR REPLACE FUNCTION public.get_analytics_overview()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  org_id uuid := public.current_organization_id();
  avg_value numeric;
  recovered_count integer;
BEGIN
  IF org_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE((settings->>'avgCustomerValue')::numeric, 0)
  INTO avg_value
  FROM public.organizations
  WHERE id = org_id;

  SELECT COUNT(*)::integer
  INTO recovered_count
  FROM public.conversations
  WHERE organization_id = org_id
    AND recovery_status = 'RECOVERED';

  RETURN jsonb_build_object(
    'customersContacted', (
      SELECT COUNT(DISTINCT customer_id)
      FROM public.conversations
      WHERE organization_id = org_id
        AND started_at IS NOT NULL
    ),
    'conversationsCompleted', (
      SELECT COUNT(*)
      FROM public.conversations
      WHERE organization_id = org_id
        AND status = 'COMPLETED'
    ),
    'recoveryOpportunities', (
      SELECT COUNT(*)
      FROM public.alerts
      WHERE organization_id = org_id
        AND status = 'OPEN'
    ),
    'customersRecovered', recovered_count,
    'revenueProtected', recovered_count * avg_value
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_analytics_overview() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_analytics_overview() TO authenticated;
