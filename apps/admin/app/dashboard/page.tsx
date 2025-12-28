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
import { useOrganizationStats } from '@/hooks/useOrganizationStats';
import { useOrganizationEvents } from '@/hooks/useOrganizationEvents';
import { useRecentSales } from '@/hooks/useRecentSales';
import { useToast } from '@/contexts/ToastContext';

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
  const { showToast } = useToast();

  // Fetch real data from Firestore
  const { stats, loading: statsLoading } = useOrganizationStats(organization?.id);
  const { events, loading: eventsLoading } = useOrganizationEvents(organization?.id, {
    upcomingOnly: true,
    limit: 5,
  });
  const { sales, loading: salesLoading } = useRecentSales(
    organization?.id,
    4,
    (sale) => {
      // Show toast notification for new sale
      showToast(
        'success',
        'Nova Venda!',
        `${sale.ticketCount} ${sale.ticketCount === 1 ? 'bilhete' : 'bilhetes'} - ${formatCurrency(sale.amount)}`
      );
    }
  );

  const isLoading = statsLoading || eventsLoading || salesLoading;

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-accent p-8 shadow-2xl shadow-brand-primary/20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItMnptMCAwdi0yaDJ2MnptMCAwaDJ2LTJoLTJ6bTAtMmgtMnYyaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-white">
                  Olá, {organization?.name || 'Organização'}!
                </h1>
                <p className="text-white/90 mt-0.5 font-medium">
                  Aqui está um resumo da sua atividade recente
                </p>
              </div>
            </div>
          </div>
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-brand-accent/20 rounded-full blur-2xl" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            // Loading skeletons
            <>
              {[...Array(canViewFinance ? 4 : 2)].map((_, i) => (
                <div key={i} className="stat-card">
                  <div className="skeleton h-12 w-24 mb-2" />
                  <div className="skeleton h-4 w-32" />
                </div>
              ))}
            </>
          ) : (
            <>
              <StatCard
                label="Eventos Ativos"
                value={stats.activeEvents}
                icon={Calendar}
                trend={stats.growthEvents >= 0 ? 'up' : 'down'}
                trendValue={Math.abs(stats.growthEvents)}
              />
              <StatCard
                label="Bilhetes Vendidos"
                value={stats.totalTicketsSold}
                icon={Ticket}
                trend={stats.growthTickets >= 0 ? 'up' : 'down'}
                trendValue={Math.abs(stats.growthTickets)}
              />
              {canViewFinance && (
                <>
                  <StatCard
                    label="Receita Total"
                    value={stats.totalRevenue}
                    icon={CreditCard}
                    trend={stats.growthRevenue >= 0 ? 'up' : 'down'}
                    trendValue={Math.abs(stats.growthRevenue)}
                    format="currency"
                  />
                  <StatCard
                    label="Payout Pendente"
                    value={stats.pendingPayout}
                    icon={TrendingUp}
                    format="currency"
                  />
                </>
              )}
            </>
          )}
        </div>

        {/* Quick Actions */}
        {canCreateEvents && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/events/new"
              className="group relative overflow-hidden flex items-center gap-3 p-5 rounded-2xl bg-gradient-to-br from-brand-primary/15 to-brand-primary/5 border-2 border-brand-primary/30 hover:border-brand-primary/50 hover:shadow-xl hover:shadow-brand-primary/10 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Plus size={20} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-[hsl(var(--foreground))]">Criar Evento</p>
                <p className="text-sm text-[hsl(var(--foreground-muted))]">Novo evento</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            <Link
              href="/tickets"
              className="group relative overflow-hidden flex items-center gap-3 p-5 rounded-2xl bg-gradient-to-br from-background-secondary to-background-tertiary/50 border-2 border-[hsl(var(--primary))/0.15] hover:border-brand-secondary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-secondary/20 to-brand-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Ticket size={20} className="text-brand-secondary" />
              </div>
              <div>
                <p className="font-bold text-[hsl(var(--foreground))]">Gerir Bilhetes</p>
                <p className="text-sm text-[hsl(var(--foreground-muted))]">Ver vendas</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-brand-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            <Link
              href="/checkin"
              className="group relative overflow-hidden flex items-center gap-3 p-5 rounded-2xl bg-gradient-to-br from-background-secondary to-background-tertiary/50 border-2 border-[hsl(var(--primary))/0.15] hover:border-brand-accent/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-accent/20 to-brand-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <QrCode size={20} className="text-brand-accent" />
              </div>
              <div>
                <p className="font-bold text-[hsl(var(--foreground))]">Check-in</p>
                <p className="text-sm text-[hsl(var(--foreground-muted))]">Scanner QR</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-brand-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            <Link
              href="/analytics"
              className="group relative overflow-hidden flex items-center gap-3 p-5 rounded-2xl bg-gradient-to-br from-background-secondary to-background-tertiary/50 border-2 border-[hsl(var(--primary))/0.15] hover:border-success/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success/20 to-success/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TrendingUp size={20} className="text-success" />
              </div>
              <div>
                <p className="font-bold text-[hsl(var(--foreground))]">Analytics</p>
                <p className="text-sm text-[hsl(var(--foreground-muted))]">Ver relatórios</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Events */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <h2 className="card-title">Proximos Eventos</h2>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success/10 border border-success/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  <span className="text-[10px] font-semibold text-success uppercase tracking-wide">Live</span>
                </span>
              </div>
              <Link href="/events" className="btn btn-ghost btn-sm">
                Ver todos
              </Link>
            </div>
            <div className="divide-y divide-[hsl(var(--border-color))]">
              {isLoading ? (
                // Loading skeletons
                <>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4">
                      <div className="skeleton h-5 w-48 mb-2" />
                      <div className="skeleton h-4 w-64 mb-3" />
                      <div className="skeleton h-1.5 w-full" />
                    </div>
                  ))}
                </>
              ) : events.length > 0 ? (
                events.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 hover:bg-gradient-to-r hover:from-brand-primary/5 hover:to-transparent transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-[hsl(var(--foreground))] truncate">
                            {event.title}
                          </h3>
                          {event.status === 'draft' && (
                            <span className="badge badge-warning">Rascunho</span>
                          )}
                        </div>
                        <p className="text-sm text-[hsl(var(--foreground-secondary))] mt-1">
                          {formatDate(event.startDate)} - {event.venue}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                          {event.ticketsSold}/{event.totalCapacity}
                        </p>
                        <p className="text-xs text-[hsl(var(--foreground-muted))]">bilhetes</p>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3 h-1.5 bg-background rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full"
                        style={{
                          width: `${event.totalCapacity > 0 ? (event.ticketsSold / event.totalCapacity) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state py-12">
                  <Calendar size={48} className="text-[hsl(var(--foreground-muted))] mb-3 mx-auto" />
                  <p className="text-sm text-[hsl(var(--foreground-secondary))]">Nenhum evento próximo</p>
                  {canCreateEvents && (
                    <Link href="/events/new" className="btn btn-primary mt-4">
                      <Plus size={16} />
                      Criar Primeiro Evento
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Recent Sales */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <h2 className="card-title">Vendas Recentes</h2>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success/10 border border-success/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  <span className="text-[10px] font-semibold text-success uppercase tracking-wide">Live</span>
                </span>
              </div>
              <Link href="/tickets" className="btn btn-ghost btn-sm">
                Ver todas
              </Link>
            </div>
            <div className="divide-y divide-[hsl(var(--border-color))]">
              {isLoading ? (
                // Loading skeletons
                <>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-4 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="skeleton h-5 w-40 mb-2" />
                        <div className="skeleton h-4 w-48" />
                      </div>
                      <div className="text-right ml-4">
                        <div className="skeleton h-5 w-24 mb-2 ml-auto" />
                        <div className="skeleton h-4 w-32 ml-auto" />
                      </div>
                    </div>
                  ))}
                </>
              ) : sales.length > 0 ? (
                sales.map((sale) => (
                  <div
                    key={sale.id}
                    className="p-4 flex items-center justify-between hover:bg-gradient-to-r hover:from-brand-primary/5 hover:to-transparent transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[hsl(var(--foreground))] truncate">
                        {sale.eventTitle}
                      </p>
                      <p className="text-sm text-[hsl(var(--foreground-secondary))] truncate">
                        {sale.buyerEmail}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-medium text-[hsl(var(--foreground))]">
                        {formatCurrency(sale.amount)}
                      </p>
                      <p className="text-xs text-[hsl(var(--foreground-muted))]">
                        {sale.ticketCount} {sale.ticketCount === 1 ? 'bilhete' : 'bilhetes'} - {sale.timeAgo}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state py-12">
                  <Ticket size={48} className="text-[hsl(var(--foreground-muted))] mb-3 mx-auto" />
                  <p className="text-sm text-[hsl(var(--foreground-secondary))]">Nenhuma venda recente</p>
                </div>
              )}
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
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary border-2 border-[hsl(var(--background-secondary))] flex items-center justify-center"
                    >
                      <span className="text-white text-sm font-medium">
                        {String.fromCharCode(64 + i)}
                      </span>
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--background-tertiary))] border-2 border-[hsl(var(--background-secondary))] flex items-center justify-center">
                    <span className="text-[hsl(var(--foreground-secondary))] text-sm">+3</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-[hsl(var(--foreground-secondary))]">7 membros na equipa</p>
                  <p className="text-xs text-[hsl(var(--foreground-muted))]">2 admins, 3 promotores, 2 staff</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
