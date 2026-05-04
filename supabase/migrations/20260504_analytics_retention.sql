-- Retention policy for analytics_events
-- Free-tier DB cap is 500 MB; analytics_events ate 446 MB before this fix.
-- Combined with the heartbeat removal in src/utils/analytics.ts, this caps growth.

create extension if not exists pg_cron with schema extensions;

-- Idempotent: drop any prior schedule before re-creating
do $$
begin
  if exists (select 1 from cron.job where jobname = 'analytics_events_retention_90d') then
    perform cron.unschedule('analytics_events_retention_90d');
  end if;
  if exists (select 1 from cron.job where jobname = 'analytics_events_vacuum_weekly') then
    perform cron.unschedule('analytics_events_vacuum_weekly');
  end if;
end $$;

-- Nightly purge of analytics older than 90 days (03:17 UTC, off-peak)
select cron.schedule(
  'analytics_events_retention_90d',
  '17 3 * * *',
  $$delete from public.analytics_events where created_at < now() - interval '90 days'$$
);

-- Weekly VACUUM (Sunday 04:00 UTC) to keep dead-tuple bloat in check.
-- Plain VACUUM marks space reusable inside the file; combined with steady delete cadence,
-- the file size stabilizes instead of monotonically growing.
select cron.schedule(
  'analytics_events_vacuum_weekly',
  '0 4 * * 0',
  $$vacuum (analyze) public.analytics_events$$
);
