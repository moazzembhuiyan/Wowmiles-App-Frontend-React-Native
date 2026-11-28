import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Gift, ChevronRight } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { MilesHeader, MilesScreen } from '@/components/miles-ui';
import { EmptyState, QueryView } from '@/components/states';
import { getRedemptionHistory, type RedemptionDisplayStatus, type RedemptionHistoryItem } from '@/lib/api/redemptions';

const STATUS_LABEL: Record<RedemptionDisplayStatus, string> = {
  awaiting: 'Awaiting confirmation',
  active: 'Voucher',
  fulfilled: 'Fulfilled',
  used: 'Used',
  refunded: 'Refunded',
  cancelled: 'Cancelled',
};

const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const monthOf = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }).toUpperCase();

/** Groups the rows by month, keeping the newest first. */
function byMonth(items: RedemptionHistoryItem[]) {
  const groups = new Map<string, RedemptionHistoryItem[]>();
  for (const item of items) {
    const month = monthOf(item.createdAt);
    groups.set(month, [...(groups.get(month) ?? []), item]);
  }
  return [...groups.entries()];
}

export default function RedemptionHistoryScreen() {
  const query = useQuery({ queryKey: ['redemptions', 'history'], queryFn: getRedemptionHistory });

  return (
    <MilesScreen>
      <MilesHeader title="Redemption history" subtitle="Your redeemed rewards and vouchers" />
      <QueryView query={query} isEmpty={(data) => data.items.length === 0} empty={<EmptyState title="No redemptions yet" description="Rewards you redeem appear here." />}>
        {(history) =>
          byMonth(history.items).map(([month, items]) => (
            <View key={month}>
              <Text className="mb-3 mt-2 text-[12px] font-medium tracking-[0.7px] text-[#747B8B]">{month}</Text>
              <View className="mb-5 rounded-[16px] bg-white px-4">
                {items.map((item, index) => (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    onPress={() => router.push({ pathname: '/voucher', params: { rid: item.id } })}
                    className={`flex-row items-center py-4 ${index < items.length - 1 ? 'border-b border-[#EEF0F4]' : ''}`}
                  >
                    <View className="mr-3 h-11 w-11 items-center justify-center rounded-[12px] bg-[#F0F1FB]">
                      <Gift color="#4145B6" size={20} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[15px] font-semibold text-[#202638]">{item.reward.title}</Text>
                      <Text className="mt-1 text-[12px] text-[#747B8B]">
                        {STATUS_LABEL[item.displayStatus]} · {formatDay(item.usedAt ?? item.fulfilledAt ?? item.createdAt)}
                      </Text>
                      {item.voucher ? <Text className="mt-1 text-[12px] text-[#4145B6]">Code · {item.voucher.code}</Text> : null}
                    </View>
                    <View className="items-end">
                      <Text className="text-[14px] font-semibold text-[#9B4A3F]">−{item.miles.toLocaleString('en-US')}</Text>
                      <ChevronRight color="#8B91A0" size={18} />
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          ))
        }
      </QueryView>
    </MilesScreen>
  );
}
