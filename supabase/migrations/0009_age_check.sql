-- Age check before face matching.
-- Face search is for adults only (18 or over): biometric data needs extra care for
-- children under UK GDPR, and anyone under 18 is a child under Nigeria's NDPA.
-- Guests now confirm they are 18 or over in the same step as agreeing to face matching.
-- The confirmation is stored with the consent, and the search refuses to run without it,
-- so guests who agreed before this change confirm once on their next visit.
--
-- Apply in two parts so live searches never break:
--   PART A before deploying the app (adds the column and the new consent function),
--   PART B after the new app is live (makes the search require the confirmation).

-- ===== PART A =====
alter table public.consents add column if not exists adult_confirmed boolean not null default false;

create or replace function public.grant_face_consent(p_event uuid, p_wording_version text, p_adult boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_approved_member(p_event) then
    raise exception 'You are not part of this event yet';
  end if;
  if p_adult is not true then
    raise exception 'Face search is only for people aged 18 or over';
  end if;
  insert into consents (user_id, event_id, wording_version, adult_confirmed)
  values (auth.uid(), p_event, p_wording_version, true)
  on conflict (user_id, event_id, purpose) where withdrawn_at is null
  do update set wording_version = excluded.wording_version, adult_confirmed = true, granted_at = now();
end;
$$;

revoke execute on function public.grant_face_consent(uuid, text, boolean) from public, anon;
grant execute on function public.grant_face_consent(uuid, text, boolean) to authenticated;

-- ===== PART B =====
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
      and adult_confirmed
  ) then
    raise exception 'Confirm you are 18 or over and agree to face matching before searching';
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
