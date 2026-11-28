import type { Href } from 'expo-router';
import { getCheckoutDraft } from '@/lib/api/redemptions';
import { needsRequestDetails, type Reward } from '@/lib/api/rewards';

/** First checkout screen for a reward, given how it is fulfilled and whether miles cover it. */
export function firstCheckoutStep(reward: Reward, balance: number): Href {
  const params = { id: reward.id };
  if (reward.fulfilment === 'provider_site') return { pathname: '/checkout/provider-site', params };
  if (reward.cost > balance && reward.allowMilesCash) return { pathname: '/checkout/miles-cash', params };
  if (needsRequestDetails(reward)) return { pathname: '/checkout/request', params };
  return { pathname: '/redeem-confirmation', params };
}

/** Screen after the amount (and optionally the request details) have been settled. */
export function stepAfterAmount(reward: Reward, requestDone: boolean): Href {
  const params = { id: reward.id };
  if (needsRequestDetails(reward) && !requestDone) return { pathname: '/checkout/request', params };
  // The cash part comes from the server quote saved on the draft by the Miles + Cash screen.
  if (getCheckoutDraft(reward).cashMinor > 0) return { pathname: '/checkout/payment', params };
  return { pathname: '/redeem-confirmation', params };
}
