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
      // Fetch quote with customer and items
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          customer:customers (*),
          quote_items (*)
        `)
        .eq('id', quoteId)
        .single();

      if (error) {
        throw new Error(error.message);
      }


      if (!data) {
        setState({ quote: null, loading: false, error: new Error('Quote not found') });
        return;
      }

      const quoteRow = data as unknown as QuoteRow & {
        customer: CustomerRow | null;
        quote_items: QuoteItemRow[];
      };

      const quote = toQuoteModel(quoteRow);

      if (quoteRow.customer) {
        quote.customer = toCustomerModel(quoteRow.customer);
      }

      if (quoteRow.quote_items) {
        quote.items = quoteRow.quote_items.map(item => toQuoteItemModel(item));
      }

      setState({ quote, loading: false, error: null });
    } catch (error) {
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
