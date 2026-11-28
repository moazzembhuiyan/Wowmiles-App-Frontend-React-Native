import { apiGet } from './client';

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
  ladder: { key: StatusTierKey; name: string; minPoints: number; maxPoints: number | null; isCurrent: boolean; isReached: boolean }[];
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

/** `GET /me/status`. */
export function getStatus() {
  return apiGet<AgentStatus>('/me/status');
}

/** The downgrade view reads the same endpoint: `downgraded` is non-null after a tier loss. */
export function getStatusDowngraded() {
  return getStatus();
}

export type Entitlement = { id: string; tier: StatusTierKey; title: string; description: string; icon: string; order: number };

/** `GET /entitlements?tier=`: the benefits of one tier. */
export function getEntitlements(tier: StatusTierKey) {
  return apiGet<Entitlement[]>('/entitlements', { tier });
}
