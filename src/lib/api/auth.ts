import { ApiError, apiGet, apiPost, apiRequest } from './client';
import { clearTokens, getTokens, loadTokens, saveTokens } from '@/lib/auth/tokens';

/**
 * Auth data layer. Mirrors backend `docs/apis_guideline.md` sections 1 to 3:
 *   POST /auth/login-with-email, /auth/signup-with-email, /auth/forgot-password,
 *        /auth/reset-password, /auth/logout, /auth/change-password
 *   POST /otp/verify, /otp/send-otp-in-email
 *   POST /upload, POST /kyc, GET /kyc/me, GET /users/me
 */

export type AuthUser = {
  name: string;
  email?: string;
  role: string;
  profileAvatar?: string | null;
};

type SessionResponse = { user: AuthUser; accessToken: string; refreshToken: string };

/** Roles that may use the agent app. */
const APP_ROLES = ['agent', 'supplier'];

export type KycStatus = 'pending' | 'approved' | 'rejected' | 'needs_document' | 'none';

export type AuthRoute = '/(tabs)' | '/(auth)/pending' | '/(auth)/rejected' | '/(auth)/agency';

/** Where a signed-in user belongs, from the agency verification status. */
export async function fetchAuthRoute(): Promise<AuthRoute> {
  const status = await fetchKycStatus();
  if (status === 'approved') return '/(tabs)';
  if (status === 'pending') return '/(auth)/pending';
  if (status === 'none') return '/(auth)/agency';
  return '/(auth)/rejected';
}

export type KycStepState = 'done' | 'in_progress' | 'pending' | 'failed' | 'action_required';

/** `GET /kyc/me`: the review progress shown on the pending and rejected screens. */
export type KycDetail = {
  status: KycStatus;
  agencyName: string;
  rejectedReason: string | null;
  /** What the reviewer could not read, when the status is `needs_document`. */
  reviewNote?: string | null;
  steps: { key: 'submitted' | 'review' | 'activated'; state: KycStepState; at: string | null }[];
};

export function fetchKycDetail() {
  return apiGet<KycDetail>('/kyc/me');
}

async function fetchKycStatus(): Promise<KycStatus> {
  try {
    const kyc = await apiGet<{ status: KycStatus }>('/kyc/me');
    return kyc.status;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return 'none';
    throw error;
  }
}

export async function loginWithEmail(input: { email: string; password: string; rememberMe: boolean }): Promise<AuthUser> {
  const session = await apiPost<SessionResponse>('/auth/login-with-email', input, { auth: false });
  if (!APP_ROLES.includes(session.user.role)) {
    throw new ApiError('This app is for travel agents. Use the web portal for your account.', 403, 'WRONG_ROLE');
  }
  await saveTokens({ accessToken: session.accessToken, refreshToken: session.refreshToken });
  return session.user;
}

/** Loads the signed-in user from stored tokens; null when there is no session. */
export async function restoreUser(): Promise<AuthUser | null> {
  if (!(await loadTokens())) return null;
  return apiGet<AuthUser>('/users/me');
}

/** Revokes the refresh session on the server, then forgets the tokens even if the call fails. */
export async function logoutRemote(): Promise<void> {
  const tokens = getTokens();
  try {
    if (tokens) await apiPost('/auth/logout', { refreshToken: tokens.refreshToken });
  } catch {
    // The local session is cleared regardless; an expired server session needs no revoke.
  } finally {
    await clearTokens();
  }
}

export async function changePassword(input: { currentPassword: string; password: string; confirmPassword: string }) {
  await apiPost('/auth/change-password', input);
  // The backend revokes every session on a password change.
  await clearTokens();
}

// Signup and OTP verification

type PendingSignup = { email: string; otpToken: string };
let pendingSignup: PendingSignup | null = null;

export function getPendingSignupEmail(): string | null {
  return pendingSignup?.email ?? null;
}

