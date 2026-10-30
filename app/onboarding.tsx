import { Image, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';
import images from '@/constants/images';
import { useAuth } from '@/lib/auth';
import { Redirect } from 'expo-router';

const SafeAreaView = styled(RNSafeAreaView);

export default function Onboarding() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const { width } = useWindowDimensions();
  const maxWidth = Math.min(width, 480);

  if (isLoaded && isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View className="flex-1 bg-accent">
      <Image
        source={images.splashPattern}
        className="absolute inset-0"
        resizeMode="cover"
        style={{ opacity: 0.22 }}
      />
      <SafeAreaView className="flex-1">
        <View className="flex-1 justify-end self-center px-8 pb-12" style={{ width: maxWidth }}>
          <View className="mb-10 items-center">
            <View className="mb-8 size-20 items-center justify-center rounded-3xl bg-white/20">
              <Text className="text-4xl font-sans-extrabold text-white">R</Text>
            </View>
            <Text className="text-center text-4xl font-sans-extrabold text-white">
              Gain Financial Clarity
            </Text>
            <Text className="mt-3 text-center text-base font-sans-medium text-white/85">
              Track, analyze and cancel with ease.
            </Text>
          </View>

          <Pressable
            className="items-center rounded-full bg-primary py-4"
            onPress={() => router.push('/(auth)/sign-in')}
            accessibilityRole="button"
            accessibilityLabel="Get started"
          >
            <Text className="text-base font-sans-bold text-background">Get Started</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
