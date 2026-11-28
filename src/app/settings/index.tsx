import { Alert } from 'react-native';
import { router } from 'expo-router';
import { Bell, Database, KeyRound, Languages, MonitorSmartphone, Moon, ShieldCheck } from 'lucide-react-native';
import { MilesHeader, MilesScreen } from '@/components/miles-ui';
import { Card, FormButton, ListRow, SectionLabel, goBack } from '@/components/hub/hub-ui';
import { useToast } from '@/components/toast';
import { useAuth } from '@/lib/auth/auth-context';

export default function SettingsScreen() {
  const showToast = useToast();
  const { logout } = useAuth();

  function confirmLogout() {
    Alert.alert('Log out?', 'You will need to sign in again to use WowMiles.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => void logout().then(() => router.replace('/(auth)/login')) },
    ]);
  }

  return (
    <MilesScreen>
      <MilesHeader title="Settings" onBack={() => goBack('/(tabs)/profile')} />

      <SectionLabel>Preferences</SectionLabel>
      <Card>
        <ListRow
          icon={<Bell color="#4145B6" size={19} />}
          title="Notifications"
          detail="Push, email and in-app"
          onPress={() => router.push('/settings/notifications')}
        />
        <ListRow icon={<Languages color="#4145B6" size={19} />} title="Language" value="English" trailing={<></>} />
        <ListRow icon={<Moon color="#4145B6" size={19} />} title="Appearance" value="System" trailing={<></>} last />
      </Card>

      <SectionLabel>Security</SectionLabel>
      <Card>
        <ListRow
          icon={<KeyRound color="#4145B6" size={19} />}
          title="Change password"
          onPress={() => router.push('/settings/change-password')}
        />
        <ListRow
          icon={<MonitorSmartphone color="#4145B6" size={19} />}
          title="Active sessions"
          detail="See where you are signed in"
          onPress={() => router.push('/settings/security')}
          last
        />
      </Card>

      <SectionLabel>Data</SectionLabel>
      <Card>
        <ListRow
          icon={<Database color="#4145B6" size={19} />}
          title="Download my data"
          onPress={() => showToast('Not available yet', 'Data export will be added in a later release.', 'info')}
        />
        <ListRow
          icon={<ShieldCheck color="#4145B6" size={19} />}
          title="Privacy settings"
          onPress={() => router.push({ pathname: '/settings/legal/[key]', params: { key: 'agentPrivacyAndPolicy' } })}
          last
        />
      </Card>

      <FormButton
        title="Log out"
        tone="danger"
        className="mt-7"
        onPress={confirmLogout}
      />
    </MilesScreen>
  );
}
