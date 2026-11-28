import { apiGet, apiPost, apiRequest, requireId } from './client';
import { getMyUserId, type Tier } from './profile';

/**
 * Community data layer. Mirrors backend `docs/apis_guideline.md` sections 11, 12, 4g and T78h:
 *   GET  /feeds?tag=&filter=               -> fetchFeeds (+ GET /program/stats for the community size)
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
  /** Comment authors carry no tier, city or agency from the backend. */
  tier: Tier | null;
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

type RawAuthor = {
  _id?: string;
  id?: string;
  name: string;
  avatar?: string | null;
  profileAvatar?: string | null;
  tier?: Tier;
  city?: string | null;
  agencyName?: string | null;
};

type RawPost = {
  _id: string;
  title: string;
  content: string;
  categories: string[];
  repliesCount: number;
  viewsCount?: number;
  createdAt: string;
  author: RawAuthor;
};

type RawComment = {
  _id: string;
  content: string;
  createdAt: string;
  author: RawAuthor;
  replies?: RawComment[];
};

function toAuthor(raw: RawAuthor): FeedAuthor {
  return {
    id: String(raw._id ?? raw.id),
    name: raw.name,
    avatar: raw.avatar ?? raw.profileAvatar ?? null,
    tier: raw.tier ?? null,
    city: raw.city ?? '',
    agencyName: raw.agencyName ?? '',
  };
}

function toPost(raw: RawPost, myId: string): FeedPost {
  const author = toAuthor(raw.author);
  return {
    id: raw._id,
    title: raw.title,
    content: raw.content,
    categories: raw.categories ?? [],
    repliesCount: raw.repliesCount ?? 0,
    viewsCount: raw.viewsCount ?? 0,
    createdAt: raw.createdAt,
    author,
    isOwn: author.id === myId,
  };
}

function toComment(raw: RawComment, myId: string): FeedComment {
  const author = toAuthor(raw.author);
  return { id: raw._id, content: raw.content, createdAt: raw.createdAt, author, isOwn: author.id === myId };
}

/** `GET /feeds`, `sort` maps to the backend `filter` (latest, popular). */
export async function fetchFeeds(params: { sort?: FeedSort; tag?: FeedTag | null } = {}): Promise<FeedListResponse> {
  const { sort = 'latest', tag } = params;
  const [list, stats, myId] = await Promise.all([
    apiRequest<RawPost[]>('/feeds', { query: { filter: sort, tag: tag ?? undefined, limit: 50 } }),
    apiGet<{ agents: number; countries: number }>('/program/stats'),
    getMyUserId(),
  ]);
  return { posts: list.data.map((post) => toPost(post, myId)), communitySize: { agents: stats.agents, countries: stats.countries } };
}

export async function fetchFeed(id: string): Promise<FeedPost> {
  const [post, myId] = await Promise.all([apiGet<RawPost>(`/feeds/${requireId(id)}`), getMyUserId()]);
  return toPost(post, myId);
}

/** `GET /comments/feed/:id`: root comments, each followed by its replies. */
export async function fetchComments(feedId: string): Promise<FeedComment[]> {
  const [res, myId] = await Promise.all([
    apiRequest<RawComment[]>(`/comments/feed/${requireId(feedId)}`, { query: { limit: 100 } }),
    getMyUserId(),
  ]);
  return res.data.flatMap((root) => [toComment(root, myId), ...(root.replies ?? []).map((reply) => toComment(reply, myId))]);
}

export async function createFeed(input: { title: string; content: string; categories: FeedTag[] }): Promise<FeedPost> {
  const [post, myId] = await Promise.all([
    apiPost<RawPost>('/feeds', { title: input.title.trim(), content: input.content.trim(), categories: input.categories }),
    getMyUserId(),
  ]);
  return toPost(post, myId);
}

export async function addComment(feedId: string, content: string): Promise<FeedComment> {
  const [comment, myId] = await Promise.all([
    apiPost<RawComment>('/comments', { feed: requireId(feedId), content: content.trim() }),
    getMyUserId(),
  ]);
  return toComment(comment, myId);
}

/** `POST /feeds/:id/report` or `POST /comments/:id/report`. */
export async function reportContent(input: {
  targetType: 'feed' | 'comment';
  targetId: string;
  reason: ReportReason;
  note?: string;
}): Promise<{ reported: true }> {
  const path = input.targetType === 'feed' ? 'feeds' : 'comments';
  await apiPost(`/${path}/${requireId(input.targetId)}/report`, { reason: input.reason, note: input.note?.trim() || undefined });
  return { reported: true };
}
