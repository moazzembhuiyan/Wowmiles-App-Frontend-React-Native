import type { Href } from 'expo-router';
import { getReward, getRewardMeta, needsRequestDetails } from '@/components/rewards-data';
import { cashFor, getCheckoutDraft } from '@/lib/api/redemptions';

/** First checkout screen for a reward, given how it is fulfilled and whether miles cover it. */
export function firstCheckoutStep(rewardId: string, balance: number): Href {
  const reward = getReward(rewardId);
  const meta = getRewardMeta(rewardId);
  const params = { id: reward.id };
  if (meta.fulfilment === 'provider_site') return { pathname: '/checkout/provider-site', params };
  if (reward.cost > balance && meta.allowMilesCash) return { pathname: '/checkout/miles-cash', params };
  if (needsRequestDetails(meta)) return { pathname: '/checkout/request', params };
  return { pathname: '/redeem-confirmation', params };
}

/** Screen after the amount (and optionally the request details) have been settled. */
export function stepAfterAmount(rewardId: string, requestDone: boolean): Href {
  const reward = getReward(rewardId);
  const meta = getRewardMeta(rewardId);
  const params = { id: reward.id };
  if (needsRequestDetails(meta) && !requestDone) return { pathname: '/checkout/request', params };
  const draft = getCheckoutDraft(rewardId);
  if (cashFor(reward.cost, draft.miles) > 0) return { pathname: '/checkout/payment', params };
  return { pathname: '/redeem-confirmation', params };
}
