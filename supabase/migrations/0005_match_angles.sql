-- Better matching for side profiles and turned heads.
--
-- A front-facing selfie matches front-facing photos well, but the face code of a
-- side profile is further away, so those photos were missed. Two changes:
--
-- 1. Second pass ("more of me"). Faces that are almost certainly the guest
--    (distance <= p_seed), plus the face in every photo the guest confirmed as
--    them, are used as extra search codes. Those photos already show the guest at
--    other angles, so they reach profiles the selfie alone can't. Only one hop, and
--    anything found this way is offered as "Is this you?", never added silently.
-- 2. The "Is this you?" band is a little wider (0.55 -> 0.58), so near misses are
--    shown for the guest to confirm rather than dropped.
--
-- Confirming a photo in "Is this you?" feeds the next search, so results improve
-- as the guest answers. The selfie code is still used once and not stored.

-- The function gains parameters and returns "confirmed", so replace the old one
-- rather than adding a second version next to it.
drop function if exists public.match_my_face(uuid, vector, numeric, numeric);

create function public.match_my_face(
  p_event uuid,
  p_embedding vector(128),
  p_sure numeric default 0.45,
  p_maybe numeric default 0.58,
  p_seed numeric default 0.40,
  p_expand numeric default 0.42
)
returns table (photo_id uuid, distance real, confidence text, confirmed boolean)
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

  with direct as (
    select f.id as face_id, f.photo_id, f.embedding, (f.embedding <-> p_embedding)::real as d
    from faces f
    where f.event_id = p_event
  ),
  -- In each photo, the face nearest the selfie is the one that could be the guest.
  nearest as (
    select distinct on (photo_id) face_id, photo_id, embedding, d
    from direct
    order by photo_id, d
  ),
  seeds as (
    (select n.embedding from nearest n where n.d <= p_seed order by n.d limit 20)
    union all
    (select n.embedding
     from nearest n
     join photo_matches pm
       on pm.photo_id = n.photo_id and pm.user_id = auth.uid() and pm.confirmed
     limit 20)
  ),
  expanded as (
    select f.photo_id, min(f.embedding <-> s.embedding)::real as d2
    from faces f
    cross join seeds s
    where f.event_id = p_event
    group by f.photo_id
  ),
  best as (
    select n.photo_id, n.d, e.d2
    from nearest n
    left join expanded e on e.photo_id = n.photo_id
  )
  insert into photo_matches (user_id, photo_id, event_id, distance, confidence)
  select auth.uid(), b.photo_id, p_event, b.d,
         case when b.d <= p_sure then 'sure' else 'maybe' end
  from best b
  where b.d <= p_maybe or b.d2 <= p_expand
  on conflict (user_id, photo_id) do nothing;

  return query
    select pm.photo_id, pm.distance, pm.confidence, pm.confirmed
    from photo_matches pm
    where pm.user_id = auth.uid() and pm.event_id = p_event and not pm.rejected
    order by pm.distance;
end;
$$;

revoke execute on function public.match_my_face(uuid, vector, numeric, numeric, numeric, numeric) from public, anon;
grant execute on function public.match_my_face(uuid, vector, numeric, numeric, numeric, numeric) to authenticated;
