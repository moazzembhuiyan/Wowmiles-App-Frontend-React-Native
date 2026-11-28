import { useQuery } from '@tanstack/react-query';
import { Clock3 } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { MilesScreen } from '@/components/miles-ui';
import { formatDate, miles } from '@/components/money-ui';
import { QueryView } from '@/components/states';
import { InfoNote, NotCounted, PointsBySource, StatusHero } from '@/components/status-ui';
import { getStatusDowngraded } from '@/lib/api/status';

export default function StatusDowngradedScreen() {
  const query = useQuery({ queryKey: ['status', 'downgraded'], queryFn: getStatusDowngraded });

  return (
    <MilesScreen fullBleedTop>
      <QueryView query={query}>
        {(status) => {
          const down = status.downgraded;
          return (
            <>
              <StatusHero
                status={status}
                subtitle={down ? `Dropped from ${down.fromName} on ${formatDate(down.at)} · ${miles(down.pointsToReturn)} points to return` : undefined}
              />
              <InfoNote>
                You earn 1 status point for every mile. Spending never reduces your points — but a cancelled booking does, and your tier can drop.
              </InfoNote>
              <PointsBySource status={status} />
              {down ? (
                <>
                  <Text className="mb-2 text-[12px] font-semibold tracking-[0.8px] text-[#747B8B]">WHAT YOU LOST</Text>
                  <View className="mb-5 rounded-[18px] border border-line bg-white px-4">
                    {down.lost.map((item, index) => (
                      <View
                        key={item.label}
                        className={`flex-row items-center py-3.5 ${index < down.lost.length - 1 ? 'border-b border-[#EEF0F4]' : ''}`}
                      >
                        <View className="mr-3 h-10 w-10 items-center justify-center rounded-[12px] bg-[#FFF5DF]">
                          <Clock3 color="#D9730D" size={18} />
                        </View>
                        <View className="flex-1 pr-2">
                          <Text className="text-[16px] font-medium text-[#555D6E]">{`${item.label} — cancelled`}</Text>
                          <Text className="mt-0.5 text-[13px] text-muted">{`Reversed ${formatDate(down.at)} · this is what dropped your tier`}</Text>
                        </View>
                        <Text className="text-[16px] font-semibold text-[#555D6E]">{`−${miles(item.points)}`}</Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : null}
              <NotCounted status={status} />
            </>
          );
        }}
      </QueryView>
    </MilesScreen>
  );
}
