/**
 * Tickets Service - CRUD operations for tickets and orders
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Ticket, Order } from '@eventscv/shared-types';

// Re-export types for convenience
export type { Ticket, Order };

// ============================================
// TICKETS
// ============================================

export interface TicketFilters {
  status?: 'valid' | 'used' | 'cancelled' | 'refunded' | 'transferred';
  ticketTypeId?: string;
  userId?: string;
}

export interface PaginationOptions {
  pageSize?: number;
  lastDoc?: DocumentSnapshot;
}

// Get tickets for an event
export async function getTickets(
  eventId: string,
  filters?: TicketFilters,
  pagination?: PaginationOptions
): Promise<{ tickets: Ticket[]; lastDoc: DocumentSnapshot | null }> {
  let q = query(
    collection(db, 'events', eventId, 'tickets'),
    orderBy('purchasedAt', 'desc')
  );

  if (filters?.status) {
    q = query(q, where('status', '==', filters.status));
  }

  if (filters?.ticketTypeId) {
    q = query(q, where('ticketTypeId', '==', filters.ticketTypeId));
  }

  if (pagination?.pageSize) {
    q = query(q, limit(pagination.pageSize));
  }

  if (pagination?.lastDoc) {
    q = query(q, startAfter(pagination.lastDoc));
  }

  const snapshot = await getDocs(q);
  const tickets = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Ticket[];

  const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

  return { tickets, lastDoc };
}

// Get a single ticket
export async function getTicket(
  eventId: string,
  ticketId: string
): Promise<Ticket | null> {
  const docRef = doc(db, 'events', eventId, 'tickets', ticketId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return { id: docSnap.id, ...docSnap.data() } as Ticket;
}

// Get ticket by QR code
export async function getTicketByQRCode(
  eventId: string,
  qrCode: string
): Promise<Ticket | null> {
  const q = query(
    collection(db, 'events', eventId, 'tickets'),
    where('qrCode', '==', qrCode),
    limit(1)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Ticket;
}

// Check in a ticket
export async function checkInTicket(
  eventId: string,
  ticketId: string,
  checkedInBy: string
): Promise<void> {
  const docRef = doc(db, 'events', eventId, 'tickets', ticketId);
  await updateDoc(docRef, {
    status: 'used',
    checkedInAt: Timestamp.now(),
    checkedInBy,
    updatedAt: Timestamp.now(),
  });
}

// Cancel check-in (revert to valid)
export async function cancelCheckIn(
  eventId: string,
  ticketId: string
): Promise<void> {
  const docRef = doc(db, 'events', eventId, 'tickets', ticketId);
  await updateDoc(docRef, {
    status: 'valid',
    checkedInAt: null,
    checkedInBy: null,
    updatedAt: Timestamp.now(),
  });
}

// Refund a ticket
export async function refundTicket(
  eventId: string,
  ticketId: string,
  reason: string,
  refundedBy: string
): Promise<void> {
  const docRef = doc(db, 'events', eventId, 'tickets', ticketId);
  await updateDoc(docRef, {
    status: 'refunded',
    refundReason: reason,
    refundedAt: Timestamp.now(),
    refundedBy,
    updatedAt: Timestamp.now(),
  });
}

// Transfer a ticket to another user
export async function transferTicket(
  eventId: string,
  ticketId: string,
  fromUserId: string,
  toUserId: string,
  toUserEmail: string
): Promise<void> {
  const docRef = doc(db, 'events', eventId, 'tickets', ticketId);
  await updateDoc(docRef, {
    userId: toUserId,
    userEmail: toUserEmail,
    transferredFrom: fromUserId,
    transferredAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

// ============================================
// ORDERS
// ============================================

export interface OrderFilters {
  status?: 'pending' | 'completed' | 'failed' | 'refunded';
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// Get orders for an event
export async function getOrders(
  eventId: string,
  filters?: OrderFilters,
  pagination?: PaginationOptions
): Promise<{ orders: Order[]; lastDoc: DocumentSnapshot | null }> {
  let q = query(
    collection(db, 'events', eventId, 'orders'),
    orderBy('createdAt', 'desc')
  );

  if (filters?.status) {
    q = query(q, where('status', '==', filters.status));
  }

  if (filters?.userId) {
    q = query(q, where('userId', '==', filters.userId));
  }

  if (pagination?.pageSize) {
    q = query(q, limit(pagination.pageSize));
  }

  if (pagination?.lastDoc) {
    q = query(q, startAfter(pagination.lastDoc));
  }

  const snapshot = await getDocs(q);
  const orders = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Order[];

  const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

  return { orders, lastDoc };
}

// Get a single order
export async function getOrder(
  eventId: string,
  orderId: string
): Promise<Order | null> {
  const docRef = doc(db, 'events', eventId, 'orders', orderId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return { id: docSnap.id, ...docSnap.data() } as Order;
}

// Refund an order (refunds all tickets in the order)
export async function refundOrder(
  eventId: string,
  orderId: string,
  reason: string,
  refundedBy: string
): Promise<void> {
  const docRef = doc(db, 'events', eventId, 'orders', orderId);

  // Update order status
  await updateDoc(docRef, {
    status: 'refunded',
    refundReason: reason,
    refundedAt: Timestamp.now(),
    refundedBy,
    updatedAt: Timestamp.now(),
  });

  // Get and refund all tickets from this order
  const ticketsQuery = query(
    collection(db, 'events', eventId, 'tickets'),
    where('orderId', '==', orderId)
  );

  const ticketsSnapshot = await getDocs(ticketsQuery);

  for (const ticketDoc of ticketsSnapshot.docs) {
    await updateDoc(ticketDoc.ref, {
      status: 'refunded',
      refundReason: reason,
      refundedAt: Timestamp.now(),
      refundedBy,
      updatedAt: Timestamp.now(),
    });
  }
}

// ============================================
// TICKET STATS
// ============================================

export interface TicketStats {
  total: number;
  valid: number;
  used: number;
  cancelled: number;
  refunded: number;
  checkInRate: number;
}

export async function getTicketStats(eventId: string): Promise<TicketStats> {
  const ticketsQuery = collection(db, 'events', eventId, 'tickets');
  const snapshot = await getDocs(ticketsQuery);

  const stats = {
    total: 0,
    valid: 0,
    used: 0,
    cancelled: 0,
    refunded: 0,
    checkInRate: 0,
  };

  snapshot.docs.forEach((doc) => {
    const ticket = doc.data();
    stats.total++;

    switch (ticket.status) {
      case 'valid':
        stats.valid++;
        break;
      case 'used':
        stats.used++;
        break;
      case 'cancelled':
        stats.cancelled++;
        break;
      case 'refunded':
        stats.refunded++;
        break;
    }
  });

  const activeTickets = stats.valid + stats.used;
  stats.checkInRate = activeTickets > 0 ? (stats.used / activeTickets) * 100 : 0;

  return stats;
}
