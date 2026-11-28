import { useState } from 'react';
import { router } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Info } from 'lucide-react-native';
import { Pressable, Text, TextInput, View } from 'react-native';
import { MilesScreen } from '@/components/miles-ui';
import { useToast } from '@/components/toast';
import { Avatar, Chip, FieldError, SectionLabel, goBack } from '@/components/hub/hub-ui';
import { FEED_TAGS, createFeed, type FeedTag } from '@/lib/api/community';
import { fetchProfileSummary } from '@/lib/api/profile';

type Errors = Partial<Record<'title' | 'content', string>>;

export default function NewPostScreen() {
  const showToast = useToast();
  const queryClient = useQueryClient();
  const profile = useQuery({ queryKey: ['profile', 'summary'], queryFn: fetchProfileSummary });
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState<FeedTag>('destinations');
  const [errors, setErrors] = useState<Errors>({});

  const publish = useMutation({
    mutationFn: () => createFeed({ title, content, categories: [tag] }),
    onSuccess: (post) => {
      void queryClient.invalidateQueries({ queryKey: ['community'] });
      showToast('Post published', undefined, 'success');
      router.replace({ pathname: '/community/[id]', params: { id: post.id } });
    },
    onError: (error) => showToast('Could not publish', error.message),
  });

  function submit() {
    const found: Errors = {};
    if (!title.trim()) found.title = 'Add a title.';
    else if (title.trim().length > 200) found.title = 'Title must be 200 characters or fewer.';
    if (!content.trim()) found.content = 'Write something to share.';
    else if (content.trim().length > 10000) found.content = 'Post is too long.';
    setErrors(found);
    if (Object.keys(found).length === 0) publish.mutate();
  }

  const name = profile.data?.profile.name ?? 'You';

  return (
    <MilesScreen>
      <View className="mb-4 flex-row items-center pt-3">
        <Pressable
          accessibilityRole="button"
          onPress={() => goBack('/community')}
          className="h-10 w-10 items-center justify-center rounded-full"
          hitSlop={8}
        >
          <Text className="text-[22px] text-ink">{'←'}</Text>
        </Pressable>
        <Text className="flex-1 text-center text-[17px] font-semibold text-ink">New post</Text>
        <Pressable
          accessibilityRole="button"
          disabled={publish.isPending}
          onPress={submit}
          hitSlop={8}
          className="disabled:opacity-50"
        >
          <Text className="text-[16px] font-semibold text-brand">{publish.isPending ? 'Posting' : 'Post'}</Text>
        </Pressable>
      </View>

      <View className="mb-4 flex-row items-center">
        <Avatar name={name} size={40} />
        <View className="ml-3">
          <Text className="text-[15px] font-medium text-ink">{name}</Text>
          <Text className="text-[12px] text-muted">Posting to Global community</Text>
        </View>
      </View>

      <TextInput
        accessibilityLabel="Title"
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        placeholderTextColor="#A4AAB5"
        maxLength={200}
        className="mb-3 h-[54px] rounded-[14px] border border-brand bg-white px-4 text-[16px] text-ink"
      />
      <FieldError message={errors.title} />
      <TextInput
        accessibilityLabel="Post content"
        value={content}
        onChangeText={setContent}
        placeholder="Share your question or experience"
        placeholderTextColor="#A4AAB5"
        multiline
        textAlignVertical="top"
        maxLength={10000}
        className="min-h-[160px] rounded-[14px] border border-line bg-white px-4 py-3 text-[15px] leading-[22px] text-ink"
      />
      <FieldError message={errors.content} />

      <SectionLabel>Add a tag</SectionLabel>
      <View className="flex-row flex-wrap">
        {FEED_TAGS.map((item) => (
          <Chip key={item.key} label={item.label} selected={tag === item.key} onPress={() => setTag(item.key)} />
        ))}
      </View>

      <View className="mt-4 flex-row items-start">
        <Info color="#7C8494" size={16} />
        <Text className="ml-3 flex-1 text-[13px] leading-[19px] text-muted">
          Keep client names and booking references out of public posts.
        </Text>
      </View>
    </MilesScreen>
  );
}
