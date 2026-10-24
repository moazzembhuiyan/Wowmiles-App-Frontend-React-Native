import { router } from 'expo-router';
import { Clock3 } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { PrimaryButton, Screen } from '@/components/ui';

export default function VerificationPendingScreen() {
  return (
    <Screen className="justify-center">
      <View className="items-center px-3">
        <View className="mb-7 h-24 w-24 items-center justify-center rounded-full bg-[#EEF0FC]">
          <Clock3 color="#4145B6" size={44} strokeWidth={1.7} />
        </View>
        <Text className="text-center text-[26px] font-bold text-ink">Verification in progress</Text>
        <Text className="mt-3 text-center text-[15px] leading-[23px] text-muted">
          Your agency details are with our team. We'll email you as soon as your WowMiles account is ready.
        </Text>
        <View className="mt-9 w-full">
          <PrimaryButton title="Continue to profile" onPress={() => router.push('/(auth)/profile')} />
        </View>
        <Text className="mt-4 text-center text-[12px] text-muted">Usually completed within 1–2 business days</Text>
      </View>
    </Screen>
  );
}
