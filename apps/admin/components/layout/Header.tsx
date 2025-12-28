'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import {
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  ChevronDown,
  HelpCircle,
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { useAuthStore, getUserRole } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '../ui/ThemeToggle';

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const router = useRouter();
  const { user, claims } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <header className="dashboard-header">
      {/* Left side */}
      <div className="flex items-center gap-4">
        {title && <h1 className="text-xl font-semibold text-[hsl(var(--foreground))]">{title}</h1>}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--foreground-muted))]"
          />
          <input
            type="text"
            placeholder="Pesquisar..."
            className="w-64 pl-10 pr-4 py-2 rounded-xl bg-[hsl(var(--background-secondary))]
                       border border-[hsl(var(--border-color))] text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-muted))]
                       focus:border-brand-primary focus:outline-none transition-colors"
          />
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))]
                       hover:bg-gradient-to-r hover:from-brand-primary/10 hover:to-transparent transition-colors"
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[hsl(var(--error))] rounded-full" />
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="dropdown-menu w-80 z-50">
                <div className="px-4 py-3 border-b border-[hsl(var(--border-color))]">
                  <h3 className="font-semibold text-[hsl(var(--foreground))]">Notificacoes</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <div className="empty-state py-8">
                    <Bell size={32} className="text-[hsl(var(--foreground-muted))] mb-2" />
                    <p className="text-sm text-[hsl(var(--foreground-secondary))]">Sem notificacoes</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-gradient-to-r hover:from-brand-primary/10 hover:to-transparent transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary
                            flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {user?.displayName?.[0] || user?.email?.[0] || 'U'}
              </span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                {user?.displayName || user?.email?.split('@')[0]}
              </p>
              <p className="text-xs text-[hsl(var(--foreground-muted))]">{getUserRole(claims)}</p>
            </div>
            <ChevronDown size={16} className="hidden md:block text-[hsl(var(--foreground-muted))]" />
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="dropdown-menu z-50">
                <div className="px-4 py-3 border-b border-[hsl(var(--border-color))]">
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                    {user?.displayName || 'Utilizador'}
                  </p>
                  <p className="text-xs text-[hsl(var(--foreground-muted))]">{user?.email}</p>
                </div>
                <div className="py-1">
                  <button className="dropdown-item w-full">
                    <User size={16} />
                    <span>Perfil</span>
                  </button>
                  <button className="dropdown-item w-full">
                    <Settings size={16} />
                    <span>Configuracoes</span>
                  </button>
                  <button className="dropdown-item w-full">
                    <HelpCircle size={16} />
                    <span>Ajuda</span>
                  </button>
                </div>
                <div className="dropdown-divider" />
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="dropdown-item w-full text-[hsl(var(--error))] hover:bg-[hsl(var(--error))]/10"
                  >
                    <LogOut size={16} />
                    <span>Terminar Sessao</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
