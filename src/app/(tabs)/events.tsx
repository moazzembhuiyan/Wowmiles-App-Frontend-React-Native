import { useState } from 'react';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ScrollView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { EmptyState, QueryView } from '@/components/states';
import { EventCard } from '@/components/hub/event-card';
import { Chip, HubHero } from '@/components/hub/hub-ui';
import {
  EVENT_TYPE_LABEL,
  fetchEvents,
  fetchEventsSummary,
  type EventType,
  type EventWhen,
} from '@/lib/api/events';

type Tab = 'upcoming' | 'mine' | 'past';
const TYPES: EventType[] = ['trade_fair', 'workshop', 'webinar'];

export default function EventsScreen() {
  const [tab, setTab] = useState<Tab>('upcoming');
  const [type, setType] = useState<EventType | null>(null);
  const when: EventWhen = tab === 'past' ? 'past' : 'upcoming';

  const summary = useQuery({ queryKey: ['events', 'summary'], queryFn: fetchEventsSummary });
  const events = useQuery({
    queryKey: ['events', 'list', when, type],
    queryFn: () => fetchEvents({ when, type: type ?? undefined }),
  });

  function selectTab(next: Tab) {
    if (next === 'mine') {
      router.push('/event/mine');
      return;
    }
    setTab(next);
  }

  return (
    <View className="w-full max-w-[440px] flex-1 self-center bg-canvas">
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
      >
        <HubHero title="Events">
          <View className="mt-3 rounded-[16px] border border-white/20 bg-white/15 px-4 py-3">
            <Text className="text-[11px] font-semibold tracking-[0.6px] text-[#D8DAF2]">MILES EARNED AT EVENTS</Text>
            <Text className="mt-1 text-[26px] font-bold text-white">
              {summary.data ? `${summary.data.milesEarnedAtEvents.toLocaleString('en-US')} miles` : '—'}
            </Text>
            <Text className="mt-0.5 text-[13px] text-[#D8DAF2]">
              {summary.data
                ? `${summary.data.eventsAttended} events attended · ${summary.data.upcomingCount} upcoming`
                : 'Loading…'}
            </Text>
          </View>
        </HubHero>

        <View className="mb-3 flex-row">
          {(
            [
              ['upcoming', 'Upcoming'],
              ['mine', 'My events'],
              ['past', 'Past'],
            ] as const
          ).map(([key, label]) => (
            <Chip key={key} label={label} selected={tab === key} onPress={() => selectTab(key)} />
          ))}
        </View>

        <View className="mb-1 flex-row flex-wrap">
          <Chip label="All" selected={type === null} onPress={() => setType(null)} />
          {TYPES.map((item) => (
            <Chip
              key={item}
              label={EVENT_TYPE_LABEL[item]}
              selected={type === item}
              onPress={() => setType(type === item ? null : item)}
            />
          ))}
        </View>

        <QueryView
          query={events}
          loadingLabel="Loading events…"
          empty={
            <EmptyState
              title={tab === 'past' ? 'No past events' : 'No upcoming events'}
              description="New trade fairs, workshops and webinars will appear here."
            />
          }
        >
          {(list) => (
            <>
              {list.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </>
          )}
        </QueryView>
      </ScrollView>
    </View>
  );
}
