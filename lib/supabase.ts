import 'react-native-url-polyfill/auto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

function createUnavailableClient(): SupabaseClient {
  return createClient('https://unavailable.supabase.co', 'public-anon-key', {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function createConfiguredClient(): SupabaseClient {
  const auth: {
    persistSession: boolean;
    autoRefreshToken: boolean;
    detectSessionInUrl: boolean;
    flowType: 'pkce';
    storage?: {
      getItem: (key: string) => Promise<string | null>;
      setItem: (key: string, value: string) => Promise<void>;
      removeItem: (key: string) => Promise<void>;
    };
  } = {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: Platform.OS === 'web',
    flowType: 'pkce',
  };

  if (Platform.OS !== 'web') {
    try {
      // Lazy require so web bundles do not pull native storage.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      auth.storage = AsyncStorage;
    } catch {
      // Session persistence is optional until native storage is installed.
    }
  }

  return createClient(supabaseUrl, supabaseAnonKey, { auth });
}

export const supabase = isSupabaseConfigured
  ? createConfiguredClient()
  : createUnavailableClient();
