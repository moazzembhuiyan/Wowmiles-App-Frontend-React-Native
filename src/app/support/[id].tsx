import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react-native';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View, type ScrollViewInstance } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QueryView } from '@/components/states';
import { useToast } from '@/components/toast';
import { ComposerBar, formatTime, goBack } from '@/components/hub/hub-ui';
import { fetchTicket, sendTicketMessage, type TicketDetail } from '@/lib/api/support';

function Conversation({ ticket }: { ticket: TicketDetail }) {
  const showToast = useToast();
  const queryClient = useQueryClient();
  const scroll = useRef<ScrollViewInstance>(null);
  const [text, setText] = useState('');
  const resolved = ticket.status === 'resolved';

  const send = useMutation({
    mutationFn: () => sendTicketMessage(ticket.id, text),
    onSuccess: () => {
      setText('');
      void queryClient.invalidateQueries({ queryKey: ['support'] });
    },
    onError: (error) => showToast('Message not sent', error.message),
  });

  useEffect(() => {
    scroll.current?.scrollToEnd({ animated: true });
  }, [ticket.messages.length]);

  return (
    <>
      <ScrollView
        ref={scroll}
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-4 text-center text-[13px] text-muted">{ticket.publicId}</Text>
        {ticket.messages.map((message) => {
          const mine = message.from === 'requester';
          return (
            <View
              key={message.id}
              className={`mb-3 max-w-[80%] rounded-[20px] px-4 py-3 ${
                mine ? 'self-end rounded-br-[6px] bg-brand' : 'self-start rounded-bl-[6px] border border-line bg-white'
              }`}
            >
              <Text className={`text-[15px] leading-[21px] ${mine ? 'text-white' : 'text-ink'}`}>{message.text}</Text>
              <Text className={`mt-1 self-end text-[11px] ${mine ? 'text-[#C9CCF0]' : 'text-muted'}`}>
                {formatTime(message.createdAt)}
              </Text>
            </View>
          );
        })}
        {resolved ? (
          <Text className="mt-2 text-center text-[13px] text-muted">This request is resolved.</Text>
        ) : null}
      </ScrollView>
      <ComposerBar
        value={text}
        onChangeText={setText}
        onSend={() => send.mutate()}
        placeholder={resolved ? 'Request resolved' : 'Write a message'}
        pending={send.isPending}
        disabled={resolved}
      />
    </>
  );
}

export default function SupportChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useQuery({ queryKey: ['support', 'ticket', id], queryFn: () => fetchTicket(id) });

  return (
    <SafeAreaView edges={['top', 'bottom']} className="w-full max-w-[440px] flex-1 self-center bg-canvas">
      <View className="flex-row items-center px-5 pb-2 pt-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => goBack('/support')}
          className="h-10 w-10 items-center justify-center rounded-full border border-line bg-white"
        >
          <ArrowLeft color="#252B3A" size={20} />
        </Pressable>
        <View className="flex-1 items-center pr-10">
          <Text numberOfLines={1} className="text-[17px] font-semibold text-ink">
            {query.data?.subject ?? 'Support'}
          </Text>
          <Text className="text-[12px] text-muted">
            {query.data
              ? query.data.status === 'resolved'
                ? 'Resolved'
                : `Replies in ~${query.data.replyEtaMinutes < 90 ? `${query.data.replyEtaMinutes} min` : `${Math.round(query.data.replyEtaMinutes / 60)} h`}`
              : ' '}
          </Text>
        </View>
      </View>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <QueryView query={query} loadingLabel="Loading conversation">
          {(ticket) => <Conversation ticket={ticket} />}
        </QueryView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
