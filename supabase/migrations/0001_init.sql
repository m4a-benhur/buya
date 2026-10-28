-- Buya: minimal schema + Row Level Security
create extension if not exists pgcrypto;

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade, -- one programme per owner
  name text not null,
  stamps_required int not null default 5 check (stamps_required between 2 and 20),
  reward_text text not null default 'Free haircut',
  created_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  phone text not null,
  joined_at timestamptz not null default now(),
  unique (business_id, phone)
);

create table public.stamp_events (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.redemptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index on public.customers (business_id);
create index on public.stamp_events (customer_id, created_at);
create index on public.stamp_events (business_id, created_at);
create index on public.redemptions (customer_id);

-- Row Level Security: owners only see their own business's data.
alter table public.businesses   enable row level security;
alter table public.customers    enable row level security;
alter table public.stamp_events enable row level security;
alter table public.redemptions  enable row level security;

create policy "owner manages own business" on public.businesses
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create or replace function public.owns_business(b uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.businesses where id = b and owner_id = auth.uid());
$$;

create policy "owner manages own customers" on public.customers
  for all using (public.owns_business(business_id)) with check (public.owns_business(business_id));
create policy "owner manages own stamps" on public.stamp_events
  for all using (public.owns_business(business_id)) with check (public.owns_business(business_id));
create policy "owner manages own redemptions" on public.redemptions
  for all using (public.owns_business(business_id)) with check (public.owns_business(business_id));

-- Derived balance: stamps earned minus stamps spent on completed redemptions.
create or replace view public.customer_stats with (security_invoker = true) as
select
  c.id, c.business_id, c.name, c.phone, c.joined_at,
  coalesce(s.n, 0)  as total_stamps,
  coalesce(r.n, 0)  as total_redemptions,
  greatest(coalesce(s.n, 0) - coalesce(r.n, 0) * b.stamps_required, 0) as balance,
  s.last_visit
from public.customers c
join public.businesses b on b.id = c.business_id
left join (select customer_id, count(*) n, max(created_at) last_visit
           from public.stamp_events group by customer_id) s on s.customer_id = c.id
left join (select customer_id, count(*) n
           from public.redemptions group by customer_id) r on r.customer_id = c.id;

-- NOTE: anonymous customers get no direct table access. Step 3 adds narrow
-- SECURITY DEFINER functions (join_programme, get_card) for the public flow.
