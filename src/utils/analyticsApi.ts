import { supabase } from '../lib/supabase';

export interface AnalyticsSummary {
  total_pageviews: number;
  bot_pageviews: number;
  human_pageviews: number;
  unique_sessions: number;
  bot_sessions: number;
  human_sessions: number;
  top_paths: Array<{ path: string; count: number }>;
  top_paths_human: Array<{ path: string; count: number }>;
  top_referrers: Array<{ referrer: string; count: number }>;
  top_referrers_human: Array<{ referrer: string; count: number }>;
  top_devices: Array<{ device: string; count: number }>;
  top_devices_human: Array<{ device: string; count: number }>;
  top_countries: Array<{ country: string; count: number }>;
  top_countries_human: Array<{ country: string; count: number }>;
  top_bot_user_agents: Array<{ user_agent: string; count: number }>;
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

const extractDurationMs = (row: AnalyticsEventRow) => {
  if (typeof row.duration_ms === 'number') return row.duration_ms;
  const payloadDuration = row.payload?.duration_ms;
  return typeof payloadDuration === 'number' ? payloadDuration : null;
};

const average = (values: number[]) => {
  if (!values.length) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return Math.round(sum / values.length);
};

export async function fetchAnalyticsSummary(start: Date, end: Date): Promise<{ data: AnalyticsSummary | null; errorMessage: string | null }> {
  if (!supabase) return { data: null, errorMessage: 'Supabase client unavailable' };
  const { data, error } = await supabase
    .rpc('get_analytics_summary', {
      start_ts: start.toISOString(),
      end_ts: end.toISOString(),
    })
    .single();

  if (error) {
    console.error('Failed to fetch analytics summary', error);
    return { data: null, errorMessage: error.message || 'Failed to fetch analytics summary' };
  }
  if (!data) {
    return { data: null, errorMessage: 'Analytics summary RPC returned no data.' };
  }
  return { data: data as AnalyticsSummary, errorMessage: null };
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
    return { summary: null, timeseries: [], errorMessage: 'Supabase client unavailable' };
  }

  const startIso = start.toISOString();
  const endIso = end.toISOString();
  const pageSize = 1000;
  let from = 0;
  const rows: AnalyticsEventRow[] = [];

  const baseFields = 'event_type,path,referrer,user_agent,session_id,payload,created_at';
  let includeDuration = true;

