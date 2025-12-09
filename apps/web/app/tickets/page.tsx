'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
} from 'lucide-react';

// Mock tickets data
const tickets = [
  {
    id: 'TKT-001',
    event: {
      id: '1',
      title: 'Festival Baía das Gatas 2024',
      date: '2024-12-15',
      time: '18:00',
      location: 'Mindelo, São Vicente',
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=200&fit=crop',
    },
    ticketType: 'VIP Pass',
    ticketNumber: '001234',
    purchaseDate: '2024-12-01',
    status: 'active',
    qrCode: 'EVT-BDG2024-VIP-001234',
  },
  {
    id: 'TKT-002',
    event: {
      id: '1',
      title: 'Festival Baía das Gatas 2024',
      date: '2024-12-15',
      time: '18:00',
      location: 'Mindelo, São Vicente',
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=200&fit=crop',
    },
    ticketType: 'VIP Pass',
    ticketNumber: '001235',
    purchaseDate: '2024-12-01',
    status: 'active',
    qrCode: 'EVT-BDG2024-VIP-001235',
  },
  {
    id: 'TKT-003',
    event: {
      id: '3',
      title: 'Beach Party Sal 2024',
      date: '2024-12-28',
      time: '22:00',
      location: 'Santa Maria, Sal',
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=200&fit=crop',
    },
    ticketType: 'Entrada Geral',
    ticketNumber: '005678',
    purchaseDate: '2024-12-05',
    status: 'active',
    qrCode: 'EVT-BPS2024-GEN-005678',
  },
];

const pastTickets = [
  {
    id: 'TKT-P001',
    event: {
      id: '10',
      title: 'Noite de Jazz no Quintal',
      date: '2024-11-20',
      time: '20:00',
      location: 'Praia, Santiago',
      image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=200&fit=crop',
    },
    ticketType: 'Entrada Geral',
    ticketNumber: '003456',
    purchaseDate: '2024-11-15',
    status: 'used',
    qrCode: 'EVT-NJQ2024-GEN-003456',
  },
];

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-PT', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function formatFullDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-PT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getDaysUntil(dateStr: string) {
  const eventDate = new Date(dateStr);
  const today = new Date();
  const diffTime = eventDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export default function TicketsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayTickets = activeTab === 'upcoming' ? tickets : pastTickets;

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
            Próximos ({tickets.length})
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
              const daysUntil = getDaysUntil(ticket.event.date);
              const isExpanded = selectedTicket === ticket.id;

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
                    className="w-full p-4 flex items-center gap-4"
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <Image
                        src={ticket.event.image}
                        alt={ticket.event.title}
                        fill
                        className="object-cover"
                      />
                      {ticket.status === 'active' && daysUntil <= 7 && daysUntil > 0 && (
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
                          {ticket.event.title}
                        </h3>
                        {ticket.status === 'used' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-400">
                            Utilizado
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-zinc-400 mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(ticket.event.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {ticket.event.time}
                        </span>
                      </div>
                      <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-brand-primary/20 text-brand-primary">
                        {ticket.ticketType}
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
                        <div className="w-48 h-48 bg-white rounded-2xl p-4 mb-4">
                          <div className="w-full h-full bg-background-secondary rounded-lg flex items-center justify-center">
                            <QrCode className="h-24 w-24 text-zinc-600" />
                          </div>
                        </div>
                        <p className="text-sm text-zinc-500 mb-1">Bilhete #{ticket.ticketNumber}</p>
                        <p className="text-xs text-zinc-600 font-mono">{ticket.qrCode}</p>
                      </div>

                      {/* Event Details */}
                      <div className="px-6 pb-4 space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                          <Calendar className="h-4 w-4 text-zinc-500" />
                          <span className="text-zinc-300">{formatFullDate(ticket.event.date)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Clock className="h-4 w-4 text-zinc-500" />
                          <span className="text-zinc-300">Início às {ticket.event.time}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <MapPin className="h-4 w-4 text-zinc-500" />
                          <span className="text-zinc-300">{ticket.event.location}</span>
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
                          href={`/events/${ticket.event.id}`}
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
      </div>
    </main>
  );
}
