'use client';

import { useState, useCallback } from 'react';
import { createBrowserClient } from '../lib/supabase';
import { Customer } from '../types/models';
import { CustomerRow, toCustomerModel } from '../types/database';
import { CustomerFormInput, customerFormSchema } from '../types/schemas';

export interface UpdateCustomerState {
  loading: boolean;
  error: Error | null;
}

export interface UseUpdateCustomerReturn extends UpdateCustomerState {
  updateCustomer: (id: string, data: CustomerFormInput) => Promise<Customer | null>;
  clearError: () => void;
}

/**
 * Hook for updating an existing customer
 * Validates: Requirements 4.4
 */
export function useUpdateCustomer(): UseUpdateCustomerReturn {
  const [state, setState] = useState<UpdateCustomerState>({
    loading: false,
    error: null,
  });

  const supabase = createBrowserClient();

  const updateCustomer = useCallback(async (id: string, data: CustomerFormInput): Promise<Customer | null> => {
    setState({ loading: true, error: null });
    try {
      // Validate input using Zod schema
      const validated = customerFormSchema.parse(data);

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
        phone: validated.phone,
        email: validated.email || null,
        address: validated.address || null,
      };

      // Update customer (RLS ensures user can only update their own customers)
      const { data: updated, error } = await supabase
        .from('customers')
        .update(updateData as never)
        .eq('id', id)
        .eq('business_id', businessId)
        .select()
        .single();

      if (error) throw new Error(error.message);

      setState({ loading: false, error: null });
      return toCustomerModel(updated as unknown as CustomerRow);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to update customer');
      setState({ loading: false, error: err });
      return null;
    }
  }, [supabase]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    updateCustomer,
    clearError,
  };
}
