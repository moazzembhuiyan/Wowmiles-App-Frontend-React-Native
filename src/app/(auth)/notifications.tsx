import { router } from 'expo-router';
import { BellRing } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { PrimaryButton, Screen } from '@/components/ui';

export default function NotificationPermissionScreen() {
  return (
    <Screen className="justify-center">
      <View className="items-center px-3">
        <View className="mb-7 h-24 w-24 items-center justify-center rounded-full bg-[#EEF0FC]">
          <BellRing color="#4145B6" size={42} strokeWidth={1.7} />
        </View>
        <Text className="text-center text-[26px] font-bold text-ink">Never miss an update</Text>
        <Text className="mt-3 text-center text-[15px] leading-[23px] text-muted">
          Get notified when bookings are approved, miles arrive and new rewards are available.
        </Text>
        <View className="mt-9 w-full">
          <PrimaryButton title="Continue to WowMiles" onPress={() => router.replace('/(tabs)')} />
        </View>
        <Text className="mt-4 text-center text-[12px] text-muted">You can manage notifications in Settings.</Text>
      </View>
    </Screen>
  );
}
