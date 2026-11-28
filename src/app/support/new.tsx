import { useState } from 'react';
import { router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Text, TextInput, View } from 'react-native';
import { MilesHeader, MilesScreen } from '@/components/miles-ui';
import { useToast } from '@/components/toast';
import { Field } from '@/components/ui';
import { Chip, FieldError, FormButton, goBack } from '@/components/hub/hub-ui';
import { TICKET_CATEGORIES, createTicket, type TicketCategory } from '@/lib/api/support';

type Errors = Partial<Record<'subject' | 'message', string>>;

export default function NewSupportRequestScreen() {
  const showToast = useToast();
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<TicketCategory>('booking');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  const create = useMutation({
    mutationFn: () => createTicket({ subject, category, message }),
    onSuccess: (ticket) => {
      void queryClient.invalidateQueries({ queryKey: ['support'] });
      showToast('Request sent', `Your reference is ${ticket.publicId}.`, 'success');
      router.replace({ pathname: '/support/[id]', params: { id: ticket.id } });
    },
    onError: (error) => showToast('Could not send request', error.message),
  });

  function submit() {
    const found: Errors = {};
    if (!subject.trim()) found.subject = 'Add a short subject.';
    else if (subject.trim().length > 200) found.subject = 'Subject must be 200 characters or fewer.';
    if (!message.trim()) found.message = 'Tell us what you need help with.';
    else if (message.trim().length > 2000) found.message = 'Message must be 2,000 characters or fewer.';
    setErrors(found);
    if (Object.keys(found).length === 0) create.mutate();
  }

  return (
    <MilesScreen>
      <MilesHeader title="New request" onBack={() => goBack('/support')} />

      <Field label="Subject" value={subject} onChangeText={setSubject} autoCapitalize="sentences" placeholder="What is this about?" maxLength={200} />
      <FieldError message={errors.subject} />

      <Text className="mb-2 text-[12px] font-medium text-[#454B59]">Category</Text>
      <View className="mb-2 flex-row flex-wrap">
        {TICKET_CATEGORIES.map((item) => (
          <Chip key={item.key} label={item.label} selected={category === item.key} onPress={() => setCategory(item.key)} />
        ))}
      </View>

      <Text className="mb-2 mt-2 text-[12px] font-medium text-[#454B59]">Message</Text>
      <TextInput
        accessibilityLabel="Message"
        value={message}
        onChangeText={setMessage}
        placeholder="Describe the problem. Include booking references if relevant."
        placeholderTextColor="#A4AAB5"
        multiline
        textAlignVertical="top"
        maxLength={2000}
        className="mb-4 min-h-[140px] rounded-[10px] border border-line bg-white px-3.5 py-3 text-[14px] text-ink"
      />
      <FieldError message={errors.message} />

      <Text className="mb-5 text-[12px] text-muted">We reply within 1 working day.</Text>
      <FormButton title="Send request" pending={create.isPending} onPress={submit} />
    </MilesScreen>
  );
}
