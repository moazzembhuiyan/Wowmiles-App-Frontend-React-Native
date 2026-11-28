import { mockResponse } from './client';

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

const rewards: GuestReward[] = [
  {
    id: 'lounge-pass',
    publicId: 'RW-10001',
    title: 'Airport lounge access pass',
    description:
      'Complimentary access to over 1,100 airport lounges worldwide through the Beverly Group partner network. Valid for one visit with one guest.',
    category: 'travel',
    milesPrice: 400,
    eurValue: 40,
    fulfilment: 'instant_voucher',
    minTier: null,
    validityDays: 365,
    howToUse: ['Show your voucher at a participating lounge.', 'Bring photo ID.', 'One guest may enter with you.'],
    inStock: true,
    howAgentsEarn: [
      { title: 'Register a booking you already sold', detail: 'A €2,700 hotel booking earns about 400 miles' },
      { title: 'Or complete partner training', detail: 'A full Academy course earns 300 miles' },
    ],
  },
];

export function getGuestPreview() {
  const data: GuestPreview = {
    stats: { agents: 1240, countries: 38, suppliers: 64 },
    sampleBalance: 3390,
    rewards,
  };
  return mockResponse(data);
}

export function getGuestReward(id?: string) {
  return mockResponse(rewards.find((reward) => reward.id === id) ?? rewards[0]);
}
