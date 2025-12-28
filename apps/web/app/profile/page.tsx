'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
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
  LogIn,
} from 'lucide-react';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

interface UserData {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  memberSince: Date;
  wallet: {
    balance: number;
    pendingBonus: number;
    loyaltyPoints: number;
    tier: string;
  };
  stats: {
    eventsAttended: number;
    totalSpent: number;
    ticketsPurchased: number;
  };
}

interface Transaction {
  id: string;
  type: 'purchase' | 'topup' | 'bonus' | 'refund';
  description: string;
  amount: number;
  date: Date;
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: Date;
  location: string;
  ticketType: string;
  image: string;
}

const menuItems = [
  { icon: User, label: 'Dados Pessoais', href: '/profile/settings' },
  { icon: Ticket, label: 'Meus Bilhetes', href: '/tickets' },
  { icon: Bell, label: 'Notificações', href: '/profile/notifications' },
  { icon: CreditCard, label: 'Métodos de Pagamento', href: '/profile/payments' },
  { icon: Shield, label: 'Segurança', href: '/profile/security' },
  { icon: Smartphone, label: 'Pulseiras NFC', href: '/profile/nfc' },
  { icon: Gift, label: 'Programa de Referência', href: '/profile/referral' },
];

function formatDate(date: Date) {
  return date.toLocaleDateString('pt-PT', {
    day: 'numeric',
    month: 'short',
  });
}

