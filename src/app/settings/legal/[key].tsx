import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Text } from 'react-native';
import { MilesHeader, MilesScreen } from '@/components/miles-ui';
import { QueryView } from '@/components/states';
import { goBack } from '@/components/hub/hub-ui';
import { fetchLegalPage, type LegalKey } from '@/lib/api/settings';

export default function LegalPageScreen() {
  const { key } = useLocalSearchParams<{ key: LegalKey }>();
  const query = useQuery({ queryKey: ['settings', 'legal', key], queryFn: () => fetchLegalPage(key) });

  return (
    <MilesScreen>
      <MilesHeader title={query.data?.title ?? 'Legal'} onBack={() => goBack('/settings/about')} />
      <QueryView query={query} loadingLabel="Loading">
        {(page) => <Text className="text-[14px] leading-[23px] text-ink">{page.body}</Text>}
      </QueryView>
    </MilesScreen>
  );
}
