import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Ticket,
  Wallet,
  Smartphone,
  Zap,
  Shield,
  MapPin,
  Calendar,
  ArrowRight,
  Sparkles,
  Music,
  PartyPopper,
  Trophy,
  ChefHat,
  Heart,
  Users,
  TrendingUp,
  Star,
} from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

// Mock data for featured events
const featuredEvents = [
  {
    id: '1',
    title: 'Festival Baía das Gatas 2024',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=500&fit=crop',
    date: 'SAB, 15 DEZ',
    location: 'Mindelo, São Vicente',
    price: 2500,
    category: 'Música',
    isHot: true,
    attendees: 1250,
  },
  {
    id: '2',
    title: 'Noite de Jazz no Quintal',
    image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=500&fit=crop',
    date: 'SEX, 20 DEZ',
    location: 'Praia, Santiago',
    price: 1500,
    category: 'Música',
    isHot: false,
    attendees: 340,
  },
  {
    id: '3',
    title: 'Beach Party Sal 2024',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=500&fit=crop',
    date: 'SÁB, 28 DEZ',
    location: 'Santa Maria, Sal',
    price: 3000,
    category: 'Festa',
    isHot: true,
    attendees: 890,
  },
  {
    id: '4',
    title: 'Corrida da Cidade Velha',
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=500&fit=crop',
    date: 'DOM, 5 JAN',
    location: 'Cidade Velha, Santiago',
    price: 500,
    category: 'Desporto',
    isHot: false,
    attendees: 520,
  },
];

const categories = [
  { name: 'Música', icon: Music, color: 'from-violet-500 to-purple-600' },
  { name: 'Festas', icon: PartyPopper, color: 'from-pink-500 to-rose-600' },
  { name: 'Desporto', icon: Trophy, color: 'from-emerald-500 to-green-600' },
  { name: 'Gastronomia', icon: ChefHat, color: 'from-orange-500 to-amber-600' },
];

