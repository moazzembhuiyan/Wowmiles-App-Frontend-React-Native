import { mockResponse } from './client';

/** Mirrors `GET /me/status` including the T77 additions. */
export type StatusTierKey = 'silver' | 'gold' | 'platinum';

export type StatusSource = {
  sourceType: 'booking' | 'course' | 'event' | 'campaign';
  labelKey: string;
  points: number;
  count: number;
};

export type AgentStatus = {
  points: number;
  tier: StatusTierKey;
  tierName: string;
  nextTier: { key: StatusTierKey; name: string; minPoints: number } | null;
  pointsToNext: number;
  progressPct: number;
  since: string;
  breakdown: StatusSource[];
  notCounted: { count: number; points: number; miles: number };
  downgraded: {
    from: StatusTierKey;
    fromName: string;
    at: string;
    lost: { label: string; points: number }[];
    lostPoints: number;
    pointsToReturn: number;
  } | null;
  benefits: { title: string; description: string }[];
};

export const statusSourceLabels: Record<StatusSource['sourceType'], string> = {
  booking: 'Bookings',
  course: 'Academy courses',
  event: 'Events',
  campaign: 'Campaigns',
};

const current: AgentStatus = {
  points: 5240,
  tier: 'gold',
  tierName: 'Gold',
  nextTier: { key: 'platinum', name: 'Platinum Ambassador', minPoints: 8000 },
  pointsToNext: 2760,
  progressPct: 66,
  since: '2026-08-02T10:00:00.000Z',
  breakdown: [
    { sourceType: 'booking', labelKey: 'status.source.booking', points: 2840, count: 18 },
    { sourceType: 'course', labelKey: 'status.source.course', points: 1500, count: 8 },
    { sourceType: 'event', labelKey: 'status.source.event', points: 900, count: 11 },
  ],
  notCounted: { count: 4, points: 710, miles: 710 },
  downgraded: null,
  benefits: [],
};

export function getStatus() {
  return mockResponse(current);
}

export function getStatusDowngraded() {
  const data: AgentStatus = {
    ...current,
    points: 2940,
    tier: 'silver',
    tierName: 'Silver',
    nextTier: { key: 'gold', name: 'Gold', minPoints: 3000 },
    pointsToNext: 60,
    progressPct: 98,
    breakdown: [
      { sourceType: 'booking', labelKey: 'status.source.booking', points: 540, count: 17 },
      { sourceType: 'course', labelKey: 'status.source.course', points: 1500, count: 8 },
      { sourceType: 'event', labelKey: 'status.source.event', points: 900, count: 11 },
    ],
    notCounted: { count: 2, points: 320, miles: 320 },
    downgraded: {
      from: 'gold',
      fromName: 'Gold',
      at: '2026-11-06T09:00:00.000Z',
      lost: [{ label: 'Hilton Dubai', points: 300 }],
      lostPoints: 300,
      pointsToReturn: 60,
    },
  };
  return mockResponse(data);
}
