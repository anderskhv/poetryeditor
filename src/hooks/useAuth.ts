import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!!supabase);

  useEffect(() => {
    if (!supabase) return;

    let isMounted = true;

    // Timeout to ensure loading resolves even if Supabase hangs
    const timeout = setTimeout(() => {
      if (isMounted) {
        console.warn('Auth session check timed out');
        setLoading(false);
      }
    }, 3000);

    const applySession = (session: Session | null) => {
      setSession(session);
      setUser(prev => {
        const next = session?.user ?? null;
        if (prev?.id === next?.id) return prev;
        return next;
      });
    };

    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (isMounted) {
          applySession(session);
        }
      })
      .catch((error) => {
        console.error('Failed to get auth session:', error);
      })
      .finally(() => {
        clearTimeout(timeout);
        if (isMounted) {
          setLoading(false);
        }
      });

    // Listen for auth changes. Keep the same user object when only the
    // session token refreshed so effects keyed on `user` do not reload.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (isMounted) {
          applySession(session);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase?.auth.signOut();
  };

  return {
    user,
    session,
    loading,
    signOut,
    isAuthenticated: !!user,
  };
}
