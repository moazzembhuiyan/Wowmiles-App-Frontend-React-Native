import { ApiError, mockResponse } from './client';

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

const RANGE: EventAward = { mode: 'range', fixedMiles: null, minMiles: 100, maxMiles: 1000, stepMiles: 100 };

const baseEvent = {
  country: '',
  onlineUrl: '',
  timezone: 'GST',
  doorsInfo: '',
  stand: '',
  perks: [] as string[],
  capacity: null,
  registeredCount: 0,
  spotsLeft: null,
  registrationOpen: true,
  status: 'published' as const,
  award: RANGE,
  myRegistration: null,
};

const events: EventItem[] = [
  {
    ...baseEvent,
    id: '665f1a2b3c4d5e6f7a8b9c60',
    publicId: 'WM-EVT-20418',
    title: 'World Travel Market London 2026',
    description:
      'The largest travel trade event in the calendar. Beverly Group hosts a dedicated stand for WowMiles agents with partner meetings, product briefings and a networking reception.',
    venue: 'ExCeL London',
    city: 'London',
    country: 'United Kingdom',
    startsAt: '2026-12-07T09:00:00.000Z',
    endsAt: '2026-12-09T18:00:00.000Z',
    type: 'trade_fair',
    isOnline: false,
    timezone: 'GMT',
    doorsInfo: 'Doors 9:00 AM daily',
    stand: 'N420',
    perks: [
      'Priority access to the Beverly Group stand',
      'Scheduled meetings with partner brands',
      'Invitation to the Wednesday reception',
    ],
    sponsor: 'Beverly Group',
    capacity: 120,
    registeredCount: 42,
    spotsLeft: 78,
    myRegistration: { id: '665f1a2b3c4d5e6f7a8b9c50', publicId: 'EV-00071', status: 'registered', idCode: 'WM-EVT-20418' },
  },
  {
    ...baseEvent,
    id: '665f1a2b3c4d5e6f7a8b9c61',
    publicId: 'WM-EVT-20431',
    title: 'Arabian Travel Market Preview',
    description: 'A preview of the season with regional suppliers, held ahead of the main fair.',
    venue: 'Dubai World Trade Centre',
    city: 'Dubai',
    country: 'United Arab Emirates',
    startsAt: '2026-12-18T10:00:00.000Z',
    endsAt: '2026-12-18T17:00:00.000Z',
    type: 'trade_fair',
    isOnline: false,
    doorsInfo: 'Doors 10:00 AM',
    perks: ['Supplier meetings', 'Regional product briefing'],
    sponsor: 'Dubai Tourism',
    capacity: 200,
    registeredCount: 88,
    spotsLeft: 112,
  },
  {
    ...baseEvent,
    id: '665f1a2b3c4d5e6f7a8b9c62',
    publicId: 'WM-EVT-20444',
    title: 'MSC Cruises product workshop',
    description: 'Hands-on briefing on the winter Mediterranean programme and agent incentives.',
    venue: 'Radisson Blu Dhaka',
    city: 'Dhaka',
    country: 'Bangladesh',
    startsAt: '2026-12-02T14:00:00.000Z',
    endsAt: '2026-12-02T17:00:00.000Z',
    type: 'workshop',
    isOnline: false,
    timezone: 'BST',
    doorsInfo: 'Doors 1:30 PM',
    perks: ['Agent incentive pack', 'Cabin walkthrough'],
    sponsor: 'MSC Cruises',
    capacity: 60,
    registeredCount: 41,
    spotsLeft: 19,
    myRegistration: { id: '665f1a2b3c4d5e6f7a8b9c51', publicId: 'EV-00072', status: 'registered', idCode: 'WM-EVT-20444' },
  },
  {
    ...baseEvent,
    id: '665f1a2b3c4d5e6f7a8b9c63',
    publicId: 'WM-EVT-20452',
    title: 'Emirates premium cabins briefing',
    description: 'Live walkthrough of the premium economy and business cabins with selling tips.',
    venue: 'Online',
    city: '',
    country: '',
    startsAt: '2026-12-09T11:00:00.000Z',
    endsAt: '2026-12-09T12:00:00.000Z',
    type: 'webinar',
    isOnline: true,
    onlineUrl: 'https://events.wowmiles.example/emirates-briefing',
    perks: ['Recording sent after the session', 'Q&A with the Emirates trade team'],
    sponsor: 'Emirates',
  },
  {
    ...baseEvent,
    id: '665f1a2b3c4d5e6f7a8b9c64',
    publicId: 'WM-EVT-20301',
    title: 'Maldives resorts roadshow',
    description: 'Resort partners present new villas and agent rates.',
    venue: 'Hilton Dhaka',
    city: 'Dhaka',
    country: 'Bangladesh',
    startsAt: '2026-10-14T10:00:00.000Z',
    endsAt: '2026-10-14T16:00:00.000Z',
    type: 'trade_fair',
    isOnline: false,
    timezone: 'BST',
    perks: ['Resort rate sheets'],
    sponsor: 'Anantara',
    registrationOpen: false,
    status: 'ended',
    myRegistration: { id: '665f1a2b3c4d5e6f7a8b9c52', publicId: 'EV-00040', status: 'attended', idCode: 'WM-EVT-20301' },
  },
  {
    ...baseEvent,
    id: '665f1a2b3c4d5e6f7a8b9c65',
    publicId: 'WM-EVT-20288',
    title: 'Selling cruises in 2027',
    description: 'Webinar on how to position cruise products to first-time clients.',
    venue: 'Online',
    city: '',
    country: '',
    startsAt: '2026-09-22T12:00:00.000Z',
    endsAt: '2026-09-22T13:00:00.000Z',
    type: 'webinar',
    isOnline: true,
    sponsor: 'Beverly Group',
    registrationOpen: false,
    status: 'ended',
    myRegistration: { id: '665f1a2b3c4d5e6f7a8b9c53', publicId: 'EV-00031', status: 'attended', idCode: 'WM-EVT-20288' },
  },
];

