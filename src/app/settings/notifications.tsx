import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Switch, Text, View } from 'react-native';
import { MilesHeader, MilesScreen } from '@/components/miles-ui';
import { QueryView } from '@/components/states';
import { useToast } from '@/components/toast';
import { Card, SectionLabel, goBack } from '@/components/hub/hub-ui';
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreferences,
  type PreferenceCategory,
  type PreferenceChannel,
  type PreferencesPatch,
} from '@/lib/api/settings';

const REQUIRED: { key: PreferenceCategory; label: string }[] = [
  { key: 'bookings', label: 'Booking confirmed' },
  { key: 'miles', label: 'Miles credited' },
  { key: 'bookings', label: 'Booking reversed' },
];

const PROGRAMME: { key: PreferenceCategory; label: string }[] = [
  { key: 'promo', label: 'Campaigns and bonus miles' },
  { key: 'academy', label: 'New training modules' },
  { key: 'events', label: 'Event invitations' },
  { key: 'community', label: 'Community replies' },
];

const CHANNELS: { key: PreferenceChannel; label: string }[] = [
  { key: 'push', label: 'Push notifications' },
  { key: 'email', label: 'Email' },
];

function ToggleRow({
  label,
  value,
  onChange,
  disabled,
  note,
  last,
}: {
  label: string;
  value: boolean;
  onChange?: (value: boolean) => void;
  disabled?: boolean;
  note?: string;
  last?: boolean;
}) {
  return (
    <View className={`min-h-[56px] flex-row items-center px-4 py-2.5 ${last ? '' : 'border-b border-[#F0F1F5]'}`}>
      <View className="flex-1 pr-3">
        <Text className="text-[15px] text-ink">{label}</Text>
        {note ? <Text className="mt-0.5 text-[12px] text-muted">{note}</Text> : null}
      </View>
      <Switch
        accessibilityLabel={label}
        value={value}
        disabled={disabled}
        onValueChange={onChange}
        trackColor={{ false: '#D5D9E2', true: '#4145B6' }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

function Preferences({ data }: { data: NotificationPreferences }) {
  const showToast = useToast();
  const queryClient = useQueryClient();

  const save = useMutation({
    mutationFn: (patch: PreferencesPatch) => updateNotificationPreferences(patch),
    onSuccess: (next) => queryClient.setQueryData(['settings', 'notification-preferences'], next),
    onError: (error) => showToast('Could not update preferences', error.message),
  });

  const editable = (Object.keys(data.push) as PreferenceCategory[]).filter((key) => !data.locked.includes(key));

  function setCategory(key: PreferenceCategory, value: boolean) {
    save.mutate({ push: { [key]: value }, email: { [key]: value } });
  }

  function setChannel(channel: PreferenceChannel, value: boolean) {
    save.mutate({ [channel]: Object.fromEntries(editable.map((key) => [key, value])) });
  }

  return (
    <>
      <Text className="-mt-2 mb-1 text-[14px] leading-[21px] text-muted">
        Booking and miles alerts are always on. Everything else is yours to choose.
      </Text>

      <SectionLabel>Miles and bookings</SectionLabel>
      <Card>
        {REQUIRED.map((item, index) => (
          <ToggleRow
            key={item.label}
            label={item.label}
            value
            disabled
            note="Required · always on"
            last={index === REQUIRED.length - 1}
          />
        ))}
      </Card>

      <SectionLabel>Programme</SectionLabel>
      <Card>
        {PROGRAMME.map((item, index) => (
          <ToggleRow
            key={item.key}
            label={item.label}
            value={data.push[item.key] || data.email[item.key]}
            disabled={save.isPending}
            onChange={(value) => setCategory(item.key, value)}
            last={index === PROGRAMME.length - 1}
          />
        ))}
      </Card>

      <SectionLabel>Channels</SectionLabel>
      <Card>
        {CHANNELS.map((item, index) => (
          <ToggleRow
            key={item.key}
            label={item.label}
            value={editable.some((key) => data[item.key][key])}
            disabled={save.isPending}
            onChange={(value) => setChannel(item.key, value)}
            last={index === CHANNELS.length - 1}
          />
        ))}
      </Card>
    </>
  );
}

export default function NotificationPreferencesScreen() {
  const query = useQuery({
    queryKey: ['settings', 'notification-preferences'],
    queryFn: fetchNotificationPreferences,
  });

  return (
    <MilesScreen>
      <MilesHeader title="Notifications" onBack={() => goBack('/settings')} />
      <QueryView query={query} loadingLabel="Loading preferences">
        {(data) => <Preferences data={data} />}
      </QueryView>
    </MilesScreen>
  );
}