function formatFullDate(date: Date) {
  return date.toLocaleDateString('pt-PT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, authLoading] = useAuthState(auth);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'wallet' | 'events'>('wallet');

  useEffect(() => {
    if (!authLoading && user) {
      loadUserData();
      loadTransactions();
      loadUpcomingEvents();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Get user document
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userDataFromDb = userDoc.data();

      // Count tickets for stats
      const ticketsRef = collection(db, 'tickets');
      const ticketsQuery = query(ticketsRef, where('userId', '==', user.uid));
      const ticketsSnapshot = await getDocs(ticketsQuery);

      const ticketsPurchased = ticketsSnapshot.size;
      const eventsAttended = ticketsSnapshot.docs.filter(
        doc => doc.data().status === 'used'
      ).length;

      const totalSpent = ticketsSnapshot.docs.reduce((sum, doc) => {
        return sum + (doc.data().price || 0);
      }, 0);

      setUserData({
        name: userDataFromDb?.name || user.displayName || 'Utilizador',
        email: user.email || '',
        phone: userDataFromDb?.phone,
        avatar: userDataFromDb?.avatarUrl || user.photoURL || undefined,
        memberSince: userDataFromDb?.createdAt?.toDate() || new Date(),
        wallet: {
          balance: userDataFromDb?.wallet?.balance || 0,
          pendingBonus: userDataFromDb?.wallet?.bonusBalance || 0,
          loyaltyPoints: userDataFromDb?.loyalty?.points || 0,
          tier: userDataFromDb?.loyalty?.tier || 'Bronze',
        },
        stats: {
          eventsAttended,
          totalSpent,
          ticketsPurchased,
        },
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    if (!user) return;

    try {
      const transactionsRef = collection(db, 'walletTransactions');
      const q = query(
        transactionsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      const snapshot = await getDocs(q);
      const transactionsData: Transaction[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type || 'purchase',
          description: data.description || 'Transação',
          amount: data.amount || 0,
          date: data.createdAt?.toDate() || new Date(),
        };
      });

      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadUpcomingEvents = async () => {
    if (!user) return;

    try {
      const ticketsRef = collection(db, 'tickets');
      const q = query(
        ticketsRef,
        where('userId', '==', user.uid),
        where('status', 'in', ['valid', 'confirmed']),
        orderBy('eventDate', 'asc'),
        limit(5)
      );

      const snapshot = await getDocs(q);
      const eventsData: UpcomingEvent[] = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          const eventDate = data.eventDate?.toDate() || new Date();

          // Only include future events
          if (eventDate < new Date()) return null;

          return {
            id: doc.id,
            title: data.eventName || 'Evento',
            date: eventDate,
            location: `${data.eventCity || ''}, ${data.eventIsland || ''}`,
            ticketType: data.ticketTypeName || 'Bilhete',
            image: data.eventImage || 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=200&h=120&fit=crop',
          };
        })
        .filter((event): event is UpcomingEvent => event !== null);

      setUpcomingEvents(eventsData);
    } catch (error) {
      console.error('Error loading upcoming events:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-background pt-20 pb-16">
        <div className="container-app flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-primary border-t-transparent" />
            <p className="text-zinc-500">A carregar perfil...</p>
          </div>
        </div>
      </main>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <main className="min-h-screen bg-background pt-20 pb-16">
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
            </div>
          </div>
        </header>

        <div className="container-app">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-800/50 mb-6">
              <LogIn className="h-10 w-10 text-zinc-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Inicia sessão para ver o teu perfil
            </h2>
            <p className="text-zinc-400 mb-8 max-w-md">
              Precisas de estar autenticado para aceder ao teu perfil e wallet.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/auth/login" className="btn btn-primary">
                <LogIn className="h-5 w-5" />
                Iniciar Sessão
              </Link>
              <Link href="/auth/register" className="btn btn-secondary">
                Criar Conta
              </Link>
            </div>
          </div>
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
                {userData?.avatar ? (
                  <Image
                    src={userData.avatar}
                    alt={userData.name}
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                    <User className="h-10 w-10 text-white" />
                  </div>
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-brand-primary flex items-center justify-center">
                <Edit2 className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-white">{userData?.name}</h1>
                <span className="badge-hot text-xs">
                  <Star className="h-3 w-3" />
                  {userData?.wallet.tier}
                </span>
              </div>
              <p className="text-zinc-400">{userData?.email}</p>
              <p className="text-sm text-zinc-500">
                Membro desde {userData && formatFullDate(userData.memberSince)}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-xl bg-background-secondary">
              <p className="text-2xl font-bold text-gradient">{userData?.stats.eventsAttended || 0}</p>
              <p className="text-xs text-zinc-500">Eventos</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-background-secondary">
              <p className="text-2xl font-bold text-gradient">{userData?.stats.ticketsPurchased || 0}</p>
              <p className="text-xs text-zinc-500">Bilhetes</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-background-secondary">
              <p className="text-2xl font-bold text-gradient">{userData?.wallet.loyaltyPoints || 0}</p>
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
                  {(userData?.wallet.balance || 0).toLocaleString('pt-CV')}$00
                </p>
              </div>
            </div>
            {(userData?.wallet.pendingBonus || 0) > 0 && (
              <div className="text-right">
                <p className="text-xs text-zinc-500">Bónus pendente</p>
                <p className="text-sm font-semibold text-brand-accent">
                  +{userData?.wallet.pendingBonus}$00
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
            Transações ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'events'
                ? 'bg-brand-primary text-white'
                : 'bg-background-secondary text-zinc-400 hover:text-white'
            }`}
          >
            Próximos Eventos ({upcomingEvents.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'wallet' ? (
          transactions.length > 0 ? (
            <div className="glass-card divide-y divide-white/5">
              {transactions.map((transaction) => (
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
                    <p className="text-sm text-zinc-500">{formatFullDate(transaction.date)}</p>
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
            <div className="glass-card text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-800/50 mb-4">
                <Wallet className="h-8 w-8 text-zinc-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Sem transações
              </h3>
              <p className="text-zinc-400 mb-6">
                As tuas transações aparecerão aqui
              </p>
            </div>
          )
        ) : (
          upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href="/tickets"
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
                    <p className="text-sm text-zinc-500">
                      {formatFullDate(event.date)} • {event.location}
                    </p>
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
          ) : (
            <div className="glass-card text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-800/50 mb-4">
                <Ticket className="h-8 w-8 text-zinc-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Sem eventos próximos
              </h3>
              <p className="text-zinc-400 mb-6">
                Ainda não compraste bilhetes para eventos futuros
              </p>
              <Link href="/events" className="btn btn-primary">
                Explorar Eventos
              </Link>
            </div>
          )
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
        <button
          onClick={handleLogout}
          className="w-full mt-6 flex items-center justify-center gap-2 p-4 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Terminar Sessão
        </button>
      </div>
    </main>
  );
}
