-- =============================================================================
-- Ancular — trips RLS policies (optional)
-- Run via Supabase SQL Editor if trip updates fail with RLS.
--
-- Use when: "update violates row-level security" or similar on trips table.
-- =============================================================================

alter table public.trips enable row level security;

drop policy if exists "Users can manage own trips" on public.trips;
create policy "Users can manage own trips"
  on public.trips for all
  to authenticated
  using (user_id = auth.uid() or user_id is null)
  with check (user_id = auth.uid() or user_id is null);
