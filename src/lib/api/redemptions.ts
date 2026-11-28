import { ApiError, apiGet, apiPost, apiRequest, newIdempotencyKey, queryClient, requireId } from './client';
import { addCard } from './card-entry';
import type { Fulfilment, Reward } from './rewards';

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
  | 'fulfilled'
  | 'used'
  | 'payment_failed'
  | 'refunded'
  | 'timed_out'
  | 'cancelled';

/** How the history groups a redemption (`GET /me/redemptions`). */
export type RedemptionDisplayStatus = 'awaiting' | 'active' | 'fulfilled' | 'used' | 'refunded' | 'cancelled';

/** One row of `GET /me/redemptions`. */
export type RedemptionHistoryItem = {
  id: string;
  publicId: string;
  status: RedemptionStatus;
  displayStatus: RedemptionDisplayStatus;
  reward: { id: string; title: string };
  miles: number;
  cashMinor: number;
  voucher: { code: string; status: string; validUntil: string; usedAt: string | null } | null;
  fulfilledAt: string | null;
  usedAt: string | null;
  createdAt: string;
};

export type RedemptionHistory = {
  items: RedemptionHistoryItem[];
  /** Miles redeemed all time; held miles are not counted. */
  summary: { redeemedAllTime: number; count: number; since: string | null };
};

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

/** `GET /redemptions/eligible-sources`. */
export function getEligibleSources() {
  return apiGet<EligibleSources>('/redemptions/eligible-sources');
}

/** Most miles that can go towards a reward: all of it, or the whole balance when the reward costs more. */
export function maxMilesFor(price: number, balance: number) {
  return Math.min(price, balance);
}

/**
 * Instant estimate of the cash part, only for a hint while the server quote loads (label it as an estimate):
 * EUR 0.10 per mile, at least EUR 0.50. The quote (`previewQuote`) is authoritative.
 */
export function cashFor(price: number, miles: number) {
  if (miles >= price) return 0;
  return Math.max(MIN_CASH_MINOR, Math.ceil(((price - miles) * 100) / MILES_PER_EUR));
}

const toQuoteBody = (input: { rewardId: string; miles?: number; allocation?: AllocationLine[] }) => ({
  reward: requireId(input.rewardId),
  miles: input.miles,
  allocation: input.allocation?.length ? input.allocation : undefined,
});

/** `POST /redemptions/quotes?preview=true`: nothing is stored or held. */
export function previewQuote(input: { rewardId: string; miles?: number; allocation?: AllocationLine[] }) {
  return apiPost<QuotePreview>('/redemptions/quotes', toQuoteBody(input), { query: { preview: true } });
}

/** An in-flight "create redemption" action: its key and quote are reused when the same action is retried. */
type PendingCreate = { key: string; quoteId: string | null; paymentMethod: string | undefined };

/** Choices carried between checkout screens until the redemption is created. */
export type CheckoutDraft = {
  rewardId: string;
  miles: number;
  /** Cash part from the last server quote; 0 while the whole price is paid in miles. */
  cashMinor: number;
  allocationMode: AllocationMode;
  allocation: AllocationLine[];
  request: RedemptionRequest | null;
  pending?: PendingCreate | null;
};

let draft: CheckoutDraft | null = null;

type CheckoutReward = Pick<Reward, 'id' | 'cost'>;

export function startCheckout(reward: CheckoutReward) {
  draft = { rewardId: reward.id, miles: reward.cost, cashMinor: 0, allocationMode: 'automatic', allocation: [], request: null };
  return draft;
}

export function getCheckoutDraft(reward: CheckoutReward): CheckoutDraft {
  if (!draft || draft.rewardId !== reward.id) return startCheckout(reward);
  return draft;
}

/** Changing a choice makes the next submit a new action (new quote, new idempotency key). */
export function updateCheckoutDraft(reward: CheckoutReward, patch: Partial<CheckoutDraft>) {
  draft = { ...getCheckoutDraft(reward), ...patch, pending: null };
  return draft;
}

/** `GET /payments/methods`. */
export function getPaymentMethods() {
  return apiGet<PaymentMethod[]>('/payments/methods');
}

/**
 * Adds a card with the Stripe Payment Sheet in setup mode (`POST /payments/setup-intent`); the card details go to
 * Stripe directly. Resolves with the new card, or null when the sheet was dismissed. Needs a development build.
 */
export async function addPaymentMethod(): Promise<PaymentMethod | null> {
  const before = new Set((await getPaymentMethods()).map((method) => method.id));
  const added = await addCard(() => apiPost<{ setupIntentId: string; clientSecret: string }>('/payments/setup-intent'));
  if (!added) return null;
  await queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
  const methods = await getPaymentMethods();
  return methods.find((method) => !before.has(method.id)) ?? methods[methods.length - 1] ?? null;
}

type RawRedemption = {
  id: string;
  publicId: string;
  status: RedemptionStatus;
  reward: { id: string; title: string; fulfilment: Fulfilment };
  miles: number;
  cashMinor: number;
  currency: 'EUR';
  allocation: RedemptionDetail['allocation'];
  payment: RedemptionDetail['payment'];
  hold: RedemptionDetail['hold'];
  providerDeadline: string | null;
  voucher: { code: string; validUntil: string } | null;
  providerUrl?: string | null;
  discountMinor?: number;
  cashDueAtProviderMinor?: number;
  request: RedemptionRequest | null;
  createdAt: string;
};

