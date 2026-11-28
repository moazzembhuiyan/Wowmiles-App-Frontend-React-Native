import { QueryClient } from '@tanstack/react-query';
import { clearTokens, getTokens, loadTokens, saveTokens } from '@/lib/auth/tokens';

/**
 * Data layer contract.
 *
 * Every screen reads data through a fetcher in `src/lib/api/<area>.ts` and a TanStack Query hook.
 * Fetchers call the backend through `apiGet` / `apiPost` / `apiRequest` and return the shapes the screens use;
 * the backend contract is in backend `docs/apis_guideline.md`.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// HTTP client

const LOCAL_HOSTS = ['localhost', '127.0.0.1', '10.0.2.2'];
const REQUEST_TIMEOUT_MS = 20_000;

/** Validated API base (`<EXPO_PUBLIC_API_URL>/api/v1`). https is required outside local development. */
function apiBase(): string {
  const raw = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');
  if (!raw) throw new ApiError('The app is not configured with an API address.', 0, 'CONFIG');
  const match = /^(https?):\/\/([^/:]+)/i.exec(raw);
  if (!match) throw new ApiError('The API address is not a valid URL.', 0, 'CONFIG');
  const secure = match[1].toLowerCase() === 'https';
  if (!secure && !(__DEV__ && LOCAL_HOSTS.includes(match[2].toLowerCase()))) {
    throw new ApiError('The API address must use https.', 0, 'CONFIG');
  }
  return `${raw}/api/v1`;
}

type Envelope<T> = {
  success: boolean;
  message?: string;
  /** Machine code, when the backend sends one (older responses prefix it to the message). */
  code?: string;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPage: number };
  error?: { path?: string; message?: string }[];
};

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  /** Multipart body (file upload); overrides `body`. */
  form?: FormData;
  /** Required by miles and money writes; create one with `newIdempotencyKey()` per user action. */
  idempotencyKey?: string;
  /** Send the stored access token and refresh once on 401. Default true. */
  auth?: boolean;
  /** Explicit bearer (signup or reset OTP flows); disables refresh. */
  token?: string;
  /** Extra request headers. */
  headers?: Record<string, string>;
};

/** The backend prefixes the machine code to the message (`BOOKING_DUPLICATE: ...`). */
function toApiError(status: number, payload: Partial<Envelope<unknown>> | null): ApiError {
  const raw = payload?.message ?? payload?.error?.[0]?.message ?? 'Something went wrong. Please try again.';
  const match = /^([A-Z][A-Z0-9_]{2,})(?::\s*([\s\S]*))?$/.exec(raw);
  const code = typeof payload?.code === 'string' && payload.code ? payload.code : match?.[1];
  if (match) return new ApiError(match[2]?.trim() || raw, status, code);
  return new ApiError(raw, status, code);
}

let onSessionExpired: (() => void) | null = null;

/** The auth context registers this to return to the sign-in screens when refresh fails. */
export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler;
}

async function send(path: string, options: RequestOptions, accessToken: string | undefined): Promise<Response> {
  const query = Object.entries(options.query ?? {})
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  const url = `${apiBase()}${path}${query ? `?${query}` : ''}`;

  const headers: Record<string, string> = { Accept: 'application/json', ...options.headers };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (options.idempotencyKey) headers['Idempotency-Key'] = options.idempotencyKey;
  let body: BodyInit | undefined;
  if (options.form) {
    body = options.form;
  } else if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { method: options.method ?? 'GET', headers, body, signal: controller.signal });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'AbortError';
    throw new ApiError(
      timedOut ? 'The request timed out. Please try again.' : 'Cannot reach the server. Check your connection.',
      0,
      timedOut ? 'TIMEOUT' : 'NETWORK',
    );
  } finally {
    clearTimeout(timer);
  }
}

let refreshing: Promise<string | null> | null = null;

/** One refresh at a time: the backend rotates the refresh token, so concurrent calls must share the result. */
function refreshAccessToken(): Promise<string | null> {
  refreshing ??= (async () => {
    const tokens = await loadTokens();
    if (!tokens) return null;
    try {
      const response = await send('/auth/refresh-token', { method: 'POST', body: { refreshToken: tokens.refreshToken } }, undefined);
      if (response.ok) {
        const payload = (await response.json()) as Envelope<{ accessToken: string; refreshToken: string }>;
        await saveTokens({ accessToken: payload.data.accessToken, refreshToken: payload.data.refreshToken });
        return payload.data.accessToken;
      }
      // Only a rejected token ends the session; a server or network fault keeps it for the next try.
      if (response.status === 401 || response.status === 403) {
        await clearTokens();
        onSessionExpired?.();
      }
      return null;
    } catch {
      return null;
    }
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

/** Performs a request and returns the full response envelope (use directly for paginated lists). */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<Envelope<T>> {
  const useStored = options.auth !== false && !options.token;
  const stored = useStored ? await loadTokens() : null;
  let response = await send(path, options, options.token ?? stored?.accessToken);

  if (response.status === 401 && useStored && stored) {
    const fresh = await refreshAccessToken();
    if (fresh) response = await send(path, options, fresh);
    else if (!getTokens()) throw new ApiError('Your session has expired. Please log in again.', 401, 'SESSION_EXPIRED');
  }

  let payload: Envelope<T> | null = null;
  try {
    payload = (await response.json()) as Envelope<T>;
  } catch {
    payload = null;
  }
  if (!response.ok || payload?.success === false) throw toApiError(response.status, payload);
  return payload as Envelope<T>;
}

export async function apiGet<T>(path: string, query?: RequestOptions['query']): Promise<T> {
  return (await apiRequest<T>(path, { query })).data;
}

export async function apiPost<T>(path: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
  return (await apiRequest<T>(path, { ...options, method: 'POST', body })).data;
}

/** UUID v4 for the `Idempotency-Key` header. Reuse the same key when retrying the same action. */
export function newIdempotencyKey(): string {
  const bytes = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
  else for (let i = 0; i < 16; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Route params come from deep links: accept only id-shaped values before they reach an API path. */
export function isValidId(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(value);
}

/** Returns the id when valid, or throws a 404 so the screen shows its error state. */
export function requireId(value: unknown): string {
  if (!isValidId(value)) throw new ApiError('Not found', 404, 'NOT_FOUND');
  return value;
}
