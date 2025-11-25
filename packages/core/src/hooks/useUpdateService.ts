'use client';

import { useState, useCallback, useMemo } from 'react';
import { createBrowserClient } from '../lib/supabase';
import { Service } from '../types/models';
import { ServiceRow, toServiceModel } from '../types/database';
import { ServiceFormInput, serviceFormSchema } from '../types/schemas';

export interface UpdateServiceState {
  loading: boolean;
  error: Error | null;
}

export interface UseUpdateServiceReturn extends UpdateServiceState {
  updateService: (id: string, data: ServiceFormInput) => Promise<Service | null>;
  clearError: () => void;
}

/**
 * Hook for updating an existing service
 * Validates: Requirements 3.2
 */
export function useUpdateService(): UseUpdateServiceReturn {
  const [state, setState] = useState<UpdateServiceState>({
    loading: false,
    error: null,
  });

  const supabase = useMemo(() => createBrowserClient(), []);

  const updateService = useCallback(async (id: string, data: ServiceFormInput): Promise<Service | null> => {
    setState({ loading: true, error: null });
    try {
      if (!supabase) throw new Error('Supabase client not available');
      
      // Validate input using Zod schema (Requirements 3.5)
      const validated = serviceFormSchema.parse(data);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get the user's business to verify ownership
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (businessError) throw new Error(businessError.message);
      if (!businessData) throw new Error('No business profile found');

      const businessId = (businessData as { id: string }).id;

      const updateData = {
        name: validated.name,
        description: validated.description || null,
        price: validated.price,
        category: validated.category || null,
      };

      // Update service (RLS ensures user can only update their own services)
      const { data: updated, error } = await supabase
        .from('services')
        .update(updateData as never)
        .eq('id', id)
        .eq('business_id', businessId)
        .select()
        .single();

      if (error) throw new Error(error.message);

      setState({ loading: false, error: null });
      return toServiceModel(updated as unknown as ServiceRow);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to update service');
      setState({ loading: false, error: err });
      return null;
    }
  }, [supabase]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    updateService,
    clearError,
  };
}
