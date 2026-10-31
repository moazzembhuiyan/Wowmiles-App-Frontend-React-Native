import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Building2, ChevronRight, Search } from 'lucide-react-native';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { MilesScreen, Pill } from '@/components/miles-ui';
import { FeatureHero, SectionHeading } from '@/components/feature-ui';

const types = ['All', 'Airlines', 'Cruises', 'Hotels', 'DMC'] as const;
type PartnerType = (typeof types)[number];
const partners = [
  { name: 'Emirates', detail: 'Airline · 140+ destinations', type: 'Airlines', icon: '✈' },
  { name: 'MSC Cruises', detail: 'Cruises · Mediterranean', type: 'Cruises', icon: '◉' },
  { name: 'Hilton Hotels', detail: 'Hotels · Worldwide', type: 'Hotels', icon: 'H' },
  { name: 'Anantara', detail: 'Hotels · Luxury stays', type: 'Hotels', icon: 'A' },
  { name: 'Beverly DMC', detail: 'Destination management · Global', type: 'DMC', icon: 'B' },
];

export default function PartnersScreen() {
  const [type, setType] = useState<PartnerType>('All');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const list = useMemo(
    () => partners.filter((partner) =>
      (type === 'All' || partner.type === type) &&
      partner.name.toLowerCase().includes(query.toLowerCase()),
    ),
    [query, type],
  );

  return (
    <MilesScreen fullBleedTop>
      <FeatureHero
        title="Partners"
        subtitle="29 brands · 2 live campaigns"
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Search partners"
          onPress={() => setSearchOpen((value) => !value)}
          className="h-10 w-10 items-center justify-center rounded-full bg-white/15"
        >
          <Search color="white" size={19} />
        </Pressable>
      </FeatureHero>
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
          <Pill key={item} label={item} selected={type === item} onPress={() => setType(item)} />
        ))}
      </ScrollView>

      <SectionHeading title="Live campaigns" />
      {[
        ['2×', 'Double miles on premium cabins', 'Ends 31 Oct'],
        ['2×', 'Double miles on Mediterranean sailings', 'Ends 30 Nov'],
      ].map(([badge, title, detail]) => (
        <Pressable
          key={title}
          onPress={() => router.push('/rewards')}
          className="mb-2 flex-row items-center rounded-[14px] bg-[#414CBD] px-3 py-3"
        >
          <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-[#FFB91F]">
            <Text className="text-[12px] font-bold text-[#202638]">{badge}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-[14px] font-semibold text-white">{title}</Text>
            <Text className="mt-1 text-[12px] text-[#E0E3F7]">{detail}</Text>
          </View>
          <ChevronRight color="white" size={18} />
        </Pressable>
      ))}
      <SectionHeading title="All partners" />
      <View className="mb-8 rounded-[16px] bg-white px-4">
        {list.map((partner, index) => (
          <Pressable
            key={partner.name}
            accessibilityRole="button"
            onPress={() => router.push('/rewards')}
            className={`flex-row items-center py-3.5 ${index < list.length - 1 ? 'border-b border-[#EEF0F4]' : ''}`}
          >
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-[11px] bg-[#414CBD]">
              {partner.icon === '✈' ? <Building2 color="white" size={18} /> : <Text className="text-[15px] font-bold text-white">{partner.icon}</Text>}
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-semibold text-[#202638]">{partner.name}</Text>
              <Text className="mt-0.5 text-[12px] text-[#747B8B]">{partner.detail}</Text>
            </View>
            <ChevronRight color="#858B98" size={18} />
          </Pressable>
        ))}
      </View>
    </MilesScreen>
  );
}
