'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '../lib/supabase';
import { Service } from '../types/models';
import { ServiceRow, toServiceModel } from '../types/database';

export interface ServicesState {
  services: Service[];
  loading: boolean;
  error: Error | null;
}

export interface UseServicesReturn extends ServicesState {
  refetch: () => Promise<void>;
  getServicesByCategory: () => Map<string, Service[]>;
}

/**
 * Hook for fetching services for the current user's business
 * Validates: Requirements 3.1, 3.4
 */
export function useServices(): UseServicesReturn {
  const [state, setState] = useState<ServicesState>({
    services: [],
    loading: true,
    error: null,
  });

  const supabase = createBrowserClient();

  const fetchServices = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setState({ services: [], loading: false, error: null });
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
        setState({ services: [], loading: false, error: null });
        return;
      }

      const businessId = (businessData as { id: string }).id;

      // Fetch services for the business (only active by default)
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', businessId)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      const services = (data || []).map(row => toServiceModel(row as unknown as ServiceRow));
      setState({ services, loading: false, error: null });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error('Failed to fetch services'),
      }));
    }
  }, [supabase]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  /**
   * Groups services by category
   * Validates: Requirements 3.4
   */
  const getServicesByCategory = useCallback((): Map<string, Service[]> => {
    const grouped = new Map<string, Service[]>();
    
    state.services.forEach(service => {
      const category = service.category || 'Uncategorized';
      const existing = grouped.get(category) || [];
      grouped.set(category, [...existing, service]);
    });

    return grouped;
  }, [state.services]);

  return {
    ...state,
    refetch: fetchServices,
    getServicesByCategory,
  };
}
