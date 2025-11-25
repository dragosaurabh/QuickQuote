import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@quickquote/core/lib';

/**
 * Creates a Supabase client for client components
 * Handles authentication state automatically via cookies
 */
export function createClient() {
  return createClientComponentClient<Database>();
}

/**
 * Creates a Supabase client for server components
 * Requires cookies() from next/headers for authentication
 */
export function createServerClient() {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
}

// Re-export Database type for convenience
export type { Database };
