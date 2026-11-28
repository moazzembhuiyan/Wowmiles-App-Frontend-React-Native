import { useCallback, useState } from 'react';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ArrowLeft, X } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { stepAfterAmount } from '@/components/checkout-flow';
import { MilesSlider } from '@/components/miles-slider';
import { BottomBar, CheckoutScreen, miles, SummaryCard } from '@/components/money-ui';
import { ErrorState } from '@/components/states';
import { RewardGate } from '@/components/reward-gate';
import type { Reward } from '@/lib/api/rewards';
import {
  formatEur,
  getCheckoutDraft,
  maxMilesFor,
  MIN_MILES_FOR_CASH,
  previewQuote,
  updateCheckoutDraft,
} from '@/lib/api/redemptions';
import { getWallet } from '@/lib/api/wallet';

const MILES_PER_EUR = 10;

export default function MilesCashScreenRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <RewardGate id={id}>{(reward) => <MilesCashScreen reward={reward} />}</RewardGate>;
}

function MilesCashScreen({ reward }: { reward: Reward }) {
  const insets = useSafeAreaInsets();
  const wallet = useQuery({ queryKey: ['wallet'], queryFn: getWallet });
  const max = maxMilesFor(reward.cost, wallet.data?.available ?? reward.cost);
  const draft = getCheckoutDraft(reward);
  const [, setTick] = useState(0);
  useFocusEffect(useCallback(() => setTick((value) => value + 1), []));
  const [selected, setSelected] = useState(() =>
    draft.miles < reward.cost ? Math.max(MIN_MILES_FOR_CASH, draft.miles) : max,
  );
  const Icon = reward.Icon;

  const quote = useQuery({
    queryKey: ['quote-preview', reward.id, selected, draft.allocationMode, draft.allocation],
    queryFn: () =>
      previewQuote({
        rewardId: reward.id,
        miles: selected,
        allocation: draft.allocationMode === 'manual' && draft.miles === selected ? draft.allocation : undefined,
      }),
    placeholderData: keepPreviousData,
  });

  function next() {
    if (!quote.data) return;
    updateCheckoutDraft(reward, {
      miles: selected,
      cashMinor: quote.data.cashMinor,
      allocationMode: quote.data.allocationMode,
      allocation: quote.data.allocation,
    });
    router.push(stepAfterAmount(reward, false));
  }

  const cash = quote.data ? formatEur(quote.data.cashMinor) : '…';

  return (
    <CheckoutScreen
      fullBleedTop
      footer={
        <BottomBar
          caption="Total"
          value={`${miles(selected)} miles + ${cash}`}
          action="Continue"
          onPress={next}
          disabled={!quote.data}
        />
      }
    >
      <View className="relative -mx-5 overflow-hidden" style={{ height: 250 + insets.top }}>
        <LinearGradient colors={reward.color} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <View pointerEvents="none" className="absolute -right-10 -top-10 h-64 w-64 rounded-full border border-white/10" />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          className="ml-5 h-10 w-10 items-center justify-center rounded-full bg-white/20"
          style={{ marginTop: insets.top + 12 }}
          hitSlop={8}
        >
          <ArrowLeft color="white" size={20} />
        </Pressable>
        <View className="absolute left-0 right-0 items-center" style={{ top: insets.top + 90 }}>
          <Icon color="rgba(255,255,255,0.55)" size={64} strokeWidth={1} />
        </View>
      </View>

      <View className="-mx-5 -mt-6 rounded-t-[28px] bg-white px-5 pb-6 pt-3">
        <View className="mb-4 h-1 w-10 self-center rounded-full bg-[#D7DAE2]" />
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-[26px] font-bold text-ink">Miles + Cash</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full border border-line bg-white"
          >
            <X color="#555D6E" size={18} />
          </Pressable>
        </View>

        <View className="mb-4 flex-row items-center rounded-[16px] bg-[#F7F8FA] p-3">
          <View className="mr-3 h-[52px] w-[52px] overflow-hidden rounded-[14px]">
            <LinearGradient colors={reward.color} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            <View className="flex-1 items-center justify-center">
              <Icon color="white" size={24} strokeWidth={1.5} />
            </View>
          </View>
          <View className="flex-1">
            <Text className="text-[16px] font-medium text-ink">{reward.title}</Text>
            <Text className="mt-0.5 text-[14px] text-muted">
              {`${miles(reward.cost)} miles · or ${formatEur((reward.cost * 100) / MILES_PER_EUR)}`}
            </Text>
          </View>
        </View>

        <View className="mb-4 rounded-[18px] bg-[#ECEEFB] px-4 pb-3 pt-4">
          <View className="flex-row items-baseline justify-between">
            <View className="flex-row items-baseline">
              <Text className="text-[40px] font-bold leading-[46px] text-brand">{miles(selected)}</Text>
              <Text className="ml-1.5 text-[14px] text-muted">miles</Text>
            </View>
            <Text className="text-[18px] text-muted">+</Text>
            <Text className="text-[40px] font-bold leading-[46px] text-ink">{cash}</Text>
          </View>
          <MilesSlider
            value={selected}
            min={MIN_MILES_FOR_CASH}
            max={max}
            onChange={setSelected}
            minLabel={`Min ${miles(MIN_MILES_FOR_CASH)} miles`}
            maxLabel={`Max ${miles(max)} · your balance`}
          />
        </View>

        {quote.isError ? (
          <ErrorState message={quote.error.message} onRetry={() => void quote.refetch()} />
        ) : (
          <SummaryCard
            rows={[
              { label: 'Miles used', sub: `Worth ${formatEur((selected * 100) / MILES_PER_EUR)}`, value: miles(selected) },
              { label: 'Cash to pay', value: cash },
              { label: 'Miles left after', value: quote.data ? miles(quote.data.balanceAfter) : '…', accent: true },
            ]}
          />
        )}

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/checkout/sources', params: { id: reward.id, miles: String(selected) } })}
          className="items-center py-1"
        >
          <Text className="text-[13px] font-semibold text-brand">
            {draft.allocationMode === 'manual' ? 'Miles picked by supplier · change' : 'Choose which miles to use'}
          </Text>
        </Pressable>
      </View>
    </CheckoutScreen>
  );
}
