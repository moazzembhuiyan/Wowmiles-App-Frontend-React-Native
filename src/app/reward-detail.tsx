import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, CheckCircle2, LockKeyhole } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { getReward } from '@/components/rewards-data';

export default function RewardDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const reward = getReward(id);
  const isLocked = 'locked' in reward && reward.locked;
  const cost = reward.cost.toLocaleString('en-US');
  const balanceAfter = Math.max(0, 48500 - reward.cost).toLocaleString('en-US');
  const Icon = reward.Icon;

  function redeem() {
    if (isLocked) {
      router.push('/tier-benefits');
      return;
    }
    router.push({ pathname: '/redeem-confirmation', params: { id: reward.id } });
  }

  return (
    <View className="flex-1 bg-[#F8F9FB]">
      <View
        pointerEvents="none"
        className="absolute left-0 right-0 top-0 bg-[#11184F]"
        style={{ height: insets.top }}
      />
      <SafeAreaView
        edges={['bottom']}
        className="w-full max-w-[440px] flex-1 self-center bg-transparent"
      >
        <StatusBar style="light" />
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 8, backgroundColor: '#F8F9FB' }}
          showsVerticalScrollIndicator={false}
        >
          <View
            className="relative overflow-hidden px-5"
            style={{ height: insets.top + 375, paddingTop: insets.top + 12 }}
          >
            <LinearGradient
              colors={['#11184F', '#29368F', '#6878D9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View
              pointerEvents="none"
              className="absolute -right-7 -top-14 h-64 w-64 rounded-full border border-white/10"
            />
            <View
              pointerEvents="none"
              className="absolute -right-2 -top-2 h-48 w-48 rounded-full border border-white/10"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => {
                if (router.canGoBack()) router.back();
                else router.replace('/rewards');
              }}
              className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
              hitSlop={8}
            >
              <ArrowLeft color="white" size={20} />
            </Pressable>
            <View
              className="absolute left-0 right-0 items-center"
              style={{ top: insets.top + 120 }}
            >
              <View className="h-[82px] w-[82px] items-center justify-center rounded-full border border-white/20 bg-white/5">
                <Icon color="white" size={54} strokeWidth={1} />
              </View>
            </View>
          </View>

          <View className="-mt-5 flex-1 rounded-t-[24px] bg-[#F8F9FB] px-5 pb-5 pt-5">
            <View className="self-start rounded-full bg-[#ECEEFF] px-3 py-1">
              <Text className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#4145B6]">
                {reward.category}
              </Text>
            </View>
            <Text className="mt-3 text-[23px] font-bold leading-[28px] text-[#202638]">
              {reward.title}
            </Text>
            <View className="mt-1 flex-row items-baseline">
              <Text className="text-[30px] font-bold leading-[36px] text-[#A85F05]">{cost}</Text>
              <Text className="ml-2 text-[13px] text-[#747B8B]">miles</Text>
            </View>
            <Text className="mt-2 text-[13px] leading-[19px] text-[#626A79]">
              {reward.description}
            </Text>

            <View className="mt-3">
              {reward.benefits.map((benefit, index) => (
                <View
                  key={benefit}
                  className={`min-h-[42px] flex-row items-center ${
                    index < reward.benefits.length - 1 ? 'border-b border-[#E6E8ED]' : ''
                  }`}
                >
                  <CheckCircle2 color="#0DAD78" size={16} strokeWidth={2} />
                  <Text className="ml-2.5 flex-1 text-[12px] leading-[17px] text-[#626A79]">
                    {benefit}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        <View className="bg-white px-4 pb-2 pt-2">
          <View className="min-h-[62px] flex-row items-center rounded-full bg-[#5D5F61] p-1.5 pl-4">
            <View className="flex-1 pr-2">
              <Text className="text-[10px] text-[#D4D5D6]">
                {isLocked ? 'Unlock at Platinum' : 'Balance after'}
              </Text>
              <Text className="mt-0.5 text-[13px] font-medium text-white">
                {isLocked ? 'Platinum member reward' : `${balanceAfter} miles`}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={redeem}
              className="min-h-[48px] min-w-[106px] flex-row items-center justify-center rounded-full bg-[#FFB91F] px-4"
            >
              {isLocked ? <LockKeyhole color="#171A28" size={14} /> : null}
              <Text className="ml-1 text-[14px] font-semibold text-[#171A28]">
                {isLocked ? 'Unlock' : 'Redeem'}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
