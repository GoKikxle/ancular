-- Open Ancular to every host. Waitlist / host_access gating is retired.
-- Everyone (existing waitlisted or gated accounts included) lands on Free.
-- Free: 3 live events per calendar month (UTC). Live = status 'active' (not archived),
-- created in the current month. Pro: unlimited events. Event pass only raises photo caps.
-- Keep the "3" in sync with FREE_LIVE_EVENTS_PER_MONTH in lib/plans.ts.

-- Existing accounts are no longer stuck pending / declined.
update public.host_access set status = 'approved' where status is distinct from 'approved';

-- Ensure every auth user has a Free billing row (do not overwrite Pro).
insert into public.host_billing (user_id, plan)
select u.id, 'free'
from auth.users u
on conflict (user_id) do nothing;

-- Anyone signed in can create their own events (guests still need an invite code).
drop policy if exists "approved hosts create their own events" on public.events;
drop policy if exists "users create their own events" on public.events;
create policy "users create their own events" on public.events
  for insert with check (owner_id = auth.uid());

-- New signups: approved host + Free plan row.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.host_access (user_id, status)
  values (new.id, 'approved')
  on conflict (user_id) do update set status = 'approved';

  insert into public.host_billing (user_id, plan)
  values (new.id, 'free')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- How many live events this host has created in the current UTC month.
create or replace function public.live_events_this_month(p_user uuid default auth.uid())
returns bigint
language sql
stable
security invoker
set search_path = public
as $$
  select count(*)::bigint
  from public.events e
  where e.owner_id = p_user
    and e.status = 'active'
    and e.created_at >= date_trunc('month', timezone('utc', now()))
    and e.created_at < date_trunc('month', timezone('utc', now())) + interval '1 month';
$$;

revoke execute on function public.live_events_this_month(uuid) from public, anon;
grant execute on function public.live_events_this_month(uuid) to authenticated;

-- Block a 4th live event this month for Free hosts (Pro is unlimited).
create or replace function public.enforce_free_live_event_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pro boolean;
  v_count bigint;
begin
  if new.status is distinct from 'active' then
    return new;
  end if;

  select exists (
    select 1 from public.host_billing b
    where b.user_id = new.owner_id
      and b.plan = 'pro'
      and coalesce(b.subscription_status, 'active') in ('active', 'trialing', 'past_due')
  ) into v_pro;

  if v_pro then
    return new;
  end if;

  select count(*) into v_count
  from public.events e
  where e.owner_id = new.owner_id
    and e.status = 'active'
    and e.created_at >= date_trunc('month', timezone('utc', now()))
    and e.created_at < date_trunc('month', timezone('utc', now())) + interval '1 month'
    and e.id is distinct from new.id;

  if v_count >= 3 then
    raise exception 'Free covers 3 live events this month. Go Pro for unlimited events.';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_free_live_event_limit on public.events;
create trigger enforce_free_live_event_limit
  before insert or update of status on public.events
  for each row execute function public.enforce_free_live_event_limit();
