import { Tabs, Redirect, usePathname, useRouter } from 'expo-router';
import { tabs } from '@/constants/data';
import { Image, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { colors, components } from '@/constants/theme';
import images from '@/constants/images';
import clsx from 'clsx';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useSubscriptionStore } from '@/lib/subscriptionStore';
import { useAdminAccess } from '@/lib/useAdmin';

const tabBar = components.tabBar;

const TabIcon = ({ focused, icon }: TabIconProps) => (
  <View style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
    <View
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: focused ? '#ea7a53' : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Image
        source={icon}
        resizeMode="contain"
        style={{
          width: 22,
          height: 22,
          tintColor: focused ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
        }}
      />
    </View>
  </View>
);

const TabLayout = () => {
  const { isSignedIn, isLoaded, user, profile, signOut } = useAuth();
  const { isAdmin } = useAdminAccess();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const pathname = usePathname();
  const router = useRouter();
  const loadSubscriptions = useSubscriptionStore((state) => state.loadSubscriptions);
  const clearSubscriptions = useSubscriptionStore((state) => state.clear);

  const displayName =
    profile?.full_name?.split(' ')[0] ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'User';
  const avatar = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  useEffect(() => {
    if (user?.id) {
      void loadSubscriptions(user.id);
    } else {
      clearSubscriptions();
    }
  }, [user?.id, loadSubscriptions, clearSubscriptions]);

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  const navItems = [
    ...tabs,
    { name: 'admin', title: 'Admin', icon: tabs[3].icon },
  ];

  return (
    <View className="flex-1 flex-row bg-background">
      {isWide ? (
        <View className="w-56 border-r border-border bg-card px-4 py-8 flex-col justify-between">
          <View>
            <Text className="mb-8 px-2 text-xl font-sans-extrabold text-primary">Recurrly</Text>
            {navItems.map((tab) => {
              const href = tab.name === 'index' ? '/' : `/${tab.name}`;
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Pressable
                  key={tab.name}
                  className={clsx('mb-2 flex-row items-center gap-3 rounded-2xl px-3 py-3', active && 'bg-accent/15')}
                  onPress={() => router.push((tab.name === 'index' ? '/(tabs)' : `/(tabs)/${tab.name}`) as any)}
                  accessibilityRole="button"
                  accessibilityLabel={tab.title}
                >
                  <Image source={tab.icon} style={{ width: 20, height: 20 }} resizeMode="contain" />
                  <Text className={clsx('font-sans-semibold text-primary', active && 'text-accent')}>
                    {tab.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Bottom user profile & logout */}
          <View style={{ paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.08)' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, paddingHorizontal: 4 }}>
              <Image
                source={avatar ? { uri: avatar } : images.avatar}
                style={{ width: 36, height: 36, borderRadius: 18 }}
              />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  numberOfLines={1}
                  style={{ fontSize: 14, fontFamily: 'sans-bold', color: '#081126' }}
                >
                  {displayName}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: 'sans-bold',
                    textTransform: 'uppercase',
                    color: isAdmin ? '#ea7a53' : 'rgba(0,0,0,0.4)',
                  }}
                >
                  {isAdmin ? 'Admin' : 'User'}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={signOut}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: 'rgba(220, 38, 38, 0.08)',
              }}
              accessibilityRole="button"
              accessibilityLabel="Sign out"
            >
              <Text style={{ fontSize: 13, fontFamily: 'sans-bold', color: '#dc2626' }}>
                Log out
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <View className="flex-1">
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarStyle: isWide
              ? { display: 'none' }
              : {
                  position: 'absolute',
                  bottom: Math.max(insets.bottom, tabBar.horizontalInset),
                  height: tabBar.height,
                  marginHorizontal: tabBar.horizontalInset,
                  borderRadius: tabBar.radius,
                  backgroundColor: colors.primary,
                  borderTopWidth: 0,
                  elevation: 0,
                },
            tabBarItemStyle: {
              paddingVertical: tabBar.height / 2 - tabBar.iconFrame / 1.6,
            },
            tabBarIconStyle: {
              width: tabBar.iconFrame,
              height: tabBar.iconFrame,
              alignItems: 'center',
            },
          }}
        >
          {tabs.map((tab) => (
            <Tabs.Screen
              key={tab.name}
              name={tab.name}
              options={{
                title: tab.title,
                tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={tab.icon} />,
              }}
            />
          ))}
          <Tabs.Screen
            name="admin"
            options={{
              title: 'Admin',
              tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={tabs[3].icon} />,
            }}
          />
        </Tabs>
      </View>
    </View>
  );
};

export default TabLayout;
