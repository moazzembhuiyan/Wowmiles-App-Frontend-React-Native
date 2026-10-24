import { router } from 'expo-router';
import { Award, Check, ChevronRight, Lock, Sparkles, Star, TrendingUp } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { MilesHeader, MilesScreen, SectionTitle } from '@/components/miles-ui';

const tiers = [
  { name: 'Silver', range: '0 – 29,999 miles', status: 'complete' },
  { name: 'Gold', range: '30,000 – 79,999 miles', status: 'current' },
  { name: 'Platinum Ambassador', range: '80,000+ miles', status: 'locked' },
] as const;

const benefits = [
  { text: '1.25× miles on participating partner brands', Icon: TrendingUp },
  { text: 'Exclusive invitations to trade fairs and workshops', Icon: Award },
  { text: 'Personal travel discounts with partner hotels', Icon: Sparkles },
];

export default function LoyaltyScreen() {
  return (
    <MilesScreen>
      <MilesHeader title="Loyalty status" />

      <View className="mb-5 rounded-[20px] bg-[#FCF2D8] px-5 py-5">
        <View className="flex-row items-center">
          <Award color="#A77C19" size={17} />
          <Text className="ml-2 text-[12px] font-semibold text-[#946A13]">Gold</Text>
        </View>
        <View className="mt-4 flex-row items-baseline">
          <Text className="text-[34px] font-bold tracking-[-1px] text-ink">48,500</Text>
          <Text className="ml-2 text-[12px] text-muted">miles</Text>
        </View>
        <View className="mt-3 h-[7px] overflow-hidden rounded-full bg-white">
          <View className="h-full w-[61%] rounded-full bg-[#D4A332]" />
        </View>
        <Text className="mt-2.5 text-[11px] text-muted">31,500 miles to Platinum Ambassador</Text>
      </View>

      <SectionTitle title="Tier ladder" />
      <View className="mb-5 overflow-hidden rounded-[16px] bg-white">
        {tiers.map((tier, index) => {
          const isCurrent = tier.status === 'current';
          const Icon = tier.status === 'complete' ? Check : tier.status === 'current' ? Star : Lock;
          return (
            <Pressable
              key={tier.name}
              accessibilityRole={tier.status === 'locked' ? 'button' : undefined}
              disabled={tier.status !== 'locked'}
              onPress={() => router.push('/tier-benefits')}
              className={`min-h-[68px] flex-row items-center px-4 ${isCurrent ? 'bg-[#F0F1FB]' : 'bg-white'} ${index < tiers.length - 1 ? 'border-b border-[#F0F1F5]' : ''}`}
            >
              <View
                className={`mr-3 h-9 w-9 items-center justify-center rounded-full ${
                  isCurrent ? 'bg-brand' : tier.status === 'complete' ? 'bg-[#E7F6EF]' : 'bg-[#F3F4F7]'
                }`}
              >
                <Icon
                  color={isCurrent ? 'white' : tier.status === 'complete' ? '#23875D' : '#9299A7'}
                  size={17}
                  strokeWidth={2}
                />
              </View>
              <View className="flex-1">
                <Text className={`text-[14px] font-semibold ${tier.status === 'locked' ? 'text-muted' : 'text-ink'}`}>
                  {tier.name}
                </Text>
                <Text className="mt-1 text-[11px] text-muted">{tier.range}</Text>
              </View>
              {isCurrent ? (
                <View className="rounded-full bg-brand px-2.5 py-1">
                  <Text className="text-[10px] font-semibold text-white">Current</Text>
                </View>
              ) : tier.status === 'locked' ? (
                <ChevronRight color="#9AA1AF" size={18} />
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <SectionTitle
        title="Your Gold benefits"
        action="See Platinum"
        onAction={() => router.push('/tier-benefits')}
      />
      <View className="mb-4 rounded-[16px] bg-white px-4">
        {benefits.map(({ text, Icon }, index) => (
          <View
            key={text}
            className={`flex-row items-center py-3.5 ${index < benefits.length - 1 ? 'border-b border-[#F0F1F5]' : ''}`}
          >
            <View className="mr-3 h-9 w-9 items-center justify-center rounded-[11px] bg-[#FCF4DF]">
              <Icon color="#A77C19" size={17} />
            </View>
            <Text className="flex-1 text-[12px] leading-[18px] text-muted">{text}</Text>
          </View>
        ))}
      </View>
    </MilesScreen>
  );
}
