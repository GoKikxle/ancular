-- Daily purge of face codes past each event's retention.
-- Runs public.purge_expired_face_data() inside Postgres. No HTTP call and no keys.
-- If CREATE EXTENSION is refused, enable pg_cron in the dashboard
-- (Integrations, then Cron) and run this file in the SQL editor.

create extension if not exists pg_cron with schema pg_catalog;

do $$
declare
  existing_job bigint;
begin
  select jobid into existing_job
  from cron.job
  where jobname = 'ancular-purge-faces';

  if existing_job is not null then
    perform cron.unschedule(existing_job);
  end if;
end
$$;

select cron.schedule(
  'ancular-purge-faces',
  '15 3 * * *',
  $$select public.purge_expired_face_data()$$
);
