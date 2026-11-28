import { ApiError, mockResponse } from './client';

/** Mirrors `BookingClaim.status`. */
export type ClaimStatus =
  | 'received'
  | 'under_review'
  | 'needs_information'
  | 'approved'
  | 'duplicate'
  | 'rejected'
  | 'cancelled';

/** Mirrors the `duplicateOf` field of a duplicate claim: only the date, never an identity. */
export type ClaimDuplicateOf = { registeredAt: string };

/** Mirrors an entry of `BookingClaim.messages` for the needs-information thread. */
export type ClaimMessage = { from: 'supplier' | 'agent'; body: string; at: string };

/** Body of `POST /booking-claims` (the declaration is required). */
export type CreateClaimInput = {
  supplierReference: string;
  title: string;
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  declarationAccepted: boolean;
};

/** Body of `POST /booking-claims/:id/respond`. */
export type RespondInput = { id: string; message: string; supplierReference?: string };

export function createBookingClaim(input: CreateClaimInput) {
  if (!input.declarationAccepted) {
    return Promise.reject(new ApiError('Confirm that this is a genuine booking.', 400, 'DECLARATION_REQUIRED'));
  }
  return mockResponse({ status: 'received' as ClaimStatus }, 500);
}

/** Answers a supplier question, optionally with a corrected reference. A reference ending in 0000 resolves as already claimed. */
export function respondToClaim(input: RespondInput) {
  if (!input.message.trim() && !input.supplierReference?.trim()) {
    return Promise.reject(new ApiError('Add an answer or a new reference.', 400));
  }
  const duplicate = input.supplierReference?.trim().endsWith('0000') ?? false;
  return mockResponse({ id: input.id, status: (duplicate ? 'duplicate' : 'under_review') as ClaimStatus }, 500);
}
