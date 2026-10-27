-- Paid plans (billing branch).
--   events.plan: 'free' (200 photos) or 'pass' (bought once for this event, 3,000).
--   host_billing: a host's Pro subscription (every event up to 5,000).
--   payments: a record of each completed checkout.
-- Only the Stripe webhook (service role) writes billing rows. Hosts can read their own.
-- Events that already exist are treated as passes: the beta hosts keep what they have.

alter table public.events
  add column if not exists plan text not null default 'free' check (plan in ('free', 'pass')),
  add column if not exists paid_at timestamptz;

update public.events set plan = 'pass' where plan = 'free' and created_at < now();

create table if not exists public.host_billing (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  subscription_status text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  event_id uuid references public.events (id) on delete set null,
  kind text not null check (kind in ('pass', 'pro')),
  stripe_session_id text not null unique,
  amount integer not null,
  currency text not null,
  created_at timestamptz not null default now()
);

alter table public.host_billing enable row level security;
alter table public.payments enable row level security;

create policy "read own billing" on public.host_billing for select using (user_id = auth.uid());
create policy "read own payments" on public.payments for select using (user_id = auth.uid());

grant select on public.host_billing, public.payments to authenticated;

-- Hosts must not be able to mark their own event as paid.
create or replace function public.protect_event_plan()
returns trigger language plpgsql as $$
begin
  if (new.plan is distinct from old.plan or new.paid_at is distinct from old.paid_at)
     and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Plans change through checkout only';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_event_plan on public.events;
create trigger protect_event_plan before update on public.events
  for each row execute function public.protect_event_plan();

-- New events always start on the free plan, whatever the insert says.
create or replace function public.new_event_is_free()
returns trigger language plpgsql as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    new.plan := 'free';
    new.paid_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists new_event_is_free on public.events;
create trigger new_event_is_free before insert on public.events
  for each row execute function public.new_event_is_free();

-- What an event's hosts need to know about its limit: photos used, the event's plan,
-- and its owner's plan (co-hosts can't read the owner's billing row directly).
create or replace function public.event_allowance(p_event uuid)
returns table (photos bigint, event_plan text, host_plan text)
language sql stable security definer set search_path = public as $$
  select
    (select count(*) from photos p where p.event_id = e.id and p.status <> 'failed'),
    e.plan,
    coalesce((select b.plan from host_billing b
              where b.user_id = e.owner_id
                and b.plan = 'pro'
                and coalesce(b.subscription_status, 'active') in ('active', 'trialing', 'past_due')), 'free')
  from events e
  where e.id = p_event and is_event_host(p_event);
$$;

revoke execute on function public.event_allowance(uuid) from public, anon;
grant execute on function public.event_allowance(uuid) to authenticated;
