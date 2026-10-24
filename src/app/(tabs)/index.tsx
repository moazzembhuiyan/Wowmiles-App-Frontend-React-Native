import { router } from 'expo-router';
import {
  Award,
  Bell,
  BookOpen,
  ChevronRight,
  Gift,
  Hotel,
  TicketCheck,
} from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const activities = [
  { title: 'Hilton Dubai — 4 nights', detail: 'Approved 12 Oct', miles: '+1,250' },
  { title: 'Emirates Academy module 3', detail: 'Quiz passed 10 Oct', miles: '+500' },
  { title: 'WTM London 2026', detail: 'Attendance confirmed', miles: '+350' },
];

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
      onPress={onPress}
      className="mr-2.5 min-h-[94px] flex-1 rounded-[14px] border border-[#EEF0F5] bg-white p-3 active:opacity-80"
    >
      <View className="mb-2 h-8 w-8 items-center justify-center rounded-[9px] bg-[#F0F1FB]">
        {icon}
      </View>
      <Text className="text-[12px] font-semibold leading-[16px] text-ink">{label}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  return (
    <SafeAreaView edges={['top']} className="w-full max-w-[440px] flex-1 self-center bg-canvas">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-6 pt-2"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-5 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#E9EAF8]">
              <Text className="text-[13px] font-semibold text-brand">PR</Text>
            </View>
            <View>
              <Text className="text-[12px] text-muted">Good morning</Text>
              <Text className="mt-0.5 text-[16px] font-semibold text-ink">John Newman</Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            onPress={() => router.push('/notifications')}
            className="h-10 w-10 items-center justify-center rounded-full bg-white"
          >
            <Bell color="#394052" size={20} strokeWidth={1.8} />
            <View className="absolute right-[9px] top-[8px] h-2 w-2 rounded-full border border-white bg-[#D94B4B]" />
          </Pressable>
        </View>

        <View className="mb-4 overflow-hidden rounded-[18px] bg-navy px-4 pb-4 pt-4">
          <View className="flex-row items-center justify-between">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View WowMiles balance and activity"
              onPress={() => router.push('/miles')}
              hitSlop={8}
            >
              <Text className="text-[11px] font-medium text-[#D8DAF2]">WowMiles balance</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View Gold loyalty status"
              onPress={() => router.push('/loyalty')}
              className="flex-row items-center rounded-full bg-[#FFF5DC] px-2.5 py-1"
            >
              <Award color="#B68720" size={12} strokeWidth={2.4} />
              <Text className="ml-1 text-[10px] font-semibold text-[#946A13]">Gold</Text>
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View WowMiles balance and activity"
            onPress={() => router.push('/miles')}
          >
            <View className="mt-3 flex-row items-baseline">
              <Text className="text-[37px] font-bold tracking-[-1.5px] text-white">48,500</Text>
              <Text className="ml-2 text-[13px] text-[#D8DAF2]">miles</Text>
            </View>
            <View className="mt-2 h-[6px] overflow-hidden rounded-full bg-[#555B9A]">
              <View className="h-full w-[34%] rounded-full bg-[#F4B52E]" />
            </View>
            <Text className="mt-2.5 text-[11px] text-[#D8DAF2]">
              31,500 miles to Platinum Ambassador
            </Text>
          </Pressable>
        </View>

        <View className="mb-4 flex-row">
          <QuickAction
            icon={<TicketCheck color="#4145B6" size={18} />}
            label="Register booking"
            onPress={() => router.push('/(tabs)/bookings')}
          />
          <QuickAction
            icon={<Gift color="#4145B6" size={18} />}
            label="Redeem rewards"
            onPress={() => router.push('/history')}
          />
          <QuickAction
            icon={<BookOpen color="#4145B6" size={18} />}
            label="Continue training"
            onPress={() => router.push('/(tabs)/academy')}
          />
        </View>

        <Pressable
          onPress={() => router.push('/history')}
          className="mb-5 min-h-[66px] flex-row items-center rounded-[13px] border border-[#F1E4C7] bg-[#FFF9ED] px-3.5 py-2.5"
        >
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#F9E8BE]">
            <Gift color="#B9851C" size={19} />
          </View>
          <View className="flex-1">
            <Text className="text-[13px] font-semibold text-ink">Double miles on hotels</Text>
            <Text className="mt-0.5 text-[11px] text-muted">Ends 31 Oct · 6 days left</Text>
          </View>
          <ChevronRight color="#848A97" size={19} />
        </Pressable>

        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-[15px] font-semibold text-ink">Recent activity</Text>
          <Pressable onPress={() => router.push('/history')}>
            <Text className="text-[12px] font-medium text-brand">See all</Text>
          </Pressable>
        </View>

        <View className="overflow-hidden rounded-[15px] bg-white px-3.5">
          {activities.map((activity, index) => (
            <Pressable
              key={activity.title}
              accessibilityRole="button"
              accessibilityLabel={`${activity.title}, ${activity.miles} miles. View miles history`}
              onPress={() => router.push('/history')}
              className={`flex-row items-center py-3 ${index < activities.length - 1 ? 'border-b border-[#F0F1F5]' : ''}`}
            >
              <View className="mr-3 h-9 w-9 items-center justify-center rounded-[11px] bg-[#F1F1FB]">
                {index === 0 ? (
                  <Hotel color="#4145B6" size={17} />
                ) : index === 1 ? (
                  <BookOpen color="#4145B6" size={17} />
                ) : (
                  <Award color="#4145B6" size={17} />
                )}
              </View>
              <View className="flex-1">
                <Text numberOfLines={1} className="text-[13px] font-medium text-ink">
                  {activity.title}
                </Text>
                <Text className="mt-1 text-[10px] text-muted">{activity.detail}</Text>
              </View>
              <Text className="ml-2 text-[12px] font-semibold text-[#9B711F]">{activity.miles}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
