-- Better matching for side profiles and turned heads.
--
-- 1. Face model v2. Each event records which face model its codes come from:
--    "v1" (original, 128 numbers, compared by straight-line distance) or "v2"
--    (same face finder, but faces read by the stronger "faceres" model: 1024 numbers,
--    scaled to length 1, compared by cosine distance). v2 copes much better with
--    turned heads; see docs/face-model-benchmark.md. New events use v2; existing events stay
--    on v1 until the host re-scans them, which adds v2 codes next to the old ones and
--    then switches the event over.
-- 2. Several selfie codes per search. Guests can add a second, head-turned selfie;
--    a photo's distance is its closest match to any of them.
-- 3. Second pass ("more of me"). Faces that are almost certainly the guest, plus the
--    face in every photo the guest confirmed, are used as extra search codes. Those
--    photos already show the guest at other angles, so they reach profiles the
--    selfie alone can't. One hop only, and anything found this way is offered as
--    "Is this you?", never added silently.
--
-- The selfie codes are used for this one search and are not stored.

alter table public.events
  add column if not exists face_model text not null default 'v1'
  check (face_model in ('v1', 'v2'));
-- Existing events keep v1 (set above); events created from now on use v2.
alter table public.events alter column face_model set default 'v2';

alter table public.faces alter column embedding drop not null;
alter table public.faces add column if not exists embedding_v2 vector(1024);
alter table public.faces drop constraint if exists faces_one_code;
alter table public.faces add constraint faces_one_code
  check ((embedding is null) <> (embedding_v2 is null));

-- Search an event with one or more face codes from the guest's phone.
-- p_codes: pgvector text, e.g. '[0.1,0.2,...]', from the event's face model.
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

  return query
    select pm.photo_id, pm.distance, pm.confidence, pm.confirmed
    from photo_matches pm
    where pm.user_id = auth.uid() and pm.event_id = p_event and not pm.rejected
    order by pm.distance;
end;
$$;

revoke execute on function public.find_my_photos(uuid, text[]) from public, anon;
grant execute on function public.find_my_photos(uuid, text[]) to authenticated;

-- The old one-code search stays for v1 events until every guest page has reloaded.
-- It can be dropped in a later migration.
