'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuthStore, isOrgAdmin, isOrgPromoter } from '@/stores/authStore';
import {
  Calendar,
  Ticket,
  TrendingUp,
  Users,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye,
  QrCode,
} from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import Link from 'next/link';

// Mock data - will be replaced with real data from Firestore
const orgStats = {
  totalEvents: 24,
  activeEvents: 3,
  totalTicketsSold: 4567,
  totalRevenue: 2500000,
  pendingPayout: 450000,
  growthEvents: 15.3,
  growthTickets: 28.7,
  growthRevenue: 22.1,
};

const upcomingEvents = [
  {
    id: '1',
    title: 'Summer Beach Party',
    date: new Date('2024-08-15'),
    venue: 'Praia de Santa Maria',
    ticketsSold: 450,
    totalCapacity: 1000,
    status: 'published',
  },
  {
    id: '2',
    title: 'Jazz Night',
    date: new Date('2024-08-20'),
    venue: 'Quintal da Musica',
    ticketsSold: 120,
    totalCapacity: 200,
    status: 'published',
  },
  {
    id: '3',
    title: 'Festival Electronico',
    date: new Date('2024-09-01'),
    venue: 'Parque 5 de Julho',
    ticketsSold: 0,
    totalCapacity: 5000,
    status: 'draft',
  },
];

const recentSales = [
  { id: '1', event: 'Summer Beach Party', buyer: 'joao.silva@email.com', tickets: 2, amount: 5000, time: '5 min' },
  { id: '2', event: 'Jazz Night', buyer: 'maria.santos@email.com', tickets: 4, amount: 8000, time: '12 min' },
  { id: '3', event: 'Summer Beach Party', buyer: 'pedro.costa@email.com', tickets: 1, amount: 2500, time: '23 min' },
  { id: '4', event: 'Jazz Night', buyer: 'ana.ferreira@email.com', tickets: 2, amount: 4000, time: '45 min' },
];

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendValue,
  format = 'number',
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendValue?: number;
  format?: 'number' | 'currency';
}) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="stat-card-value">
            {format === 'currency' ? formatCurrency(value) : formatNumber(value)}
          </p>
          <p className="stat-card-label">{label}</p>
          {trend && trendValue !== undefined && (
            <div className={`stat-card-trend ${trend}`}>
              {trend === 'up' ? (
                <ArrowUpRight size={16} />
              ) : (
                <ArrowDownRight size={16} />
              )}
              <span>{trendValue}% vs mes anterior</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center">
          <Icon size={24} className="text-brand-primary" />
        </div>
      </div>
    </div>
  );
}

export default function OrganizationDashboard() {
  const { claims, organization } = useAuthStore();
  const canCreateEvents = isOrgPromoter(claims);
  const canViewFinance = isOrgAdmin(claims);

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-primary/20 via-brand-secondary/20 to-brand-accent/20 p-6">
          <div className="relative z-10">
            <h1 className="text-2xl font-display font-bold text-white">
              Ola, {organization?.name || 'Organizacao'}!
            </h1>
            <p className="text-zinc-300 mt-1">
              Aqui esta um resumo da sua atividade recente
            </p>
          </div>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-primary/30 rounded-full blur-3xl" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Eventos Ativos"
            value={orgStats.activeEvents}
            icon={Calendar}
            trend="up"
            trendValue={orgStats.growthEvents}
          />
          <StatCard
            label="Bilhetes Vendidos"
            value={orgStats.totalTicketsSold}
            icon={Ticket}
            trend="up"
            trendValue={orgStats.growthTickets}
          />
          {canViewFinance && (
            <>
              <StatCard
                label="Receita Total"
                value={orgStats.totalRevenue}
                icon={CreditCard}
                trend="up"
                trendValue={orgStats.growthRevenue}
                format="currency"
              />
              <StatCard
                label="Payout Pendente"
                value={orgStats.pendingPayout}
                icon={TrendingUp}
                format="currency"
              />
            </>
          )}
        </div>

        {/* Quick Actions */}
        {canCreateEvents && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/events/new"
              className="flex items-center gap-3 p-4 rounded-xl bg-brand-primary/10 border border-brand-primary/20 hover:bg-brand-primary/20 transition-colors"
            >
              <Plus size={24} className="text-brand-primary" />
              <div>
                <p className="font-medium text-white">Criar Evento</p>
                <p className="text-sm text-zinc-400">Novo evento</p>
              </div>
            </Link>
            <Link
              href="/tickets"
              className="flex items-center gap-3 p-4 rounded-xl bg-background-secondary border border-white/5 hover:border-white/10 transition-colors"
            >
              <Ticket size={24} className="text-brand-secondary" />
              <div>
                <p className="font-medium text-white">Gerir Bilhetes</p>
                <p className="text-sm text-zinc-400">Ver vendas</p>
              </div>
            </Link>
            <Link
              href="/checkin"
              className="flex items-center gap-3 p-4 rounded-xl bg-background-secondary border border-white/5 hover:border-white/10 transition-colors"
            >
              <QrCode size={24} className="text-brand-accent" />
              <div>
                <p className="font-medium text-white">Check-in</p>
                <p className="text-sm text-zinc-400">Scanner QR</p>
              </div>
            </Link>
            <Link
              href="/analytics"
              className="flex items-center gap-3 p-4 rounded-xl bg-background-secondary border border-white/5 hover:border-white/10 transition-colors"
            >
              <TrendingUp size={24} className="text-success" />
              <div>
                <p className="font-medium text-white">Analytics</p>
                <p className="text-sm text-zinc-400">Ver relatorios</p>
              </div>
            </Link>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Events */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Proximos Eventos</h2>
              <Link href="/events" className="btn btn-ghost btn-sm">
                Ver todos
              </Link>
            </div>
            <div className="divide-y divide-white/5">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white truncate">
                          {event.title}
                        </h3>
                        {event.status === 'draft' && (
                          <span className="badge badge-warning">Rascunho</span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-400 mt-1">
                        {formatDate(event.date)} - {event.venue}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-medium text-white">
                        {event.ticketsSold}/{event.totalCapacity}
                      </p>
                      <p className="text-xs text-zinc-500">bilhetes</p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3 h-1.5 bg-background rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full"
                      style={{
                        width: `${(event.ticketsSold / event.totalCapacity) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Sales */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Vendas Recentes</h2>
              <Link href="/tickets" className="btn btn-ghost btn-sm">
                Ver todas
              </Link>
            </div>
            <div className="divide-y divide-white/5">
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{sale.event}</p>
                    <p className="text-sm text-zinc-400 truncate">{sale.buyer}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-medium text-white">
                      {formatCurrency(sale.amount)}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {sale.tickets} {sale.tickets === 1 ? 'bilhete' : 'bilhetes'} - {sale.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Overview (Admin only) */}
        {isOrgAdmin(claims) && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Equipa</h2>
              <Link href="/team" className="btn btn-ghost btn-sm">
                Gerir equipa
              </Link>
            </div>
            <div className="card-body">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary border-2 border-background-secondary flex items-center justify-center"
                    >
                      <span className="text-white text-sm font-medium">
                        {String.fromCharCode(64 + i)}
                      </span>
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full bg-background-tertiary border-2 border-background-secondary flex items-center justify-center">
                    <span className="text-zinc-400 text-sm">+3</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">7 membros na equipa</p>
                  <p className="text-xs text-zinc-500">2 admins, 3 promotores, 2 staff</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
