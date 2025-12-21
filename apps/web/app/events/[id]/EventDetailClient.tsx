'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Heart,
  Share2,
  Ticket,
  Plus,
  Minus,
  Zap,
  Star,
  Info,
  ChevronRight,
} from 'lucide-react';
import { getEvent } from '../../../lib/services/events';
import { GuestRegistrationModal } from '../../../components/events/GuestRegistrationModal';

// Mock event data (fallback)
const mockEventData = {
  id: '1',
  title: 'Festival Baía das Gatas 2024',
  description: `O Festival Baía das Gatas é um dos maiores eventos musicais de Cabo Verde, celebrando a rica cultura musical do arquipélago.

Este ano, o festival traz uma lineup incrível com artistas nacionais e internacionais, prometendo noites inesquecíveis de música, dança e celebração.

Venha celebrar connosco neste evento único que acontece na deslumbrante praia de Baía das Gatas, em São Vicente.`,
  image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&h=600&fit=crop',
  gallery: [
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop',
  ],
  date: '2024-12-15',
  endDate: '2024-12-17',
  time: '18:00',
  endTime: '04:00',
  location: 'Baía das Gatas',
  city: 'Mindelo, São Vicente',
  address: 'Praia de Baía das Gatas, São Vicente, Cabo Verde',
  coordinates: { lat: 16.8892, lng: -24.9819 },
  category: 'Música',
  organizer: {
    name: 'Câmara Municipal de São Vicente',
    image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
    verified: true,
    eventsCount: 45,
  },
  isHot: true,
  attendees: 1250,
  totalCapacity: 5000,
  rating: 4.8,
  reviewsCount: 324,
  tickets: [
    {
      id: 'general',
      name: 'Entrada Geral',
      description: 'Acesso às três noites do festival',
      price: 2500,
      available: 3200,
      total: 4000,
      perPersonLimit: 5,
    },
    {
      id: 'vip',
      name: 'VIP Pass',
      description: 'Acesso VIP com área exclusiva, bar aberto e estacionamento',
      price: 7500,
      available: 180,
      total: 500,
      perPersonLimit: 2,
    },
    {
      id: 'backstage',
      name: 'Backstage Experience',
      description: 'Acesso total incluindo backstage e meet & greet com artistas',
      price: 15000,
      available: 12,
      total: 50,
      perPersonLimit: 1,
    },
  ],
  features: [
    'Estacionamento gratuito',
    'Food trucks',
    'Área de descanso',
    'Primeiros socorros',
    'WiFi gratuito',
  ],
  lineup: [
    { name: 'Cesária Évora Tribute', time: '20:00', day: 'Sexta' },
    { name: 'Mayra Andrade', time: '22:00', day: 'Sexta' },
    { name: 'Djodje', time: '20:00', day: 'Sábado' },
    { name: 'Elida Almeida', time: '22:00', day: 'Sábado' },
    { name: 'Ferro Gaita', time: '00:00', day: 'Sábado' },
  ],
};

function formatShortDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-PT', {
    day: 'numeric',
    month: 'short',
  });
}

