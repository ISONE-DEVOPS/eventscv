'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Heart,
  Users,
  Zap,
  ChevronDown,
  Grid,
  List,
  Ticket,
  TrendingUp,
  Clock,
  X,
} from 'lucide-react';
import { getFirestore, collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';

interface Event {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  startDate: Date;
  endDate: Date;
  location: {
    venue: string;
    city: string;
    island: string;
  };
  category: string;
  ticketTypes: Array<{
    id: string;
    name: string;
    price: number;
    currency: string;
    capacity: number;
    sold: number;
  }>;
  capacity: number;
  ticketsSold: number;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  createdAt: Date;
}

const categories = ['Todos', 'Música', 'Festas', 'Desporto', 'Gastronomia', 'Cultura', 'Negócios', 'Arte'];
const islands = ['Todas', 'Santiago', 'São Vicente', 'Sal', 'Boa Vista', 'Fogo', 'Santo Antão', 'Maio', 'Brava', 'São Nicolau'];

function formatDate(date: Date) {
  return date.toLocaleDateString('pt-CV', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).toUpperCase();
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('pt-CV', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedIsland, setSelectedIsland] = useState('Todas');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'popular' | 'price'>('date');
  const [showFilters, setShowFilters] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadEvents();
  }, [sortBy]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const db = getFirestore();

      // Build query
      let q = query(
        collection(db, 'events'),
        where('status', '==', 'published'),
        where('startDate', '>=', Timestamp.now())
      );

      // Add ordering
      if (sortBy === 'date') {
        q = query(q, orderBy('startDate', 'asc'));
      } else if (sortBy === 'popular') {
        q = query(q, orderBy('ticketsSold', 'desc'));
      }

      q = query(q, limit(50));

      const snapshot = await getDocs(q);
      const eventsData: Event[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          coverImage: data.coverImage,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
          location: data.location || { venue: '', city: '', island: '' },
          category: data.category || 'Outro',
          ticketTypes: data.ticketTypes || [],
          capacity: data.capacity || 0,
          ticketsSold: data.ticketsSold || 0,
          status: data.status || 'draft',
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      });

      setEvents(eventsData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading events:', error);
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'Todos' || event.category === selectedCategory;
    const matchesIsland = selectedIsland === 'Todas' || event.location.island === selectedIsland;

    return matchesSearch && matchesCategory && matchesIsland;
  });

  // Sort by price if selected
  const sortedEvents = [...filteredEvents];
  if (sortBy === 'price') {
    sortedEvents.sort((a, b) => {
      const aMinPrice = Math.min(...a.ticketTypes.map(t => t.price));
      const bMinPrice = Math.min(...b.ticketTypes.map(t => t.price));
      return aMinPrice - bMinPrice;
    });
  }

  const getMinPrice = (event: Event) => {
    if (event.ticketTypes.length === 0) return 0;
    return Math.min(...event.ticketTypes.map(t => t.price));
  };

  const getCapacityPercentage = (event: Event) => {
    if (event.capacity === 0) return 0;
    return (event.ticketsSold / event.capacity) * 100;
  };

  const isEventHot = (event: Event) => {
    const capacityPercent = getCapacityPercentage(event);
    const daysUntilEvent = Math.ceil((event.startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return capacityPercent > 70 || daysUntilEvent <= 7;
  };

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
              <Link href="/gamification" className="btn btn-ghost btn-sm hidden md:flex">
                <TrendingUp className="h-4 w-4" />
                Gamificação
              </Link>
              <Link href="/profile" className="btn btn-ghost btn-sm">Perfil</Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container-app">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="heading-display text-3xl sm:text-4xl mb-2">
            Explorar <span className="text-gradient">Eventos</span>
          </h1>
          <p className="text-zinc-400">
            Descobre os melhores eventos em Cabo Verde
          </p>
        </div>

        {/* Search Bar */}
        <div className="glass-card p-4 mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
              <input
                type="text"
                placeholder="Pesquisar eventos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-12"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn ${showFilters ? 'btn-primary' : 'btn-ghost'}`}
            >
              <Filter className="h-5 w-5" />
              <span className="hidden sm:inline">Filtros</span>
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/5">
              {/* Category Filter */}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Categoria</label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="input pr-10 appearance-none cursor-pointer w-full"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                </div>
              </div>

              {/* Island Filter */}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Ilha</label>
                <div className="relative">
                  <select
                    value={selectedIsland}
                    onChange={(e) => setSelectedIsland(e.target.value)}
                    className="input pr-10 appearance-none cursor-pointer w-full"
                  >
                    {islands.map((island) => (
                      <option key={island} value={island}>{island}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Ordenar por</label>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'popular' | 'price')}
                    className="input pr-10 appearance-none cursor-pointer w-full"
                  >
                    <option value="date">Data</option>
                    <option value="popular">Popularidade</option>
                    <option value="price">Preço</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Filters */}
        {(selectedCategory !== 'Todos' || selectedIsland !== 'Todas' || searchQuery) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-primary/20 text-brand-primary text-sm"
              >
                Pesquisa: "{searchQuery}"
                <X className="h-3 w-3" />
              </button>
            )}
            {selectedCategory !== 'Todos' && (
              <button
                onClick={() => setSelectedCategory('Todos')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-primary/20 text-brand-primary text-sm"
              >
                {selectedCategory}
                <X className="h-3 w-3" />
              </button>
            )}
            {selectedIsland !== 'Todas' && (
              <button
                onClick={() => setSelectedIsland('Todas')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-primary/20 text-brand-primary text-sm"
              >
                {selectedIsland}
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-zinc-400">
            <span className="text-white font-semibold">{sortedEvents.length}</span> eventos encontrados
          </p>

          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-background-secondary">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white'}`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white'}`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[16/10] bg-zinc-800 rounded-t-2xl" />
                <div className="p-5 bg-background-secondary rounded-b-2xl space-y-3">
                  <div className="h-4 bg-zinc-800 rounded w-3/4" />
                  <div className="h-6 bg-zinc-800 rounded" />
                  <div className="h-4 bg-zinc-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Events Grid/List */}
        {!loading && viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedEvents.map((event) => {
              const minPrice = getMinPrice(event);
              const capacityPercent = getCapacityPercentage(event);
              const isHot = isEventHot(event);

              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="card-event group"
                >
                  <div className="relative aspect-[16/10] overflow-hidden rounded-t-2xl">
                    {event.coverImage ? (
                      <Image
                        src={event.coverImage}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                        <Calendar className="w-16 h-16 text-zinc-700" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      {isHot && (
                        <span className="badge-hot">
                          <Zap className="h-3 w-3" />
                          HOT
                        </span>
                      )}
                      {capacityPercent > 90 && (
                        <span className="px-2 py-1 rounded-full bg-error/90 text-white text-xs font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Quase esgotado
                        </span>
                      )}
                    </div>

                    <button className="absolute top-4 right-4 p-2 rounded-full glass hover:bg-white/20 transition-colors">
                      <Heart className="h-4 w-4 text-white" />
                    </button>

                    {/* Capacity */}
                    {event.capacity > 0 && (
                      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full glass text-xs text-white">
                        <Users className="h-3 w-3" />
                        {event.ticketsSold}/{event.capacity}
                      </div>
                    )}
                  </div>

                  <div className="p-5 bg-background-secondary rounded-b-2xl border border-white/5 border-t-0">
                    <div className="flex items-center gap-2 text-brand-accent text-sm font-medium mb-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(event.startDate)} - {formatTime(event.startDate)}
                    </div>
                    <h3 className="font-display font-semibold text-lg text-white mb-2 line-clamp-2 group-hover:text-brand-primary transition-colors">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-zinc-400 text-sm mb-4">
                      <MapPin className="h-4 w-4" />
                      {event.location.city}, {event.location.island}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-zinc-500">A partir de</span>
                        <p className="text-white font-bold">
                          {minPrice > 0 ? `${minPrice.toLocaleString('pt-CV')}$00` : 'Grátis'}
                        </p>
                      </div>
                      <span className="badge-glass">
                        {event.category}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!loading && viewMode === 'list' && (
          <div className="space-y-4">
            {sortedEvents.map((event) => {
              const minPrice = getMinPrice(event);
              const isHot = isEventHot(event);

              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="flex gap-6 p-4 bg-background-secondary rounded-2xl border border-white/5 hover:border-white/10 transition-all group"
                >
                  <div className="relative w-48 h-32 rounded-xl overflow-hidden flex-shrink-0">
                    {event.coverImage ? (
                      <Image
                        src={event.coverImage}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                        <Calendar className="w-12 h-12 text-zinc-700" />
                      </div>
                    )}
                    {isHot && (
                      <span className="absolute top-2 left-2 badge-hot text-xs">
                        <Zap className="h-3 w-3" />
                        HOT
                      </span>
                    )}
                  </div>

                  <div className="flex-1 py-1">
                    <div className="flex items-center gap-2 text-brand-accent text-sm font-medium mb-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(event.startDate)} - {formatTime(event.startDate)}
                    </div>
                    <h3 className="font-display font-semibold text-xl text-white mb-2 group-hover:text-brand-primary transition-colors">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-4 text-zinc-400 text-sm">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {event.location.city}, {event.location.island}
                      </span>
                      {event.capacity > 0 && (
                        <span className="flex items-center gap-1.5">
                          <Users className="h-4 w-4" />
                          {event.ticketsSold}/{event.capacity}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between py-1">
                    <span className="badge-glass">{event.category}</span>
                    <div className="text-right">
                      <span className="text-xs text-zinc-500">A partir de</span>
                      <p className="text-white font-bold text-lg">
                        {minPrice > 0 ? `${minPrice.toLocaleString('pt-CV')}$00` : 'Grátis'}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* No Results */}
        {!loading && sortedEvents.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-background-secondary flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-zinc-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Nenhum evento encontrado</h3>
            <p className="text-zinc-400 mb-6">Tenta ajustar os filtros ou pesquisar por outro termo</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Todos');
                setSelectedIsland('Todas');
              }}
              className="btn btn-primary"
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
