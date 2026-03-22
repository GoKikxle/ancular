-- =============================================================================
-- Ancular — documents RLS policies
-- Run via Supabase SQL Editor (after trip-documents-rls.sql for user_id column).
--
-- Prerequisite: documents.user_id uuid references auth.users(id)
--   (added by trip-documents-rls.sql or: alter table documents add column user_id uuid references auth.users(id))
-- =============================================================================

alter table public.documents enable row level security;

-- SELECT: user sees own documents (or legacy rows with user_id null)
drop policy if exists "Users can view own documents" on public.documents;
create policy "Users can view own documents"
  on public.documents for select
  to authenticated
  using (user_id = auth.uid() or user_id is null);

-- INSERT: user can only insert documents they own (user_id = auth.uid())
drop policy if exists "Users can insert own documents" on public.documents;
create policy "Users can insert own documents"
  on public.documents for insert
  to authenticated
  with check (user_id = auth.uid());

-- DELETE: user can delete own documents (or legacy)
drop policy if exists "Users can delete own documents" on public.documents;
create policy "Users can delete own documents"
  on public.documents for delete
  to authenticated
  using (user_id = auth.uid() or user_id is null);
