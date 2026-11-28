import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Award, Hotel, BookOpen, Gift, CalendarDays, SlidersHorizontal } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState, QueryView } from '@/components/states';
import { formatMiles, formatSignedMiles, getMilesActivity, groupByMonth, type MilesActivity } from '@/lib/api/miles';
import { getWallet } from '@/lib/api/wallet';
import { DataRow, MilesScreen, Pill } from '@/components/miles-ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type MilesTab = 'All' | 'Earned' | 'Redeemed';

function activityIcon(activity: MilesActivity) {
  const color = activity.miles < 0 ? '#B63D45' : '#4145B6';
  switch (activity.type) {
    case 'Booking': return <Hotel color={color} size={19} />;
    case 'Academy': return <BookOpen color={color} size={19} />;
    case 'Event': return <CalendarDays color={color} size={19} />;
    case 'Redemption': return <Gift color={color} size={19} />;
    case 'Other': return <Award color={color} size={19} />;
  }
}

export default function MilesScreenRoute() {
  const [tab, setTab] = useState<MilesTab>('All');
  const wallet = useQuery({ queryKey: ['wallet'], queryFn: getWallet });
  const type = tab === 'Earned' ? 'earned' : tab === 'Redeemed' ? 'redeemed' : 'all';
  const activity = useQuery({ queryKey: ['miles-activity', { type, limit: 20 }], queryFn: () => getMilesActivity({ type, limit: 20 }) });
    const insets = useSafeAreaInsets();

  return (
    <MilesScreen fullBleedTop>
      <View className="-mx-5 overflow-hidden">
        <View className="relative overflow-hidden px-5 pb-5 pt-1"  style={{ minHeight: 238 + insets.top, paddingTop: insets.top + 8 }}>
          <LinearGradient
            colors={['#11184F', '#29368F', '#454DC2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View pointerEvents="none" className="absolute -right-7 -top-14 h-52 w-52 rounded-full border border-white/10" />
          <View className="mb-3 mt-2 flex-row items-center">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => router.back()}
              className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-white/15"
            >
              <ArrowLeft color="white" size={19} />
            </Pressable>
            <Text className="text-[20px] font-semibold text-white">Miles</Text>
          </View>
          <Text className="mt-1 text-[12px] font-medium tracking-[0.8px] text-[#D8DAF2]">
            AVAILABLE BALANCE
          </Text>
          <View className="mt-1 flex-row items-baseline">
            <Text className="text-[46px] font-light leading-[52px] tracking-[-1.5px] text-white">
              {formatMiles(wallet.data?.available ?? 0)}
            </Text>
            <Text className="ml-2 text-[13px] text-[#D8DAF2]">miles</Text>
          </View>
          <Pressable
            accessibilityRole="link"
            onPress={() => router.push('/wallet')}
            className="mt-2 self-start"
          >
            <Text className="text-[13px] font-semibold text-[#FFB91F]">Balance breakdown  ›</Text>
          </Pressable>
          <View className="mt-3 flex-row">
            <View className="mr-2 flex-1 items-center rounded-[12px] bg-white/20 py-2.5">
              <Text className="text-[18px] font-semibold text-white">{formatMiles(wallet.data?.lifetimeEarned ?? 0)}</Text>
              <Text className="mt-0.5 text-[12px] text-[#E0E3F7]">Lifetime earned</Text>
            </View>
            <View className="flex-1 items-center rounded-[12px] bg-white/20 py-2.5">
              <Text className="text-[18px] font-semibold text-white">{formatMiles(wallet.data?.lifetimeRedeemed ?? 0)}</Text>
              <Text className="mt-0.5 text-[12px] text-[#E0E3F7]">Redeemed</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="mb-3 mt-4 flex-row items-center">
        {(['All', 'Earned', 'Redeemed'] as const).map((item) => (
          <Pill key={item} label={item} selected={tab === item} onPress={() => setTab(item)} />
        ))}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Filter miles history"
          onPress={() => router.push('/history')}
          className="ml-auto h-10 w-10 items-center justify-center rounded-full bg-white"
        >
          <SlidersHorizontal color="#394052" size={19} />
        </Pressable>
      </View>

      <QueryView
        query={activity}
        isEmpty={(items) => items.length === 0}
        empty={<EmptyState title="No activity found" description="Your miles activity will appear here." />}
      >
        {(items) =>
          groupByMonth(items).map(([month, monthActivities]) => (
            <View key={month} className="mb-4">
              <Text className="mb-1.5 text-[12px] font-medium tracking-[0.6px] text-[#747B8B]">
                {month}
              </Text>
              {monthActivities.map((item, index) => (
                <DataRow
                  key={item.id}
                  title={item.title}
                  detail={item.detail}
                  value={formatSignedMiles(item.miles)}
                  icon={activityIcon(item)}
                  onPress={() => item.type === 'Redemption' && router.push('/redemption-history')}
                  last={index === monthActivities.length - 1}
                />
              ))}
            </View>
          ))
        }
      </QueryView>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/history')}
        className="mb-8 mt-1 h-[50px] items-center justify-center rounded-full bg-[#4049B5]"
      >
        <Text className="text-[15px] font-semibold text-white">View full history</Text>
      </Pressable>
    </MilesScreen>
  );
}
