import { useEffect, useMemo, useState } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { fetchAnalyticsDataDirect, type AnalyticsSummary, type AnalyticsTimeseriesPoint } from '../utils/analyticsApi';
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
  const [usingFallback, setUsingFallback] = useState(false);

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

    fetchAnalyticsDataDirect(range.start, range.end)
      .then(({ summary: summaryResult, timeseries: timeseriesResult, fallbackUsed, errorMessage }) => {
        if (!summaryResult) {
          setError(errorMessage || 'Analytics data not available.');
          return;
        }
        const normalized: AnalyticsSummary = {
          ...summaryResult,
          top_paths: summaryResult.top_paths || [],
          top_referrers: summaryResult.top_referrers || [],
          top_devices: summaryResult.top_devices || [],
          top_countries: summaryResult.top_countries || [],
          avg_page_duration_ms: summaryResult.avg_page_duration_ms || 0,
          avg_page_duration_human_ms: summaryResult.avg_page_duration_human_ms || 0,
          avg_session_duration_ms: summaryResult.avg_session_duration_ms || 0,
          avg_session_duration_human_ms: summaryResult.avg_session_duration_human_ms || 0,
        };
        setSummary(normalized);
        setTimeseries(timeseriesResult);
        setUsingFallback(fallbackUsed);
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
          <div className="analytics-empty">
            <div>{error}</div>
            <div className="analytics-debug">
              <div>Signed in: {user ? 'yes' : 'no'}</div>
              <div>Admin: {isAdmin ? 'yes' : 'no'}</div>
              <div>Host: {typeof window !== 'undefined' ? window.location.host : 'unknown'}</div>
              <div>Supabase configured: {Boolean(supabase) ? 'yes' : 'no'}</div>
            </div>
          </div>
        ) : summary ? (
          <div className="analytics-stack">
            {usingFallback && (
              <div className="analytics-fallback-note">
                Showing data via lightweight fallback queries. Once the analytics SQL is updated in Supabase, this banner will disappear.
              </div>
            )}
            <section className="analytics-section">
              <div className="analytics-section-header">
                <h2>Overview</h2>
                <span className="analytics-section-meta">Bots separated</span>
              </div>
              <div className="analytics-grid analytics-grid--overview">
                <div className="analytics-card analytics-card--hero">
                  <div className="analytics-card-label">
                    Total pageviews
                    <span className="analytics-metric-tag">Measured</span>
                  </div>
                  <div className="analytics-card-value">{summary.total_pageviews}</div>
                </div>
                <div className="analytics-card analytics-card--hero">
                  <div className="analytics-card-label">
                    Unique sessions
                    <span className="analytics-metric-tag">Measured</span>
                  </div>
                  <div className="analytics-card-value">{summary.unique_sessions}</div>
                </div>
                <div className="analytics-card">
                  <div className="analytics-card-label">
                    Human pageviews
                    <span className="analytics-metric-tag">Bot‑filtered</span>
                  </div>
                  <div className="analytics-card-value">{summary.human_pageviews}</div>
                  <div className="analytics-card-sub">Bots excluded</div>
                </div>
                <div className="analytics-card">
                  <div className="analytics-card-label">
                    Bot pageviews
                    <span className="analytics-metric-tag">Detected</span>
                  </div>
                  <div className="analytics-card-value">{summary.bot_pageviews}</div>
                </div>
                <div className="analytics-card">
                  <div className="analytics-card-label">
                    Human sessions
                    <span className="analytics-metric-tag">Bot‑filtered</span>
                  </div>
                  <div className="analytics-card-value">{summary.human_sessions}</div>
                </div>
                <div className="analytics-card">
                  <div className="analytics-card-label">
                    Bot sessions
                    <span className="analytics-metric-tag">Detected</span>
                  </div>
                  <div className="analytics-card-value">{summary.bot_sessions}</div>
                </div>
              </div>
            </section>

            <section className="analytics-section">
              <div className="analytics-section-header">
                <h2>Engagement</h2>
                <span className="analytics-section-meta">Time-based signals</span>
              </div>
              <div className="analytics-grid analytics-grid--engagement">
                <div className="analytics-card analytics-card--focus">
                  <div className="analytics-card-label">
                    Avg time on page
                    <span className="analytics-metric-tag">Measured</span>
                  </div>
                  <div className="analytics-card-value">{formatDuration(summary.avg_page_duration_ms)}</div>
                  <div className="analytics-card-sub">
                    Humans: {formatDuration(summary.avg_page_duration_human_ms)}
                  </div>
                </div>
                <div className="analytics-card analytics-card--focus">
                  <div className="analytics-card-label">
                    Avg session length
                    <span className="analytics-metric-tag">Measured</span>
                  </div>
                  <div className="analytics-card-value">{formatDuration(summary.avg_session_duration_ms)}</div>
                  <div className="analytics-card-sub">
                    Humans: {formatDuration(summary.avg_session_duration_human_ms)}
                  </div>
                </div>
              </div>
            </section>

            <section className="analytics-section">
              <div className="analytics-section-header">
                <h2>Traffic & Sources</h2>
                <span className="analytics-section-meta">Where attention comes from</span>
              </div>
              <div className="analytics-grid analytics-grid--sources">
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
                  <div className="analytics-card-label">Top pages (human)</div>
                  <ul>
                    {(summary.top_paths_human || summary.top_paths).map(item => (
                      <li key={item.path}>
                        <span>{item.path}</span>
                        <span>{item.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="analytics-card">
                  <div className="analytics-card-label">Top referrers (human)</div>
                  <ul>
                    {(summary.top_referrers_human || summary.top_referrers).map(item => (
                      <li key={item.referrer}>
                        <span>{item.referrer}</span>
                        <span>{item.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="analytics-card">
                  <div className="analytics-card-label">Devices (human)</div>
                  <ul>
                    {(summary.top_devices_human || summary.top_devices).map(item => (
                      <li key={item.device}>
                        <span>{item.device}</span>
                        <span>{item.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="analytics-card">
                  <div className="analytics-card-label">Countries (human)</div>
                  <ul>
                    {(summary.top_countries_human || []).map(item => (
                      <li key={item.country}>
                        <span>{item.country}</span>
                        <span>{item.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="analytics-card analytics-card--bots analytics-card--subtle">
                  <div className="analytics-card-label">Bot traffic (top agents)</div>
                  <ul>
                    {(summary.top_bot_user_agents || []).map(item => (
                      <li key={item.user_agent}>
                        <span>{item.user_agent}</span>
                        <span>{item.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}
