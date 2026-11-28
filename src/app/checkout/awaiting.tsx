import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { BottomBar, CheckoutScreen, FootNote, formatDate, miles, NextSteps, OutcomeHero, SummaryCard } from '@/components/money-ui';
import { QueryView } from '@/components/states';
import { getRewardMeta } from '@/components/rewards-data';
import { formatEur, getRedemption } from '@/lib/api/redemptions';
import { mockWallet } from '@/lib/api/wallet';

function deadlineLabel(iso: string) {
  const date = new Date(iso);
  const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  return `${formatDate(iso)}, ${time}`;
}

export default function AwaitingProviderScreen() {
  const { rid } = useLocalSearchParams<{ rid?: string }>();
  const query = useQuery({ queryKey: ['redemption', rid], queryFn: () => getRedemption(String(rid)), enabled: !!rid });

  return (
    <QueryView query={query}>
      {(redemption) => {
        const provider = getRewardMeta(redemption.reward.id).providerName;
        const held = redemption.hold?.miles ?? redemption.miles;
        const balance = redemption.hold?.balanceIfDeclined ?? mockWallet.available;
        const request = redemption.request;
        return (
          <CheckoutScreen
            fullBleedTop
            footer={
              <BottomBar
                caption="Miles balance now"
                value={`${miles(mockWallet.available - held)} miles`}
                action="View wallet"
                onPress={() => router.replace('/wallet')}
              />
            }
          >
            <OutcomeHero
              tone="success"
              title={`Waiting on ${provider}`}
              subtitle={`${provider} has your request${request?.preferredDate ? ` for ${request.preferredDate}` : ''}. Confirmation arrives within 2 working days.`}
            />
            <SummaryCard
              rows={[
                { label: 'Miles on hold', sub: 'Reserved, not spent', value: miles(held) },
                ...(redemption.payment
                  ? [
                      {
                        label: 'Cash taken',
                        sub: redemption.payment.card ? `${redemption.payment.card.brand} ending ${redemption.payment.card.last4}` : undefined,
                        value: formatEur(redemption.payment.amountMinor),
                      },
                    ]
                  : []),
                { label: 'Balance if they decline', value: miles(balance), accent: true },
              ]}
            />
            <NextSteps
              steps={[
                {
                  title: redemption.providerDeadline ? `${provider} has until ${deadlineLabel(redemption.providerDeadline)}` : `${provider} is reviewing`,
                  sub: redemption.payment ? formatEur(redemption.payment.amountMinor) : `${miles(held)} miles on hold`,
                  state: 'done',
                },
                { title: 'If they decline, miles and cash come back', sub: 'Within 2 working days', state: 'pending' },
                { title: 'Voucher issued', sub: 'After supplier confirmation', state: 'todo' },
              ]}
            />
            <FootNote>
              {`If ${provider} cannot confirm, your ${miles(held)} miles return to the supplier balances they came from${redemption.payment ? ` and the ${formatEur(redemption.payment.amountMinor)} is refunded to your card` : ''}.`}
            </FootNote>
          </CheckoutScreen>
        );
      }}
    </QueryView>
  );
}
