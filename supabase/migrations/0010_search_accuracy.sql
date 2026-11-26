-- Better face search accuracy for real event photos (v2 model).
-- The v2 thresholds came from studio test sets and were too strict for event photos:
-- at a 148-photo event most true matches fell into "Is this you?".
-- Changes: looser "sure" line, and a photo very close to one of your sure photos
-- (the same person at another angle) is now sure too. Matches refresh on the next search.

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
  v_expand_sure real;
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
    -- Cosine distance. Retuned on 143 real event photos (party, festival, wedding):
    -- 38 of 40 true photos land in "sure", 1 in "maybe", 0 wrong photos.
    v_sure := 0.40; v_maybe := 0.46; v_seed := 0.36; v_expand := 0.40; v_expand_sure := 0.36;
  else
    v_sure := 0.45; v_maybe := 0.58; v_seed := 0.40; v_expand := 0.42; v_expand_sure := -1;
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
         -- Sure if close to the selfie, or very close to a photo already sure to be you
         -- (same person from another angle, in other light).
         case when n.d <= v_sure or coalesce(e.d2, 9) <= v_expand_sure then 'sure' else 'maybe' end
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
