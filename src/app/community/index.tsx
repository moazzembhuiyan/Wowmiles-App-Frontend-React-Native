import { useState } from 'react';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { EmptyState, QueryView } from '@/components/states';
import { PostCard } from '@/components/hub/community-ui';
import { Chip, HubHero, goBack } from '@/components/hub/hub-ui';
import { FEED_TAGS, fetchFeeds, type FeedSort, type FeedTag } from '@/lib/api/community';

export default function CommunityScreen() {
  const [sort, setSort] = useState<FeedSort>('latest');
  const [tag, setTag] = useState<FeedTag | null>(null);
  const query = useQuery({ queryKey: ['community', 'feeds', sort, tag], queryFn: () => fetchFeeds({ sort, tag }) });

  return (
    <View className="w-full max-w-[440px] flex-1 self-center bg-canvas">
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
      >
        <HubHero
          title="Global community"
          subtitle={
            query.data
              ? `${query.data.communitySize.agents.toLocaleString('en-US')} agents across ${query.data.communitySize.countries} countries`
              : undefined
          }
          onBack={() => goBack('/(tabs)/profile')}
        />

        <View className="mb-2 flex-row flex-wrap">
          <Chip
            label="Latest"
            selected={sort === 'latest' && tag === null}
            onPress={() => {
              setSort('latest');
              setTag(null);
            }}
          />
          <Chip
            label="Popular"
            selected={sort === 'popular' && tag === null}
            onPress={() => {
              setSort('popular');
              setTag(null);
            }}
          />
          {FEED_TAGS.filter((item) => item.key === 'destinations' || item.key === 'suppliers').map((item) => (
            <Chip
              key={item.key}
              label={item.label}
              selected={tag === item.key}
              onPress={() => {
                setSort('latest');
                setTag(tag === item.key ? null : item.key);
              }}
            />
          ))}
        </View>

        <QueryView
          query={query}
          loadingLabel="Loading discussions"
          isEmpty={(data) => data.posts.length === 0}
          empty={
            <EmptyState
              title="No discussions yet"
              description="Be the first to start one."
              actionLabel="New post"
              onAction={() => router.push('/community/new')}
            />
          }
        >
          {(data) => data.posts.map((post) => <PostCard key={post.id} post={post} />)}
        </QueryView>
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="New post"
        onPress={() => router.push('/community/new')}
        className="absolute bottom-8 right-5 h-[56px] w-[56px] items-center justify-center rounded-full bg-[#F5B21F] shadow-lg active:opacity-80"
      >
        <Plus color="#11151F" size={26} />
      </Pressable>
    </View>
  );
}
