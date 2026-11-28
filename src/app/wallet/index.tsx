import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, ChevronRight, Clock3, Info, Lock } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { MilesHeader, MilesScreen } from '@/components/miles-ui';
import { miles } from '@/components/money-ui';
import { QueryView } from '@/components/states';
import { getWallet } from '@/lib/api/wallet';

export default function WalletBalanceScreen() {
  const query = useQuery({ queryKey: ['wallet'], queryFn: getWallet });

  return (
    <MilesScreen>
      <MilesHeader title="Your miles" />
      <QueryView query={query} loadingLabel="Loading your balance…">
        {(wallet) => {
          const reservedTitle = wallet.reservedFor[0]?.title;
          return (
            <>
              <View className="mb-4 rounded-[18px] border border-line bg-white px-4">
                <View className="flex-row items-center border-b border-[#EEF0F4] py-3.5">
                  <View className="mr-3 h-10 w-10 items-center justify-center rounded-[12px] bg-[#E8F8F0]">
                    <CheckCircle2 color="#0B9A5E" size={19} />
                  </View>
                  <View className="flex-1 pr-2">
                    <Text className="text-[16px] font-medium text-ink">Available to redeem</Text>
                    <Text className="mt-0.5 text-[13px] text-muted">Confirmed and ready to spend</Text>
                  </View>
                  <Text className="text-[17px] font-semibold text-[#A85F05]">{miles(wallet.available)}</Text>
                </View>
                <View className="flex-row items-center border-b border-[#EEF0F4] py-3.5">
                  <View className="mr-3 h-10 w-10 items-center justify-center rounded-[12px] bg-[#FFF5DF]">
                    <Clock3 color="#D9730D" size={19} />
                  </View>
                  <View className="flex-1 pr-2">
                    <Text className="text-[16px] font-medium text-[#555D6E]">Pending</Text>
                    <Text className="mt-0.5 text-[13px] text-muted">
                      {`Waiting for suppliers to confirm ${wallet.pendingBookingsCount} bookings`}
                    </Text>
                  </View>
                  <Text className="text-[17px] font-semibold text-[#555D6E]">{miles(wallet.pending)}</Text>
                </View>
                <View className="flex-row items-center py-3.5">
                  <View className="mr-3 h-10 w-10 items-center justify-center rounded-[12px] bg-[#F1F3F7]">
                    <Lock color="#8991A0" size={19} />
                  </View>
                  <View className="flex-1 pr-2">
                    <Text className="text-[16px] font-medium text-[#555D6E]">Reserved</Text>
                    <Text className="mt-0.5 text-[13px] text-muted">
                      {reservedTitle ? `Held for the ${reservedTitle.toLowerCase()} you are redeeming` : 'Held for a redemption in progress'}
                    </Text>
                  </View>
                  <Text className="text-[17px] font-semibold text-[#555D6E]">{miles(wallet.reserved)}</Text>
                </View>
              </View>

              <View className="mb-4 flex-row items-center justify-between rounded-[14px] bg-[#F3F4F7] px-4 py-4">
                <Text className="text-[16px] font-medium text-ink">Lifetime earned</Text>
                <Text className="text-[17px] font-semibold text-ink">{miles(wallet.lifetimeEarned)}</Text>
              </View>

              <View className="mb-4 flex-row rounded-[14px] bg-[#ECEEFB] p-4">
                <Info color="#4145B6" size={17} />
                <Text className="ml-3 flex-1 text-[14px] leading-[21px] text-brand">
                  Pending miles become available once the supplier confirms and the pending period ends. Your balance is one total, but every mile stays tracked to the supplier that funded it.
                </Text>
              </View>

              {[
                { label: 'Where your miles come from', to: '/wallet/suppliers' },
                { label: 'Status points', to: '/status' },
                { label: 'Reversed bookings', to: '/wallet/debit' },
              ].map((item) => (
                <Pressable
                  key={item.label}
                  accessibilityRole="button"
                  onPress={() => router.push(item.to as never)}
                  className="mb-2 flex-row items-center rounded-[14px] border border-line bg-white px-4 py-3.5"
                >
                  <Text className="flex-1 text-[14px] font-medium text-ink">{item.label}</Text>
                  <ChevronRight color="#858B98" size={18} />
                </Pressable>
              ))}
              <View className="h-6" />
            </>
          );
        }}
      </QueryView>
    </MilesScreen>
  );
}
