export type MilesActivityType = 'Booking' | 'Academy' | 'Event' | 'Redemption' | 'Expired';

export type MilesActivity = {
  id: string;
  title: string;
  detail: string;
  miles: number;
  type: MilesActivityType;
  month: 'OCTOBER 2026' | 'SEPTEMBER 2026';
};

export const milesActivities: MilesActivity[] = [
  {
    id: 'hilton-dubai',
    title: 'Hilton Dubai — 4 nights',
    detail: 'Booking approved · 12 Oct',
    miles: 1250,
    type: 'Booking',
    month: 'OCTOBER 2026',
  },
  {
    id: 'emirates-module',
    title: 'Emirates Academy module 3',
    detail: 'Quiz passed · 10 Oct',
    miles: 500,
    type: 'Academy',
    month: 'OCTOBER 2026',
  },
  {
    id: 'lounge-pass',
    title: 'Lounge access pass',
    detail: 'Reward redeemed · 8 Oct',
    miles: -5000,
    type: 'Redemption',
    month: 'OCTOBER 2026',
  },
  {
    id: 'wtm-london',
    title: 'WTM London 2026',
    detail: 'Attendance confirmed · 4 Oct',
    miles: 350,
    type: 'Event',
    month: 'OCTOBER 2026',
  },
  {
    id: 'msc-cruises',
    title: 'MSC Cruises — Med 7 nights',
    detail: 'Booking approved · 28 Sep',
    miles: 2100,
    type: 'Booking',
    month: 'SEPTEMBER 2026',
  },
  {
    id: 'expired-miles',
    title: 'Expired miles',
    detail: 'Earned Sep 2024 · 30 Sep',
    miles: -840,
    type: 'Expired',
    month: 'SEPTEMBER 2026',
  },
];

export type NotificationCategory = 'Miles' | 'Bookings' | 'Events';

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  time: string;
  category: NotificationCategory;
  earlier?: boolean;
  icon: 'booking' | 'gift' | 'academy' | 'event' | 'warning';
};

export const appNotifications: AppNotification[] = [
  {
    id: 'booking-approved',
    title: 'Booking approved',
    message: 'Hilton Dubai — 4 nights has been approved. 1,250 miles credited.',
    time: '2 hours ago',
    category: 'Bookings',
    icon: 'booking',
  },
  {
    id: 'double-miles',
    title: 'Double miles on hotels',
    message: 'Earn 2× miles on all hotel bookings until 31 October.',
    time: '5 hours ago',
    category: 'Miles',
    icon: 'gift',
  },
  {
    id: 'new-module',
    title: 'New Emirates module',
    message: 'Emirates Premium Economy training is now live. 500 bonus miles.',
    time: '9 hours ago',
    category: 'Miles',
    icon: 'academy',
  },
  {
    id: 'wtm-check-in',
    title: 'WTM London check-in open',
    message: 'Scan your QR code at the Beverly Group stand to confirm attendance.',
    time: 'Yesterday',
    category: 'Events',
    earlier: true,
    icon: 'event',
  },
  {
    id: 'miles-expiring',
    title: '2,400 miles expiring',
    message: 'Miles earned in Dec 2024 expire on 31 December 2026.',
    time: '3 days ago',
    category: 'Miles',
    earlier: true,
    icon: 'warning',
  },
];

export function formatMiles(value: number) {
  return Math.abs(value).toLocaleString('en-US');
}
