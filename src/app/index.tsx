import { useEffect } from 'react';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandMark } from '@/components/ui';

export default function SplashScreen() {
  useEffect(() => {
    const timeout = setTimeout(() => router.replace('/(auth)/onboarding'), 1800);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <SafeAreaView className="w-full max-w-[440px] flex-1 self-center items-center justify-center bg-canvas">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Continue to WowMiles"
        onPress={() => router.replace('/(auth)/onboarding')}
        className="items-center"
      >
        <BrandMark size={112} />
        <Text className="mt-5 text-[38px] font-bold tracking-[-1.5px] text-navy">WowMiles</Text>
      </Pressable>
      <View className="absolute bottom-12">
        <Text className="text-[12px] tracking-[2px] text-muted">TRAVEL. EARN. REPEAT.</Text>
      </View>
    </SafeAreaView>
  );
}
