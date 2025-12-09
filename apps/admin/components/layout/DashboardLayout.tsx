'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthStore, isSuperAdmin } from '@/stores/authStore';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';
import type { Organization, Permission } from '@eventscv/shared-types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  requireSuperAdmin?: boolean;
  requireOrgRole?: ('admin' | 'promoter' | 'staff')[];
}

export function DashboardLayout({
  children,
  title,
  requireSuperAdmin = false,
  requireOrgRole,
}: DashboardLayoutProps) {
  const router = useRouter();
  const { user, claims, loading, setUser, setClaims, setOrganization, setLoading } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setClaims(null);
        setOrganization(null);
        setLoading(false);
        router.push('/login');
        return;
      }

      setUser(firebaseUser);

      // Get custom claims
      const tokenResult = await firebaseUser.getIdTokenResult();
      const userClaims = {
        platformRole: tokenResult.claims.platformRole as 'super_admin' | undefined,
        organizationId: tokenResult.claims.organizationId as string | undefined,
        organizationRole: tokenResult.claims.organizationRole as 'admin' | 'promoter' | 'staff' | undefined,
        permissions: tokenResult.claims.permissions as Permission[] | undefined,
      };
      setClaims(userClaims);

      // Load organization if user belongs to one
      if (userClaims.organizationId) {
        const orgDoc = await getDoc(doc(db, 'organizations', userClaims.organizationId));
        if (orgDoc.exists()) {
          setOrganization({ id: orgDoc.id, ...orgDoc.data() } as Organization);
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, setUser, setClaims, setOrganization, setLoading]);

  // Check access rights
  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    // Check super admin requirement
    if (requireSuperAdmin && !isSuperAdmin(claims)) {
      router.push('/dashboard');
      return;
    }

    // Check org role requirement
    if (requireOrgRole && claims?.organizationRole) {
      if (!requireOrgRole.includes(claims.organizationRole)) {
        router.push('/dashboard');
        return;
      }
    }
  }, [loading, user, claims, requireSuperAdmin, requireOrgRole, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary animate-pulse" />
          <p className="text-zinc-400">A carregar...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className={cn('dashboard-main', sidebarCollapsed && 'expanded')}>
        <Header title={title} />
        <div className="dashboard-content">{children}</div>
      </main>
    </div>
  );
}
