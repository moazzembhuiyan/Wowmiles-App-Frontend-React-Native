import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Text, View } from 'react-native';
import { MilesScreen } from '@/components/miles-ui';
import { QueryView } from '@/components/states';
import { QrCode } from '@/components/hub/qr-code';
import { milesLabel } from '@/components/hub/event-card';
import { Card, HubHero, formatDateRange, goBack } from '@/components/hub/hub-ui';
import { fetchTicket } from '@/lib/api/events';

export default function EventTicketScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useQuery({ queryKey: ['events', 'ticket', id], queryFn: () => fetchTicket(id) });

  return (
    <MilesScreen fullBleedTop>
      <HubHero title="Your ticket" onBack={() => goBack('/event/mine')} />
      <QueryView query={query} loadingLabel="Loading ticket">
        {(ticket) => (
          <>
            <Card className="items-center px-5 py-6">
              <Text className="text-[11px] font-semibold tracking-[0.6px] text-brand">
                {(ticket.event.sponsor || 'WowMiles').toUpperCase()} {'·'} WOWMILES
              </Text>
              <Text className="mt-2 text-center text-[20px] font-bold leading-[26px] text-ink">{ticket.event.title}</Text>
              <Text className="mt-1 text-center text-[13px] text-muted">
                {formatDateRange(ticket.event.startsAt, ticket.event.endsAt)}
                {ticket.event.stand ? ` · Stand ${ticket.event.stand}` : ''}
              </Text>

              <View className="my-5 rounded-[16px] border border-line bg-white p-3">
                <QrCode value={ticket.qrPayload} size={200} />
              </View>

              <Text selectable className="text-[22px] font-bold tracking-[1px] text-ink">
                {ticket.idCode}
              </Text>
              <Text className="mt-1 text-[13px] text-muted">
                {ticket.agent.name} {'·'} {ticket.agent.agencyName}
              </Text>

              {ticket.status === 'attended' ? (
                <View className="mt-4 rounded-full bg-[#E8F7F0] px-3 py-1.5">
                  <Text className="text-[12px] font-semibold text-[#0A8E5B]">Checked in</Text>
                </View>
              ) : null}
            </Card>

            <Card className="mt-4 p-4">
              <Text className="text-[15px] font-semibold text-ink">Miles awarded when the vendor scans</Text>
              <Text className="mt-1 text-[13px] leading-[19px] text-muted">
                The vendor sets the amount: {milesLabel(ticket.event).replace(' on check-in', '')}.
              </Text>
              {ticket.event.stand ? (
                <Text className="mt-3 text-[13px] text-ink">Find stand {ticket.event.stand} at the venue.</Text>
              ) : null}
            </Card>
          </>
        )}
      </QueryView>
    </MilesScreen>
  );
}
