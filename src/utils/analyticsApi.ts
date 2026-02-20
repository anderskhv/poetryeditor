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
