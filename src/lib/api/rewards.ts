import { Gift, Plane, Star, type LucideIcon } from 'lucide-react-native';
import { apiGet, apiRequest, requireId } from './client';

export type Fulfilment = 'instant_voucher' | 'provider_confirm' | 'shipped' | 'provider_site';
export type RewardCategory = 'Travel' | 'Experiences' | 'Merch';

export type RequiredInfo = {
  preferredDate: boolean;
  secondChoiceDate: boolean;
  endDate: boolean;
  guests: boolean;
  pickup: boolean;
  notes: boolean;
};

/** Mirrors an item of `GET /rewards` (and `GET /rewards/:id`); `milesPrice` is the caller's tier price. */
type RawReward = {
  id: string;
  title: string;
  description: string;
  category: 'travel' | 'experiences' | 'merch';
  milesPrice: number;
  fulfilment: Fulfilment;
  allowMilesCash: boolean;
  minMilesForCash: number;
  minTier: string | null;
  howToUse: string[];
  inStock: boolean;
  partner: { id: string; name: string } | null;
  providerName: string;
  locked: boolean;
  affordable: boolean;
  included: string[];
  requiredInfo: Partial<RequiredInfo>;
};

export type Reward = {
  id: string;
  title: string;
  description: string;
  category: RewardCategory;
  /** Miles price for the caller's tier. */
  cost: number;
  fulfilment: Fulfilment;
  allowMilesCash: boolean;
  minMilesForCash: number;
  providerName: string;
  /** Tier required to redeem, when the caller's tier is below it. */
  lockedTier: string | null;
  locked: boolean;
  affordable: boolean;
  inStock: boolean;
  benefits: string[];
  usageSteps: string[];
  requiredInfo: RequiredInfo;
  Icon: LucideIcon;
  color: readonly [string, string];
};

const CATEGORY: Record<RawReward['category'], { label: RewardCategory; Icon: LucideIcon; color: readonly [string, string] }> = {
  travel: { label: 'Travel', Icon: Plane, color: ['#4557B7', '#202B74'] },
  experiences: { label: 'Experiences', Icon: Star, color: ['#E8AD28', '#BB731C'] },
  merch: { label: 'Merch', Icon: Gift, color: ['#777E8A', '#454A55'] },
};

const capitalise = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

function toReward(raw: RawReward): Reward {
  const style = CATEGORY[raw.category] ?? CATEGORY.travel;
  const info = raw.requiredInfo ?? {};
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    category: style.label,
    cost: raw.milesPrice,
    fulfilment: raw.fulfilment,
    allowMilesCash: raw.allowMilesCash,
    minMilesForCash: raw.minMilesForCash,
    providerName: raw.providerName || raw.partner?.name || 'WowMiles',
    lockedTier: raw.locked && raw.minTier ? capitalise(raw.minTier) : null,
    locked: raw.locked,
    affordable: raw.affordable,
    inStock: raw.inStock,
    benefits: raw.included ?? [],
    usageSteps: raw.howToUse ?? [],
    requiredInfo: {
      preferredDate: info.preferredDate ?? false,
      secondChoiceDate: info.secondChoiceDate ?? false,
      endDate: info.endDate ?? false,
      guests: info.guests ?? false,
      pickup: info.pickup ?? false,
      notes: info.notes ?? false,
    },
    Icon: style.Icon,
    color: style.color,
  };
}

export function needsRequestDetails(reward: Pick<Reward, 'requiredInfo'>) {
  return Object.values(reward.requiredInfo).some(Boolean);
}

/** `GET /rewards`: published rewards with the caller's tier price, and the caller's available miles. */
export async function getRewards(): Promise<{ items: Reward[]; available: number }> {
  const res = await apiRequest<RawReward[]>('/rewards', { query: { limit: 100 } });
  const available = (res.meta as { available?: number } | undefined)?.available ?? 0;
  return { items: res.data.map(toReward), available };
}

/** `GET /rewards/:id`. */
export async function getReward(id: string): Promise<Reward> {
  return toReward(await apiGet<RawReward>(`/rewards/${requireId(id)}`));
}

/** Mirrors `GET /rewards/:id/availability` (provider_confirm rewards only). */
export type RewardAvailability = {
  timezone: string;
  noticeHours: number;
  days: { date: string; available: boolean; reason: 'closed' | 'blocked' | 'notice' | 'too_far' | 'full' | null; remaining: number | null }[];
};

const REASON_TEXT: Record<NonNullable<RewardAvailability['days'][number]['reason']>, string> = {
  closed: 'The provider is closed that day.',
  blocked: 'The provider is not available that day.',
  notice: 'That is too soon. The provider needs more notice.',
  too_far: 'That is too far ahead to book.',
  full: 'That day is fully booked.',
};

/** `GET /rewards/:id/availability`, for the next 60 days. */
export function getRewardAvailability(id: string) {
  const from = new Date();
  const to = new Date(from.getTime() + 60 * 86_400_000);
  const day = (date: Date) => date.toISOString().slice(0, 10);
  return apiGet<RewardAvailability>(`/rewards/${requireId(id)}/availability`, { from: day(from), to: day(to) });
}

/** Why a date cannot be requested, or null when it is open or outside the loaded window (the server decides). */
export function unavailableReason(availability: RewardAvailability | undefined, date: string) {
  const entry = availability?.days.find((item) => item.date === date);
  return entry && !entry.available && entry.reason ? REASON_TEXT[entry.reason] : null;
}

/** First open day, for a hint under the date field. */
export function firstAvailableDate(availability: RewardAvailability | undefined) {
  return availability?.days.find((item) => item.available)?.date ?? null;
}
