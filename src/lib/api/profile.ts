import { ApiError, mockResponse } from './client';

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

export const SPECIALTY_OPTIONS: Specialty[] = [
  { key: 'luxury_hotels', name: 'Luxury hotels' },
  { key: 'cruises', name: 'Cruises' },
  { key: 'mice', name: 'MICE' },
  { key: 'gulf_region', name: 'Gulf region' },
  { key: 'airlines', name: 'Airlines' },
  { key: 'tours', name: 'Tours' },
  { key: 'visas', name: 'Visas' },
];

let summary: ProfileSummary = {
  profile: {
    id: '665f1a2b3c4d5e6f7a8b9c01',
    name: 'Daniel Reed',
    email: 'danielreed@beverlytravel.com',
    phone: '+880 1711 234567',
    avatar: null,
    city: 'Dhaka, Bangladesh',
    specialties: [
      { key: 'cruises', name: 'Cruises' },
      { key: 'luxury_hotels', name: 'Luxury hotels' },
    ],
  },
  agency: { name: 'Beverly Travel Ltd.', verified: true },
  tier: { key: 'gold', name: 'Gold' },
  points: 5240,
  miles: 3390,
  lifetimeMiles: 9120,
  badgesCount: 8,
  coursesCompleted: 3,
  eventsAttended: 11,
  certificatesCount: 3,
  newDiscussionsThisWeek: 23,
  partnersCount: 29,
  liveCampaigns: 2,
};

export async function fetchProfileSummary(): Promise<ProfileSummary> {
  return mockResponse(summary);
}

export async function updateProfile(input: ProfileUpdate): Promise<ProfileSummary> {
  await mockResponse(null, 400);
  if (input.specialties.length > 5) {
    throw new ApiError('Choose up to 5 specialities', 400, 'UNKNOWN_SPECIALTY');
  }
  summary = {
    ...summary,
    profile: {
      ...summary.profile,
      name: input.name.trim(),
      phone: input.phone.trim(),
      city: input.city.trim(),
      specialties: SPECIALTY_OPTIONS.filter((option) => input.specialties.includes(option.key)),
    },
  };
  return summary;
}

export async function fetchBadges(): Promise<BadgesResponse> {
  const earned: Badge[] = [
    { key: 'first_booking', name: 'First booking', description: 'Registered your first booking', earnedAt: '2026-03-02T00:00:00.000Z', progress: { current: 1, threshold: 1 } },
    { key: 'ten_bookings', name: '10 bookings', description: 'Ten approved bookings', earnedAt: '2026-05-19T00:00:00.000Z', progress: { current: 10, threshold: 10 } },
    { key: 'course_graduate', name: 'Course graduate', description: 'Completed an Academy course', earnedAt: '2026-07-18T00:00:00.000Z', progress: { current: 1, threshold: 1 } },
    { key: 'cruise_specialist', name: 'Cruise specialist', description: 'Completed the cruise specialist track', earnedAt: '2026-09-02T00:00:00.000Z', progress: { current: 5, threshold: 5 } },
    { key: 'event_regular', name: 'Event regular', description: 'Attended 10 events', earnedAt: '2026-10-14T00:00:00.000Z', progress: { current: 10, threshold: 10 } },
    { key: 'top_10_agent', name: 'Top 10 agent', description: 'Reached the top 10 of the leaderboard', earnedAt: '2026-10-30T00:00:00.000Z', progress: { current: 10, threshold: 10 } },
    { key: 'gold_tier', name: 'Gold tier', description: 'Reached the Gold tier', earnedAt: '2026-08-11T00:00:00.000Z', progress: { current: 2, threshold: 2 } },
    { key: 'five_courses', name: 'Five courses', description: 'Completed five Academy courses', earnedAt: '2026-11-01T00:00:00.000Z', progress: { current: 5, threshold: 5 } },
  ];
  const locked: Badge[] = [
    { key: 'fifty_bookings', name: '50 bookings', description: 'Fifty approved bookings', earnedAt: null, progress: { current: 31, threshold: 50 } },
    { key: 'platinum_tier', name: 'Platinum tier', description: 'Reach the Platinum tier', earnedAt: null, progress: { current: 2, threshold: 3 } },
    { key: 'ten_courses', name: 'Ten courses', description: 'Complete ten Academy courses', earnedAt: null, progress: { current: 5, threshold: 10 } },
    { key: 'community_voice', name: 'Community voice', description: 'Publish 20 community posts', earnedAt: null, progress: { current: 6, threshold: 20 } },
    { key: 'event_veteran', name: 'Event veteran', description: 'Attend 25 events', earnedAt: null, progress: { current: 11, threshold: 25 } },
    { key: 'number_one', name: 'Number one', description: 'Reach rank 1 on the leaderboard', earnedAt: null, progress: { current: 0, threshold: 1 } },
  ];
  return mockResponse({ earned, locked, totalActive: earned.length + locked.length });
}

