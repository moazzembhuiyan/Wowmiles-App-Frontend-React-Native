import { apiGet } from './client';
import { getWalletLedger, toLedgerRow, type LedgerItem } from './wallet';

export type MilesActivityType = 'Booking' | 'Academy' | 'Event' | 'Redemption' | 'Other';

export type MilesActivity = {
  id: string;
  title: string;
  detail: string;
  miles: number;
  type: MilesActivityType;
  /** Group heading such as `OCTOBER 2026`. */
  month: string;
};

function activityType(item: Pick<LedgerItem, 'type' | 'sourceType'>): MilesActivityType {
  if (item.type === 'spend' || item.sourceType.startsWith('redemption')) return 'Redemption';
  switch (item.sourceType) {
    case 'booking':
      return 'Booking';
    case 'course':
      return 'Academy';
    case 'event':
      return 'Event';
    default:
      return 'Other';
  }
}

export function toActivity(item: LedgerItem): MilesActivity {
  const row = toLedgerRow(item);
  return { id: row.id, title: row.label, detail: row.detail, miles: row.amount, type: activityType(item), month: row.month };
}

/** `48,500` (absolute value, thousands separators). */
export const formatMiles = (value: number) => Math.abs(value).toLocaleString('en-US');

/** `+1,250` / `−300`. */
export const formatSignedMiles = (value: number) => `${value > 0 ? '+' : '−'}${formatMiles(value)}`;

/** Groups activity rows under their month heading, keeping the incoming (newest first) order. */
export function groupByMonth(items: MilesActivity[]) {
  const groups = new Map<string, MilesActivity[]>();
  for (const item of items) groups.set(item.month, [...(groups.get(item.month) ?? []), item]);
  return [...groups.entries()];
}

export type HistoryRange = 'Last 30 days' | 'Last 3 months' | 'This year' | 'All time';

function rangeStart(range: HistoryRange): string | undefined {
  const now = new Date();
  if (range === 'Last 30 days') return new Date(now.getTime() - 30 * 86_400_000).toISOString();
  if (range === 'Last 3 months') return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 3, now.getUTCDate())).toISOString();
  if (range === 'This year') return new Date(Date.UTC(now.getUTCFullYear(), 0, 1)).toISOString();
  return undefined;
}

/** `GET /me/wallet/ledger`: newest first, for the miles and history screens. */
export async function getMilesActivity(input: { type?: 'all' | 'earned' | 'redeemed'; range?: HistoryRange; limit?: number } = {}) {
  const res = await getWalletLedger({ type: input.type ?? 'all', limit: input.limit ?? 100, ...(input.range && rangeStart(input.range) ? { from: rangeStart(input.range) } : {}) });
  return res.items.map(toActivity);
}

/** Mirrors `GET /me/home`. */
export type Home = {
  user: { name: string; avatar: string | null };
  wallet: { available: number };
  status: { tier: string; tierName: string; points: number; pointsToNext: number; progressPct: number };
  promo: { campaignId: string; title: string; description: string; multiplier: number; endsAt: string; partner: { id: string; name: string } } | null;
  recentActivity: MilesActivity[];
  unreadNotifications: number;
};

type RawHome = Omit<Home, 'recentActivity'> & { recentActivity: LedgerItem[] };

/** `GET /me/home`. */
export async function getHome(): Promise<Home> {
  const raw = await apiGet<RawHome>('/me/home');
  return { ...raw, recentActivity: raw.recentActivity.map(toActivity) };
}
