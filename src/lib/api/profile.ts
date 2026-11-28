import { changePassword as changePasswordRequest } from './auth';
import { apiGet, apiRequest, queryClient, requireId } from './client';
import { getTokens } from '@/lib/auth/tokens';

/**
 * Profile data layer. Mirrors backend `docs/apis_guideline.md` sections 4g, 4h (T78e, T78g):
 *   GET   /users/me/summary          -> fetchProfileSummary
 *   PUT   /users/:userId             -> updateProfile
 *   GET   /agents/:id/public         -> fetchPublicAgent
 *   GET   /me/badges                 -> fetchBadges
 *   GET   /me/certificates           -> fetchCertificates
 *   GET   /auth/sessions             -> fetchSessions
 *   DELETE /auth/sessions/:id        -> revokeSession
 *   POST  /auth/change-password      -> changePassword
 */

export type TierKey = 'silver' | 'gold' | 'platinum';
export type Tier = { key: TierKey; name: string };
export type Specialty = { key: string; name: string };

export const TIER_LABEL: Record<TierKey, string> = {
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
};

export type ProfileSummary = {
  profile: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string | null;
    city: string;
    specialties: Specialty[];
  };
  agency: { name: string; verified: boolean };
  tier: Tier;
  points: number;
  miles: number;
  lifetimeMiles: number;
  badgesCount: number;
  coursesCompleted: number;
  eventsAttended: number;
  certificatesCount: number;
  newDiscussionsThisWeek: number;
  partnersCount: number;
  liveCampaigns: number;
};

export type ProfileUpdate = {
  name: string;
  phone: string;
  city: string;
  specialties: string[];
};

export type Badge = {
  key: string;
  name: string;
  description: string;
  earnedAt: string | null;
  progress: { current: number; threshold: number };
};

export type BadgesResponse = { earned: Badge[]; locked: Badge[]; totalActive: number };

export type Certificate = {
  publicId: string;
  courseTitle: string;
  issuer: string;
  issuedAt: string;
};

export type PublicAgent = {
  id: string;
  name: string;
  avatar: string | null;
  agency: string;
  city: string;
  country: string;
  memberSince: string;
  tier: Tier;
  badgesCount: number;
  certificatesCount: number;
  postsCount: number;
  specialties: Specialty[];
  recentPosts: { id: string; title: string; createdAt: string; repliesCount: number }[];
};

export type Session = {
  id: string;
  device: string | null;
  userAgent: string;
  ip: string;
  rememberMe: boolean;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  isCurrent: boolean;
};

/** Specialities are the active supplier categories (`PUT /users/:userId` rejects any other key). */
export async function fetchSpecialtyOptions(): Promise<Specialty[]> {
  const groups = await apiGet<{ categories: { key: string; name: string }[] }[]>('/supplier-categories');
  return groups.flatMap((group) => group.categories.map(({ key, name }) => ({ key, name })));
}

type SummaryResponse = {
  profile: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    avatar: string | null;
    city: string | null;
    specialties: Specialty[];
  };
  agency: { name: string; verified: boolean };
  tier: Tier;
  points: number;
  lifetimeMiles: number;
  badgesCount: number;
  coursesCompleted: number;
  eventsAttended: number;
  certificatesCount: number;
  newDiscussionsThisWeek: number;
};

/** `GET /users/me/summary`, plus the balance (`/me/wallet`) and partner counts (`/partners`) the profile screen shows. */
export async function fetchProfileSummary(): Promise<ProfileSummary> {
  const [data, wallet, partners] = await Promise.all([
    apiGet<SummaryResponse>('/users/me/summary'),
    apiGet<{ available: number }>('/me/wallet'),
    apiRequest<unknown[]>('/partners', { query: { limit: 1 } }),
  ]);
  const meta = partners.meta as { total?: number; liveCampaignsCount?: number } | undefined;
  return {
    ...data,
    profile: {
      ...data.profile,
      email: data.profile.email ?? '',
      phone: data.profile.phone ?? '',
      city: data.profile.city ?? '',
    },
    miles: wallet.available,
    partnersCount: meta?.total ?? 0,
    liveCampaigns: meta?.liveCampaignsCount ?? 0,
  };
}

