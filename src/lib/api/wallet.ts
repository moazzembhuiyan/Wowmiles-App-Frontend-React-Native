import { mockResponse } from './client';

/** Mirrors `GET /me/wallet`. `supplier: null` is the platform bucket. */
export type WalletSupplier = { id: string; name: string; avatar: string | null };

export type Wallet = {
  ownerType: 'user';
  /** Agency wallet label shown on the wallet screen. */
  agency?: { name: string; authorisedUsers: number };
  available: number;
  pending: number;
  reserved: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  eurValue: { available: number };
  earnedThisYear: number;
  earnedThisYearEurValue: number;
  pendingBookingsCount: number;
  reservedFor: { redemptionId: string; title: string; miles: number }[];
  bySupplier: { supplier: WalletSupplier | null; available: number; pending: number; eurValue: number }[];
};

/** Mirrors the `reversal` object of a `reverse` ledger item (`GET /me/wallet/ledger`, `GET /booking-claims/:id`). */
export type WalletReversal = {
  id: string;
  label: string;
  reversedAt: string;
  reversal: { milesReversed: number; unspent: number; deficit: number };
};

/** Simplified ledger rows (`GET /me/wallet/ledger`) for the in-debit view. */
export type WalletLedgerRow = { id: string; label: string; detail: string; amount: number; month: string };

export type WalletInDebit = {
  wallet: Wallet;
  reversals: WalletReversal[];
  ledger: WalletLedgerRow[];
};

const MILES_PER_EUR = 10;

const bySupplier: Wallet['bySupplier'] = [
  { supplier: { id: 's-emirates', name: 'Emirates', avatar: null }, available: 18200, pending: 0, eurValue: 1820 },
  { supplier: { id: 's-hilton', name: 'Hilton Hotels', avatar: null }, available: 12400, pending: 1250, eurValue: 1240 },
  { supplier: { id: 's-msc', name: 'MSC Cruises', avatar: null }, available: 9800, pending: 2100, eurValue: 980 },
  { supplier: null, available: 8100, pending: 0, eurValue: 810 },
];

export const mockWallet: Wallet = {
  ownerType: 'user',
  agency: { name: 'Beverly Travel Ltd.', authorisedUsers: 6 },
  available: 48500,
  pending: 3350,
  reserved: 1500,
  lifetimeEarned: 62400,
  lifetimeRedeemed: 13900,
  eurValue: { available: 48500 / MILES_PER_EUR },
  earnedThisYear: 24500,
  earnedThisYearEurValue: 2450,
  pendingBookingsCount: 4,
  reservedFor: [{ redemptionId: 'rd-10412', title: 'Desert safari for two', miles: 1500 }],
  bySupplier,
};

export function getWallet() {
  return mockResponse(mockWallet);
}

export function getWalletInDebit() {
  const wallet: Wallet = {
    ...mockWallet,
    available: -69,
    lifetimeEarned: 1240,
    lifetimeRedeemed: 1309,
    eurValue: { available: 0 },
    reserved: 0,
    reservedFor: [],
    bySupplier: [{ supplier: { id: 's-anantara', name: 'Anantara', avatar: null }, available: -69, pending: 0, eurValue: 0 }],
  };
  const data: WalletInDebit = {
    wallet,
    reversals: [
      {
        id: 'WM-47998',
        label: 'Anantara The Palm Dubai',
        reversedAt: '2026-10-02T10:15:00.000Z',
        reversal: { milesReversed: 161, unspent: 92, deficit: 69 },
      },
    ],
    ledger: [
      { id: 'l1', label: 'Hilton Dubai — 4 nights', detail: 'Cancelled · 92 unspent miles returned · 9 Nov', amount: -69, month: 'NOVEMBER 2026' },
      { id: 'l2', label: 'Emirates Academy module 3', detail: 'Quiz passed · 10 Oct', amount: 300, month: 'NOVEMBER 2026' },
      { id: 'l3', label: 'Lounge access pass', detail: 'Reward redeemed · 8 Oct', amount: -400, month: 'NOVEMBER 2026' },
      { id: 'l4', label: 'WTM London 2026', detail: 'Attendance confirmed · 4 Oct', amount: 200, month: 'NOVEMBER 2026' },
      { id: 'l5', label: 'MSC Seaview — 7 nights', detail: 'Booking approved · 28 Sep', amount: 340, month: 'SEPTEMBER 2026' },
    ],
  };
  return mockResponse(data);
}