const stats = [
  { label: 'Eventos realizados', value: '500+' },
  { label: 'Bilhetes vendidos', value: '50K+' },
  { label: 'Utilizadores ativos', value: '25K+' },
  { label: 'Organizadores', value: '150+' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* ===== HEADER ===== */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="glass-subtle">
          <div className="container-app">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-md transition-shadow duration-300">
                  <Ticket className="h-5 w-5 text-white" />
                  <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="font-display text-xl font-bold text-white">
                  Events<span className="text-gradient">CV</span>
                </span>
              </Link>

              {/* Navigation */}
              <nav className="hidden md:flex items-center gap-8">
                <Link href="/events" className="nav-link">
                  Eventos
                </Link>
                <Link href="/about" className="nav-link">
                  Sobre
                </Link>
                <Link href="/organizers" className="nav-link">
                  Organizadores
                </Link>

              </nav>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Link href="/auth/login" className="btn btn-ghost btn-sm">
                  Entrar
                </Link>
                <Link href="/auth/register" className="btn btn-primary btn-sm hidden sm:flex">
                  <Sparkles className="h-4 w-4" />
                  Criar Conta
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-mesh-gradient" />

        {/* Floating Orbs */}
        <div className="floating-orb-purple top-20 -left-48" />
        <div className="floating-orb-blue bottom-20 -right-32" />
        <div className="floating-orb-indigo top-1/2 left-1/3" />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="container-app relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent"></span>
              </span>
              <span className="text-sm text-zinc-300">
                +50 eventos esta semana
              </span>
            </div>

            {/* Headline */}
            <h1 className="heading-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 animate-fade-in-up">
              Vive experiências{' '}
              <span className="text-gradient">únicas</span> em{' '}
              <span className="text-gradient-ocean">Cabo Verde</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 animate-fade-in-up delay-100">
              Descobre os melhores eventos, compra bilhetes instantaneamente e
              paga tudo com a tua wallet digital. Simples, rápido, sem stress.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-12 animate-fade-in-up delay-200">
              <div className="glass-card p-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Pesquisar eventos, artistas, locais..."
                      className="w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder:text-zinc-500 focus:outline-none"
                    />
                  </div>
                  <button className="btn btn-primary btn-lg">
                    Pesquisar
                  </button>
                </div>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-10 animate-fade-in-up delay-300">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  href={`/events?category=${cat.name.toLowerCase()}`}
                  className="group flex items-center gap-2 px-5 py-2.5 rounded-full glass hover:bg-white/10 transition-all duration-300"
                >
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br ${cat.color}`}>
                    <cat.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>

            {/* CTA for Organizers */}
            <div className="animate-fade-in-up delay-400">
              <div className="inline-flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href="/auth/register"
                  className="group relative overflow-hidden px-8 py-4 bg-gradient-primary rounded-full font-semibold text-white shadow-glow-sm hover:shadow-glow-md transition-all duration-300 transform hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  <span className="relative flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Cria o seu primeiro Evento
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <p className="text-sm text-zinc-500">
                  Grátis · Sem cartão de crédito · 2 minutos
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
            <div className="w-1 h-3 rounded-full bg-white/40 animate-pulse" />
          </div>
        </div>
      </section>

      {/* ===== FEATURED EVENTS ===== */}
      <section className="py-20 relative">
        <div className="container-app">
          {/* Section Header */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="heading-display text-3xl sm:text-4xl mb-2">
                Eventos em <span className="text-gradient">destaque</span>
              </h2>
              <p className="text-zinc-400">
                Os eventos mais populares desta semana
              </p>
            </div>
            <Link
              href="/events"
              className="hidden sm:flex items-center gap-2 text-brand-primary hover:text-brand-secondary transition-colors group"
            >
              Ver todos
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredEvents.map((event, index) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="card-event animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="card-event-image"
                  />
                  <div className="card-event-overlay" />

                  {/* Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                    {event.isHot && (
                      <span className="badge-hot">
                        <Zap className="h-3 w-3" />
                        HOT
                      </span>
                    )}
                    <button className="ml-auto p-2 rounded-full glass hover:bg-white/20 transition-colors">
                      <Heart className="h-4 w-4 text-white" />
                    </button>
                  </div>

                  {/* Attendees */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full glass text-xs text-white">
                    <Users className="h-3 w-3" />
                    {event.attendees}
                  </div>
                </div>

                {/* Content */}
                <div className="card-event-content">
                  <div className="flex items-center gap-2 text-brand-accent text-sm font-medium mb-2">
                    <Calendar className="h-4 w-4" />
                    {event.date}
                  </div>
                  <h3 className="font-display font-semibold text-lg text-white mb-2 line-clamp-2">
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

          {/* Mobile CTA */}
          <div className="mt-8 text-center sm:hidden">
            <Link href="/events" className="btn btn-secondary btn-md">
              Ver todos os eventos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-20 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background-secondary to-background" />

        <div className="container-app relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="heading-display text-3xl sm:text-4xl mb-4">
              Uma experiência{' '}
              <span className="text-gradient">completa</span>
            </h2>
            <p className="text-zinc-400 text-lg">
              Da descoberta ao evento, simplificamos cada passo da tua jornada
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="glass-card p-8 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mb-6 group-hover:shadow-glow-sm transition-shadow">
                <Ticket className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-display text-xl font-semibold text-white mb-3">
                Bilhetes Digitais
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                Compra e recebe os teus bilhetes instantaneamente no telemóvel.
                QR Code dinâmico, seguro e sempre acessível offline.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card p-8 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-ocean flex items-center justify-center mb-6 group-hover:shadow-glow-accent transition-shadow">
                <Wallet className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-display text-xl font-semibold text-white mb-3">
                Wallet Digital
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                Carrega a tua wallet uma vez e paga tudo - bilhetes, comidas,
                bebidas. Recebe cashback em cada compra.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card p-8 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-sunset flex items-center justify-center mb-6 group-hover:shadow-glow-sm transition-shadow">
                <Smartphone className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-display text-xl font-semibold text-white mb-3">
                Pulseira NFC
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                Pagamentos cashless com um simples toque. Sem filas, sem
                dinheiro, sem preocupações. Apenas diversão.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass-card p-8 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-6 group-hover:shadow-glow-sm transition-shadow">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-display text-xl font-semibold text-white mb-3">
                100% Seguro
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                Paga com Pagali, Vinti4 ou cartão internacional. Proteção
                anti-fraude e garantia de reembolso.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="glass-card p-8 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-6 group-hover:shadow-glow-sm transition-shadow">
                <Star className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-display text-xl font-semibold text-white mb-3">
                Programa de Pontos
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                Acumula pontos em cada compra e troca por descontos,
                upgrades e experiências exclusivas.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="glass-card p-8 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center mb-6 group-hover:shadow-glow-sm transition-shadow">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-display text-xl font-semibold text-white mb-3">
                Para Organizadores
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                Dashboard completo, vendas em tempo real, check-in NFC
                e relatórios detalhados. Tudo numa só plataforma.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="py-20 relative">
        <div className="container-app">
          <div className="glass-card p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="text-center animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-3xl md:text-4xl font-display font-bold text-gradient mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-zinc-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-20 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-night opacity-50" />
        <div className="floating-orb-purple -top-48 left-1/4" />
        <div className="floating-orb-blue -bottom-32 right-1/4" />

        <div className="container-app relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="heading-display text-3xl sm:text-4xl md:text-5xl mb-6">
              Pronto para viveres{' '}
              <span className="text-gradient">experiências</span>{' '}
              inesquecíveis?
            </h2>
            <p className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto">
              Junta-te a milhares de cabo-verdianos que já usam o EventsCV.
              Cria a tua conta grátis em segundos.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register" className="btn btn-primary btn-lg w-full sm:w-auto">
                <Sparkles className="h-5 w-5" />
                Começar Agora
              </Link>
              <Link href="/organizers" className="btn btn-secondary btn-lg w-full sm:w-auto">
                Sou Organizador
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-12 border-t border-white/5">
        <div className="container-app">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Ticket className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-white">
                Events<span className="text-gradient">CV</span>
              </span>
            </Link>

            {/* Links */}
            <nav className="flex flex-wrap items-center justify-center gap-6">
              <Link href="/events" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Eventos
              </Link>
              <Link href="/about" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Sobre
              </Link>
              <Link href="/organizers" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Organizadores
              </Link>
              <Link href="/terms" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Termos
              </Link>
              <Link href="/privacy" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Privacidade
              </Link>
            </nav>

            {/* Copyright */}
            <p className="text-sm text-zinc-500">
              &copy; {new Date().getFullYear()} EventsCV. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
