import { apiGet, requireId } from './client';

/** Mirrors `GET /program/stats` (public). */
export type ProgramStats = { agents: number; countries: number; suppliers: number };

/** Mirrors `GET /rewards/:id/preview` (public): no stock counts, codes or provider contacts. */
export type GuestReward = {
  id: string;
  publicId: string;
  title: string;
  description: string;
  category: 'travel' | 'experiences' | 'merch';
  milesPrice: number;
  eurValue: number;
  fulfilment: 'instant_voucher' | 'provider_confirm' | 'shipped' | 'provider_site';
  minTier: 'silver' | 'gold' | 'platinum' | null;
  validityDays: number;
  howToUse: string[];
  inStock: boolean;
  /** Sample copy for the guest reward screen. */
  howAgentsEarn: { title: string; detail: string }[];
};

export type GuestPreview = { stats: ProgramStats; sampleBalance: number; rewards: GuestReward[] };

/** Illustrative balance for the guest hero; the backend has no such figure. */
const SAMPLE_BALANCE = 3390;

/** Static explainer copy for the guest reward screen (not backend data). */
const HOW_AGENTS_EARN: GuestReward['howAgentsEarn'] = [
  { title: 'Register a booking you already sold', detail: 'Approved bookings earn miles on the booking value' },
  { title: 'Or complete partner training', detail: 'Finishing an Academy course earns miles' },
];

type RewardPreview = Omit<GuestReward, 'howAgentsEarn'>;

const withCopy = (reward: RewardPreview): GuestReward => ({ ...reward, howAgentsEarn: HOW_AGENTS_EARN });

export async function getGuestPreview(): Promise<GuestPreview> {
  const [stats, rewards] = await Promise.all([
    apiGet<ProgramStats>('/program/stats'),
    apiGet<RewardPreview[]>('/rewards/preview', { limit: 6 }),
  ]);
  return { stats, sampleBalance: SAMPLE_BALANCE, rewards: rewards.map(withCopy) };
}

/** `GET /rewards/:id/preview`. */
export async function getGuestReward(id?: string): Promise<GuestReward> {
  return withCopy(await apiGet<RewardPreview>(`/rewards/${requireId(id)}/preview`));
}
