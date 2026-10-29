-- Run ONCE in the Supabase SQL Editor (after 0002). Powers the weekly visits chart.
create or replace function public.weekly_visits(p_weeks int default 8)
returns table (week_start date, visits int)
language sql stable security invoker set search_path = public as $$
  with biz as (select id from public.businesses where owner_id = auth.uid()),
  weeks as (
    select (date_trunc('week', now() at time zone 'Africa/Johannesburg')::date - (g * 7)) as ws
    from generate_series(0, p_weeks - 1) g)
  select w.ws,
    (select count(*) from public.stamp_events se join biz on biz.id = se.business_id
      where (se.created_at at time zone 'Africa/Johannesburg')::date >= w.ws
        and (se.created_at at time zone 'Africa/Johannesburg')::date <  w.ws + 7)::int
  from weeks w order by w.ws;
$$;
revoke all on function public.weekly_visits(int) from public;
grant execute on function public.weekly_visits(int) to authenticated;
notify pgrst, 'reload schema';
