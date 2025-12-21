/**
 * Support Service - CRUD operations for support tickets
 */

import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
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

const TICKETS_COLLECTION = 'support_tickets';

// ============================================
// TYPES
// ============================================

export interface Ticket {
    id: string;
    userId: string; // The user who created the ticket
    userEmail: string;
    userName: string;
    subject: string;
    description: string;
    category: 'technical' | 'billing' | 'feature' | 'other';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high';
    createdAt: Date;
    updatedAt: Date;
    resolvedAt?: Date;
    resolvedBy?: string; // Admin ID
    assignedTo?: string; // Admin ID
    messages?: TicketMessage[];
}

export interface TicketMessage {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    createdAt: Date;
    isAdmin: boolean;
}

export interface TicketFilters {
    status?: Ticket['status'];
    category?: Ticket['category'];
    priority?: Ticket['priority'];
    userId?: string;
    assignedTo?: string;
}

export interface PaginationOptions {
    pageSize?: number;
    lastDoc?: DocumentSnapshot;
}

// ============================================
// CRUD OPERATIONS
// ============================================

// Get all tickets (Admin)
export async function getTickets(
    filters?: TicketFilters,
    pagination?: PaginationOptions
): Promise<{ tickets: Ticket[]; lastDoc: DocumentSnapshot | null }> {
    let q = query(
        collection(db, TICKETS_COLLECTION),
        orderBy('createdAt', 'desc')
    );

    if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
    }

    if (filters?.category) {
        q = query(q, where('category', '==', filters.category));
    }

    if (filters?.priority) {
        q = query(q, where('priority', '==', filters.priority));
    }

    if (filters?.userId) {
        q = query(q, where('userId', '==', filters.userId));
    }

    if (filters?.assignedTo) {
        q = query(q, where('assignedTo', '==', filters.assignedTo));
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
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        resolvedAt: doc.data().resolvedAt?.toDate(),
    })) as Ticket[];

    const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

    return { tickets, lastDoc };
}

// Get a single ticket
export async function getTicket(ticketId: string): Promise<Ticket | null> {
    const docRef = doc(db, TICKETS_COLLECTION, ticketId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }

    const data = docSnap.data();
    return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        resolvedAt: data.resolvedAt?.toDate(),
    } as Ticket;
}

// Create a new ticket (User)
export async function createTicket(
    data: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'messages' | 'status'>
): Promise<string> {
    const ticketData = {
        ...data,
        status: 'open',
        messages: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, TICKETS_COLLECTION), ticketData);
    return docRef.id;
}

// Update ticket status (Admin)
export async function updateTicketStatus(
    ticketId: string,
    status: Ticket['status'],
    adminId?: string
): Promise<void> {
    const docRef = doc(db, TICKETS_COLLECTION, ticketId);

    const updateData: any = {
        status,
        updatedAt: Timestamp.now(),
    };

    if (status === 'resolved' && adminId) {
        updateData.resolvedAt = Timestamp.now();
        updateData.resolvedBy = adminId;
    }

    await updateDoc(docRef, updateData);
}

// Update ticket priority (Admin)
export async function updateTicketPriority(
    ticketId: string,
    priority: Ticket['priority']
): Promise<void> {
    const docRef = doc(db, TICKETS_COLLECTION, ticketId);
    await updateDoc(docRef, {
        priority,
        updatedAt: Timestamp.now(),
    });
}

// Assign ticket (Admin)
export async function assignTicket(
    ticketId: string,
    adminId: string
): Promise<void> {
    const docRef = doc(db, TICKETS_COLLECTION, ticketId);
    await updateDoc(docRef, {
        assignedTo: adminId,
        updatedAt: Timestamp.now(),
    });
}

// Add message to ticket
export async function addTicketMessage(
    ticketId: string,
    message: Omit<TicketMessage, 'id' | 'createdAt'>
): Promise<void> {
    // We'll store messages in a subcollection for scalability, 
    // but keeping basic info or latest message in parent could be useful.
    // For simplicity here, let's use a subcollection.

    const messageData = {
        ...message,
        createdAt: Timestamp.now(),
    };

    await addDoc(collection(db, TICKETS_COLLECTION, ticketId, 'messages'), messageData);

    // Update last activity on ticket
    await updateDoc(doc(db, TICKETS_COLLECTION, ticketId), {
        updatedAt: Timestamp.now(),
    });
}

// Get ticket messages
export async function getTicketMessages(ticketId: string): Promise<TicketMessage[]> {
    const q = query(
        collection(db, TICKETS_COLLECTION, ticketId, 'messages'),
        orderBy('createdAt', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
    })) as TicketMessage[];
}
