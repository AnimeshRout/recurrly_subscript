import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth';
import { getAllowedEmailDomain } from '@/lib/domain';

const SignIn = () => {
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    isAuthenticating,
    error,
    clearError,
  } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const domain = getAllowedEmailDomain();
  const { width } = useWindowDimensions();
  const maxWidth = Math.min(width - 32, 420);

  const handleSubmit = async () => {
    if (!email.trim() || !password) return;
    if (isSignUp) {
      await signUpWithEmail(email, password);
    } else {
      await signInWithEmail(email, password);
    }
  };

  const toggleMode = () => {
    clearError();
    setIsSignUp((prev) => !prev);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff9e3' }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 32,
          paddingHorizontal: 20,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: '100%', maxWidth }}>
          {/* Brand Logo & Wordmark */}
          <View style={{ alignItems: 'center', marginBottom: 28 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: '#ea7a53',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 26, fontFamily: 'sans-extrabold', color: '#fff9e3' }}>
                  R
                </Text>
              </View>
              <View>
                <Text style={{ fontSize: 28, fontFamily: 'sans-extrabold', color: '#081126' }}>
                  Recurly
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: 'sans-semibold',
                    color: 'rgba(0, 0, 0, 0.5)',
                    letterSpacing: 1.5,
                    marginTop: -2,
                  }}
                >
                  SMART BILLING
                </Text>
              </View>
            </View>

            <Text
              style={{
                fontSize: 28,
                fontFamily: 'sans-bold',
                color: '#081126',
                textAlign: 'center',
              }}
            >
              {isSignUp ? 'Create an account' : 'Welcome back'}
            </Text>
            <Text
              style={{
                fontSize: 15,
                fontFamily: 'sans-medium',
                color: 'rgba(0, 0, 0, 0.6)',
                textAlign: 'center',
                marginTop: 6,
                maxWidth: 320,
              }}
            >
              {isSignUp
                ? 'Sign up to start tracking and managing your subscriptions.'
                : 'Sign in to continue managing your subscriptions.'}
            </Text>
          </View>

          {/* Form Card */}
          <View
            style={{
              backgroundColor: '#fff8e7',
              borderRadius: 24,
              borderWidth: 1,
              borderColor: 'rgba(0, 0, 0, 0.1)',
              padding: 24,
            }}
          >
            {error ? (
              <View
                style={{
                  marginBottom: 16,
                  borderRadius: 12,
                  backgroundColor: 'rgba(220, 38, 38, 0.1)',
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                }}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    fontFamily: 'sans-semibold',
                    color: '#dc2626',
                    fontSize: 13,
                  }}
                >
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Email Field */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: 'sans-semibold',
                  color: '#081126',
                  marginBottom: 8,
                }}
              >
                Email
              </Text>
              <TextInput
                style={{
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: 'rgba(0, 0, 0, 0.12)',
                  backgroundColor: '#fff9e3',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 15,
                  fontFamily: 'sans-medium',
                  color: '#081126',
                }}
                placeholder="Enter your email"
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Field */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: 'sans-semibold',
                  color: '#081126',
                  marginBottom: 8,
                }}
              >
                Password
              </Text>
              <TextInput
                style={{
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: 'rgba(0, 0, 0, 0.12)',
                  backgroundColor: '#fff9e3',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 15,
                  fontFamily: 'sans-medium',
                  color: '#081126',
                }}
                placeholder="Enter your password"
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {/* Primary Action Button */}
            <Pressable
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 16,
                backgroundColor: '#ea7a53',
                paddingVertical: 16,
                opacity: isAuthenticating || !email || !password ? 0.6 : 1,
              }}
              onPress={handleSubmit}
              disabled={isAuthenticating || !email || !password}
              accessibilityRole="button"
            >
              {isAuthenticating ? (
                <ActivityIndicator color="#081126" />
              ) : (
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: 'sans-bold',
                    color: '#081126',
                  }}
                >
                  {isSignUp ? 'Create account' : 'Sign in'}
                </Text>
              )}
            </Pressable>

            {/* Divider */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 18,
                gap: 12,
              }}
            >
              <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(0, 0, 0, 0.1)' }} />
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: 'sans-semibold',
                  color: 'rgba(0, 0, 0, 0.4)',
                  letterSpacing: 1,
                }}
              >
                OR
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(0, 0, 0, 0.1)' }} />
            </View>

            {/* Google Login Button */}
            <Pressable
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: 'rgba(234, 122, 83, 0.35)',
                backgroundColor: 'rgba(234, 122, 83, 0.08)',
                paddingVertical: 14,
                opacity: isAuthenticating ? 0.6 : 1,
              }}
              onPress={signInWithGoogle}
              disabled={isAuthenticating}
              accessibilityRole="button"
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: 'sans-semibold',
                  color: '#ea7a53',
                }}
              >
                Login with Google
              </Text>
            </Pressable>
          </View>

          {/* Switch between Sign In and Sign Up */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 20,
              gap: 4,
            }}
          >
            <Text style={{ fontSize: 14, fontFamily: 'sans-medium', color: 'rgba(0, 0, 0, 0.6)' }}>
              {isSignUp ? 'Already have an account?' : 'New to Recurly?'}
            </Text>
            <Pressable onPress={toggleMode}>
              <Text style={{ fontSize: 14, fontFamily: 'sans-bold', color: '#ea7a53' }}>
                {isSignUp ? 'Sign in' : 'Create an account'}
              </Text>
            </Pressable>
          </View>

          {/* Domain Note (if restricted) */}
          {domain && domain !== '*' && domain !== 'all' ? (
            <Text
              style={{
                marginTop: 20,
                textAlign: 'center',
                fontSize: 13,
                fontFamily: 'sans-medium',
                color: 'rgba(0, 0, 0, 0.5)',
              }}
            >
              Only @{domain} emails can access Recurly.
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
