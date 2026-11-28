import { ApiError, mockResponse } from './client';
import type { Tier } from './profile';

/**
 * Community data layer. Mirrors backend `docs/apis_guideline.md` sections 11, 12, 4g and T78h:
 *   GET  /feeds?tag=&sort=                 -> fetchFeeds
 *   GET  /feeds/:id                        -> fetchFeed
 *   GET  /comments?feed=:id                -> fetchComments
 *   POST /feeds                            -> createFeed
 *   POST /comments                         -> addComment
 *   POST /feeds/:id/report, /comments/:id/report -> reportContent
 */

export const FEED_TAGS = [
  { key: 'destinations', label: 'Destinations' },
  { key: 'suppliers', label: 'Suppliers' },
  { key: 'tips', label: 'Selling tips' },
  { key: 'events', label: 'Events' },
] as const;

export type FeedTag = (typeof FEED_TAGS)[number]['key'];

export function tagLabel(key: string): string {
  return FEED_TAGS.find((tag) => tag.key === key)?.label ?? key;
}

export type FeedAuthor = {
  id: string;
  name: string;
  avatar: string | null;
  tier: Tier;
  city: string;
  agencyName: string;
};

export type FeedPost = {
  id: string;
  title: string;
  content: string;
  categories: string[];
  repliesCount: number;
  viewsCount: number;
  createdAt: string;
  author: FeedAuthor;
  isOwn: boolean;
};

export type FeedComment = {
  id: string;
  content: string;
  createdAt: string;
  author: FeedAuthor;
  isOwn: boolean;
};

export type FeedSort = 'latest' | 'popular';

export type FeedListResponse = { posts: FeedPost[]; communitySize: { agents: number; countries: number } };

export type ReportReason = 'spam' | 'inappropriate' | 'client_details' | 'other';
export const REPORT_REASONS: { key: ReportReason; label: string }[] = [
  { key: 'spam', label: 'Spam or advertising' },
  { key: 'inappropriate', label: 'Inappropriate content' },
  { key: 'client_details', label: 'Shares client details' },
  { key: 'other', label: 'Something else' },
];

const mariam: FeedAuthor = { id: 'agent-mariam', name: 'Mariam Al Fahim', avatar: null, tier: { key: 'platinum', name: 'Platinum' }, city: 'Dubai', agencyName: 'Gulf Horizon Travel' };
const thomas: FeedAuthor = { id: 'agent-thomas', name: 'Thomas Keller', avatar: null, tier: { key: 'gold', name: 'Gold' }, city: 'Munich', agencyName: 'Keller Reisen' };
const daniel: FeedAuthor = { id: 'agent-daniel', name: 'Daniel Okafor', avatar: null, tier: { key: 'gold', name: 'Gold' }, city: 'Lagos', agencyName: 'Okafor Voyages' };
const sofia: FeedAuthor = { id: 'agent-sofia', name: 'Sofia Marchetti', avatar: null, tier: { key: 'gold', name: 'Gold' }, city: 'Milan', agencyName: 'Marchetti Viaggi' };
const me: FeedAuthor = { id: '665f1a2b3c4d5e6f7a8b9c01', name: 'Daniel Reed', avatar: null, tier: { key: 'gold', name: 'Gold' }, city: 'Dhaka', agencyName: 'Beverly Travel Ltd.' };

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();

