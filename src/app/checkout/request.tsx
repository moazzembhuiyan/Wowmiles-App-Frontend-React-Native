import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Plus, X } from 'lucide-react-native';
import { Pressable, Text, TextInput, View } from 'react-native';
import { stepAfterAmount } from '@/components/checkout-flow';
import { MilesHeader, MilesScreen } from '@/components/miles-ui';
import { Banner, GoldButton, TextButton } from '@/components/money-ui';
import { RewardGate } from '@/components/reward-gate';
import type { Reward } from '@/lib/api/rewards';
import { useToast } from '@/components/toast';
import { Field } from '@/components/ui';
import { getCheckoutDraft, updateCheckoutDraft } from '@/lib/api/redemptions';

const MAX_GUESTS = 20;
const isoDate = /^\d{4}-\d{2}-\d{2}$/;

function validDate(value: string) {
  return isoDate.test(value) && !Number.isNaN(Date.parse(value));
}

export default function RequestDetailsScreenRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <RewardGate id={id}>{(reward) => <RequestDetailsScreen reward={reward} />}</RewardGate>;
}

function RequestDetailsScreen({ reward }: { reward: Reward }) {
  const required = reward.requiredInfo;
  const showToast = useToast();
  const saved = getCheckoutDraft(reward).request;

  const [preferredDate, setPreferredDate] = useState(saved?.preferredDate ?? '');
  const [secondChoiceDate, setSecondChoiceDate] = useState(saved?.secondChoiceDate ?? '');
  const [guests, setGuests] = useState<string[]>(saved?.guests.map((g) => g.name) ?? ['']);
  const [pickup, setPickup] = useState(saved?.pickup ?? '');
  const [notes, setNotes] = useState(saved?.notes ?? '');

  function submit() {
    const today = new Date().toISOString().slice(0, 10);
    if (required.preferredDate && (!validDate(preferredDate) || preferredDate < today)) {
      showToast('Check your preferred date', 'Use the format YYYY-MM-DD, today or later.');
      return;
    }
    if (required.secondChoiceDate && secondChoiceDate) {
      if (!validDate(secondChoiceDate) || secondChoiceDate < today || secondChoiceDate === preferredDate) {
        showToast('Check your second choice', 'Pick a different date that is today or later.');
        return;
      }
    }
    const names = guests.map((name) => name.trim()).filter(Boolean);
    if (required.guests && names.length === 0) {
      showToast('Add guest names', 'The provider needs at least one name.');
      return;
    }
    updateCheckoutDraft(reward, {
      request: {
        preferredDate,
        secondChoiceDate: secondChoiceDate || null,
        endDate: null,
        guests: names.map((name) => ({ name })),
        pickup: pickup.trim(),
        notes: notes.trim(),
      },
    });
    router.push(stepAfterAmount(reward, true));
  }

  return (
    <MilesScreen>
      <MilesHeader title="Request details" subtitle={reward.title} />
      <Banner tone="info" title="The provider confirms your request">
        Share your plans. They reply within 48 hours and your miles stay on hold until they do.
      </Banner>

      {required.preferredDate ? (
        <Field
          label="Preferred date"
          value={preferredDate}
          onChangeText={setPreferredDate}
          placeholder="YYYY-MM-DD"
          keyboardType="numbers-and-punctuation"
        />
      ) : null}
      {required.secondChoiceDate ? (
        <Field
          label="Second choice (optional)"
          value={secondChoiceDate}
          onChangeText={setSecondChoiceDate}
          placeholder="YYYY-MM-DD"
          keyboardType="numbers-and-punctuation"
        />
      ) : null}

      {required.guests ? (
        <View className="mb-4">
          <Text className="mb-2 text-[12px] font-medium text-[#454B59]">Guest names</Text>
          {guests.map((name, index) => (
            <View key={index} className="mb-2 flex-row items-center">
              <TextInput
                accessibilityLabel={`Guest ${index + 1} name`}
                value={name}
                onChangeText={(text) => setGuests((list) => list.map((item, i) => (i === index ? text : item)))}
                placeholder={`Guest ${index + 1}`}
                placeholderTextColor="#A4AAB5"
                className="h-[50px] flex-1 rounded-[10px] border border-line bg-white px-3.5 text-[14px] text-ink"
              />
              {guests.length > 1 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove guest ${index + 1}`}
                  onPress={() => setGuests((list) => list.filter((_, i) => i !== index))}
                  className="ml-2 h-10 w-10 items-center justify-center"
                >
                  <X color="#858B98" size={18} />
                </Pressable>
              ) : null}
            </View>
          ))}
          {guests.length < MAX_GUESTS ? (
            <Pressable accessibilityRole="button" onPress={() => setGuests((list) => [...list, ''])} className="flex-row items-center py-1">
              <Plus color="#4145B6" size={16} />
              <Text className="ml-1.5 text-[13px] font-semibold text-brand">Add a guest</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {required.pickup ? (
        <Field label="Pick-up location" value={pickup} onChangeText={setPickup} placeholder="Hotel or address" autoCapitalize="sentences" />
      ) : null}
      {required.notes ? (
        <View className="mb-4">
          <Text className="mb-2 text-[12px] font-medium text-[#454B59]">Notes for the provider</Text>
          <TextInput
            accessibilityLabel="Notes for the provider"
            value={notes}
            onChangeText={setNotes}
            multiline
            maxLength={1000}
            placeholder="Allergies, accessibility needs, anything else"
            placeholderTextColor="#A4AAB5"
            textAlignVertical="top"
            className="min-h-[96px] rounded-[10px] border border-line bg-white px-3.5 py-3 text-[14px] text-ink"
          />
        </View>
      ) : null}

      <GoldButton title="Continue" onPress={submit} />
      <TextButton title="Cancel" onPress={() => router.back()} />
    </MilesScreen>
  );
}
