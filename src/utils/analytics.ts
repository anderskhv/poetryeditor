import { supabase } from '../lib/supabase';

const isDev = import.meta.env.DEV;
const sessionId = (() => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 32);
  }
  return `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`.slice(0, 32);
})();

let lastPath = '';
let pageStart: number | null = null;
let currentPath = '';
let trackingInitialized = false;
let countryPromise: Promise<string> | null = null;
let heartbeatTimer: number | null = null;
let cumulativeDuration = 0;

const getDeviceType = (userAgent: string) => {
  if (!userAgent) return 'unknown';
  if (/ipad|tablet/i.test(userAgent)) return 'tablet';
  if (/mobi|android|iphone|ipod/i.test(userAgent)) return 'mobile';
  return 'desktop';
};

const getCountryCode = async () => {
  if (typeof window === 'undefined') return 'unknown';
  const cached = window.sessionStorage.getItem('analytics_country');
  if (cached) return cached;
  if (!countryPromise) {
    countryPromise = fetch('/cdn-cgi/trace')
      .then((res) => res.text())
      .then((text) => {
        const match = text.split('\n').find((line) => line.startsWith('loc='));
        const value = match ? match.replace('loc=', '').trim() : 'unknown';
        window.sessionStorage.setItem('analytics_country', value || 'unknown');
        return value || 'unknown';
      })
      .catch(() => 'unknown');
  }
  return countryPromise;
};

const MIN_DURATION_MS = 1000;

const sendDuration = async (path: string, durationMs: number, userId?: string | null) => {
  if (isDev || !supabase || !path || durationMs < MIN_DURATION_MS) return;
  const roundedDuration = Math.round(durationMs);
  const baseEvent = {
    event_type: 'page_duration',
    path,
    referrer: typeof document !== 'undefined' ? document.referrer : null,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    user_id: userId || null,
    session_id: sessionId,
    payload: { reason: 'duration', duration_ms: roundedDuration },
  } as any;
  try {
    const { error } = await supabase.from('analytics_events').insert({
      ...baseEvent,
      duration_ms: roundedDuration,
    });
    if (error) {
      const message = (error.message || '').toLowerCase();
      if (message.includes('duration_ms') && message.includes('does not exist')) {
        const retry = await supabase.from('analytics_events').insert(baseEvent);
        if (retry.error) throw retry.error;
        return;
      }
      throw error;
    }
  } catch (error) {
    console.warn('Analytics duration tracking failed', error);
  }
};

const flushDuration = (userId?: string | null) => {
  if (!currentPath || pageStart === null) return;
  const elapsed = Date.now() - pageStart;
  const totalDuration = cumulativeDuration + elapsed;
  pageStart = null;
  cumulativeDuration = 0;
  sendDuration(currentPath, totalDuration, userId);
};

const ensureDurationTracking = (userId?: string | null) => {
  if (trackingInitialized || typeof document === 'undefined') return;
  trackingInitialized = true;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushDuration(userId);
    }
  });
  window.addEventListener('pagehide', () => flushDuration(userId));
};

const startHeartbeat = (userId?: string | null) => {
  if (typeof window === 'undefined') return;
  if (heartbeatTimer) {
    window.clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
  heartbeatTimer = window.setInterval(() => {
    if (!currentPath || pageStart === null) return;
    const elapsed = Date.now() - pageStart;
    const totalDuration = cumulativeDuration + elapsed;
    if (totalDuration < 15000) return;
    // Send cumulative duration and reset tracking for next interval
    cumulativeDuration += elapsed;
    pageStart = Date.now();
    sendDuration(currentPath, cumulativeDuration, userId);
  }, 30000);
};

export async function trackPageview(path: string, userId?: string | null) {
  if (isDev || !supabase) return;
  if (!path || path === lastPath) return;
  if (currentPath && pageStart !== null) {
    flushDuration(userId);
  }
  lastPath = path;
  currentPath = path;
  pageStart = Date.now();
  cumulativeDuration = 0;
  ensureDurationTracking(userId);
  startHeartbeat(userId);

  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const payload = {
    device: getDeviceType(userAgent),
    country: await getCountryCode(),
  };

  try {
    await supabase.from('analytics_events').insert({
      event_type: 'pageview',
      path,
      referrer: typeof document !== 'undefined' ? document.referrer : null,
      user_agent: userAgent,
      screen_width: typeof window !== 'undefined' ? window.screen.width : null,
      screen_height: typeof window !== 'undefined' ? window.screen.height : null,
      viewport_width: typeof window !== 'undefined' ? window.innerWidth : null,
      viewport_height: typeof window !== 'undefined' ? window.innerHeight : null,
      language: typeof navigator !== 'undefined' ? navigator.language : null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      user_id: userId || null,
      session_id: sessionId,
      payload,
    } as any);
  } catch (error) {
    console.warn('Analytics tracking failed', error);
  }
}
