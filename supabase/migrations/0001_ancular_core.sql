-- Ancular: invite-only event photo finder
-- Run once in the Supabase SQL editor (or with `supabase db push`).
--
-- Privacy model in one paragraph:
--   * Hosts upload photos. Face "codes" (128 numbers per face) are computed in the
--     host's browser and stored in public.faces. No face images are stored separately.
--   * Guests compute a face code from their selfie in their own browser. The selfie
--     never leaves the phone; the code is sent to match_my_face(), used once to search,
--     and never stored.
--   * Searching requires: an approved membership AND an active, recorded consent.
--   * Face codes for an event are deleted automatically after the event's retention period.

create extension if not exists vector;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  host_name text check (char_length(host_name) <= 120),
  kind text not null default 'other'
    check (kind in ('wedding', 'church', 'party', 'birthday', 'corporate', 'other')),
  event_date date,
  venue text check (char_length(venue) <= 160),
  invite_code text not null unique
    default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
  join_mode text not null default 'approval' check (join_mode in ('open', 'approval')),
  face_retention_days int not null default 30 check (face_retention_days between 1 and 365),
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.event_members (
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'guest' check (role in ('host', 'guest')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  display_name text check (char_length(display_name) <= 80),
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  primary key (event_id, user_id)
);

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  uploaded_by uuid not null references auth.users (id) on delete cascade,
  original_name text,
  width int,
  height int,
  bytes bigint,
  face_count int not null default 0,
  status text not null default 'uploading' check (status in ('uploading', 'ready', 'failed')),
  created_at timestamptz not null default now(),
  indexed_at timestamptz
);
create index photos_event_idx on public.photos (event_id, created_at);

create table public.faces (
  id bigint generated always as identity primary key,
  event_id uuid not null references public.events (id) on delete cascade,
  photo_id uuid not null references public.photos (id) on delete cascade,
  embedding vector(128) not null,
  -- Face box as fractions of the image: {"x":0.1,"y":0.2,"w":0.05,"h":0.07}
  box jsonb,
  created_at timestamptz not null default now()
);
create index faces_event_idx on public.faces (event_id);
create index faces_photo_idx on public.faces (photo_id);

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  purpose text not null default 'face_matching',
  wording_version text not null,
  granted_at timestamptz not null default now(),
  withdrawn_at timestamptz
);
create unique index consents_one_active
  on public.consents (user_id, event_id, purpose) where withdrawn_at is null;

