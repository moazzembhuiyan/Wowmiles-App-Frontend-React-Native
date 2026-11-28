import { useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, CheckCircle2, CircleHelp } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { QueryView } from '@/components/states';
import { getNotifications, markNotificationRead, timeAgo } from '@/lib/api/notifications';
import { MilesHeader, MilesScreen } from '@/components/miles-ui';

export default function NotificationDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const query = useQuery({ queryKey: ['notifications'], queryFn: getNotifications });
  const notification = query.data?.find((item) => item.id === id);
  const needsRead = !!notification && !notification.read;

  useEffect(() => {
    if (id && needsRead) void markNotificationRead(id).catch(() => undefined);
  }, [id, needsRead]);

  return (
    <QueryView query={query}>
      {() =>
        notification ? (
          <MilesScreen>
            <MilesHeader title="Notifications" />
            <View className="mb-5 items-center rounded-[18px] bg-white px-5 py-6">
              <View className="h-14 w-14 items-center justify-center rounded-full bg-[#E8F7F0]">
                {notification.icon === 'booking' ? <CheckCircle2 color="#2A9A6A" size={27} /> : <ArrowUpRight color="#4145B6" size={25} />}
              </View>
              <Text className="mt-4 text-center text-[20px] font-bold text-ink">{notification.title}</Text>
              <View className="mt-2 rounded-full bg-[#E8F7F0] px-3 py-1">
                <Text className="text-[13px] font-semibold text-[#23875D]">{notification.category}</Text>
              </View>
              {notification.message ? (
                <Text className="mt-4 text-center text-[13px] leading-[21px] text-muted">{notification.message}</Text>
              ) : null}
            </View>
            <Text className="mb-5 text-center text-[12px] text-muted">{timeAgo(notification.date)}</Text>
          </MilesScreen>
        ) : (
          <MilesScreen>
            <MilesHeader title="Notification" />
            <View className="items-center rounded-[16px] bg-white px-6 py-10">
              <CircleHelp color="#4145B6" size={28} />
              <Text className="mt-3 text-[15px] font-semibold text-ink">Notification not found</Text>
              <Text className="mt-1 text-center text-[12px] leading-[18px] text-muted">
                This update may have been removed. Go back to see your latest notifications.
              </Text>
            </View>
          </MilesScreen>
        )
      }
    </QueryView>
  );
}
