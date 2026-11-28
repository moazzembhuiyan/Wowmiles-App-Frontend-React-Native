import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, Info, Sofa } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomBar, CheckoutScreen, miles } from '@/components/money-ui';
import { QueryView } from '@/components/states';
import { getGuestReward } from '@/lib/api/guest';

export default function GuestRewardScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const query = useQuery({ queryKey: ['guest-reward', id], queryFn: () => getGuestReward(id) });

  return (
    <CheckoutScreen
      fullBleedTop
      footer={<BottomBar caption="Free for agencies" value="Verified in 2 working days" action="Join free" onPress={() => router.push('/(auth)/signup')} />}
    >
      <QueryView query={query}>
        {(reward) => (
          <>
            <View className="relative -mx-5 overflow-hidden px-5" style={{ height: 300 + insets.top, paddingTop: insets.top + 12 }}>
              <LinearGradient
                colors={['#2E347E', '#5C66CC', '#7A82E0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View pointerEvents="none" className="absolute -right-10 -top-12 h-72 w-72 rounded-full border border-white/10" />
              <View pointerEvents="none" className="absolute left-16 top-4 h-52 w-52 rounded-full border border-white/10" />
              <View className="flex-row items-center justify-between">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Go back"
                  onPress={() => router.back()}
                  className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
                  hitSlop={8}
                >
                  <ArrowLeft color="white" size={20} />
                </Pressable>
                <View className="flex-row items-center rounded-full border border-white/25 bg-white/15 px-3 py-1.5">
                  <Info color="white" size={14} />
                  <Text className="ml-1.5 text-[12px] font-semibold tracking-[0.5px] text-white">PREVIEW</Text>
                </View>
              </View>
              <View className="absolute left-0 right-0 items-center" style={{ top: insets.top + 80 }}>
                <Sofa color="white" size={64} strokeWidth={1} />
              </View>
            </View>

            <View className="-mx-5 -mt-6 rounded-t-[28px] bg-canvas px-5 pb-6 pt-5">
              <View className="self-start rounded-full bg-[#ECEEFF] px-3 py-1.5">
                <Text className="text-[12px] font-semibold uppercase tracking-[0.4px] text-brand">Sample reward</Text>
              </View>
              <Text className="mt-3 text-[32px] font-bold leading-[38px] text-ink">{reward.title}</Text>
              <View className="mt-1 flex-row items-baseline">
                <Text className="text-[44px] font-bold leading-[52px] text-[#A85F05]">{miles(reward.milesPrice)}</Text>
                <Text className="ml-2.5 text-[16px] text-muted">{`miles · worth €${reward.eurValue}`}</Text>
              </View>
              <Text className="mt-3 text-[17px] leading-[26px] text-[#555D6E]">{reward.description}</Text>

              <Text className="mb-3 mt-5 text-[12px] font-semibold tracking-[0.8px] text-[#747B8B]">HOW AGENTS EARN THIS</Text>
              {reward.howAgentsEarn.map((item, index, list) => (
                <View key={item.title} className={`flex-row py-3 ${index < list.length - 1 ? 'border-b border-[#E9EBF0]' : ''}`}>
                  <CheckCircle2 color="#0B9A5E" size={22} />
                  <View className="ml-3 flex-1">
                    <Text className="text-[17px] text-ink">{item.title}</Text>
                    <Text className="mt-0.5 text-[14px] text-muted">{item.detail}</Text>
                  </View>
                </View>
              ))}
              <Text className="mt-4 text-center text-[13px] text-muted">Redeeming needs a verified agency account</Text>
            </View>
          </>
        )}
      </QueryView>
    </CheckoutScreen>
  );
}
