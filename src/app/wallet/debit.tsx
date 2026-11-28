import { useState } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, SlidersHorizontal } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MilesScreen, Pill } from '@/components/miles-ui';
import { miles } from '@/components/money-ui';
import { QueryView } from '@/components/states';
import { getWalletInDebit } from '@/lib/api/wallet';

type Tab = 'All' | 'Earned' | 'Redeemed';

export default function WalletInDebitScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('All');
  const query = useQuery({ queryKey: ['wallet', 'debit'], queryFn: getWalletInDebit });

  return (
    <MilesScreen fullBleedTop>
      <QueryView query={query} loadingLabel="Loading…">
        {({ wallet, ledger }) => {
          const rows = ledger.filter((row) => tab === 'All' || (tab === 'Earned' ? row.amount > 0 : row.amount < 0));
          const months = [...new Set(rows.map((row) => row.month))];
          return (
            <>
              <View className="-mx-5 overflow-hidden">
                <View className="relative overflow-hidden px-5 pb-5" style={{ paddingTop: insets.top + 8 }}>
                  <LinearGradient
                    colors={['#11184F', '#29368F', '#454DC2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <View pointerEvents="none" className="absolute -right-7 -top-14 h-52 w-52 rounded-full border border-white/10" />
                  <View className="mb-3 mt-2 flex-row items-center justify-between">
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Go back"
                      onPress={() => router.back()}
                      className="h-10 w-10 items-center justify-center rounded-full bg-white/15"
                    >
                      <ArrowLeft color="white" size={19} />
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Filter miles history"
                      onPress={() => router.push('/history')}
                      className="h-10 w-10 items-center justify-center rounded-full bg-white/15"
                    >
                      <SlidersHorizontal color="white" size={18} />
                    </Pressable>
                  </View>
                  <Text className="mt-1 text-[12px] font-medium tracking-[0.8px] text-[#D8DAF2]">BALANCE — IN DEBIT</Text>
                  <View className="mt-1 flex-row items-baseline">
                    <Text className="text-[46px] font-light leading-[52px] tracking-[-1.5px] text-white">{`−${miles(Math.abs(wallet.available))}`}</Text>
                    <Text className="ml-2 text-[13px] text-[#D8DAF2]">miles</Text>
                  </View>
                  <View className="mt-3 flex-row">
                    <View className="mr-2 flex-1 items-center rounded-[12px] bg-white/20 py-2.5">
                      <Text className="text-[18px] font-semibold text-white">{miles(wallet.lifetimeEarned)}</Text>
                      <Text className="mt-0.5 text-[12px] text-[#E0E3F7]">Lifetime</Text>
                    </View>
                    <View className="flex-1 items-center rounded-[12px] bg-white/20 py-2.5">
                      <Text className="text-[18px] font-semibold text-white">{miles(wallet.lifetimeRedeemed)}</Text>
                      <Text className="mt-0.5 text-[12px] text-[#E0E3F7]">Redeemed</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View className="mb-3 mt-4 flex-row items-center">
                {(['All', 'Earned', 'Redeemed'] as const).map((item) => (
                  <Pill key={item} label={item} selected={tab === item} onPress={() => setTab(item)} />
                ))}
              </View>

              {months.map((month) => (
                <View key={month} className="mb-4">
                  <Text className="mb-1.5 text-[12px] font-medium tracking-[0.6px] text-[#747B8B]">{month}</Text>
                  {rows
                    .filter((row) => row.month === month)
                    .map((row, index, list) => (
                      <View
                        key={row.id}
                        className={`flex-row items-center py-3.5 ${index < list.length - 1 ? 'border-b border-[#E9EBF0]' : ''}`}
                      >
                        <View className="flex-1 pr-3">
                          <Text className="text-[15px] text-ink">{row.label}</Text>
                          <Text className="mt-1 text-[13px] text-muted">{row.detail}</Text>
                        </View>
                        <Text className={`text-[15px] font-semibold ${row.amount < 0 && row.id !== 'l1' ? 'text-[#B62D3E]' : 'text-[#A85F05]'}`}>
                          {`${row.amount < 0 ? '−' : '+'}${miles(Math.abs(row.amount))}`}
                        </Text>
                      </View>
                    ))}
                </View>
              ))}
              <Text className="mb-8 text-[12px] leading-[18px] text-muted">
                Think the reversal is wrong? Ask Beverly to review it. You can redeem again once your balance is back above zero.
              </Text>
            </>
          );
        }}
      </QueryView>
    </MilesScreen>
  );
}
