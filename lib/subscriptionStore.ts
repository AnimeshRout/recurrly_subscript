import { create } from 'zustand';
import { HOME_SUBSCRIPTIONS } from '@/constants/data';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import {
  mapRowToSubscription,
  mapSubscriptionToRow,
  type SubscriptionRow,
} from '@/lib/subscriptionMapper';

type SubscriptionStore = {
  subscriptions: Subscription[];
  loading: boolean;
  error: string | null;
  loadSubscriptions: (userId: string) => Promise<void>;
  addSubscription: (subscription: Subscription, userId: string) => Promise<void>;
  updateSubscription: (subscription: Subscription, userId: string) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  clear: () => void;
};

async function seedIfEmpty(userId: string) {
  const seeds = HOME_SUBSCRIPTIONS.map((item) =>
    mapSubscriptionToRow({ ...item, id: `${userId.slice(0, 8)}-${item.id}` }, userId)
  );
  const { error } = await supabase.from('subscriptions').insert(seeds);
  if (error) throw error;
}

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  subscriptions: HOME_SUBSCRIPTIONS,
  loading: false,
  error: null,
  clear: () => set({ subscriptions: HOME_SUBSCRIPTIONS, error: null, loading: false }),
  loadSubscriptions: async (userId) => {
    if (!isSupabaseConfigured) {
      set({ subscriptions: HOME_SUBSCRIPTIONS, loading: false });
      return;
    }
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('renewal_date', { ascending: true });

    if (error) {
      set({ error: error.message, loading: false });
      return;
    }

    if (!data || data.length === 0) {
      try {
        await seedIfEmpty(userId);
        const { data: seeded } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .order('renewal_date', { ascending: true });
        set({
          subscriptions: (seeded as SubscriptionRow[] | null)?.map(mapRowToSubscription) ?? [],
          loading: false,
        });
        return;
      } catch (seedError) {
        set({
          error: seedError instanceof Error ? seedError.message : 'Failed to load subscriptions',
          loading: false,
        });
        return;
      }
    }

    set({
      subscriptions: (data as SubscriptionRow[]).map(mapRowToSubscription),
      loading: false,
    });
  },
  addSubscription: async (subscription, userId) => {
    set({ subscriptions: [subscription, ...get().subscriptions], error: null });
    if (!isSupabaseConfigured || !userId || userId === 'local') return;
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(mapSubscriptionToRow(subscription, userId))
      .select('*')
      .single();
    if (error) {
      set({ error: error.message });
      return;
    }
    set({
      subscriptions: get().subscriptions.map((item) =>
        item.id === subscription.id ? mapRowToSubscription(data as SubscriptionRow) : item
      ),
    });
  },
  updateSubscription: async (subscription, userId) => {
    if (!isSupabaseConfigured) {
      set({
        subscriptions: get().subscriptions.map((item) =>
          item.id === subscription.id ? subscription : item
        ),
      });
      return;
    }
    const { error } = await supabase
      .from('subscriptions')
      .update(mapSubscriptionToRow(subscription, userId))
      .eq('id', subscription.id);
    if (error) {
      set({ error: error.message });
      return;
    }
    set({
      subscriptions: get().subscriptions.map((item) =>
        item.id === subscription.id ? subscription : item
      ),
    });
  },
  deleteSubscription: async (id) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('subscriptions').delete().eq('id', id);
      if (error) {
        set({ error: error.message });
        return;
      }
    }
    set({ subscriptions: get().subscriptions.filter((item) => item.id !== id) });
  },
}));
