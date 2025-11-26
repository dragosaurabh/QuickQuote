'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '../lib/supabase';
import { Quote, QuoteItem, Customer } from '../types/models';
import { QuoteRow, QuoteItemRow, CustomerRow, toQuoteModel, toQuoteItemModel, toCustomerModel } from '../types/database';

export interface QuoteState {
  quote: Quote | null;
  loading: boolean;
  error: Error | null;
}

export interface UseQuoteReturn extends QuoteState {
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching a single quote by ID with all related data
 * Validates: Requirements 9.1
 */
export function useQuote(quoteId: string | null): UseQuoteReturn {
  const [state, setState] = useState<QuoteState>({
    quote: null,
    loading: !!quoteId,
    error: null,
  });

  const supabase = useMemo(() => createBrowserClient(), []);

  const fetchQuote = useCallback(async () => {
    if (!quoteId || !supabase) {
      setState({ quote: null, loading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      // Fetch quote first
      const { data: quoteData, error: quoteError } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', quoteId)
        .single();

      if (quoteError) {
        throw new Error(quoteError.message);
      }

      if (!quoteData) {
        setState({ quote: null, loading: false, error: new Error('Quote not found') });
        return;
      }

      const quote = toQuoteModel(quoteData as unknown as QuoteRow);

      // Fetch customer separately if exists
      if (quote.customerId) {
        const { data: customerData } = await supabase
          .from('customers')
          .select('*')
          .eq('id', quote.customerId)
          .single();

        if (customerData) {
          quote.customer = toCustomerModel(customerData as unknown as CustomerRow);
        }
      }

      // Fetch quote items separately
      const { data: itemsData } = await supabase
        .from('quote_items')
        .select('*')
        .eq('quote_id', quoteId);

      if (itemsData && itemsData.length > 0) {
        quote.items = itemsData.map(item => toQuoteItemModel(item as unknown as QuoteItemRow));
      }

      setState({ quote, loading: false, error: null });
    } catch (error) {
      console.error('Error fetching quote:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error('Failed to fetch quote'),
      }));
    }
  }, [quoteId, supabase]);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  return {
    ...state,
    refetch: fetchQuote,
  };
}
