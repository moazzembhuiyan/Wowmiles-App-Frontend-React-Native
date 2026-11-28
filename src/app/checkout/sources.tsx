import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Gift, Minus, Plus } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { BottomBar, CheckoutHeader, CheckoutScreen, FootNote, miles } from '@/components/money-ui';
import { QueryView } from '@/components/states';
import { RewardGate } from '@/components/reward-gate';
import type { Reward } from '@/lib/api/rewards';
import {
  getCheckoutDraft,
  getEligibleSources,
  previewQuote,
  updateCheckoutDraft,
  type AllocationMode,
} from '@/lib/api/redemptions';

const STEP = 500;

export default function ChooseMilesScreenRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <RewardGate id={id}>{(reward) => <ChooseMilesScreen reward={reward} />}</RewardGate>;
}

function ChooseMilesScreen({ reward }: { reward: Reward }) {
  const { miles: milesParam } = useLocalSearchParams<{ id?: string; miles?: string }>();
  const draft = getCheckoutDraft(reward);
  const needed = Number(milesParam) || draft.miles;
  const sources = useQuery({ queryKey: ['eligible-sources'], queryFn: getEligibleSources });
  const auto = useQuery({
    queryKey: ['quote-preview', reward.id, needed, 'auto'],
    queryFn: () => previewQuote({ rewardId: reward.id, miles: needed }),
  });
  const [mode, setMode] = useState<AllocationMode>(draft.allocationMode);
  const [manual, setManual] = useState<Record<string, number>>(() =>
    Object.fromEntries(draft.allocation.map((line) => [line.supplier ?? 'platform', line.miles])),
  );

  const total = Object.values(manual).reduce((sum, value) => sum + value, 0);
  const autoTaken = (key: string) => auto.data?.allocation.find((line) => (line.supplier ?? 'platform') === key)?.miles ?? 0;
  const allocated = mode === 'manual' ? total : needed;
  const complete = mode === 'automatic' || total === needed;

  function change(key: string, delta: number, cap: number) {
    setManual((current) => ({ ...current, [key]: Math.min(cap, Math.max(0, (current[key] ?? 0) + delta)) }));
  }

  function save() {
    const allocation =
      mode === 'manual'
        ? Object.entries(manual)
            .filter(([, value]) => value > 0)
            .map(([key, value]) => ({ supplier: key === 'platform' ? null : key, miles: value }))
        : [];
    updateCheckoutDraft(reward, { miles: needed, allocationMode: mode, allocation });
    router.back();
  }

  return (
    <CheckoutScreen
      footer={<BottomBar caption="Allocated" value={`${miles(allocated)} of ${miles(needed)}`} action="Continue" onPress={save} disabled={!complete} />}
    >
      <CheckoutHeader
        title="Choose your miles"
        heading={`${miles(needed)} miles for this reward`}
        subtitle={`${reward.title} · ${reward.providerName}`}
      />

      <View className="mb-5 flex-row rounded-full bg-[#EEF0F4] p-1">
        {(['automatic', 'manual'] as const).map((item) => (
          <Pressable
            key={item}
            accessibilityRole="tab"
            accessibilityState={{ selected: mode === item }}
            onPress={() => setMode(item)}
            className={`h-11 flex-1 items-center justify-center rounded-full ${mode === item ? 'bg-white' : ''}`}
          >
            <Text className={`text-[15px] font-medium ${mode === item ? 'text-ink' : 'text-muted'}`}>
              {item === 'automatic' ? 'Automatic' : 'Manual'}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text className="mb-2 text-[12px] font-semibold tracking-[0.8px] text-[#747B8B]">TAKING FROM</Text>
      <QueryView query={sources}>
        {(data) => (
          <View className="mb-5 rounded-[18px] border border-line bg-white px-4">
            {data.sources.map((source, index) => {
              const key = source.supplier?.id ?? 'platform';
              const name = source.supplier?.name ?? 'WowMiles';
              const taken = mode === 'manual' ? (manual[key] ?? 0) : autoTaken(key);
              return (
                <View key={key} className={`flex-row items-center py-3.5 ${index < data.sources.length - 1 ? 'border-b border-[#EEF0F4]' : ''}`}>
                  <View className="mr-3 h-10 w-10 items-center justify-center rounded-[12px] bg-[#F1F1FB]">
                    <Gift color="#4145B6" size={18} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[16px] font-medium text-ink">{name}</Text>
                    <Text className="mt-0.5 text-[14px] text-muted">{`${miles(taken)} of ${miles(source.available)} miles`}</Text>
                  </View>
                  {mode === 'manual' ? (
                    <View className="flex-row items-center">
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Use fewer ${name} miles`}
                        onPress={() => change(key, -STEP, source.available)}
                        className="h-8 w-8 items-center justify-center rounded-full bg-[#F1F1FB]"
                      >
                        <Minus color="#4145B6" size={15} />
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Use more ${name} miles`}
                        onPress={() => change(key, STEP, source.available)}
                        className="ml-2 h-8 w-8 items-center justify-center rounded-full bg-[#F1F1FB]"
                      >
                        <Plus color="#4145B6" size={15} />
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}
      </QueryView>
      <FootNote>
        {mode === 'manual' && total !== needed
          ? `Choose ${miles(needed - total)} more miles to continue.`
          : 'Automatic uses your oldest miles first. Switch to Manual to set how much comes from each supplier.'}
      </FootNote>
    </CheckoutScreen>
  );
}
