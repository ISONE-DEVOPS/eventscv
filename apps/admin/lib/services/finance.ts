/**
 * Finance Service - CRUD operations for payouts and transactions
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
  collectionGroup,
} from 'firebase/firestore';
import { db } from '../firebase';

const ORGANIZATIONS_COLLECTION = 'organizations';
const PAYOUTS_SUBCOLLECTION = 'payouts';

// ============================================
// TYPES
// ============================================

export interface Payout {
  id: string;
  organizationId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  method: 'bank_transfer' | 'mobile_money';
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    iban?: string;
  };
  mobileAccount?: {
    provider: string;
    phoneNumber: string;
    accountName: string;
  };
  requestedBy: string;
  requestedByName: string;
  requestedAt: Date;
  processedAt?: Date;
  processedBy?: string;
  completedAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  reference?: string;
  notes?: string;
  events?: string[]; // Event IDs included in this payout
}

export interface Transaction {
  id: string;
  organizationId: string;
  eventId: string;
  eventName: string;
  type: 'ticket_sale' | 'refund' | 'payout' | 'fee' | 'cashless';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  reference?: string;
  userId?: string;
  userEmail?: string;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

export interface PayoutFilters {
  status?: Payout['status'];
  method?: Payout['method'];
  dateFrom?: Date;
  dateTo?: Date;
}

export interface TransactionFilters {
  type?: Transaction['type'];
  eventId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface PaginationOptions {
  pageSize?: number;
  lastDoc?: DocumentSnapshot;
}

// ============================================
// PAYOUTS
// ============================================

// Get payouts for an organization
export async function getPayouts(
  organizationId: string,
  filters?: PayoutFilters,
  pagination?: PaginationOptions
): Promise<{ payouts: Payout[]; lastDoc: DocumentSnapshot | null }> {
  let q = query(
    collection(db, ORGANIZATIONS_COLLECTION, organizationId, PAYOUTS_SUBCOLLECTION),
    orderBy('requestedAt', 'desc')
  );

  if (filters?.status) {
    q = query(q, where('status', '==', filters.status));
  }

  if (filters?.method) {
    q = query(q, where('method', '==', filters.method));
  }

  if (pagination?.pageSize) {
    q = query(q, limit(pagination.pageSize));
  }

  if (pagination?.lastDoc) {
    q = query(q, startAfter(pagination.lastDoc));
  }

  const snapshot = await getDocs(q);
  const payouts = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    requestedAt: doc.data().requestedAt?.toDate(),
    processedAt: doc.data().processedAt?.toDate(),
    completedAt: doc.data().completedAt?.toDate(),
    failedAt: doc.data().failedAt?.toDate(),
  })) as Payout[];

  const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

  return { payouts, lastDoc };
}

// Get a single payout
export async function getPayout(
  organizationId: string,
  payoutId: string
): Promise<Payout | null> {
  const docRef = doc(
    db,
    ORGANIZATIONS_COLLECTION,
    organizationId,
    PAYOUTS_SUBCOLLECTION,
    payoutId
  );
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    requestedAt: data.requestedAt?.toDate(),
    processedAt: data.processedAt?.toDate(),
    completedAt: data.completedAt?.toDate(),
    failedAt: data.failedAt?.toDate(),
  } as Payout;
}

// Request a new payout
export async function requestPayout(
  organizationId: string,
  data: {
    amount: number;
    method: Payout['method'];
    bankAccount?: Payout['bankAccount'];
    mobileAccount?: Payout['mobileAccount'];
    requestedBy: string;
    requestedByName: string;
    notes?: string;
    events?: string[];
  }
): Promise<string> {
  const payoutData = {
    organizationId,
    ...data,
    currency: 'CVE',
    status: 'pending' as const,
    requestedAt: Timestamp.now(),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const docRef = await addDoc(
    collection(db, ORGANIZATIONS_COLLECTION, organizationId, PAYOUTS_SUBCOLLECTION),
    payoutData
  );

  return docRef.id;
}

// Cancel a payout (only pending ones)
export async function cancelPayout(
  organizationId: string,
  payoutId: string,
  reason: string
): Promise<void> {
  const docRef = doc(
    db,
    ORGANIZATIONS_COLLECTION,
    organizationId,
    PAYOUTS_SUBCOLLECTION,
    payoutId
  );

  await updateDoc(docRef, {
    status: 'cancelled',
    cancelledAt: Timestamp.now(),
    cancellationReason: reason,
    updatedAt: Timestamp.now(),
  });
}

// ============================================
// SUPER ADMIN - PAYOUT MANAGEMENT
// ============================================

// Get all payouts across organizations (Super Admin)
export async function getAllPayouts(
  filters?: PayoutFilters & { organizationId?: string },
  pagination?: PaginationOptions
): Promise<{ payouts: (Payout & { organizationName?: string })[]; lastDoc: DocumentSnapshot | null }> {
  let q = query(
    collectionGroup(db, PAYOUTS_SUBCOLLECTION),
    orderBy('requestedAt', 'desc')
  );

  if (filters?.status) {
    q = query(q, where('status', '==', filters.status));
  }

  if (filters?.method) {
    q = query(q, where('method', '==', filters.method));
  }

  if (filters?.organizationId) {
    q = query(q, where('organizationId', '==', filters.organizationId));
  }

  if (pagination?.pageSize) {
    q = query(q, limit(pagination.pageSize));
  }

  if (pagination?.lastDoc) {
    q = query(q, startAfter(pagination.lastDoc));
  }

  const snapshot = await getDocs(q);
  const payouts = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    requestedAt: doc.data().requestedAt?.toDate(),
    processedAt: doc.data().processedAt?.toDate(),
    completedAt: doc.data().completedAt?.toDate(),
    failedAt: doc.data().failedAt?.toDate(),
  })) as Payout[];

  const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

  return { payouts, lastDoc };
}

// Process a payout (Super Admin)
export async function processPayout(
  organizationId: string,
  payoutId: string,
  processedBy: string
): Promise<void> {
  const docRef = doc(
    db,
    ORGANIZATIONS_COLLECTION,
    organizationId,
    PAYOUTS_SUBCOLLECTION,
    payoutId
  );

  await updateDoc(docRef, {
    status: 'processing',
    processedAt: Timestamp.now(),
    processedBy,
    updatedAt: Timestamp.now(),
  });
}

// Complete a payout (Super Admin)
export async function completePayout(
  organizationId: string,
  payoutId: string,
  reference: string
): Promise<void> {
  const docRef = doc(
    db,
    ORGANIZATIONS_COLLECTION,
    organizationId,
    PAYOUTS_SUBCOLLECTION,
    payoutId
  );

  await updateDoc(docRef, {
    status: 'completed',
    completedAt: Timestamp.now(),
    reference,
    updatedAt: Timestamp.now(),
  });
}

// Mark payout as failed (Super Admin)
export async function failPayout(
  organizationId: string,
  payoutId: string,
  reason: string
): Promise<void> {
  const docRef = doc(
    db,
    ORGANIZATIONS_COLLECTION,
    organizationId,
    PAYOUTS_SUBCOLLECTION,
    payoutId
  );

  await updateDoc(docRef, {
    status: 'failed',
    failedAt: Timestamp.now(),
    failureReason: reason,
    updatedAt: Timestamp.now(),
  });
}

// ============================================
// TRANSACTIONS (Read-only - created by Cloud Functions)
// ============================================

// Get transactions for an organization
export async function getTransactions(
  organizationId: string,
  filters?: TransactionFilters,
  pagination?: PaginationOptions
): Promise<{ transactions: Transaction[]; lastDoc: DocumentSnapshot | null }> {
  let q = query(
    collection(db, ORGANIZATIONS_COLLECTION, organizationId, 'transactions'),
    orderBy('createdAt', 'desc')
  );

  if (filters?.type) {
    q = query(q, where('type', '==', filters.type));
  }

  if (filters?.eventId) {
    q = query(q, where('eventId', '==', filters.eventId));
  }

  if (pagination?.pageSize) {
    q = query(q, limit(pagination.pageSize));
  }

  if (pagination?.lastDoc) {
    q = query(q, startAfter(pagination.lastDoc));
  }

  const snapshot = await getDocs(q);
  const transactions = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as Transaction[];

  const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

  return { transactions, lastDoc };
}

// Get all transactions (Super Admin)
export async function getAllTransactions(
  filters?: TransactionFilters,
  pagination?: PaginationOptions
): Promise<{ transactions: Transaction[]; lastDoc: DocumentSnapshot | null }> {
  let q = query(
    collectionGroup(db, 'transactions'),
    orderBy('createdAt', 'desc')
  );

  if (filters?.type) {
    q = query(q, where('type', '==', filters.type));
  }

  if (filters?.eventId) {
    q = query(q, where('eventId', '==', filters.eventId));
  }

  if (pagination?.pageSize) {
    q = query(q, limit(pagination.pageSize));
  }

  if (pagination?.lastDoc) {
    q = query(q, startAfter(pagination.lastDoc));
  }

  const snapshot = await getDocs(q);
  const transactions = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt),
  })) as Transaction[];

  const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

  return { transactions, lastDoc };
}

// ============================================
// FINANCE STATS
// ============================================

export interface FinanceStats {
  availableBalance: number;
  pendingPayouts: number;
  totalRevenue: number;
  totalFees: number;
  totalRefunds: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
}

export async function getFinanceStats(organizationId: string): Promise<FinanceStats> {
  // Get organization
  const orgDoc = await getDoc(doc(db, ORGANIZATIONS_COLLECTION, organizationId));
  const orgData = orgDoc.data();

  // Get pending payouts total
  const pendingPayoutsQuery = query(
    collection(db, ORGANIZATIONS_COLLECTION, organizationId, PAYOUTS_SUBCOLLECTION),
    where('status', '==', 'pending')
  );
  const pendingPayoutsSnapshot = await getDocs(pendingPayoutsQuery);
  let pendingPayoutsTotal = 0;
  pendingPayoutsSnapshot.docs.forEach((doc) => {
    pendingPayoutsTotal += doc.data().amount || 0;
  });

  // Get completed payouts total
  const completedPayoutsQuery = query(
    collection(db, ORGANIZATIONS_COLLECTION, organizationId, PAYOUTS_SUBCOLLECTION),
    where('status', '==', 'completed')
  );
  const completedPayoutsSnapshot = await getDocs(completedPayoutsQuery);
  let completedPayoutsTotal = 0;
  completedPayoutsSnapshot.docs.forEach((doc) => {
    completedPayoutsTotal += doc.data().amount || 0;
  });

  // Calculate available balance
  const totalRevenue = orgData?.stats?.totalRevenue || 0;
  const platformFees = totalRevenue * 0.05; // 5% platform fee
  const availableBalance = totalRevenue - platformFees - completedPayoutsTotal - pendingPayoutsTotal;

  // TODO: Calculate monthly revenue from transactions

  return {
    availableBalance: Math.max(0, availableBalance),
    pendingPayouts: pendingPayoutsTotal,
    totalRevenue,
    totalFees: platformFees,
    totalRefunds: 0, // TODO: Calculate from transactions
    revenueThisMonth: 0, // TODO: Calculate from transactions
    revenueLastMonth: 0, // TODO: Calculate from transactions
  };
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

export async function exportTransactionsCSV(
  organizationId: string,
  filters?: TransactionFilters
): Promise<string> {
  const { transactions } = await getTransactions(organizationId, filters, {
    pageSize: 10000,
  });

  const headers = ['Data', 'Tipo', 'Evento', 'Descrição', 'Valor', 'Estado', 'Referência'];
  const rows = transactions.map((t) => [
    t.createdAt.toLocaleDateString('pt-PT'),
    t.type,
    t.eventName,
    t.description,
    t.amount.toLocaleString('pt-CV') + '$00',
    t.status,
    t.reference || '',
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  return csv;
}

export async function exportPayoutsCSV(
  organizationId: string,
  filters?: PayoutFilters
): Promise<string> {
  const { payouts } = await getPayouts(organizationId, filters, {
    pageSize: 10000,
  });

  const headers = ['Data', 'Valor', 'Método', 'Estado', 'Referência', 'Solicitado Por'];
  const rows = payouts.map((p) => [
    p.requestedAt.toLocaleDateString('pt-PT'),
    p.amount.toLocaleString('pt-CV') + '$00',
    p.method === 'bank_transfer' ? 'Transferência Bancária' : 'Mobile Money',
    p.status,
    p.reference || '',
    p.requestedByName,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  return csv;
}
