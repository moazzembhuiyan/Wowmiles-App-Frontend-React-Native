import { useEffect } from 'react';
import { router } from 'expo-router';
import { Plane } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthHero } from '@/components/figma-auth';

export default function SplashScreen() {
  useEffect(() => {
    const timeout = setTimeout(() => router.replace('/(auth)/onboarding'), 1800);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <SafeAreaView className="w-full max-w-[440px] flex-1 self-center bg-[#11184F]">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Continue to WowMiles"
        onPress={() => router.replace('/(auth)/onboarding')}
        className="flex-1"
      >
        <AuthHero className="flex-1 items-center justify-center">
          <View className="h-[54px] w-[54px] items-center justify-center rounded-[15px] bg-[#FFB91F]">
            <Plane color="#171A28" size={29} strokeWidth={2} />
          </View>
          <Text className="mt-4 text-[28px] font-bold tracking-[-1px] text-white">WowMiles</Text>
          <View className="absolute bottom-8">
            <Text className="text-[12px] tracking-[2px] text-white/65">TRAVEL. EARN. REPEAT.</Text>
          </View>
        </AuthHero>
      </Pressable>
    </SafeAreaView>
  );
}
