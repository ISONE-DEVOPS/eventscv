'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface TeamMember {
  id: string;
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'admin' | 'promoter' | 'staff';
  permissions: string[];
  isActive: boolean;
  joinedAt: Date;
  lastActiveAt?: Date;
}

export interface Invitation {
  id: string;
  email: string;
  role: 'admin' | 'promoter' | 'staff';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  invitedBy: string;
  invitedByName: string;
  createdAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
}

export interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  pendingInvitations: number;
  adminCount: number;
  promoterCount: number;
  staffCount: number;
}

export function useOrganizationTeam(organizationId: string | undefined) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [stats, setStats] = useState<TeamStats>({
    totalMembers: 0,
    activeMembers: 0,
    pendingInvitations: 0,
    adminCount: 0,
    promoterCount: 0,
    staffCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Query organization members
    const membersRef = collection(db, 'organizations', organizationId, 'members');
    const membersQuery = query(
      membersRef,
      orderBy('joinedAt', 'desc')
    );

    // Setup real-time listener for members
    const unsubscribeMembers = onSnapshot(
      membersQuery,
      async (snapshot) => {
        try {
          const membersList: TeamMember[] = snapshot.docs.map((doc) => {
            const member = doc.data();
            return {
              id: doc.id,
              uid: member.uid || doc.id,
              email: member.email || '',
              displayName: member.displayName,
              photoURL: member.photoURL,
              role: member.role || 'staff',
              permissions: member.permissions || [],
              isActive: member.isActive !== false,
              joinedAt: member.joinedAt?.toDate() || new Date(),
              lastActiveAt: member.lastActiveAt?.toDate(),
            };
          });

          setMembers(membersList);

          // Calculate stats
          const newStats: TeamStats = {
            totalMembers: membersList.length,
            activeMembers: membersList.filter((m) => m.isActive).length,
            pendingInvitations: 0, // Will be updated from invitations query
            adminCount: membersList.filter((m) => m.role === 'admin').length,
            promoterCount: membersList.filter((m) => m.role === 'promoter').length,
            staffCount: membersList.filter((m) => m.role === 'staff').length,
          };

          setStats((prev) => ({ ...prev, ...newStats }));
          setLoading(false);
        } catch (err) {
          console.error('Error processing members:', err);
          setError(err as Error);
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error listening to members:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    // Query invitations
    const invitationsRef = collection(db, 'invitations');
    const invitationsQuery = query(
      invitationsRef,
      where('organizationId', '==', organizationId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeInvitations = onSnapshot(
      invitationsQuery,
      (snapshot) => {
        try {
          const invitationsList: Invitation[] = snapshot.docs.map((doc) => {
            const invitation = doc.data();
            return {
              id: doc.id,
              email: invitation.email || '',
              role: invitation.role || 'staff',
              status: invitation.status || 'pending',
              invitedBy: invitation.invitedBy || '',
              invitedByName: invitation.invitedByName || 'Admin',
              createdAt: invitation.createdAt?.toDate() || new Date(),
              expiresAt: invitation.expiresAt?.toDate() || new Date(),
              acceptedAt: invitation.acceptedAt?.toDate(),
            };
          });

          setInvitations(invitationsList);

          // Update invitation stats
          const pendingCount = invitationsList.filter((i) => i.status === 'pending').length;
          setStats((prev) => ({
            ...prev,
            pendingInvitations: pendingCount,
          }));
        } catch (err) {
          console.error('Error processing invitations:', err);
        }
      },
      (err) => {
        console.error('Error listening to invitations:', err);
      }
    );

    // Cleanup listeners on unmount
    return () => {
      unsubscribeMembers();
      unsubscribeInvitations();
    };
  }, [organizationId]);

  return { members, invitations, stats, loading, error };
}