  let hasMoreRows = true;
  while (hasMoreRows) {
    const selectFields = includeDuration ? `${baseFields},duration_ms` : baseFields;
    const { data, error } = await supabase
      .from('analytics_events')
      .select(selectFields)
      .gte('created_at', startIso)
      .lte('created_at', endIso)
      .range(from, from + pageSize - 1);

    if (error) {
      const message = (error.message || '').toLowerCase();
      if (includeDuration && message.includes('duration_ms') && message.includes('does not exist')) {
        includeDuration = false;
        continue;
      }
      console.error('Failed to fetch analytics fallback rows', error);
      return { summary: null, timeseries: [], errorMessage: error.message || 'Failed to read analytics events' };
    }

    if (data && data.length) {
      const typedRows = data as unknown as AnalyticsEventRow[];
      rows.push(...typedRows);
    }

    if (!data || data.length < pageSize) {
      hasMoreRows = false;
    } else {
      from += pageSize;
    }
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

  const topPathsHuman: AnalyticsSummary['top_paths_human'] = topCounts(
    humanPageviews.map(row => row.path || '/')
  ).map(([path, count]) => ({ path, count }));

  const topReferrers: AnalyticsSummary['top_referrers'] = topCounts(
    pageviews.map(row => (row.referrer && row.referrer.length ? row.referrer : '(direct)'))
  ).map(([referrer, count]) => ({ referrer, count }));

  const topReferrersHuman: AnalyticsSummary['top_referrers_human'] = topCounts(
    humanPageviews.map(row => (row.referrer && row.referrer.length ? row.referrer : '(direct)'))
  ).map(([referrer, count]) => ({ referrer, count }));

  const topDevices: AnalyticsSummary['top_devices'] = topCounts(
    pageviews.map(row => (row.payload?.device as string) || 'unknown')
  ).map(([device, count]) => ({ device, count }));

  const topDevicesHuman: AnalyticsSummary['top_devices_human'] = topCounts(
    humanPageviews.map(row => (row.payload?.device as string) || 'unknown')
  ).map(([device, count]) => ({ device, count }));

  const topCountries: AnalyticsSummary['top_countries'] = topCounts(
    pageviews.map(row => (row.payload?.country as string) || 'unknown')
  ).map(([country, count]) => ({ country, count }));

  const topCountriesHuman: AnalyticsSummary['top_countries_human'] = topCounts(
    humanPageviews.map(row => (row.payload?.country as string) || 'unknown')
  ).map(([country, count]) => ({ country, count }));

  const topBotAgents: AnalyticsSummary['top_bot_user_agents'] = topCounts(
    botPageviews.map(row => (row.user_agent && row.user_agent.length ? row.user_agent : 'unknown'))
  ).map(([user_agent, count]) => ({ user_agent, count }));

  const MIN_MEANINGFUL_DURATION = 1000;
  const durationEvents = rows.filter(row => {
    if (row.event_type !== 'page_duration') return false;
    const duration = extractDurationMs(row);
    return duration != null && duration >= MIN_MEANINGFUL_DURATION;
  });
  const humanDurationEvents = durationEvents.filter(row => !isBot(row));
  const sessionDurations = new Map<string, number>();
  const sessionDurationsHuman = new Map<string, number>();

  durationEvents.forEach((row) => {
    const duration = extractDurationMs(row) || 0;
    const current = sessionDurations.get(row.session_id) || 0;
    sessionDurations.set(row.session_id, current + duration);
  });

  humanDurationEvents.forEach((row) => {
    const duration = extractDurationMs(row) || 0;
    const current = sessionDurationsHuman.get(row.session_id) || 0;
    sessionDurationsHuman.set(row.session_id, current + duration);
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
    top_countries_human: topCountriesHuman,
    top_paths_human: topPathsHuman,
    top_referrers_human: topReferrersHuman,
    top_devices_human: topDevicesHuman,
    top_bot_user_agents: topBotAgents,
    avg_page_duration_ms: average(durationEvents.map(row => extractDurationMs(row) || 0)),
    avg_page_duration_human_ms: average(humanDurationEvents.map(row => extractDurationMs(row) || 0)),
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

  return { summary, timeseries, errorMessage: null as string | null };
};

export async function fetchAnalyticsData(start: Date, end: Date) {
  const summaryResult = await fetchAnalyticsSummary(start, end);
  const summary = summaryResult?.data ?? null;
  const timeseries = summary ? await fetchAnalyticsTimeseries(start, end) : [];

  if (summary) {
    return { summary, timeseries, fallbackUsed: false, errorMessage: null as string | null };
  }

  const fallback = await fetchAnalyticsFallback(start, end);
  if (fallback.summary) {
    return { summary: fallback.summary, timeseries: fallback.timeseries, fallbackUsed: true, errorMessage: null as string | null };
  }

  let diagnosticsMessage: string | null = null;
  if (supabase) {
    const { error: diagnosticsError, count } = await supabase
      .from('analytics_events')
      .select('id', { count: 'exact', head: true });
    if (diagnosticsError) {
      diagnosticsMessage = `Analytics diagnostics: ${diagnosticsError.message}`;
    } else if (typeof count === 'number') {
      diagnosticsMessage = `Analytics diagnostics: ${count} events readable, but summary could not be computed.`;
    }
  }

  return {
    summary: null,
    timeseries: [],
    fallbackUsed: true,
    errorMessage: summaryResult?.errorMessage
      || fallback.errorMessage
      || diagnosticsMessage
      || 'Unable to read analytics events. Please confirm the analytics SQL was run in Supabase and that your admin user is in site_admins.',
  };
}

export async function fetchAnalyticsDataDirect(start: Date, end: Date) {
  const fallback = await fetchAnalyticsFallback(start, end);
  if (fallback.summary) {
    return { summary: fallback.summary, timeseries: fallback.timeseries, fallbackUsed: true, errorMessage: null as string | null };
  }
  return {
    summary: null,
    timeseries: [],
    fallbackUsed: true,
    errorMessage: fallback.errorMessage
      || 'Unable to read analytics events directly. Please confirm analytics_events has SELECT policy for admins.',
  };
}
