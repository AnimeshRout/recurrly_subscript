import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import type { Session, User } from '@supabase/supabase-js';
import { analytics } from '@/lib/analytics';
import { DOMAIN_RESTRICTED_MESSAGE, getAllowedEmailDomain, isAllowedEmail } from '@/lib/domain';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'user';
  created_at: string;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  isAuthenticating: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function getAuthRedirectUri() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`;
  }
  return Linking.createURL('auth/callback');
}

function parseAuthParams(url: string) {
  const normalized = url.replace('#', '?');
  const queryIndex = normalized.indexOf('?');
  const search = queryIndex >= 0 ? normalized.slice(queryIndex + 1) : '';
  const params = new URLSearchParams(search);
  return {
    code: params.get('code'),
    access_token: params.get('access_token'),
    refresh_token: params.get('refresh_token'),
    error: params.get('error'),
    error_description: params.get('error_description'),
  };
}

export async function createSessionFromUrl(url: string) {
  const params = parseAuthParams(url);
  if (params.error) {
    throw new Error(params.error_description || params.error);
  }
  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (error) throw error;
    return;
  }
  if (params.access_token && params.refresh_token) {
    const { error } = await supabase.auth.setSession({
      access_token: params.access_token,
      refresh_token: params.refresh_token,
    });
    if (error) throw error;
  }
}

async function upsertProfile(user: User): Promise<Profile | null> {
  const email = user.email ?? '';
  const metadata = user.user_metadata ?? {};
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        email,
        full_name: metadata.full_name ?? metadata.name ?? null,
        avatar_url: metadata.avatar_url ?? metadata.picture ?? null,
      },
      { onConflict: 'id' }
    )
    .select('id, email, full_name, avatar_url, role, created_at')
    .single();

  if (error) {
    console.error('Failed to upsert profile', error);
    return null;
  }
  return data as Profile;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applySession = useCallback(async (nextSession: Session | null) => {
    if (!nextSession?.user) {
      setSession(null);
      setProfile(null);
      return;
    }

    const email = nextSession.user.email;
    if (!isAllowedEmail(email)) {
      setError(DOMAIN_RESTRICTED_MESSAGE);
      await supabase.auth.signOut();
      setSession(null);
      setProfile(null);
      analytics.capture('domain_restricted_login', { email });
      return;
    }

    const nextProfile = await upsertProfile(nextSession.user);
    setSession(nextSession);
    setProfile(nextProfile);
    analytics.identify(nextSession.user.id, { email });
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoaded(true);
      return;
    }

    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      await applySession(data.session);
      setIsLoaded(true);
    });

    const { data } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      await applySession(nextSession);
      setIsLoaded(true);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [applySession]);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      setError(null);
      if (!isSupabaseConfigured) {
        setError('Supabase is not configured.');
        return;
      }
      if (!isAllowedEmail(email)) {
        setError(DOMAIN_RESTRICTED_MESSAGE);
        return;
      }
      setIsAuthenticating(true);
      try {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
        if (data.session) {
          await applySession(data.session);
        }
      } catch (authError) {
        const message =
          authError instanceof Error ? authError.message : 'Sign in failed. Please try again.';
        setError(message);
        analytics.capture('user_sign_in_failed', { error_message: message });
      } finally {
        setIsAuthenticating(false);
      }
    },
    [applySession]
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string) => {
      setError(null);
      if (!isSupabaseConfigured) {
        setError('Supabase is not configured.');
        return;
      }
      if (!isAllowedEmail(email)) {
        setError(DOMAIN_RESTRICTED_MESSAGE);
        return;
      }
      setIsAuthenticating(true);
      try {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (signUpError) throw signUpError;
        if (data.session) {
          await applySession(data.session);
        } else {
          setError('Confirmation email sent. Please check your inbox.');
        }
      } catch (authError) {
        const message =
          authError instanceof Error ? authError.message : 'Sign up failed. Please try again.';
        setError(message);
        analytics.capture('user_sign_up_failed', { error_message: message });
      } finally {
        setIsAuthenticating(false);
      }
    },
    [applySession]
  );

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
      return;
    }

    setIsAuthenticating(true);
    try {
      const redirectTo = getAuthRedirectUri();
      const domain = getAllowedEmailDomain();
      const queryParams: Record<string, string> = {
        access_type: 'offline',
        prompt: 'select_account',
      };
      if (domain && domain !== '*' && domain !== 'all') {
        queryParams.hd = domain;
      }

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: Platform.OS !== 'web',
          queryParams,
        },
      });

      if (oauthError) throw oauthError;

      if (Platform.OS !== 'web' && data.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        if (result.type === 'success' && result.url) {
          await createSessionFromUrl(result.url);
        }
      }
    } catch (authError) {
      const message =
        authError instanceof Error ? authError.message : 'Google sign-in failed. Please try again.';
      const restricted = message.toLowerCase().includes('hbplus') || message.toLowerCase().includes('official domain');
      setError(restricted ? DOMAIN_RESTRICTED_MESSAGE : message);
      analytics.capture('user_sign_in_failed', { error_message: message });
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    analytics.capture('user_signed_out');
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    analytics.reset();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      isLoaded,
      isSignedIn: Boolean(session?.user && isAllowedEmail(session.user.email)),
      isAuthenticating,
      error,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      clearError: () => setError(null),
    }),
    [session, profile, isLoaded, isAuthenticating, error, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
