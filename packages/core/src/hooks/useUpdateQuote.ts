'use client';

import { useState, useCallback, useMemo } from 'react';
import { createBrowserClient } from '../lib/supabase';
import { Quote, QuoteStatus } from '../types/models';
import { QuoteRow, toQuoteModel } from '../types/database';

export interface UpdateQuoteInput {
  status?: QuoteStatus;
  notes?: string;
  terms?: string;
  validUntil?: Date;
}

export interface UpdateQuoteState {
  loading: boolean;
  error: Error | null;
}

export interface UseUpdateQuoteReturn extends UpdateQuoteState {
  updateQuote: (quoteId: string, input: UpdateQuoteInput) => Promise<Quote | null>;
  reset: () => void;
}

/**
 * Hook for updating an existing quote
 * Validates: Requirements 9.5
 */
export function useUpdateQuote(): UseUpdateQuoteReturn {
  const [state, setState] = useState<UpdateQuoteState>({
    loading: false,
    error: null,
  });

  const supabase = useMemo(() => createBrowserClient(), []);

  const updateQuote = useCallback(async (
    quoteId: string,
    input: UpdateQuoteInput
  ): Promise<Quote | null> => {
    if (!supabase) return null;
    setState({ loading: true, error: null });
    try {
      const updateData: Record<string, unknown> = {};

      if (input.status !== undefined) {
        updateData.status = input.status;
      }
      if (input.notes !== undefined) {
        updateData.notes = input.notes;
      }
      if (input.terms !== undefined) {
        updateData.terms = input.terms;
      }
      if (input.validUntil !== undefined) {
        updateData.valid_until = input.validUntil.toISOString().split('T')[0];
      }


      const { data, error } = await supabase
        .from('quotes')
        .update(updateData as never)
        .eq('id', quoteId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const quote = toQuoteModel(data as unknown as QuoteRow);
      setState({ loading: false, error: null });
      return quote;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to update quote');
      setState({ loading: false, error: err });
      return null;
    }
  }, [supabase]);

  const reset = useCallback(() => {
    setState({ loading: false, error: null });
  }, []);

  return {
    ...state,
    updateQuote,
    reset,
  };
}
