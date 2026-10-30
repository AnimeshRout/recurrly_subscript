import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { createSessionFromUrl } from '@/lib/auth';
import { DOMAIN_RESTRICTED_MESSAGE } from '@/lib/domain';

export default function AuthCallback() {
  const router = useRouter();
  const url = Linking.useURL();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const href =
      url ??
      (typeof window !== 'undefined' ? window.location.href : null);

    if (!href) return;

    createSessionFromUrl(href)
      .then(() => router.replace('/(tabs)'))
      .catch((callbackError) => {
        const message =
          callbackError instanceof Error ? callbackError.message : DOMAIN_RESTRICTED_MESSAGE;
        setError(message);
        setTimeout(() => router.replace('/(auth)/sign-in'), 1800);
      });
  }, [url, router]);

  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <ActivityIndicator size="large" color="#ea7a53" />
      <Text className="mt-4 text-center font-sans-medium text-muted-foreground">
        {error ?? 'Finishing Google sign-in...'}
      </Text>
    </View>
  );
}
