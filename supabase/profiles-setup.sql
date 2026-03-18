-- =============================================================================
-- Ancular — Profiles table (full_name, email, avatar_id)
-- Run via Supabase SQL Editor or: supabase db push
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Create profiles table
-- If upgrading from display_name schema, run:
--   alter table public.profiles add column if not exists email text;
--   alter table public.profiles add column if not exists full_name text;
--   alter table public.profiles rename column display_name to full_name;
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  avatar_id text default 'avatar_1',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists avatar_id text default 'avatar_1';
alter table public.profiles add column if not exists created_at timestamptz default now();

-- Migrate display_name -> full_name if upgrading
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='display_name') then
    update public.profiles set full_name = coalesce(full_name, display_name);
    alter table public.profiles drop column display_name;
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- 2. Row Level Security
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- 3. Trigger: create profile on signup
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