export async function fetchCertificates(): Promise<Certificate[]> {
  return mockResponse([
    { publicId: 'WM-CERT-00418', courseTitle: 'Premium Economy: selling the cabin', issuer: 'Emirates', issuedAt: '2026-10-14T00:00:00.000Z' },
    { publicId: 'WM-CERT-00377', courseTitle: 'Mediterranean cruise specialist', issuer: 'MSC Cruises', issuedAt: '2026-09-02T00:00:00.000Z' },
    { publicId: 'WM-CERT-00301', courseTitle: 'Luxury resorts of the Maldives', issuer: 'Anantara', issuedAt: '2026-07-18T00:00:00.000Z' },
  ]);
}

const publicAgents: Record<string, PublicAgent> = {
  'agent-mariam': {
    id: 'agent-mariam',
    name: 'Mariam Al Fahim',
    avatar: null,
    agency: 'Gulf Horizon Travel',
    city: 'Dubai',
    country: 'United Arab Emirates',
    memberSince: '2025-02-01T00:00:00.000Z',
    tier: { key: 'platinum', name: 'Platinum' },
    badgesCount: 14,
    certificatesCount: 9,
    postsCount: 68,
    specialties: [
      { key: 'luxury_hotels', name: 'Luxury hotels' },
      { key: 'cruises', name: 'Cruises' },
      { key: 'mice', name: 'MICE' },
      { key: 'gulf_region', name: 'Gulf region' },
    ],
    recentPosts: [
      { id: 'feed-1', title: 'Anyone selling Saudi Red Sea yet?', createdAt: '2026-11-28T07:00:00.000Z', repliesCount: 14 },
      { id: 'feed-4', title: 'Transfer times in the Maldives', createdAt: '2026-11-25T09:00:00.000Z', repliesCount: 22 },
      { id: 'feed-5', title: 'Which DMC for Oman?', createdAt: '2026-11-21T09:00:00.000Z', repliesCount: 9 },
    ],
  },
  'agent-thomas': {
    id: 'agent-thomas',
    name: 'Thomas Keller',
    avatar: null,
    agency: 'Keller Reisen',
    city: 'Munich',
    country: 'Germany',
    memberSince: '2025-06-12T00:00:00.000Z',
    tier: { key: 'gold', name: 'Gold' },
    badgesCount: 9,
    certificatesCount: 5,
    postsCount: 21,
    specialties: [{ key: 'cruises', name: 'Cruises' }, { key: 'tours', name: 'Tours' }],
    recentPosts: [{ id: 'feed-2', title: 'MSC winter programme is live', createdAt: '2026-11-28T03:00:00.000Z', repliesCount: 8 }],
  },
};

export async function fetchPublicAgent(id: string): Promise<PublicAgent> {
  const agent = publicAgents[id];
  if (!agent) {
    return Promise.reject(new ApiError('Agent not found', 404));
  }
  return mockResponse(agent);
}

let sessions: Session[] = [
  {
    id: 'fam_9b1c01',
    device: 'iPhone, iOS 19',
    userAgent: 'WowMiles/1.2 (iPhone; iOS 19.1)',
    ip: '203.0.113.7',
    rememberMe: true,
    createdAt: '2026-11-20T09:00:00.000Z',
    lastUsedAt: '2026-11-28T08:00:00.000Z',
    expiresAt: '2026-12-20T09:00:00.000Z',
    isCurrent: true,
  },
  {
    id: 'fam_4e7a02',
    device: 'Chrome on Windows',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0) Chrome/130',
    ip: '198.51.100.21',
    rememberMe: false,
    createdAt: '2026-11-26T11:00:00.000Z',
    lastUsedAt: '2026-11-27T16:30:00.000Z',
    expiresAt: '2026-11-28T11:00:00.000Z',
    isCurrent: false,
  },
];

export async function fetchSessions(): Promise<Session[]> {
  return mockResponse(sessions.map((session) => ({ ...session })));
}

export async function revokeSession(id: string): Promise<{ revoked: true }> {
  await mockResponse(null, 300);
  if (!sessions.some((session) => session.id === id)) throw new ApiError('Session not found', 404);
  sessions = sessions.filter((session) => session.id !== id);
  return { revoked: true };
}

export async function changePassword(input: {
  currentPassword: string;
  password: string;
  confirmPassword: string;
}): Promise<{ changed: true }> {
  await mockResponse(null, 450);
  if (input.currentPassword === 'wrong') {
    throw new ApiError('Current password is incorrect', 400, 'INVALID_CREDENTIALS');
  }
  return { changed: true };
}
