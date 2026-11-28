import { ApiError, mockResponse } from './client';

/**
 * Settings data layer. Mirrors backend `docs/apis_guideline.md` sections 4, 4g and T78f:
 *   GET /users/me/notification-preferences -> fetchNotificationPreferences
 *   PUT /users/me/notification-preferences -> updateNotificationPreferences
 *   GET /settings?key=<legal key>          -> fetchLegalPage
 */

export type PreferenceCategory = 'miles' | 'bookings' | 'events' | 'academy' | 'promo' | 'community';
export type PreferenceChannel = 'push' | 'email';
export type ChannelPreferences = Record<PreferenceCategory, boolean>;

export type NotificationPreferences = {
  push: ChannelPreferences;
  email: ChannelPreferences;
  /** Categories that cannot be switched off. */
  locked: PreferenceCategory[];
};

export type PreferencesPatch = Partial<Record<PreferenceChannel, Partial<ChannelPreferences>>>;

let preferences: NotificationPreferences = {
  push: { miles: true, bookings: true, events: true, academy: true, promo: true, community: true },
  email: { miles: true, bookings: true, events: true, academy: false, promo: false, community: true },
  locked: ['miles', 'bookings'],
};

export async function fetchNotificationPreferences(): Promise<NotificationPreferences> {
  return mockResponse(structuredClone(preferences));
}

export async function updateNotificationPreferences(patch: PreferencesPatch): Promise<NotificationPreferences> {
  await mockResponse(null, 250);
  for (const channel of ['push', 'email'] as const) {
    const changes = patch[channel] ?? {};
    for (const [category, value] of Object.entries(changes) as [PreferenceCategory, boolean][]) {
      if (preferences.locked.includes(category) && value === false) {
        throw new ApiError(`${category} notifications cannot be switched off`, 400, 'PREFERENCE_LOCKED');
      }
      preferences[channel][category] = value;
    }
  }
  return structuredClone(preferences);
}

export type LegalKey =
  | 'agentTermsAndConditions'
  | 'agentPrivacyAndPolicy'
  | 'cookiePolicy'
  | 'suppliersTermsAndConditions'
  | 'aboutUs';

export type LegalPage = { key: LegalKey; title: string; body: string };

export const LEGAL_LINKS: { key: LegalKey; title: string }[] = [
  { key: 'agentTermsAndConditions', title: 'Programme terms and conditions' },
  { key: 'agentPrivacyAndPolicy', title: 'Privacy policy' },
  { key: 'cookiePolicy', title: 'Cookie policy' },
  { key: 'suppliersTermsAndConditions', title: 'Supplier and partner terms' },
];

const legalBodies: Record<LegalKey, string> = {
  agentTermsAndConditions:
    'WowMiles is a loyalty programme for verified travel agents. Miles are earned on approved bookings, training and events, and can be redeemed for rewards in the app.\n\nWowMiles have no cash value and cannot be sold, transferred or exchanged for money. Beverly Group may reverse miles from bookings that are cancelled or cannot be verified.\n\nThe full terms are provided by the programme operator and will be shown here once published.',
  agentPrivacyAndPolicy:
    'We collect the details you give us at signup, your booking registrations and your activity in the app so we can run the programme. We do not sell your data.\n\nYou can ask us to correct or delete your data by contacting support.',
  cookiePolicy: 'The mobile app does not use browser cookies. The WowMiles website uses cookies for sign in and analytics.',
  suppliersTermsAndConditions: 'Terms that apply to suppliers and partners who issue miles or list rewards on WowMiles.',
  aboutUs: 'WowMiles is operated by Beverly Group.',
};

const titles: Record<LegalKey, string> = {
  agentTermsAndConditions: 'Programme terms and conditions',
  agentPrivacyAndPolicy: 'Privacy policy',
  cookiePolicy: 'Cookie policy',
  suppliersTermsAndConditions: 'Supplier and partner terms',
  aboutUs: 'About',
};

export async function fetchLegalPage(key: LegalKey): Promise<LegalPage> {
  if (!(key in legalBodies)) return Promise.reject(new ApiError('Page not found', 404));
  return mockResponse({ key, title: titles[key], body: legalBodies[key] });
}

export const APP_INFO = { version: '1.0.0', operator: 'Beverly Group' };
