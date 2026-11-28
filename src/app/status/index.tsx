import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Pressable, Text } from 'react-native';
import { MilesScreen } from '@/components/miles-ui';
import { QueryView } from '@/components/states';
import { InfoNote, NotCounted, PointsBySource, StatusHero } from '@/components/status-ui';
import { getStatus } from '@/lib/api/status';

export default function StatusBreakdownScreen() {
  const query = useQuery({ queryKey: ['status'], queryFn: getStatus });

  return (
    <MilesScreen fullBleedTop>
      <QueryView query={query}>
        {(status) => (
          <>
            <StatusHero status={status} />
            <InfoNote>
              You earn 1 status point for every mile. Spending never reduces your points — but a cancelled booking does, and your tier can drop.
            </InfoNote>
            <PointsBySource status={status} />
            <NotCounted status={status} />
            <Pressable accessibilityRole="button" onPress={() => router.push('/status/downgraded')} className="mb-8 items-center py-2">
              <Text className="text-[13px] font-semibold text-brand">See what happens if a tier is lost</Text>
            </Pressable>
          </>
        )}
      </QueryView>
    </MilesScreen>
  );
}
