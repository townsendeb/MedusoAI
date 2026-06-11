-- Atomic onboarding: org + profile + subscription + outreach_settings
CREATE OR REPLACE FUNCTION public.complete_onboarding(
  p_user_id UUID,
  p_business_name TEXT,
  p_user_name TEXT,
  p_timezone TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_slug TEXT;
  v_base_slug TEXT;
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'profile_already_exists' USING ERRCODE = 'P0001';
  END IF;

  v_base_slug := lower(regexp_replace(trim(p_business_name), '[^a-zA-Z0-9]+', '-', 'g'));
  v_base_slug := trim(both '-' from v_base_slug);

  IF v_base_slug = '' THEN
    v_base_slug := 'business';
  END IF;

  v_slug := v_base_slug || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);

  INSERT INTO public.organizations (name, slug, timezone)
  VALUES (trim(p_business_name), v_slug, p_timezone)
  RETURNING id INTO v_org_id;

  INSERT INTO public.profiles (id, organization_id, role, name)
  VALUES (p_user_id, v_org_id, 'OWNER', trim(p_user_name));

  INSERT INTO public.subscriptions (organization_id)
  VALUES (v_org_id);

  INSERT INTO public.outreach_settings (organization_id)
  VALUES (v_org_id);

  RETURN v_org_id;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_onboarding(UUID, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_onboarding(UUID, TEXT, TEXT, TEXT) TO service_role;
