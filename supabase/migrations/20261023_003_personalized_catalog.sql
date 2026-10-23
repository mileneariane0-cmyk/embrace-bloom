-- Personalizê — expandable personalized-products catalog.
-- Review against the active Lovable Cloud schema before applying.
-- This migration is additive; it does not delete or replace existing data.

create table if not exists public.personalized_product_categories (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 slug text not null unique,
 description text,
 cover_path text,
 banner_path text,
 parent_id uuid references public.personalized_product_categories(id) on delete set null,
 display_order integer not null default 0,
 active boolean not null default true,
 created_at timestamptz not null default now()
);

create table if not exists public.personalized_products (
 id uuid primary key default gen_random_uuid(),
 category_id uuid references public.personalized_product_categories(id) on delete set null,
 name text not null,
 slug text not null unique,
 description text not null default '',
 product_type text not null default 'physical' check(product_type in ('physical','digital','service')),
 price_cents integer not null check(price_cents >= 0),
 sale_price_cents integer check(sale_price_cents is null or (sale_price_cents >= 0 and sale_price_cents <= price_cents)),
 minimum_quantity integer not null default 1 check(minimum_quantity > 0),
 production_days integer check(production_days is null or production_days >= 0),
 cover_path text,
 media jsonb not null default '[]'::jsonb check(jsonb_typeof(media)='array'),
 variants jsonb not null default '[]'::jsonb check(jsonb_typeof(variants)='array'),
 customization_fields jsonb not null default '[]'::jsonb check(jsonb_typeof(customization_fields)='array'),
 available boolean not null default true,
 featured boolean not null default false,
 quote_enabled boolean not null default true,
 status text not null default 'draft' check(status in ('draft','published','archived')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create index if not exists idx_personalized_products_category on public.personalized_products(category_id);
create index if not exists idx_personalized_products_status on public.personalized_products(status);

alter table public.personalized_product_categories enable row level security;
alter table public.personalized_products enable row level security;

create policy "public active personalized categories" on public.personalized_product_categories
 for select to anon, authenticated using(active);
create policy "public published personalized products" on public.personalized_products
 for select to anon, authenticated using(status='published' and available);

-- Existing admin_members roles remain unchanged. Do not provision or reset owner.
create policy "admin manages personalized categories" on public.personalized_product_categories
 for all to authenticated
 using(exists(select 1 from public.admin_members a where a.user_id=(select auth.uid()) and a.role in ('owner','editor')))
 with check(exists(select 1 from public.admin_members a where a.user_id=(select auth.uid()) and a.role in ('owner','editor')));

create policy "admin manages personalized products" on public.personalized_products
 for all to authenticated
 using(exists(select 1 from public.admin_members a where a.user_id=(select auth.uid()) and a.role in ('owner','editor')))
 with check(exists(select 1 from public.admin_members a where a.user_id=(select auth.uid()) and a.role in ('owner','editor')));

-- Customer prices must be recalculated on the server at checkout.
-- Product media must be validated before upload and stored in appropriate Cloud buckets.
