import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export type AdminProfile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'user';
  created_at: string;
};

export type AdminSubscription = {
  id: string;
  user_id: string;
  name: string;
  plan: string | null;
  category: string | null;
  payment_method: string | null;
  status: string | null;
  start_date: string | null;
  price: number;
  currency: string | null;
  billing: string | null;
  frequency: string | null;
  renewal_date: string | null;
  color: string | null;
  icon_key: string | null;
};

export function useAdminAccess() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AdminProfile | null>(null);

  const refresh = useCallback(async () => {
    try {
      if (!isSupabaseConfigured) {
        setIsAdmin(false);
        setProfile(null);
        return;
      }

      const { data: sessionData } = await supabase.auth.getUser();
      const userId = sessionData.user?.id;
      if (!userId) {
        setIsAdmin(false);
        setProfile(null);
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, role, created_at')
        .eq('id', userId)
        .maybeSingle();

      let nextProfile = (data as AdminProfile | null) ?? null;
      if (!nextProfile && sessionData.user) {
        const user = sessionData.user;
        const metadata = user.user_metadata ?? {};
        const { data: created } = await supabase
          .from('profiles')
          .upsert(
            {
              id: userId,
              email: user.email ?? '',
              full_name: metadata.full_name ?? metadata.name ?? null,
              avatar_url: metadata.avatar_url ?? metadata.picture ?? null,
              role: 'user',
            },
            { onConflict: 'id' }
          )
          .select('*')
          .maybeSingle();
        nextProfile = (created as AdminProfile | null) ?? null;
      }

      setProfile(nextProfile);
      setIsAdmin(nextProfile?.role === 'admin');
    } catch (err) {
      console.warn('useAdmin refresh error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const setRole = useCallback(
    async (newRole: 'admin' | 'user') => {
      if (!isSupabaseConfigured) return;
      const { data: sessionData } = await supabase.auth.getUser();
      const userId = sessionData.user?.id;
      if (!userId) return;
      await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      await refresh();
    },
    [refresh]
  );

  useEffect(() => {
    void refresh();
    if (!isSupabaseConfigured) return;
    const { data } = supabase.auth.onAuthStateChange(() => {
      void refresh();
    });
    return () => data.subscription.unsubscribe();
  }, [refresh]);

  return { isAdmin, loading, profile, refresh, setRole };
}
