import { apiGet, apiPost, apiRequest, queryClient, requireId } from './client';
import { fetchProfileSummary } from './profile';

/**
 * Events data layer. Mirrors backend `docs/apis_guideline.md` sections 4f and 4h (T61):
 *   GET    /events                          -> fetchEvents
 *   GET    /events/:id                      -> fetchEvent
 *   POST   /events/:id/register             -> registerForEvent
 *   DELETE /events/:id/register             -> cancelRegistration
 *   GET    /me/events?when=upcoming|past    -> fetchMyEvents
 *   GET    /me/events/summary               -> fetchEventsSummary
 *   GET    /me/events/:registrationId/ticket -> fetchTicket
 */

export type EventType = 'trade_fair' | 'workshop' | 'webinar' | 'other';
export type RegistrationStatus = 'registered' | 'cancelled' | 'attended';

export type EventAward = {
  mode: 'fixed' | 'range';
  fixedMiles: number | null;
  minMiles: number | null;
  maxMiles: number | null;
  stepMiles: number | null;
};

export type MyRegistration = {
  id: string;
  publicId: string;
  status: RegistrationStatus;
  idCode: string;
};

export type EventItem = {
  id: string;
  publicId: string;
  title: string;
  description: string;
  venue: string;
  city: string;
  country: string;
  startsAt: string;
  endsAt: string;
  type: EventType;
  isOnline: boolean;
  onlineUrl: string;
  timezone: string;
  doorsInfo: string;
  stand: string;
  perks: string[];
  sponsor: string;
  capacity: number | null;
  registeredCount: number;
  spotsLeft: number | null;
  registrationOpen: boolean;
  status: 'published' | 'ended' | 'cancelled';
  award: EventAward;
  myRegistration: MyRegistration | null;
};

export type EventsSummary = {
  milesEarnedAtEvents: number;
  eventsAttended: number;
  upcomingCount: number;
};

export type EventTicket = {
  registrationId: string;
  publicId: string;
  status: RegistrationStatus;
  /** JSON string `{"registrationId","qrToken"}` to encode as a QR code. */
  qrPayload: string;
  idCode: string;
  agent: { name: string; agencyName: string };
  event: EventItem;
};

export type EventWhen = 'upcoming' | 'past';

export const EVENT_TYPE_LABEL: Record<EventType, string> = {
  trade_fair: 'Trade fair',
  workshop: 'Workshop',
  webinar: 'Webinar',
  other: 'Event',
};

type RawEvent = Partial<Omit<EventItem, 'id'>> & { _id?: string; id?: string; title: string; startsAt: string; endsAt: string };

const FIXED_AWARD: EventAward = { mode: 'fixed', fixedMiles: null, minMiles: null, maxMiles: null, stepMiles: null };

/** Fills what a partial event (the one embedded in a ticket or registration) leaves out. */
function toEvent(raw: RawEvent, registration: MyRegistration | null = null): EventItem {
  return {
    publicId: '',
    description: '',
    venue: '',
    city: '',
    country: '',
    type: 'other',
    isOnline: false,
    onlineUrl: '',
    timezone: 'UTC',
    doorsInfo: '',
    stand: '',
    perks: [],
    sponsor: '',
    capacity: null,
    registeredCount: 0,
    spotsLeft: null,
    registrationOpen: raw.status === 'published',
    status: 'published',
    award: FIXED_AWARD,
    myRegistration: registration,
    ...raw,
    id: String(raw._id ?? raw.id),
  };
}

/** `GET /events` (`when` is upcoming or past; `type` filters by event type). */
export async function fetchEvents(params: { when?: EventWhen; type?: EventType } = {}): Promise<EventItem[]> {
  const { when = 'upcoming', type } = params;
  const res = await apiRequest<RawEvent[]>('/events', { query: { when, type, limit: 50 } });
  return res.data.map((event) => toEvent(event));
}

export async function fetchEvent(id: string): Promise<EventItem> {
  return toEvent(await apiGet<RawEvent>(`/events/${requireId(id)}`));
}

export function registerForEvent(id: string): Promise<MyRegistration> {
  return apiPost<MyRegistration>(`/events/${requireId(id)}/register`);
}

export async function cancelRegistration(id: string): Promise<{ cancelled: true }> {
  await apiRequest(`/events/${requireId(id)}/register`, { method: 'DELETE' });
  return { cancelled: true };
}

type RawRegistration = { myRegistration: MyRegistration; event: RawEvent };

/** `GET /me/events`: registrations with the event embedded, flattened to events. */
export async function fetchMyEvents(when: EventWhen = 'upcoming'): Promise<EventItem[]> {
  const res = await apiRequest<RawRegistration[]>('/me/events', { query: { when, limit: 50 } });
  return res.data.map((row) => toEvent(row.event, row.myRegistration));
}

export function fetchEventsSummary(): Promise<EventsSummary> {
  return apiGet<EventsSummary>('/me/events/summary');
}

type RawTicket = Omit<EventTicket, 'agent' | 'event'> & { event: RawEvent };

/** `GET /me/events/:registrationId/ticket`. The backend omits the agent card, so it comes from the profile summary. */
export async function fetchTicket(registrationId: string): Promise<EventTicket> {
  const [ticket, profile] = await Promise.all([
    apiGet<RawTicket>(`/me/events/${requireId(registrationId)}/ticket`),
    queryClient.fetchQuery({ queryKey: ['profile', 'summary'], queryFn: fetchProfileSummary }),
  ]);
  return {
    ...ticket,
    agent: { name: profile.profile.name, agencyName: profile.agency.name },
    event: toEvent(ticket.event, { id: ticket.registrationId, publicId: ticket.publicId, status: ticket.status, idCode: ticket.idCode }),
  };
}
