'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '../lib/supabase';
import { Quote, QuoteStatus, Customer } from '../types/models';
import { QuoteRow, CustomerRow, toQuoteModel, toCustomerModel } from '../types/database';

export interface QuotesState {
  quotes: Quote[];
  loading: boolean;
  error: Error | null;
}

export interface QuotesFilter {
  status?: QuoteStatus;
  search?: string;
}

export interface UseQuotesReturn extends QuotesState {
  refetch: () => Promise<void>;
  filterQuotes: (filter: QuotesFilter) => Quote[];
}

/**
 * Hook for fetching quotes for the current user's business
 * Validates: Requirements 9.1, 9.2, 9.3
 */
export function useQuotes(): UseQuotesReturn {
  const [state, setState] = useState<QuotesState>({
    quotes: [],
    loading: true,
    error: null,
  });

  const supabase = useMemo(() => createBrowserClient(), []);

  const fetchQuotes = useCallback(async () => {
    if (!supabase) {
      setState({ quotes: [], loading: false, error: null });
      return;
    }
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setState({ quotes: [], loading: false, error: null });
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
        setState({ quotes: [], loading: false, error: null });
        return;
      }

      const businessId = (businessData as { id: string }).id;

      // Fetch quotes with customer data, sorted by creation date descending
      // Validates: Requirements 9.1 - sorted by creation date descending
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          customers (*)
        `)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      const quotes = (data || []).map(row => {
        const quoteRow = row as unknown as QuoteRow & { customers: CustomerRow | null };
        const quote = toQuoteModel(quoteRow);
        if (quoteRow.customers) {
          quote.customer = toCustomerModel(quoteRow.customers);
        }
        return quote;
      });

      setState({ quotes, loading: false, error: null });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error('Failed to fetch quotes'),
      }));
    }
  }, [supabase]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  /**
   * Filter quotes by status and/or search query
   * Validates: Requirements 9.2 (status filter), 9.3 (search)
   */
  const filterQuotes = useCallback((filter: QuotesFilter): Quote[] => {
    let filtered = state.quotes;

    // Filter by status
    if (filter.status) {
      filtered = filtered.filter(quote => quote.status === filter.status);
    }

    // Filter by search query (customer name or quote number)
    if (filter.search && filter.search.trim()) {
      const lowerQuery = filter.search.toLowerCase().trim();
      filtered = filtered.filter(quote =>
        quote.quoteNumber.toLowerCase().includes(lowerQuery) ||
        (quote.customer?.name.toLowerCase().includes(lowerQuery))
      );
    }

    return filtered;
  }, [state.quotes]);

  return {
    ...state,
    refetch: fetchQuotes,
    filterQuotes,
  };
}
