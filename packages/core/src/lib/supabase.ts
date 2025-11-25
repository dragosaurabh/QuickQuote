import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Row types for database tables
interface BusinessRow {
  id: string;
  user_id: string;
  name: string;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  default_terms: string | null;
  default_validity_days: number;
  created_at: string;
  updated_at: string;
}

interface ServiceRow {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CustomerRow {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

interface QuoteRow {
  id: string;
  business_id: string;
  customer_id: string | null;
  quote_number: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  subtotal: number;
  discount_type: 'percentage' | 'fixed' | null;
  discount_value: number;
  total: number;
  notes: string | null;
  terms: string | null;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}

interface QuoteItemRow {
  id: string;
  quote_id: string;
  service_id: string | null;
  service_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

// Type for database schema
export type Database = {
  public: {
    Tables: {
      businesses: {
        Row: BusinessRow;
        Insert: Omit<BusinessRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<BusinessRow, 'id' | 'created_at' | 'updated_at'>>;
      };
      services: {
        Row: ServiceRow;
        Insert: Omit<ServiceRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ServiceRow, 'id' | 'created_at' | 'updated_at'>>;
      };
      customers: {
        Row: CustomerRow;
        Insert: Omit<CustomerRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CustomerRow, 'id' | 'created_at' | 'updated_at'>>;
      };
      quotes: {
        Row: QuoteRow;
        Insert: Omit<QuoteRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<QuoteRow, 'id' | 'created_at' | 'updated_at'>>;
      };
      quote_items: {
        Row: QuoteItemRow;
        Insert: Omit<QuoteItemRow, 'id' | 'created_at'>;
        Update: Partial<Omit<QuoteItemRow, 'id' | 'created_at'>>;
      };
    };
  };
};

let supabaseClient: SupabaseClient<Database> | null = null;

/**
 * Creates a Supabase client for browser usage
 * This is a basic client - for Next.js apps, use createClientComponentClient from @supabase/auth-helpers-nextjs
 * Returns null during build time when env vars are not available
 */
export function createBrowserClient(): SupabaseClient<Database> | null {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Return null during build time when env vars are not available
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === 'undefined') {
      // Server-side/build time - return null silently
      return null;
    }
    // Client-side - this is a real error
    console.error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required');
    return null;
  }

  supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}

/**
 * Creates a Supabase admin client for server-side operations
 * Uses service role key for elevated permissions (bypasses RLS)
 */
export function createAdminClient(
  supabaseUrl?: string,
  supabaseServiceKey?: string
): SupabaseClient<Database> {
  const url = supabaseUrl || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = supabaseServiceKey || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase server environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }

  return createClient<Database>(url, key);
}

/**
 * Supabase configuration helper
 * Returns the environment variables needed for Supabase client initialization
 */
export function getSupabaseConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  };
}

export type { SupabaseClient };
