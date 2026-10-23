-- Personalizê: customer domain schema (apply after initial migration).
-- Supabase Auth is responsible for email uniqueness, passwords and verification.
create table if not exists public.customer_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null,
 phone text,
 created_at timestamptz not null default now()
);
alter table public.customer_profiles enable row level security;
create policy "customer reads own profile" on public.customer_profiles for select to authenticated using (user_id=(select auth.uid()));
create policy "customer inserts own profile" on public.customer_profiles for insert to authenticated with check (user_id=(select auth.uid()));
create policy "customer updates own profile" on public.customer_profiles for update to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));

create table if not exists public.shopping_cart_items (
 id uuid primary key default gen_random_uuid(),
 customer_id uuid not null references auth.users(id) on delete cascade,
 model_id uuid not null references public.invitation_models(id),
 quantity integer not null default 1 check (quantity between 1 and 99),
 created_at timestamptz not null default now(),
 unique(customer_id,model_id)
);
alter table public.shopping_cart_items enable row level security;
create policy "customer reads own cart" on public.shopping_cart_items for select to authenticated using (customer_id=(select auth.uid()));
create policy "customer adds own cart items" on public.shopping_cart_items for insert to authenticated with check (customer_id=(select auth.uid()) and exists(select 1 from public.invitation_models m where m.id=model_id and m.status='published'));
create policy "customer updates own cart items" on public.shopping_cart_items for update to authenticated using (customer_id=(select auth.uid())) with check (customer_id=(select auth.uid()));
create policy "customer deletes own cart items" on public.shopping_cart_items for delete to authenticated using (customer_id=(select auth.uid()));

create table if not exists public.quote_requests (
 id uuid primary key default gen_random_uuid(),
 customer_id uuid references auth.users(id) on delete set null,
 full_name text not null,
 email text not null,
 phone text not null,
 product_type text not null,
 event_type text,
 desired_date date,
 quantity integer check(quantity is null or quantity>0),
 description text not null,
 notes text,
 status text not null default 'requested' check(status in ('requested','reviewing','quoted','approved','rejected','converted')),
 amount_cents integer check(amount_cents is null or amount_cents>=0),
 created_at timestamptz not null default now()
);
alter table public.quote_requests enable row level security;
create policy "customer reads own quotes" on public.quote_requests for select to authenticated using(customer_id=(select auth.uid()));
-- Quote creation must happen through a validated server endpoint with rate limits,
-- which binds customer_id to the session and returns a server-generated protocol.
-- Do not grant direct INSERT/UPDATE/DELETE privileges to clients.

create table if not exists public.customer_orders (
 id uuid primary key default gen_random_uuid(),
 customer_id uuid not null references auth.users(id),
 total_cents integer not null check(total_cents>=0),
 payment_status text not null default 'pending' check(payment_status in ('pending','paid','failed','refunded')),
 production_status text not null default 'awaiting_payment',
 created_at timestamptz not null default now()
);
alter table public.customer_orders enable row level security;
create policy "customer reads own orders" on public.customer_orders for select to authenticated using(customer_id=(select auth.uid()));
-- Orders and prices are created and updated only by trusted server actions.
