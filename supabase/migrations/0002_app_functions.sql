-- Buya step 2 schema: run ONCE in the Supabase SQL Editor (after 0001_init.sql).

-- Demo data flag (lets us load/remove simulated customers cleanly)
alter table public.customers add column if not exists is_demo boolean not null default false;

-- Same view as before plus is_demo at the end
create or replace view public.customer_stats with (security_invoker = true) as
select
  c.id, c.business_id, c.name, c.phone, c.joined_at,
  coalesce(s.n, 0)  as total_stamps,
  coalesce(r.n, 0)  as total_redemptions,
  greatest(coalesce(s.n, 0) - coalesce(r.n, 0) * b.stamps_required, 0) as balance,
  s.last_visit,
  c.is_demo
from public.customers c
join public.businesses b on b.id = c.business_id
left join (select customer_id, count(*) n, max(created_at) last_visit
           from public.stamp_events group by customer_id) s on s.customer_id = c.id
left join (select customer_id, count(*) n
           from public.redemptions group by customer_id) r on r.customer_id = c.id;

---------------------------------------------------------------------------
-- PUBLIC (customer, no login). Narrow functions only: customers never get
-- direct table access.
---------------------------------------------------------------------------
create or replace function public.get_business_public(p_business_id uuid)
returns table (id uuid, name text, stamps_required int, reward_text text)
language sql stable security definer set search_path = public as $$
  select b.id, b.name, b.stamps_required, b.reward_text
  from public.businesses b where b.id = p_business_id;
$$;

