import { router } from 'expo-router';
import { Gift, ChevronRight } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { MilesHeader, MilesScreen } from '@/components/miles-ui';

const redemptions = [
  { title: 'Lounge access pass', detail: 'Voucher · 8 Oct 2026', miles: '−5,000', code: 'WM-LNG-4K29-PT' },
  { title: 'Hotel dining voucher', detail: 'Redeemed · 14 Sep 2026', miles: '−8,900', code: 'WM-HDV-81Q3' },
];

export default function RedemptionHistoryScreen() {
  return (
    <MilesScreen>
      <MilesHeader title="Redemption history" subtitle="Your redeemed rewards and vouchers" />
      <Text className="mb-3 mt-2 text-[12px] font-medium tracking-[0.7px] text-[#747B8B]">OCTOBER 2026</Text>
      <View className="mb-5 rounded-[16px] bg-white px-4">
        {redemptions.map((item, index) => (
          <Pressable
            key={item.code}
            accessibilityRole="button"
            onPress={() => router.push('/voucher')}
            className={`flex-row items-center py-4 ${index < redemptions.length - 1 ? 'border-b border-[#EEF0F4]' : ''}`}
          >
            <View className="mr-3 h-11 w-11 items-center justify-center rounded-[12px] bg-[#F0F1FB]">
              <Gift color="#4145B6" size={20} />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-semibold text-[#202638]">{item.title}</Text>
              <Text className="mt-1 text-[12px] text-[#747B8B]">{item.detail}</Text>
              <Text className="mt-1 text-[12px] text-[#4145B6]">Code · {item.code}</Text>
            </View>
            <View className="items-end">
              <Text className="text-[14px] font-semibold text-[#9B4A3F]">{item.miles}</Text>
              <ChevronRight color="#8B91A0" size={18} />
            </View>
          </Pressable>
        ))}
      </View>
    </MilesScreen>
  );
}
