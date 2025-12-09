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
} from 'lucide-react';

// Mock data
const events = [
  {
    id: '1',
    title: 'Festival Baía das Gatas 2024',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=500&fit=crop',
    date: '2024-12-15',
    time: '18:00',
    location: 'Mindelo, São Vicente',
    price: 2500,
    category: 'Música',
    isHot: true,
    attendees: 1250,
    totalCapacity: 5000,
  },
  {
    id: '2',
    title: 'Noite de Jazz no Quintal',
    image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=500&fit=crop',
    date: '2024-12-20',
    time: '20:00',
    location: 'Praia, Santiago',
    price: 1500,
    category: 'Música',
    isHot: false,
    attendees: 340,
    totalCapacity: 500,
  },
  {
    id: '3',
    title: 'Beach Party Sal 2024',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=500&fit=crop',
    date: '2024-12-28',
    time: '22:00',
    location: 'Santa Maria, Sal',
    price: 3000,
    category: 'Festa',
    isHot: true,
    attendees: 890,
    totalCapacity: 2000,
  },
  {
    id: '4',
    title: 'Corrida da Cidade Velha',
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=500&fit=crop',
    date: '2025-01-05',
    time: '07:00',
    location: 'Cidade Velha, Santiago',
    price: 500,
    category: 'Desporto',
    isHot: false,
    attendees: 520,
    totalCapacity: 1000,
  },
  {
    id: '5',
    title: 'Festival Gamboa 2025',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=500&fit=crop',
    date: '2025-05-01',
    time: '16:00',
    location: 'Praia, Santiago',
    price: 3500,
    category: 'Música',
    isHot: true,
    attendees: 0,
    totalCapacity: 15000,
  },
  {
    id: '6',
    title: 'Cooking Class - Cachupa',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=500&fit=crop',
    date: '2024-12-22',
    time: '10:00',
    location: 'Mindelo, São Vicente',
    price: 2000,
    category: 'Gastronomia',
    isHot: false,
    attendees: 12,
    totalCapacity: 20,
  },
];

const categories = ['Todos', 'Música', 'Festas', 'Desporto', 'Gastronomia', 'Cultura'];
const islands = ['Todas', 'Santiago', 'São Vicente', 'Sal', 'Boa Vista', 'Fogo', 'Santo Antão'];

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-PT', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).toUpperCase();
}

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedIsland, setSelectedIsland] = useState('Todas');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || event.category === selectedCategory;
    const matchesIsland = selectedIsland === 'Todas' || event.location.includes(selectedIsland);
    return matchesSearch && matchesCategory && matchesIsland;
  });

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
              <Link href="/auth/login" className="btn btn-ghost btn-sm">Entrar</Link>
              <Link href="/auth/register" className="btn btn-primary btn-sm hidden sm:flex">Criar Conta</Link>
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

        {/* Filters */}
        <div className="glass-card p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
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

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input pr-10 appearance-none cursor-pointer min-w-[160px]"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
            </div>

            {/* Island Filter */}
            <div className="relative">
              <select
                value={selectedIsland}
                onChange={(e) => setSelectedIsland(e.target.value)}
                className="input pr-10 appearance-none cursor-pointer min-w-[160px]"
              >
                {islands.map((island) => (
                  <option key={island} value={island}>{island}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
            </div>

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
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-zinc-400">
            <span className="text-white font-semibold">{filteredEvents.length}</span> eventos encontrados
          </p>
        </div>

        {/* Events Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="card-event group"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-t-2xl">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    {event.isHot && (
                      <span className="badge-hot">
                        <Zap className="h-3 w-3" />
                        HOT
                      </span>
                    )}
                  </div>

                  <button className="absolute top-4 right-4 p-2 rounded-full glass hover:bg-white/20 transition-colors">
                    <Heart className="h-4 w-4 text-white" />
                  </button>

                  {/* Attendees */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full glass text-xs text-white">
                    <Users className="h-3 w-3" />
                    {event.attendees}/{event.totalCapacity}
                  </div>
                </div>

                <div className="p-5 bg-background-secondary rounded-b-2xl border border-white/5 border-t-0">
                  <div className="flex items-center gap-2 text-brand-accent text-sm font-medium mb-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(event.date)} - {event.time}
                  </div>
                  <h3 className="font-display font-semibold text-lg text-white mb-2 line-clamp-2 group-hover:text-brand-primary transition-colors">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-zinc-400 text-sm mb-4">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-500">A partir de</span>
                      <p className="text-white font-bold">
                        {event.price.toLocaleString('pt-CV')}$00
                      </p>
                    </div>
                    <span className="badge-glass">
                      {event.category}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="flex gap-6 p-4 bg-background-secondary rounded-2xl border border-white/5 hover:border-white/10 transition-all group"
              >
                <div className="relative w-48 h-32 rounded-xl overflow-hidden flex-shrink-0">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {event.isHot && (
                    <span className="absolute top-2 left-2 badge-hot text-xs">
                      <Zap className="h-3 w-3" />
                      HOT
                    </span>
                  )}
                </div>

                <div className="flex-1 py-1">
                  <div className="flex items-center gap-2 text-brand-accent text-sm font-medium mb-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(event.date)} - {event.time}
                  </div>
                  <h3 className="font-display font-semibold text-xl text-white mb-2 group-hover:text-brand-primary transition-colors">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-4 text-zinc-400 text-sm">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      {event.attendees}/{event.totalCapacity}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between py-1">
                  <span className="badge-glass">{event.category}</span>
                  <div className="text-right">
                    <span className="text-xs text-zinc-500">A partir de</span>
                    <p className="text-white font-bold text-lg">
                      {event.price.toLocaleString('pt-CV')}$00
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* No Results */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-background-secondary flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-zinc-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Nenhum evento encontrado</h3>
            <p className="text-zinc-400">Tenta ajustar os filtros ou pesquisar por outro termo</p>
          </div>
        )}
      </div>
    </main>
  );
}
