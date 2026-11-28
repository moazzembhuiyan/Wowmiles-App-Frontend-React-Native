import { QueryClient } from '@tanstack/react-query';

/**
 * Data layer contract.
 *
 * Every screen reads data through a fetcher in `src/lib/api/<area>.ts` and a TanStack Query hook.
 * Until the backend is wired in (Phase 4), fetchers return mock data through `mockResponse`,
 * shaped like the backend response in backend `docs/apis_guideline.md`. Phase 4 replaces the
 * body of each fetcher with an HTTP call; screens do not change.
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

/** Simulates a network round trip for mock data. */
export function mockResponse<T>(data: T, delayMs = 250): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delayMs);
  });
}

/** Simulates a failed request (use for error-state screens such as payment failed). */
export function mockError(message: string, status = 400, code?: string, delayMs = 250): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new ApiError(message, status, code)), delayMs);
  });
}
