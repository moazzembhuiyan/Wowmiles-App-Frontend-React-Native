import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Bell, BookOpen, CalendarDays, CheckCircle2, Gift, TriangleAlert } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { QueryView } from '@/components/states';
import { getNotifications, markAllNotificationsRead, markNotificationRead, timeAgo, type AppNotification, type NotificationCategory } from '@/lib/api/notifications';
import { MilesHeader, MilesScreen, Pill } from '@/components/miles-ui';

type NotificationTab = 'All' | NotificationCategory;

function NotificationIcon({ notification }: { notification: AppNotification }) {
  switch (notification.icon) {
    case 'booking':
      return <CheckCircle2 color="#2A9A6A" size={19} />;
    case 'gift':
      return <Gift color="#B9851C" size={19} />;
    case 'academy':
      return <BookOpen color="#4145B6" size={19} />;
    case 'event':
      return <CalendarDays color="#4145B6" size={19} />;
    case 'warning':
      return <TriangleAlert color="#B9851C" size={19} />;
  }
}

const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();

export default function NotificationsScreen() {
  const [tab, setTab] = useState<NotificationTab>('All');
  const query = useQuery({ queryKey: ['notifications'], queryFn: getNotifications });
  const unreadCount = (query.data ?? []).filter((notification) => !notification.read).length;

  const notifications = useMemo(
    () => (query.data ?? []).filter((notification) => tab === 'All' || notification.category === tab),
    [query.data, tab],
  );

  function openNotification(notification: AppNotification) {
    if (!notification.read) void markNotificationRead(notification.id).catch(() => undefined);
    router.push({ pathname: '/notification-detail', params: { id: notification.id } });
  }

  return (
    <MilesScreen>
      <MilesHeader
        title="Notifications"
        action={unreadCount ? 'Mark all read' : undefined}
        onAction={() => void markAllNotificationsRead().catch(() => undefined)}
      />
      {unreadCount ? (
        <Text className="-mt-3 mb-3 text-[13px] text-[#747B8B]">{unreadCount} unread</Text>
      ) : null}

      <View className="mb-4 flex-row">
        {(['All', 'Miles', 'Bookings', 'Events'] as const).map((item) => (
          <Pill key={item} label={item} selected={tab === item} onPress={() => setTab(item)} />
        ))}
      </View>

      <QueryView query={query}>
        {() =>
          notifications.length ? (
        <>
          {(['Today', 'Earlier'] as const).map((period) => {
            const group = notifications.filter((notification) =>
              period === 'Earlier' ? !isToday(notification.date) : isToday(notification.date),
            );
            if (!group.length) return null;

            return (
              <View key={period} className="mb-4">
                <Text className="mb-2 text-[12px] font-medium tracking-[0.4px] text-muted">{period.toUpperCase()}</Text>
                <View className="overflow-hidden rounded-[16px] bg-white px-3.5">
                  {group.map((notification, index) => {
                    const isUnread = !notification.read;
                    return (
                      <Pressable
                        key={notification.id}
                        accessibilityRole="button"
                        accessibilityLabel={`${notification.title}. ${notification.message}. ${isUnread ? 'Unread' : 'Read'}`}
                        onPress={() => openNotification(notification)}
                        className={`min-h-[96px] flex-row items-start py-3.5 ${index < group.length - 1 ? 'border-b border-[#F0F1F5]' : ''}`}
                      >
                        <View className={`mr-3 h-9 w-9 items-center justify-center rounded-[11px] ${notification.icon === 'booking' ? 'bg-[#E8F7F0]' : notification.icon === 'gift' || notification.icon === 'warning' ? 'bg-[#FCF4DF]' : 'bg-[#F1F1FB]'}`}>
                          <NotificationIcon notification={notification} />
                        </View>
                        <View className="flex-1">
                          <Text className="text-[15px] font-semibold text-ink">{notification.title}</Text>
                          <Text className="mt-1 text-[13px] leading-[19px] text-muted">{notification.message}</Text>
                          <Text className="mt-1 text-[12px] text-muted">{timeAgo(notification.date)}</Text>
                        </View>
                        {isUnread ? <View className="ml-2 mt-1.5 h-2 w-2 rounded-full bg-brand" /> : null}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </>
      ) : (
        <View className="mt-8 items-center rounded-[16px] bg-white px-6 py-10">
          <Bell color="#4145B6" size={27} />
          <Text className="mt-3 text-[17px] font-semibold text-ink">No notifications yet</Text>
          <Text className="mt-1 text-center text-[14px] leading-[20px] text-muted">
            Updates about your miles, bookings and events will appear here.
          </Text>
        </View>
      )
        }
      </QueryView>
    </MilesScreen>
  );
}
