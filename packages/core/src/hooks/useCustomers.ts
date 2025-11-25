'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '../lib/supabase';
import { Customer } from '../types/models';
import { CustomerRow, toCustomerModel } from '../types/database';

export interface CustomersState {
  customers: Customer[];
  loading: boolean;
  error: Error | null;
}

export interface UseCustomersReturn extends CustomersState {
  refetch: () => Promise<void>;
  searchCustomers: (query: string) => Customer[];
}

/**
 * Hook for fetching customers for the current user's business
 * Validates: Requirements 4.1, 4.3
 */
export function useCustomers(): UseCustomersReturn {
  const [state, setState] = useState<CustomersState>({
    customers: [],
    loading: true,
    error: null,
  });

  const supabase = createBrowserClient();

  const fetchCustomers = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setState({ customers: [], loading: false, error: null });
        return;
      }

      // First get the user's business
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (businessError && businessError.code !== 'PGRST116') {
        throw new Error(businessError.message);
      }

      if (!businessData) {
        setState({ customers: [], loading: false, error: null });
        return;
      }

      const businessId = (businessData as { id: string }).id;

      // Fetch customers for the business
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('business_id', businessId)
        .order('name', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      const customers = (data || []).map(row => toCustomerModel(row as unknown as CustomerRow));
      setState({ customers, loading: false, error: null });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error('Failed to fetch customers'),
      }));
    }
  }, [supabase]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  /**
   * Search customers by name (client-side filtering for fast response)
   * Validates: Requirements 4.3 - search within 500ms
   */
  const searchCustomers = useCallback((query: string): Customer[] => {
    if (!query.trim()) {
      return state.customers;
    }
    
    const lowerQuery = query.toLowerCase().trim();
    return state.customers.filter(customer => 
      customer.name.toLowerCase().includes(lowerQuery) ||
      customer.phone.includes(query) ||
      (customer.email && customer.email.toLowerCase().includes(lowerQuery))
    );
  }, [state.customers]);

  return {
    ...state,
    refetch: fetchCustomers,
    searchCustomers,
  };
}
