import { create } from 'zustand';
import { User } from 'firebase/auth';
import type {
  PlatformRole,
  OrganizationRole,
  Permission,
  Organization,
} from '@eventscv/shared-types';

interface UserClaims {
  platformRole?: PlatformRole;
  organizationId?: string;
  organizationRole?: OrganizationRole;
  permissions?: Permission[];
}

interface AuthState {
  user: User | null;
  claims: UserClaims | null;
  organization: Organization | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setClaims: (claims: UserClaims | null) => void;
  setOrganization: (org: Organization | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  claims: null,
  organization: null,
  loading: true,
  error: null,
  setUser: (user) => set({ user }),
  setClaims: (claims) => set({ claims }),
  setOrganization: (organization) => set({ organization }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      user: null,
      claims: null,
      organization: null,
      loading: false,
      error: null,
    }),
}));

// Helper functions
export const isSuperAdmin = (claims: UserClaims | null): boolean => {
  return claims?.platformRole === 'super_admin';
};

export const isOrgAdmin = (claims: UserClaims | null): boolean => {
  return claims?.organizationRole === 'admin';
};

export const isOrgPromoter = (claims: UserClaims | null): boolean => {
  return claims?.organizationRole === 'admin' || claims?.organizationRole === 'promoter';
};

export const isOrgStaff = (claims: UserClaims | null): boolean => {
  return (
    claims?.organizationRole === 'admin' ||
    claims?.organizationRole === 'promoter' ||
    claims?.organizationRole === 'staff'
  );
};

export const hasPermission = (
  claims: UserClaims | null,
  permission: Permission
): boolean => {
  if (!claims?.permissions) return false;
  return claims.permissions.includes(permission);
};

export const getUserRole = (claims: UserClaims | null): string => {
  if (claims?.platformRole === 'super_admin') return 'Super Admin';
  if (claims?.organizationRole === 'admin') return 'Admin';
  if (claims?.organizationRole === 'promoter') return 'Promotor';
  if (claims?.organizationRole === 'staff') return 'Staff';
  return 'Utilizador';
};
