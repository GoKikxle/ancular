-- =============================================================================
-- Ancular — Profiles table for avatar_id and display_name
-- Run via Supabase SQL Editor or: supabase db push
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Profiles table (extends auth.users)
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  avatar_id text default 'avatar_1',
  updated_at timestamptz default now()
);

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
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
