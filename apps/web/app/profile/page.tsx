'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  User,
  Wallet,
  Ticket,
  Settings,
  Bell,
  CreditCard,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  ChevronRight,
  LogOut,
  Edit2,
  Shield,
  Smartphone,
  Gift,
  Star,
} from 'lucide-react';

// Mock user data
const userData = {
  name: 'João Silva',
  email: 'joao.silva@email.com',
  phone: '+238 999 1234',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  memberSince: '2024-06-15',
  wallet: {
    balance: 15500,
    pendingBonus: 500,
    loyaltyPoints: 2340,
    tier: 'Gold',
  },
  stats: {
    eventsAttended: 12,
    totalSpent: 45000,
    ticketsPurchased: 18,
  },
  recentTransactions: [
    { id: '1', type: 'purchase', description: 'Festival Baía das Gatas', amount: -7500, date: '2024-12-10' },
    { id: '2', type: 'topup', description: 'Carregamento via SISP', amount: 10000, date: '2024-12-08' },
    { id: '3', type: 'bonus', description: 'Bónus de referência', amount: 500, date: '2024-12-05' },
    { id: '4', type: 'purchase', description: 'Noite de Jazz', amount: -1500, date: '2024-12-01' },
    { id: '5', type: 'refund', description: 'Reembolso - Evento cancelado', amount: 2000, date: '2024-11-28' },
  ],
  upcomingEvents: [
    {
      id: '1',
      title: 'Festival Baía das Gatas 2024',
      date: '2024-12-15',
      location: 'Mindelo, São Vicente',
      ticketType: 'VIP Pass',
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=200&h=120&fit=crop',
    },
    {
      id: '2',
      title: 'Beach Party Sal 2024',
      date: '2024-12-28',
      location: 'Santa Maria, Sal',
      ticketType: 'Entrada Geral',
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&h=120&fit=crop',
    },
  ],
};

