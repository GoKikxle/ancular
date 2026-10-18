-- Only needed if you are NOT using Cloudflare R2.
-- A private bucket: the app signs every upload and download on the server.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('event-photos', 'event-photos', false, 41943040, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
