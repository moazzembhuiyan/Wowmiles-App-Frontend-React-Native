import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, BriefcaseBusiness, CalendarDays, Globe2, Info, Lock, UsersRound } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomBar, CheckoutScreen, miles } from '@/components/money-ui';
import { QueryView } from '@/components/states';
import { getGuestPreview } from '@/lib/api/guest';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GuestPreviewScreen() {
  const insets = useSafeAreaInsets();
  const query = useQuery({ queryKey: ['guest-preview'], queryFn: getGuestPreview });

  return (
    <CheckoutScreen
      fullBleedTop
      footer={<BottomBar caption="Free for agencies" value="No subscription, no card" action="Join free" onPress={() => router.push('/(auth)/signup')} />}
    >
      <QueryView query={query}>
        {({ stats, sampleBalance, rewards }) => {
          const reward = rewards[0];
          const locked = [
            { Icon: BriefcaseBusiness, title: 'Register your bookings', detail: 'Earn miles on what you already sell' },
            { Icon: BookOpen, title: 'WowMiles Academy', detail: 'Partner training with bonus miles' },
            { Icon: CalendarDays, title: 'Events and trade fairs', detail: 'Invitations and attendance rewards' },
            { Icon: UsersRound, title: 'Global community', detail: `${miles(stats.agents)} agents across ${stats.countries} countries` },
          ];
          return (
            <>
              <View className="relative -mx-5 mb-5 overflow-hidden px-5 pb-8" style={{ paddingTop: insets.top + 12 }}>
                <LinearGradient
                  colors={['#11184F', '#29368F', '#454DC2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View pointerEvents="none" className="absolute -right-8 -top-14 h-60 w-60 rounded-full border border-white/10" />
                <View className="mb-6 flex-row items-center justify-between">
                  <View className="flex-row items-center rounded-full border border-white/25 bg-white/15 px-3 py-1.5">
                    <Info color="white" size={14} />
                    <Text className="ml-1.5 text-[12px] font-semibold tracking-[0.5px] text-white">PREVIEW</Text>
                  </View>
                  <Pressable accessibilityRole="link" onPress={() => router.push('/(auth)/login')} hitSlop={10}>
                    <Text className="text-[15px] font-semibold text-white">Log in</Text>
                  </Pressable>
                </View>
                <Text className="text-[12px] font-medium tracking-[0.8px] text-[#D8DAF2]">SAMPLE BALANCE</Text>
                <View className="mt-1 flex-row items-baseline">
                  <Text className="text-[52px] font-bold leading-[58px] tracking-[-1.5px] text-white">{miles(sampleBalance)}</Text>
                  <Text className="ml-2 text-[16px] text-[#D8DAF2]">miles</Text>
                </View>
                <Text className="mt-2 text-[15px] leading-[22px] text-[#D8DAF2]">
                  This is example data. Register free to start earning on the bookings you already sell.
                </Text>
              </View>

              <Text className="mb-3 text-[20px] font-semibold text-ink">A reward you could claim</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push({ pathname: '/guest/reward', params: { id: reward.id } })}
                className="mb-5 overflow-hidden rounded-[22px] bg-white"
              >
                <View className="h-[100px] overflow-hidden px-5 pt-5">
                  <LinearGradient
                    colors={['#2E347E', '#7A82E0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <View pointerEvents="none" className="absolute -right-10 -top-12 h-44 w-44 rounded-full border border-white/15" />
                  <Globe2 color="white" size={28} strokeWidth={1.5} />
                </View>
                <View className="px-5 py-4">
                  <Text className="text-[19px] font-medium text-ink">{reward.title}</Text>
                  <View className="mt-1.5 flex-row items-baseline">
                    <Text className="text-[20px] font-semibold text-[#A85F05]">{miles(reward.milesPrice)}</Text>
                    <Text className="ml-1.5 text-[14px] text-muted">{`miles · worth €${reward.eurValue}`}</Text>
                  </View>
                </View>
              </Pressable>

              <Text className="mb-2 text-[12px] font-semibold tracking-[0.8px] text-[#747B8B]">UNLOCK WITH A FREE ACCOUNT</Text>
              <View className="mb-6 rounded-[22px] border border-line bg-white px-4">
                {locked.map(({ Icon, title, detail }, index) => (
                  <View key={title} className={`flex-row items-center py-4 ${index < locked.length - 1 ? 'border-b border-[#EEF0F4]' : ''}`}>
                    <View className="mr-3 h-10 w-10 items-center justify-center rounded-[12px] bg-[#F3F4F7]">
                      <Icon color="#8991A0" size={18} />
                    </View>
                    <View className="flex-1 pr-2">
                      <Text className="text-[17px] font-medium text-[#555D6E]">{title}</Text>
                      <Text className="mt-0.5 text-[14px] text-muted">{detail}</Text>
                    </View>
                    <Lock color="#7C8494" size={17} />
                  </View>
                ))}
              </View>
            </>
          );
        }}
      </QueryView>
    </CheckoutScreen>
  );
}
