'use client';

import { useState, useCallback } from 'react';
import { createBrowserClient } from '../lib/supabase';
import { Business } from '../types/models';
import { BusinessRow, toBusinessModel } from '../types/database';
import { BusinessFormInput, businessFormSchema } from '../types/schemas';

export interface CreateBusinessState {
  loading: boolean;
  error: Error | null;
}

export interface UseCreateBusinessReturn extends CreateBusinessState {
  createBusiness: (data: BusinessFormInput) => Promise<Business | null>;
  clearError: () => void;
}

/**
 * Hook for creating a new business profile during onboarding
 * Validates: Requirements 2.1, 2.2, 2.4
 */
export function useCreateBusiness(): UseCreateBusinessReturn {
  const [state, setState] = useState<CreateBusinessState>({
    loading: false,
    error: null,
  });

  const supabase = createBrowserClient();

  const createBusiness = useCallback(async (data: BusinessFormInput): Promise<Business | null> => {
    setState({ loading: true, error: null });
    try {
      // Validate input using Zod schema (Requirements 2.2, 13.2)
      const validated = businessFormSchema.parse(data);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const insertData = {
        user_id: user.id,
        name: validated.name,
        phone: validated.phone || null,
        email: validated.email || null,
        address: validated.address || null,
        default_terms: validated.defaultTerms || null,
        default_validity_days: validated.defaultValidityDays,
        logo_url: null,
      };

      const { data: created, error } = await supabase
        .from('businesses')
        .insert(insertData as never)
        .select()
        .single();

      if (error) {
        // Handle unique constraint violation
        if (error.code === '23505') {
          throw new Error('A business profile already exists for this account');
        }
        throw new Error(error.message);
      }

      setState({ loading: false, error: null });
      return toBusinessModel(created as unknown as BusinessRow);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to create business');
      setState({ loading: false, error: err });
      return null;
    }
  }, [supabase]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    createBusiness,
    clearError,
  };
}
