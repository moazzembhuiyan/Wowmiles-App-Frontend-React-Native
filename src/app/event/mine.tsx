import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Text, View } from 'react-native';
import { MilesScreen } from '@/components/miles-ui';
import { EmptyState, QueryView } from '@/components/states';
import { EventCard } from '@/components/hub/event-card';
import { Card, Chip, HubHero, goBack } from '@/components/hub/hub-ui';
import { fetchEventsSummary, fetchMyEvents, type EventWhen } from '@/lib/api/events';

export default function MyEventsScreen() {
  const [when, setWhen] = useState<EventWhen>('upcoming');
  const summary = useQuery({ queryKey: ['events', 'summary'], queryFn: fetchEventsSummary });
  const events = useQuery({ queryKey: ['events', 'mine', when], queryFn: () => fetchMyEvents(when) });

  return (
    <MilesScreen fullBleedTop>
      <HubHero
        title="My events"
        subtitle={
          summary.data ? `${summary.data.upcomingCount} upcoming · ${summary.data.eventsAttended} attended` : undefined
        }
        onBack={() => goBack('/(tabs)/events')}
      />
      {summary.data ? (
        <Card className="mb-4 px-4 py-3">
          <Text className="text-[11px] font-semibold tracking-[0.6px] text-muted">EARNED FROM EVENTS</Text>
          <Text className="mt-1 text-[20px] font-bold text-ink">
            {summary.data.milesEarnedAtEvents.toLocaleString('en-US')} miles across {summary.data.eventsAttended} events
          </Text>
        </Card>
      ) : null}
      <View className="mb-2 flex-row">
        <Chip label="Upcoming" selected={when === 'upcoming'} onPress={() => setWhen('upcoming')} />
        <Chip label="Past" selected={when === 'past'} onPress={() => setWhen('past')} />
      </View>
      <QueryView
        query={events}
        empty={
          <EmptyState
            title={when === 'past' ? 'No past events yet' : 'No upcoming registrations'}
            description="Register for an event and your ticket will show up here."
          />
        }
      >
        {(list) => list.map((event) => <EventCard key={event.id} event={event} showTicket />)}
      </QueryView>
    </MilesScreen>
  );
}
