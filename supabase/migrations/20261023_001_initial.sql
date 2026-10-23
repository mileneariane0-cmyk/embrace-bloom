-- Personalizê initial database design for Supabase PostgreSQL.
-- Run only after reviewing in the correct Supabase project.
create extension if not exists pgcrypto;

create table if not exists public.admin_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','editor','support')),
  created_at timestamptz not null default now()
);
alter table public.admin_members enable row level security;
-- Do not allow self-enrollment: owner roles must be provisioned server-side.
create policy "members can read own membership" on public.admin_members
  for select to authenticated using (user_id = (select auth.uid()));

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  image_path text,
  display_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.categories enable row level security;
create policy "public can read visible categories" on public.categories
  for select to anon, authenticated using (is_visible);
create policy "owner or editor can manage categories" on public.categories
  for all to authenticated
  using (exists(select 1 from public.admin_members m where m.user_id=(select auth.uid()) and m.role in ('owner','editor')))
  with check (exists(select 1 from public.admin_members m where m.user_id=(select auth.uid()) and m.role in ('owner','editor')));

create table if not exists public.invitation_models (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  internal_code text unique,
  title text not null,
  description text,
  price_cents integer not null default 0 check (price_cents >= 0),
  cover_path text,
  layout jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.invitation_models enable row level security;
create policy "public can read published models" on public.invitation_models
  for select to anon, authenticated using (status = 'published');
create policy "owner or editor can manage models" on public.invitation_models
  for all to authenticated
  using (exists(select 1 from public.admin_members m where m.user_id=(select auth.uid()) and m.role in ('owner','editor')))
  with check (exists(select 1 from public.admin_members m where m.user_id=(select auth.uid()) and m.role in ('owner','editor')));

-- Future migrations: customers, orders, payments, invitation_instances,
-- revisions, rsvp, media and audit events. Never grant public read on RSVP data.
