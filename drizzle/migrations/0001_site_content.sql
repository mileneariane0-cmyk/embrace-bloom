CREATE TABLE public.site_content (
  id text PRIMARY KEY CHECK (id IN ('draft','published')),
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published site" ON public.site_content FOR SELECT TO anon, authenticated USING (id = 'published');
CREATE POLICY "Owner reads all site content" ON public.site_content FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Owner inserts site content" ON public.site_content FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Owner updates site content" ON public.site_content FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'owner')) WITH CHECK (public.has_role(auth.uid(), 'owner'));

CREATE TABLE public.site_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content jsonb NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);
GRANT SELECT, INSERT ON public.site_versions TO authenticated;
GRANT ALL ON public.site_versions TO service_role;
ALTER TABLE public.site_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner reads versions" ON public.site_versions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Owner creates versions" ON public.site_versions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Public reads site media" ON storage.objects FOR SELECT USING (bucket_id = 'site-media');
CREATE POLICY "Owner uploads site media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Owner updates site media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Owner deletes site media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'owner'));