import { Text, View, TextInput, FlatList, useWindowDimensions, Pressable, Image } from 'react-native';
import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import SubscriptionCard from '@/components/SubscriptionCard';
import PageShell from '@/components/PageShell';
import { useSubscriptionStore } from '@/lib/subscriptionStore';
import { HOME_SUBSCRIPTIONS } from '@/constants/data';
import { useAuth } from '@/lib/auth';
import { icons } from '@/constants/icons';

const Subscriptions = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const { subscriptions, updateSubscription } = useSubscriptionStore();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const source = subscriptions.length > 0 ? subscriptions : HOME_SUBSCRIPTIONS;

  const filteredSubscriptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return source;
    return source.filter(
      (subscription) =>
        subscription.name.toLowerCase().includes(query) ||
        subscription.category?.toLowerCase().includes(query) ||
        subscription.plan?.toLowerCase().includes(query)
    );
  }, [searchQuery, source]);

  const handleCancel = async (item: Subscription) => {
    setCancellingId(item.id);
    await updateSubscription({ ...item, status: 'cancelled' }, user?.id ?? 'local');
    setCancellingId(null);
  };

  return (
    <PageShell>
      <FlatList
        data={filteredSubscriptions}
        keyExtractor={(item) => item.id}
        numColumns={isWide ? 2 : 1}
        key={isWide ? 'wide' : 'narrow'}
        columnWrapperStyle={isWide ? { gap: 16 } : undefined}
        ListHeaderComponent={
          <View style={{ paddingTop: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Pressable
                onPress={() => router.push('/(tabs)')}
                accessibilityLabel="Go back"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#fff8e7',
                  borderWidth: 1,
                  borderColor: 'rgba(0, 0, 0, 0.08)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image source={icons.back} style={{ width: 18, height: 18 }} resizeMode="contain" />
              </Pressable>
              <Text style={{ fontSize: 26, fontFamily: 'sans-bold', color: '#081126' }}>
                My Subscriptions
              </Text>
            </View>
            <TextInput
              style={{
                borderRadius: 16,
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, 0.12)',
                backgroundColor: '#fff8e7',
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 15,
                fontFamily: 'sans-medium',
                color: '#081126',
                marginBottom: 16,
              }}
              placeholder="Search subscriptions..."
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              accessibilityLabel="Search subscriptions"
            />
          </View>
        }
        renderItem={({ item }) => (
          <View className={isWide ? 'flex-1' : undefined}>
            <SubscriptionCard
              {...item}
              expanded={expandedId === item.id}
              onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
              onCancelPress={() => void handleCancel(item)}
              isCancelling={cancellingId === item.id}
            />
          </View>
        )}
        ItemSeparatorComponent={() => <View className="h-3" />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListEmptyComponent={<Text className="home-empty-state">No matching subscriptions.</Text>}
      />
    </PageShell>
  );
};

export default Subscriptions;
