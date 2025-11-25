'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { createBrowserClient } from '../lib/supabase';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
}

export interface UseAuthReturn extends AuthState {
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for managing authentication state and actions with Supabase Auth
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5
 */
export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const supabase = useMemo(() => createBrowserClient(), []);

  useEffect(() => {
    // Skip if supabase client is not available (build time)
    if (!supabase) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setState(prev => ({
          ...prev,
          user: session?.user ?? null,
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
          user: session?.user ?? null,
          loading: false,
        }));
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return;
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as AuthError,
        loading: false,
      }));
    }
  }, [supabase]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!supabase) return;
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as AuthError,
        loading: false,
      }));
    }
  }, [supabase]);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    if (!supabase) return;
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as AuthError,
        loading: false,
      }));
    }
  }, [supabase]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setState(prev => ({
        ...prev,
        user: null,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as AuthError,
        loading: false,
      }));
    }
  }, [supabase]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    clearError,
  };
}
