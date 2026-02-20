-- Lightweight, no-cookie analytics (Supabase)

create table if not exists public.site_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

alter table public.site_admins enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'site_admins' and policyname = 'site_admins_select_self'
  ) then
    create policy site_admins_select_self
      on public.site_admins
      for select
      using (auth.uid() = user_id);
  end if;
end $$;

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  path text not null,
  referrer text,
  user_agent text,
  duration_ms int,
  screen_width int,
  screen_height int,
  viewport_width int,
  viewport_height int,
  language text,
  timezone text,
  user_id uuid references auth.users(id) on delete set null,
  session_id text not null,
  payload jsonb,
  created_at timestamptz default now()
);

alter table public.analytics_events enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'analytics_events' and policyname = 'analytics_insert_any'
  ) then
    create policy analytics_insert_any
      on public.analytics_events
      for insert
      with check (
        event_type in ('pageview', 'event', 'page_duration')
        and char_length(path) <= 300
        and char_length(session_id) <= 64
      );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'analytics_events' and policyname = 'analytics_select_admin'
  ) then
    create policy analytics_select_admin
      on public.analytics_events
      for select
      using (exists (select 1 from public.site_admins sa where sa.user_id = auth.uid()));
  end if;
end $$;

create or replace function public.get_analytics_summary(start_ts timestamptz, end_ts timestamptz)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  bot_regex text := '(bot|crawler|spider|crawling|slurp|bingpreview|facebookexternalhit|discordbot|twitterbot|linkedinbot|whatsapp|telegrambot|pinterest|embedly|quora link preview|slackbot|applebot|semrush|ahrefs|mj12|dotbot|yandex|baiduspider|duckduckbot)';
begin
  if not exists (select 1 from public.site_admins where user_id = auth.uid()) then
    raise exception 'not authorized';
  end if;

  return jsonb_build_object(
    'total_pageviews', (
      select count(*) from public.analytics_events
      where event_type = 'pageview'
        and created_at between start_ts and end_ts
    ),
    'bot_pageviews', (
      select count(*) from public.analytics_events
      where event_type = 'pageview'
        and created_at between start_ts and end_ts
        and coalesce(lower(user_agent), '') ~ bot_regex
    ),
    'human_pageviews', (
      select count(*) from public.analytics_events
      where event_type = 'pageview'
        and created_at between start_ts and end_ts
        and coalesce(lower(user_agent), '') !~ bot_regex
    ),
    'unique_sessions', (
      select count(distinct session_id) from public.analytics_events
      where event_type = 'pageview'
        and created_at between start_ts and end_ts
    ),
    'bot_sessions', (
      select count(distinct session_id) from public.analytics_events
      where event_type = 'pageview'
        and created_at between start_ts and end_ts
        and coalesce(lower(user_agent), '') ~ bot_regex
    ),
    'human_sessions', (
      select count(distinct session_id) from public.analytics_events
      where event_type = 'pageview'
        and created_at between start_ts and end_ts
        and coalesce(lower(user_agent), '') !~ bot_regex
    ),
    'top_paths', (
      select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb)
      from (
        select path, count(*) as count
        from public.analytics_events
        where event_type = 'pageview'
          and created_at between start_ts and end_ts
        group by path
        order by count desc
        limit 10
      ) t
    ),
    'top_referrers', (
      select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb)
      from (
        select coalesce(nullif(referrer, ''), '(direct)') as referrer, count(*) as count
        from public.analytics_events
        where event_type = 'pageview'
          and created_at between start_ts and end_ts
        group by referrer
        order by count desc
        limit 10
      ) t
    ),
    'top_devices', (
      select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb)
      from (
        select coalesce(nullif(payload->>'device', ''), 'unknown') as device, count(*) as count
        from public.analytics_events
        where event_type = 'pageview'
          and created_at between start_ts and end_ts
        group by device
        order by count desc
        limit 5
      ) t
    ),
    'top_countries', (
      select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb)
      from (
        select coalesce(nullif(payload->>'country', ''), 'unknown') as country, count(*) as count
        from public.analytics_events
        where event_type = 'pageview'
          and created_at between start_ts and end_ts
        group by country
        order by count desc
        limit 10
      ) t
    ),
    'avg_page_duration_ms', (
      select coalesce(avg(duration_ms), 0)
      from public.analytics_events
      where event_type = 'page_duration'
        and created_at between start_ts and end_ts
    ),
    'avg_page_duration_human_ms', (
      select coalesce(avg(duration_ms), 0)
      from public.analytics_events
      where event_type = 'page_duration'
        and created_at between start_ts and end_ts
        and coalesce(lower(user_agent), '') !~ bot_regex
    ),
    'avg_session_duration_ms', (
      select coalesce(avg(session_total), 0)
      from (
        select session_id, sum(duration_ms) as session_total
        from public.analytics_events
        where event_type = 'page_duration'
          and created_at between start_ts and end_ts
        group by session_id
      ) s
    ),
    'avg_session_duration_human_ms', (
      select coalesce(avg(session_total), 0)
      from (
        select session_id, sum(duration_ms) as session_total
        from public.analytics_events
        where event_type = 'page_duration'
          and created_at between start_ts and end_ts
          and coalesce(lower(user_agent), '') !~ bot_regex
        group by session_id
      ) s
    )
  );
end;
$$;

grant execute on function public.get_analytics_summary(timestamptz, timestamptz) to authenticated;

create or replace function public.get_analytics_timeseries(start_ts timestamptz, end_ts timestamptz)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.site_admins where user_id = auth.uid()) then
    raise exception 'not authorized';
  end if;

  return (
    select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb)
    from (
      select date_trunc('day', created_at)::date as day,
             count(*) as pageviews,
             count(distinct session_id) as unique_sessions
      from public.analytics_events
      where event_type = 'pageview'
        and created_at between start_ts and end_ts
      group by 1
      order by 1
    ) t
  );
end;
$$;

grant execute on function public.get_analytics_timeseries(timestamptz, timestamptz) to authenticated;
