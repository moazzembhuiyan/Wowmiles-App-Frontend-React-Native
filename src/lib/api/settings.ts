import { ApiError, apiGet, apiRequest } from './client';

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

/** `GET /users/me/notification-preferences`. `locked` (miles, bookings) are always on. */
export function fetchNotificationPreferences(): Promise<NotificationPreferences> {
  return apiGet<NotificationPreferences>('/users/me/notification-preferences');
}

/** `PUT /users/me/notification-preferences` (partial; switching a locked category off is 400 `PREFERENCE_LOCKED`). */
export async function updateNotificationPreferences(patch: PreferencesPatch): Promise<NotificationPreferences> {
  const res = await apiRequest<NotificationPreferences>('/users/me/notification-preferences', { method: 'PUT', body: patch });
  return res.data;
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

const titles: Record<LegalKey, string> = {
  agentTermsAndConditions: 'Programme terms and conditions',
  agentPrivacyAndPolicy: 'Privacy policy',
  cookiePolicy: 'Cookie policy',
  suppliersTermsAndConditions: 'Supplier and partner terms',
  aboutUs: 'About',
};

/** `GET /settings?key=<key>`; a key that has not been published yet is a 404. */
export async function fetchLegalPage(key: LegalKey): Promise<LegalPage> {
  if (!Object.prototype.hasOwnProperty.call(titles, key)) throw new ApiError('Page not found', 404, 'NOT_FOUND');
  const setting = await apiGet<{ key: string; value: string }>('/settings', { key });
  return { key, title: titles[key], body: typeof setting.value === 'string' ? setting.value : '' };
}

export const APP_INFO = { version: '1.0.0', operator: 'Beverly Group' };