const posts: FeedPost[] = [
  {
    id: 'feed-1',
    title: 'Anyone selling Saudi Red Sea yet?',
    content: 'Two clients have asked this month. Curious whether anyone has placed bookings and how the commission compares to the usual Gulf properties.',
    categories: ['destinations'],
    repliesCount: 3,
    viewsCount: 320,
    createdAt: hoursAgo(2),
    author: mariam,
    isOwn: false,
  },
  {
    id: 'feed-2',
    title: 'MSC winter programme is live',
    content: 'Released this morning. Mediterranean sailings from January with the usual early booking incentive for agents.',
    categories: ['suppliers'],
    repliesCount: 8,
    viewsCount: 186,
    createdAt: hoursAgo(6),
    author: thomas,
    isOwn: false,
  },
  {
    id: 'feed-3',
    title: 'How do you handle group deposits?',
    content: 'Looking for a clean way to track staged deposits for a 20 person group without a spreadsheet nightmare.',
    categories: ['tips'],
    repliesCount: 5,
    viewsCount: 94,
    createdAt: hoursAgo(26),
    author: me,
    isOwn: true,
  },
  {
    id: 'feed-4',
    title: 'Transfer times in the Maldives',
    content: 'Seaplane and speedboat transfers change the whole arrival day. Sharing what clients should expect.',
    categories: ['destinations'],
    repliesCount: 22,
    viewsCount: 410,
    createdAt: hoursAgo(72),
    author: mariam,
    isOwn: false,
  },
  {
    id: 'feed-5',
    title: 'Which DMC for Oman?',
    content: 'Planning a small group to Muscat and the interior. Who has a DMC they would recommend?',
    categories: ['suppliers'],
    repliesCount: 9,
    viewsCount: 150,
    createdAt: hoursAgo(168),
    author: mariam,
    isOwn: false,
  },
];

const comments: Record<string, FeedComment[]> = {
  'feed-1': [
    { id: 'c1', content: 'Placed two last month. Commission sat at the standard hotel chain rate and both confirmed within a day.', createdAt: hoursAgo(1), author: daniel, isOwn: false },
    { id: 'c2', content: 'Worth noting the transfer times from the airport. Clients underestimate it and it changes the itinerary.', createdAt: hoursAgo(0.7), author: sofia, isOwn: false },
    { id: 'c3', content: 'That is useful, thank you both. Will register the next one and report back.', createdAt: hoursAgo(0.2), author: mariam, isOwn: false },
  ],
};

function findPost(id: string): FeedPost {
  const found = posts.find((post) => post.id === id);
  if (!found) throw new ApiError('Post not found', 404);
  return found;
}

export async function fetchFeeds(params: { sort?: FeedSort; tag?: FeedTag | null } = {}): Promise<FeedListResponse> {
  const { sort = 'latest', tag } = params;
  const list = posts
    .filter((post) => !tag || post.categories.includes(tag))
    .sort((a, b) => (sort === 'popular' ? b.viewsCount - a.viewsCount : b.createdAt.localeCompare(a.createdAt)));
  return mockResponse({ posts: list.map((post) => ({ ...post })), communitySize: { agents: 1240, countries: 38 } });
}

export async function fetchFeed(id: string): Promise<FeedPost> {
  await mockResponse(null, 150);
  return { ...findPost(id) };
}

export async function fetchComments(feedId: string): Promise<FeedComment[]> {
  return mockResponse([...(comments[feedId] ?? [])]);
}

export async function createFeed(input: { title: string; content: string; categories: FeedTag[] }): Promise<FeedPost> {
  await mockResponse(null, 450);
  const post: FeedPost = {
    id: `feed-${posts.length + 1}`,
    title: input.title.trim(),
    content: input.content.trim(),
    categories: input.categories,
    repliesCount: 0,
    viewsCount: 0,
    createdAt: new Date().toISOString(),
    author: me,
    isOwn: true,
  };
  posts.unshift(post);
  return post;
}

export async function addComment(feedId: string, content: string): Promise<FeedComment> {
  await mockResponse(null, 300);
  const post = findPost(feedId);
  const comment: FeedComment = {
    id: `c-${Date.now()}`,
    content: content.trim(),
    createdAt: new Date().toISOString(),
    author: me,
    isOwn: true,
  };
  comments[feedId] = [...(comments[feedId] ?? []), comment];
  post.repliesCount += 1;
  return comment;
}

export async function reportContent(input: {
  targetType: 'feed' | 'comment';
  targetId: string;
  reason: ReportReason;
  note?: string;
}): Promise<{ reported: true }> {
  await mockResponse(null, 350);
  if (input.targetType === 'feed' && findPost(input.targetId).isOwn) {
    throw new ApiError('You cannot report your own post', 400, 'CANNOT_REPORT_OWN_CONTENT');
  }
  return { reported: true };
}
