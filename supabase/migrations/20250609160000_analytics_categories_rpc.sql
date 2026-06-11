-- Category trend RPCs (Slice 4.4)

CREATE OR REPLACE FUNCTION public.get_analytics_category_trends()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  org_id uuid := public.current_organization_id();
BEGIN
  IF org_id IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'complaints', COALESCE(
      (
        SELECT jsonb_agg(jsonb_build_object('id', category_id, 'count', category_count) ORDER BY category_count DESC)
        FROM (
          SELECT unnest(ca.complaint_categories) AS category_id, COUNT(*)::integer AS category_count
          FROM public.conversation_analyses ca
          INNER JOIN public.conversations c ON c.id = ca.conversation_id
          WHERE c.organization_id = org_id
          GROUP BY unnest(ca.complaint_categories)
        ) complaint_counts
      ),
      '[]'::jsonb
    ),
    'praise', COALESCE(
      (
        SELECT jsonb_agg(jsonb_build_object('id', category_id, 'count', category_count) ORDER BY category_count DESC)
        FROM (
          SELECT unnest(ca.praise_categories) AS category_id, COUNT(*)::integer AS category_count
          FROM public.conversation_analyses ca
          INNER JOIN public.conversations c ON c.id = ca.conversation_id
          WHERE c.organization_id = org_id
          GROUP BY unnest(ca.praise_categories)
        ) praise_counts
      ),
      '[]'::jsonb
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_analytics_category_trends() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_analytics_category_trends() TO authenticated;