function toRedemption(raw: RawRedemption): RedemptionDetail {
  return {
    id: raw.id,
    publicId: raw.publicId,
    status: raw.status,
    fulfilment: raw.reward.fulfilment,
    reward: { id: raw.reward.id, title: raw.reward.title },
    miles: raw.miles,
    cashMinor: raw.cashMinor,
    currency: raw.currency,
    allocation: raw.allocation ?? [],
    payment: raw.payment ?? null,
    hold: raw.hold ?? null,
    providerDeadline: raw.providerDeadline ?? null,
    voucher: raw.voucher ? { code: raw.voucher.code, validUntil: raw.voucher.validUntil } : null,
    providerUrl: raw.providerUrl || null,
    discountMinor: raw.discountMinor ?? 0,
    cashDueAtProviderMinor: raw.cashDueAtProviderMinor ?? 0,
    request: raw.request ?? null,
    createdAt: raw.createdAt,
  };
}

/** Optional date fields the backend expects as `YYYY-MM-DD` or null, never an empty string. */
function requestBody(request: RedemptionRequest | null) {
  if (!request) return undefined;
  return {
    preferredDate: request.preferredDate || null,
    secondChoiceDate: request.secondChoiceDate || null,
    endDate: request.endDate || null,
    guests: request.guests,
    pickup: request.pickup,
    notes: request.notes,
  };
}

/** Codes after which the stored quote or key cannot be reused. */
const STALE_CODES = ['QUOTE_EXPIRED', 'QUOTE_USED', 'IDEMPOTENCY_KEY_REUSED'];

/**
 * `POST /redemptions/quotes` then `POST /redemptions` with an `Idempotency-Key`. The key and quote are kept on
 * the draft, so a retry after a network error replays the first request instead of redeeming twice.
 */
export async function createRedemption(input: { draft: CheckoutDraft; paymentMethod?: string }): Promise<RedemptionDetail> {
  const current = input.draft;
  let pending = current.pending;
  if (!pending || pending.paymentMethod !== input.paymentMethod) {
    pending = { key: newIdempotencyKey(), quoteId: pending?.quoteId ?? null, paymentMethod: input.paymentMethod };
    current.pending = pending;
  }
  try {
    if (!pending.quoteId) {
      const quote = await apiPost<{ id: string }>(
        '/redemptions/quotes',
        toQuoteBody({
          rewardId: current.rewardId,
          miles: current.miles,
          allocation: current.allocationMode === 'manual' ? current.allocation : undefined,
        }),
      );
      pending.quoteId = quote.id;
    }
    const raw = await apiPost<RawRedemption>(
      '/redemptions',
      { quote: pending.quoteId, paymentMethod: input.paymentMethod, request: requestBody(current.request) },
      { idempotencyKey: pending.key },
    );
    current.pending = null;
    void queryClient.invalidateQueries({ queryKey: ['wallet'] });
    void queryClient.invalidateQueries({ queryKey: ['redemptions'] });
    return toRedemption(raw);
  } catch (error) {
    if (error instanceof ApiError && error.code && STALE_CODES.includes(error.code)) current.pending = null;
    throw error;
  }
}

const retryKeys = new Map<string, string>();

/** `POST /redemptions/:id/retry-payment` with a new card, within 24 hours and up to 3 attempts. */
export async function retryPayment(input: { id: string; paymentMethod: string }): Promise<RedemptionDetail> {
  const id = requireId(input.id);
  const signature = `${id}:${input.paymentMethod}`;
  const key = retryKeys.get(signature) ?? newIdempotencyKey();
  retryKeys.set(signature, key);
  const raw = await apiPost<RawRedemption>(
    `/redemptions/${id}/retry-payment`,
    { paymentMethod: input.paymentMethod },
    { idempotencyKey: key },
  );
  retryKeys.delete(signature);
  void queryClient.invalidateQueries({ queryKey: ['wallet'] });
  void queryClient.invalidateQueries({ queryKey: ['redemption'] });
  void queryClient.invalidateQueries({ queryKey: ['redemptions'] });
  return toRedemption(raw);
}

/** `GET /me/redemptions/:id`. */
export async function getRedemption(id: string): Promise<RedemptionDetail> {
  return toRedemption(await apiGet<RawRedemption>(`/me/redemptions/${requireId(id)}`));
}

/** `GET /me/redemptions` with the `displayStatus` of each row (held miles are excluded from the summary). */
export async function getRedemptionHistory(): Promise<RedemptionHistory> {
  const res = await apiRequest<RedemptionHistoryItem[]>('/me/redemptions', { query: { status: 'all', limit: 50 } });
  const summary = (res.meta as { summary?: RedemptionHistory['summary'] } | undefined)?.summary;
  return { items: res.data, summary: summary ?? { redeemedAllTime: 0, count: 0, since: null } };
}
