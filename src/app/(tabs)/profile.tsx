import { router, type Href } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Award, Handshake, Info, LifeBuoy, MessagesSquare, Settings, UserPen } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { QueryView } from '@/components/states';
import { Avatar, Card, HubHero, ListRow, SectionLabel, TierBadge } from '@/components/hub/hub-ui';
import { fetchProfileSummary, type ProfileSummary } from '@/lib/api/profile';

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View className="mr-2 flex-1 items-center rounded-[14px] border border-white/20 bg-white/15 py-3">
      <Text className="text-[20px] font-bold text-white">{value}</Text>
      <Text className="mt-0.5 text-[12px] text-[#D8DAF2]">{label}</Text>
    </View>
  );
}

function FeatureLink({
  icon,
  title,
  detail,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  href: Href;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(href)}
      className="mb-3 flex-row items-center rounded-[16px] border border-line bg-white p-4 active:opacity-80"
    >
      <View className="mr-3 h-11 w-11 items-center justify-center rounded-[13px] bg-[#F1F1FB]">{icon}</View>
      <View className="flex-1">
        <Text className="text-[15px] font-semibold text-ink">{title}</Text>
        <Text className="mt-0.5 text-[13px] text-muted">{detail}</Text>
      </View>
    </Pressable>
  );
}

function ProfileBody({ data }: { data: ProfileSummary }) {
  return (
    <>
      <View className="-mt-1 mb-1 flex-row items-center">
        <Avatar name={data.profile.name} size={56} dark />
        <View className="ml-3 flex-1">
          <Text className="text-[20px] font-bold text-white">{data.profile.name}</Text>
          <View className="mt-1 flex-row items-center">
            <Text numberOfLines={1} className="mr-2 flex-shrink text-[13px] text-[#D8DAF2]">
              {data.agency.name}
            </Text>
            <TierBadge tier={data.tier.key} label={data.tier.name} />
          </View>
        </View>
      </View>
    </>
  );
}

export default function ProfileScreen() {
  const query = useQuery({ queryKey: ['profile', 'summary'], queryFn: fetchProfileSummary });
  const data = query.data;

  return (
    <View className="w-full max-w-[440px] flex-1 self-center bg-canvas">
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
      >
        <HubHero title="Profile">
          {data ? (
            <>
              <View className="mt-4">
                <ProfileBody data={data} />
              </View>
              <View className="mt-4 flex-row">
                <Stat value={data.miles.toLocaleString('en-US')} label="Miles" />
                <Stat value={data.points.toLocaleString('en-US')} label="Status points" />
                <Stat value={String(data.certificatesCount)} label="Certificates" />
              </View>
            </>
          ) : null}
        </HubHero>

        <QueryView query={query} loadingLabel="Loading profile">
          {(summary) => (
            <>
              <FeatureLink
                icon={<Award color="#4145B6" size={21} />}
                title="Recognition"
                detail={`${summary.badgesCount} badges · ${summary.certificatesCount} certificates · ${summary.points.toLocaleString('en-US')} points`}
                href="/account/badges"
              />
              <FeatureLink
                icon={<MessagesSquare color="#4145B6" size={21} />}
                title="Global community"
                detail={`${summary.newDiscussionsThisWeek} new discussions this week`}
                href="/community"
              />
              <FeatureLink
                icon={<Handshake color="#4145B6" size={21} />}
                title="Partners"
                detail={`${summary.partnersCount} brands, ${summary.liveCampaigns} live campaigns`}
                href="/partners"
              />

              <SectionLabel>Account</SectionLabel>
              <Card>
                <ListRow
                  icon={<UserPen color="#4145B6" size={19} />}
                  title="Edit profile"
                  onPress={() => router.push('/account/edit')}
                />
                <ListRow
                  icon={<Settings color="#4145B6" size={19} />}
                  title="Settings"
                  onPress={() => router.push('/settings')}
                />
                <ListRow
                  icon={<LifeBuoy color="#4145B6" size={19} />}
                  title="Help and support"
                  onPress={() => router.push('/support')}
                />
                <ListRow
                  icon={<Info color="#4145B6" size={19} />}
                  title="About WowMiles"
                  onPress={() => router.push('/settings/about')}
                  last
                />
              </Card>
            </>
          )}
        </QueryView>
      </ScrollView>
    </View>
  );
}
