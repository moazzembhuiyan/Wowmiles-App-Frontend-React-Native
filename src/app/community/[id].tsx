import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react-native';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState, QueryView } from '@/components/states';
import { useToast } from '@/components/toast';
import { PostCard, ReplyCard } from '@/components/hub/community-ui';
import { Chip, ComposerBar, FormButton, goBack } from '@/components/hub/hub-ui';
import {
  REPORT_REASONS,
  addComment,
  fetchComments,
  fetchFeed,
  reportContent,
  type FeedPost,
  type ReportReason,
} from '@/lib/api/community';

type ReportTarget = { targetType: 'feed' | 'comment'; targetId: string };

function ReportSheet({ target, onClose }: { target: ReportTarget | null; onClose: () => void }) {
  const showToast = useToast();
  const [reason, setReason] = useState<ReportReason | null>(null);

  const report = useMutation({
    mutationFn: () => reportContent({ ...(target as ReportTarget), reason: reason as ReportReason }),
    onSuccess: () => {
      showToast('Report sent', 'Thank you. Our team will review it.', 'success');
      setReason(null);
      onClose();
    },
    onError: (error) => showToast('Could not send report', error.message),
  });

  return (
    <Modal visible={target !== null} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable accessibilityLabel="Close" className="flex-1 bg-black/40" onPress={onClose} />
      <View className="w-full max-w-[440px] self-center rounded-t-[24px] bg-white px-5 pb-8 pt-5">
        <Text className="text-[18px] font-semibold text-ink">Report this {target?.targetType === 'feed' ? 'post' : 'reply'}</Text>
        <Text className="mb-4 mt-1 text-[13px] text-muted">Tell us what is wrong.</Text>
        <View className="mb-3 flex-row flex-wrap">
          {REPORT_REASONS.map((item) => (
            <Chip key={item.key} label={item.label} selected={reason === item.key} onPress={() => setReason(item.key)} />
          ))}
        </View>
        <FormButton title="Send report" disabled={!reason} pending={report.isPending} onPress={() => report.mutate()} />
        <FormButton title="Cancel" tone="outline" className="mt-3" onPress={onClose} />
      </View>
    </Modal>
  );
}

function Thread({ post }: { post: FeedPost }) {
  const showToast = useToast();
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [target, setTarget] = useState<ReportTarget | null>(null);
  const comments = useQuery({ queryKey: ['community', 'comments', post.id], queryFn: () => fetchComments(post.id) });

  const reply = useMutation({
    mutationFn: () => addComment(post.id, text),
    onSuccess: () => {
      setText('');
      void queryClient.invalidateQueries({ queryKey: ['community'] });
    },
    onError: (error) => showToast('Reply not sent', error.message),
  });

  return (
    <>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <PostCard
          post={post}
          expanded
          onMore={post.isOwn ? undefined : () => setTarget({ targetType: 'feed', targetId: post.id })}
        />
        <Text className="mb-2 mt-2 text-[12px] font-semibold tracking-[0.6px] text-muted">
          {post.repliesCount} {post.repliesCount === 1 ? 'REPLY' : 'REPLIES'}
        </Text>
        <QueryView
          query={comments}
          loadingLabel="Loading replies"
          empty={<EmptyState title="No replies yet" description="Add the first reply." />}
        >
          {(list) =>
            list.map((comment) => (
              <ReplyCard
                key={comment.id}
                comment={comment}
                onMore={comment.isOwn ? undefined : () => setTarget({ targetType: 'comment', targetId: comment.id })}
              />
            ))
          }
        </QueryView>
      </ScrollView>
      <ComposerBar
        value={text}
        onChangeText={setText}
        onSend={() => reply.mutate()}
        placeholder="Add a reply"
        pending={reply.isPending}
      />
      <ReportSheet target={target} onClose={() => setTarget(null)} />
    </>
  );
}

export default function ThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useQuery({ queryKey: ['community', 'feed', id], queryFn: () => fetchFeed(id) });

  return (
    <SafeAreaView edges={['top', 'bottom']} className="w-full max-w-[440px] flex-1 self-center bg-canvas">
      <View className="flex-row items-center px-5 pb-2 pt-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => goBack('/community')}
          className="h-10 w-10 items-center justify-center rounded-full border border-line bg-white"
        >
          <ArrowLeft color="#252B3A" size={20} />
        </Pressable>
        <Text className="flex-1 pr-10 text-center text-[17px] font-semibold text-ink">Discussion</Text>
      </View>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <QueryView query={query} loadingLabel="Loading discussion">
          {(post) => <Thread post={post} />}
        </QueryView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
