import { useState } from 'react';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, CircleCheck, Clock } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { EmptyState, QueryView } from '@/components/states';
import { Card, Chip, HubHero, SectionLabel, formatDayShort, goBack, timeAgo } from '@/components/hub/hub-ui';
import { FAQS, fetchTickets, type Ticket } from '@/lib/api/support';

type Filter = 'all' | 'open' | 'resolved';

function TicketRow({ ticket, last }: { ticket: Ticket; last: boolean }) {
  const resolved = ticket.status === 'resolved';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push({ pathname: '/support/[id]', params: { id: ticket.id } })}
      className={`flex-row items-center px-4 py-3.5 active:opacity-70 ${last ? '' : 'border-b border-[#F0F1F5]'}`}
    >
      <View
        className={`mr-3 h-10 w-10 items-center justify-center rounded-[12px] ${resolved ? 'bg-[#E8F7F0]' : 'bg-[#FFF3E0]'}`}
      >
        {resolved ? <CircleCheck color="#0A8E5B" size={19} /> : <Clock color="#D97706" size={19} />}
      </View>
      <View className="flex-1">
        <Text numberOfLines={1} className="text-[15px] font-medium text-ink">
          {ticket.subject}
        </Text>
        <Text className="mt-0.5 text-[12px] text-muted">
          {ticket.publicId} {'·'}{' '}
          {resolved
            ? `Resolved · ${formatDayShort(ticket.resolvedAt ?? ticket.updatedAt)}`
            : `Open · updated ${timeAgo(ticket.updatedAt)}`}
        </Text>
      </View>
    </Pressable>
  );
}

function Faq({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      onPress={() => setOpen((value) => !value)}
      className="border-b border-line py-3.5"
    >
      <View className="flex-row items-center">
        <Text className="flex-1 pr-3 text-[15px] text-ink">{question}</Text>
        {open ? <ChevronUp color="#7C8494" size={18} /> : <ChevronDown color="#7C8494" size={18} />}
      </View>
      {open ? <Text className="mt-2 text-[14px] leading-[21px] text-muted">{answer}</Text> : null}
    </Pressable>
  );
}

export default function SupportScreen() {
  const [filter, setFilter] = useState<Filter>('all');
  const query = useQuery({ queryKey: ['support', 'tickets'], queryFn: fetchTickets });

  return (
    <View className="w-full max-w-[440px] flex-1 self-center bg-canvas">
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130 }}
      >
        <HubHero
          title="How can we help?"
          subtitle={query.data?.replyWindowLabel}
          onBack={() => goBack('/(tabs)/profile')}
        />

        <SectionLabel>Your requests</SectionLabel>
        <View className="mb-3 flex-row">
          {(['all', 'open', 'resolved'] as const).map((item) => (
            <Chip
              key={item}
              label={item === 'all' ? 'All' : item === 'open' ? 'Open' : 'Resolved'}
              selected={filter === item}
              onPress={() => setFilter(item)}
            />
          ))}
        </View>
        <QueryView
          query={query}
          loadingLabel="Loading requests"
          isEmpty={(data) => data.tickets.length === 0}
          empty={
            <EmptyState
              title="No requests yet"
              description="Start a request and our team will reply."
              actionLabel="New request"
              onAction={() => router.push('/support/new')}
            />
          }
        >
          {(data) => {
            const list = data.tickets.filter((ticket) =>
              filter === 'all' ? true : filter === 'open' ? ticket.status !== 'resolved' : ticket.status === 'resolved',
            );
            return list.length ? (
              <Card>
                {list.map((ticket, index) => (
                  <TicketRow key={ticket.id} ticket={ticket} last={index === list.length - 1} />
                ))}
              </Card>
            ) : (
              <EmptyState title={filter === 'open' ? 'No open requests' : 'No resolved requests'} />
            );
          }}
        </QueryView>

        <SectionLabel>Common questions</SectionLabel>
        {FAQS.map((item) => (
          <Faq key={item.question} {...item} />
        ))}
      </ScrollView>

      <View className="absolute bottom-6 left-5 right-5 h-[64px] flex-row items-center rounded-full bg-[#11151F] pl-5 pr-2">
        <View className="flex-1">
          <Text className="text-[12px] text-[#8A90A0]">Cannot find it?</Text>
          <Text className="text-[14px] font-medium text-white">We reply within 1 working day</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/support/new')}
          className="h-[48px] items-center justify-center rounded-full bg-[#F5B21F] px-5 active:opacity-80"
        >
          <Text className="text-[15px] font-semibold text-[#11151F]">New request</Text>
        </Pressable>
      </View>
    </View>
  );
}
