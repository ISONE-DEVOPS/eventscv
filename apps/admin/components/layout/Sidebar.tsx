'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  Users,
  Building2,
  CreditCard,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Wallet,
  Bell,
  Package,
  QrCode,
} from 'lucide-react';
import { useAuthStore, isSuperAdmin, isOrgAdmin, isOrgPromoter } from '@/stores/authStore';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: ('super_admin' | 'admin' | 'promoter' | 'staff')[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const superAdminNav: NavSection[] = [
  {
    title: 'Visao Geral',
    items: [
      { label: 'Dashboard', href: '/super-admin', icon: <LayoutDashboard size={20} /> },
      { label: 'Organizacoes', href: '/super-admin/organizations', icon: <Building2 size={20} /> },
      { label: 'Utilizadores', href: '/super-admin/users', icon: <Users size={20} /> },
      { label: 'Eventos', href: '/super-admin/events', icon: <Calendar size={20} /> },
    ],
  },
  {
    title: 'Financeiro',
    items: [
      { label: 'Transacoes', href: '/super-admin/transactions', icon: <CreditCard size={20} /> },
      { label: 'Payouts', href: '/super-admin/payouts', icon: <Wallet size={20} /> },
      { label: 'Subscricoes', href: '/super-admin/subscriptions', icon: <Package size={20} /> },
    ],
  },
  {
    title: 'Integrações',
    items: [
      { label: 'Pagali', href: '/super-admin/integrations/pagali', icon: <CreditCard size={20} /> },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { label: 'Analytics', href: '/super-admin/analytics', icon: <BarChart3 size={20} /> },
      { label: 'Suporte', href: '/super-admin/support', icon: <HelpCircle size={20} /> },
      { label: 'Configuracoes', href: '/super-admin/settings', icon: <Settings size={20} /> },
    ],
  },
];

const orgNav: NavSection[] = [
  {
    title: 'Visao Geral',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
      { label: 'Eventos', href: '/events', icon: <Calendar size={20} />, roles: ['admin', 'promoter'] },
      { label: 'Bilhetes', href: '/tickets', icon: <Ticket size={20} /> },
      { label: 'Check-in', href: '/check-in', icon: <QrCode size={20} /> },
    ],
  },
  {
    title: 'Gestao',
    items: [
      { label: 'Equipa', href: '/team', icon: <Users size={20} />, roles: ['admin'] },
      { label: 'Financeiro', href: '/finance', icon: <CreditCard size={20} />, roles: ['admin'] },
      { label: 'Analytics', href: '/analytics', icon: <BarChart3 size={20} />, roles: ['admin', 'promoter'] },
    ],
  },
  {
    title: 'Configuracoes',
    items: [
      { label: 'Organizacao', href: '/settings', icon: <Settings size={20} />, roles: ['admin'] },
      { label: 'Notificacoes', href: '/notifications', icon: <Bell size={20} /> },
    ],
  },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { claims, organization } = useAuthStore();
  const superAdmin = isSuperAdmin(claims);

  const navigation = superAdmin ? superAdminNav : orgNav;

  const canSeeItem = (item: NavItem): boolean => {
    if (!item.roles) return true;
    if (superAdmin) return true;
    if (!claims?.organizationRole) return false;
    return item.roles.includes(claims.organizationRole);
  };

  return (
    <aside className={cn('dashboard-sidebar', collapsed && 'collapsed')}>
      {/* Logo */}
      <div className="sidebar-logo">
        <Link href={superAdmin ? '/super-admin' : '/dashboard'} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          {!collapsed && (
            <div>
              <span className="font-display font-bold text-[hsl(var(--foreground))]">EventsCV</span>
              {superAdmin && (
                <span className="block text-xs text-brand-primary">Super Admin</span>
              )}
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navigation.map((section, idx) => (
          <div key={idx} className="sidebar-section">
            {!collapsed && (
              <h3 className="sidebar-section-title">{section.title}</h3>
            )}
            <div className="mt-2 space-y-1">
              {section.items.filter(canSeeItem).map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn('sidebar-link', isActive && 'active')}
                    title={collapsed ? item.label : undefined}
                  >
                    {item.icon}
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Organization Info (non super-admin) */}
      {!superAdmin && organization && !collapsed && (
        <div className="px-4 py-3 border-t border-[hsl(var(--border-color))]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/20 flex items-center justify-center">
              <Building2 size={16} className="text-brand-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">{organization.name}</p>
              <p className="text-xs text-[hsl(var(--foreground-muted))] capitalize">{claims?.organizationRole}</p>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <div className="p-3 border-t border-[hsl(var(--border-color))]">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl
                     text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))] hover:bg-gradient-to-r hover:from-brand-primary/10 hover:to-transparent transition-colors"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          {!collapsed && <span className="text-sm">Recolher</span>}
        </button>
      </div>
    </aside>
  );
}
