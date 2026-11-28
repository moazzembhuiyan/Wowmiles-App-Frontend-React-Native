import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, BriefcaseBusiness, ChevronRight, Clock3, Globe2, Hotel, Search, Star } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MilesScreen, Pill } from '@/components/miles-ui';
import { formatDate } from '@/components/money-ui';
import { EmptyState, QueryView } from '@/components/states';
import { getPartners, type Partner, type PartnerServiceType } from '@/lib/api/partners';

const types = [
  { label: 'All', value: 'all' },
  { label: 'Airlines', value: 'airline' },
  { label: 'Cruises', value: 'cruise' },
  { label: 'Hotels', value: 'hotel' },
  { label: 'DMC', value: 'dmc' },
] as const;

const tileColors: Record<PartnerServiceType, readonly [string, string]> = {
  airline: ['#2E347E', '#4B55C9'],
  cruise: ['#11184F', '#4B55C9'],
  hotel: ['#4B55C9', '#9BA4EA'],
  dmc: ['#2E347E', '#4B55C9'],
  other: ['#9E6B31', '#F0A82A'],
};

function PartnerIcon({ partner }: { partner: Partner }) {
  const props = { color: 'white', size: 18 };
  const Icon =
    partner.serviceType === 'cruise'
      ? Globe2
      : partner.serviceType === 'hotel' && partner.name !== 'Anantara'
        ? Hotel
        : partner.name === 'Anantara'
          ? Star
          : BriefcaseBusiness;
  const colors = partner.name === 'Anantara' ? (['#9E5C0A', '#F0A82A'] as const) : tileColors[partner.serviceType];
  return (
    <View className="mr-3 h-10 w-10 overflow-hidden rounded-[11px]">
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View className="flex-1 items-center justify-center">
        <Icon {...props} />
      </View>
    </View>
  );
}

export default function PartnersScreen() {
  const insets = useSafeAreaInsets();
  const [type, setType] = useState<PartnerServiceType | 'all'>('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const partners = useQuery({
    queryKey: ['partners', type, query],
    queryFn: () => getPartners(type, query),
  });
  const meta = partners.data?.meta;

  return (
    <MilesScreen fullBleedTop>
      <View className="relative -mx-5 mb-4 overflow-hidden px-5 pb-6" style={{ paddingTop: insets.top + 8 }}>
        <LinearGradient
          colors={['#11184F', '#29368F', '#454DC2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View pointerEvents="none" className="absolute -right-8 -top-14 h-52 w-52 rounded-full border border-white/10" />
        <View className="mb-5 flex-row items-center">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white/15"
            hitSlop={8}
          >
            <ArrowLeft color="white" size={20} />
          </Pressable>
          <Text className="flex-1 text-[16px] font-medium text-[#E0E3F7]">Partners</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search partners"
            onPress={() => setSearchOpen((value) => !value)}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/15"
          >
            <Search color="white" size={19} />
          </Pressable>
        </View>
        <Text className="text-[24px] font-bold text-white">
          {`${meta?.brandsCount ?? 0} brands, ${meta?.liveCampaignsCount ?? 0} live campaigns`}
        </Text>
        <Text className="mt-1 text-[14px] text-[#D8DAF2]">Earn boosted miles with participating suppliers</Text>
      </View>

      {searchOpen ? (
        <TextInput
          accessibilityLabel="Search partners"
          value={query}
          onChangeText={setQuery}
          placeholder="Search partners"
          placeholderTextColor="#858B98"
          className="mb-3 h-[46px] rounded-[12px] border border-[#E5E8EF] bg-white px-4 text-[15px] text-[#202638]"
        />
      ) : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 max-h-11">
        {types.map((item) => (
          <Pill key={item.value} label={item.label} selected={type === item.value} onPress={() => setType(item.value)} />
        ))}
      </ScrollView>

      <QueryView
        query={partners}
        isEmpty={(result) => result.data.length === 0}
        empty={<EmptyState title="No partners found" description="Try a different type or search." />}
      >
        {(result) => (
          <>
            {result.data.some((partner) => partner.activeCampaign) ? (
              <Text className="mb-2 text-[12px] font-semibold tracking-[0.8px] text-[#747B8B]">RUNNING NOW</Text>
            ) : null}
            {result.data.map((partner) =>
              partner.activeCampaign ? (
                <Pressable
                  key={partner.activeCampaign.campaignId}
                  accessibilityRole="button"
                  onPress={() => router.push({ pathname: '/partner/[id]', params: { id: partner.id } })}
                  className="mb-3 overflow-hidden rounded-[18px] bg-white"
                >
                  <View className="flex-row items-center px-3 py-3.5">
                    <LinearGradient
                      colors={['#2E347E', '#5560D0']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <View className="mr-3 h-12 w-12 items-center justify-center rounded-[12px] bg-[#FFB91F]">
                      <Text className="text-[18px] font-medium text-[#202638]">{`${partner.activeCampaign.multiplier}×`}</Text>
                    </View>
                    <View className="flex-1 pr-2">
                      <Text className="text-[12px] text-[#D8DAF2]">{partner.name}</Text>
                      <Text className="mt-0.5 text-[15px] font-semibold text-white">{partner.activeCampaign.title}</Text>
                    </View>
                    <ChevronRight color="white" size={18} />
                  </View>
                  <View className="flex-row items-center bg-white px-4 py-3">
                    <Clock3 color="#858B98" size={15} />
                    <Text className="ml-2 text-[13px] text-muted">{`Ends ${formatDate(partner.activeCampaign.endsAt)}`}</Text>
                  </View>
                </Pressable>
              ) : null,
            )}
            <Text className="mb-1 mt-3 text-[12px] font-semibold tracking-[0.8px] text-[#747B8B]">ALL PARTNERS</Text>
            <View className="mb-8">
              {result.data.map((partner, index) => (
                <Pressable
                  key={partner.id}
                  accessibilityRole="button"
                  onPress={() => router.push({ pathname: '/partner/[id]', params: { id: partner.id } })}
                  className={`flex-row items-center py-3.5 ${index < result.data.length - 1 ? 'border-b border-[#E9EBF0]' : ''}`}
                >
                  <PartnerIcon partner={partner} />
                  <View className="flex-1">
                    <Text className="text-[16px] font-medium text-[#202638]">{partner.name}</Text>
                    <Text className="mt-0.5 text-[13px] text-[#747B8B]">
                      {`${partner.serviceTypeLabel} · ${partner.destinationsText}`}
                    </Text>
                  </View>
                  <ChevronRight color="#858B98" size={18} />
                </Pressable>
              ))}
            </View>
          </>
        )}
      </QueryView>
    </MilesScreen>
  );
}
