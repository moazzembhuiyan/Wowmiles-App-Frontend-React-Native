import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, CreditCard, Lock } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomBar, CheckoutHeader, CheckoutScreen, FootNote, miles } from '@/components/money-ui';
import { QueryView } from '@/components/states';
import { RewardGate } from '@/components/reward-gate';
import type { Reward } from '@/lib/api/rewards';
import { useToast } from '@/components/toast';
import {
  addPaymentMethod,
  cashFor,
  createRedemption,
  formatEur,
  getCheckoutDraft,
  getPaymentMethods,
  retryPayment,
} from '@/lib/api/redemptions';

const MILES_PER_EUR = 10;

export default function CheckoutPaymentScreenRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <RewardGate id={id}>{(reward) => <CheckoutPaymentScreen reward={reward} />}</RewardGate>;
}

function CheckoutPaymentScreen({ reward }: { reward: Reward }) {
  const { retry } = useLocalSearchParams<{ id?: string; retry?: string }>();
  const draft = getCheckoutDraft(reward);
  // Server quote from the Miles + Cash screen; the local estimate only covers a missing quote.
  const cash = draft.cashMinor || cashFor(reward.cost, draft.miles);
  const supplierCount = new Set(draft.allocation.map((line) => line.supplier)).size;
  const Icon = reward.Icon;
  const showToast = useToast();
  const queryClient = useQueryClient();
  const methods = useQuery({ queryKey: ['payment-methods'], queryFn: getPaymentMethods });
  const [chosen, setChosen] = useState<string | null>(null);

  const addCard = useMutation({
    mutationFn: addPaymentMethod,
    onSuccess: async (method) => {
      await queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      if (method) setChosen(method.id);
    },
    onError: (error) => showToast('Could not add card', error.message),
  });

  const pay = useMutation({
    mutationFn: (input: { paymentMethod?: string }) =>
      retry && input.paymentMethod
        ? retryPayment({ id: retry, paymentMethod: input.paymentMethod })
        : createRedemption({ draft, paymentMethod: input.paymentMethod }),
    onSuccess: (redemption) => {
      const params = { rid: redemption.id };
      if (redemption.status === 'payment_failed') {
        router.replace({ pathname: '/checkout/payment-failed', params });
      } else if (redemption.status === 'awaiting_provider') {
        router.replace({ pathname: '/checkout/awaiting', params });
      } else {
        router.replace({ pathname: '/checkout/confirmed', params });
      }
    },
    onError: (error) => showToast('Payment not started', error.message),
  });

  return (
    <CheckoutScreen
      footer={
        <BottomBar
          caption="Cash due today"
          value={formatEur(cash)}
          action="Confirm payment"
          loading={pay.isPending}
          disabled={!methods.data?.length}
          onPress={() => pay.mutate({ paymentMethod: chosen ?? methods.data?.[0]?.id })}
        />
      }
    >
      <CheckoutHeader title="Checkout" heading="Confirm and pay" />

      <View className="mb-5 overflow-hidden rounded-[20px] bg-white" style={{ elevation: 1 }}>
        <View className="flex-row items-center px-4 py-3.5">
          <LinearGradient colors={reward.color} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          <View className="mr-3 h-11 w-11 items-center justify-center rounded-[12px] bg-white/20">
            <Icon color="white" size={20} strokeWidth={1.6} />
          </View>
          <View className="flex-1">
            <Text className="text-[16px] font-medium text-white">{reward.title}</Text>
            <Text className="mt-0.5 text-[13px] text-white/70">{reward.providerName}</Text>
          </View>
        </View>
        <View className="px-4">
          {[
            { label: 'Reward value', value: formatEur((reward.cost * 100) / MILES_PER_EUR) },
            { label: 'Miles used', value: `${miles(draft.miles)} · worth ${formatEur((draft.miles * 100) / MILES_PER_EUR)}` },
            { label: 'Miles from', value: supplierCount ? `${supplierCount} ${supplierCount === 1 ? 'supplier' : 'suppliers'}` : 'Oldest miles first' },
            { label: 'Cash to pay', value: formatEur(cash), strong: true },
          ].map((row, index, list) => (
            <View key={row.label} className={`flex-row items-center justify-between py-3.5 ${index < list.length - 1 ? 'border-b border-[#EEF0F4]' : ''}`}>
              <Text className={`text-[16px] ${row.strong ? 'text-ink' : 'text-[#555D6E]'}`}>{row.label}</Text>
              <Text className={`text-[16px] ${row.strong ? 'font-semibold' : 'font-medium'} text-ink`}>{row.value}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text className="mb-2 text-[12px] font-semibold tracking-[0.8px] text-[#747B8B]">PAY WITH</Text>
      <QueryView query={methods} isEmpty={() => false}>
        {(list) => (
          <View>
            {list.map((method) => {
              const selected = (chosen ?? list[0]?.id) === method.id;
              return (
                <Pressable
                  key={method.id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  onPress={() => setChosen(method.id)}
                  className={`mb-3 flex-row items-center rounded-[16px] border-2 p-3.5 ${selected ? 'border-brand bg-[#ECEEFB]' : 'border-line bg-white'}`}
                >
                  <View className="mr-3 h-11 w-11 items-center justify-center rounded-[12px] bg-brand">
                    <CreditCard color="white" size={19} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[16px] font-medium text-ink">{`${method.brand} ending ${method.last4}`}</Text>
                    <Text className="mt-0.5 text-[14px] text-muted">{`Expires ${String(method.expMonth).padStart(2, '0')}/${String(method.expYear).slice(-2)}`}</Text>
                  </View>
                  {selected ? (
                    <View className="h-7 w-7 items-center justify-center rounded-full bg-brand">
                      <Check color="white" size={15} strokeWidth={3} />
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        )}
      </QueryView>

      <Pressable
        accessibilityRole="button"
        disabled={addCard.isPending}
        onPress={() => addCard.mutate()}
        className="mb-5 flex-row items-center rounded-[16px] border border-line bg-white p-3.5 disabled:opacity-50"
      >
        <View className="mr-3 h-11 w-11 items-center justify-center rounded-[12px] bg-[#F1F3F7]">
          <CreditCard color="#8991A0" size={19} />
        </View>
        <Text className="text-[16px] font-medium text-ink">{addCard.isPending ? 'Opening secure card form…' : 'Add a new card'}</Text>
      </Pressable>

      <FootNote icon={<Lock color="#858B98" size={16} />}>
        {`Your ${miles(draft.miles)} miles are held until payment completes. If the payment fails they go back to the supplier balances they came from.`}
      </FootNote>
    </CheckoutScreen>
  );
}
