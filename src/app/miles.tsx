import { router } from 'expo-router';
import { Award, BookOpen, CalendarDays, Hotel, TriangleAlert } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { DataRow, MilesHeader, MilesScreen, SectionTitle } from '@/components/miles-ui';

const sources = [
  { title: 'Bookings', detail: '24 approved bookings', value: '38,400', Icon: Hotel, route: '/(tabs)/bookings' as const },
  { title: 'Academy', detail: '11 modules · 9 quizzes passed', value: '6,200', Icon: BookOpen, route: '/(tabs)/academy' as const },
  { title: 'Events', detail: '3 trade fairs attended', value: '3,650', Icon: CalendarDays, route: '/(tabs)/events' as const },
];

export default function MilesScreenRoute() {
  return (
    <MilesScreen>
      <MilesHeader title="WowMiles balance" />

      <View className="mb-5 rounded-[20px] bg-navy px-5 pb-5 pt-5">
        <View className="flex-row items-center justify-between">
          <Text className="text-[11px] font-medium text-[#D8DAF2]">AVAILABLE BALANCE</Text>
          <View className="rounded-full bg-[#FFF5DC] px-3 py-1">
            <Text className="text-[11px] font-semibold text-[#946A13]">Gold</Text>
          </View>
        </View>
        <View className="mt-3 flex-row items-baseline">
          <Text className="text-[38px] font-bold tracking-[-1.5px] text-white">48,500</Text>
          <Text className="ml-2 text-[13px] text-[#D8DAF2]">miles</Text>
        </View>
        <View className="my-4 h-px bg-[#555B9A]" />
        <View className="flex-row">
          <View className="flex-1">
            <Text className="text-[18px] font-semibold text-white">62,400</Text>
            <Text className="mt-1 text-[11px] text-[#D8DAF2]">Lifetime earned</Text>
          </View>
          <View className="flex-1">
            <Text className="text-[18px] font-semibold text-white">13,900</Text>
            <Text className="mt-1 text-[11px] text-[#D8DAF2]">Redeemed</Text>
          </View>
          <View className="flex-1">
            <Text className="text-[18px] font-semibold text-white">2,400</Text>
            <Text className="mt-1 text-[11px] text-[#D8DAF2]">Expiring soon</Text>
          </View>
        </View>
      </View>

      <SectionTitle title="How you earned" />
      <View className="mb-5 rounded-[16px] bg-white px-3.5">
        {sources.map(({ title, detail, value, Icon, route }, index) => (
          <DataRow
            key={title}
            title={title}
            detail={detail}
            value={value}
            icon={<Icon color="#4145B6" size={19} />}
            onPress={() => router.navigate(route)}
            last={index === sources.length - 1}
          />
        ))}
      </View>

      <Pressable
        onPress={() => router.push('/history')}
        className="mb-4 rounded-[14px] border border-[#F1E4C7] bg-[#FFF9ED] p-4"
      >
        <View className="flex-row items-center">
          <TriangleAlert color="#B9851C" size={20} />
          <Text className="ml-2 flex-1 text-[14px] font-semibold text-[#946A13]">
            2,400 miles expire 31 Dec 2026
          </Text>
        </View>
        <Text className="mt-2 text-[12px] leading-[18px] text-muted">
          Miles expire 24 months after they are earned.
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/history')}
        className="mb-3 h-[52px] items-center justify-center rounded-[11px] bg-brand active:opacity-80"
      >
        <Text className="text-[14px] font-semibold text-white">View full history</Text>
      </Pressable>

      <View className="mb-4 flex-row items-center justify-center">
        <Award color="#B68720" size={15} />
        <Text className="ml-1.5 text-[11px] text-muted">Your Gold tier gives you more ways to earn.</Text>
      </View>
    </MilesScreen>
  );
}
