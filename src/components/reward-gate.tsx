import { useQuery } from '@tanstack/react-query';
import { View } from 'react-native';
import { QueryView } from '@/components/states';
import { getReward, type Reward } from '@/lib/api/rewards';

/** Loads the reward from the route param, then renders the screen with it (or the loading and error states). */
export function RewardGate({ id, children }: { id?: string; children: (reward: Reward) => React.ReactNode }) {
  const query = useQuery({ queryKey: ['reward', id], queryFn: () => getReward(String(id)), enabled: !!id });
  if (query.data) return <>{children(query.data)}</>;
  return (
    <View className="flex-1 bg-[#F8F9FB] px-5 pt-24">
      <QueryView query={query}>{() => null}</QueryView>
    </View>
  );
}
