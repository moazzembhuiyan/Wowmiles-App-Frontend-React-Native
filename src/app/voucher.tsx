import { router, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { CheckCircle2, Copy, Gift, TicketCheck } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { MilesScreen } from '@/components/miles-ui';
import { useToast } from '@/components/toast';
import { getReward } from '@/components/rewards-data';

export default function VoucherScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const showToast = useToast();
  const reward = getReward(id);
  const title = reward.title;
  const cost = reward.cost.toLocaleString('en-US');
  const voucherCode = reward.voucherCode;

  async function copyVoucher() {
    try {
      await Clipboard.setStringAsync(voucherCode);
      showToast('Voucher code copied', 'Use it when booking your reward.', 'success');
    } catch (error) {
      showToast('Could not copy code', 'Please select and copy the voucher code manually.');
      console.error('Failed to copy voucher code', error);
    }
  }

  return (
    <MilesScreen>
      <View className="-mx-5 -mt-2 mb-4 overflow-hidden">
        <View className="bg-[#087C57] px-5 pb-6 pt-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go to rewards"
            onPress={() => router.replace('/rewards')}
            className="mb-5 h-10 w-10 items-center justify-center rounded-full bg-white/20"
          >
            <CheckCircle2 color="white" size={20} />
          </Pressable>
          <Text className="text-[22px] font-bold text-white">{title} redeemed</Text>
          <Text className="mt-1 text-[13px] text-[#DBF3E9]">
            {cost} miles deducted · your voucher is ready to use
          </Text>
        </View>
      </View>
      <View className="mb-5 items-center rounded-[18px] bg-white px-5 py-6">
        <View className="mb-4 h-20 w-20 items-center justify-center rounded-[14px] bg-[#F7F8FA]">
          <TicketCheck color="#202638" size={40} strokeWidth={1.5} />
        </View>
        <Text className="text-[12px] font-medium tracking-[1px] text-[#747B8B]">VOUCHER CODE</Text>
        <Text selectable className="mt-2 text-[20px] font-bold tracking-[1px] text-[#202638]">
          {voucherCode}
        </Text>
        <Text className="mt-2 text-[12px] text-[#747B8B]">Valid until 31 October 2027</Text>
      </View>
      <Text className="mb-3 text-[17px] font-semibold text-[#202638]">How to use it</Text>
      {reward.usageSteps.map((text, index) => (
        <View key={text} className="mb-3 flex-row items-center">
          <View className="mr-3 h-7 w-7 items-center justify-center rounded-full bg-[#F0F1FB]">
            <Text className="text-[12px] font-semibold text-[#4145B6]">{index + 1}</Text>
          </View>
          <Text className="flex-1 text-[13px] leading-[19px] text-[#626A79]">{text}</Text>
        </View>
      ))}
      <Pressable
        accessibilityRole="button"
        onPress={copyVoucher}
        className="mb-3 mt-2 h-[50px] flex-row items-center justify-center rounded-full bg-[#111522]"
      >
        <Copy color="white" size={18} />
        <Text className="ml-2 text-[14px] font-semibold text-white">Copy voucher code</Text>
      </Pressable>
      <Pressable
        onPress={() => router.replace('/redemption-history')}
        className="mb-8 h-[48px] flex-row items-center justify-center"
      >
        <Gift color="#4145B6" size={17} />
        <Text className="ml-2 text-[14px] font-semibold text-[#4145B6]">View redemption history</Text>
      </Pressable>
    </MilesScreen>
  );
}
