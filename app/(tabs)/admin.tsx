import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import PageShell from '@/components/PageShell';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAdminAccess, type AdminProfile, type AdminSubscription } from '@/lib/useAdmin';

type AdminTab = 'users' | 'subscriptions' | 'events';

export default function AdminScreen() {
  const { isAdmin, loading, setRole } = useAdminAccess();
  const [tab, setTab] = useState<AdminTab>('users');
  const [users, setUsers] = useState<AdminProfile[]>([]);
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [events, setEvents] = useState<
    { id: string; event_name: string; created_at: string; user_id: string | null }[]
  >([]);

  // Admin login passcode state
  const [passcode, setPasscode] = useState('');
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured || !isAdmin) return;
    const [{ data: profileRows, error: profileError }, { data: subRows, error: subError }, { data: eventRows }] =
      await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('subscriptions').select('*').order('name', { ascending: true }),
        supabase
          .from('analytics_events')
          .select('id, event_name, created_at, user_id')
          .order('created_at', { ascending: false })
          .limit(50),
      ]);
    if (profileError || subError) {
      setError(profileError?.message || subError?.message || 'Failed to load admin data');
      return;
    }
    setUsers((profileRows as AdminProfile[]) ?? []);
    setSubscriptions((subRows as AdminSubscription[]) ?? []);
    setEvents((eventRows as typeof events) ?? []);
    setError(null);
  }, [isAdmin]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <PageShell>
        <ActivityIndicator size="large" color="#ea7a53" />
      </PageShell>
    );
  }

  // --- Admin Login Screen (if not currently admin) ---
  if (!isAdmin) {
    const handleAdminPasscodeLogin = async () => {
      setAdminLoginError(null);
      if (passcode.trim() === 'admin123' || passcode.trim().toLowerCase() === 'admin') {
        await setRole('admin');
      } else {
        setAdminLoginError('Incorrect passcode. Default is admin123');
      }
    };

    const handleQuickAdmin = async () => {
      setAdminLoginError(null);
      await setRole('admin');
    };

    return (
      <PageShell>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 20 }}>
          <Text style={{ fontSize: 28, fontFamily: 'sans-bold', color: '#081126', marginBottom: 6 }}>
            Admin Portal
          </Text>
          <Text style={{ fontSize: 14, fontFamily: 'sans-medium', color: 'rgba(0,0,0,0.55)', marginBottom: 24 }}>
            Sign in as an administrator to access system controls, manage user roles, and view all subscriptions.
          </Text>

          <View
            style={{
              backgroundColor: '#fff8e7',
              borderRadius: 24,
              padding: 24,
              borderWidth: 1,
              borderColor: 'rgba(0, 0, 0, 0.08)',
              maxWidth: 480,
            }}
          >
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: 'rgba(234, 122, 83, 0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}
              >
                <Text style={{ fontSize: 24 }}>🛡️</Text>
              </View>
              <Text style={{ fontSize: 18, fontFamily: 'sans-bold', color: '#081126' }}>
                Administrator Login
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: 'sans-medium',
                  color: 'rgba(0,0,0,0.5)',
                  textAlign: 'center',
                  marginTop: 4,
                }}
              >
                Enter admin passcode (default: <Text style={{ fontFamily: 'sans-bold' }}>admin123</Text>)
              </Text>
            </View>

            {adminLoginError ? (
              <View
                style={{
                  backgroundColor: 'rgba(220, 38, 38, 0.1)',
                  borderRadius: 12,
                  padding: 10,
                  marginBottom: 16,
                }}
              >
                <Text style={{ color: '#dc2626', fontSize: 13, fontFamily: 'sans-semibold', textAlign: 'center' }}>
                  {adminLoginError}
                </Text>
              </View>
            ) : null}

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 13, fontFamily: 'sans-semibold', color: '#081126', marginBottom: 8 }}>
                Admin Passcode
              </Text>
              <TextInput
                style={{
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: 'rgba(0,0,0,0.12)',
                  backgroundColor: '#fff9e3',
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  fontSize: 15,
                  color: '#081126',
                }}
                placeholder="Enter passcode"
                placeholderTextColor="rgba(0,0,0,0.4)"
                value={passcode}
                onChangeText={setPasscode}
                secureTextEntry
              />
            </View>

            <Pressable
              style={{
                borderRadius: 16,
                backgroundColor: '#ea7a53',
                paddingVertical: 14,
                alignItems: 'center',
                marginBottom: 12,
              }}
              onPress={handleAdminPasscodeLogin}
            >
              <Text style={{ fontSize: 15, fontFamily: 'sans-bold', color: '#081126' }}>
                Verify & Log in as Admin
              </Text>
            </Pressable>

            <Pressable
              style={{
                borderRadius: 16,
                borderWidth: 1,
                borderColor: 'rgba(234, 122, 83, 0.35)',
                backgroundColor: 'rgba(234, 122, 83, 0.08)',
                paddingVertical: 12,
                alignItems: 'center',
              }}
              onPress={() => void handleQuickAdmin()}
            >
              <Text style={{ fontSize: 13, fontFamily: 'sans-semibold', color: '#ea7a53' }}>
                One-Click Quick Admin Access
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </PageShell>
    );
  }

  // --- Admin Console (when isAdmin is true) ---
  const toggleRole = async (profile: AdminProfile) => {
    setBusyId(profile.id);
    const nextRole = profile.role === 'admin' ? 'user' : 'admin';
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: nextRole })
      .eq('id', profile.id);
    setBusyId(null);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    await load();
  };

  const saveSubscription = async (item: AdminSubscription) => {
    setBusyId(item.id);
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ name: editName.trim() || item.name, price: Number(editPrice) || item.price })
      .eq('id', item.id);
    setBusyId(null);
    setEditId(null);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    await load();
  };

  const removeSubscription = async (id: string) => {
    setBusyId(id);
    const { error: deleteError } = await supabase.from('subscriptions').delete().eq('id', id);
    setBusyId(null);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    await load();
  };

  const cardStyle = {
    backgroundColor: '#fff8e7',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    marginBottom: 12,
  };

  return (
    <PageShell>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={{ fontSize: 28, fontFamily: 'sans-bold', color: '#081126' }}>
            Admin console
          </Text>
          <Pressable
            onPress={() => void setRole('user')}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 9999,
              backgroundColor: '#f6eecf',
            }}
          >
            <Text style={{ fontSize: 12, fontFamily: 'sans-semibold', color: 'rgba(0,0,0,0.6)' }}>
              Switch to User mode
            </Text>
          </Pressable>
        </View>

        <Text style={{ fontSize: 14, fontFamily: 'sans-medium', color: 'rgba(0,0,0,0.55)', marginBottom: 20 }}>
          Manage users, roles, and every subscription in the workspace.
        </Text>

        {error ? (
          <Text style={{ color: '#dc2626', fontFamily: 'sans-semibold', marginBottom: 16 }}>{error}</Text>
        ) : null}

        {/* Tab Selector */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          {(['users', 'subscriptions', 'events'] as AdminTab[]).map((item) => (
            <Pressable
              key={item}
              style={{
                borderRadius: 9999,
                paddingHorizontal: 16,
                paddingVertical: 8,
                backgroundColor: tab === item ? '#ea7a53' : '#f6eecf',
              }}
              onPress={() => setTab(item)}
            >
              <Text
                style={{
                  fontFamily: 'sans-bold',
                  textTransform: 'capitalize',
                  color: tab === item ? '#081126' : 'rgba(0,0,0,0.6)',
                  fontSize: 13,
                }}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        {tab === 'events'
          ? events.map((event) => (
              <View key={event.id} style={cardStyle}>
                <Text style={{ fontSize: 16, fontFamily: 'sans-bold', color: '#081126' }}>
                  {event.event_name}
                </Text>
                <Text style={{ fontSize: 12, fontFamily: 'sans-medium', color: 'rgba(0,0,0,0.5)', marginTop: 4 }}>
                  {new Date(event.created_at).toLocaleString()}
                </Text>
              </View>
            ))
          : tab === 'users'
          ? users.map((profile) => (
              <View key={profile.id} style={cardStyle}>
                <Text style={{ fontSize: 16, fontFamily: 'sans-bold', color: '#081126' }}>
                  {profile.full_name || profile.email}
                </Text>
                <Text style={{ fontSize: 13, fontFamily: 'sans-medium', color: 'rgba(0,0,0,0.55)', marginTop: 2 }}>
                  {profile.email}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: 'sans-bold',
                    textTransform: 'uppercase',
                    color: profile.role === 'admin' ? '#ea7a53' : 'rgba(0,0,0,0.4)',
                    marginTop: 4,
                  }}
                >
                  {profile.role}
                </Text>
                <Pressable
                  style={{
                    marginTop: 12,
                    borderRadius: 14,
                    backgroundColor: '#ea7a53',
                    paddingVertical: 10,
                    alignItems: 'center',
                    opacity: busyId === profile.id ? 0.6 : 1,
                  }}
                  onPress={() => void toggleRole(profile)}
                  disabled={busyId === profile.id}
                >
                  <Text style={{ fontSize: 13, fontFamily: 'sans-bold', color: '#081126' }}>
                    {profile.role === 'admin' ? 'Demote to user' : 'Promote to admin'}
                  </Text>
                </Pressable>
              </View>
            ))
          : subscriptions.map((item) => (
              <View key={item.id} style={cardStyle}>
                {editId === item.id ? (
                  <>
                    <TextInput
                      style={{
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: 'rgba(0,0,0,0.12)',
                        backgroundColor: '#fff9e3',
                        padding: 10,
                        fontSize: 14,
                        color: '#081126',
                        marginBottom: 8,
                      }}
                      value={editName}
                      onChangeText={setEditName}
                    />
                    <TextInput
                      style={{
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: 'rgba(0,0,0,0.12)',
                        backgroundColor: '#fff9e3',
                        padding: 10,
                        fontSize: 14,
                        color: '#081126',
                        marginBottom: 10,
                      }}
                      value={editPrice}
                      onChangeText={setEditPrice}
                      keyboardType="decimal-pad"
                    />
                    <Pressable
                      style={{
                        borderRadius: 12,
                        backgroundColor: '#ea7a53',
                        paddingVertical: 10,
                        alignItems: 'center',
                      }}
                      onPress={() => void saveSubscription(item)}
                    >
                      <Text style={{ fontSize: 13, fontFamily: 'sans-bold', color: '#081126' }}>Save</Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    <Text style={{ fontSize: 16, fontFamily: 'sans-bold', color: '#081126' }}>
                      {item.name}
                    </Text>
                    <Text style={{ fontSize: 13, fontFamily: 'sans-medium', color: 'rgba(0,0,0,0.55)', marginTop: 2 }}>
                      {item.price} {item.currency} · {item.status}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                      <Pressable
                        style={{
                          flex: 1,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: 'rgba(234, 122, 83, 0.4)',
                          backgroundColor: 'rgba(234, 122, 83, 0.1)',
                          paddingVertical: 8,
                          alignItems: 'center',
                        }}
                        onPress={() => {
                          setEditId(item.id);
                          setEditName(item.name);
                          setEditPrice(String(item.price));
                        }}
                      >
                        <Text style={{ fontSize: 13, fontFamily: 'sans-bold', color: '#ea7a53' }}>Edit</Text>
                      </Pressable>
                      <Pressable
                        style={{
                          flex: 1,
                          borderRadius: 12,
                          backgroundColor: '#dc2626',
                          paddingVertical: 8,
                          alignItems: 'center',
                          opacity: busyId === item.id ? 0.6 : 1,
                        }}
                        onPress={() => void removeSubscription(item.id)}
                        disabled={busyId === item.id}
                      >
                        <Text style={{ fontSize: 13, fontFamily: 'sans-bold', color: '#ffffff' }}>Delete</Text>
                      </Pressable>
                    </View>
                  </>
                )}
              </View>
            ))}
      </ScrollView>
    </PageShell>
  );
}
