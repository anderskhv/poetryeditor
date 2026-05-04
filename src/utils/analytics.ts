import { supabase } from '../lib/supabase';

// Same regex used by analyticsApi.ts and the monitoring dashboard.
const BOT_REGEX = /(bot|crawler|spider|crawling|slurp|bingpreview|facebookexternalhit|discordbot|twitterbot|linkedinbot|whatsapp|telegrambot|pinterest|embedly|quora link preview|slackbot|applebot|semrush|ahrefs|mj12|dotbot|yandex|baiduspider|duckduckbot)/i;
const isBotUA = (ua: string) => BOT_REGEX.test(ua || '');

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
  if (typeof navigator !== 'undefined' && isBotUA(navigator.userAgent)) return;
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

const MAX_DURATION_MS = 60 * 60 * 1000;

const flushDuration = (userId?: string | null) => {
  if (!currentPath || pageStart === null) return;
  const elapsed = Date.now() - pageStart;
  pageStart = null;
  if (elapsed > MAX_DURATION_MS) return;
  sendDuration(currentPath, elapsed, userId);
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

export async function trackPageview(path: string, userId?: string | null) {
  if (isDev || !supabase) return;
  if (!path || path === lastPath) return;
  if (typeof navigator !== 'undefined' && isBotUA(navigator.userAgent)) return;
  if (currentPath && pageStart !== null) {
    flushDuration(userId);
  }
  lastPath = path;
  currentPath = path;
  pageStart = Date.now();
  ensureDurationTracking(userId);

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