const menuItems = [
  { icon: User, label: 'Dados Pessoais', href: '/profile/settings' },
  { icon: Ticket, label: 'Meus Bilhetes', href: '/tickets' },
  { icon: Bell, label: 'Notificações', href: '/profile/notifications' },
  { icon: CreditCard, label: 'Métodos de Pagamento', href: '/profile/payments' },
  { icon: Shield, label: 'Segurança', href: '/profile/security' },
  { icon: Smartphone, label: 'Pulseiras NFC', href: '/profile/nfc' },
  { icon: Gift, label: 'Programa de Referência', href: '/profile/referral' },
];

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-PT', {
    day: 'numeric',
    month: 'short',
  });
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'wallet' | 'events'>('wallet');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-background pt-20 pb-16">
        <div className="container-app flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-zinc-500">A carregar...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-20 pb-16">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-subtle">
        <div className="container-app">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Ticket className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-white">
                Events<span className="text-gradient">CV</span>
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-full glass hover:bg-white/10 text-zinc-400 transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-brand-primary rounded-full" />
              </button>
              <button className="p-2 rounded-full glass hover:bg-white/10 text-zinc-400 transition-colors">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container-app">
        {/* Profile Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-brand-primary/20">
                <Image
                  src={userData.avatar}
                  alt={userData.name}
                  width={80}
                  height={80}
                  className="object-cover"
                />
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-brand-primary flex items-center justify-center">
                <Edit2 className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-white">{userData.name}</h1>
                <span className="badge-hot text-xs">
                  <Star className="h-3 w-3" />
                  {userData.wallet.tier}
                </span>
              </div>
              <p className="text-zinc-400">{userData.email}</p>
              <p className="text-sm text-zinc-500">Membro desde {formatDate(userData.memberSince)}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-xl bg-background-secondary">
              <p className="text-2xl font-bold text-gradient">{userData.stats.eventsAttended}</p>
              <p className="text-xs text-zinc-500">Eventos</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-background-secondary">
              <p className="text-2xl font-bold text-gradient">{userData.stats.ticketsPurchased}</p>
              <p className="text-xs text-zinc-500">Bilhetes</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-background-secondary">
              <p className="text-2xl font-bold text-gradient">{userData.wallet.loyaltyPoints}</p>
              <p className="text-xs text-zinc-500">Pontos</p>
            </div>
          </div>
        </div>

        {/* Wallet Card */}
        <div className="glass-card p-6 mb-6 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Saldo Disponível</p>
                <p className="text-3xl font-bold text-white">
                  {userData.wallet.balance.toLocaleString('pt-CV')}$00
                </p>
              </div>
            </div>
            {userData.wallet.pendingBonus > 0 && (
              <div className="text-right">
                <p className="text-xs text-zinc-500">Bónus pendente</p>
                <p className="text-sm font-semibold text-brand-accent">
                  +{userData.wallet.pendingBonus}$00
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Link href="/profile/wallet/topup" className="btn btn-primary flex-1">
              <Plus className="h-5 w-5" />
              Carregar
            </Link>
            <Link href="/profile/wallet/history" className="btn btn-ghost flex-1">
              <History className="h-5 w-5" />
              Histórico
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'wallet'
                ? 'bg-brand-primary text-white'
                : 'bg-background-secondary text-zinc-400 hover:text-white'
            }`}
          >
            Transações
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'events'
                ? 'bg-brand-primary text-white'
                : 'bg-background-secondary text-zinc-400 hover:text-white'
            }`}
          >
            Próximos Eventos
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'wallet' ? (
          <div className="glass-card divide-y divide-white/5">
            {userData.recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center gap-4 p-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.amount > 0 ? 'bg-success/20' : 'bg-background-secondary'
                }`}>
                  {transaction.amount > 0 ? (
                    <ArrowDownLeft className={`h-5 w-5 ${
                      transaction.type === 'bonus' ? 'text-brand-accent' : 'text-success'
                    }`} />
                  ) : (
                    <ArrowUpRight className="h-5 w-5 text-zinc-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">{transaction.description}</p>
                  <p className="text-sm text-zinc-500">{formatDate(transaction.date)}</p>
                </div>
                <p className={`font-semibold ${transaction.amount > 0 ? 'text-success' : 'text-white'}`}>
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString('pt-CV')}$00
                </p>
              </div>
            ))}
            <Link
              href="/profile/wallet/history"
              className="flex items-center justify-center gap-2 p-4 text-brand-primary hover:text-brand-secondary transition-colors"
            >
              Ver todo o histórico
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {userData.upcomingEvents.map((event) => (
              <Link
                key={event.id}
                href={`/tickets/${event.id}`}
                className="flex gap-4 p-4 glass-card hover:border-white/20 transition-all group"
              >
                <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white group-hover:text-brand-primary transition-colors">
                    {event.title}
                  </p>
                  <p className="text-sm text-zinc-500">{formatDate(event.date)} • {event.location}</p>
                  <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-brand-primary/20 text-brand-primary">
                    {event.ticketType}
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 text-zinc-500 group-hover:text-white transition-colors" />
              </Link>
            ))}
            <Link
              href="/tickets"
              className="flex items-center justify-center gap-2 p-4 glass-card text-brand-primary hover:text-brand-secondary transition-colors"
            >
              Ver todos os bilhetes
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Menu Items */}
        <div className="glass-card mt-6 divide-y divide-white/5">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-background-secondary flex items-center justify-center">
                <item.icon className="h-5 w-5 text-zinc-400" />
              </div>
              <span className="flex-1 font-medium text-white">{item.label}</span>
              <ChevronRight className="h-5 w-5 text-zinc-500" />
            </Link>
          ))}
        </div>

        {/* Logout */}
        <button className="w-full mt-6 flex items-center justify-center gap-2 p-4 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors">
          <LogOut className="h-5 w-5" />
          Terminar Sessão
        </button>
      </div>
    </main>
  );
}
