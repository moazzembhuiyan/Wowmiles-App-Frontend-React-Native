import { useMemo, useState } from 'react';
import { Award, BookOpen, CalendarDays, Clock3, Gift, Hotel, SlidersHorizontal, X } from 'lucide-react-native';
import { Modal, Pressable, Text, View } from 'react-native';
import { MilesActivity, MilesActivityType, formatMiles, milesActivities } from '@/components/miles-data';
import { DataRow, MilesHeader, MilesScreen, Pill } from '@/components/miles-ui';

type HistoryTab = 'All' | 'Earned' | 'Redeemed' | 'Expired';
type DateRange = 'Last 30 days' | 'Last 3 months' | 'This year' | 'All time';
type ActivityFilter = Exclude<MilesActivityType, 'Expired'>;

const activityFilters: ActivityFilter[] = ['Booking', 'Academy', 'Event', 'Redemption'];

const iconFor = (activity: MilesActivity) => {
  const color = activity.miles < 0 ? '#B63D45' : '#4145B6';
  switch (activity.type) {
    case 'Booking':
      return <Hotel color={color} size={18} />;
    case 'Academy':
      return <BookOpen color={color} size={18} />;
    case 'Event':
      return <CalendarDays color={color} size={18} />;
    case 'Redemption':
      return <Gift color={color} size={18} />;
    case 'Expired':
      return <Clock3 color={color} size={18} />;
  }
};

export default function MilesHistoryScreen() {
  const [tab, setTab] = useState<HistoryTab>('All');
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>('Last 3 months');
  const [draftDateRange, setDraftDateRange] = useState<DateRange>('Last 3 months');
  const [selectedTypes, setSelectedTypes] = useState<ActivityFilter[]>(activityFilters);
  const [draftTypes, setDraftTypes] = useState<ActivityFilter[]>(activityFilters);

  const filteredActivities = useMemo(() => {
    return milesActivities.filter((activity) => {
      const matchesTab =
        tab === 'All' ||
        (tab === 'Earned' && activity.miles > 0) ||
        (tab === 'Redeemed' && activity.type === 'Redemption') ||
        (tab === 'Expired' && activity.type === 'Expired');
      const matchesType =
        activity.type === 'Expired' ? tab === 'All' || tab === 'Expired' : selectedTypes.includes(activity.type);
      const matchesDate = dateRange !== 'Last 30 days' || activity.month === 'OCTOBER 2026';
      return matchesTab && matchesType && matchesDate;
    });
  }, [dateRange, selectedTypes, tab]);

  function openFilters() {
    setDraftDateRange(dateRange);
    setDraftTypes(selectedTypes);
    setFilterOpen(true);
  }

  function toggleDraftType(type: ActivityFilter) {
    setDraftTypes((types) =>
      types.includes(type) ? types.filter((item) => item !== type) : [...types, type],
    );
  }

  return (
    <MilesScreen>
      <MilesHeader title="Miles history" />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Filter history"
        onPress={openFilters}
        className="absolute right-5 top-5 z-10 h-10 w-10 items-center justify-center rounded-full bg-white"
      >
        <SlidersHorizontal color="#394052" size={19} />
      </Pressable>

      <View className="mb-4 flex-row">
        {(['All', 'Earned', 'Redeemed', 'Expired'] as const).map((item) => (
          <Pill key={item} label={item} selected={tab === item} onPress={() => setTab(item)} />
        ))}
      </View>

      {filteredActivities.length ? (
        <View>
          {(['OCTOBER 2026', 'SEPTEMBER 2026'] as const).map((month) => {
            const monthActivities = filteredActivities.filter((activity) => activity.month === month);
            if (!monthActivities.length) return null;
            return (
              <View key={month} className="mb-4">
                <Text className="mb-2 text-[10px] font-medium tracking-[0.4px] text-muted">{month}</Text>
                <View className="rounded-[16px] bg-white px-3.5">
                  {monthActivities.map((activity, index) => (
                    <DataRow
                      key={activity.id}
                      title={activity.title}
                      detail={activity.detail}
                      value={`${activity.miles > 0 ? '+' : '−'}${formatMiles(activity.miles)}`}
                      icon={iconFor(activity)}
                      last={index === monthActivities.length - 1}
                    />
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View className="mt-6 items-center rounded-[16px] bg-white px-6 py-10">
          <Award color="#4145B6" size={28} />
          <Text className="mt-3 text-[15px] font-semibold text-ink">No activity found</Text>
          <Text className="mt-1 text-center text-[12px] leading-[18px] text-muted">
            Try another history filter to see your miles activity.
          </Text>
        </View>
      )}

      <Modal
        visible={filterOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/35">
          <Pressable
            accessibilityLabel="Close filter history"
            onPress={() => setFilterOpen(false)}
            className="flex-1"
          />
          <View className="rounded-t-[24px] bg-white px-5 pb-8 pt-3">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-[17px] font-semibold text-ink">Filter history</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close filters"
                onPress={() => setFilterOpen(false)}
                hitSlop={8}
              >
                <X color="#697181" size={20} />
              </Pressable>
            </View>

            <Text className="mb-2 text-[10px] font-semibold tracking-[0.5px] text-muted">DATE RANGE</Text>
            {(['Last 30 days', 'Last 3 months', 'This year', 'All time'] as const).map((item) => (
              <Pressable
                key={item}
                accessibilityRole="radio"
                accessibilityState={{ checked: draftDateRange === item }}
                onPress={() => setDraftDateRange(item)}
                className="min-h-9 flex-row items-center"
              >
                <View className={`mr-2.5 h-[17px] w-[17px] items-center justify-center rounded-full border ${draftDateRange === item ? 'border-brand' : 'border-[#C9CED8]'}`}>
                  {draftDateRange === item ? <View className="h-2 w-2 rounded-full bg-brand" /> : null}
                </View>
                <Text className="text-[13px] text-ink">{item}</Text>
              </Pressable>
            ))}

            <Text className="mb-2 mt-4 text-[10px] font-semibold tracking-[0.5px] text-muted">ACTIVITY TYPE</Text>
            {activityFilters.map((type) => (
              <Pressable
                key={type}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: draftTypes.includes(type) }}
                onPress={() => toggleDraftType(type)}
                className="min-h-9 flex-row items-center"
              >
                <View className={`mr-2.5 h-[17px] w-[17px] items-center justify-center rounded-[4px] border ${draftTypes.includes(type) ? 'border-brand bg-brand' : 'border-[#C9CED8] bg-white'}`}>
                  {draftTypes.includes(type) ? <Text className="text-[11px] font-bold text-white">✓</Text> : null}
                </View>
                <Text className="text-[13px] text-ink">{type === 'Event' ? 'Events' : type === 'Redemption' ? 'Redemptions' : `${type}s`}</Text>
              </Pressable>
            ))}

            <View className="mt-5 flex-row">
              <Pressable
                onPress={() => {
                  setDraftDateRange('Last 3 months');
                  setDraftTypes(activityFilters);
                  setDateRange('Last 3 months');
                  setSelectedTypes(activityFilters);
                }}
                className="mr-2.5 h-[48px] flex-1 items-center justify-center rounded-[10px] border border-line bg-white"
              >
                <Text className="text-[13px] font-semibold text-ink">Reset</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setDateRange(draftDateRange);
                  setSelectedTypes(draftTypes);
                  setFilterOpen(false);
                }}
                className="h-[48px] flex-1 items-center justify-center rounded-[10px] bg-brand"
              >
                <Text className="text-[13px] font-semibold text-white">Apply filters</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </MilesScreen>
  );
}
