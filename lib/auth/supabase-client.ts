import { createClient } from '@supabase/supabase-js';

// Safe Supabase client creation that handles missing environment variables
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // For build time, provide dummy values to prevent errors
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === 'undefined') {
      // Server-side/build-time: return a dummy client
      return createClient('https://dummy.supabase.co', 'dummy-key', {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      });
    }
    console.warn('Supabase environment variables not available');
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
}

export const supabase = createSupabaseClient()!; // Non-null assertion for build compatibility

// Helper function to check if Supabase is available
export function isSupabaseAvailable() {
  return supabase !== null && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

// Safe wrapper for Supabase operations
export function withSupabase<T>(operation: (client: NonNullable<typeof supabase>) => T, fallback?: T): T | null {
  if (!isSupabaseAvailable() || !supabase) {
    console.warn('Supabase client not available');
    return fallback ?? null;
  }
  return operation(supabase);
}