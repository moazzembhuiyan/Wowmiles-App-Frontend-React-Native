import { Alert, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { KeyRound, Laptop, Smartphone } from 'lucide-react-native';
import { MilesHeader, MilesScreen } from '@/components/miles-ui';
import { QueryView } from '@/components/states';
import { useToast } from '@/components/toast';
import { Card, FormButton, ListRow, SectionLabel, goBack, timeAgo } from '@/components/hub/hub-ui';
import { fetchSessions, revokeSession, type Session } from '@/lib/api/profile';

function SessionRow({ session, last }: { session: Session; last: boolean }) {
  const showToast = useToast();
  const queryClient = useQueryClient();
  const revoke = useMutation({
    mutationFn: () => revokeSession(session.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profile', 'sessions'] });
      showToast('Device signed out', undefined, 'success');
    },
    onError: (error) => showToast('Could not sign out device', error.message),
  });

  const Icon = /iphone|ios|android/i.test(session.device ?? '') ? Smartphone : Laptop;

  function confirm() {
    Alert.alert('Sign out this device?', `${session.device ?? 'Unknown device'} will need to sign in again.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => revoke.mutate() },
    ]);
  }

  return (
    <View className={`px-4 py-3.5 ${last ? '' : 'border-b border-[#F0F1F5]'}`}>
      <View className="flex-row items-center">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-[12px] bg-[#F1F1FB]">
          <Icon color="#4145B6" size={19} />
        </View>
        <View className="flex-1">
          <Text className="text-[15px] font-medium text-ink">{session.device ?? 'Unknown device'}</Text>
          <Text className="mt-0.5 text-[13px] text-muted">
            {session.isCurrent ? 'This device' : `Last active ${timeAgo(session.lastUsedAt)}`} {'·'} {session.ip}
          </Text>
        </View>
        {session.isCurrent ? (
          <View className="rounded-full bg-[#E8F7F0] px-2.5 py-1">
            <Text className="text-[11px] font-semibold text-[#0A8E5B]">Current</Text>
          </View>
        ) : null}
      </View>
      {!session.isCurrent ? (
        <FormButton title="Sign out device" tone="outline" className="mt-3 h-[44px]" pending={revoke.isPending} onPress={confirm} />
      ) : null}
    </View>
  );
}

export default function SecurityScreen() {
  const query = useQuery({ queryKey: ['profile', 'sessions'], queryFn: fetchSessions });

  return (
    <MilesScreen>
      <MilesHeader
        title="Security"
        subtitle={query.data ? `Active sessions · ${query.data.length} ${query.data.length === 1 ? 'device' : 'devices'}` : undefined}
        onBack={() => goBack('/settings')}
      />
      <QueryView query={query} loadingLabel="Loading sessions">
        {(sessions) => (
          <Card>
            {sessions.map((session, index) => (
              <SessionRow key={session.id} session={session} last={index === sessions.length - 1} />
            ))}
          </Card>
        )}
      </QueryView>

      <SectionLabel>Password</SectionLabel>
      <Card>
        <ListRow
          icon={<KeyRound color="#4145B6" size={19} />}
          title="Change password"
          detail="Other devices are signed out after a change"
          onPress={() => router.push('/settings/change-password')}
          last
        />
      </Card>
    </MilesScreen>
  );
}