export default function EventDetailClient() {
  const params = useParams();
  const eventId = params.id as string;

  // Fetch event data from Firebase
  const { data: firebaseEvent, isLoading, error } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => getEvent(eventId),
    enabled: !!eventId,
  });

  // Use Firebase data if available, otherwise use mock data
  const event = firebaseEvent || mockEventData;

  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});
  const [isFavorite, setIsFavorite] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando evento...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || (!firebaseEvent && eventId !== '1')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-900 mb-2">Evento não encontrado</p>
          <p className="text-gray-600">O evento que procura não existe ou foi removido.</p>
          <Link
            href="/events"
            className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Ver todos os eventos
          </Link>
        </div>
      </div>
    );
  }

  const updateTicketQuantity = (ticketId: string, delta: number) => {
    setSelectedTickets((prev) => {
      const current = prev[ticketId] || 0;
      const ticket = eventData.tickets.find((t) => t.id === ticketId);
      const max = ticket?.perPersonLimit || 5;
      const newValue = Math.max(0, Math.min(max, current + delta));
      return { ...prev, [ticketId]: newValue };
    });
  };

  const totalPrice = Object.entries(selectedTickets).reduce((sum, [ticketId, quantity]) => {
    const ticket = eventData.tickets.find((t) => t.id === ticketId);
    return sum + (ticket?.price || 0) * quantity;
  }, 0);

  const totalTickets = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);

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
    <main className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-subtle">
        <div className="container-app">
          <div className="flex h-16 items-center justify-between">
            <Link href="/events" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Voltar</span>
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 rounded-full transition-all ${
                  isFavorite ? 'bg-red-500/20 text-red-400' : 'glass hover:bg-white/10 text-zinc-400'
                }`}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 rounded-full glass hover:bg-white/10 text-zinc-400 transition-colors">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Image */}
      <div className="relative h-[50vh] min-h-[400px]">
        <Image
          src={eventData.image}
          alt={eventData.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

        {/* Badges */}
        <div className="absolute top-20 left-4 flex items-center gap-2">
          {eventData.isHot && (
            <span className="badge-hot">
              <Zap className="h-3 w-3" />
              HOT
            </span>
          )}
          <span className="badge-glass">{eventData.category}</span>
        </div>
      </div>

      <div className="container-app -mt-32 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Info */}
            <div className="glass-card p-6 md:p-8">
              <h1 className="heading-display text-2xl sm:text-3xl md:text-4xl mb-4">
                {eventData.title}
              </h1>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 text-brand-accent">
                  <Calendar className="h-5 w-5" />
                  <span>
                    {formatShortDate(eventData.date)}
                    {eventData.endDate && ` - ${formatShortDate(eventData.endDate)}`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <Clock className="h-5 w-5" />
                  <span>{eventData.time} - {eventData.endTime}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <MapPin className="h-5 w-5" />
                  <span>{eventData.city}</span>
                </div>
              </div>

              {/* Rating & Attendees */}
              <div className="flex items-center gap-6 pb-6 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="h-5 w-5 fill-current" />
                    <span className="font-semibold">{eventData.rating}</span>
                  </div>
                  <span className="text-zinc-500">({eventData.reviewsCount} avaliações)</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <Users className="h-5 w-5" />
                  <span>{eventData.attendees.toLocaleString()} confirmados</span>
                </div>
              </div>

              {/* Description */}
              <div className="pt-6">
                <h2 className="font-display font-semibold text-xl mb-4">Sobre o Evento</h2>
                <p className="text-zinc-400 whitespace-pre-line leading-relaxed">
                  {eventData.description}
                </p>
              </div>
            </div>

            {/* Lineup */}
            <div className="glass-card p-6 md:p-8">
              <h2 className="font-display font-semibold text-xl mb-6">Lineup</h2>
              <div className="space-y-3">
                {eventData.lineup.map((artist, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-xl bg-background-secondary hover:bg-background-tertiary transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
                        {artist.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{artist.name}</p>
                        <p className="text-sm text-zinc-500">{artist.day}</p>
                      </div>
                    </div>
                    <span className="text-brand-accent font-medium">{artist.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="glass-card p-6 md:p-8">
              <h2 className="font-display font-semibold text-xl mb-6">Localização</h2>
              <div className="aspect-video rounded-xl bg-background-secondary overflow-hidden mb-4">
                <div className="w-full h-full flex items-center justify-center text-zinc-500">
                  <MapPin className="h-12 w-12" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-white">{eventData.location}</p>
                <p className="text-zinc-400">{eventData.address}</p>
              </div>
            </div>

            {/* Features */}
            <div className="glass-card p-6 md:p-8">
              <h2 className="font-display font-semibold text-xl mb-6">O que está incluído</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {eventData.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-xl bg-background-secondary"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-primary/20 flex items-center justify-center">
                      <Info className="h-4 w-4 text-brand-primary" />
                    </div>
                    <span className="text-sm text-zinc-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Organizer */}
            <div className="glass-card p-6 md:p-8">
              <h2 className="font-display font-semibold text-xl mb-6">Organizador</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden">
                    <Image
                      src={eventData.organizer.image}
                      alt={eventData.organizer.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white">{eventData.organizer.name}</p>
                      {eventData.organizer.verified && (
                        <span className="w-5 h-5 rounded-full bg-brand-accent flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-500">{eventData.organizer.eventsCount} eventos organizados</p>
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm">
                  Ver Perfil
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar - Tickets */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-20">
              <h2 className="font-display font-semibold text-xl mb-6">Selecionar Bilhetes</h2>

              <div className="space-y-4 mb-6">
                {eventData.tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`p-4 rounded-xl border transition-all ${
                      selectedTickets[ticket.id]
                        ? 'border-brand-primary bg-brand-primary/10'
                        : 'border-white/10 bg-background-secondary hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{ticket.name}</h3>
                        <p className="text-sm text-zinc-500 mt-1">{ticket.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <p className="text-xl font-bold text-white">
                          {ticket.price.toLocaleString('pt-CV')}$00
                        </p>
                        <p className="text-xs text-zinc-500">
                          {ticket.available} disponíveis
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateTicketQuantity(ticket.id, -1)}
                          disabled={!selectedTickets[ticket.id]}
                          className="w-8 h-8 rounded-lg bg-background-tertiary flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-semibold text-white">
                          {selectedTickets[ticket.id] || 0}
                        </span>
                        <button
                          onClick={() => updateTicketQuantity(ticket.id, 1)}
                          disabled={selectedTickets[ticket.id] >= ticket.perPersonLimit}
                          className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white hover:bg-brand-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              {totalTickets > 0 && (
                <div className="border-t border-white/10 pt-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-zinc-400">Subtotal ({totalTickets} bilhete{totalTickets > 1 ? 's' : ''})</span>
                    <span className="font-semibold text-white">{totalPrice.toLocaleString('pt-CV')}$00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Taxa de serviço</span>
                    <span className="font-semibold text-white">{(totalPrice * 0.05).toLocaleString('pt-CV')}$00</span>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                    <span className="font-semibold text-white">Total</span>
                    <span className="text-xl font-bold text-gradient">{(totalPrice * 1.05).toLocaleString('pt-CV')}$00</span>
                  </div>
                </div>
              )}

              <Link
                href={totalTickets > 0 ? `/checkout?event=${eventData.id}` : '#'}
                className={`btn w-full ${totalTickets > 0 ? 'btn-primary' : 'btn-ghost opacity-50 cursor-not-allowed'}`}
              >
                <Ticket className="h-5 w-5" />
                {totalTickets > 0 ? 'Continuar para Pagamento' : 'Selecione os Bilhetes'}
              </Link>

              <p className="text-xs text-zinc-500 text-center mt-4">
                Pagamento seguro. Os bilhetes serão enviados por email.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 glass-subtle border-t border-white/10 p-4 lg:hidden">
        <div className="container-app">
          {/* Registration Button */}
          <button
            onClick={() => setShowRegistrationModal(true)}
            className="w-full px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors mb-4"
          >
            Registar Interesse
          </button>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-400">A partir de</p>
              <p className="text-xl font-bold text-white">
                {event.tickets?.[0]?.price?.toLocaleString('pt-CV') || '0'}$00
              </p>
            </div>
            <Link
              href={`/checkout?event=${event.id}`}
              className="btn btn-primary flex-1 max-w-[200px]"
            >
              <Ticket className="h-5 w-5" />
              Comprar
            </Link>
          </div>
        </div>
      </div>

      {/* Guest Registration Modal */}
      <GuestRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        eventId={event.id}
        eventTitle={event.title}
        customFields={event.registration?.customFields || []}
      />
    </main>
  );
}
