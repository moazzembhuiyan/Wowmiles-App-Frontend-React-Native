import { router, useLocalSearchParams } from 'expo-router';
import { Gift, Wallet } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { MilesScreen } from '@/components/miles-ui';
import { FeatureHero } from '@/components/feature-ui';
import { getReward } from '@/components/rewards-data';

export default function RedeemConfirmationScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const reward = getReward(id);
  const cost = reward.cost.toLocaleString('en-US');

  return (
    <MilesScreen>
      <FeatureHero title="Confirm redemption" />
      <View className="mb-4 rounded-[16px] bg-white p-4">
        <View className="flex-row items-center">
          <View className="mr-3 h-11 w-11 items-center justify-center rounded-[12px] bg-[#F0F1FB]">
            <Gift color="#4145B6" size={22} />
          </View>
          <View className="flex-1">
            <Text className="text-[15px] font-semibold text-[#202638]">{reward.title}</Text>
            <Text className="mt-1 text-[12px] text-[#747B8B]">{cost} miles</Text>
          </View>
        </View>
      </View>
      <View className="mb-4 rounded-[16px] bg-[#F0F1FB] p-4">
        <View className="flex-row items-center">
          <Wallet color="#4145B6" size={19} />
          <Text className="ml-2 text-[13px] font-medium text-[#555D6E]">YOUR BALANCE AFTER</Text>
        </View>
        <View className="mt-2 flex-row items-baseline">
          <Text className="text-[34px] font-bold text-[#202638]">
            {(48500 - reward.cost).toLocaleString('en-US')}
          </Text>
          <Text className="ml-2 text-[13px] text-[#747B8B]">miles</Text>
        </View>
        <Text className="mt-1 text-[12px] text-[#747B8B]">Your miles will be deducted on confirmation.</Text>
      </View>
      <View className="mb-5 rounded-[14px] border border-[#F0E2C3] bg-[#FFF9ED] p-4">
        <Text className="text-[13px] font-semibold text-[#8F6818]">Before you redeem</Text>
        <Text className="mt-1 text-[12px] leading-[18px] text-[#686E79]">
          This reward will be added to your vouchers immediately and cannot be exchanged for miles.
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace({ pathname: '/voucher', params: { id } })}
        className="mb-3 h-[52px] items-center justify-center rounded-full bg-[#FFB91F]"
      >
        <Text className="text-[15px] font-semibold text-[#171A28]">Confirm redemption</Text>
      </Pressable>
      <Pressable onPress={() => router.back()} className="mb-8 h-[48px] items-center justify-center">
        <Text className="text-[14px] font-medium text-[#626A79]">Cancel</Text>
      </Pressable>
    </MilesScreen>
  );
}
