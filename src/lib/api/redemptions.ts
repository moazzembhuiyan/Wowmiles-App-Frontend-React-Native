import { getReward, getRewardMeta, type Fulfilment } from '@/components/rewards-data';
import { ApiError, mockResponse } from './client';
import { mockWallet } from './wallet';

const MILES_PER_EUR = 10;
const MIN_CASH_MINOR = 50;
export const MIN_MILES_FOR_CASH = 1000;

export type AllocationMode = 'automatic' | 'manual';
export type AllocationLine = { supplier: string | null; miles: number };

/** Mirrors `GET /redemptions/eligible-sources` (H24). Listed oldest miles first. */
export type EligibleSources = {
  available: number;
  sources: { supplier: { id: string; name: string; avatar: string | null } | null; available: number }[];
};

/** Mirrors the `POST /redemptions/quotes?preview=true` response. */
export type QuotePreview = {
  preview: true;
  reward: string;
  miles: number;
  cashMinor: number;
  allocationMode: AllocationMode;
  allocation: AllocationLine[];
  balanceAfter: number;
  discountMinor: number;
  cashDueAtProviderMinor: number;
};

/** The agent's booking details for provider rewards (`request` on `POST /redemptions`). */
export type RedemptionRequest = {
  preferredDate: string;
  secondChoiceDate: string | null;
  endDate: string | null;
  guests: { name: string }[];
  pickup: string;
  notes: string;
};

export type RedemptionStatus =
  | 'awaiting_payment'
  | 'awaiting_provider'
  | 'confirmed'
  | 'payment_failed'
  | 'refunded'
  | 'cancelled';

/** Mirrors `GET /me/redemptions/:id` and the `POST /redemptions` response. */
export type RedemptionDetail = {
  id: string;
  publicId: string;
  status: RedemptionStatus;
  fulfilment: Fulfilment;
  reward: { id: string; title: string };
  miles: number;
  cashMinor: number;
  currency: 'EUR';
  allocation: { supplier: { id: string; name: string } | null; miles: number }[];
  payment: {
    status: 'succeeded' | 'failed';
    amountMinor: number;
    currency: 'EUR';
    card: { brand: string; last4: string } | null;
    failureMessage: string | null;
    attempts: number;
    canRetry: boolean;
    retryUntil: string | null;
  } | null;
  hold: { held: boolean; miles: number; since: string | null; releasedAt: string | null; balanceIfDeclined: number | null } | null;
  providerDeadline: string | null;
  voucher: { code: string; validUntil: string } | null;
  providerUrl: string | null;
  discountMinor: number;
  cashDueAtProviderMinor: number;
  request: RedemptionRequest | null;
  createdAt: string;
};

/** Mirrors `GET /payments/methods`. */
export type PaymentMethod = { id: string; brand: string; last4: string; expMonth: number; expYear: number };

