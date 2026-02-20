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

const sendDuration = async (path: string, durationMs: number, userId?: string | null) => {
  if (isDev || !supabase || !path || durationMs <= 0) return;
  try {
    await supabase.from('analytics_events').insert({
      event_type: 'page_duration',
      path,
      referrer: typeof document !== 'undefined' ? document.referrer : null,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      user_id: userId || null,
      session_id: sessionId,
      duration_ms: Math.round(durationMs),
      payload: { reason: 'duration' },
    } as any);
  } catch (error) {
    console.warn('Analytics duration tracking failed', error);
  }
};

const flushDuration = (userId?: string | null) => {
  if (!currentPath || pageStart === null) return;
  const duration = Date.now() - pageStart;
  pageStart = null;
  sendDuration(currentPath, duration, userId);
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
  }
  heartbeatTimer = window.setInterval(() => {
    if (!currentPath || pageStart === null) return;
    const duration = Date.now() - pageStart;
    if (duration < 15000) return;
    pageStart = Date.now();
    sendDuration(currentPath, duration, userId);
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
