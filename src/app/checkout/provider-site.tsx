import { router, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { MilesHeader, MilesScreen } from '@/components/miles-ui';
import { Banner, Card, Eyebrow, GoldButton, KeyValue, miles, TextButton } from '@/components/money-ui';
import { getReward, getRewardMeta } from '@/components/rewards-data';
import { useToast } from '@/components/toast';
import { createRedemption, formatEur, getCheckoutDraft, previewQuote } from '@/lib/api/redemptions';

export default function ProviderSiteScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const reward = getReward(id);
  const meta = getRewardMeta(reward.id);
  const showToast = useToast();
  const quote = useQuery({
    queryKey: ['quote-preview', reward.id, reward.cost],
    queryFn: () => previewQuote({ rewardId: reward.id }),
  });

  const redeem = useMutation({
    mutationFn: () => createRedemption({ draft: getCheckoutDraft(reward.id) }),
    onError: (error) => showToast('Could not redeem', error.message),
  });

  async function openProvider(url: string) {
    try {
      await Linking.openURL(url);
    } catch (error) {
      showToast('Could not open the site', 'Copy the link and open it in your browser.');
      console.error('Failed to open provider site', error);
    }
  }

  async function copyCode(code: string) {
    try {
      await Clipboard.setStringAsync(code);
      showToast('Code copied', 'Enter it on the provider site.', 'success');
    } catch (error) {
      showToast('Could not copy code', 'Please copy the code manually.');
      console.error('Failed to copy discount code', error);
    }
  }

  const done = redeem.data;

  return (
    <MilesScreen>
      <MilesHeader title={done ? 'Continue on provider site' : 'Redeem with the provider'} subtitle={reward.title} />

      <Card>
        <Eyebrow>YOUR DISCOUNT</Eyebrow>
        <KeyValue label="Miles used" value={`${miles(reward.cost)} miles`} />
        <KeyValue label="Discount" value={quote.data ? `−${formatEur(quote.data.discountMinor)}` : '…'} tone="positive" />
        <KeyValue label="Cash due at the provider" value={quote.data ? formatEur(quote.data.cashDueAtProviderMinor) : '…'} last />
      </Card>

      {done ? (
        <>
          <Card className="items-center">
            <Text className="text-[12px] font-medium tracking-[1px] text-[#747B8B]">DISCOUNT CODE</Text>
            <Text selectable className="mt-2 text-[20px] font-bold tracking-[1px] text-ink">
              {done.voucher?.code}
            </Text>
            <Text onPress={() => done.voucher && void copyCode(done.voucher.code)} className="mt-3 text-[13px] font-semibold text-brand">
              Copy code
            </Text>
          </Card>
          <Banner tone="info" title="Pay the rest on their site">
            You will complete the booking with {meta.providerName}. No card is taken by WowMiles.
          </Banner>
          <GoldButton
            title={`Continue on ${meta.providerName}`}
            onPress={() => done.providerUrl && void openProvider(done.providerUrl)}
          />
          <TextButton title="Redemption history" onPress={() => router.replace('/redemption-history')} />
        </>
      ) : (
        <>
          <Banner tone="warning" title="Your miles are spent now">
            This reward is booked on {meta.providerName}&apos;s own site. Your miles are used when you continue, and you get a
            discount code to enter there.
          </Banner>
          <View className="mb-1 flex-row items-center justify-center">
            <ExternalLink color="#747B8B" size={14} />
            <Text className="ml-1.5 text-[12px] text-muted">Opens {meta.providerName} in your browser</Text>
          </View>
          <View className="h-3" />
          <GoldButton title="Redeem and get my code" loading={redeem.isPending} onPress={() => redeem.mutate()} />
          <TextButton title="Cancel" onPress={() => router.back()} />
        </>
      )}
    </MilesScreen>
  );
}