export type SignupInput = { name: string; email: string; phone: string; password: string; acceptedTerms: boolean };

export async function signupWithEmail(input: SignupInput): Promise<void> {
  const data = await apiPost<{ otpToken: { verificationToken: string } }>(
    '/auth/signup-with-email',
    {
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.replace(/\D/g, ''),
      password: input.password,
      role: 'agent',
      isLegalTermsAccepted: input.acceptedTerms,
    },
    { auth: false },
  );
  pendingSignup = { email: input.email.trim().toLowerCase(), otpToken: data.otpToken.verificationToken };
}

function requirePendingSignup(): PendingSignup {
  if (!pendingSignup) throw new ApiError('Your signup session has ended. Please start again.', 401, 'SIGNUP_EXPIRED');
  return pendingSignup;
}

export type AgencyDocument = { uri: string; name: string; mimeType?: string };
export type AgencyInput = {
  agencyName: string;
  method: 'iata' | 'chamber_of_commerce';
  documentNumber: string;
  document: AgencyDocument;
};

/** Uploads the trade licence and submits the agency for verification, using the signup token. */
export async function submitAgency(input: AgencyInput): Promise<void> {
  const { otpToken } = requirePendingSignup();
  const form = new FormData();
  form.append('file', { uri: input.document.uri, name: input.document.name, type: input.document.mimeType ?? 'application/octet-stream' } as unknown as Blob);
  const upload = await apiRequest<{ url: string }>('/upload', { method: 'POST', query: { visibility: 'private', purpose: 'kyc' }, form, token: otpToken });
  await apiPost(
    '/kyc',
    {
      agencyName: input.agencyName.trim(),
      verification: { method: input.method, documentNumber: input.documentNumber.trim(), documentUrl: upload.data.url },
    },
    { token: otpToken },
  );
}

/** Confirms the signup code, starts the session and returns the next screen. */
export async function verifySignupOtp(code: string): Promise<{ user: AuthUser; route: AuthRoute }> {
  const { otpToken } = requirePendingSignup();
  const session = await apiPost<SessionResponse & { kyc: { status: KycStatus } | null }>(
    '/otp/verify',
    { otp: code },
    { token: otpToken, query: { type: 'signup' } },
  );
  await saveTokens({ accessToken: session.accessToken, refreshToken: session.refreshToken });
  pendingSignup = null;
  const status = session.kyc?.status ?? 'none';
  const route: AuthRoute = status === 'approved' ? '/(tabs)' : status === 'none' ? '/(auth)/agency' : status === 'pending' ? '/(auth)/pending' : '/(auth)/rejected';
  return { user: session.user, route };
}

export async function resendSignupOtp(): Promise<void> {
  const { email, otpToken } = requirePendingSignup();
  await apiPost('/otp/send-otp-in-email', { email }, { token: otpToken });
}

// Forgot password (6-digit code flow)

let pendingReset: { email: string; token: string } | null = null;

export function getPendingResetEmail(): string | null {
  return pendingReset?.email ?? null;
}

export async function requestPasswordReset(email: string): Promise<void> {
  const clean = email.trim().toLowerCase();
  const data = await apiPost<{ verificationToken: string }>('/auth/forgot-password', { email: clean, method: 'otp' }, { auth: false });
  pendingReset = { email: clean, token: data.verificationToken };
}

/** Verifies the emailed code, then sets the new password. The session returned by the code check is discarded. */
export async function resetPasswordWithCode(input: { code: string; password: string; confirmPassword: string }): Promise<void> {
  if (!pendingReset) throw new ApiError('Your reset session has ended. Request a new code.', 401, 'RESET_EXPIRED');
  const verified = await apiPost<{ accessToken: string }>('/otp/verify', { otp: input.code }, { token: pendingReset.token, query: { type: 'forgot' } });
  await apiPost('/auth/reset-password', { password: input.password, confirmPassword: input.confirmPassword }, { token: verified.accessToken });
  pendingReset = null;
}
