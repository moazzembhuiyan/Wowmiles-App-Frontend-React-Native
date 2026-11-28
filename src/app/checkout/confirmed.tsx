import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { BottomBar, CheckoutScreen, FootNote, formatDate, NextSteps, OutcomeHero, SummaryCard, miles } from '@/components/money-ui';
import { QueryView } from '@/components/states';
import { formatEur, getRedemption } from '@/lib/api/redemptions';
import { mockWallet } from '@/lib/api/wallet';

export default function RedemptionConfirmedScreen() {
  const { rid } = useLocalSearchParams<{ rid?: string }>();
  const query = useQuery({ queryKey: ['redemption', rid], queryFn: () => getRedemption(String(rid)), enabled: !!rid });

  return (
    <QueryView query={query}>
      {(redemption) => {
        const balance = mockWallet.available - redemption.miles;
        return (
          <CheckoutScreen
            fullBleedTop
            footer={
              <BottomBar
                caption="Miles balance now"
                value={`${miles(balance)} miles`}
                action="View voucher"
                onPress={() => router.replace({ pathname: '/voucher', params: { id: redemption.reward.id } })}
              />
            }
          >
            <OutcomeHero
              tone="success"
              title={redemption.payment ? 'Payment received' : 'Redemption confirmed'}
              subtitle={`${redemption.reward.title} is yours. Your voucher is ready to use.`}
            />
            <SummaryCard
              rows={[
                { label: 'Miles used', sub: `Worth ${formatEur(redemption.miles * 10)}`, value: miles(redemption.miles) },
                ...(redemption.payment
                  ? [
                      {
                        label: 'Cash paid',
                        sub: redemption.payment.card ? `${redemption.payment.card.brand} ending ${redemption.payment.card.last4}` : undefined,
                        value: formatEur(redemption.payment.amountMinor),
                      },
                    ]
                  : []),
                { label: 'Miles balance now', value: miles(balance), accent: true },
              ]}
            />
            <NextSteps
              steps={[
                { title: redemption.payment ? 'Payment taken' : 'Miles spent', sub: redemption.payment ? formatEur(redemption.payment.amountMinor) : `${miles(redemption.miles)} miles`, state: 'done' },
                { title: 'Voucher issued', sub: redemption.voucher ? `Valid until ${formatDate(redemption.voucher.validUntil, true)}` : 'Ready now', state: 'done' },
                { title: 'Use your voucher', sub: 'Show it to the provider', state: 'todo' },
              ]}
            />
            <FootNote>Your voucher is also available in redemption history.</FootNote>
          </CheckoutScreen>
        );
      }}
    </QueryView>
  );
}
