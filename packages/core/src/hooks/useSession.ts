'use client';

import { useState, useEffect, useCallback } from 'react';
import { Session, AuthError } from '@supabase/supabase-js';
import { createBrowserClient } from '../lib/supabase';

export interface SessionState {
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
}

export interface UseSessionReturn extends SessionState {
  refreshSession: () => Promise<void>;
  isAuthenticated: boolean;
}

/**
 * Hook for managing session state with Supabase Auth
 * Provides session information and refresh capabilities
 * Validates: Requirements 1.1, 1.3, 1.5
 */
export function useSession(): UseSessionReturn {
  const [state, setState] = useState<SessionState>({
    session: null,
    loading: true,
    error: null,
  });

  const supabase = createBrowserClient();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setState(prev => ({
          ...prev,
          session,
          loading: false,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error as AuthError,
          loading: false,
        }));
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setState(prev => ({
          ...prev,
          session,
          loading: false,
        }));
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const refreshSession = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      setState(prev => ({
        ...prev,
        session,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as AuthError,
        loading: false,
      }));
    }
  }, [supabase.auth]);

  return {
    ...state,
    refreshSession,
    isAuthenticated: !!state.session,
  };
}
