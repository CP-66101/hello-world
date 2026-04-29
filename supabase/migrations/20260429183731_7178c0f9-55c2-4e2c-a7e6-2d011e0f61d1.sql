-- Fix mutable search_path on touch trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- has_role and handle_new_user already SET search_path = public; revoke execute from anon to silence executable-by-public warning
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
-- has_role still needed by RLS policies (definer context) and by authenticated admin checks
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
