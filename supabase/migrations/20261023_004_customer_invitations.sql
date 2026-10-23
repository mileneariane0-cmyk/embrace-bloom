-- Published invitations are independent copies of models, customized by authorized administrators.
-- Review existing Lovable Cloud schema before running this additive migration.
create table if not exists public.customer_invitations (
 id uuid primary key default gen_random_uuid(),
 model_id uuid references public.invitation_models(id) on delete set null,
 customer_id uuid references auth.users(id) on delete set null,
 title text not null,
 slug text not null unique,
 content jsonb not null default '{}'::jsonb,
 status text not null default 'draft' check(status in ('draft','active','inactive','archived')),
 expires_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists customer_invitations_customer_idx on public.customer_invitations(customer_id);
alter table public.customer_invitations enable row level security;
create policy "public sees active invitation pages" on public.customer_invitations
 for select to anon, authenticated using(status='active' and (expires_at is null or expires_at > now()));
create policy "owner manages invitation instances" on public.customer_invitations
 for all to authenticated
 using(public.has_role((select auth.uid()),'owner'))
 with check(public.has_role((select auth.uid()),'owner'));
-- The public renderer must whitelist fields and must never expose private guest lists or customer contact details.
-- A separate private table is required for RSVP and other confidential information.
