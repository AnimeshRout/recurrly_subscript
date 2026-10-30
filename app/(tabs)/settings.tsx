import { Text, View, Pressable, Image } from 'react-native';
import { Link } from 'expo-router';
import images from '@/constants/images';
import PageShell from '@/components/PageShell';
import { useAuth } from '@/lib/auth';
import { useAdminAccess } from '@/lib/useAdmin';

const Settings = () => {
  const { user, profile, signOut } = useAuth();
  const { isAdmin } = useAdminAccess();

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    'User';
  const email = profile?.email || user?.email;
  const avatar = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <PageShell>
      <Text style={{ fontSize: 28, fontFamily: 'sans-bold', color: '#081126', marginBottom: 20 }}>
        Settings
      </Text>

      {/* User Profile Card */}
      <View
        style={{
          backgroundColor: '#fff8e7',
          borderRadius: 24,
          padding: 20,
          borderWidth: 1,
          borderColor: 'rgba(0, 0, 0, 0.08)',
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Image
            source={avatar ? { uri: avatar } : images.avatar}
            style={{ width: 56, height: 56, borderRadius: 28 }}
          />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 18, fontFamily: 'sans-bold', color: '#081126' }}>
                {displayName}
              </Text>
              {isAdmin ? (
                <View
                  style={{
                    borderRadius: 9999,
                    backgroundColor: 'rgba(234, 122, 83, 0.15)',
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                  }}
                >
                  <Text style={{ fontSize: 11, fontFamily: 'sans-bold', color: '#ea7a53' }}>
                    ADMIN
                  </Text>
                </View>
              ) : (
                <View
                  style={{
                    borderRadius: 9999,
                    backgroundColor: '#f6eecf',
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                  }}
                >
                  <Text style={{ fontSize: 11, fontFamily: 'sans-bold', color: 'rgba(0,0,0,0.5)' }}>
                    USER
                  </Text>
                </View>
              )}
            </View>
            {email ? (
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: 'sans-medium',
                  color: 'rgba(0, 0, 0, 0.55)',
                  marginTop: 2,
                }}
              >
                {email}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      {/* Account Info Card */}
      <View
        style={{
          backgroundColor: '#fff8e7',
          borderRadius: 24,
          padding: 20,
          borderWidth: 1,
          borderColor: 'rgba(0, 0, 0, 0.08)',
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 16, fontFamily: 'sans-semibold', color: '#081126', marginBottom: 12 }}>
          Account
        </Text>
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 }}>
            <Text style={{ fontSize: 14, fontFamily: 'sans-medium', color: 'rgba(0, 0, 0, 0.55)' }}>
              Account ID
            </Text>
            <Text
              style={{ maxWidth: '60%', fontSize: 14, fontFamily: 'sans-medium', color: '#081126' }}
              numberOfLines={1}
            >
              {user?.id ?? 'N/A'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 }}>
            <Text style={{ fontSize: 14, fontFamily: 'sans-medium', color: 'rgba(0, 0, 0, 0.55)' }}>
              Joined
            </Text>
            <Text style={{ fontSize: 14, fontFamily: 'sans-medium', color: '#081126' }}>
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      {isAdmin ? (
        <Link href="/(tabs)/admin" asChild>
          <Pressable
            style={{
              borderRadius: 16,
              backgroundColor: '#ea7a53',
              paddingVertical: 14,
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 15, fontFamily: 'sans-bold', color: '#081126' }}>
              Open admin console
            </Text>
          </Pressable>
        </Link>
      ) : null}

      <Pressable
        style={{
          borderRadius: 16,
          backgroundColor: '#dc2626',
          paddingVertical: 14,
          alignItems: 'center',
        }}
        onPress={signOut}
        accessibilityLabel="Sign out"
      >
        <Text style={{ fontSize: 15, fontFamily: 'sans-bold', color: '#ffffff' }}>
          Sign Out
        </Text>
      </Pressable>
    </PageShell>
  );
};

export default Settings;
