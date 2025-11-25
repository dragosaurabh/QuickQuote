'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '../lib/supabase';
import { Business } from '../types/models';
import { BusinessRow, toBusinessModel } from '../types/database';
import { BusinessFormInput, businessFormSchema } from '../types/schemas';

export interface BusinessState {
  business: Business | null;
  loading: boolean;
  error: Error | null;
}

export interface UseBusinessReturn extends BusinessState {
  refetch: () => Promise<void>;
  updateBusiness: (data: BusinessFormInput) => Promise<Business | null>;
  uploadLogo: (file: File) => Promise<string | null>;
}

/**
 * Hook for fetching and updating the current user's business profile
 * Validates: Requirements 2.4, 2.5
 */
export function useBusiness(): UseBusinessReturn {
  const [state, setState] = useState<BusinessState>({
    business: null,
    loading: true,
    error: null,
  });

  const supabase = useMemo(() => createBrowserClient(), []);

  const fetchBusiness = useCallback(async () => {
    if (!supabase) {
      setState({ business: null, loading: false, error: null });
      return;
    }
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setState({ business: null, loading: false, error: null });
        return;
      }

      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is expected for new users
        throw new Error(error.message);
      }

      setState({
        business: data ? toBusinessModel(data as unknown as BusinessRow) : null,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error('Failed to fetch business'),
      }));
    }
  }, [supabase]);

  useEffect(() => {
    fetchBusiness();
  }, [fetchBusiness]);

  const updateBusiness = useCallback(async (data: BusinessFormInput): Promise<Business | null> => {
    if (!supabase) return null;
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      // Validate input
      const validated = businessFormSchema.parse(data);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updateData = {
        name: validated.name,
        phone: validated.phone || null,
        email: validated.email || null,
        address: validated.address || null,
        default_terms: validated.defaultTerms || null,
        default_validity_days: validated.defaultValidityDays,
      };

      const { data: updated, error } = await supabase
        .from('businesses')
        .update(updateData as never)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw new Error(error.message);

      const business = toBusinessModel(updated as unknown as BusinessRow);
      setState({ business, loading: false, error: null });
      return business;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to update business');
      setState(prev => ({ ...prev, loading: false, error: err }));
      return null;
    }
  }, [supabase]);

  const uploadLogo = useCallback(async (file: File): Promise<string | null> => {
    if (!supabase) return null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Validate file type and size (Requirements 2.3)
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload PNG or JPG.');
      }
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('File too large. Maximum size is 2MB.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw new Error(uploadError.message);

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      // Update business with new logo URL
      const { error: updateError } = await supabase
        .from('businesses')
        .update({ logo_url: publicUrl } as never)
        .eq('user_id', user.id);

      if (updateError) throw new Error(updateError.message);

      // Refetch to get updated business
      await fetchBusiness();
      return publicUrl;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to upload logo');
      setState(prev => ({ ...prev, error: err }));
      return null;
    }
  }, [supabase, fetchBusiness]);

  return {
    ...state,
    refetch: fetchBusiness,
    updateBusiness,
    uploadLogo,
  };
}
