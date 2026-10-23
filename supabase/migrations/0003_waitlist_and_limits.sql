-- Host waitlist and beta storage helpers.
-- Guests are not waitlisted. Only people who create events need host_access.

create table public.host_access (
  user_id uuid primary key references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  created_at timestamptz not null default now()
);

create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  email text not null check (char_length(email) between 3 and 200),
  role text not null check (role in ('photographer', 'church', 'other')),
  note text check (note is null or char_length(note) <= 500),
  created_at timestamptz not null default now()
);

alter table public.host_access enable row level security;
alter table public.waitlist enable row level security;

create policy "read own host access" on public.host_access
  for select using (user_id = auth.uid());

create policy "anyone can join the waitlist" on public.waitlist
  for insert to anon, authenticated
  with check (char_length(name) between 2 and 80 and char_length(email) between 3 and 200);

grant select on public.host_access to authenticated;
grant insert on public.waitlist to anon, authenticated;

-- New accounts wait. People who already own an event are approved.
insert into public.host_access (user_id, status)
select id, 'pending' from auth.users
on conflict (user_id) do nothing;

update public.host_access h
set status = 'approved'
where exists (select 1 from public.events e where e.owner_id = h.user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.host_access (user_id, status)
  values (new.id, 'pending')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop policy if exists "users create their own events" on public.events;
create policy "approved hosts create their own events" on public.events
  for insert with check (
    owner_id = auth.uid()
    and exists (
      select 1 from public.host_access h
      where h.user_id = auth.uid() and h.status = 'approved'
    )
  );

create or replace function public.host_storage_usage()
returns table (photos bigint, bytes bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select count(p.id)::bigint, coalesce(sum(p.bytes), 0)::bigint
  from public.photos p
  join public.events e on e.id = p.event_id
  where e.owner_id = auth.uid();
$$;

grant execute on function public.host_storage_usage() to authenticated;

-- Clears this person's search results and withdraws consent on every event.
-- Guest selfies are not stored. This does not delete photos or other people's face codes.
create or replace function public.clear_my_search_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Sign in again';
  end if;
  update consents set withdrawn_at = now()
  where user_id = auth.uid() and withdrawn_at is null;
  delete from photo_matches where user_id = auth.uid();
end;
$$;

grant execute on function public.clear_my_search_data() to authenticated;
