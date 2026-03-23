-- =============================================================================
-- Ancular — Product structure: offline documents, notifications unread
-- Run via Supabase SQL Editor.
-- =============================================================================

-- documents.available_offline — user can mark docs for offline access
alter table public.documents
  add column if not exists available_offline boolean not null default false;

-- profiles.notifications_unread_count — mock for now; real notifications plug in later
alter table public.profiles
  add column if not exists notifications_unread_count integer not null default 0;
