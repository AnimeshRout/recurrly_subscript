import { type PropsWithChildren } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';

const SafeAreaView = styled(RNSafeAreaView);

type PageShellProps = PropsWithChildren<{
  className?: string;
}>;

export default function PageShell({ children, className }: PageShellProps) {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const bottomPad = isWide ? 'pb-8' : 'pb-30';

  return (
    <SafeAreaView className={`flex-1 bg-background ${className ?? ''}`}>
      <View className={`w-full flex-1 self-center px-5 ${isWide ? 'max-w-5xl pt-6' : ''} ${bottomPad}`}>
        {children}
      </View>
    </SafeAreaView>
  );
}