create table public.photo_matches (
  user_id uuid not null references auth.users (id) on delete cascade,
  photo_id uuid not null references public.photos (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  distance real not null,
  confidence text not null check (confidence in ('sure', 'maybe')),
  confirmed boolean not null default false,
  rejected boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (user_id, photo_id)
);
create index photo_matches_event_user_idx on public.photo_matches (event_id, user_id);

-- ---------------------------------------------------------------------------
-- Helper functions (security definer so RLS policies can call them safely)
-- ---------------------------------------------------------------------------

create or replace function public.is_event_host(p_event uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from event_members
    where event_id = p_event and user_id = auth.uid() and role = 'host' and status = 'approved'
  );
$$;

create or replace function public.is_approved_member(p_event uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from event_members
    where event_id = p_event and user_id = auth.uid() and status = 'approved'
  );
$$;

-- Any membership, including pending: lets guests see the event they asked to join.
create or replace function public.has_membership(p_event uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from event_members where event_id = p_event and user_id = auth.uid());
$$;

-- Owner becomes the approved host automatically.
create or replace function public.add_owner_as_host()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into event_members (event_id, user_id, role, status, decided_at)
  values (new.id, new.owner_id, 'host', 'approved', now())
  on conflict (event_id, user_id) do update set role = 'host', status = 'approved';
  return new;
end;
$$;

create trigger events_add_owner after insert on public.events
for each row execute function public.add_owner_as_host();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger events_touch before update on public.events
for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Guest-facing functions
-- ---------------------------------------------------------------------------

-- Minimal public details for the invite page. Never exposes photos or members.
create or replace function public.get_event_invite(p_code text)
returns table (id uuid, name text, host_name text, kind text, event_date date, join_mode text, status text)
language sql stable security definer set search_path = public as $$
  select e.id, e.name, e.host_name, e.kind, e.event_date, e.join_mode, e.status
  from events e
  where e.invite_code = upper(trim(p_code));
$$;

-- Ask to join an event with its invite code. Returns the membership status.
create or replace function public.join_event(p_code text, p_display_name text)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_event events%rowtype;
  v_status text;
begin
  if auth.uid() is null then
    raise exception 'Sign in to join this event';
  end if;

  select * into v_event from events where invite_code = upper(trim(p_code));
  if not found or v_event.status <> 'active' then
    raise exception 'This invite link is not valid';
  end if;

  v_status := case when v_event.join_mode = 'open' then 'approved' else 'pending' end;

  insert into event_members (event_id, user_id, role, status, display_name, decided_at)
  values (
    v_event.id, auth.uid(), 'guest', v_status, nullif(trim(p_display_name), ''),
    case when v_status = 'approved' then now() end
  )
  on conflict (event_id, user_id) do update
    set display_name = coalesce(excluded.display_name, event_members.display_name)
  returning status into v_status;

  return v_status;
end;
$$;

create or replace function public.grant_face_consent(p_event uuid, p_wording_version text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_approved_member(p_event) then
    raise exception 'You are not part of this event yet';
  end if;
  insert into consents (user_id, event_id, wording_version)
  values (auth.uid(), p_event, p_wording_version)
  on conflict (user_id, event_id, purpose) where withdrawn_at is null do nothing;
end;
$$;

-- Withdrawing consent also deletes the person's match results for the event.
create or replace function public.withdraw_face_consent(p_event uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update consents set withdrawn_at = now()
  where user_id = auth.uid() and event_id = p_event and withdrawn_at is null;
  delete from photo_matches where user_id = auth.uid() and event_id = p_event;
end;
$$;

-- Search an event with a face code computed on the guest's phone.
-- The code is used for this query only and is not stored.
create or replace function public.match_my_face(
  p_event uuid,
  p_embedding vector(128),
  p_sure numeric default 0.45,
  p_maybe numeric default 0.55
)
returns table (photo_id uuid, distance real, confidence text)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
declare
  v_event events%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Sign in to search';
  end if;
  if not is_approved_member(p_event) then
    raise exception 'You are not part of this event yet';
  end if;
  if not exists (
    select 1 from consents
    where user_id = auth.uid() and event_id = p_event and withdrawn_at is null
  ) then
    raise exception 'Agree to face matching before searching';
  end if;

  select * into v_event from events where id = p_event;
  if v_event.status <> 'active' then
    raise exception 'This event is closed';
  end if;

  -- Keep earlier confirmations and rejections; refresh everything else.
  delete from photo_matches pm
  where pm.user_id = auth.uid() and pm.event_id = p_event
    and not pm.confirmed and not pm.rejected;

  insert into photo_matches (user_id, photo_id, event_id, distance, confidence)
  select auth.uid(), best.photo_id, p_event, best.d,
         case when best.d <= p_sure then 'sure' else 'maybe' end
  from (
    select f.photo_id, min(f.embedding <-> p_embedding)::real as d
    from faces f
    where f.event_id = p_event
    group by f.photo_id
  ) best
  where best.d <= p_maybe
  on conflict (user_id, photo_id) do nothing;

  return query
    select pm.photo_id, pm.distance, pm.confidence
    from photo_matches pm
    where pm.user_id = auth.uid() and pm.event_id = p_event and not pm.rejected
    order by pm.distance;
end;
$$;

-- Delete face codes for events past their retention period.
-- Schedule daily with pg_cron (Database > Extensions > pg_cron):
--   select cron.schedule('ancular-purge-faces', '15 3 * * *', 'select public.purge_expired_face_data()');
create or replace function public.purge_expired_face_data()
returns int language plpgsql security definer set search_path = public as $$
declare
  v_count int;
begin
  delete from faces f
  using events e
  where f.event_id = e.id
    and greatest(coalesce(e.event_date::timestamptz, e.created_at), f.created_at)
        + make_interval(days => e.face_retention_days) < now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.events enable row level security;
alter table public.event_members enable row level security;
alter table public.photos enable row level security;
alter table public.faces enable row level security;
alter table public.consents enable row level security;
alter table public.photo_matches enable row level security;

-- events
create policy "members can view their events" on public.events
  for select using (has_membership(id) or owner_id = auth.uid());
create policy "users create their own events" on public.events
  for insert with check (owner_id = auth.uid());
create policy "hosts update events" on public.events
  for update using (is_event_host(id)) with check (is_event_host(id));
create policy "owners delete events" on public.events
  for delete using (owner_id = auth.uid());

-- event_members (joining happens through join_event())
create policy "see own membership or as host" on public.event_members
  for select using (user_id = auth.uid() or is_event_host(event_id));
create policy "hosts decide on guests" on public.event_members
  for update using (is_event_host(event_id)) with check (is_event_host(event_id));
create policy "hosts remove guests, guests leave" on public.event_members
  for delete using (
    (is_event_host(event_id) and role = 'guest') or (user_id = auth.uid() and role = 'guest')
  );

-- photos: hosts see all; guests see only photos they matched
create policy "hosts view photos" on public.photos
  for select using (is_event_host(event_id));
create policy "guests view their matched photos" on public.photos
  for select using (
    exists (
      select 1 from photo_matches pm
      where pm.photo_id = photos.id and pm.user_id = auth.uid() and not pm.rejected
    )
  );
create policy "hosts add photos" on public.photos
  for insert with check (is_event_host(event_id) and uploaded_by = auth.uid());
create policy "hosts update photos" on public.photos
  for update using (is_event_host(event_id));
create policy "hosts delete photos" on public.photos
  for delete using (is_event_host(event_id));

-- faces: hosts only. Guests search through match_my_face().
create policy "hosts view faces" on public.faces
  for select using (is_event_host(event_id));
create policy "hosts add faces" on public.faces
  for insert with check (is_event_host(event_id));
create policy "hosts delete faces" on public.faces
  for delete using (is_event_host(event_id));

-- consents: people see their own; hosts can see the record for their event
create policy "see own consents" on public.consents
  for select using (user_id = auth.uid() or is_event_host(event_id));

-- photo_matches: private to each guest
create policy "see own matches" on public.photo_matches
  for select using (user_id = auth.uid());
create policy "confirm or reject own matches" on public.photo_matches
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "clear own matches" on public.photo_matches
  for delete using (user_id = auth.uid());

grant execute on function public.get_event_invite(text) to anon, authenticated;
grant execute on function public.join_event(text, text) to authenticated;
grant execute on function public.grant_face_consent(uuid, text) to authenticated;
grant execute on function public.withdraw_face_consent(uuid) to authenticated;
grant execute on function public.match_my_face(uuid, vector, numeric, numeric) to authenticated;
revoke execute on function public.purge_expired_face_data() from anon, authenticated;

-- New projects (from May 2026) do not grant Data API access on new tables.
-- RLS still decides which rows a signed-in user can touch. anon gets no table access.
grant select, insert, update, delete on
  public.events,
  public.event_members,
  public.photos,
  public.faces,
  public.consents,
  public.photo_matches
to authenticated;

-- faces.id is an identity column; inserts need the sequence as well as the table.
grant usage, select on all sequences in schema public to authenticated;

-- Policies call these. The caller still needs execute, even though they are security definer.
grant execute on function public.is_event_host(uuid) to authenticated;
grant execute on function public.is_approved_member(uuid) to authenticated;
grant execute on function public.has_membership(uuid) to authenticated;
