import { router } from 'expo-router';
import { CircleX } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { PrimaryButton, Screen } from '@/components/ui';

export default function VerificationRejectedScreen() {
  return (
    <Screen className="justify-center">
      <View className="items-center px-3">
        <View className="mb-7 h-24 w-24 items-center justify-center rounded-full bg-[#FCEDEC]">
          <CircleX color="#C84D49" size={44} strokeWidth={1.7} />
        </View>
        <Text className="text-center text-[26px] font-bold text-ink">We need a little more information</Text>
        <Text className="mt-3 text-center text-[15px] leading-[23px] text-muted">
          We couldn't verify your agency with the details provided. Review the information and submit it again.
        </Text>
        <View className="mt-9 w-full">
          <PrimaryButton title="Review agency details" onPress={() => router.replace('/(auth)/agency')} />
        </View>
      </View>
    </Screen>
  );
}
