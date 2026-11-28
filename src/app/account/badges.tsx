import { useQuery } from '@tanstack/react-query';
import { Award, Lock } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { MilesScreen } from '@/components/miles-ui';
import { QueryView } from '@/components/states';
import { Card, HubHero, SectionLabel, TierBadge, formatDay, goBack } from '@/components/hub/hub-ui';
import {
  fetchBadges,
  fetchCertificates,
  fetchProfileSummary,
  type Badge,
} from '@/lib/api/profile';

function BadgeTile({ badge, locked = false }: { badge: Badge; locked?: boolean }) {
  const pct = Math.min(100, Math.round((badge.progress.current / Math.max(1, badge.progress.threshold)) * 100));
  return (
    <View className="mb-3 w-[48%] rounded-[16px] border border-line bg-white p-3.5">
      <View
        className={`mb-2 h-10 w-10 items-center justify-center rounded-full ${locked ? 'bg-[#F1F2F5]' : 'bg-[#FCF4DF]'}`}
      >
        {locked ? <Lock color="#9AA1B0" size={17} /> : <Award color="#B9851C" size={19} />}
      </View>
      <Text className={`text-[14px] font-semibold ${locked ? 'text-muted' : 'text-ink'}`}>{badge.name}</Text>
      {locked ? (
        <>
          <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#ECEEF3]">
            <View className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
          </View>
          <Text className="mt-1 text-[11px] text-muted">
            {badge.progress.current} of {badge.progress.threshold}
          </Text>
        </>
      ) : (
        <Text className="mt-0.5 text-[12px] text-muted">{badge.earnedAt ? formatDay(badge.earnedAt) : ''}</Text>
      )}
    </View>
  );
}

export default function BadgesScreen() {
  const badges = useQuery({ queryKey: ['profile', 'badges'], queryFn: fetchBadges });
  const certificates = useQuery({ queryKey: ['profile', 'certificates'], queryFn: fetchCertificates });
  const summary = useQuery({ queryKey: ['profile', 'summary'], queryFn: fetchProfileSummary });

  return (
    <MilesScreen fullBleedTop>
      <HubHero title="Recognition" onBack={() => goBack('/(tabs)/profile')}>
        {summary.data ? (
          <View className="mt-3 flex-row items-center">
            <Text className="mr-2 text-[16px] font-semibold text-white">{summary.data.tier.name} member</Text>
            <TierBadge tier={summary.data.tier.key} label={summary.data.tier.name} />
          </View>
        ) : null}
      </HubHero>

      <QueryView query={badges} loadingLabel="Loading badges">
        {(data) => (
          <>
            <Text className="mb-2 text-[12px] font-semibold tracking-[0.6px] text-muted">
              BADGES {data.earned.length} OF {data.totalActive}
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {data.earned.map((badge) => (
                <BadgeTile key={badge.key} badge={badge} />
              ))}
              {data.locked.map((badge) => (
                <BadgeTile key={badge.key} badge={badge} locked />
              ))}
            </View>
          </>
        )}
      </QueryView>

      <SectionLabel>Certificates</SectionLabel>
      <QueryView query={certificates} loadingLabel="Loading certificates">
        {(list) => (
          <Card>
            {list.map((certificate, index) => (
              <View
                key={certificate.publicId}
                className={`px-4 py-3 ${index < list.length - 1 ? 'border-b border-[#F0F1F5]' : ''}`}
              >
                <Text className="text-[15px] font-medium text-ink">{certificate.courseTitle}</Text>
                <Text className="mt-0.5 text-[13px] text-muted">
                  {certificate.issuer} {'·'} {formatDay(certificate.issuedAt)}
                </Text>
              </View>
            ))}
          </Card>
        )}
      </QueryView>
    </MilesScreen>
  );
}
