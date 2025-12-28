'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  Ticket,
  Calendar,
  MapPin,
  Clock,
  QrCode,
  Download,
  Share2,
  ChevronRight,
  History,
  Search,
  LogIn,
} from 'lucide-react';
import { auth, db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

interface TicketData {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: Date;
  eventTime: string;
  eventLocation: string;
  eventCity: string;
  eventIsland: string;
  eventImage: string;
  ticketTypeName: string;
  ticketNumber: string;
  qrCode: string;
  status: 'valid' | 'used' | 'cancelled' | 'refunded';
  purchasedAt: Date;
  checkedInAt?: Date;
}

function formatDate(date: Date) {
  return date.toLocaleDateString('pt-PT', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function formatFullDate(date: Date) {
  return date.toLocaleDateString('pt-PT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getDaysUntil(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(date);
  eventDate.setHours(0, 0, 0, 0);
  const diffTime = eventDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export default function TicketsPage() {
  const [user, authLoading] = useAuthState(auth);
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      loadTickets();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const loadTickets = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const ticketsRef = collection(db, 'tickets');
      const q = query(
        ticketsRef,
        where('userId', '==', user.uid),
        orderBy('purchasedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const ticketsData: TicketData[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          eventId: data.eventId || '',
          eventName: data.eventName || 'Evento',
          eventDate: data.eventDate?.toDate() || new Date(),
          eventTime: data.eventTime || '00:00',
          eventLocation: data.eventLocation || data.venue || '',
          eventCity: data.eventCity || data.city || '',
          eventIsland: data.eventIsland || data.island || '',
          eventImage: data.eventImage || data.coverImage || 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=200&fit=crop',
          ticketTypeName: data.ticketTypeName || 'Bilhete',
          ticketNumber: doc.id.slice(0, 8).toUpperCase(),
          qrCode: data.qrCode || doc.id,
          status: data.status || 'valid',
          purchasedAt: data.purchasedAt?.toDate() || new Date(),
          checkedInAt: data.checkedInAt?.toDate(),
        };
      });

      setTickets(ticketsData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading tickets:', error);
      setLoading(false);
    }
  };

  // Filter tickets by upcoming/past
  const upcomingTickets = tickets.filter((ticket) => {
    const daysUntil = getDaysUntil(ticket.eventDate);
    return daysUntil >= 0 && ticket.status !== 'used';
  });

  const pastTickets = tickets.filter((ticket) => {
    const daysUntil = getDaysUntil(ticket.eventDate);
    return daysUntil < 0 || ticket.status === 'used';
  });

  const displayTickets = activeTab === 'upcoming' ? upcomingTickets : pastTickets;

  // Loading state
  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-background pt-20 pb-16">
        <div className="container-app flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-primary border-t-transparent" />
            <p className="text-zinc-500">A carregar bilhetes...</p>
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
              Inicia sessão para ver os teus bilhetes
            </h2>
            <p className="text-zinc-400 mb-8 max-w-md">
              Precisas de estar autenticado para aceder aos teus bilhetes e histórico de eventos.
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
            <Link href="/profile" className="btn btn-ghost btn-sm">
              Perfil
            </Link>
          </div>
        </div>
      </header>

      <div className="container-app">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="heading-display text-3xl mb-2">
            Meus <span className="text-gradient">Bilhetes</span>
          </h1>
          <p className="text-zinc-400">
            Gere todos os teus bilhetes num só lugar
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'upcoming'
                ? 'bg-brand-primary text-white'
                : 'bg-background-secondary text-zinc-400 hover:text-white'
            }`}
          >
            <Ticket className="h-5 w-5" />
            Próximos ({upcomingTickets.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'past'
                ? 'bg-brand-primary text-white'
                : 'bg-background-secondary text-zinc-400 hover:text-white'
            }`}
          >
            <History className="h-5 w-5" />
            Histórico ({pastTickets.length})
          </button>
        </div>

        {/* Tickets List */}
        {displayTickets.length > 0 ? (
          <div className="space-y-4">
            {displayTickets.map((ticket) => {
              const daysUntil = getDaysUntil(ticket.eventDate);
              const isExpanded = selectedTicket === ticket.id;
              const location = `${ticket.eventCity}, ${ticket.eventIsland}`;

              return (
                <div
                  key={ticket.id}
                  className={`glass-card overflow-hidden transition-all ${
                    ticket.status === 'used' ? 'opacity-75' : ''
                  }`}
                >
                  {/* Ticket Header */}
                  <button
                    onClick={() => setSelectedTicket(isExpanded ? null : ticket.id)}
                    className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <Image
                        src={ticket.eventImage}
                        alt={ticket.eventName}
                        fill
                        className="object-cover"
                      />
                      {ticket.status === 'valid' && daysUntil <= 7 && daysUntil > 0 && (
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/80 to-transparent flex items-end justify-center pb-1">
                          <span className="text-xs font-bold text-white">
                            {daysUntil}d
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white line-clamp-1">
                          {ticket.eventName}
                        </h3>
                        {ticket.status === 'used' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-400">
                            Utilizado
                          </span>
                        )}
                        {ticket.status === 'cancelled' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/50 text-red-400">
                            Cancelado
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-zinc-400 mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(ticket.eventDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {ticket.eventTime}
                        </span>
                      </div>
                      <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-brand-primary/20 text-brand-primary">
                        {ticket.ticketTypeName}
                      </span>
                    </div>

                    <ChevronRight
                      className={`h-5 w-5 text-zinc-500 transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-white/10">
                      {/* QR Code */}
                      <div className="p-6 flex flex-col items-center">
                        <div className="bg-white rounded-2xl p-4 mb-4">
                          <QRCodeSVG
                            value={ticket.qrCode}
                            size={192}
                            level="H"
                            includeMargin={true}
                          />
                        </div>
                        <p className="text-sm text-zinc-500 mb-1">Bilhete #{ticket.ticketNumber}</p>
                        <p className="text-xs text-zinc-600 font-mono">{ticket.qrCode}</p>
                        {ticket.checkedInAt && (
                          <p className="text-xs text-zinc-500 mt-2">
                            Check-in: {ticket.checkedInAt.toLocaleString('pt-PT')}
                          </p>
                        )}
                      </div>

                      {/* Event Details */}
                      <div className="px-6 pb-4 space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                          <Calendar className="h-4 w-4 text-zinc-500" />
                          <span className="text-zinc-300">{formatFullDate(ticket.eventDate)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Clock className="h-4 w-4 text-zinc-500" />
                          <span className="text-zinc-300">Início às {ticket.eventTime}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <MapPin className="h-4 w-4 text-zinc-500" />
                          <span className="text-zinc-300">{location}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="p-4 bg-background-secondary flex gap-3">
                        <button className="btn btn-ghost flex-1 btn-sm">
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                        <button className="btn btn-ghost flex-1 btn-sm">
                          <Share2 className="h-4 w-4" />
                          Partilhar
                        </button>
                        <Link
                          href={`/events/${ticket.eventId}`}
                          className="btn btn-primary flex-1 btn-sm"
                        >
                          Ver Evento
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-background-secondary flex items-center justify-center mx-auto mb-4">
              {activeTab === 'upcoming' ? (
                <Ticket className="h-10 w-10 text-zinc-500" />
              ) : (
                <History className="h-10 w-10 text-zinc-500" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {activeTab === 'upcoming' ? 'Sem bilhetes próximos' : 'Sem histórico'}
            </h3>
            <p className="text-zinc-400 mb-6">
              {activeTab === 'upcoming'
                ? 'Ainda não compraste bilhetes para eventos futuros.'
                : 'Ainda não participaste em nenhum evento.'}
            </p>
            {activeTab === 'upcoming' && (
              <Link href="/events" className="btn btn-primary">
                <Search className="h-5 w-5" />
                Explorar Eventos
              </Link>
            )}
          </div>
        )}

        {/* Info Card */}
        {displayTickets.length > 0 && (
          <div className="mt-8 glass-card p-6">
            <h3 className="font-semibold text-white mb-3">Como usar o teu bilhete</h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-primary/20 text-brand-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                Apresenta o código QR na entrada do evento
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-primary/20 text-brand-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                Podes também fazer download do bilhete em PDF
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-primary/20 text-brand-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                Os bilhetes são nominativos e intransferíveis
              </li>
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
