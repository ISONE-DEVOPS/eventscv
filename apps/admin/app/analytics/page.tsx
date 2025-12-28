'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, StatCard, Button, Select, ListCard } from '../../components/ui';
import {
  getOrganizationAnalytics,
  getDashboardStats,
  type OrganizationAnalytics,
  type DashboardStats,
} from '../../lib/services/analytics';
import { useAuthStore } from '@/stores/authStore';
import {
  RefreshCw,
  Download,
  Calendar,
  DollarSign,
  Ticket,
  Users,
  BarChart3,
  Trophy,
} from 'lucide-react';

export default function AnalyticsPage() {
  const { claims } = useAuthStore();
  const [analytics, setAnalytics] = useState<OrganizationAnalytics | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');

  useEffect(() => {
    loadAnalytics();
  }, [claims, dateRange]);

  const loadAnalytics = async () => {
    if (!claims?.organizationId) return;

    setIsLoading(true);
    try {
      const now = new Date();
      let startDate: Date;

      switch (dateRange) {
        case '7days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90days':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const [analyticsData, statsData] = await Promise.all([
        getOrganizationAnalytics(claims.organizationId, { startDate, endDate: now }),
        getDashboardStats(claims.organizationId),
      ]);

      setAnalytics(analyticsData);
      setDashboardStats(statsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const dateRangeOptions = [
    { value: '7days', label: 'Últimos 7 dias' },
    { value: '30days', label: 'Últimos 30 dias' },
    { value: '90days', label: 'Últimos 90 dias' },
    { value: 'year', label: 'Este ano' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Analytics</h1>
            <p className="text-[hsl(var(--foreground-secondary))]">Visualize o desempenho dos seus eventos</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-[hsl(var(--border-color))] rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary bg-[hsl(var(--background-secondary))] text-[hsl(var(--foreground))]"
            >
              {dateRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              onClick={loadAnalytics}
              leftIcon={<RefreshCw size={20} />}
            >
              Atualizar
            </Button>
            <Button
              variant="outline"
              leftIcon={<Download size={20} />}
            >
              Exportar
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        {dashboardStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Receita Total"
              value={`${dashboardStats.totalRevenue.toLocaleString('pt-PT')} CVE`}
              icon={<DollarSign size={24} />}
              change={{ value: dashboardStats.revenueChange, label: 'vs. período anterior' }}
              loading={isLoading}
            />
            <StatCard
              title="Bilhetes Vendidos"
              value={dashboardStats.ticketsSold.toLocaleString('pt-PT')}
              icon={<Ticket size={24} />}
              change={{ value: dashboardStats.ticketsChange, label: 'vs. período anterior' }}
              loading={isLoading}
            />
            <StatCard
              title="Eventos Ativos"
              value={dashboardStats.activeEvents.toString()}
              icon={<Calendar size={24} />}
              change={{ value: dashboardStats.eventsChange, label: 'novos' }}
              loading={isLoading}
            />
            <StatCard
              title="Taxa de Check-in"
              value={`${dashboardStats.checkInRate.toFixed(1)}%`}
              icon={<Users size={24} />}
              change={{ value: dashboardStats.checkInChange, label: 'vs. período anterior' }}
              loading={isLoading}
            />
          </div>
        )}

        {analytics && (
          <>
            {/* Revenue Chart (Placeholder) */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">Receita ao Longo do Tempo</h3>
                <BarChart3 size={24} className="text-[hsl(var(--foreground-muted))]" />
              </div>
              <div className="h-64 flex items-center justify-center bg-[hsl(var(--background-secondary))] rounded-lg">
                <div className="text-center">
                  <BarChart3 size={48} className="text-[hsl(var(--foreground-muted))]/30 mx-auto mb-2" />
                  <p className="text-[hsl(var(--foreground-secondary))]">Gráfico de receita mensal</p>
                  <div className="mt-4 grid grid-cols-6 gap-4">
                    {analytics.revenueByMonth.slice(-6).map((month) => (
                      <div key={month.month} className="text-center">
                        <div
                          className="bg-gradient-to-t from-brand-primary to-brand-secondary rounded-t mx-auto"
                          style={{
                            height: `${Math.max(20, (month.revenue / 500000) * 150)}px`,
                            width: '24px',
                          }}
                        />
                        <p className="text-xs text-[hsl(var(--foreground-secondary))] mt-2">{month.month}</p>
                        <p className="text-xs font-medium text-[hsl(var(--foreground))]">
                          {(month.revenue / 1000).toFixed(0)}k
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Events */}
              <ListCard
                title="Eventos Mais Populares"
                items={analytics.topEvents.map((event, index) => ({
                  id: event.id,
                  title: event.name,
                  subtitle: `${event.ticketsSold} bilhetes vendidos`,
                  value: `${event.revenue.toLocaleString('pt-PT')} CVE`,
                  icon: (
                    <span
                      className={`font-bold ${
                        index === 0
                          ? 'text-yellow-500'
                          : index === 1
                          ? 'text-gray-400'
                          : index === 2
                          ? 'text-amber-600'
                          : 'text-gray-500'
                      }`}
                    >
                      #{index + 1}
                    </span>
                  ),
                }))}
                emptyMessage="Nenhum evento com vendas"
                action={
                  <Button variant="ghost" size="sm">
                    Ver todos
                  </Button>
                }
                loading={isLoading}
              />

              {/* Ticket Types Distribution */}
              <Card>
                <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">
                  Vendas por Tipo de Bilhete
                </h3>
                <div className="space-y-4">
                  {analytics.ticketsByType.map((ticket) => {
                    const total = analytics.ticketsByType.reduce((sum, t) => sum + t.count, 0);
                    const percentage = total > 0 ? (ticket.count / total) * 100 : 0;

                    return (
                      <div key={ticket.type}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                            {ticket.type}
                          </span>
                          <span className="text-sm text-[hsl(var(--foreground-secondary))]">
                            {ticket.count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-[hsl(var(--background-tertiary))] rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-brand-primary to-brand-secondary h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Performance Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-success/20 to-success/10 rounded-xl">
                    <Trophy size={24} className="text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-[hsl(var(--foreground-secondary))]">Crescimento de Vendas</p>
                    <p className="text-2xl font-bold text-success">
                      +{analytics.trends.ticketSalesGrowth.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 rounded-xl">
                    <DollarSign size={24} className="text-brand-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-[hsl(var(--foreground-secondary))]">Crescimento de Receita</p>
                    <p className="text-2xl font-bold text-brand-primary">
                      +{analytics.trends.revenueGrowth.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-brand-secondary/20 to-brand-secondary/10 rounded-xl">
                    <Users size={24} className="text-brand-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-[hsl(var(--foreground-secondary))]">Preço Médio do Bilhete</p>
                    <p className="text-2xl font-bold text-brand-secondary">
                      {analytics.overview.averageTicketPrice.toLocaleString('pt-PT')} CVE
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">Resumo do Período</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--foreground-secondary))]">Total de Eventos</span>
                    <span className="font-medium text-[hsl(var(--foreground))]">{analytics.overview.totalEvents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--foreground-secondary))]">Bilhetes Vendidos</span>
                    <span className="font-medium text-[hsl(var(--foreground))]">
                      {analytics.overview.totalTicketsSold.toLocaleString('pt-PT')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--foreground-secondary))]">Receita Total</span>
                    <span className="font-medium text-[hsl(var(--foreground))]">
                      {analytics.overview.totalRevenue.toLocaleString('pt-PT')} CVE
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--foreground-secondary))]">Participantes</span>
                    <span className="font-medium text-[hsl(var(--foreground))]">
                      {analytics.overview.totalAttendees.toLocaleString('pt-PT')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--foreground-secondary))]">Taxa de Check-in</span>
                    <span className="font-medium text-[hsl(var(--foreground))]">
                      {analytics.overview.checkInRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">Metas e Objetivos</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-[hsl(var(--foreground-secondary))]">Meta de Vendas Mensal</span>
                      <span className="text-sm font-medium text-[hsl(var(--foreground))]">75%</span>
                    </div>
                    <div className="w-full bg-[hsl(var(--background-tertiary))] rounded-full h-2">
                      <div className="bg-gradient-to-r from-success to-success/80 h-2 rounded-full" style={{ width: '75%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-[hsl(var(--foreground-secondary))]">Meta de Check-in</span>
                      <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                        {analytics.overview.checkInRate.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-[hsl(var(--background-tertiary))] rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-brand-primary to-brand-secondary h-2 rounded-full"
                        style={{ width: `${Math.min(100, analytics.overview.checkInRate)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-[hsl(var(--foreground-secondary))]">Satisfação do Cliente</span>
                      <span className="text-sm font-medium text-[hsl(var(--foreground))]">92%</span>
                    </div>
                    <div className="w-full bg-[hsl(var(--background-tertiary))] rounded-full h-2">
                      <div className="bg-gradient-to-r from-brand-accent to-brand-accent/80 h-2 rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}

        {/* Loading State */}
        {isLoading && !analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
                  <div className="h-32 bg-gray-200 rounded" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
