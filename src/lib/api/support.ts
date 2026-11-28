import { ApiError, mockResponse } from './client';

/**
 * Support data layer. Mirrors backend `docs/apis_guideline.md` T64 and section 4g:
 *   GET  /tickets?tab=open|resolved|all    -> fetchTickets
 *   GET  /tickets/:id (+ messages)         -> fetchTicket
 *   POST /tickets                          -> createTicket
 *   POST /messages (chat message)          -> sendTicketMessage
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

export type TicketDetail = Ticket & { messages: TicketMessage[]; replyEtaMinutes: number };

export type TicketsResponse = {
  tickets: Ticket[];
  counts: { all: number; open: number; resolved: number };
  replyWindowLabel: string;
};

export type NewTicketInput = { subject: string; category: TicketCategory; message: string };

const details: TicketDetail[] = [
  {
    id: '665f1a2b3c4d5e6f7a8b9c90',
    publicId: 'TCK-1042',
    subject: 'Booking WM-47998 reversal',
    category: 'booking',
    status: 'open',
    waitingOn: 'you',
    createdAt: '2026-11-24T09:12:00.000Z',
    updatedAt: '2026-11-26T09:16:00.000Z',
    resolvedAt: null,
    replyEtaMinutes: 5,
    lastMessage: { text: 'Just uploaded it to the appeal.', at: '2026-11-26T09:16:00.000Z', from: 'requester' },
    messages: [
      { id: 'm1', from: 'admin', text: 'Hi Daniel, thanks for getting in touch. I can see booking WM-47998 was reversed by Anantara on 2 October.', createdAt: '2026-11-26T09:12:00.000Z' },
      { id: 'm2', from: 'requester', text: 'The client rescheduled to January and Anantara reissued it under the same reference.', createdAt: '2026-11-26T09:14:00.000Z' },
      { id: 'm3', from: 'admin', text: 'Understood. Could you attach the reissued confirmation? I will pass it to the supplier team today.', createdAt: '2026-11-26T09:15:00.000Z' },
      { id: 'm4', from: 'requester', text: 'Just uploaded it to the appeal.', createdAt: '2026-11-26T09:16:00.000Z' },
    ],
  },
  {
    id: '665f1a2b3c4d5e6f7a8b9c91',
    publicId: 'TCK-1017',
    subject: 'Agency name correction',
    category: 'account',
    status: 'resolved',
    waitingOn: null,
    createdAt: '2026-09-11T08:00:00.000Z',
    updatedAt: '2026-09-12T10:00:00.000Z',
    resolvedAt: '2026-09-12T10:00:00.000Z',
    replyEtaMinutes: 5,
    lastMessage: { text: 'Your agency name has been updated.', at: '2026-09-12T10:00:00.000Z', from: 'admin' },
    messages: [
      { id: 'n1', from: 'requester', text: 'My agency name is misspelled on my profile.', createdAt: '2026-09-11T08:00:00.000Z' },
      { id: 'n2', from: 'admin', text: 'Your agency name has been updated.', createdAt: '2026-09-12T10:00:00.000Z' },
    ],
  },
];

function toTicket(detail: TicketDetail): Ticket {
  const { messages: _messages, replyEtaMinutes: _eta, ...ticket } = detail;
  return ticket;
}

export async function fetchTickets(): Promise<TicketsResponse> {
  const sorted = [...details].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const tickets = sorted.map(toTicket);
  return mockResponse({
    tickets,
    counts: {
      all: tickets.length,
      open: tickets.filter((ticket) => ticket.status !== 'resolved').length,
      resolved: tickets.filter((ticket) => ticket.status === 'resolved').length,
    },
    replyWindowLabel: 'Gold members get a reply within 1 working day',
  });
}

export async function fetchTicket(id: string): Promise<TicketDetail> {
  const found = details.find((detail) => detail.id === id || detail.publicId === id);
  if (!found) return Promise.reject(new ApiError('Ticket not found', 404, 'TICKET_NOT_FOUND'));
  return mockResponse({ ...found, messages: [...found.messages] }, 200);
}

export async function createTicket(input: NewTicketInput): Promise<Ticket> {
  await mockResponse(null, 450);
  if (details.filter((detail) => detail.status !== 'resolved').length >= 10) {
    throw new ApiError('You have too many open requests', 409, 'TOO_MANY_OPEN_TICKETS');
  }
  const now = new Date().toISOString();
  const detail: TicketDetail = {
    id: `665f1a2b3c4d5e6f7a8b9d${details.length.toString(16).padStart(2, '0')}`,
    publicId: `TCK-${1043 + details.length}`,
    subject: input.subject.trim(),
    category: input.category,
    status: 'open',
    waitingOn: 'support',
    createdAt: now,
    updatedAt: now,
    resolvedAt: null,
    replyEtaMinutes: 5,
    lastMessage: { text: input.message.trim(), at: now, from: 'requester' },
    messages: [{ id: `m-${now}`, from: 'requester', text: input.message.trim(), createdAt: now }],
  };
  details.unshift(detail);
  return toTicket(detail);
}

export async function sendTicketMessage(ticketId: string, text: string): Promise<TicketMessage> {
  await mockResponse(null, 250);
  const found = details.find((detail) => detail.id === ticketId);
  if (!found) throw new ApiError('Ticket not found', 404, 'TICKET_NOT_FOUND');
  if (found.status === 'resolved') throw new ApiError('This request is resolved', 409, 'TICKET_ALREADY_CLOSED');
  const now = new Date().toISOString();
  const message: TicketMessage = { id: `m-${now}`, from: 'requester', text: text.trim(), createdAt: now };
  found.messages.push(message);
  found.updatedAt = now;
  found.status = 'open';
  found.waitingOn = 'support';
  found.lastMessage = { text: message.text, at: now, from: 'requester' };
  return message;
}

export const FAQS: { question: string; answer: string }[] = [
  { question: 'When do miles appear after a booking?', answer: 'Miles are pending until the supplier approves the booking, then become available after the pending period.' },
  { question: 'Why was my booking reversed?', answer: 'A supplier can reverse a booking that was cancelled or cannot be verified. The miles are returned and you can appeal once.' },
  { question: 'How do I reach the next tier?', answer: 'Status points come from approved bookings, training and events. See Tier benefits on the Miles screen.' },
  { question: 'Can I transfer miles to a colleague?', answer: 'No. WowMiles are personal and cannot be transferred or exchanged for cash.' },
];
