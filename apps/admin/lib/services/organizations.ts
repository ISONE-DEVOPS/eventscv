/**
 * Organizations Service - CRUD operations for organizations
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
import type { Organization, SubscriptionPlan } from '@eventscv/shared-types';

const ORGANIZATIONS_COLLECTION = 'organizations';

export interface OrganizationFilters {
  status?: 'active' | 'suspended' | 'pending';
  subscriptionPlan?: SubscriptionPlan;
  verified?: boolean;
}

export interface PaginationOptions {
  pageSize?: number;
  lastDoc?: DocumentSnapshot;
}

export interface OrganizationFormData {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  address?: {
    street: string;
    city: string;
    island: string;
    postalCode?: string;
  };
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  taxId?: string;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    iban?: string;
  };
}

// ============================================
// CRUD OPERATIONS
// ============================================

// Get all organizations (Super Admin only)
export async function getOrganizations(
  filters?: OrganizationFilters,
  pagination?: PaginationOptions
): Promise<{ organizations: Organization[]; lastDoc: DocumentSnapshot | null }> {
  let q = query(
    collection(db, ORGANIZATIONS_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  if (filters?.status) {
    q = query(q, where('status', '==', filters.status));
  }

  if (filters?.subscriptionPlan) {
    q = query(q, where('subscriptionPlan', '==', filters.subscriptionPlan));
  }

  if (filters?.verified !== undefined) {
    q = query(q, where('verified', '==', filters.verified));
  }

  if (pagination?.pageSize) {
    q = query(q, limit(pagination.pageSize));
  }

  if (pagination?.lastDoc) {
    q = query(q, startAfter(pagination.lastDoc));
  }

  const snapshot = await getDocs(q);
  const organizations = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Organization[];

  const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

  return { organizations, lastDoc };
}

// Get a single organization
export async function getOrganization(orgId: string): Promise<Organization | null> {
  const docRef = doc(db, ORGANIZATIONS_COLLECTION, orgId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return { id: docSnap.id, ...docSnap.data() } as Organization;
}

// Get organization by slug
export async function getOrganizationBySlug(slug: string): Promise<Organization | null> {
  const q = query(
    collection(db, ORGANIZATIONS_COLLECTION),
    where('slug', '==', slug),
    limit(1)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Organization;
}

// Create a new organization (Super Admin only)
export async function createOrganization(
  data: OrganizationFormData
): Promise<string> {
  // Check if slug is unique
  const existingOrg = await getOrganizationBySlug(data.slug);
  if (existingOrg) {
    throw new Error('Uma organização com este slug já existe');
  }

  const orgData = {
    ...data,
    status: 'pending',
    verified: false,
    subscriptionPlan: 'free' as SubscriptionPlan,
    subscriptionStatus: 'active',
    stats: {
      totalEvents: 0,
      totalTicketsSold: 0,
      totalRevenue: 0,
      activeEvents: 0,
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const docRef = await addDoc(collection(db, ORGANIZATIONS_COLLECTION), orgData);
  return docRef.id;
}

// Update an organization
export async function updateOrganization(
  orgId: string,
  data: Partial<OrganizationFormData>
): Promise<void> {
  const docRef = doc(db, ORGANIZATIONS_COLLECTION, orgId);

  // If slug is being changed, check if it's unique
  if (data.slug) {
    const existingOrg = await getOrganizationBySlug(data.slug);
    if (existingOrg && existingOrg.id !== orgId) {
      throw new Error('Uma organização com este slug já existe');
    }
  }

  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

// ============================================
// STATUS MANAGEMENT (Super Admin)
// ============================================

// Approve an organization
export async function approveOrganization(orgId: string): Promise<void> {
  const docRef = doc(db, ORGANIZATIONS_COLLECTION, orgId);
  await updateDoc(docRef, {
    status: 'active',
    approvedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

// Suspend an organization
export async function suspendOrganization(
  orgId: string,
  reason: string
): Promise<void> {
  const docRef = doc(db, ORGANIZATIONS_COLLECTION, orgId);
  await updateDoc(docRef, {
    status: 'suspended',
    suspendedAt: Timestamp.now(),
    suspensionReason: reason,
    updatedAt: Timestamp.now(),
  });
}

// Reactivate a suspended organization
export async function reactivateOrganization(orgId: string): Promise<void> {
  const docRef = doc(db, ORGANIZATIONS_COLLECTION, orgId);
  await updateDoc(docRef, {
    status: 'active',
    suspendedAt: null,
    suspensionReason: null,
    reactivatedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

// Verify an organization
export async function verifyOrganization(orgId: string): Promise<void> {
  const docRef = doc(db, ORGANIZATIONS_COLLECTION, orgId);
  await updateDoc(docRef, {
    verified: true,
    verifiedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

// ============================================
// SUBSCRIPTION MANAGEMENT
// ============================================

// Update subscription plan
export async function updateSubscriptionPlan(
  orgId: string,
  plan: SubscriptionPlan
): Promise<void> {
  const docRef = doc(db, ORGANIZATIONS_COLLECTION, orgId);
  await updateDoc(docRef, {
    subscriptionPlan: plan,
    subscriptionUpdatedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

// ============================================
// ORGANIZATION STATS
// ============================================

export interface OrganizationStats {
  totalEvents: number;
  activeEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  totalMembers: number;
  pendingPayouts: number;
}

export async function getOrganizationStats(orgId: string): Promise<OrganizationStats> {
  // Get organization data
  const org = await getOrganization(orgId);
  if (!org) {
    throw new Error('Organização não encontrada');
  }

  // Get team members count
  const membersQuery = query(
    collection(db, ORGANIZATIONS_COLLECTION, orgId, 'members')
  );
  const membersSnapshot = await getDocs(membersQuery);

  // Get pending payouts
  const payoutsQuery = query(
    collection(db, ORGANIZATIONS_COLLECTION, orgId, 'payouts'),
    where('status', '==', 'pending')
  );
  const payoutsSnapshot = await getDocs(payoutsQuery);

  let pendingPayoutsAmount = 0;
  payoutsSnapshot.docs.forEach((doc) => {
    pendingPayoutsAmount += doc.data().amount || 0;
  });

  return {
    totalEvents: org.stats?.totalEvents || 0,
    activeEvents: org.stats?.activeEvents || 0,
    totalTicketsSold: org.stats?.totalTicketsSold || 0,
    totalRevenue: org.stats?.totalRevenue || 0,
    totalMembers: membersSnapshot.size,
    pendingPayouts: pendingPayoutsAmount,
  };
}

// ============================================
// ORGANIZATION SETTINGS
// ============================================

export interface OrganizationSettings {
  notifications: {
    emailOnSale: boolean;
    emailDailyReport: boolean;
    emailWeeklyReport: boolean;
  };
  checkout: {
    allowGuestCheckout: boolean;
    requirePhone: boolean;
    requireAddress: boolean;
  };
  branding: {
    primaryColor?: string;
    secondaryColor?: string;
  };
}

export async function getOrganizationSettings(
  orgId: string
): Promise<OrganizationSettings | null> {
  const docRef = doc(db, ORGANIZATIONS_COLLECTION, orgId, 'settings', 'general');
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    // Return default settings
    return {
      notifications: {
        emailOnSale: true,
        emailDailyReport: false,
        emailWeeklyReport: true,
      },
      checkout: {
        allowGuestCheckout: false,
        requirePhone: true,
        requireAddress: false,
      },
      branding: {},
    };
  }

  return docSnap.data() as OrganizationSettings;
}

export async function updateOrganizationSettings(
  orgId: string,
  settings: Partial<OrganizationSettings>
): Promise<void> {
  const docRef = doc(db, ORGANIZATIONS_COLLECTION, orgId, 'settings', 'general');
  await updateDoc(docRef, {
    ...settings,
    updatedAt: Timestamp.now(),
  });
}
