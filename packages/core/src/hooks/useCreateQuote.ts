'use client';

import { useState, useCallback, useMemo } from 'react';
import { createBrowserClient } from '../lib/supabase';
import { Quote } from '../types/models';
import { QuoteRow, QuoteItemRow, toQuoteModel, toQuoteItemModel } from '../types/database';

export interface CreateQuoteInput {
  customerId: string;
  items: Array<{
    serviceId?: string;
    serviceName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  total: number;
  notes?: string;
  terms?: string;
  validUntil?: Date;
}

export interface CreateQuoteState {
  loading: boolean;
  error: Error | null;
}

export interface UseCreateQuoteReturn extends CreateQuoteState {
  createQuote: (input: CreateQuoteInput) => Promise<Quote | null>;
  reset: () => void;
}

/**
 * Hook for creating a new quote
 * Validates: Requirements 5.1, 5.2, 5.6, 5.7, 5.8, 5.9
 */
export function useCreateQuote(): UseCreateQuoteReturn {
  const [state, setState] = useState<CreateQuoteState>({
    loading: false,
    error: null,
  });

  const supabase = useMemo(() => createBrowserClient(), []);

  const createQuote = useCallback(async (input: CreateQuoteInput): Promise<Quote | null> => {
    if (!supabase) return null;
    setState({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Authentication required');
      }


      // Get the user's business
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (businessError) {
        throw new Error(businessError.message);
      }

      if (!businessData) {
        throw new Error('Business not found. Please complete onboarding first.');
      }

      const businessId = (businessData as { id: string }).id;

      // Generate quote number and create quote with retry logic
      let quoteData: any = null;
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts && !quoteData) {
        attempts++;
        
        // Generate quote number
        const quoteNumber = await generateQuoteNumber(supabase, businessId);

        // Create the quote
        const quoteInsertData = {
          business_id: businessId,
          customer_id: input.customerId,
          quote_number: quoteNumber,
          status: 'pending',
          subtotal: input.subtotal,
          discount_type: input.discountType || null,
          discount_value: input.discountValue || 0,
          total: input.total,
          notes: input.notes || null,
          terms: input.terms || null,
          valid_until: input.validUntil ? input.validUntil.toISOString().split('T')[0] : null,
        };

        const { data, error: quoteError } = await supabase
          .from('quotes')
          .insert(quoteInsertData as never)
          .select()
          .single();

        if (quoteError) {
          // If it's a duplicate key error, retry with a new quote number
          if (quoteError.code === '23505' && attempts < maxAttempts) {
            console.warn(`Duplicate quote number detected, retrying... (attempt ${attempts}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 100 * attempts)); // Brief delay
            continue;
          }
          throw new Error(quoteError.message);
        }

        quoteData = data;
      }

      if (!quoteData) {
        throw new Error('Failed to create quote after multiple attempts');
      }

      const quote = toQuoteModel(quoteData as unknown as QuoteRow);

      // Create quote items
      if (input.items.length > 0) {
        const itemsToInsert = input.items.map(item => ({
          quote_id: quote.id,
          service_id: item.serviceId || null,
          service_name: item.serviceName,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.totalPrice,
        }));

        const { data: itemsData, error: itemsError } = await supabase
          .from('quote_items')
          .insert(itemsToInsert as never)
          .select();

        if (itemsError) {
          throw new Error(itemsError.message);
        }

        quote.items = (itemsData || []).map(item => toQuoteItemModel(item as unknown as QuoteItemRow));
      }

      setState({ loading: false, error: null });
      return quote;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to create quote');
      setState({ loading: false, error: err });
      return null;
    }
  }, [supabase]);

  const reset = useCallback(() => {
    setState({ loading: false, error: null });
  }, []);

  return {
    ...state,
    createQuote,
    reset,
  };
}

/**
 * Generate a unique quote number in format "QQ-YYYY-NNN"
 * Uses database function to ensure uniqueness
 * Validates: Requirements 5.9
 */
async function generateQuoteNumber(
  supabase: NonNullable<ReturnType<typeof createBrowserClient>>,
  businessId: string
): Promise<string> {
  // Try to use the database function first
  try {
    const { data, error } = await supabase.rpc('generate_quote_number');
    
    if (!error && data) {
      return data as string;
    }
  } catch (err) {
    console.warn('Database function not available, using fallback');
  }

  // Fallback to client-side generation with timestamp to ensure uniqueness
  const year = new Date().getFullYear();
  const timestamp = Date.now();
  const prefix = `QQ-${year}-`;

  // Get the highest quote number for this business and year
  const { data, error } = await supabase
    .from('quotes')
    .select('quote_number')
    .eq('business_id', businessId)
    .like('quote_number', `${prefix}%`)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    // If query fails, use timestamp-based number
    const uniqueNumber = timestamp % 100000;
    return `${prefix}${uniqueNumber.toString().padStart(5, '0')}`;
  }

  let nextNumber = 1;
  if (data && data.length > 0) {
    const lastNumber = (data[0] as { quote_number: string }).quote_number;
    const match = lastNumber.match(/QQ-\d{4}-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  // Pad to at least 3 digits
  const paddedNumber = nextNumber.toString().padStart(3, '0');
  return `${prefix}${paddedNumber}`;
}

// Export the generator for testing
export { generateQuoteNumber };
