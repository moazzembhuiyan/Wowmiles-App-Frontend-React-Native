import { router } from 'expo-router';
import { Clock3 } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { AuthFooter, AuthHero } from '@/components/figma-auth';

export default function VerificationPendingScreen() {
  return (
    <View className="w-full max-w-[440px] flex-1 self-center bg-[#F8F9FB]">
      <AuthHero className="h-[270px] overflow-hidden px-5 pt-8">
        <View className="mb-4 h-8 w-8 items-center justify-center rounded-full bg-white/20">
          <Clock3 color="white" size={16} strokeWidth={1.8} />
        </View>
        <Text className="text-[20px] font-bold leading-[25px] text-white">
          Your agency is being verified
        </Text>
        <Text className="mt-2 text-[13px] leading-[19px] text-[#DCE0F5]">
          Beverly Group is reviewing the details you submitted.
        </Text>
      </AuthHero>
      <View className="-mt-5 flex-1 rounded-t-[20px] bg-[#F8F9FB] px-5 pt-5">
        <Text className="mb-3 text-[12px] font-semibold tracking-[0.7px] text-[#72798A]">PROGRESS</Text>
        <View className="rounded-[13px] bg-white px-4 py-3">
          {[
            ['✓', 'Details submitted', '26 Oct · 2:40 PM', '#378764'],
            ['◷', 'Agency review', 'In progress', '#C18A20'],
            ['○', 'Account activated', 'Pending', '#858A96'],
          ].map(([icon, title, detail, color], index) => (
            <View key={title} className="flex-row items-start">
              <View className="mr-3 items-center">
                <Text className="text-[12px] font-bold" style={{ color }}>{icon}</Text>
                {index < 2 ? <View className="my-1 h-5 w-px bg-[#E4E7ED]" /> : null}
              </View>
              <View className="pb-2">
                <Text className="text-[13px] font-medium text-[#252A38]">{title}</Text>
                <Text className="mt-0.5 text-[12px] text-[#858A96]">{detail}</Text>
              </View>
            </View>
          ))}
        </View>
        <View className="mt-3 rounded-[10px] bg-[#EEF7FF] px-3 py-2.5">
          <Text className="text-[12px] leading-[18px] text-[#4D7697]">
            Most agencies are approved within 2 business days.
          </Text>
        </View>
        <View className="mt-3">
          <Text className="text-[12px] text-[#777E8D]">Need help?</Text>
          <Text className="mt-0.5 text-[13px] font-medium text-[#252A38]">Beverly Group support</Text>
        </View>
      </View>
      <AuthFooter
        eyebrow="Need help?"
        title="Beverly Group support"
        buttonLabel="Contact"
        onPress={() => router.push('/(auth)/profile')}
      />
    </View>
  );
}
