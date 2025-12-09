/**
 * Users Service - CRUD operations for platform users (Super Admin)
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
import { db, functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';

const USERS_COLLECTION = 'users';

// ============================================
// TYPES
// ============================================

export interface User {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
  role: 'user' | 'super_admin' | 'org_admin' | 'promoter' | 'staff';
  organizationId?: string;
  walletBalance: number;
  loyaltyPoints: number;
  referralCode: string;
  referredBy?: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
  preferences?: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    language: string;
  };
}

export interface UserFilters {
  role?: User['role'];
  organizationId?: string;
  isActive?: boolean;
  searchQuery?: string;
}

export interface PaginationOptions {
  pageSize?: number;
  lastDoc?: DocumentSnapshot;
}

// ============================================
// USER OPERATIONS
// ============================================

// Get all users (Super Admin only)
export async function getUsers(
  filters?: UserFilters,
  pagination?: PaginationOptions
): Promise<{ users: User[]; lastDoc: DocumentSnapshot | null }> {
  let q = query(
    collection(db, USERS_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  if (filters?.role) {
    q = query(q, where('role', '==', filters.role));
  }

  if (filters?.organizationId) {
    q = query(q, where('organizationId', '==', filters.organizationId));
  }

  if (filters?.isActive !== undefined) {
    q = query(q, where('isActive', '==', filters.isActive));
  }

  if (pagination?.pageSize) {
    q = query(q, limit(pagination.pageSize));
  }

  if (pagination?.lastDoc) {
    q = query(q, startAfter(pagination.lastDoc));
  }

  const snapshot = await getDocs(q);
  const users = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    lastLoginAt: doc.data().lastLoginAt?.toDate(),
  })) as User[];

  const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

  return { users, lastDoc };
}

// Get a single user
export async function getUser(userId: string): Promise<User | null> {
  const docRef = doc(db, USERS_COLLECTION, userId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate(),
    lastLoginAt: data.lastLoginAt?.toDate(),
  } as User;
}

// Search users by email or name
export async function searchUsers(searchQuery: string): Promise<User[]> {
  // Note: Firestore doesn't support full-text search
  // For production, consider using Algolia or Elasticsearch
  // This is a simple prefix search on email

  const emailQuery = query(
    collection(db, USERS_COLLECTION),
    where('email', '>=', searchQuery.toLowerCase()),
    where('email', '<=', searchQuery.toLowerCase() + '\uf8ff'),
    limit(20)
  );

  const snapshot = await getDocs(emailQuery);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    lastLoginAt: doc.data().lastLoginAt?.toDate(),
  })) as User[];
}

// Update user (Super Admin)
export async function updateUser(
  userId: string,
  data: Partial<Pick<User, 'displayName' | 'phoneNumber' | 'isActive' | 'role'>>
): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, userId);

  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

// Suspend a user
export async function suspendUser(userId: string, reason: string): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, userId);

  await updateDoc(docRef, {
    isActive: false,
    suspendedAt: Timestamp.now(),
    suspensionReason: reason,
    updatedAt: Timestamp.now(),
  });

  // Disable the user in Firebase Auth
  try {
    const disableUser = httpsCallable(functions, 'disableUser');
    await disableUser({ userId });
  } catch (error) {
    console.error('Failed to disable user in Auth:', error);
  }
}

// Reactivate a user
export async function reactivateUser(userId: string): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, userId);

  await updateDoc(docRef, {
    isActive: true,
    suspendedAt: null,
    suspensionReason: null,
    reactivatedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  // Enable the user in Firebase Auth
  try {
    const enableUser = httpsCallable(functions, 'enableUser');
    await enableUser({ userId });
  } catch (error) {
    console.error('Failed to enable user in Auth:', error);
  }
}

// Promote user to Super Admin
export async function promoteToSuperAdmin(userId: string): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, userId);

  await updateDoc(docRef, {
    role: 'super_admin',
    promotedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  // Update custom claims
  try {
    const setAdminClaims = httpsCallable(functions, 'setAdminClaims');
    await setAdminClaims({
      userId,
      claims: {
        platformRole: 'super_admin',
        permissions: [
          'manage_platform',
          'manage_organizations',
          'manage_users',
          'view_analytics',
          'manage_subscriptions',
          'manage_rewards',
          'view_audit_logs',
        ],
      },
    });
  } catch (error) {
    console.error('Failed to update admin claims:', error);
  }
}

// Revoke Super Admin
export async function revokeSuperAdmin(userId: string): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, userId);

  await updateDoc(docRef, {
    role: 'user',
    demotedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  // Remove custom claims
  try {
    const removeClaims = httpsCallable(functions, 'removeAdminClaims');
    await removeClaims({ userId });
  } catch (error) {
    console.error('Failed to remove admin claims:', error);
  }
}

// ============================================
// USER WALLET OPERATIONS
// ============================================

// Get user wallet transactions
export async function getUserWalletTransactions(
  userId: string,
  pagination?: PaginationOptions
): Promise<{ transactions: WalletTransaction[]; lastDoc: DocumentSnapshot | null }> {
  let q = query(
    collection(db, USERS_COLLECTION, userId, 'walletTransactions'),
    orderBy('createdAt', 'desc')
  );

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
  })) as WalletTransaction[];

  const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

  return { transactions, lastDoc };
}

export interface WalletTransaction {
  id: string;
  type: 'topup' | 'payment' | 'refund' | 'transfer_in' | 'transfer_out' | 'bonus';
  amount: number;
  balance: number;
  description: string;
  reference?: string;
  eventId?: string;
  eventName?: string;
  createdAt: Date;
}

// ============================================
// USER TICKETS
// ============================================

export interface UserTicket {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: Date;
  ticketTypeName: string;
  status: 'valid' | 'used' | 'cancelled' | 'refunded' | 'transferred';
  qrCode: string;
  purchasedAt: Date;
  price: number;
}

// Get user's tickets
export async function getUserTickets(
  userId: string,
  status?: UserTicket['status']
): Promise<UserTicket[]> {
  let q = query(
    collection(db, USERS_COLLECTION, userId, 'tickets'),
    orderBy('purchasedAt', 'desc')
  );

  if (status) {
    q = query(q, where('status', '==', status));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    eventDate: doc.data().eventDate?.toDate(),
    purchasedAt: doc.data().purchasedAt?.toDate(),
  })) as UserTicket[];
}

// ============================================
// USER STATS
// ============================================

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  newUsersLastMonth: number;
  usersByRole: Record<string, number>;
}

export async function getUserStats(): Promise<UserStats> {
  const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));

  const stats: UserStats = {
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    newUsersLastMonth: 0,
    usersByRole: {
      user: 0,
      super_admin: 0,
      org_admin: 0,
      promoter: 0,
      staff: 0,
    },
  };

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  usersSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    stats.totalUsers++;

    if (data.isActive) {
      stats.activeUsers++;
    }

    if (data.role) {
      stats.usersByRole[data.role] = (stats.usersByRole[data.role] || 0) + 1;
    }

    const createdAt = data.createdAt?.toDate();
    if (createdAt) {
      if (createdAt >= thisMonthStart) {
        stats.newUsersThisMonth++;
      } else if (createdAt >= lastMonthStart && createdAt <= lastMonthEnd) {
        stats.newUsersLastMonth++;
      }
    }
  });

  return stats;
}
