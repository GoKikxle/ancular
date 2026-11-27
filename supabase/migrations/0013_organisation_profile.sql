-- Organisation profile: the things that don't change between events.
-- Name, website, logo and brand colour live on the organiser's account; every event uses them
-- unless the event sets its own logo or colour. Events keep their own cover photo and message.
-- The dashboard shows a "Complete your organisation profile" banner until it's done or dismissed.

begin;

create table if not exists public.organisation_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  org_name text check (char_length(org_name) <= 120),
  website text check (char_length(website) <= 200),
  logo_path text check (char_length(logo_path) <= 300),
  brand_color text check (brand_color ~ '^#[0-9a-fA-F]{6}$'),
  banner_dismissed_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.organisation_profiles enable row level security;

drop policy if exists "own profile read" on public.organisation_profiles;
create policy "own profile read" on public.organisation_profiles for select to authenticated
  using (user_id = auth.uid());
drop policy if exists "own profile insert" on public.organisation_profiles;
create policy "own profile insert" on public.organisation_profiles for insert to authenticated
  with check (user_id = auth.uid());
drop policy if exists "own profile update" on public.organisation_profiles;
create policy "own profile update" on public.organisation_profiles for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Organisation logos go in the public branding bucket under org/<user id>/.
drop policy if exists "branding org insert" on storage.objects;
create policy "branding org insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'branding' and (storage.foldername(name))[1] = 'org'
              and (storage.foldername(name))[2] = auth.uid()::text);
drop policy if exists "branding org update" on storage.objects;
create policy "branding org update" on storage.objects for update to authenticated
  using (bucket_id = 'branding' and (storage.foldername(name))[1] = 'org'
         and (storage.foldername(name))[2] = auth.uid()::text);
drop policy if exists "branding org delete" on storage.objects;
create policy "branding org delete" on storage.objects for delete to authenticated
  using (bucket_id = 'branding' and (storage.foldername(name))[1] = 'org'
         and (storage.foldername(name))[2] = auth.uid()::text);

-- The branding policies from 0011 cast the first folder to uuid, which fails for "org/...".
-- Guard the cast so organisation uploads don't error on the event policies.
drop policy if exists "branding host insert" on storage.objects;
create policy "branding host insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'branding'
              and (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
              and public.is_event_host(((storage.foldername(name))[1])::uuid));
drop policy if exists "branding host update" on storage.objects;
create policy "branding host update" on storage.objects for update to authenticated
  using (bucket_id = 'branding'
         and (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
         and public.is_event_host(((storage.foldername(name))[1])::uuid));
drop policy if exists "branding host delete" on storage.objects;
create policy "branding host delete" on storage.objects for delete to authenticated
  using (bucket_id = 'branding'
         and (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
         and public.is_event_host(((storage.foldername(name))[1])::uuid));

-- Invite: event logo/colour first, then the organisation's.
drop function if exists public.get_event_invite(text);
create function public.get_event_invite(p_code text)
returns table (
  id uuid, name text, host_name text, kind text, event_date date, join_mode text, status text,
  brand_logo_path text, brand_cover_path text, brand_color text, brand_message text,
  photos_ready boolean,
  verified_name text, verified_domain text, verified_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select e.id, e.name, e.host_name, e.kind, e.event_date, e.join_mode, e.status,
         coalesce(e.brand_logo_path, op.logo_path), e.brand_cover_path,
         coalesce(e.brand_color, op.brand_color), e.brand_message,
         e.photos_live and exists (select 1 from photos p where p.event_id = e.id and p.status = 'ready'),
         v.org_name, v.website_domain, v.decided_at
  from events e
  left join organisation_profiles op on op.user_id = e.owner_id
  left join organiser_verifications v on v.user_id = e.owner_id and v.status = 'approved'
  where e.invite_code = upper(trim(p_code));
$$;
grant execute on function public.get_event_invite(text) to anon, authenticated;

commit;
