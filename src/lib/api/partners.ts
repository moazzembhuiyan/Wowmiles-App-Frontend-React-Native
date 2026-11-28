import { apiGet, apiRequest, requireId } from './client';

/** Mirrors `GET /partners` and `GET /partners/:id` (`serviceType` enum from the partner type change). */
export type PartnerServiceType = 'airline' | 'cruise' | 'hotel' | 'dmc' | 'other';

export type PartnerCampaign = { campaignId: string; title: string; multiplier: number; endsAt: string };

export type Partner = {
  id: string;
  name: string;
  logo: string | null;
  serviceType: PartnerServiceType;
  serviceTypeLabel: string;
  destinationsText: string;
  /** Short label for the details table, for example "140 worldwide". */
  destinationsDetail: string;
  destinationsCount: number;
  about: string;
  earnPer1000Eur: number;
  bookingUrl: string;
  contact: { headOffice: string; phone: string; email: string; website: string };
  socials: { facebook: string; instagram: string; x: string; tiktok: string; youtube: string };
  activeCampaign: PartnerCampaign | null;
  /** Present for a signed-in agent. */
  myMiles?: { available: number; pending: number };
};

export type PartnerList = { meta: { liveCampaignsCount: number; total: number; brandsCount: number }; data: Partner[] };

/** `GET /partners` item. `destinationsDetail` is not sent, so it is derived from the destinations fields. */
type RawPartner = Omit<Partner, 'destinationsDetail'>;

const toPartner = (raw: RawPartner): Partner => ({
  ...raw,
  destinationsDetail: raw.destinationsCount > 0 ? `${raw.destinationsCount.toLocaleString('en-US')} destinations` : raw.destinationsText,
});

export const partnerTypeLabels: Record<Exclude<PartnerServiceType, 'other'>, string> = {
  airline: 'Airlines',
  cruise: 'Cruises',
  hotel: 'Hotels',
  dmc: 'DMC',
};

/** `GET /partners` (active partners; `serviceType` and `searchTerm` filter on the server). */
export async function getPartners(type: PartnerServiceType | 'all' = 'all', searchTerm = ''): Promise<PartnerList> {
  const term = searchTerm.trim();
  const [res, stats] = await Promise.all([
    apiRequest<RawPartner[]>('/partners', { query: { serviceType: type, searchTerm: term || undefined, limit: 100 } }),
    apiGet<{ suppliers: number }>('/program/stats'),
  ]);
  const meta = res.meta as { total?: number; liveCampaignsCount?: number } | undefined;
  return {
    meta: { liveCampaignsCount: meta?.liveCampaignsCount ?? 0, total: meta?.total ?? res.data.length, brandsCount: stats.suppliers },
    data: res.data.map(toPartner),
  };
}

/** `GET /partners/:id` (adds `myMiles` for a signed-in agent). */
export async function getPartner(id: string): Promise<Partner> {
  return toPartner(await apiGet<RawPartner>(`/partners/${requireId(id)}`));
}
