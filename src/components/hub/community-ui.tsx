import { router } from 'expo-router';
import { Eye, MessageCircle, MoreVertical } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import type { FeedAuthor, FeedComment, FeedPost } from '@/lib/api/community';
import { tagLabel } from '@/lib/api/community';
import { Avatar, TagPill, TierBadge, timeAgo } from './hub-ui';

export function AuthorRow({
  author,
  createdAt,
  size = 40,
  onMore,
}: {
  author: FeedAuthor;
  createdAt: string;
  size?: number;
  onMore?: () => void;
}) {
  return (
    <View className="flex-row items-center">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${author.name}, view profile`}
        onPress={() => router.push({ pathname: '/agent/[id]', params: { id: author.id } })}
        className="flex-1 flex-row items-center"
      >
        <Avatar name={author.name} size={size} />
        <View className="ml-3 flex-1">
          <View className="flex-row flex-wrap items-center">
            <Text className="mr-2 text-[15px] font-medium text-ink">{author.name}</Text>
            <TierBadge tier={author.tier.key} label={author.tier.name} />
          </View>
          <Text className="mt-0.5 text-[12px] text-muted">
            {author.city ? `${author.city} · ` : ''}
            {timeAgo(createdAt)}
          </Text>
        </View>
      </Pressable>
      {onMore ? (
        <Pressable accessibilityRole="button" accessibilityLabel="More options" onPress={onMore} hitSlop={10} className="p-1">
          <MoreVertical color="#7C8494" size={18} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function PostStats({ post }: { post: Pick<FeedPost, 'repliesCount' | 'viewsCount'> }) {
  return (
    <View className="mt-3 flex-row items-center border-t border-[#F0F1F5] pt-3">
      <MessageCircle color="#7C8494" size={15} />
      <Text className="ml-1.5 mr-5 text-[13px] text-muted">{post.repliesCount} replies</Text>
      <Eye color="#7C8494" size={15} />
      <Text className="ml-1.5 text-[13px] text-muted">{post.viewsCount} views</Text>
    </View>
  );
}

export function PostCard({ post, expanded = false, onMore }: { post: FeedPost; expanded?: boolean; onMore?: () => void }) {
  const body = (
    <>
      <AuthorRow author={post.author} createdAt={post.createdAt} onMore={onMore} />
      <Text className="mt-3 text-[17px] font-semibold leading-[23px] text-ink">{post.title}</Text>
      <Text numberOfLines={expanded ? undefined : 3} className="mt-1.5 text-[14px] leading-[21px] text-muted">
        {post.content}
      </Text>
      {post.categories.length ? (
        <View className="mt-3 flex-row flex-wrap">
          {post.categories.map((tag) => (
            <View key={tag} className="mr-2">
              <TagPill label={tagLabel(tag)} />
            </View>
          ))}
        </View>
      ) : null}
      <PostStats post={post} />
    </>
  );

  if (expanded) return <View className="mb-3 rounded-[16px] border border-line bg-white p-4">{body}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={post.title}
      onPress={() => router.push({ pathname: '/community/[id]', params: { id: post.id } })}
      className="mb-3 rounded-[16px] border border-line bg-white p-4 active:opacity-80"
    >
      {body}
    </Pressable>
  );
}

export function ReplyCard({ comment, onMore }: { comment: FeedComment; onMore?: () => void }) {
  return (
    <View className="mb-3 rounded-[16px] border border-line bg-white p-4">
      <AuthorRow author={comment.author} createdAt={comment.createdAt} size={34} onMore={onMore} />
      <Text className="mt-2.5 text-[14px] leading-[21px] text-muted">{comment.content}</Text>
    </View>
  );
}
