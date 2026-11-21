-- Owner dashboard (/admin).
-- 1. page_views: anonymous page-view counts. No cookies, no IP, nothing that identifies
--    a visitor: just the page, the referring site, the country and whether it started a visit.
-- 2. selfie_searches: one row per selfie search with how many photos it found. Never the
--    face codes; user_id is cleared if the account is deleted.
-- 3. admin_overview(): every number the dashboard shows, readable by the service role only.

create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  path text not null check (char_length(path) <= 200),
  referrer_host text check (char_length(referrer_host) <= 120),
  country text check (char_length(country) <= 2),
  is_entry boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists page_views_created_idx on public.page_views (created_at);
alter table public.page_views enable row level security; -- no policies: service role only

create table if not exists public.selfie_searches (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete set null,
  event_id uuid references public.events (id) on delete cascade,
  codes int not null,
  sure int not null default 0,
  maybe int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists selfie_searches_created_idx on public.selfie_searches (created_at);
alter table public.selfie_searches enable row level security; -- no policies: service role only

-- Same search as 0005, now also logging each search.
create or replace function public.find_my_photos(p_event uuid, p_codes text[])
returns table (photo_id uuid, distance real, confidence text, confirmed boolean)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
declare
  v_event events%rowtype;
  v_codes vector[];
  -- Thresholds per model. sure: added straight away. maybe: shown as "Is this you?".
  -- seed: close enough to use as an extra reference. expand: match to a reference.
  v_sure real;
  v_maybe real;
  v_seed real;
  v_expand real;
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
  if p_codes is null or cardinality(p_codes) = 0 or cardinality(p_codes) > 4 then
    raise exception 'Take a selfie to search';
  end if;

  select * into v_event from events where id = p_event;
  if v_event.status <> 'active' then
    raise exception 'This event is closed';
  end if;

  select array_agg(c::vector) into v_codes from unnest(p_codes) c;

  if v_event.face_model = 'v2' then
    -- Cosine distance. From docs/face-model-benchmark.md: no false matches up to 0.35
    -- on either test set; "maybe" up to 0.46 catches ~80% of side-angle pairs.
    v_sure := 0.32; v_maybe := 0.46; v_seed := 0.28; v_expand := 0.32;
  else
    v_sure := 0.45; v_maybe := 0.58; v_seed := 0.40; v_expand := 0.42;
  end if;

  -- Keep earlier confirmations and rejections; refresh everything else.
  delete from photo_matches pm
  where pm.user_id = auth.uid() and pm.event_id = p_event
    and not pm.confirmed and not pm.rejected;

  create temporary table if not exists _ancular_face_d (
    face_id bigint, photo_id uuid, d real, code text
  ) on commit drop;
  truncate _ancular_face_d;

  -- Distance from every face in the event to the closest selfie code.
  if v_event.face_model = 'v2' then
    insert into _ancular_face_d
    select f.id, f.photo_id,
           (select min(f.embedding_v2 <=> q) from unnest(v_codes) q)::real,
           f.embedding_v2::text
    from faces f
    where f.event_id = p_event and f.embedding_v2 is not null;
  else
    insert into _ancular_face_d
    select f.id, f.photo_id,
           (select min(f.embedding <-> q) from unnest(v_codes) q)::real,
           f.embedding::text
    from faces f
    where f.event_id = p_event and f.embedding is not null;
  end if;

  with nearest as (
    -- In each photo, the face nearest the selfie is the one that could be the guest.
    select distinct on (photo_id) face_id, photo_id, d, code
    from _ancular_face_d
    order by photo_id, d
  ),
  seeds as (
    (select n.code from nearest n where n.d <= v_seed order by n.d limit 20)
    union all
    (select n.code
     from nearest n
     join photo_matches pm
       on pm.photo_id = n.photo_id and pm.user_id = auth.uid() and pm.confirmed
     limit 20)
  ),
  expanded as (
    select fd.photo_id,
           min(case when v_event.face_model = 'v2'
                    then fd.code::vector <=> s.code::vector
                    else fd.code::vector <-> s.code::vector end)::real as d2
    from _ancular_face_d fd
    cross join seeds s
    group by fd.photo_id
  )
  insert into photo_matches (user_id, photo_id, event_id, distance, confidence)
  select auth.uid(), n.photo_id, p_event, n.d,
         case when n.d <= v_sure then 'sure' else 'maybe' end
  from nearest n
  left join expanded e on e.photo_id = n.photo_id
  where n.d <= v_maybe or e.d2 <= v_expand
  on conflict (user_id, photo_id) do nothing;

  -- Log the search for the owner dashboard: counts only, never the face codes.
  insert into selfie_searches (user_id, event_id, codes, sure, maybe)
  select auth.uid(), p_event, cardinality(p_codes),
         count(*) filter (where pm.confidence = 'sure'),
         count(*) filter (where pm.confidence = 'maybe')
  from photo_matches pm
  where pm.user_id = auth.uid() and pm.event_id = p_event and not pm.rejected;

  return query
    select pm.photo_id, pm.distance, pm.confidence, pm.confirmed
    from photo_matches pm
    where pm.user_id = auth.uid() and pm.event_id = p_event and not pm.rejected
    order by pm.distance;
end;
$$;

revoke execute on function public.find_my_photos(uuid, text[]) from public, anon;
grant execute on function public.find_my_photos(uuid, text[]) to authenticated;

create or replace function public.admin_overview(p_days int default 30)
returns jsonb
language sql stable security definer set search_path = public as $$
  with d as (
    select generate_series(
      (timezone('utc', now()))::date - (p_days - 1),
      (timezone('utc', now()))::date,
      interval '1 day')::date as day
  ),
  wk as (select now() - interval '7 days' as since)
  select jsonb_build_object(
    'generated_at', now(),
    'totals', jsonb_build_object(
      'users', (select count(*) from auth.users),
      'users_confirmed', (select count(*) from auth.users where email_confirmed_at is not null),
      'users_7d', (select count(*) from auth.users, wk where created_at >= wk.since),
      'events', (select count(*) from events),
      'events_active', (select count(*) from events where status = 'active'),
      'events_7d', (select count(*) from events, wk where created_at >= wk.since),
      'hosts', (select count(distinct owner_id) from events),
      'photos', (select count(*) from photos where status = 'ready'),
      'photos_7d', (select count(*) from photos, wk where status = 'ready' and created_at >= wk.since),
      'guests', (select count(*) from event_members where role = 'guest' and status = 'approved'),
      'guests_pending', (select count(*) from event_members where role = 'guest' and status = 'pending'),
      'consents', (select count(*) from consents where withdrawn_at is null),
      'searches', (select count(*) from selfie_searches),
      'searches_7d', (select count(*) from selfie_searches, wk where created_at >= wk.since),
      'searchers', (select count(distinct user_id) from selfie_searches),
      'searches_found', (select count(*) from selfie_searches where sure > 0),
      'photos_found', (select count(*) from photo_matches where not rejected),
      'views_7d', (select count(*) from page_views, wk where created_at >= wk.since),
      'visits_7d', (select count(*) from page_views, wk where is_entry and created_at >= wk.since)
    ),
    'daily', (select jsonb_agg(jsonb_build_object(
        'day', d.day,
        'signups', (select count(*) from auth.users u where (timezone('utc', u.created_at))::date = d.day),
        'events', (select count(*) from events e where (timezone('utc', e.created_at))::date = d.day),
        'photos', (select count(*) from photos p where p.status = 'ready' and (timezone('utc', p.created_at))::date = d.day),
        'searches', (select count(*) from selfie_searches s where (timezone('utc', s.created_at))::date = d.day),
        'views', (select count(*) from page_views v where (timezone('utc', v.created_at))::date = d.day),
        'visits', (select count(*) from page_views v where v.is_entry and (timezone('utc', v.created_at))::date = d.day)
      ) order by d.day) from d),
    'top_pages', (select coalesce(jsonb_agg(t), '[]') from (
        select path, count(*) as views from page_views, wk where created_at >= wk.since
        group by path order by views desc limit 8) t),
    'referrers', (select coalesce(jsonb_agg(t), '[]') from (
        select coalesce(referrer_host, 'Direct') as source, count(*) as visits from page_views
        where is_entry and created_at >= now() - interval '30 days'
        group by 1 order by visits desc limit 8) t),
    'countries', (select coalesce(jsonb_agg(t), '[]') from (
        select coalesce(country, '??') as country, count(*) as visits from page_views
        where is_entry and created_at >= now() - interval '30 days'
        group by 1 order by visits desc limit 8) t),
    'recent_events', (select coalesce(jsonb_agg(t), '[]') from (
        select e.name, e.kind, e.created_at, e.join_mode, e.status,
               (select u.email from auth.users u where u.id = e.owner_id) as host,
               (select count(*) from photos p where p.event_id = e.id and p.status = 'ready') as photos,
               (select count(*) from event_members m where m.event_id = e.id and m.role = 'guest' and m.status = 'approved') as guests,
               (select count(*) from selfie_searches s where s.event_id = e.id) as searches
        from events e order by e.created_at desc limit 12) t),
    'recent_signups', (select coalesce(jsonb_agg(t), '[]') from (
        select u.email, u.created_at, u.email_confirmed_at is not null as confirmed,
               (select count(*) from events e where e.owner_id = u.id) as events
        from auth.users u order by u.created_at desc limit 12) t)
  );
$$;

revoke execute on function public.admin_overview(int) from public, anon, authenticated;
grant execute on function public.admin_overview(int) to service_role;
