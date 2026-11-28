import { apiRequest, queryClient, requireId } from './client';

export type NotificationCategory = 'Miles' | 'Bookings' | 'Events' | 'Academy' | 'Account' | 'Promo' | 'Community';
export type NotificationIcon = 'booking' | 'gift' | 'academy' | 'event' | 'warning';

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  /** ISO date the notification was created. */
  date: string;
  category: NotificationCategory;
  read: boolean;
  icon: NotificationIcon;
};

/** Mirrors an item of `GET /notification` (`message` is the title, `description` the body). */
type RawNotification = {
  id?: string;
  _id?: string;
  message: string;
  description?: string;
  category: string;
  read: boolean;
  date?: string;
};

const CATEGORY: Record<string, { label: NotificationCategory; icon: NotificationIcon }> = {
  miles: { label: 'Miles', icon: 'gift' },
  bookings: { label: 'Bookings', icon: 'booking' },
  events: { label: 'Events', icon: 'event' },
  academy: { label: 'Academy', icon: 'academy' },
  account: { label: 'Account', icon: 'warning' },
  promo: { label: 'Promo', icon: 'gift' },
  community: { label: 'Community', icon: 'event' },
};

function toNotification(raw: RawNotification): AppNotification {
  const style = CATEGORY[raw.category] ?? CATEGORY.account;
  return {
    id: String(raw.id ?? raw._id),
    title: raw.message,
    message: raw.description ?? '',
    date: raw.date ?? new Date().toISOString(),
    category: style.label,
    read: raw.read,
    icon: style.icon,
  };
}

/** `GET /notification`: newest first. */
export async function getNotifications(): Promise<AppNotification[]> {
  const res = await apiRequest<RawNotification[]>('/notification', { query: { limit: 100, sort: '-date' } });
  return res.data.map(toNotification);
}

function refreshNotifications() {
  void queryClient.invalidateQueries({ queryKey: ['notifications'] });
  void queryClient.invalidateQueries({ queryKey: ['home'] });
}

/** `PATCH /notification/:id/read`. */
export async function markNotificationRead(id: string) {
  await apiRequest(`/notification/${requireId(id)}/read`, { method: 'PATCH' });
  refreshNotifications();
}

/** `PATCH /notification`: marks every notification as read. */
export async function markAllNotificationsRead() {
  await apiRequest('/notification', { method: 'PATCH' });
  refreshNotifications();
}

/** "2 hours ago" style label. */
export function timeAgo(iso: string, now = Date.now()) {
  const minutes = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
