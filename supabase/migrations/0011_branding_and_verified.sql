-- Event branding, "photos coming soon" page, and verified organisers.
--
-- 1. Branding: a host can add a logo, a cover photo, a brand colour and a short message.
--    Files go in a public "branding" bucket (they are shown to anyone with the invite link).
-- 2. photos_live: while false, or while the event has no ready photos, guests who open the
--    invite see a branded "photos coming soon" page instead of the selfie search.
-- 3. organiser_verifications: Ancular checks an organiser's name and email by hand and records
--    it here. The invite page shows a "Verified" badge with the checked name and email.
--    Only the service role (the /admin page) can write it.
--
-- Safe to apply while the current app is live: new columns have defaults, and the invite
-- function only gains columns.

begin;

alter table public.events
  add column if not exists brand_logo_path text check (char_length(brand_logo_path) <= 300),
  add column if not exists brand_cover_path text check (char_length(brand_cover_path) <= 300),
  add column if not exists brand_color text check (brand_color ~ '^#[0-9a-fA-F]{6}$'),
  add column if not exists brand_message text check (char_length(brand_message) <= 280),
  add column if not exists photos_live boolean not null default true;

create table if not exists public.organiser_verifications (
  user_id uuid primary key references auth.users (id) on delete cascade,
  verified_name text not null check (char_length(verified_name) between 2 and 120),
  verified_email text not null,
  verified_at timestamptz not null default now(),
  note text
);
alter table public.organiser_verifications enable row level security; -- no policies: service role only

-- Public bucket for brand files. Hosts write into their own event's folder: <event_id>/<file>.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('branding', 'branding', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
on conflict (id) do nothing;

drop policy if exists "branding host insert" on storage.objects;
create policy "branding host insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'branding' and public.is_event_host(((storage.foldername(name))[1])::uuid));
drop policy if exists "branding host update" on storage.objects;
create policy "branding host update" on storage.objects for update to authenticated
  using (bucket_id = 'branding' and public.is_event_host(((storage.foldername(name))[1])::uuid));
drop policy if exists "branding host delete" on storage.objects;
create policy "branding host delete" on storage.objects for delete to authenticated
  using (bucket_id = 'branding' and public.is_event_host(((storage.foldername(name))[1])::uuid));

-- Invite details, now with branding, whether photos are ready, and the organiser's
-- verification. Never exposes photos or members.
drop function if exists public.get_event_invite(text);
create function public.get_event_invite(p_code text)
returns table (
  id uuid, name text, host_name text, kind text, event_date date, join_mode text, status text,
  brand_logo_path text, brand_cover_path text, brand_color text, brand_message text,
  photos_ready boolean,
  verified_name text, verified_email text, verified_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select e.id, e.name, e.host_name, e.kind, e.event_date, e.join_mode, e.status,
         e.brand_logo_path, e.brand_cover_path, e.brand_color, e.brand_message,
         e.photos_live and exists (select 1 from photos p where p.event_id = e.id and p.status = 'ready'),
         v.verified_name, v.verified_email, v.verified_at
  from events e
  left join organiser_verifications v on v.user_id = e.owner_id
  where e.invite_code = upper(trim(p_code));
$$;
grant execute on function public.get_event_invite(text) to anon, authenticated;

-- /admin: verify an organiser by the email they signed up with. Service role only.
create or replace function public.admin_verify_organiser(p_email text, p_name text, p_note text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_user uuid;
  v_email text;
begin
  select u.id, u.email into v_user, v_email
  from auth.users u
  where lower(u.email) = lower(trim(p_email)) and u.email_confirmed_at is not null;
  if v_user is null then
    raise exception 'No account with a confirmed email matches %', p_email;
  end if;
  insert into organiser_verifications (user_id, verified_name, verified_email, note)
  values (v_user, trim(p_name), v_email, nullif(trim(p_note), ''))
  on conflict (user_id) do update
    set verified_name = excluded.verified_name, verified_email = excluded.verified_email,
        note = excluded.note, verified_at = now();
  return v_user;
end;
$$;
revoke execute on function public.admin_verify_organiser(text, text, text) from public, anon, authenticated;

commit;
