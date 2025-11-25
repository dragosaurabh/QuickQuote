'use client';

import { useState, useCallback } from 'react';
import { createBrowserClient } from '../lib/supabase';
import { Customer } from '../types/models';
import { CustomerRow, toCustomerModel } from '../types/database';
import { CustomerFormInput, customerFormSchema } from '../types/schemas';

export interface CreateCustomerState {
  loading: boolean;
  error: Error | null;
}

export interface UseCreateCustomerReturn extends CreateCustomerState {
  createCustomer: (data: CustomerFormInput) => Promise<Customer | null>;
  clearError: () => void;
}

/**
 * Hook for creating a new customer
 * Validates: Requirements 4.1, 4.2
 */
export function useCreateCustomer(): UseCreateCustomerReturn {
  const [state, setState] = useState<CreateCustomerState>({
    loading: false,
    error: null,
  });

  const supabase = createBrowserClient();

  const createCustomer = useCallback(async (data: CustomerFormInput): Promise<Customer | null> => {
    setState({ loading: true, error: null });
    try {
      // Validate input using Zod schema
      const validated = customerFormSchema.parse(data);

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
        phone: validated.phone,
        email: validated.email || null,
        address: validated.address || null,
      };

      const { data: created, error } = await supabase
        .from('customers')
        .insert(insertData as never)
        .select()
        .single();

      if (error) throw new Error(error.message);

      setState({ loading: false, error: null });
      return toCustomerModel(created as unknown as CustomerRow);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to create customer');
      setState({ loading: false, error: err });
      return null;
    }
  }, [supabase]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    createCustomer,
    clearError,
  };
}
