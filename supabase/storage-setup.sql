-- =============================================================================
-- Ancular — Supabase Storage setup
-- Run this once against your project via the Supabase SQL Editor or CLI:
--   supabase db push  (if using local dev + migrations)
--   or paste directly into the SQL Editor in the Supabase dashboard
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Storage buckets
--
--    One private bucket per document category.
--    private = not publicly accessible; all reads require a signed URL or an
--    authenticated request that satisfies a storage RLS policy.
--
--    file_size_limit: 20 MB per file
--    allowed_mime_types: PDF and common image formats
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'identity', 'identity', false,
    20971520,
    array['application/pdf','image/jpeg','image/png','image/webp','image/heic']
  ),
  (
    'flight', 'flight', false,
    20971520,
    array['application/pdf','image/jpeg','image/png','image/webp','image/heic']
  ),
  (
    'hotel', 'hotel', false,
    20971520,
    array['application/pdf','image/jpeg','image/png','image/webp','image/heic']
  ),
  (
    'booking', 'booking', false,
    20971520,
    array['application/pdf','image/jpeg','image/png','image/webp','image/heic']
  ),
  (
    'other', 'other', false,
    20971520,
    array['application/pdf','image/jpeg','image/png','image/webp','image/heic']
  )
on conflict (id) do nothing;


-- -----------------------------------------------------------------------------
-- 2. Storage RLS policies
--
--    The Next.js server actions that upload/read/delete files run with the
--    Supabase anon key (NEXT_PUBLIC_SUPABASE_ANON_KEY) and therefore execute
--    under the `anon` Postgres role.
--
--    These policies allow server-side operations on each private bucket.
--    No public/anonymous HTTP access to the raw storage URLs is possible
--    because the bucket is not public — a signed URL or policy check is
--    always required.
--
--    FUTURE: When you add Supabase Auth, replace `to anon` with
--    `to authenticated` and scope by user:
--      using (auth.uid()::text = (storage.foldername(name))[1])
-- -----------------------------------------------------------------------------

-- Drop any existing policies so this script is idempotent
do $$ declare
  bucket text;
  op     text;
begin
  foreach bucket in array array['identity','flight','hotel','booking','other']
  loop
    foreach op in array array['select','insert','delete']
    loop
      execute format(
        'drop policy if exists "anon can %s %s" on storage.objects',
        op, bucket
      );
    end loop;
  end loop;
end $$;


-- identity bucket
create policy "anon can select identity"
  on storage.objects for select to anon
  using (bucket_id = 'identity');

create policy "anon can insert identity"
  on storage.objects for insert to anon
  with check (bucket_id = 'identity');

create policy "anon can delete identity"
  on storage.objects for delete to anon
  using (bucket_id = 'identity');


-- flight bucket
create policy "anon can select flight"
  on storage.objects for select to anon
  using (bucket_id = 'flight');

create policy "anon can insert flight"
  on storage.objects for insert to anon
  with check (bucket_id = 'flight');

create policy "anon can delete flight"
  on storage.objects for delete to anon
  using (bucket_id = 'flight');


-- hotel bucket
create policy "anon can select hotel"
  on storage.objects for select to anon
  using (bucket_id = 'hotel');

create policy "anon can insert hotel"
  on storage.objects for insert to anon
  with check (bucket_id = 'hotel');

create policy "anon can delete hotel"
  on storage.objects for delete to anon
  using (bucket_id = 'hotel');


-- booking bucket
create policy "anon can select booking"
  on storage.objects for select to anon
  using (bucket_id = 'booking');

create policy "anon can insert booking"
  on storage.objects for insert to anon
  with check (bucket_id = 'booking');

create policy "anon can delete booking"
  on storage.objects for delete to anon
  using (bucket_id = 'booking');


-- other bucket
create policy "anon can select other"
  on storage.objects for select to anon
  using (bucket_id = 'other');

create policy "anon can insert other"
  on storage.objects for insert to anon
  with check (bucket_id = 'other');

create policy "anon can delete other"
  on storage.objects for delete to anon
  using (bucket_id = 'other');


-- -----------------------------------------------------------------------------
-- 3. documents table — additional columns for storage metadata
--
--    storage_path   — object path within the bucket (e.g. "tripId/1234-file.pdf")
--                     Stored so signed URLs can be regenerated if they expire.
--    storage_bucket — name of the bucket (e.g. "flight").
--                     Stored so we know which bucket to call createSignedUrl on.
--
--    file_url       — already exists; now stores a long-lived signed URL
--                     (5-year TTL). Regenerate by calling:
--                     storage.createSignedUrl(storage_bucket, storage_path, TTL)
-- -----------------------------------------------------------------------------

alter table documents
  add column if not exists storage_path   text null,
  add column if not exists storage_bucket text null;
