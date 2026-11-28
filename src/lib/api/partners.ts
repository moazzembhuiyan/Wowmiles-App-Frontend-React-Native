import { ApiError, mockResponse } from './client';

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

export const partnerTypeLabels: Record<Exclude<PartnerServiceType, 'other'>, string> = {
  airline: 'Airlines',
  cruise: 'Cruises',
  hotel: 'Hotels',
  dmc: 'DMC',
};

const none = { facebook: '', instagram: '', x: '', tiktok: '', youtube: '' };

const partners: Partner[] = [
  {
    id: 'p-beverly-dmc',
    name: 'Beverly Travel DMC',
    logo: null,
    serviceType: 'dmc',
    serviceTypeLabel: 'DMC',
    destinationsText: 'Italy and the Mediterranean',
    destinationsDetail: '40 across Italy',
    destinationsCount: 40,
    about:
      'Beverly Travel DMC handles ground arrangements across Italy and the Mediterranean: transfers, guided tours, hotel allotments and group travel. Send your request through the agent desk and register the file reference here.',
    earnPer1000Eur: 150,
    bookingUrl: 'https://beverlytravel.com/booking',
    contact: {
      headOffice: 'Via Roma 12\n20121 Milan MI\nItaly',
      phone: '+39 02 4567 8900',
      email: 'partners@beverlytravel.com',
      website: 'https://beverlytravel.com',
    },
    socials: { facebook: 'https://facebook.com', instagram: 'https://instagram.com', x: 'https://x.com', tiktok: 'https://tiktok.com', youtube: 'https://youtube.com' },
    activeCampaign: { campaignId: 'c-3', title: '1.5x on DMC services', multiplier: 1.5, endsAt: '2026-12-31T23:59:00.000Z' },
    myMiles: { available: 320, pending: 0 },
  },
  {
    id: 'p-emirates',
    name: 'Emirates',
    logo: null,
    serviceType: 'airline',
    serviceTypeLabel: 'Airline',
    destinationsText: '140+ destinations',
    destinationsDetail: '140 worldwide',
    destinationsCount: 140,
    about:
      'Emirates flies to more than 140 destinations from its Dubai hub. Book Economy, Business or First through the Emirates trade portal, then register the PNR here to earn miles on the fare.',
    earnPer1000Eur: 50,
    bookingUrl: 'https://www.emirates.com/booking',
    contact: {
      headOffice: 'Emirates Group Headquarters, Airport Road\nGarhoud, Dubai 686\nUnited Arab Emirates',
      phone: '+971 4 708 1111',
      email: 'partners@emirates.com',
      website: 'https://www.emirates.com',
    },
    socials: { facebook: 'https://facebook.com/emirates', instagram: 'https://instagram.com/emirates', x: 'https://x.com/emirates', tiktok: 'https://tiktok.com/@emirates', youtube: 'https://youtube.com/emirates' },
    activeCampaign: { campaignId: 'c-1', title: 'Double miles on premium cabins', multiplier: 2, endsAt: '2026-11-30T23:59:00.000Z' },
    myMiles: { available: 1240, pending: 0 },
  },
  {
    id: 'p-msc',
    name: 'MSC Cruises',
    logo: null,
    serviceType: 'cruise',
    serviceTypeLabel: 'Cruise line',
    destinationsText: 'Mediterranean',
    destinationsDetail: '200 sailings',
    destinationsCount: 200,
    about: 'Family-owned cruise line with modern ships across the Mediterranean and beyond.',
    earnPer1000Eur: 40,
    bookingUrl: 'https://www.msccruises.com/agents',
    contact: { headOffice: 'Geneva, Switzerland', phone: '+41 22 703 8800', email: 'agents@msc.example', website: 'https://www.msccruises.com' },
    socials: { ...none, facebook: 'https://facebook.com/msccruises', instagram: 'https://instagram.com/msccruises' },
    activeCampaign: { campaignId: 'c-2', title: 'Double miles on Mediterranean sailings', multiplier: 2, endsAt: '2026-11-30T23:59:00.000Z' },
    myMiles: { available: 9800, pending: 2100 },
  },
  {
    id: 'p-hilton',
    name: 'Hilton Hotels',
    logo: null,
    serviceType: 'hotel',
    serviceTypeLabel: 'Hotels',
    destinationsText: 'Worldwide',
    destinationsDetail: 'Worldwide',
    destinationsCount: 7000,
    about: 'Global hotel group from city business hotels to resorts. Register stays booked for your clients.',
    earnPer1000Eur: 35,
    bookingUrl: 'https://www.hilton.com/agents',
    contact: { headOffice: 'McLean, USA', phone: '+1 703 883 1000', email: 'agents@hilton.example', website: 'https://www.hilton.com' },
    socials: { ...none, facebook: 'https://facebook.com/hilton', instagram: 'https://instagram.com/hilton' },
    activeCampaign: null,
    myMiles: { available: 12400, pending: 1250 },
  },
  {
    id: 'p-anantara',
    name: 'Anantara',
    logo: null,
    serviceType: 'hotel',
    serviceTypeLabel: 'Luxury resorts',
    destinationsText: 'Asia',
    destinationsDetail: '45 resorts',
    destinationsCount: 45,
    about: 'Luxury hotels and resorts known for destination dining and spa experiences.',
    earnPer1000Eur: 45,
    bookingUrl: 'https://www.anantara.com/agents',
    contact: { headOffice: 'Bangkok, Thailand', phone: '+66 2 477 0300', email: 'agents@anantara.example', website: 'https://www.anantara.com' },
    socials: { ...none, instagram: 'https://instagram.com/anantara' },
    activeCampaign: null,
    myMiles: { available: 0, pending: 0 },
  },
];

export function getPartners(type: PartnerServiceType | 'all' = 'all', searchTerm = '') {
  const term = searchTerm.trim().toLowerCase();
  const data = partners.filter(
    (partner) => (type === 'all' || partner.serviceType === type) && partner.name.toLowerCase().includes(term),
  );
  const result: PartnerList = {
    meta: { liveCampaignsCount: partners.filter((p) => p.activeCampaign).length, total: data.length, brandsCount: 29 },
    data,
  };
  return mockResponse(result);
}

export function getPartner(id: string) {
  const found = partners.find((partner) => partner.id === id);
  if (!found) return Promise.reject(new ApiError('Partner not found', 404));
  return mockResponse(found);
}
