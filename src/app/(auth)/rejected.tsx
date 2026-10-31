import { router } from 'expo-router';
import { CircleX } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { AuthFooter, AuthHero } from '@/components/figma-auth';

export default function VerificationRejectedScreen() {
  return (
    <View className="w-full max-w-[440px] flex-1 self-center bg-[#F8F9FB]">
      <AuthHero className="h-[270px] overflow-hidden px-5 pt-8">
        <View className="mb-4 h-8 w-8 items-center justify-center rounded-full bg-white/20">
          <CircleX color="#FFE2E2" size={16} strokeWidth={1.8} />
        </View>
        <Text className="text-[20px] font-bold leading-[25px] text-white">
          We could not verify your agency
        </Text>
        <Text className="mt-2 text-[13px] leading-[19px] text-[#F0D8DB]">
          Your details did not match the IATA register. Review the information and resubmit.
        </Text>
      </AuthHero>
      <View className="-mt-5 flex-1 rounded-t-[20px] bg-[#F8F9FB] px-5 pt-5">
        <View className="rounded-[13px] border border-[#F0D4D4] bg-white p-3">
          <Text className="text-[12px] font-bold tracking-[0.5px] text-[#B84444]">REVIEW NOTES</Text>
          <Text className="mt-1.5 text-[12px] leading-[18px] text-[#646B7A]">
            IATA number 23-4 5678 9 is registered to a different trading name. Upload a document that
            matches the agency name on your account.
          </Text>
        </View>
        <Text className="mb-2 mt-4 text-[12px] font-semibold tracking-[0.7px] text-[#72798A]">PROGRESS</Text>
        <View className="rounded-[13px] bg-white px-4 py-3">
          <Text className="text-[13px] font-medium text-[#252A38]">✓  Details submitted</Text>
          <Text className="mb-3 mt-0.5 pl-5 text-[12px] text-[#858A96]">26 Oct · 2:40 PM</Text>
          <Text className="text-[13px] font-medium text-[#B84444]">×  Agency review</Text>
          <Text className="mt-0.5 pl-5 text-[12px] text-[#858A96]">26 Oct · 3:10 PM</Text>
        </View>
      </View>
      <AuthFooter
        eyebrow="What to do next"
        title="Review and submit again"
        buttonLabel="Update"
        onPress={() => router.replace('/(auth)/agency')}
      />
    </View>
  );
}
