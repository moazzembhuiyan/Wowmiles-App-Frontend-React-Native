import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Award, BookOpen, BriefcaseBusiness, CalendarDays, Clock3, Info, Megaphone } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { miles } from '@/components/money-ui';
import type { AgentStatus, StatusSource } from '@/lib/api/status';

const sourceCopy: Record<StatusSource['sourceType'], { title: string; detail: (count: number) => string }> = {
  booking: { title: 'Confirmed bookings', detail: (n) => `${n} bookings verified by suppliers` },
  course: { title: 'Academy', detail: (n) => `${n} courses and webinars completed` },
  event: { title: 'Events', detail: (n) => `${n} attendances validated` },
  campaign: { title: 'Campaigns', detail: (n) => `${n} campaign bonuses` },
};

function SourceIcon({ type }: { type: StatusSource['sourceType'] }) {
  const props = { color: '#4145B6', size: 18 };
  if (type === 'booking') return <BriefcaseBusiness {...props} />;
  if (type === 'course') return <BookOpen {...props} />;
  if (type === 'event') return <CalendarDays {...props} />;
  return <Megaphone {...props} />;
}

/** Full-bleed gradient header of the status screens: tier pill, points, ladder track. */
export function StatusHero({ status, subtitle, onBack }: { status: AgentStatus; subtitle?: string; onBack?: () => void }) {
  const insets = useSafeAreaInsets();
  const track = Math.min(100, Math.max(0, (status.points / 8000) * 100));
  return (
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
          onPress={onBack ?? (() => router.back())}
          className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white/15"
          hitSlop={8}
        >
          <ArrowLeft color="white" size={20} />
        </Pressable>
        <Text className="text-[16px] font-medium text-[#E0E3F7]">Status points</Text>
      </View>
      <View className="flex-row items-center self-start rounded-full bg-[#FFB91F] px-3 py-1.5">
        <Award color="#24284E" size={13} />
        <Text className="ml-1.5 text-[11px] font-bold tracking-[0.4px] text-[#24284E]">
          {status.tierName.toUpperCase()} MEMBER
        </Text>
      </View>
      <View className="mt-3 flex-row items-baseline">
        <Text className="text-[44px] font-bold leading-[50px] tracking-[-1px] text-white">{miles(status.points)}</Text>
        <Text className="ml-2 text-[14px] text-[#D8DAF2]">points</Text>
      </View>
      <Text className="mt-1 text-[14px] text-[#D8DAF2]">
        {subtitle ?? (status.nextTier ? `${miles(status.pointsToNext)} more for ${status.nextTier.name.split(' ')[0]}` : 'Top tier reached')}
      </Text>
      <View className="mt-6">
        <View className="h-[4px] justify-center rounded-full bg-white/20">
          <View className="h-full rounded-full bg-[#FFB91F]" style={{ width: `${track}%` }} />
          <View
            className="absolute h-7 w-7 items-center justify-center rounded-full border-[3px] border-white/35 bg-[#FFB91F]"
            style={{ left: `${track}%`, marginLeft: -14 }}
          />
        </View>
        <View className="mt-3 flex-row justify-between">
          <Text className="text-[12px] text-[#E0E3F7]">Silver · 0</Text>
          <Text className="text-[12px] text-[#E0E3F7]">Gold · 3,000</Text>
          <Text className="text-[12px] text-[#9EA6D0]">Platinum · 8,000</Text>
        </View>
      </View>
    </View>
  );
}

export function InfoNote({ children }: { children: string }) {
  return (
    <View className="mb-5 flex-row rounded-[14px] bg-[#ECEEFB] p-4">
      <Info color="#4145B6" size={17} />
      <Text className="ml-3 flex-1 text-[14px] leading-[21px] text-brand">{children}</Text>
    </View>
  );
}

export function PointsBySource({ status }: { status: AgentStatus }) {
  return (
    <>
      <Text className="mb-2 text-[12px] font-semibold tracking-[0.8px] text-[#747B8B]">WHERE YOUR POINTS CAME FROM</Text>
      <View className="mb-5 rounded-[18px] border border-line bg-white px-4">
        {status.breakdown.map((row, index) => (
          <View
            key={row.sourceType}
            className={`flex-row items-center py-3.5 ${index < status.breakdown.length - 1 ? 'border-b border-[#EEF0F4]' : ''}`}
          >
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-[12px] bg-[#F1F1FB]">
              <SourceIcon type={row.sourceType} />
            </View>
            <View className="flex-1 pr-2">
              <Text className="text-[16px] font-medium text-ink">{sourceCopy[row.sourceType].title}</Text>
              <Text className="mt-0.5 text-[13px] text-muted">{sourceCopy[row.sourceType].detail(row.count)}</Text>
            </View>
            <Text className="text-[16px] font-semibold text-ink">{miles(row.points)}</Text>
          </View>
        ))}
      </View>
    </>
  );
}

export function NotCounted({ status }: { status: AgentStatus }) {
  if (status.notCounted.count <= 0) return null;
  return (
    <>
      <Text className="mb-2 text-[12px] font-semibold tracking-[0.8px] text-[#747B8B]">NOT COUNTED YET</Text>
      <View className="mb-6 flex-row items-center rounded-[18px] border border-line bg-white p-4">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-[12px] bg-[#FFF5DF]">
          <Clock3 color="#D9730D" size={18} />
        </View>
        <View className="flex-1 pr-2">
          <Text className="text-[16px] font-medium text-[#555D6E]">Awaiting supplier confirmation</Text>
          <Text className="mt-0.5 text-[13px] text-muted">
            {`${status.notCounted.count} bookings · worth ${miles(status.notCounted.points)} points once verified`}
          </Text>
        </View>
        <Text className="text-[16px] font-semibold text-[#555D6E]">{miles(status.notCounted.points)}</Text>
      </View>
    </>
  );
}
