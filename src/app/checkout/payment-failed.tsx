import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { BottomBar, CheckoutScreen, FootNote, miles, NextSteps, OutcomeHero, SummaryCard } from '@/components/money-ui';
import { QueryView } from '@/components/states';
import { formatEur, getRedemption } from '@/lib/api/redemptions';
import { mockWallet } from '@/lib/api/wallet';

export default function PaymentFailedScreen() {
  const { rid } = useLocalSearchParams<{ rid?: string }>();
  const query = useQuery({ queryKey: ['redemption', rid], queryFn: () => getRedemption(String(rid)), enabled: !!rid });

  return (
    <QueryView query={query}>
      {(redemption) => (
        <CheckoutScreen
          fullBleedTop
          footer={
            <BottomBar
              caption="Miles balance"
              value={`${miles(mockWallet.available)} miles`}
              action="Try another card"
              onPress={() => router.replace({ pathname: '/checkout/payment', params: { id: redemption.reward.id } })}
            />
          }
        >
          <OutcomeHero
            tone="failure"
            title="Payment failed"
            subtitle="Your card was declined. Nothing has been charged and your miles are back in your balance."
          />
          <SummaryCard
            rows={[
              { label: 'Miles returned', sub: 'Back in your balance', value: miles(redemption.miles) },
              {
                label: 'Cash not taken',
                sub: redemption.payment?.card ? `${redemption.payment.card.brand} ending ${redemption.payment.card.last4} · declined` : 'Declined',
                value: formatEur(redemption.cashMinor),
              },
              { label: 'Miles balance', value: miles(mockWallet.available), accent: true },
            ]}
          />
          <NextSteps
            tone="red"
            steps={[
              { title: 'Card declined', sub: 'Nothing was taken', state: 'done' },
              { title: 'Miles returned to their suppliers', sub: 'Already done', state: 'pending' },
              { title: 'Try another card', sub: 'The reward is still available', state: 'todo' },
            ]}
          />
          <FootNote>
            {`Your ${miles(redemption.miles)} miles went back to the supplier balances they came from. Nothing was charged to your card.`}
          </FootNote>
        </CheckoutScreen>
      )}
    </QueryView>
  );
}
