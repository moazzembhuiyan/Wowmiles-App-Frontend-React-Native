import { apiGet, apiRequest } from './client';

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

/** One row of `GET /me/wallet/ledger`. */
export type LedgerItem = {
  id: string;
  label: string;
  amount: number;
  type: 'earn_pending' | 'earn' | 'spend' | 'reverse' | 'adjust';
  sourceType: string;
  sourceId: string | null;
  createdAt: string;
  reversal?: { unspent?: number; deficit?: number };
};

type WalletResponse = Omit<Wallet, 'agency' | 'earnedThisYear' | 'earnedThisYearEurValue'> &
  Partial<Pick<Wallet, 'earnedThisYear' | 'earnedThisYearEurValue'>>;

/** `GET /me/wallet`. The backend has no agency block, so `agency` stays unset. */
export async function getWallet(): Promise<Wallet> {
  const data = await apiGet<WalletResponse>('/me/wallet');
  return {
    ...data,
    earnedThisYear: data.earnedThisYear ?? 0,
    earnedThisYearEurValue: data.earnedThisYearEurValue ?? 0,
  };
}

const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const TYPE_DETAIL: Record<LedgerItem['type'], string> = {
  earn_pending: 'Pending until the stay completes',
  earn: 'Miles earned',
  spend: 'Reward redeemed',
  reverse: 'Miles reversed',
  adjust: 'Adjustment',
};

export function toLedgerRow(item: LedgerItem): WalletLedgerRow {
  const at = new Date(item.createdAt);
  return {
    id: item.id,
    label: item.label,
    detail: `${TYPE_DETAIL[item.type]} · ${at.getUTCDate()} ${SHORT_MONTHS[at.getUTCMonth()]}`,
    amount: item.amount,
    month: `${MONTHS[at.getUTCMonth()]} ${at.getUTCFullYear()}`,
  };
}

/** `GET /me/wallet/ledger` (visible entries, newest first). */
export async function getWalletLedger(query: { type?: 'all' | 'earned' | 'redeemed'; page?: number; limit?: number; from?: string } = {}) {
  const res = await apiRequest<LedgerItem[]>('/me/wallet/ledger', { query: { limit: 50, ...query } });
  return { items: res.data, meta: res.meta };
}

/** In-debit view: the wallet plus its ledger, with reversal entries lifted out. */
export async function getWalletInDebit(): Promise<WalletInDebit> {
  const [wallet, ledger] = await Promise.all([getWallet(), apiRequest<LedgerItem[]>('/me/wallet/ledger', { query: { limit: 50 } })]);
  const reversals: WalletReversal[] = ledger.data
    .filter((item) => item.type === 'reverse')
    .map((item) => ({
      id: item.sourceId ?? item.id,
      label: item.label,
      reversedAt: item.createdAt,
      reversal: { milesReversed: Math.abs(item.amount), unspent: item.reversal?.unspent ?? 0, deficit: item.reversal?.deficit ?? 0 },
    }));
  return { wallet, reversals, ledger: ledger.data.map(toLedgerRow) };
}
