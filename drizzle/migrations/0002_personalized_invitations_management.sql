CREATE TABLE public.invitation_models (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 title text NOT NULL,
 category text NOT NULL DEFAULT '',
 status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','available','archived')),
 content jsonb NOT NULL DEFAULT '{}'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.invitation_models TO authenticated;
GRANT ALL ON public.invitation_models TO service_role;
ALTER TABLE public.invitation_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages models" ON public.invitation_models FOR ALL TO authenticated USING (public.has_role(auth.uid(),'owner')) WITH CHECK (public.has_role(auth.uid(),'owner'));
CREATE TABLE public.customer_profiles (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid UNIQUE,
 full_name text NOT NULL,
 email text NOT NULL DEFAULT '',
 phone text NOT NULL DEFAULT '',
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.customer_profiles TO authenticated;
GRANT ALL ON public.customer_profiles TO service_role;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages customers" ON public.customer_profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'owner')) WITH CHECK (public.has_role(auth.uid(),'owner'));
CREATE TABLE public.customer_orders (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 customer_id uuid REFERENCES public.customer_profiles(id) ON DELETE RESTRICT,
 model_id uuid REFERENCES public.invitation_models(id) ON DELETE RESTRICT,
 production_status text NOT NULL DEFAULT 'awaiting_information' CHECK (production_status IN ('awaiting_information','queued','personalizing','review','published','delivered','cancelled')),
 customer_information jsonb NOT NULL DEFAULT '{}'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.customer_orders TO authenticated;
GRANT ALL ON public.customer_orders TO service_role;
ALTER TABLE public.customer_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages orders" ON public.customer_orders FOR ALL TO authenticated USING (public.has_role(auth.uid(),'owner')) WITH CHECK (public.has_role(auth.uid(),'owner'));
CREATE TABLE public.customer_invitations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 customer_id uuid REFERENCES public.customer_profiles(id) ON DELETE RESTRICT,
 order_id uuid UNIQUE REFERENCES public.customer_orders(id) ON DELETE RESTRICT,
 model_id uuid REFERENCES public.invitation_models(id) ON DELETE RESTRICT,
 title text NOT NULL,
 slug text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24),'hex') CHECK (slug ~ '^[a-z0-9-]{16,96}$'),
 content jsonb NOT NULL DEFAULT '{}'::jsonb,
 published_content jsonb,
 published_at timestamptz,
 status text NOT NULL DEFAULT 'inactive' CHECK (status IN ('active','inactive','archived')),
 expires_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.customer_invitations TO authenticated;
GRANT ALL ON public.customer_invitations TO service_role;
ALTER TABLE public.customer_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages individual invitations" ON public.customer_invitations FOR ALL TO authenticated USING (public.has_role(auth.uid(),'owner')) WITH CHECK (public.has_role(auth.uid(),'owner'));
CREATE FUNCTION public.validate_invitation_publication() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NEW.status='active' AND (NEW.published_content IS NULL OR NEW.published_at IS NULL) THEN
 RAISE EXCEPTION 'Publish invitation content before activation';
 END IF;
 NEW.updated_at=now();
 RETURN NEW;
END;
$$;
CREATE TRIGGER validate_invitation_publication BEFORE INSERT OR UPDATE ON public.customer_invitations FOR EACH ROW EXECUTE FUNCTION public.validate_invitation_publication();
CREATE INDEX customer_orders_customer_idx ON public.customer_orders(customer_id);
CREATE INDEX customer_invitations_customer_idx ON public.customer_invitations(customer_id);
COMMENT ON TABLE public.customer_invitations IS 'Owner-only personalization. Unique links are prepared; public delivery requires a token-scoped endpoint that checks publication, status and expiration. Deactivation preserves all invitation content.';