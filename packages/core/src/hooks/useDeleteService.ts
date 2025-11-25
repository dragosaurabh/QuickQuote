'use client';

import { useState, useCallback, useMemo } from 'react';
import { createBrowserClient } from '../lib/supabase';

export interface DeleteServiceState {
  loading: boolean;
  error: Error | null;
}

export interface UseDeleteServiceReturn extends DeleteServiceState {
  deleteService: (id: string) => Promise<boolean>;
  clearError: () => void;
}

/**
 * Hook for soft-deleting a service (marks as inactive)
 * Validates: Requirements 3.3
 */
export function useDeleteService(): UseDeleteServiceReturn {
  const [state, setState] = useState<DeleteServiceState>({
    loading: false,
    error: null,
  });

  const supabase = useMemo(() => createBrowserClient(), []);

  /**
   * Soft delete a service by marking it as inactive
   * This preserves historical quote data while hiding the service from selection
   */
  const deleteService = useCallback(async (id: string): Promise<boolean> => {
    setState({ loading: true, error: null });
    try {
      if (!supabase) throw new Error('Supabase client not available');
      
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

      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('services')
        .update({ is_active: false } as never)
        .eq('id', id)
        .eq('business_id', businessId);

      if (error) throw new Error(error.message);

      setState({ loading: false, error: null });
      return true;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to delete service');
      setState({ loading: false, error: err });
      return false;
    }
  }, [supabase]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    deleteService,
    clearError,
  };
}
