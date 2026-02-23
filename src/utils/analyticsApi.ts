import { supabase } from '../lib/supabase';

export interface AnalyticsSummary {
  total_pageviews: number;
  bot_pageviews: number;
  human_pageviews: number;
  unique_sessions: number;
  bot_sessions: number;
  human_sessions: number;
  top_paths: Array<{ path: string; count: number }>;
  top_referrers: Array<{ referrer: string; count: number }>;
  top_devices: Array<{ device: string; count: number }>;
  top_countries: Array<{ country: string; count: number }>;
  avg_page_duration_ms: number;
  avg_page_duration_human_ms: number;
  avg_session_duration_ms: number;
  avg_session_duration_human_ms: number;
}

export interface AnalyticsTimeseriesPoint {
  day: string;
  pageviews: number;
  unique_sessions: number;
}

const BOT_REGEX = /(bot|crawler|spider|crawling|slurp|bingpreview|facebookexternalhit|discordbot|twitterbot|linkedinbot|whatsapp|telegrambot|pinterest|embedly|quora link preview|slackbot|applebot|semrush|ahrefs|mj12|dotbot|yandex|baiduspider|duckduckbot)/i;

type AnalyticsEventRow = {
  event_type: string;
  path: string;
  referrer: string | null;
  user_agent: string | null;
  session_id: string;
  payload: Record<string, unknown> | null;
  duration_ms: number | null;
  created_at: string;
};

const average = (values: number[]) => {
  if (!values.length) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return Math.round(sum / values.length);
};

export async function fetchAnalyticsSummary(start: Date, end: Date): Promise<AnalyticsSummary | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .rpc('get_analytics_summary', {
      start_ts: start.toISOString(),
      end_ts: end.toISOString(),
    })
    .single();

  if (error) {
    console.error('Failed to fetch analytics summary', error);
    return null;
  }
  return data as AnalyticsSummary;
}

export async function fetchAnalyticsTimeseries(start: Date, end: Date): Promise<AnalyticsTimeseriesPoint[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .rpc('get_analytics_timeseries', {
      start_ts: start.toISOString(),
      end_ts: end.toISOString(),
    })
    .single();

  if (error) {
    console.error('Failed to fetch analytics timeseries', error);
    return [];
  }
  return (data as AnalyticsTimeseriesPoint[]) || [];
}

const fetchAnalyticsFallback = async (start: Date, end: Date) => {
  if (!supabase) {
    return { summary: null, timeseries: [] };
  }

  const startIso = start.toISOString();
  const endIso = end.toISOString();
  const pageSize = 1000;
  let from = 0;
  const rows: AnalyticsEventRow[] = [];

  while (true) {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('event_type,path,referrer,user_agent,session_id,payload,duration_ms,created_at')
      .gte('created_at', startIso)
      .lte('created_at', endIso)
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('Failed to fetch analytics fallback rows', error);
      return { summary: null, timeseries: [] };
    }

    if (data && data.length) {
      rows.push(...(data as AnalyticsEventRow[]));
    }

    if (!data || data.length < pageSize) {
      break;
    }
    from += pageSize;
  }

  const pageviews = rows.filter(row => row.event_type === 'pageview');
  const isBot = (row: AnalyticsEventRow) => BOT_REGEX.test(row.user_agent || '');
  const humanPageviews = pageviews.filter(row => !isBot(row));
  const botPageviews = pageviews.filter(row => isBot(row));

  const uniqueSessions = new Set(pageviews.map(row => row.session_id));
  const humanSessions = new Set(humanPageviews.map(row => row.session_id));
  const botSessions = new Set(botPageviews.map(row => row.session_id));

  const topCounts = (rowsToCount: string[]) => {
    const map = new Map<string, number>();
    rowsToCount.forEach((value) => {
      map.set(value, (map.get(value) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
  };

  const topPaths: AnalyticsSummary['top_paths'] = topCounts(
    pageviews.map(row => row.path || '/')
  ).map(([path, count]) => ({ path, count }));

  const topReferrers: AnalyticsSummary['top_referrers'] = topCounts(
    pageviews.map(row => (row.referrer && row.referrer.length ? row.referrer : '(direct)'))
  ).map(([referrer, count]) => ({ referrer, count }));

  const topDevices: AnalyticsSummary['top_devices'] = topCounts(
    pageviews.map(row => (row.payload?.device as string) || 'unknown')
  ).map(([device, count]) => ({ device, count }));

  const topCountries: AnalyticsSummary['top_countries'] = topCounts(
    pageviews.map(row => (row.payload?.country as string) || 'unknown')
  ).map(([country, count]) => ({ country, count }));

  const durationEvents = rows.filter(row => row.event_type === 'page_duration' && row.duration_ms != null);
  const humanDurationEvents = durationEvents.filter(row => !isBot(row));
  const sessionDurations = new Map<string, number>();
  const sessionDurationsHuman = new Map<string, number>();

  durationEvents.forEach((row) => {
    const current = sessionDurations.get(row.session_id) || 0;
    sessionDurations.set(row.session_id, current + (row.duration_ms || 0));
  });

  humanDurationEvents.forEach((row) => {
    const current = sessionDurationsHuman.get(row.session_id) || 0;
    sessionDurationsHuman.set(row.session_id, current + (row.duration_ms || 0));
  });

  const summary: AnalyticsSummary = {
    total_pageviews: pageviews.length,
    bot_pageviews: botPageviews.length,
    human_pageviews: humanPageviews.length,
    unique_sessions: uniqueSessions.size,
    bot_sessions: botSessions.size,
    human_sessions: humanSessions.size,
    top_paths: topPaths,
    top_referrers: topReferrers,
    top_devices: topDevices,
    top_countries: topCountries,
    avg_page_duration_ms: average(durationEvents.map(row => row.duration_ms || 0)),
    avg_page_duration_human_ms: average(humanDurationEvents.map(row => row.duration_ms || 0)),
    avg_session_duration_ms: average(Array.from(sessionDurations.values())),
    avg_session_duration_human_ms: average(Array.from(sessionDurationsHuman.values())),
  };

  const timeseriesMap = new Map<string, { pageviews: number; sessions: Set<string> }>();
  pageviews.forEach((row) => {
    const day = row.created_at.slice(0, 10);
    const entry = timeseriesMap.get(day) || { pageviews: 0, sessions: new Set<string>() };
    entry.pageviews += 1;
    entry.sessions.add(row.session_id);
    timeseriesMap.set(day, entry);
  });

  const timeseries: AnalyticsTimeseriesPoint[] = Array.from(timeseriesMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, data]) => ({
      day,
      pageviews: data.pageviews,
      unique_sessions: data.sessions.size,
    }));

  return { summary, timeseries };
};

export async function fetchAnalyticsData(start: Date, end: Date) {
  const summary = await fetchAnalyticsSummary(start, end);
  const timeseries = summary ? await fetchAnalyticsTimeseries(start, end) : [];

  if (summary) {
    return { summary, timeseries, fallbackUsed: false };
  }

  const fallback = await fetchAnalyticsFallback(start, end);
  return { summary: fallback.summary, timeseries: fallback.timeseries, fallbackUsed: true };
}
