import { router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, Eye, MoreVertical, Upload } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckoutScreen, formatDate, miles } from '@/components/money-ui';
import { QueryView } from '@/components/states';
import { useToast } from '@/components/toast';
import { getPartner, type Partner } from '@/lib/api/partners';

const socialLabels = { facebook: 'Facebook', instagram: 'Instagram', x: 'X', tiktok: 'TikTok', youtube: 'YouTube' } as const;

const host = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

function Hero({ partner }: { partner: Partner }) {
  const insets = useSafeAreaInsets();
  const campaign = partner.activeCampaign;
  return (
    <View className="relative -mx-5 overflow-hidden px-5 pb-6" style={{ paddingTop: insets.top + 12 }}>
      <LinearGradient colors={['#0A3A29', '#0F5A3E', '#17784F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View pointerEvents="none" className="absolute -right-10 -top-14 h-64 w-64 rounded-full border border-white/10" />
      <View pointerEvents="none" className="absolute right-6 top-2 h-44 w-44 rounded-full border border-white/10" />
      <View className="mb-5 flex-row items-center justify-between">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
          hitSlop={8}
        >
          <ArrowLeft color="white" size={20} />
        </Pressable>
        <View className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
          <MoreVertical color="white" size={18} />
        </View>
      </View>
      <View className="mb-3 flex-row items-center">
        {campaign ? (
          <View className="mr-2 flex-row items-center rounded-full bg-white px-3 py-1">
            <View className="mr-1.5 h-1.5 w-1.5 rounded-full bg-[#0B9A5E]" />
            <Text className="text-[12px] font-semibold text-[#0B7A4B]">{`${campaign.multiplier}× running`}</Text>
          </View>
        ) : null}
        <Text className="flex-1 text-[13px] text-white/70" numberOfLines={1}>
          {`${partner.serviceTypeLabel} · ${partner.destinationsText}`}
        </Text>
      </View>
      <Text className="text-[34px] font-bold leading-[40px] text-white">{partner.name}</Text>
      {campaign ? (
        <View className="mt-2 flex-row items-baseline">
          <Text className="text-[30px] font-bold text-white">{`${campaign.multiplier}×`}</Text>
          <Text className="ml-2 text-[14px] text-white/60">{`to ${formatDate(campaign.endsAt)}`}</Text>
        </View>
      ) : null}
    </View>
  );
}

function Section({ title }: { title: string }) {
  return <Text className="mb-3 mt-5 text-[12px] font-semibold tracking-[1px] text-[#747B8B]">{title}</Text>;
}

export default function PartnerDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const showToast = useToast();
  const query = useQuery({ queryKey: ['partner', id], queryFn: () => getPartner(String(id)), enabled: !!id });

  async function open(url: string) {
    try {
      await Linking.openURL(url);
    } catch (error) {
      showToast('Could not open the link', url);
      console.error('Failed to open link', error);
    }
  }

  return (
    <QueryView query={query} loadingLabel="Loading partner…">
      {(partner) => {
        const site = host(partner.bookingUrl);
        const steps = [
          { title: 'Book on their site', sub: 'Use the link below' },
          { title: 'Register it here', sub: 'Add proof of payment' },
          { title: `${partner.name} confirms`, sub: 'Miles are credited' },
        ];
        const details = [
          ...(partner.myMiles ? [{ label: `Your miles with ${partner.name}`, value: miles(partner.myMiles.available) }] : []),
          { label: 'Type of service', value: partner.serviceTypeLabel },
          { label: 'Destinations', value: partner.destinationsDetail },
          { label: 'You earn per €1,000 booked', value: `${miles(partner.earnPer1000Eur)} miles` },
        ];
        const contact = [
          { label: 'Phone', value: partner.contact.phone, url: `tel:${partner.contact.phone.replace(/\s/g, '')}` },
          { label: 'Email', value: partner.contact.email, url: `mailto:${partner.contact.email}` },
          { label: 'Website', value: host(partner.contact.website), url: partner.contact.website },
        ];
        return (
          <CheckoutScreen
            fullBleedTop
            footer={
              <View className="px-3 pb-3 pt-2">
                <View className="rounded-full bg-[#10131D] p-1.5">
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push('/(tabs)/bookings')}
                    className="h-[52px] items-center justify-center rounded-full bg-white"
                  >
                    <Text className="text-[16px] font-semibold text-ink">Register a booking</Text>
                  </Pressable>
                </View>
              </View>
            }
          >
            <Hero partner={partner} />

            <View className="-mx-5 -mt-1 bg-canvas px-5 pt-4">
              <View className="mb-1 flex-row rounded-[18px] bg-[#E6F7EE] p-4">
                <CheckCircle2 color="#0B7A4B" size={20} />
                <View className="ml-3 flex-1">
                  <Text className="text-[16px] font-medium text-[#0B7A4B]">{`Book on ${site.split('/')[0]}`}</Text>
                  <Text className="mt-0.5 text-[14px] leading-[20px] text-[#0B7A4B]">
                    {`Bookings happen on ${partner.name}'s own site — register them here for miles`}
                  </Text>
                </View>
              </View>

              <Section title="HOW YOU EARN" />
              {steps.map((step, index) => (
                <View key={step.title} className="flex-row">
                  <View className="mr-3 items-center">
                    <CheckCircle2 color="#0B9A5E" size={20} />
                    {index < steps.length - 1 ? <View className="my-0.5 h-3 w-px bg-[#DDE1E8]" /> : null}
                  </View>
                  <View className="flex-1 pb-2">
                    <Text className="text-[16px] text-ink">{step.title}</Text>
                    <Text className="text-[14px] text-muted">{step.sub}</Text>
                  </View>
                </View>
              ))}

              <Section title="ABOUT" />
              <Text className="text-[16px] leading-[24px] text-[#555D6E]">{partner.about}</Text>

              <Section title="PARTNER DETAILS" />
              {details.map((row, index) => (
                <View key={row.label} className={`flex-row items-center justify-between py-4 ${index < details.length - 1 ? 'border-b border-[#E9EBF0]' : ''}`}>
                  <Text className="mr-3 flex-1 text-[16px] text-[#555D6E]">{row.label}</Text>
                  <Text className="text-[16px] font-medium text-ink">{row.value}</Text>
                </View>
              ))}

              <Section title="CONTACT" />
              <View className="border-b border-[#E9EBF0] pb-4">
                <Text className="text-[16px] text-[#555D6E]">Head office</Text>
                <Text className="mt-1.5 text-[17px] font-medium leading-[26px] text-ink">{partner.contact.headOffice}</Text>
              </View>
              {contact.map((row, index) => (
                <Pressable
                  key={row.label}
                  accessibilityRole="link"
                  onPress={() => void open(row.url)}
                  className={`flex-row items-center justify-between py-4 ${index < contact.length - 1 ? 'border-b border-[#E9EBF0]' : ''}`}
                >
                  <Text className="text-[16px] text-[#555D6E]">{row.label}</Text>
                  <Text className="text-[16px] font-medium text-ink">{row.value}</Text>
                </Pressable>
              ))}

              <View className="mb-4 mt-2 flex-row flex-wrap">
                {(Object.keys(socialLabels) as (keyof typeof socialLabels)[])
                  .filter((key) => partner.socials[key])
                  .map((key) => (
                    <Pressable
                      key={key}
                      accessibilityRole="link"
                      onPress={() => void open(partner.socials[key])}
                      className="mb-2 mr-2 rounded-full border border-line bg-white px-3.5 py-2"
                    >
                      <Text className="text-[14px] text-ink">{socialLabels[key]}</Text>
                    </Pressable>
                  ))}
              </View>

              <Pressable
                accessibilityRole="link"
                onPress={() => void open(partner.bookingUrl)}
                className="mb-4 flex-row items-center rounded-[18px] border border-line bg-white p-4"
              >
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-[12px] bg-[#ECEEFB]">
                  <Upload color="#4145B6" size={18} />
                </View>
                <View className="flex-1">
                  <Text className="text-[17px] font-medium text-ink">{site}</Text>
                  <Text className="mt-0.5 text-[14px] text-muted">{`Opens ${partner.name}'s own booking site`}</Text>
                </View>
                <Eye color="#858B98" size={18} />
              </Pressable>
            </View>
          </CheckoutScreen>
        );
      }}
    </QueryView>
  );
}