/** `PUT /users/me`, then the refreshed summary. */
export async function updateProfile(input: ProfileUpdate): Promise<ProfileSummary> {
  await apiRequest('/users/me', {
    method: 'PUT',
    body: { name: input.name.trim(), phone: input.phone.trim(), city: input.city.trim(), specialties: input.specialties },
  });
  return fetchProfileSummary();
}

type BadgeResponse = {
  key: string;
  name: string;
  description: string;
  earnedAt: string | null;
  progress: { current: number | null; threshold: number };
};

/** `GET /me/badges`. A rank badge without a rank yet shows 0 progress. */
export async function fetchBadges(): Promise<BadgesResponse> {
  const data = await apiGet<{ earned: BadgeResponse[]; locked: BadgeResponse[] }>('/me/badges');
  const toBadge = (badge: BadgeResponse): Badge => ({
    key: badge.key,
    name: badge.name,
    description: badge.description ?? '',
    earnedAt: badge.earnedAt,
    progress: { current: badge.progress.current ?? 0, threshold: badge.progress.threshold },
  });
  const earned = data.earned.map(toBadge);
  const locked = data.locked.map(toBadge);
  return { earned, locked, totalActive: earned.length + locked.length };
}

type CertificateResponse = {
  publicId: string;
  courseTitle: string;
  issuedAt: string;
  issuedBy?: { name?: string } | string | null;
};

/** `GET /me/certificates` (live certificates only). */
export async function fetchCertificates(): Promise<Certificate[]> {
  const res = await apiRequest<CertificateResponse[]>('/me/certificates', { query: { status: 'issued', limit: 50 } });
  return res.data.map((item) => ({
    publicId: item.publicId,
    courseTitle: item.courseTitle,
    issuer: (typeof item.issuedBy === 'string' ? item.issuedBy : item.issuedBy?.name) || 'WowMiles',
    issuedAt: item.issuedAt,
  }));
}

type PublicAgentResponse = Omit<PublicAgent, 'badgesCount' | 'certificatesCount' | 'agency' | 'city' | 'country'> & {
  agency: { name: string } | null;
  city: string | null;
  country: string | null;
  badges: unknown[];
  certificates: unknown[];
};

/** `GET /agents/:id/public`. The certificate count is capped at 10 by the backend. */
export async function fetchPublicAgent(id: string): Promise<PublicAgent> {
  const { badges, certificates, agency, city, country, ...rest } = await apiGet<PublicAgentResponse>(`/agents/${requireId(id)}/public`);
  return {
    ...rest,
    agency: agency?.name ?? '',
    city: city ?? '',
    country: country ?? '',
    badgesCount: badges.length,
    certificatesCount: certificates.length,
  };
}

/** `GET /auth/sessions`. `isCurrent` needs the refresh token, which a GET cannot carry, so it is false here. */
export function fetchSessions(): Promise<Session[]> {
  return apiGet<Session[]>('/auth/sessions');
}

/** `DELETE /auth/sessions/:id` (the refresh token in the body lets the server tell whether it is this device). */
export async function revokeSession(id: string): Promise<{ revoked: true }> {
  await apiRequest(`/auth/sessions/${requireId(id)}`, { method: 'DELETE', body: { refreshToken: getTokens()?.refreshToken } });
  return { revoked: true };
}

export async function changePassword(input: {
  currentPassword: string;
  password: string;
  confirmPassword: string;
}): Promise<{ changed: true }> {
  await changePasswordRequest(input);
  return { changed: true };
}

/** The signed-in user's id (from the cached profile summary), for "is this mine" checks. */
export async function getMyUserId(): Promise<string> {
  const summary = await queryClient.fetchQuery({ queryKey: ['profile', 'summary'], queryFn: fetchProfileSummary });
  return summary.profile.id;
}
