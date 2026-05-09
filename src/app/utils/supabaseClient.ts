import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const ENABLE_SUPABASE_AUTH = import.meta.env.VITE_ENABLE_SUPABASE_AUTH !== 'false';

let supabaseClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function getSupabaseUrl(): string {
  return SUPABASE_URL;
}

export function getSupabaseAnonKey(): string {
  return SUPABASE_ANON_KEY;
}

export function getSupabaseFunctionUrl(functionName: string): string {
  return `${SUPABASE_URL}/functions/v1/${functionName}`;
}

export function isSupabaseAuthEnabled(): boolean {
  return isSupabaseConfigured() && ENABLE_SUPABASE_AUTH;
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return supabaseClient;
}