export const formatEur = (minor: number) =>
  `€${(minor / 100).toLocaleString('en-US', {
    minimumFractionDigits: minor % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;

const sources: EligibleSources = {
  available: mockWallet.available,
  sources: [
    { supplier: { id: 's-hilton', name: 'Hilton Hotels', avatar: null }, available: 12400 },
    { supplier: { id: 's-emirates', name: 'Emirates', avatar: null }, available: 18200 },
    { supplier: { id: 's-msc', name: 'MSC Cruises', avatar: null }, available: 9800 },
    { supplier: null, available: 8100 },
  ],
};

export function getEligibleSources() {
  return mockResponse(sources);
}

function autoAllocate(miles: number): AllocationLine[] {
  let left = miles;
  const lines: AllocationLine[] = [];
  for (const source of sources.sources) {
    if (left <= 0) break;
    const take = Math.min(left, source.available);
    lines.push({ supplier: source.supplier?.id ?? null, miles: take });
    left -= take;
  }
  return lines;
}

/** Most miles that can go towards a reward: all of it, or the whole balance when the reward costs more. */
export function maxMilesFor(price: number) {
  return Math.min(price, mockWallet.available);
}

export function cashFor(price: number, miles: number) {
  if (miles >= price) return 0;
  return Math.max(MIN_CASH_MINOR, Math.ceil(((price - miles) * 100) / MILES_PER_EUR));
}

export function previewQuote(input: { rewardId: string; miles?: number; allocation?: AllocationLine[] }) {
  const reward = getReward(input.rewardId);
  const meta = getRewardMeta(input.rewardId);
  const miles = input.miles ?? reward.cost;
  if (miles < reward.cost && !meta.allowMilesCash) {
    return Promise.reject(new ApiError('Miles + Cash is not available for this reward.', 422, 'MILES_CASH_UNAVAILABLE'));
  }
  if (miles < reward.cost && miles < MIN_MILES_FOR_CASH) {
    return Promise.reject(
      new ApiError(`Use at least ${MIN_MILES_FOR_CASH.toLocaleString('en-US')} miles.`, 422, 'MILES_BELOW_MINIMUM'),
    );
  }
  if (miles > mockWallet.available) {
    return Promise.reject(new ApiError('You do not have enough miles.', 422, 'INSUFFICIENT_MILES'));
  }
  const manual = !!input.allocation?.length;
  if (manual && input.allocation!.reduce((sum, line) => sum + line.miles, 0) !== miles) {
    return Promise.reject(
      new ApiError('The miles you chose do not add up to the amount needed.', 422, 'INVALID_ALLOCATION'),
    );
  }
  const data: QuotePreview = {
    preview: true,
    reward: reward.id,
    miles,
    cashMinor: cashFor(reward.cost, miles),
    allocationMode: manual ? 'manual' : 'automatic',
    allocation: manual ? input.allocation! : autoAllocate(miles),
    balanceAfter: mockWallet.available - miles,
    discountMinor: meta.fulfilment === 'provider_site' ? 2000 : 0,
    cashDueAtProviderMinor: meta.fulfilment === 'provider_site' ? 14500 : 0,
  };
  return mockResponse(data);
}

/** Choices carried between checkout screens until the redemption is created (a quote id once the backend is wired). */
export type CheckoutDraft = {
  rewardId: string;
  miles: number;
  allocationMode: AllocationMode;
  allocation: AllocationLine[];
  request: RedemptionRequest | null;
};

let draft: CheckoutDraft | null = null;

export function startCheckout(rewardId: string) {
  draft = { rewardId, miles: getReward(rewardId).cost, allocationMode: 'automatic', allocation: [], request: null };
  return draft;
}

export function getCheckoutDraft(rewardId: string): CheckoutDraft {
  if (!draft || draft.rewardId !== rewardId) return startCheckout(rewardId);
  return draft;
}

export function updateCheckoutDraft(rewardId: string, patch: Partial<CheckoutDraft>) {
  draft = { ...getCheckoutDraft(rewardId), ...patch };
  return draft;
}

const paymentMethods: PaymentMethod[] = [{ id: 'pm_visa4417', brand: 'Visa', last4: '4417', expMonth: 9, expYear: 2028 }];

export function getPaymentMethods() {
  return mockResponse([...paymentMethods]);
}

/** Adds a card (`POST /payments/setup-intent`, then the card form). A card ending 0002 is declined at payment. */
export function addPaymentMethod(input: { number: string; expiry: string }) {
  const digits = input.number.replace(/\D/g, '');
  const [month, year] = input.expiry.split('/');
  if (digits.length < 12 || !month || !year) {
    return Promise.reject(new ApiError('Enter a valid card number and expiry (MM/YY).', 400));
  }
  const method: PaymentMethod = {
    id: `pm_${digits.slice(-4)}${paymentMethods.length}`,
    brand: digits.startsWith('5') ? 'Mastercard' : 'Visa',
    last4: digits.slice(-4),
    expMonth: Number(month),
    expYear: 2000 + Number(year),
  };
  paymentMethods.push(method);
  return mockResponse(method);
}

const created = new Map<string, RedemptionDetail>();
let sequence = 10420;

export function createRedemption(input: { draft: CheckoutDraft; paymentMethod?: string }) {
  const reward = getReward(input.draft.rewardId);
  const meta = getRewardMeta(reward.id);
  const cashMinor = cashFor(reward.cost, input.draft.miles);
  const method = paymentMethods.find((item) => item.id === input.paymentMethod);
  if (cashMinor > 0 && !method) {
    return Promise.reject(new ApiError('Choose a card to pay the cash part.', 400, 'PAYMENT_METHOD_REQUIRED'));
  }
  const failed = cashMinor > 0 && method?.last4 === '0002';
  const now = new Date();
  const providerConfirm = meta.fulfilment === 'provider_confirm';
  const providerSite = meta.fulfilment === 'provider_site';
  sequence += 1;

  const detail: RedemptionDetail = {
    id: `rd-${sequence}`,
    publicId: `RD-${sequence}`,
    status: failed ? 'payment_failed' : providerConfirm ? 'awaiting_provider' : 'confirmed',
    fulfilment: meta.fulfilment,
    reward: { id: reward.id, title: reward.title },
    miles: input.draft.miles,
    cashMinor,
    currency: 'EUR',
    allocation: (input.draft.allocation.length ? input.draft.allocation : autoAllocate(input.draft.miles)).map(
      (line) => ({
        supplier: sources.sources.find((s) => s.supplier?.id === line.supplier)?.supplier ?? null,
        miles: line.miles,
      }),
    ),
    payment: cashMinor
      ? {
          status: failed ? 'failed' : 'succeeded',
          amountMinor: cashMinor,
          currency: 'EUR',
          card: method ? { brand: method.brand, last4: method.last4 } : null,
          failureMessage: failed ? 'Your card was declined.' : null,
          attempts: 1,
          canRetry: failed,
          retryUntil: failed ? new Date(now.getTime() + 24 * 3600 * 1000).toISOString() : null,
        }
      : null,
    hold:
      providerConfirm && !failed
        ? { held: true, miles: input.draft.miles, since: now.toISOString(), releasedAt: null, balanceIfDeclined: mockWallet.available }
        : null,
    providerDeadline:
      providerConfirm && !failed ? new Date(now.getTime() + 48 * 3600 * 1000).toISOString() : null,
    voucher:
      !providerConfirm && !failed ? { code: reward.voucherCode, validUntil: '2027-10-31T00:00:00.000Z' } : null,
    providerUrl: providerSite ? (meta.providerUrl ?? null) : null,
    discountMinor: providerSite ? 2000 : 0,
    cashDueAtProviderMinor: providerSite ? 14500 : 0,
    request: input.draft.request,
    createdAt: now.toISOString(),
  };
  created.set(detail.id, detail);
  return mockResponse(detail, 600);
}

export function getRedemption(id: string) {
  const found = created.get(id);
  if (!found) return Promise.reject(new ApiError('Redemption not found', 404));
  return mockResponse(found);
}
