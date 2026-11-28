import { Alert, Linking, Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Check, Clock, DoorOpen, Gift, Globe, MapPin, Store, Users } from 'lucide-react-native';
import { MilesScreen } from '@/components/miles-ui';
import { QueryView } from '@/components/states';
import { useToast } from '@/components/toast';
import { milesLabel, whereLabel } from '@/components/hub/event-card';
import { Card, FormButton, HubHero, SectionLabel, formatDateRange, goBack } from '@/components/hub/hub-ui';
import {
  EVENT_TYPE_LABEL,
  cancelRegistration,
  fetchEvent,
  registerForEvent,
  type EventItem,
} from '@/lib/api/events';

function InfoRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View className="mb-3 flex-row items-start">
      <View className="mr-3 mt-0.5 w-5 items-center">{icon}</View>
      <Text className="flex-1 text-[14px] leading-[20px] text-ink">{text}</Text>
    </View>
  );
}

function EventBody({ event }: { event: EventItem }) {
  const showToast = useToast();
  const queryClient = useQueryClient();
  const registered = event.myRegistration?.status === 'registered';
  const attended = event.myRegistration?.status === 'attended';

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['events'] });

  const register = useMutation({
    mutationFn: () => registerForEvent(event.id),
    onSuccess: () => {
      void refresh();
      showToast('You are registered', 'Your ticket is ready.', 'success');
    },
    onError: (error) => showToast('Could not register', error.message),
  });

  const cancel = useMutation({
    mutationFn: () => cancelRegistration(event.id),
    onSuccess: () => {
      void refresh();
      showToast('Registration cancelled', undefined, 'info');
    },
    onError: (error) => showToast('Could not cancel', error.message),
  });

  function confirmCancel() {
    Alert.alert('Cancel registration?', 'Your ticket will stop working and your spot is released.', [
      { text: 'Keep it', style: 'cancel' },
      { text: 'Cancel registration', style: 'destructive', onPress: () => cancel.mutate() },
    ]);
  }

  const closed = event.status !== 'published' || !event.registrationOpen;
  const full = event.spotsLeft === 0;

  return (
    <>
      <Text className="mb-1 text-[12px] font-semibold tracking-[0.5px] text-brand">
        {EVENT_TYPE_LABEL[event.type].toUpperCase()}
        {event.sponsor ? ` · HOSTED BY ${event.sponsor.toUpperCase()}` : ''}
      </Text>
      <Text className="text-[24px] font-bold leading-[30px] text-ink">{event.title}</Text>

      <Card className="mt-4 p-4">
        <InfoRow icon={<CalendarDays color="#4145B6" size={17} />} text={formatDateRange(event.startsAt, event.endsAt)} />
        <InfoRow
          icon={event.isOnline ? <Globe color="#4145B6" size={17} /> : <MapPin color="#4145B6" size={17} />}
          text={
            event.isOnline
              ? `Online · ${event.timezone}`
              : [whereLabel(event), event.country].filter(Boolean).join(', ')
          }
        />
        {event.doorsInfo ? <InfoRow icon={<DoorOpen color="#4145B6" size={17} />} text={event.doorsInfo} /> : null}
        {event.stand ? (
          <InfoRow
            icon={<Store color="#4145B6" size={17} />}
            text={`${event.sponsor ? `${event.sponsor} stand ` : 'Stand '}${event.stand}`}
          />
        ) : null}
        <InfoRow
          icon={<Gift color="#B9851C" size={17} />}
          text={`The vendor awards ${milesLabel(event).replace(' on check-in', '')} at check-in`}
        />
        {event.isOnline && registered && event.onlineUrl ? (
          <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(event.onlineUrl)}>
            <Text className="text-[14px] font-semibold text-brand">Join link: {event.onlineUrl}</Text>
          </Pressable>
        ) : null}
      </Card>

      <Text className="mt-5 text-[14px] leading-[22px] text-muted">{event.description}</Text>

      {event.perks.length ? (
        <>
          <SectionLabel>What you get</SectionLabel>
          <Card className="px-4 py-3">
            {event.perks.map((perk) => (
              <View key={perk} className="flex-row items-center py-1.5">
                <View className="mr-3 h-5 w-5 items-center justify-center rounded-full bg-[#E8F7F0]">
                  <Check color="#0A8E5B" size={12} />
                </View>
                <Text className="flex-1 text-[14px] text-ink">{perk}</Text>
              </View>
            ))}
          </Card>
        </>
      ) : null}

      <View className="mt-4 flex-row items-center">
        <Users color="#7C8494" size={15} />
        <Text className="ml-2 flex-1 text-[13px] text-muted">
          {event.registeredCount} agents registered
          {event.spotsLeft !== null ? ` · ${event.spotsLeft} spots left` : ''} {'·'} Free for WowMiles members
        </Text>
      </View>

      <View className="mt-6">
        {registered && event.myRegistration ? (
          <>
            <FormButton
              title="View ticket"
              onPress={() => router.push({ pathname: '/event/ticket/[id]', params: { id: event.myRegistration!.id } })}
            />
            <FormButton
              title="Cancel registration"
              tone="outline"
              className="mt-3"
              pending={cancel.isPending}
              onPress={confirmCancel}
            />
          </>
        ) : attended ? (
          <View className="flex-row items-center justify-center rounded-[12px] bg-[#E8F7F0] py-3.5">
            <Clock color="#0A8E5B" size={16} />
            <Text className="ml-2 text-[14px] font-semibold text-[#0A8E5B]">You attended this event</Text>
          </View>
        ) : (
          <FormButton
            title={full ? 'Event full' : closed ? 'Registration closed' : 'Register'}
            disabled={closed || full}
            pending={register.isPending}
            onPress={() => register.mutate()}
          />
        )}
      </View>
    </>
  );
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useQuery({ queryKey: ['events', 'detail', id], queryFn: () => fetchEvent(id) });

  return (
    <MilesScreen fullBleedTop>
      <HubHero title="Event" onBack={() => goBack('/(tabs)/events')} />
      <QueryView query={query} loadingLabel="Loading event">
        {(event) => <EventBody event={event} />}
      </QueryView>
    </MilesScreen>
  );
}
