import { router } from 'expo-router';
import { CircleCheck, Globe, MapPin } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { EVENT_TYPE_LABEL, type EventItem } from '@/lib/api/events';
import { formatDateRange } from './hub-ui';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export function milesLabel(event: EventItem): string {
  const { award } = event;
  if (award.mode === 'range' && award.minMiles !== null && award.maxMiles !== null) {
    return `${award.minMiles.toLocaleString('en-US')}–${award.maxMiles.toLocaleString('en-US')} miles on check-in`;
  }
  return `${(award.fixedMiles ?? 0).toLocaleString('en-US')} miles on check-in`;
}

export function whereLabel(event: EventItem): string {
  if (event.isOnline) return 'Online';
  return event.city ? `${event.venue}, ${event.city}` : event.venue;
}

export function EventCard({ event, showTicket = false }: { event: EventItem; showTicket?: boolean }) {
  const start = new Date(event.startsAt);
  const registered = event.myRegistration?.status === 'registered';
  const attended = event.myRegistration?.status === 'attended';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={event.title}
      onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })}
      className="mb-3 rounded-[16px] border border-line bg-white p-4 active:opacity-80"
    >
      <View className="flex-row">
        <View className="mr-3 h-[54px] w-[50px] items-center justify-center rounded-[12px] bg-[#F1F1FB]">
          <Text className="text-[11px] font-semibold text-brand">{MONTHS[start.getUTCMonth()]}</Text>
          <Text className="text-[20px] font-bold leading-6 text-ink">{start.getUTCDate()}</Text>
        </View>
        <View className="flex-1">
          <View className="mb-1 flex-row flex-wrap items-center">
            <Text className="mr-2 text-[11px] font-semibold tracking-[0.4px] text-brand">
              {EVENT_TYPE_LABEL[event.type].toUpperCase()}
            </Text>
            {event.isOnline ? (
              <View className="flex-row items-center rounded-full bg-[#E8F7F0] px-2 py-0.5">
                <Globe color="#0A8E5B" size={10} />
                <Text className="ml-1 text-[10px] font-semibold text-[#0A8E5B]">ONLINE</Text>
              </View>
            ) : null}
          </View>
          <Text className="text-[16px] font-semibold leading-[21px] text-ink">{event.title}</Text>
          <View className="mt-1.5 flex-row items-center">
            <MapPin color="#7C8494" size={13} />
            <Text numberOfLines={1} className="ml-1 flex-1 text-[13px] text-muted">
              {whereLabel(event)}
            </Text>
          </View>
          <Text className="mt-0.5 text-[13px] text-muted">{formatDateRange(event.startsAt, event.endsAt)}</Text>
        </View>
      </View>
      <View className="mt-3 flex-row items-center justify-between border-t border-[#F0F1F5] pt-3">
        <Text className="flex-1 text-[12px] font-medium text-[#B9851C]">{milesLabel(event)}</Text>
        {registered || attended ? (
          <View className="flex-row items-center rounded-full bg-[#E8F7F0] px-2.5 py-1">
            <CircleCheck color="#0A8E5B" size={13} />
            <Text className="ml-1 text-[12px] font-semibold text-[#0A8E5B]">{attended ? 'Attended' : 'Registered'}</Text>
          </View>
        ) : null}
        {registered && showTicket && event.myRegistration ? (
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push({ pathname: '/event/ticket/[id]', params: { id: event.myRegistration!.id } })
            }
            hitSlop={8}
            className="ml-3"
          >
            <Text className="text-[13px] font-semibold text-brand">View ticket</Text>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}
