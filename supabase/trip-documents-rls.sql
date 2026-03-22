-- =============================================================================
-- Ancular — trip_documents RLS policies
-- Run via Supabase SQL Editor: paste and run
--
-- Fixes: "new row violates row-level security policy for table trip_documents"
--
-- Prerequisite: Run supabase/documents-rls.sql so documents has RLS policies.
-- New trips and documents must set user_id via createTrip/insertDocument.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Ensure user_id exists on trips and documents (if missing)
-- -----------------------------------------------------------------------------
alter table public.trips
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.documents
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- -----------------------------------------------------------------------------
-- 2. trip_documents RLS
-- -----------------------------------------------------------------------------
alter table public.trip_documents enable row level security;

-- SELECT: user can see rows where the trip belongs to them
-- (or trip has no user_id — legacy rows)
drop policy if exists "Users can view trip_documents for own trips" on public.trip_documents;
create policy "Users can view trip_documents for own trips"
  on public.trip_documents for select
  to authenticated
  using (
    exists (
      select 1 from public.trips t
      where t.id = trip_documents.trip_id
      and (t.user_id = auth.uid() or t.user_id is null)
    )
  );

-- INSERT: user can attach a document only when both trip and document belong to them
drop policy if exists "Users can attach own documents to own trips" on public.trip_documents;
create policy "Users can attach own documents to own trips"
  on public.trip_documents for insert
  to authenticated
  with check (
    exists (
      select 1 from public.trips t
      where t.id = trip_id
      and (t.user_id = auth.uid() or t.user_id is null)
    )
    and exists (
      select 1 from public.documents d
      where d.id = document_id
      and (d.user_id = auth.uid() or d.user_id is null)
    )
  );

-- DELETE: user can remove from trip when the trip belongs to them
drop policy if exists "Users can remove documents from own trips" on public.trip_documents;
create policy "Users can remove documents from own trips"
  on public.trip_documents for delete
  to authenticated
  using (
    exists (
      select 1 from public.trips t
      where t.id = trip_documents.trip_id
      and (t.user_id = auth.uid() or t.user_id is null)
    )
  );

-- -----------------------------------------------------------------------------
-- Backfill: set user_id on existing rows (optional — run manually if needed)
-- UPDATE public.trips SET user_id = auth.uid() WHERE user_id IS NULL;  -- assign to current user
-- UPDATE public.documents SET user_id = auth.uid() WHERE user_id IS NULL;  -- assign to current user
-- -----------------------------------------------------------------------------
