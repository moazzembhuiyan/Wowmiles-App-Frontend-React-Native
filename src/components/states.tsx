import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { AlertCircle, Inbox } from 'lucide-react-native';
import type { UseQueryResult } from '@tanstack/react-query';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <View className="items-center justify-center py-16" accessibilityRole="progressbar">
      <ActivityIndicator color="#4145B6" />
      <Text className="mt-3 text-[13px] text-muted">{label}</Text>
    </View>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View className="items-center rounded-[18px] border border-line bg-white px-7 py-10">
      <Inbox color="#7C8494" size={28} />
      <Text className="mt-3 text-center text-[15px] font-semibold text-ink">{title}</Text>
      {description ? (
        <Text className="mt-1 text-center text-[13px] leading-[19px] text-muted">{description}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} className="mt-4 rounded-full bg-brand px-5 py-2.5">
          <Text className="text-[13px] font-semibold text-white">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <View className="items-center rounded-[18px] border border-[#F3C9CF] bg-[#FFF5F6] px-7 py-10">
      <AlertCircle color="#B62D3E" size={28} />
      <Text className="mt-3 text-center text-[14px] leading-[20px] text-ink">{message}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} className="mt-4 rounded-full border border-line bg-white px-5 py-2.5">
          <Text className="text-[13px] font-semibold text-brand">Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/**
 * Renders the loading / error / empty state of a query, or the children with its data.
 * `isEmpty` decides when loaded data counts as empty (default: empty array).
 */
export function QueryView<T>({
  query,
  children,
  empty,
  isEmpty = (data: T) => Array.isArray(data) && data.length === 0,
  loadingLabel,
}: {
  query: UseQueryResult<T>;
  children: (data: T) => React.ReactNode;
  empty?: React.ReactNode;
  isEmpty?: (data: T) => boolean;
  loadingLabel?: string;
}) {
  if (query.isPending) return <LoadingState label={loadingLabel} />;
  if (query.isError) {
    return <ErrorState message={query.error.message} onRetry={() => void query.refetch()} />;
  }
  if (empty && isEmpty(query.data)) return <>{empty}</>;
  return <>{children(query.data)}</>;
}
