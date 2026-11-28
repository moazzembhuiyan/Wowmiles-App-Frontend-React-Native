import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Star } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { MilesScreen } from '@/components/miles-ui';
import { QueryView } from '@/components/states';
import { Avatar, HubHero, SectionLabel, goBack, timeAgo } from '@/components/hub/hub-ui';
import { fetchPublicAgent, type PublicAgent } from '@/lib/api/profile';

function HeroStat({ value, label }: { value: number; label: string }) {
  return (
    <View className="mr-2 flex-1 items-center rounded-[14px] border border-white/20 bg-white/15 py-3">
      <Text className="text-[20px] font-bold text-white">{value}</Text>
      <Text className="mt-0.5 text-[12px] text-[#D8DAF2]">{label}</Text>
    </View>
  );
}

function AgentBody({ agent }: { agent: PublicAgent }) {
  return (
    <>
      <SectionLabel>Specialises in</SectionLabel>
      {agent.specialties.length ? (
        <View className="flex-row flex-wrap">
          {agent.specialties.map((item) => (
            <View key={item.key} className="mb-2 mr-2 rounded-full border border-line bg-white px-3.5 py-2">
              <Text className="text-[13px] font-medium text-ink">{item.name}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text className="text-[14px] text-muted">No specialities listed.</Text>
      )}

      <SectionLabel>Recent posts</SectionLabel>
      {agent.recentPosts.length ? (
        agent.recentPosts.map((post) => (
          <Pressable
            key={post.id}
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/community/[id]', params: { id: post.id } })}
            className="flex-row items-center border-b border-line py-3.5"
          >
            <View className="flex-1">
              <Text className="text-[16px] text-ink">{post.title}</Text>
              <Text className="mt-0.5 text-[13px] text-muted">
                {post.repliesCount} replies {'·'} {timeAgo(post.createdAt)}
              </Text>
            </View>
            <ChevronRight color="#9AA1B0" size={18} />
          </Pressable>
        ))
      ) : (
        <Text className="text-[14px] text-muted">No posts yet.</Text>
      )}
    </>
  );
}

export default function AgentProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useQuery({ queryKey: ['agents', 'public', id], queryFn: () => fetchPublicAgent(id) });
  const agent = query.data;

  return (
    <MilesScreen fullBleedTop>
      <HubHero title={agent?.name ?? 'Agent'} onBack={() => goBack('/community')}>
        {agent ? (
          <>
            <View className="mt-4 flex-row items-center">
              <Avatar name={agent.name} size={64} dark />
              <View className="ml-3 flex-1">
                <Text className="text-[13px] text-[#D8DAF2]">
                  {agent.agency}
                  {agent.city ? ` · ${agent.city}` : ''}
                </Text>
                <View className="mt-1.5 flex-row items-center self-start rounded-full bg-[#6B5BD1] px-2.5 py-1">
                  <Star color="white" size={12} />
                  <Text className="ml-1 text-[11px] font-bold tracking-[0.4px] text-white">
                    {agent.tier.name.toUpperCase()} AMBASSADOR
                  </Text>
                </View>
              </View>
            </View>
            <View className="mt-4 flex-row">
              <HeroStat value={agent.badgesCount} label="Badges" />
              <HeroStat value={agent.certificatesCount} label="Certificates" />
              <HeroStat value={agent.postsCount} label="Posts" />
            </View>
          </>
        ) : null}
      </HubHero>
      <QueryView query={query} loadingLabel="Loading profile">
        {(data) => <AgentBody agent={data} />}
      </QueryView>
    </MilesScreen>
  );
}
