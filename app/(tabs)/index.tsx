import {
  FlatList,
  Image,
  Pressable,
  Text,
  View,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import images from '@/constants/images';
import { icons } from '@/constants/icons';
import { formatCurrency } from '@/lib/utils';
import dayjs from 'dayjs';
import ListHeading from '@/components/ListHeading';
import UpcomingSubscriptionCard from '@/components/UpcomingSubscriptionCard';
import SubscriptionCard from '@/components/SubscriptionCard';
import CreateSubscriptionModal from '@/components/CreateSubscriptionModal';
import PageShell from '@/components/PageShell';
import { useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { analytics } from '@/lib/analytics';
import { useSubscriptionStore } from '@/lib/subscriptionStore';

export default function App() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const { subscriptions, addSubscription, updateSubscription, loading } = useSubscriptionStore();

  const upcomingSubscriptions = useMemo(() => {
    const now = dayjs();
    const nextWeek = now.add(7, 'days');
    return subscriptions
      .filter(
        (sub) =>
          sub.status === 'active' &&
          sub.renewalDate &&
          dayjs(sub.renewalDate).isAfter(now) &&
          dayjs(sub.renewalDate).isBefore(nextWeek)
      )
      .sort((a, b) => dayjs(a.renewalDate).diff(dayjs(b.renewalDate)))
      .map((sub) => ({
        id: sub.id,
        icon: sub.icon,
        name: sub.name,
        price: sub.price,
        currency: sub.currency,
        daysLeft: Math.max(1, dayjs(sub.renewalDate).diff(now, 'day')),
      }));
  }, [subscriptions]);

  const monthlyTotal = useMemo(
    () =>
      subscriptions
        .filter((sub) => sub.status === 'active')
        .reduce((sum, sub) => {
          if ((sub.billing || sub.frequency) === 'Yearly') return sum + sub.price / 12;
          return sum + sub.price;
        }, 0),
    [subscriptions]
  );

  const nextRenewal = upcomingSubscriptions[0]
    ? subscriptions.find((item) => item.id === upcomingSubscriptions[0].id)?.renewalDate
    : undefined;

  const handleSubscriptionPress = (item: Subscription) => {
    const isExpanding = expandedSubscriptionId !== item.id;
    setExpandedSubscriptionId((currentId) => (currentId === item.id ? null : item.id));
    analytics.capture(isExpanding ? 'subscription_expanded' : 'subscription_collapsed', {
      subscription_name: item.name,
      subscription_id: item.id,
    });
  };

  const handleCreateSubscription = (newSubscription: Subscription) => {
    void addSubscription(newSubscription, user?.id ?? 'local');
  };

  const handleCancel = async (item: Subscription) => {
    if (!user?.id) return;
    setCancellingId(item.id);
    await updateSubscription({ ...item, status: 'cancelled' }, user.id);
    setCancellingId(null);
    analytics.capture('subscription_cancelled', { subscription_id: item.id });
  };

  const displayName =
    profile?.full_name?.split(' ')[0] ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'User';
  const avatar = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <PageShell>
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#ea7a53" />
        </View>
      ) : (
        <FlatList
          ListHeaderComponent={() => (
            <>
              {/* Header: User avatar + name & Add button */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                  paddingTop: 8,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Image
                    source={avatar ? { uri: avatar } : images.avatar}
                    style={{ width: 48, height: 48, borderRadius: 24 }}
                  />
                  <Text
                    style={{
                      fontSize: 20,
                      fontFamily: 'sans-bold',
                      color: '#081126',
                    }}
                  >
                    {displayName}
                  </Text>
                </View>

                <Pressable
                  onPress={() => setIsModalVisible(true)}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    backgroundColor: '#fff8e7',
                    borderWidth: 1,
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  accessibilityLabel="Add subscription"
                >
                  <Image
                    source={icons.add}
                    resizeMode="contain"
                    style={{ width: 22, height: 22 }}
                  />
                </Pressable>
              </View>

              {/* Balance Card matching Figma */}
              <View
                style={{
                  backgroundColor: '#ea7a53',
                  borderRadius: 28,
                  padding: 24,
                  marginBottom: 20,
                  shadowColor: '#ea7a53',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 10,
                  elevation: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: 'sans-medium',
                    color: 'rgba(255, 255, 255, 0.85)',
                    marginBottom: 12,
                  }}
                >
                  Balance
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 36,
                      fontFamily: 'sans-extrabold',
                      color: '#ffffff',
                    }}
                  >
                    {formatCurrency(monthlyTotal)}
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: 'sans-semibold',
                      color: '#ffffff',
                      paddingBottom: 4,
                    }}
                  >
                    {nextRenewal ? dayjs(nextRenewal).format('MM/DD') : '--'}
                  </Text>
                </View>
              </View>

              {/* Upcoming Subscriptions */}
              <View style={{ marginBottom: 16 }}>
                <ListHeading
                  title="Upcoming"
                  onAction={() => router.push('/(tabs)/subscriptions')}
                />
                <FlatList
                  data={upcomingSubscriptions}
                  renderItem={({ item }) => <UpcomingSubscriptionCard {...item} />}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingVertical: 4 }}
                  ListEmptyComponent={
                    <Text
                      style={{
                        paddingVertical: 12,
                        fontSize: 14,
                        fontFamily: 'sans-medium',
                        color: 'rgba(0, 0, 0, 0.45)',
                      }}
                    >
                      No upcoming renewals yet.
                    </Text>
                  }
                />
              </View>

              {/* All Subscriptions Heading */}
              <ListHeading
                title="All Subscriptions"
                onAction={() => router.push('/(tabs)/subscriptions')}
              />
            </>
          )}
          data={subscriptions}
          keyExtractor={(item) => item.id}
          numColumns={isWide ? 2 : 1}
          key={isWide ? 'wide' : 'narrow'}
          columnWrapperStyle={isWide ? { gap: 16 } : undefined}
          renderItem={({ item }) => (
            <View style={isWide ? { flex: 1 } : undefined}>
              <SubscriptionCard
                {...item}
                expanded={expandedSubscriptionId === item.id}
                onPress={() => handleSubscriptionPress(item)}
                onCancelPress={() => void handleCancel(item)}
                isCancelling={cancellingId === item.id}
              />
            </View>
          )}
          extraData={`${expandedSubscriptionId}-${cancellingId}`}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text
              style={{
                paddingVertical: 16,
                fontSize: 14,
                fontFamily: 'sans-medium',
                color: 'rgba(0, 0, 0, 0.45)',
                textAlign: 'center',
              }}
            >
              No subscriptions yet.
            </Text>
          }
        />
      )}

      <CreateSubscriptionModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleCreateSubscription}
      />
    </PageShell>
  );
}
