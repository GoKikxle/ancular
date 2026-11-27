-- Verified organisations (replaces the email-based badge from 0011).
--
-- Only organisations with their own website, and an email address on that website's domain,
-- can be verified. Everyone else stays as they are: "Hosted by <whatever they typed>", no badge.
--
-- Flow: the organiser requests it in Settings (name, website, domain email) -> Ancular emails
-- that address to confirm -> an admin approves on /admin. Guests see the name and the website
-- domain, never the email.
--
-- Name lock: two approved organisations can't share a name (ignoring case, spaces and punctuation).

begin;

drop function if exists public.admin_verify_organiser(text, text, text);
drop table if exists public.organiser_verifications cascade;

create table public.organiser_verifications (
  user_id uuid primary key references auth.users (id) on delete cascade,
  org_name text not null check (char_length(org_name) between 2 and 120),
  website_domain text not null check (website_domain ~ '^[a-z0-9.-]+\.[a-z]{2,}$'),
  contact_email text not null check (char_length(contact_email) <= 254),
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  note text,
  name_key text generated always as (lower(regexp_replace(org_name, '[^[:alnum:]]', '', 'g'))) stored,
  check (split_part(contact_email, '@', 2) = website_domain
         or split_part(contact_email, '@', 2) like '%.' || website_domain)
);
create unique index organiser_verifications_name_lock
  on public.organiser_verifications (name_key) where status = 'approved';
alter table public.organiser_verifications enable row level security; -- no policies: service role only

-- The organiser's own request, for the Settings page.
create or replace function public.my_verification()
returns table (org_name text, website_domain text, contact_email text, status text, requested_at timestamptz, decided_at timestamptz)
language sql stable security definer set search_path = public as $$
  select v.org_name, v.website_domain, v.contact_email, v.status, v.requested_at, v.decided_at
  from organiser_verifications v where v.user_id = auth.uid();
$$;
revoke execute on function public.my_verification() from public, anon;
grant execute on function public.my_verification() to authenticated;

-- Ask to be verified. Re-asking replaces a pending or declined request; an approved one
-- can only be changed by an admin.
create or replace function public.request_verification(p_name text, p_website text, p_email text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_name text := trim(p_name);
  v_domain text := lower(regexp_replace(regexp_replace(trim(p_website), '^[a-z]+://', '', 'i'), '^www\.|[/?#].*$', '', 'gi'));
  v_email text := lower(trim(p_email));
  v_email_domain text := split_part(lower(trim(p_email)), '@', 2);
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  if char_length(v_name) < 2 then raise exception 'Enter your organisation''s name'; end if;
  if v_domain !~ '^[a-z0-9.-]+\.[a-z]{2,}$' then raise exception 'Enter your organisation''s website, for example ccimanchester.org'; end if;
  if v_email !~ '^[^@\s]+@[^@\s]+$' then raise exception 'Enter an email address'; end if;
  if v_email_domain in ('gmail.com','googlemail.com','yahoo.com','yahoo.co.uk','hotmail.com','hotmail.co.uk','outlook.com','live.com','icloud.com','me.com','aol.com','proton.me','protonmail.com') then
    raise exception 'Use an email address on your organisation''s own domain, not %', v_email_domain;
  end if;
  if not (v_email_domain = v_domain or v_email_domain like '%.' || v_domain) then
    raise exception 'The email must be on %, for example info@%', v_domain, v_domain;
  end if;
  if exists (
    select 1 from organiser_verifications
    where status = 'approved' and user_id <> auth.uid()
      and name_key = lower(regexp_replace(v_name, '[^[:alnum:]]', '', 'g'))
  ) then
    raise exception 'Another organisation is already verified with that name. Contact hello@ancular.com';
  end if;
  if exists (select 1 from organiser_verifications where user_id = auth.uid() and status = 'approved') then
    raise exception 'You''re already verified. To change your details, contact hello@ancular.com';
  end if;

  insert into organiser_verifications (user_id, org_name, website_domain, contact_email, status, requested_at, decided_at)
  values (auth.uid(), v_name, v_domain, v_email, 'pending', now(), null)
  on conflict (user_id) do update set
    org_name = excluded.org_name, website_domain = excluded.website_domain,
    contact_email = excluded.contact_email, status = 'pending', requested_at = now(), decided_at = null;
end;
$$;
revoke execute on function public.request_verification(text, text, text) from public, anon;
grant execute on function public.request_verification(text, text, text) to authenticated;

-- Invite details: the badge shows the approved organisation name and website, never the email.
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
         e.brand_logo_path, e.brand_cover_path, e.brand_color, e.brand_message,
         e.photos_live and exists (select 1 from photos p where p.event_id = e.id and p.status = 'ready'),
         v.org_name, v.website_domain, v.decided_at
  from events e
  left join organiser_verifications v on v.user_id = e.owner_id and v.status = 'approved'
  where e.invite_code = upper(trim(p_code));
$$;
grant execute on function public.get_event_invite(text) to anon, authenticated;

commit;
