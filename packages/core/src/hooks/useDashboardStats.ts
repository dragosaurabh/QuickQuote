'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '../lib/supabase';
import { Quote } from '../types/models';
import { QuoteRow, toQuoteModel } from '../types/database';
import {
  DashboardStats,
  calculateDashboardStats,
  getRecentQuotes,
} from '../lib/dashboard-stats';

export interface DashboardStatsState {
  stats: DashboardStats;
  recentQuotes: Quote[];
  loading: boolean;
  error: Error | null;
}

export interface UseDashboardStatsReturn extends DashboardStatsState {
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching dashboard statistics
 * Validates: Requirements 10.1, 10.2, 10.3, 10.4
 */
export function useDashboardStats(): UseDashboardStatsReturn {
  const [state, setState] = useState<DashboardStatsState>({
    stats: {
      totalQuotesThisMonth: 0,
      totalAcceptedValueThisMonth: 0,
      totalPendingAmount: 0,
    },
    recentQuotes: [],
    loading: true,
    error: null,
  });

  const supabase = createBrowserClient();

  const fetchStats = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: null,
        }));
        return;
      }


      // First get the user's business
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (businessError && businessError.code !== 'PGRST116') {
        throw new Error(businessError.message);
      }

      if (!businessData) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: null,
        }));
        return;
      }

      const businessId = (businessData as { id: string }).id;

      // Fetch all quotes for stats calculation
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      const quotes = (data || []).map(row => toQuoteModel(row as QuoteRow));
      const currentDate = new Date();

      // Calculate stats using pure functions
      const stats = calculateDashboardStats(quotes, currentDate);
      const recentQuotes = getRecentQuotes(quotes, 5);

      setState({
        stats,
        recentQuotes,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error('Failed to fetch dashboard stats'),
      }));
    }
  }, [supabase]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    ...state,
    refetch: fetchStats,
  };
}
