import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import {
  ArrowLeft,
  Award,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Globe2,
  LockKeyhole,
  MessageCircle,
  TrendingUp,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const tiers = [
  { name: 'Silver', range: '0 – 29,999 miles', status: 'complete' },
  { name: 'Gold', range: '30,000 – 79,999 miles', status: 'current' },
  { name: 'Platinum Ambassador', range: '80,000+ miles', status: 'locked' },
] as const;

const benefits = [
  {
    title: '1.25× miles on partner brands',
    detail: 'Applied automatically on every approved booking with a participating partner.',
    Icon: TrendingUp,
    expanded: true,
  },
  {
    title: 'Exclusive event invitations',
    detail: undefined,
    Icon: CalendarDays,
    expanded: false,
  },
  {
    title: 'Personal travel discounts',
    detail: undefined,
    Icon: Globe2,
    expanded: false,
  },
  {
    title: 'Priority support · 1 working day',
    detail: undefined,
    Icon: MessageCircle,
    expanded: false,
  },
] as const;

export default function LoyaltyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-[#F8F9FB]">
      <View
        pointerEvents="none"
        className="absolute left-0 right-0 top-0 bg-[#11184F]"
        style={{ height: insets.top }}
      />
      <SafeAreaView
        edges={['top', 'bottom']}
        className="w-full max-w-[440px] flex-1 self-center bg-transparent"
      >
        <StatusBar style="light" />
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, backgroundColor: '#F8F9FB' }}
          showsVerticalScrollIndicator={false}
        >
          <View className="relative h-[330px] overflow-hidden px-5 pb-6 pt-4">
            <LinearGradient
              colors={['#11184F', '#29368F', '#454DC2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View
              pointerEvents="none"
              className="absolute -right-7 -top-14 h-52 w-52 rounded-full border border-white/10"
            />
            <View
              pointerEvents="none"
              className="absolute -right-3 -top-4 h-40 w-40 rounded-full border border-white/10"
            />

            <View className="flex-row items-center">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go back"
                onPress={() => router.back()}
                className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-white/20"
                hitSlop={8}
              >
                <ArrowLeft color="white" size={20} />
              </Pressable>
              <Text className="text-[16px] font-medium text-white">Loyalty status</Text>
            </View>

            <View className="mt-7 h-16 w-16 items-center justify-center rounded-full border-2 border-[#FFB91F] bg-[#FFB91F]">
              <Award color="#24284E" size={25} strokeWidth={1.8} />
            </View>
            <Text className="mt-2 text-[38px] font-light leading-[44px] text-white">Gold</Text>
            <View className="mt-1 flex-row items-baseline">
              <Text className="text-[22px] font-semibold leading-[28px] text-white">48,500</Text>
              <Text className="ml-1.5 text-[13px] text-[#D8DAF2]">of 80,000 lifetime miles</Text>
            </View>

            <View className="mt-auto">
              <View className="h-[4px] justify-center rounded-full bg-white/20">
                <View className="h-full w-1/2 rounded-full bg-[#FFB91F]" />
                <View className="absolute left-[3%] h-3 w-3 rounded-full border-2 border-[#FFB91F] bg-[#FFB91F]" />
                <View
                  className="absolute h-7 w-7 items-center justify-center rounded-full border-[3px] border-white/35 bg-[#FFB91F]"
                  style={{ left: '50%', marginLeft: -14 }}
                >
                  <View className="h-3 w-3 rounded-full bg-[#FFB91F]" />
                </View>
                <View className="absolute right-[3%] h-3 w-3 rounded-full bg-[#202B75]" />
              </View>
              <View className="mt-4 flex-row justify-between">
                <Text className="text-[12px] text-[#E0E3F7]">Silver</Text>
                <Text className="text-[12px] text-[#E0E3F7]">Gold</Text>
                <Text className="text-[12px] text-[#9EA6D0]">Platinum</Text>
              </View>
            </View>
          </View>

          <View className="flex-1 bg-[#F8F9FB] px-5 pb-6 pt-5">
            <Text className="mb-3 text-[12px] font-semibold tracking-[0.7px] text-[#747B8B]">
              TIER LADDER
            </Text>
            <View className="mb-5">
              {tiers.map((tier, index) => {
                const current = tier.status === 'current';
                const complete = tier.status === 'complete';
                const Icon = complete ? Check : current ? Award : LockKeyhole;

                return (
                  <Pressable
                    key={tier.name}
                    accessibilityRole={tier.status === 'locked' ? 'button' : undefined}
                    disabled={tier.status !== 'locked'}
                    onPress={() => tier.status === 'locked' && router.push('/tier-benefits')}
                    className="min-h-[54px] flex-row items-center"
                  >
                    <View className="mr-3 h-[42px] w-7 items-center justify-center">
                      {index < tiers.length - 1 ? (
                        <View className="absolute bottom-[-8px] top-[34px] w-px bg-[#DDE1EA]" />
                      ) : null}
                      <View
                        className={`h-9 w-9 items-center justify-center rounded-full ${
                          current ? 'bg-[#FFB91F]' : complete ? 'bg-[#E7F6EF]' : 'bg-[#F0F1F5]'
                        }`}
                      >
                        <Icon
                          color={current ? '#24284E' : complete ? '#23875D' : '#858B98'}
                          size={17}
                          strokeWidth={2}
                        />
                      </View>
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`text-[15px] font-medium ${
                          tier.status === 'locked' ? 'text-[#858B98]' : 'text-[#202638]'
                        }`}
                      >
                        {tier.name}
                      </Text>
                      <Text className="mt-0.5 text-[12px] text-[#858B98]">{tier.range}</Text>
                    </View>
                    {current ? (
                      <View className="rounded-full bg-[#4145B6] px-3 py-1">
                        <Text className="text-[12px] font-semibold text-white">You</Text>
                      </View>
                    ) : tier.status === 'locked' ? (
                      <ChevronRight color="#858B98" size={17} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            <Text className="mb-2 text-[12px] font-semibold tracking-[0.7px] text-[#747B8B]">
              YOUR GOLD BENEFITS
            </Text>
            <View className="mb-3">
              {benefits.map(({ title, detail, Icon, expanded }) => (
                <View key={title} className="border-b border-[#E8EAF0]">
                  <Pressable
                    accessibilityRole={detail ? 'button' : undefined}
                    accessibilityState={detail ? { expanded } : undefined}
                    className="min-h-[52px] flex-row items-center"
                  >
                    <Icon color="#5969C7" size={17} strokeWidth={1.8} />
                    <Text className="ml-3 flex-1 text-[14px] font-medium text-[#202638]">
                      {title}
                    </Text>
                    {detail ? (
                      <ChevronDown color="#858B98" size={17} />
                    ) : (
                      <ChevronRight color="#858B98" size={17} />
                    )}
                  </Pressable>
                  {detail ? (
                    <Text className="mb-3 ml-[29px] mr-5 text-[12px] leading-[18px] text-[#626A79]">
                      {detail}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
