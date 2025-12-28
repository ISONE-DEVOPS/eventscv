/**
 * Team Service - CRUD operations for organization team members
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
  Timestamp,
} from 'firebase/firestore';
import { db, functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import type { OrganizationRole, Permission } from '@eventscv/shared-types';
import { DEFAULT_PERMISSIONS } from '@eventscv/shared-types';

const ORGANIZATIONS_COLLECTION = 'organizations';
const MEMBERS_SUBCOLLECTION = 'members';
const INVITATIONS_SUBCOLLECTION = 'invitations';

export interface TeamMember {
  id: string;
  odId: string;
  email: string;
  displayName: string;
  role: OrganizationRole;
  permissions: Permission[];
  joinedAt: Date;
  invitedBy: string;
  isActive: boolean;
  lastActiveAt?: Date;
}

export interface Invitation {
  id: string;
  email: string;
  role: OrganizationRole;
  permissions: Permission[];
  invitedBy: string;
  invitedByName: string;
  createdAt: Date;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  token: string;
}

// ============================================
// TEAM MEMBERS
// ============================================

// Get all team members for an organization
export async function getTeamMembers(organizationId: string): Promise<TeamMember[]> {
  const q = query(
    collection(db, ORGANIZATIONS_COLLECTION, organizationId, MEMBERS_SUBCOLLECTION),
    orderBy('joinedAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    joinedAt: doc.data().joinedAt?.toDate(),
    lastActiveAt: doc.data().lastActiveAt?.toDate(),
  })) as TeamMember[];
}

// Get a single team member
export async function getTeamMember(
  organizationId: string,
  memberId: string
): Promise<TeamMember | null> {
  const docRef = doc(
    db,
    ORGANIZATIONS_COLLECTION,
    organizationId,
    MEMBERS_SUBCOLLECTION,
    memberId
  );
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    joinedAt: data.joinedAt?.toDate(),
    lastActiveAt: data.lastActiveAt?.toDate(),
  } as TeamMember;
}

// Update a team member's role and permissions
export async function updateTeamMember(
  organizationId: string,
  memberId: string,
  data: { role?: OrganizationRole; permissions?: Permission[]; isActive?: boolean }
): Promise<void> {
  const docRef = doc(
    db,
    ORGANIZATIONS_COLLECTION,
    organizationId,
    MEMBERS_SUBCOLLECTION,
    memberId
  );

  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });

  // If role or permissions changed, update the user's custom claims
  if (data.role || data.permissions) {
    const member = await getTeamMember(organizationId, memberId);
    if (member) {
      try {
        const updateClaims = httpsCallable(functions, 'updateUserClaims');
        await updateClaims({
          userId: member.odId,
          claims: {
            organizationId,
            organizationRole: data.role || member.role,
            permissions: data.permissions || member.permissions,
          },
        });
      } catch (error) {
        console.error('Failed to update user claims:', error);
      }
    }
  }
}

// Remove a team member
export async function removeTeamMember(
  organizationId: string,
  memberId: string
): Promise<void> {
  const member = await getTeamMember(organizationId, memberId);

  const docRef = doc(
    db,
    ORGANIZATIONS_COLLECTION,
    organizationId,
    MEMBERS_SUBCOLLECTION,
    memberId
  );

  await deleteDoc(docRef);

  // Remove the user's organization claims
  if (member) {
    try {
      const removeOrgClaims = httpsCallable(functions, 'removeOrganizationClaims');
      await removeOrgClaims({ userId: member.odId });
    } catch (error) {
      console.error('Failed to remove user claims:', error);
    }
  }
}

// ============================================
// INVITATIONS
// ============================================

// Get pending invitations
export async function getInvitations(organizationId: string): Promise<Invitation[]> {
  const q = query(
    collection(db, ORGANIZATIONS_COLLECTION, organizationId, INVITATIONS_SUBCOLLECTION),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    expiresAt: doc.data().expiresAt?.toDate(),
  })) as Invitation[];
}

// Create an invitation
export async function createInvitation(
  organizationId: string,
  data: {
    email: string;
    role: OrganizationRole;
    permissions: Permission[];
    invitedBy: string;
    invitedByName: string;
  }
): Promise<string> {
  // Check if there's already a pending invitation for this email
  const existingQuery = query(
    collection(db, ORGANIZATIONS_COLLECTION, organizationId, INVITATIONS_SUBCOLLECTION),
    where('email', '==', data.email),
    where('status', '==', 'pending')
  );

  const existingSnapshot = await getDocs(existingQuery);
  if (!existingSnapshot.empty) {
    throw new Error('Já existe um convite pendente para este email');
  }

  // Check if user is already a member
  const membersQuery = query(
    collection(db, ORGANIZATIONS_COLLECTION, organizationId, MEMBERS_SUBCOLLECTION),
    where('email', '==', data.email)
  );

  const membersSnapshot = await getDocs(membersQuery);
  if (!membersSnapshot.empty) {
    throw new Error('Este utilizador já é membro da organização');
  }

  // Generate unique token
  const token = generateInvitationToken();

  // Create invitation (expires in 7 days)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invitationData = {
    ...data,
    status: 'pending',
    token,
    createdAt: Timestamp.now(),
    expiresAt: Timestamp.fromDate(expiresAt),
  };

  const docRef = await addDoc(
    collection(db, ORGANIZATIONS_COLLECTION, organizationId, INVITATIONS_SUBCOLLECTION),
    invitationData
  );

  // TODO: Send invitation email via Cloud Function

  return docRef.id;
}

// Cancel an invitation
export async function cancelInvitation(
  organizationId: string,
  invitationId: string
): Promise<void> {
  const docRef = doc(
    db,
    ORGANIZATIONS_COLLECTION,
    organizationId,
    INVITATIONS_SUBCOLLECTION,
    invitationId
  );

  await updateDoc(docRef, {
    status: 'cancelled',
    cancelledAt: Timestamp.now(),
  });
}

// Resend an invitation
export async function resendInvitation(
  organizationId: string,
  invitationId: string
): Promise<void> {
  const docRef = doc(
    db,
    ORGANIZATIONS_COLLECTION,
    organizationId,
    INVITATIONS_SUBCOLLECTION,
    invitationId
  );

  // Update expiration date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await updateDoc(docRef, {
    expiresAt: Timestamp.fromDate(expiresAt),
    resentAt: Timestamp.now(),
  });

  // TODO: Resend invitation email via Cloud Function
}

// ============================================
// ROLE PERMISSIONS MAPPING
// ============================================

// Using DEFAULT_PERMISSIONS from shared-types
export const ROLE_PERMISSIONS = DEFAULT_PERMISSIONS;

// Helper function to get default permissions for a role
export function getDefaultPermissions(role: OrganizationRole): Permission[] {
  return DEFAULT_PERMISSIONS[role] || [];
}

// ============================================
// HELPERS
// ============================================

function generateInvitationToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}
