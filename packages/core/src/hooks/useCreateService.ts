'use client';

import { useState, useCallback } from 'react';
import { createBrowserClient } from '../lib/supabase';
import { Service } from '../types/models';
import { ServiceRow, toServiceModel } from '../types/database';
import { ServiceFormInput, serviceFormSchema } from '../types/schemas';

export interface CreateServiceState {
  loading: boolean;
  error: Error | null;
}

export interface UseCreateServiceReturn extends CreateServiceState {
  createService: (data: ServiceFormInput) => Promise<Service | null>;
  clearError: () => void;
}

/**
 * Hook for creating a new service
 * Validates: Requirements 3.1, 3.5
 */
export function useCreateService(): UseCreateServiceReturn {
  const [state, setState] = useState<CreateServiceState>({
    loading: false,
    error: null,
  });

  const supabase = createBrowserClient();

  const createService = useCallback(async (data: ServiceFormInput): Promise<Service | null> => {
    setState({ loading: true, error: null });
    try {
      // Validate input using Zod schema (Requirements 3.5)
      const validated = serviceFormSchema.parse(data);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get the user's business
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (businessError) throw new Error(businessError.message);
      if (!businessData) throw new Error('No business profile found. Please complete onboarding first.');

      const businessId = (businessData as { id: string }).id;

      const insertData = {
        business_id: businessId,
        name: validated.name,
        description: validated.description || null,
        price: validated.price,
        category: validated.category || null,
        is_active: true,
      };

      const { data: created, error } = await supabase
        .from('services')
        .insert(insertData as never)
        .select()
        .single();

      if (error) throw new Error(error.message);

      setState({ loading: false, error: null });
      return toServiceModel(created as unknown as ServiceRow);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to create service');
      setState({ loading: false, error: err });
      return null;
    }
  }, [supabase]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    createService,
    clearError,
  };
}
