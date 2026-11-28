import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Gift, Wallet } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useToast } from '@/components/toast';
import { createRedemption, getCheckoutDraft } from '@/lib/api/redemptions';
import { getWallet } from '@/lib/api/wallet';
import { MilesScreen } from '@/components/miles-ui';
import { FeatureHero } from '@/components/feature-ui';
import { RewardGate } from '@/components/reward-gate';
import type { Reward } from '@/lib/api/rewards';

export default function RedeemConfirmationRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <RewardGate id={id}>{(reward) => <RedeemConfirmationScreen reward={reward} />}</RewardGate>;
}

function RedeemConfirmationScreen({ reward }: { reward: Reward }) {
  const cost = reward.cost.toLocaleString('en-US');
  const providerConfirm = reward.fulfilment === 'provider_confirm';
  const showToast = useToast();
  const wallet = useQuery({ queryKey: ['wallet'], queryFn: getWallet });
  const redeem = useMutation({
    mutationFn: () => createRedemption({ draft: getCheckoutDraft(reward) }),
    onSuccess: (redemption) =>
      router.replace({
        pathname: redemption.status === 'awaiting_provider' ? '/checkout/awaiting' : '/checkout/confirmed',
        params: { rid: redemption.id },
      }),
    onError: (error) => showToast('Could not send request', error.message),
  });

  function confirm() {
    redeem.mutate();
  }

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
            {wallet.data ? (wallet.data.available - reward.cost).toLocaleString('en-US') : '…'}
          </Text>
          <Text className="ml-2 text-[13px] text-[#747B8B]">miles</Text>
        </View>
        <Text className="mt-1 text-[12px] text-[#747B8B]">{providerConfirm ? 'Your miles are held until the provider confirms.' : 'Your miles will be deducted on confirmation.'}</Text>
      </View>
      <View className="mb-5 rounded-[14px] border border-[#F0E2C3] bg-[#FFF9ED] p-4">
        <Text className="text-[13px] font-semibold text-[#8F6818]">Before you redeem</Text>
        <Text className="mt-1 text-[12px] leading-[18px] text-[#686E79]">
          {providerConfirm
            ? 'The provider confirms your request. If they decline, your miles come back.'
            : 'This reward will be added to your vouchers immediately and cannot be exchanged for miles.'}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        disabled={redeem.isPending}
        onPress={confirm}
        className="mb-3 h-[52px] items-center justify-center rounded-full bg-[#FFB91F] disabled:opacity-50"
      >
        <Text className="text-[15px] font-semibold text-[#171A28]">
          {providerConfirm ? 'Send request' : 'Confirm redemption'}
        </Text>
      </Pressable>
      <Pressable onPress={() => router.back()} className="mb-8 h-[48px] items-center justify-center">
        <Text className="text-[14px] font-medium text-[#626A79]">Cancel</Text>
      </Pressable>
    </MilesScreen>
  );
}