-- Joining only creates the customer. It never awards a stamp.
create or replace function public.join_programme(p_business_id uuid, p_name text, p_phone text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_name  text := btrim(coalesce(p_name, ''));
  v_phone text := regexp_replace(coalesce(p_phone, ''), '[^0-9+]', '', 'g');
  v_id    uuid;
begin
  if not exists (select 1 from public.businesses where id = p_business_id) then
    raise exception 'This programme was not found.';
  end if;
  if length(v_name) < 2 or length(v_name) > 80 then
    raise exception 'Please enter your name.';
  end if;
  if length(v_phone) < 9 or length(v_phone) > 16 then
    raise exception 'Please enter a valid phone number.';
  end if;

  select c.id into v_id from public.customers c
   where c.business_id = p_business_id and c.phone = v_phone;
  if v_id is null then
    insert into public.customers (business_id, name, phone)
    values (p_business_id, v_name, v_phone) returning id into v_id;
  end if;
  return v_id; -- the unguessable id is the customer's bookmarkable card link
end $$;

create or replace function public.get_card(p_customer_id uuid)
returns table (customer_name text, business_name text, stamps_required int,
               reward_text text, balance int, rewards_earned int)
language sql stable security definer set search_path = public as $$
  select c.name, b.name, b.stamps_required, b.reward_text,
         cs.balance::int, cs.total_redemptions::int
  from public.customers c
  join public.businesses b on b.id = c.business_id
  join public.customer_stats cs on cs.id = c.id
  where c.id = p_customer_id;
$$;

---------------------------------------------------------------------------
-- OWNER actions (must be logged in and own the business)
---------------------------------------------------------------------------
create or replace function public.award_stamp(p_customer_id uuid)
returns int language plpgsql security definer set search_path = public as $$
declare v_business uuid; v_req int; v_bal int;
begin
  select c.business_id, b.stamps_required into v_business, v_req
    from public.customers c join public.businesses b on b.id = c.business_id
   where c.id = p_customer_id and b.owner_id = auth.uid()
   for update of c;                       -- serialises concurrent clicks
  if v_business is null then raise exception 'Customer not found.'; end if;

  select cs.balance into v_bal from public.customer_stats cs where cs.id = p_customer_id;
  if v_bal >= v_req then raise exception 'This card is full. Redeem the reward first.'; end if;

  insert into public.stamp_events (customer_id, business_id) values (p_customer_id, v_business);
  return v_bal + 1;
end $$;

create or replace function public.redeem_reward(p_customer_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_business uuid; v_req int; v_bal int;
begin
  select c.business_id, b.stamps_required into v_business, v_req
    from public.customers c join public.businesses b on b.id = c.business_id
   where c.id = p_customer_id and b.owner_id = auth.uid()
   for update of c;
  if v_business is null then raise exception 'Customer not found.'; end if;

  select cs.balance into v_bal from public.customer_stats cs where cs.id = p_customer_id;
  if v_bal < v_req then raise exception 'Not enough stamps to redeem yet.'; end if;

  insert into public.redemptions (customer_id, business_id) values (p_customer_id, v_business);
end $$;

---------------------------------------------------------------------------
-- ANALYTICS (runs as the owner, so RLS applies)
---------------------------------------------------------------------------
create or replace function public.dashboard_stats()
returns table (enrolled int, returned_30d int, redeemed int, inactive int)
language sql stable security invoker set search_path = public as $$
  with biz as (select id from public.businesses where owner_id = auth.uid()),
  ranked as (
    select se.customer_id, se.created_at,
           row_number() over (partition by se.customer_id order by se.created_at) rn
    from public.stamp_events se join biz on biz.id = se.business_id),
  pairs as (
    select customer_id,
           max(created_at) filter (where rn = 1) first_visit,
           max(created_at) filter (where rn = 2) second_visit
    from ranked group by customer_id)
  select
    (select count(*) from public.customers c join biz on biz.id = c.business_id)::int,
    (select count(*) from pairs where second_visit is not null
        and second_visit <= first_visit + interval '30 days')::int,
    (select count(*) from public.redemptions r join biz on biz.id = r.business_id)::int,
    (select count(*) from public.customer_stats cs join biz on biz.id = cs.business_id
        where coalesce(cs.last_visit, cs.joined_at) < now() - interval '45 days')::int;
$$;

---------------------------------------------------------------------------
-- DEMO DATA: ~40 simulated customers with varied visit patterns
---------------------------------------------------------------------------
create or replace function public.seed_demo_data()
returns int language plpgsql security definer set search_path = public as $$
declare
  v_biz uuid; v_req int; i int; k int; n int; r int;
  gap double precision; last_d double precision;
  v_cust uuid; v_joined timestamptz; v_times timestamptz[];
  firsts text[] := array['Thabo','Lerato','Sipho','Naledi','Ayanda','Pieter','Johan','Zanele','Mandla','Riaan',
    'Kagiso','Thando','Bongani','Chantelle','Willem','Nomsa','Themba','Lwazi','Jaco','Fatima',
    'Yusuf','Imran','Zainab','Devon','Keenan','Aphiwe','Luyanda','Siya','Tumelo','Gareth',
    'Brandon','Mogamat','Ricardo','Neo','Khaya','Dumisani','Anele','Ruan','Tshepo','Sizwe'];
  lasts text[] := array['Nkosi','Dlamini','van der Merwe','Naidoo','Pretorius','Mokoena','Botha','Khumalo','Adams','Jacobs',
    'Petersen','Molefe','Ndlovu','Smith','Williams','Abrahams','Cele','Mthembu','Fourie','Sithole'];
begin
  select b.id, b.stamps_required into v_biz, v_req from public.businesses b where b.owner_id = auth.uid();
  if v_biz is null then raise exception 'Create your programme first.'; end if;

  delete from public.customers where business_id = v_biz and is_demo;

  for i in 1..40 loop
    if    i <= 8  then n := 5 + (i % 6); gap := 12 + random()*8;  last_d := 1 + random()*11;   -- regulars
    elsif i <= 20 then n := 2 + (i % 3); gap := 7 + random()*8;   last_d := random()*25;       -- recent, came back
    elsif i <= 30 then n := 1;           gap := 0;                last_d := 10 + random()*100;  -- one-and-done
    elsif i <= 36 then n := 3 + (i % 3); gap := 14 + random()*11; last_d := 50 + random()*45;  -- lapsed regulars
    else               n := 0;           gap := 0;                last_d := 3 + random()*57;    -- joined, never stamped
    end if;

    v_times := array[]::timestamptz[];
    for k in 1..n loop
      v_times := v_times || (now() - (last_d + (n - k) * gap) * interval '1 day');
    end loop;

    if n > 0 then v_joined := v_times[1] - random() * interval '2 days';
    else v_joined := now() - last_d * interval '1 day';
    end if;

    insert into public.customers (business_id, name, phone, joined_at, is_demo)
    values (v_biz, firsts[i] || ' ' || lasts[1 + ((i * 7) % 20)],
            '+27 71 555 ' || lpad((100 + i)::text, 4, '0'), v_joined, true)
    returning id into v_cust;

    for k in 1..n loop
      insert into public.stamp_events (customer_id, business_id, created_at) values (v_cust, v_biz, v_times[k]);
    end loop;

    if n > 0 then
      -- even i: cards fully redeemed; odd i: latest card in progress or full
      r := case when i % 2 = 0 then n / v_req else (n - 1) / v_req end;
      for k in 1..r loop
        insert into public.redemptions (customer_id, business_id, created_at)
        values (v_cust, v_biz, least(v_times[k * v_req] + interval '1 hour', now()));
      end loop;
    end if;
  end loop;
  return 40;
end $$;

create or replace function public.remove_demo_data()
returns void language sql security definer set search_path = public as $$
  delete from public.customers
  where is_demo and business_id in (select id from public.businesses where owner_id = auth.uid());
$$;

---------------------------------------------------------------------------
-- Permissions
---------------------------------------------------------------------------
revoke all on function public.get_business_public(uuid), public.join_programme(uuid, text, text),
  public.get_card(uuid), public.award_stamp(uuid), public.redeem_reward(uuid),
  public.dashboard_stats(), public.seed_demo_data(), public.remove_demo_data() from public;

grant execute on function public.get_business_public(uuid), public.join_programme(uuid, text, text),
  public.get_card(uuid) to anon, authenticated;
grant execute on function public.award_stamp(uuid), public.redeem_reward(uuid),
  public.dashboard_stats(), public.seed_demo_data(), public.remove_demo_data() to authenticated;
