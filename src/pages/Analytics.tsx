import { useEffect, useMemo, useState } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { fetchAnalyticsSummary, fetchAnalyticsTimeseries, type AnalyticsSummary, type AnalyticsTimeseriesPoint } from '../utils/analyticsApi';
import './Analytics.css';

const RANGE_OPTIONS = [
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 90 days', value: 90 },
];

export function Analytics() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [rangeDays, setRangeDays] = useState(30);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [timeseries, setTimeseries] = useState<AnalyticsTimeseriesPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDuration = (ms: number) => {
    if (!ms || ms <= 0) return '0s';
    const totalSeconds = Math.round(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes === 0) return `${seconds}s`;
    return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
  };

  useEffect(() => {
    if (!user || !supabase) {
      setIsAdmin(false);
      return;
    }
    supabase
      .from('site_admins')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          setIsAdmin(false);
        } else {
          setIsAdmin(true);
        }
      });
  }, [user]);

  const range = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - rangeDays + 1);
    return { start, end };
  }, [rangeDays]);

  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    setError(null);

    Promise.all([
      fetchAnalyticsSummary(range.start, range.end),
      fetchAnalyticsTimeseries(range.start, range.end),
    ])
      .then(([summaryResult, timeseriesResult]) => {
        if (!summaryResult) {
          setError('Analytics data not available.');
          return;
        }
        setSummary(summaryResult);
        setTimeseries(timeseriesResult);
      })
      .catch(() => setError('Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, [isAdmin, range.start, range.end]);

  if (!user) {
    return (
      <Layout>
        <div className="analytics-page">
          <div className="analytics-empty">Please sign in to view analytics.</div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="analytics-page">
          <div className="analytics-empty">You do not have access to analytics.</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="analytics-page">
        <header className="analytics-header">
          <div>
            <h1>Site Analytics</h1>
            <p>Privacy‑friendly, no cookies.</p>
          </div>
          <select
            className="analytics-range"
            value={rangeDays}
            onChange={(e) => setRangeDays(Number(e.target.value))}
          >
            {RANGE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </header>

        {loading ? (
          <div className="analytics-empty">Loading analytics…</div>
        ) : error ? (
          <div className="analytics-empty">{error}</div>
        ) : summary ? (
          <div className="analytics-grid">
            <div className="analytics-card">
              <div className="analytics-card-label">Total pageviews</div>
              <div className="analytics-card-value">{summary.total_pageviews}</div>
            </div>
            <div className="analytics-card">
              <div className="analytics-card-label">Unique sessions</div>
              <div className="analytics-card-value">{summary.unique_sessions}</div>
            </div>
            <div className="analytics-card">
              <div className="analytics-card-label">Human pageviews</div>
              <div className="analytics-card-value">{summary.human_pageviews}</div>
              <div className="analytics-card-sub">Bots excluded</div>
            </div>
            <div className="analytics-card">
              <div className="analytics-card-label">Bot pageviews</div>
              <div className="analytics-card-value">{summary.bot_pageviews}</div>
            </div>
            <div className="analytics-card">
              <div className="analytics-card-label">Human sessions</div>
              <div className="analytics-card-value">{summary.human_sessions}</div>
            </div>
            <div className="analytics-card">
              <div className="analytics-card-label">Bot sessions</div>
              <div className="analytics-card-value">{summary.bot_sessions}</div>
            </div>
            <div className="analytics-card">
              <div className="analytics-card-label">Avg time on page</div>
              <div className="analytics-card-value">{formatDuration(summary.avg_page_duration_ms)}</div>
              <div className="analytics-card-sub">
                Humans: {formatDuration(summary.avg_page_duration_human_ms)}
              </div>
            </div>
            <div className="analytics-card">
              <div className="analytics-card-label">Avg session length</div>
              <div className="analytics-card-value">{formatDuration(summary.avg_session_duration_ms)}</div>
              <div className="analytics-card-sub">
                Humans: {formatDuration(summary.avg_session_duration_human_ms)}
              </div>
            </div>
            <div className="analytics-card analytics-chart">
              <div className="analytics-card-label">Daily trend</div>
              <div className="analytics-chart-list">
                {timeseries.map(point => (
                  <div key={point.day} className="analytics-chart-row">
                    <span>{point.day}</span>
                    <span>{point.pageviews}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="analytics-card">
              <div className="analytics-card-label">Top pages</div>
              <ul>
                {summary.top_paths.map(item => (
                  <li key={item.path}>
                    <span>{item.path}</span>
                    <span>{item.count}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="analytics-card">
              <div className="analytics-card-label">Top referrers</div>
              <ul>
                {summary.top_referrers.map(item => (
                  <li key={item.referrer}>
                    <span>{item.referrer}</span>
                    <span>{item.count}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="analytics-card">
              <div className="analytics-card-label">Devices</div>
              <ul>
                {summary.top_devices.map(item => (
                  <li key={item.device}>
                    <span>{item.device}</span>
                    <span>{item.count}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="analytics-card">
              <div className="analytics-card-label">Countries</div>
              <ul>
                {summary.top_countries.map(item => (
                  <li key={item.country}>
                    <span>{item.country}</span>
                    <span>{item.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}
