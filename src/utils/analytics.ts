import { supabase } from '../lib/supabase';

const isDev = import.meta.env.DEV;
const sessionId = (() => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 32);
  }
  return `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`.slice(0, 32);
})();

let lastPath = '';

const getDeviceType = (userAgent: string) => {
  if (!userAgent) return 'unknown';
  if (/ipad|tablet/i.test(userAgent)) return 'tablet';
  if (/mobi|android|iphone|ipod/i.test(userAgent)) return 'mobile';
  return 'desktop';
};

export async function trackPageview(path: string, userId?: string | null) {
  if (isDev || !supabase) return;
  if (!path || path === lastPath) return;
  lastPath = path;

  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const payload = {
    device: getDeviceType(userAgent),
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
