/**
 * Events Service - CRUD operations for events
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Event, TicketType } from '@eventscv/shared-types';

// Re-export types for convenience
export type { Event, TicketType };

const EVENTS_COLLECTION = 'events';

export interface EventFilters {
  status?: 'draft' | 'published' | 'cancelled' | 'completed';
  category?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface PaginationOptions {
  pageSize?: number;
  lastDoc?: DocumentSnapshot;
}

export interface EventFormData {
  title: string;
  description: string;
  shortDescription?: string;
  category: string;
  startDate: Date;
  endDate: Date;
  location: {
    name: string;
    address: string;
    city: string;
    island: string;
    coordinates?: { lat: number; lng: number };
  };
  coverImage?: string;
  gallery?: string[];
  capacity: number;
  status: 'draft' | 'published';
  tags?: string[];
  ageRestriction?: number;
  features?: string[];
}

// Get all events for an organization
export async function getEvents(
  organizationId: string,
  filters?: EventFilters,
  pagination?: PaginationOptions
): Promise<{ events: Event[]; lastDoc: DocumentSnapshot | null }> {
  let q = query(
    collection(db, EVENTS_COLLECTION),
    where('organizationId', '==', organizationId),
    orderBy('startDate', 'desc')
  );

  if (filters?.status) {
    q = query(q, where('status', '==', filters.status));
  }

  if (pagination?.pageSize) {
    q = query(q, limit(pagination.pageSize));
  }

  if (pagination?.lastDoc) {
    q = query(q, startAfter(pagination.lastDoc));
  }

  const snapshot = await getDocs(q);
  const events = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Event[];

  const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

  return { events, lastDoc };
}

// Get all events (Super Admin)
export async function getAllEvents(
  filters?: EventFilters,
  pagination?: PaginationOptions
): Promise<{ events: Event[]; lastDoc: DocumentSnapshot | null }> {
  let q = query(
    collection(db, EVENTS_COLLECTION),
    orderBy('startDate', 'desc')
  );

  if (filters?.status) {
    q = query(q, where('status', '==', filters.status));
  }

  if (pagination?.pageSize) {
    q = query(q, limit(pagination.pageSize));
  }

  if (pagination?.lastDoc) {
    q = query(q, startAfter(pagination.lastDoc));
  }

  const snapshot = await getDocs(q);
  const events = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Event[];

  const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

  return { events, lastDoc };
}

// Get a single event by ID
export async function getEvent(eventId: string): Promise<Event | null> {
  const docRef = doc(db, EVENTS_COLLECTION, eventId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return { id: docSnap.id, ...docSnap.data() } as Event;
}

// Create a new event
export async function createEvent(
  organizationId: string,
  data: EventFormData
): Promise<string> {
  const eventData = {
    ...data,
    organizationId,
    startDate: Timestamp.fromDate(data.startDate),
    endDate: Timestamp.fromDate(data.endDate),
    ticketsSold: 0,
    revenue: 0,
    checkIns: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const docRef = await addDoc(collection(db, EVENTS_COLLECTION), eventData);
  return docRef.id;
}

// Update an event
export async function updateEvent(
  eventId: string,
  data: Partial<EventFormData>
): Promise<void> {
  const docRef = doc(db, EVENTS_COLLECTION, eventId);

  const updateData: Record<string, unknown> = {
    ...data,
    updatedAt: Timestamp.now(),
  };

  if (data.startDate) {
    updateData.startDate = Timestamp.fromDate(data.startDate);
  }
  if (data.endDate) {
    updateData.endDate = Timestamp.fromDate(data.endDate);
  }

  await updateDoc(docRef, updateData);
}

// Delete an event (soft delete - set status to cancelled)
export async function deleteEvent(eventId: string): Promise<void> {
  const docRef = doc(db, EVENTS_COLLECTION, eventId);
  await updateDoc(docRef, {
    status: 'cancelled',
    updatedAt: Timestamp.now(),
  });
}

// Hard delete an event (only for drafts)
export async function hardDeleteEvent(eventId: string): Promise<void> {
  const docRef = doc(db, EVENTS_COLLECTION, eventId);
  await deleteDoc(docRef);
}

// Publish an event
export async function publishEvent(eventId: string): Promise<void> {
  const docRef = doc(db, EVENTS_COLLECTION, eventId);
  await updateDoc(docRef, {
    status: 'published',
    publishedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

// Unpublish an event (back to draft)
export async function unpublishEvent(eventId: string): Promise<void> {
  const docRef = doc(db, EVENTS_COLLECTION, eventId);
  await updateDoc(docRef, {
    status: 'draft',
    updatedAt: Timestamp.now(),
  });
}

// ============================================
// TICKET TYPES (subcollection of events)
// ============================================

// Get ticket types for an event
export async function getTicketTypes(eventId: string): Promise<TicketType[]> {
  const q = query(
    collection(db, EVENTS_COLLECTION, eventId, 'ticketTypes'),
    orderBy('price', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as TicketType[];
}

// Create a ticket type
export async function createTicketType(
  eventId: string,
  data: Omit<TicketType, 'id' | 'sold'>
): Promise<string> {
  const ticketData = {
    ...data,
    sold: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const docRef = await addDoc(
    collection(db, EVENTS_COLLECTION, eventId, 'ticketTypes'),
    ticketData
  );
  return docRef.id;
}

// Update a ticket type
export async function updateTicketType(
  eventId: string,
  ticketTypeId: string,
  data: Partial<TicketType>
): Promise<void> {
  const docRef = doc(db, EVENTS_COLLECTION, eventId, 'ticketTypes', ticketTypeId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

// Delete a ticket type
export async function deleteTicketType(
  eventId: string,
  ticketTypeId: string
): Promise<void> {
  const docRef = doc(db, EVENTS_COLLECTION, eventId, 'ticketTypes', ticketTypeId);
  await deleteDoc(docRef);
}

// ============================================
// EVENT STATS
// ============================================

export interface EventStats {
  totalTicketsSold: number;
  totalRevenue: number;
  totalCheckIns: number;
  ticketsByType: Record<string, number>;
  salesByDay: { date: string; count: number; revenue: number }[];
}

export async function getEventStats(eventId: string): Promise<EventStats> {
  // Get event data
  const event = await getEvent(eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  // Get ticket types
  const ticketTypes = await getTicketTypes(eventId);

  // Calculate stats
  const ticketsByType: Record<string, number> = {};
  let totalTicketsSold = 0;
  let totalRevenue = 0;

  for (const t of ticketTypes) {
    const ticketType = t as TicketType & { sold?: number };
    ticketsByType[ticketType.name] = ticketType.sold || 0;
    totalTicketsSold += ticketType.sold || 0;
    totalRevenue += (ticketType.sold || 0) * ticketType.price;
  }

  return {
    totalTicketsSold,
    totalRevenue,
    totalCheckIns: event.checkIns || 0,
    ticketsByType,
    salesByDay: [], // TODO: Implement sales by day from orders
  };
}
