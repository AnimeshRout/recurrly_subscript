import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import PageShell from '@/components/PageShell';
import ListHeading from '@/components/ListHeading';
import SpendChart from '@/components/SpendChart';
import { useMemo } from 'react';
import { useSubscriptionStore } from '@/lib/subscriptionStore';
import { formatCurrency, formatSubscriptionDateTime } from '@/lib/utils';
import dayjs from 'dayjs';

const Insights = () => {
  const router = useRouter();
  const { subscriptions } = useSubscriptionStore();

  const stats = useMemo(() => {
    const active = subscriptions.filter((item) => item.status === 'active');
    const monthly = active.reduce((sum, item) => {
      if ((item.billing || item.frequency) === 'Yearly') return sum + item.price / 12;
      return sum + item.price;
    }, 0);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const byDay = days.map((label, index) => {
      const value = active
        .filter((item) => (item.renewalDate ? dayjs(item.renewalDate).day() === index : false))
        .reduce((sum, item) => sum + item.price, 0);
      return { label, value: value || monthly / 7, highlight: index === dayjs().day() };
    });

    const history = [...subscriptions].sort((a, b) =>
      dayjs(b.startDate || b.renewalDate).diff(dayjs(a.startDate || a.renewalDate))
    );

    return { monthly, byDay, history };
  }, [subscriptions]);

  return (
    <PageShell>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="mb-6 text-3xl font-sans-bold text-primary">Monthly Insights</Text>

        <ListHeading title="Upcoming" onAction={() => router.push('/(tabs)/subscriptions')} />
        <SpendChart points={stats.byDay} />

        <View className="mt-5 rounded-3xl bg-[#f5d76e] p-5">
          <Text className="text-sm font-sans-semibold text-primary/70">Expenses</Text>
          <Text className="mt-2 text-3xl font-sans-extrabold text-primary">
            -{formatCurrency(stats.monthly)}
          </Text>
        </View>

        <ListHeading title="History" onAction={() => router.push('/(tabs)/subscriptions')} />
        <View className="gap-3">
          {stats.history.length === 0 ? (
            <Text className="home-empty-state">No billing history yet.</Text>
          ) : (
            stats.history.slice(0, 6).map((item) => (
              <Pressable
                key={item.id}
                className="flex-row items-center rounded-2xl px-1 py-2"
                style={item.color ? { backgroundColor: item.color } : undefined}
                onPress={() => router.push('/(tabs)/subscriptions')}
              >
                <Image
                  source={item.icon}
                  style={{ width: 44, height: 44, borderRadius: 10, marginLeft: 12 }}
                  resizeMode="contain"
                />
                <View className="ml-3 flex-1 py-3">
                  <Text className="font-sans-bold text-primary">{item.name}</Text>
                  <Text className="text-xs font-sans-medium text-muted-foreground">
                    {formatSubscriptionDateTime(item.startDate || item.renewalDate)}
                  </Text>
                </View>
                <Text className="mr-4 font-sans-bold text-primary">{formatCurrency(item.price, item.currency)}</Text>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </PageShell>
  );
};

export default Insights;
