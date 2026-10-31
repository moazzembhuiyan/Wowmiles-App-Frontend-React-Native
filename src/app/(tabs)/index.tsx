import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Award,
  Bell,
  BookOpen,
  Building2,
  ChevronRight,
  Gift,
  Plus,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { formatMiles, milesActivities } from '@/components/miles-data';

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="mr-2 flex-1 items-center justify-center rounded-[13px] border border-white/20 bg-white/20 py-3 active:opacity-80"
    >
      <View className="mb-1.5 h-7 w-7 items-center justify-center rounded-full bg-white/20">
        {icon}
      </View>
      <Text className="text-[12px] font-medium text-white">{label}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  return (
    <SafeAreaView edges={['top']} className="w-full  max-w-[440px] flex-1 self-center bg-[#11184F]">
      <StatusBar style="light" />
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 80, backgroundColor: '#FFFFFF' }}
        showsVerticalScrollIndicator={false}
      >
        <View className="relative h-[400px] overflow-hidden px-5 pb-4 pt-3 !space-y-5">
          <LinearGradient
            colors={['#11184F', '#2B388D', '#444BC0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View pointerEvents="none" className="absolute -right-9 -top-12 h-52 w-52 rounded-full border border-white/10" />
          <View pointerEvents="none" className="absolute right-0 -top-6 h-36 w-36 rounded-full border border-white/10" />
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-white">
                <Text className="text-[14px] font-bold text-[#34439B]">PR</Text>
              </View>
              <View>
                <Text className="text-[16px] text-[#D4D9F0]">Good morning</Text>
                <Text className="mt-0.5 text-[14px] font-semibold text-white">Daniel Reed</Text>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={() => router.push('/notifications')}
              className="h-8 w-8 items-center justify-center rounded-full bg-white/20"
            >
              <Bell color="white" size={16} strokeWidth={1.8} />
              <View className="absolute right-[7px] top-[6px] h-1.5 w-1.5 rounded-full bg-[#FFB91F]" />
            </Pressable>
          </View>

          <Text className="my-1 text-[12px] font-medium tracking-[0.7px] text-[#D6D9EF]">
            WOWMILES BALANCE
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View WowMiles balance and activity"
            onPress={() => router.push('/miles')}
            className="flex-row items-baseline !my-3"

          >
            <Text className="text-[42px] mt-3 font-bold leading-[48px] tracking-[-1.5px] text-white">
              48,500
            </Text>
            <Text className="ml-2 text-[14px] text-[#D8DAF2]">miles</Text>
          </Pressable>
          <View className="mt-5 flex-row items-center justify-between">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View Gold loyalty status"
              onPress={() => router.push('/loyalty')}
              className="flex-row items-center rounded-full bg-[#FFB91F] px-2 py-1"
            >
              <Award color="#1B2143" size={10} strokeWidth={2.4} />
              <Text className="ml-1 text-[12px] font-bold uppercase text-[#1B2143]">Gold</Text>
            </Pressable>
            <Text className="text-[12px] text-[#D8DAF2]">31,500 to Platinum</Text>
          </View>
          <View className="mt-2 h-[2px] overflow-hidden rounded-full bg-white/20">
            <View className="h-full w-[60%] rounded-full bg-[#FFB91F]" />
          </View>
          <View className="mt-10 flex-row">
            <QuickAction
              icon={<Plus color="white" size={15} />}
              label="Register"
              onPress={() => router.push('/(tabs)/bookings')}
            />
            <QuickAction
              icon={<Gift color="white" size={15} />}
              label="Redeem"
              onPress={() => router.push('/rewards')}
            />
            <QuickAction
              icon={<BookOpen color="white" size={15} />}
              label="Learn"
              onPress={() => router.push('/(tabs)/academy')}
            />
            <QuickAction
              icon={<Building2 color="white" size={15} />}
              label="Partners"
              onPress={() => router.push('/partners')}
            />
          </View>
        </View>

        <View className="-mt-3 flex-1 bg-white px-5 pt-4 h-[700px]">
          <Pressable
            onPress={() => router.push('/rewards')}
            className="mb-4 min-h-[50px] flex-row items-center rounded-[13px] border border-[#F4E6C6] bg-[#FFF9EB] px-3 p-3"
          >
            <View className="mr-2.5 h-8 w-8 items-center justify-center rounded-full bg-[#FFB91F]">
              <Text className="text-[12px] font-bold text-[#28223A]">2×</Text>
            </View>
            <View className="flex-1">
              <Text className="text-[12px] font-medium text-[#AF8121]">LIMITED TIME</Text>
              <Text className="mt-0.5 text-[13px] font-semibold text-[#252A38]">
                Double miles on hotels
              </Text>
              <Text className="text-[12px] text-[#858A96]">6 days left · ends 31 Oct</Text>
            </View>
            <ChevronRight color="#B28B3D" size={15} />
          </Pressable>

          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-[17px] font-bold text-[#171A28]">Recent activity</Text>
            <Pressable onPress={() => router.push('/history')}>
              <Text className="text-[12px] font-medium text-[#38469C]">See all</Text>
            </Pressable>
          </View>
          <View>
            {milesActivities.slice(0, 5).map((activity, index) => {
              const value = `${activity.miles > 0 ? '+' : '−'}${formatMiles(activity.miles)}`;
              return (
                <Pressable
                  key={activity.title}
                  accessibilityRole="button"
                  accessibilityLabel={`${activity.title}, ${value} miles. View miles history`}
                  onPress={() => router.push('/history')}
                  className={`flex-row items-center py-2.5 ${index < 4 ? 'border-b border-[#EEF0F4]' : ''}`}
                >
                  <View className="flex-1">
                    <Text numberOfLines={1} className="text-[14px] font-medium text-[#242938]">
                      {activity.title}
                    </Text>
                    <Text className="mt-0.5 text-[12px] text-[#858A96]">{activity.detail}</Text>
                  </View>
                  <Text className={`ml-2 text-[13px] font-semibold ${activity.miles < 0 ? 'text-[#9B4A3F]' : 'text-[#9B711F]'}`}>
                    {value}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
