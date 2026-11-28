-- "Your photos are ready" email to guests who joined an event.
-- Sent once per event: when the host stops holding photos, or presses "Email guests".

begin;

alter table public.events add column if not exists photos_notified_at timestamptz;
alter table public.event_members add column if not exists email_opt_out boolean not null default false;

-- Who to email: approved guests (not hosts) who haven't opted out. Service role only.
create or replace function public.event_notify_recipients(p_event uuid)
returns table (user_id uuid, email text, display_name text)
language sql stable security definer set search_path = public as $$
  select m.user_id, u.email, m.display_name
  from event_members m
  join auth.users u on u.id = m.user_id
  where m.event_id = p_event and m.status = 'approved' and m.role = 'guest'
    and not m.email_opt_out and u.email is not null and u.email_confirmed_at is not null;
$$;
revoke execute on function public.event_notify_recipients(uuid) from public, anon, authenticated;

commit;