function findEvent(id: string): EventItem {
  const found = events.find((event) => event.id === id || event.publicId === id);
  if (!found) throw new ApiError('Event not found', 404, 'EVENT_NOT_FOUND');
  return found;
}

export async function fetchEvents(params: { when?: EventWhen; type?: EventType } = {}): Promise<EventItem[]> {
  const { when = 'upcoming', type } = params;
  const list = events
    .filter((event) => (when === 'past' ? event.status === 'ended' : event.status === 'published'))
    .filter((event) => !type || event.type === type)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  return mockResponse(list.map((event) => ({ ...event })));
}

export async function fetchEvent(id: string): Promise<EventItem> {
  await mockResponse(null, 150);
  return { ...findEvent(id) };
}

export async function registerForEvent(id: string): Promise<MyRegistration> {
  await mockResponse(null, 350);
  const event = findEvent(id);
  if (event.myRegistration?.status === 'registered') {
    throw new ApiError('You are already registered for this event', 409, 'ALREADY_REGISTERED');
  }
  if (event.spotsLeft === 0) throw new ApiError('This event is full', 409, 'EVENT_FULL');
  const registration: MyRegistration = {
    id: `665f1a2b3c4d5e6f7a8b9d${events.indexOf(event).toString(16).padStart(2, '0')}`,
    publicId: `EV-${String(100 + events.indexOf(event)).padStart(5, '0')}`,
    status: 'registered',
    idCode: event.publicId,
  };
  event.myRegistration = registration;
  event.registeredCount += 1;
  if (event.spotsLeft !== null) event.spotsLeft -= 1;
  return registration;
}

export async function cancelRegistration(id: string): Promise<{ cancelled: true }> {
  await mockResponse(null, 350);
  const event = findEvent(id);
  if (event.myRegistration?.status !== 'registered') {
    throw new ApiError('No active registration for this event', 404, 'NOT_REGISTERED');
  }
  if (new Date(event.startsAt).getTime() <= Date.now()) {
    throw new ApiError('This event has already started', 409, 'EVENT_STARTED');
  }
  event.myRegistration = null;
  event.registeredCount -= 1;
  if (event.spotsLeft !== null) event.spotsLeft += 1;
  return { cancelled: true };
}

export async function fetchMyEvents(when: EventWhen = 'upcoming'): Promise<EventItem[]> {
  const list = events
    .filter((event) => event.myRegistration && event.myRegistration.status !== 'cancelled')
    .filter((event) => (when === 'past' ? event.status === 'ended' : event.status === 'published'))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  return mockResponse(list.map((event) => ({ ...event })));
}

export async function fetchEventsSummary(): Promise<EventsSummary> {
  const upcomingCount = events.filter(
    (event) => event.status === 'published' && event.myRegistration?.status === 'registered',
  ).length;
  return mockResponse({ milesEarnedAtEvents: 900, eventsAttended: 11, upcomingCount });
}

export async function fetchTicket(registrationId: string): Promise<EventTicket> {
  const event = events.find((item) => item.myRegistration?.id === registrationId);
  if (!event || !event.myRegistration || event.myRegistration.status === 'cancelled') {
    return Promise.reject(new ApiError('Ticket not found', 404, 'TICKET_NOT_FOUND'));
  }
  const registration = event.myRegistration;
  return mockResponse({
    registrationId: registration.id,
    publicId: registration.publicId,
    status: registration.status,
    qrPayload: JSON.stringify({
      registrationId: registration.id,
      qrToken: 'b7f3a9c1e5d24f60a8b3c9d7e1f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8',
    }),
    idCode: registration.idCode,
    agent: { name: 'Daniel Reed', agencyName: 'Beverly Travel Ltd.' },
    event: { ...event },
  });
}
