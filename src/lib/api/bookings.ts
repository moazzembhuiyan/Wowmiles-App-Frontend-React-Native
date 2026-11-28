import { ApiError, apiGet, apiPost, apiRequest, requireId } from './client';

/** Mirrors `BookingClaim.status`. */
export type ClaimStatus =
  | 'received'
  | 'under_review'
  | 'escalated'
  | 'needs_information'
  | 'approved'
  | 'duplicate'
  | 'rejected'
  | 'cancelled';

/** Mirrors the `duplicateOf` field of a duplicate claim: only the date, never an identity. */
export type ClaimDuplicateOf = { registeredAt: string };

export type ClaimTimelineEntry = { type: string; at: string; note?: string | null };

/** Mirrors an entry of `BookingClaim.messages` for the needs-information thread. */
export type ClaimMessage = { from: 'supplier' | 'agent' | 'admin'; body: string; at: string };

/** One claim as returned by `GET /booking-claims` (list items omit `timeline`, `messages` and `evidence`). */
export type BookingClaim = {
  id: string;
  publicId: string;
  status: ClaimStatus;
  supplierReference: string;
  title: string;
  partnerInfo: { id: string; name: string; logo: string | null } | null;
  categoryInfo: { id: string; key: string; name: string } | null;
  startDate: string;
  endDate: string;
  nights: number;
  amountMinor: number;
  currency: string;
  amountEurMinor: number;
  estimatedMiles: number;
  awardedMiles: number;
  milesPhase: 'none' | 'pending' | 'available' | 'reversed';
  appealStatus: 'none' | 'open' | 'needs_evidence' | 'upheld' | 'dismissed';
  duplicateOf: ClaimDuplicateOf | null;
  reversal: { milesReversed: number; unspent: number; deficit: number } | null;
  createdAt: string;
  timeline?: ClaimTimelineEntry[];
  messages?: ClaimMessage[];
  evidence?: { url: string; name?: string }[];
};

export type ClaimsSummary = { pendingMiles: number; awaiting: number; needsYou: number; confirmedThisYear: number };

/** A local file chosen with the document picker. */
export type PickedDocument = { name: string; uri: string; size?: number };

/** Body of `POST /booking-claims`. The declaration is required by the backend. */
export type CreateClaimInput = {
  /** Supplier category key, for example `hotel-chain`. */
  categoryKey: string;
  /** Partner id from `GET /partners`. */
  partnerId: string;
  supplierReference: string;
  title: string;
  amount: number;
  currency: string;
  /** Dates as typed (`4 Nov 2026`) or ISO. */
  startDate: string;
  endDate: string;
  declarationAccepted: boolean;
  evidence: PickedDocument;
  /** One key per submit action; reuse it when the same action is retried. */
  idempotencyKey: string;
};

/** Body of `POST /booking-claims/:id/respond`. */
export type RespondInput = { id: string; message: string; supplierReference?: string };

export type AppealReason = 'not_cancelled' | 'only_part' | 'wrong_booking' | 'other';

export type AppealInput = { id: string; reasonCode: AppealReason; message?: string; evidence: PickedDocument };

export type ClaimEstimate = { amountEur: number; baseMiles: number; multiplier: number; miles: number };

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/** Accepts `4 Nov 2026`, `2026-11-04` or `04/11/2026` and returns `YYYY-MM-DD`; null when it is not a date. */
export function parseBookingDate(text: string): string | null {
  const value = text.trim();
  let year: number;
  let month: number;
  let day: number;
  let match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (match) {
    [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  } else if ((match = /^(\d{1,2})\s+([A-Za-z]{3})[A-Za-z]*\.?,?\s+(\d{4})$/.exec(value))) {
    [day, month, year] = [Number(match[1]), MONTHS.indexOf(match[2].toLowerCase()) + 1, Number(match[3])];
  } else if ((match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value))) {
    [day, month, year] = [Number(match[1]), Number(match[2]), Number(match[3])];
  } else {
    return null;
  }
  const date = new Date(Date.UTC(year, month - 1, day));
  if (month < 1 || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date.toISOString().slice(0, 10);
}

function requireDate(text: string, label: string): string {
  const iso = parseBookingDate(text);
  if (!iso) throw new ApiError(`Enter the ${label} like 4 Nov 2026.`, 400, 'INVALID_DATE');
  return iso;
}

const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  heic: 'image/heic',
  webp: 'image/webp',
};

