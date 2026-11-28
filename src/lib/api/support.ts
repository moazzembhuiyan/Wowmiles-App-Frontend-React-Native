import { apiGet, apiPost, apiRequest, queryClient, requireId } from './client';
import { fetchProfileSummary } from './profile';

/**
 * Support data layer. Mirrors backend `docs/apis_guideline.md` T64 and section 4g:
 *   GET  /tickets?tab=open|resolved|all    -> fetchTickets
 *   GET  /tickets/:id (+ messages)         -> fetchTicket
 *   POST /tickets                          -> createTicket
 *   GET  /messages/chat/:id, POST /messages -> ticket messages, sendTicketMessage
 */

export type TicketCategory = 'booking' | 'miles' | 'redemption' | 'account' | 'other';
export type TicketStatus = 'open' | 'waiting' | 'resolved';

export const TICKET_CATEGORIES: { key: TicketCategory; label: string }[] = [
  { key: 'booking', label: 'Booking' },
  { key: 'miles', label: 'Miles' },
  { key: 'redemption', label: 'Redemption' },
  { key: 'account', label: 'Account' },
  { key: 'other', label: 'Other' },
];

export type Ticket = {
  id: string;
  publicId: string;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  waitingOn: 'support' | 'you' | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  lastMessage: { text: string; at: string; from: 'requester' | 'admin' };
};

export type TicketMessage = {
  id: string;
  from: 'requester' | 'admin';
  text: string;
  createdAt: string;
};

/** `replyEtaMinutes` is the time to the reply deadline (`slaDueAt`), or the tier reply window. */
export type TicketDetail = Ticket & { messages: TicketMessage[]; replyEtaMinutes: number };

export type TicketsResponse = {
  tickets: Ticket[];
  counts: { all: number; open: number; resolved: number };
  replyWindowLabel: string;
};

export type NewTicketInput = {
  subject: string;
  category: TicketCategory;
  message: string;
  /** One key per submit action; reuse it when the same request is retried. */
  idempotencyKey: string;
};

type RawTicket = {
  id: string;
  publicId: string;
  subject: string;
  category: TicketCategory;
  status: 'open' | 'pending' | 'closed';
  waitingOn: 'support' | 'you' | null;
  slaHours?: number;
  slaDueAt?: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  lastMessage: { text: string; at: string; from: 'requester' | 'admin' } | null;
};

type RawMessage = {
  _id: string;
  text: string | null;
  createdAt: string;
  sender: { _id: string; role: string } | null;
};

/** `pending` is "waiting on the agent"; `closed` is resolved. */
const STATUS: Record<RawTicket['status'], TicketStatus> = { open: 'open', pending: 'waiting', closed: 'resolved' };

function toTicket(raw: RawTicket): Ticket {
  return {
    id: raw.id,
    publicId: raw.publicId,
    subject: raw.subject,
    category: raw.category,
    status: STATUS[raw.status] ?? 'open',
    waitingOn: raw.waitingOn,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    resolvedAt: raw.resolvedAt,
    lastMessage: raw.lastMessage ?? { text: '', at: raw.updatedAt, from: 'requester' },
  };
}

/** Reply window by tier, as the backend sets `slaHours` (platinum 4, gold 12, silver 24). */
const TIER_SLA_HOURS: Record<string, number> = { platinum: 4, gold: 12, silver: 24 };

/** `GET /tickets`. */
export async function fetchTickets(): Promise<TicketsResponse> {
  const [res, profile] = await Promise.all([
    apiRequest<RawTicket[]>('/tickets', { query: { tab: 'all', limit: 100 } }),
    queryClient.fetchQuery({ queryKey: ['profile', 'summary'], queryFn: fetchProfileSummary }),
  ]);
  const counts = (res.meta as { counts?: { all: number; open: number; resolved: number } } | undefined)?.counts;
  const tickets = res.data.map(toTicket);
  const hours = TIER_SLA_HOURS[profile.tier.key] ?? 24;
  return {
    tickets,
    counts: counts ?? {
      all: tickets.length,
      open: tickets.filter((ticket) => ticket.status !== 'resolved').length,
      resolved: tickets.filter((ticket) => ticket.status === 'resolved').length,
    },
    replyWindowLabel: `${profile.tier.name} members get a reply within ${hours} hours`,
  };
}

/** `GET /tickets/:id` plus its messages (`GET /messages/chat/:id`). */
export async function fetchTicket(id: string): Promise<TicketDetail> {
  const ticketId = requireId(id);
  const [raw, messages] = await Promise.all([
    apiGet<RawTicket>(`/tickets/${ticketId}`),
    apiRequest<RawMessage[]>(`/messages/chat/${ticketId}`, { query: { sort: 'createdAt', limit: 100 } }),
  ]);
  const minutesLeft = raw.slaDueAt ? Math.round((new Date(raw.slaDueAt).getTime() - Date.now()) / 60_000) : null;
  return {
    ...toTicket(raw),
    messages: messages.data
      .filter((message) => message.text)
      .map((message) => ({
        id: message._id,
        from: message.sender && message.sender.role !== 'admin' ? 'requester' : 'admin',
        text: message.text as string,
        createdAt: message.createdAt,
      })),
    replyEtaMinutes: minutesLeft !== null ? Math.max(1, minutesLeft) : (raw.slaHours ?? 24) * 60,
  };
}

/** `POST /tickets` (an `Idempotency-Key` is required). */
export async function createTicket(input: NewTicketInput): Promise<Ticket> {
  const raw = await apiPost<RawTicket>(
    '/tickets',
    { subject: input.subject.trim(), category: input.category, message: input.message.trim() },
    { idempotencyKey: input.idempotencyKey },
  );
  return toTicket(raw);
}

/** `POST /messages` into the ticket's chat. */
export async function sendTicketMessage(ticketId: string, text: string): Promise<TicketMessage> {
  const raw = await apiPost<RawMessage>('/messages', { chatId: requireId(ticketId), text: text.trim() });
  return { id: raw._id, from: 'requester', text: raw.text ?? text.trim(), createdAt: raw.createdAt };
}

export const FAQS: { question: string; answer: string }[] = [
  { question: 'When do miles appear after a booking?', answer: 'Miles are pending until the supplier approves the booking, then become available after the pending period.' },
  { question: 'Why was my booking reversed?', answer: 'A supplier can reverse a booking that was cancelled or cannot be verified. The miles are returned and you can appeal once.' },
  { question: 'How do I reach the next tier?', answer: 'Status points come from approved bookings, training and events. See Tier benefits on the Miles screen.' },
  { question: 'Can I transfer miles to a colleague?', answer: 'No. WowMiles are personal and cannot be transferred or exchanged for cash.' },
];