/** Uploads one private evidence file (`POST /upload?visibility=private&purpose=booking`). */
async function uploadEvidence(file: PickedDocument) {
  const type = MIME_BY_EXTENSION[file.name.split('.').pop()?.toLowerCase() ?? ''] ?? 'application/octet-stream';
  const form = new FormData();
  form.append('file', { uri: file.uri, name: file.name, type } as unknown as Blob);
  const res = await apiRequest<{ url: string }>('/upload', {
    method: 'POST',
    query: { visibility: 'private', purpose: 'booking' },
    form,
  });
  return { url: res.data.url, name: file.name, size: file.size, mimetype: type };
}

type CategoryGroup = { group: string; categories: { id: string; key: string; name: string }[] };

async function resolveCategoryId(key: string): Promise<string> {
  const groups = await apiGet<CategoryGroup[]>('/supplier-categories');
  const found = groups.flatMap((group) => group.categories).find((category) => category.key === key);
  if (!found) throw new ApiError('This booking category is not available yet.', 404, 'CATEGORY_NOT_FOUND');
  return found.id;
}

/** `GET /booking-claims` (own claims, newest first) with the summary the list header shows. */
export async function listBookingClaims(): Promise<{ claims: BookingClaim[]; summary: ClaimsSummary }> {
  const res = await apiRequest<BookingClaim[]>('/booking-claims', { query: { status: 'all', limit: 100 } });
  const summary = (res.meta as { summary?: ClaimsSummary } | undefined)?.summary;
  return { claims: res.data, summary: summary ?? { pendingMiles: 0, awaiting: 0, needsYou: 0, confirmedThisYear: 0 } };
}

/** `GET /booking-claims/:id` with timeline and messages. */
export function getBookingClaim(id: string) {
  return apiGet<BookingClaim>(`/booking-claims/${requireId(id)}`);
}

/** Partners that offer a category: the suppliers an agent can pick for that booking type. */
export async function getBookingPartners(categoryKey: string): Promise<{ id: string; name: string }[]> {
  const category = await resolveCategoryId(categoryKey);
  const res = await apiRequest<{ id: string; name: string }[]>('/partners', { query: { category, limit: 100 } });
  return res.data.map((partner) => ({ id: partner.id, name: partner.name }));
}

/** `POST /booking-claims/estimate`. */
export async function estimateClaim(input: {
  categoryKey: string;
  partnerId: string;
  amount: number;
  currency: string;
  startDate: string;
}): Promise<ClaimEstimate> {
  const category = await resolveCategoryId(input.categoryKey);
  return apiPost<ClaimEstimate>('/booking-claims/estimate', {
    category,
    supplier: requireId(input.partnerId),
    amount: input.amount,
    currency: input.currency,
    startDate: requireDate(input.startDate, 'check-in date'),
  });
}

/** Uploads the proof, then `POST /booking-claims`. */
export async function createBookingClaim(input: CreateClaimInput): Promise<BookingClaim> {
  if (!input.declarationAccepted) {
    throw new ApiError('Confirm that this is a genuine booking.', 400, 'DECLARATION_REQUIRED');
  }
  const startDate = requireDate(input.startDate, 'check-in date');
  const endDate = requireDate(input.endDate, 'check-out date');
  const [category, evidence] = await Promise.all([resolveCategoryId(input.categoryKey), uploadEvidence(input.evidence)]);
  return apiPost<BookingClaim>(
    '/booking-claims',
    {
      category,
      supplier: requireId(input.partnerId),
      supplierReference: input.supplierReference.trim(),
      title: input.title.trim(),
      amount: input.amount,
      currency: input.currency,
      startDate,
      endDate,
      evidence: [evidence],
      declarationAccepted: true,
    },
    { idempotencyKey: input.idempotencyKey },
  );
}

/** Answers a supplier question, optionally with a corrected reference (`POST /booking-claims/:id/respond`). */
export async function respondToClaim(input: RespondInput): Promise<{ id: string; status: ClaimStatus }> {
  const reference = input.supplierReference?.trim();
  const message = input.message.trim() || (reference ? `Corrected reference: ${reference}` : '');
  if (!message) throw new ApiError('Add an answer or a new reference.', 400);
  const claim = await apiPost<BookingClaim>(`/booking-claims/${requireId(input.id)}/respond`, {
    message,
    supplierReference: reference || undefined,
  });
  return { id: claim.id, status: claim.status };
}

/** Uploads the proof, then `POST /booking-claims/:id/appeals`. */
export async function appealClaim(input: AppealInput): Promise<{ id: string }> {
  const id = requireId(input.id);
  const attachment = await uploadEvidence(input.evidence);
  return apiPost<{ id: string }>(`/booking-claims/${id}/appeals`, {
    reasonCode: input.reasonCode,
    message: input.message?.trim() || undefined,
    attachments: [attachment],
  });
}
