'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, StatCard, Button, Select, ListCard } from '../../components/ui';
import {
  getOrganizationAnalytics,
  getDashboardStats,
  type OrganizationAnalytics,
  type DashboardStats,
} from '../../lib/services/analytics';
import { useAuthStore } from '../../lib/store/auth';
import {
  ArrowPathIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TicketIcon,
  UserGroupIcon,
  ChartBarIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<OrganizationAnalytics | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');

  useEffect(() => {
    loadAnalytics();
  }, [user, dateRange]);

  const loadAnalytics = async () => {
    if (!user?.organizationId) return;

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
        getOrganizationAnalytics(user.organizationId, { startDate, endDate: now }),
        getDashboardStats(user.organizationId),
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
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-500">Visualize o desempenho dos seus eventos</p>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              options={dateRangeOptions}
            />
            <Button
              variant="outline"
              onClick={loadAnalytics}
              leftIcon={<ArrowPathIcon className="h-5 w-5" />}
            >
              Atualizar
            </Button>
            <Button
              variant="outline"
              leftIcon={<ArrowDownTrayIcon className="h-5 w-5" />}
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
              icon={<CurrencyDollarIcon className="h-6 w-6" />}
              change={{ value: dashboardStats.revenueChange, label: 'vs. período anterior' }}
              loading={isLoading}
            />
            <StatCard
              title="Bilhetes Vendidos"
              value={dashboardStats.ticketsSold.toLocaleString('pt-PT')}
              icon={<TicketIcon className="h-6 w-6" />}
              change={{ value: dashboardStats.ticketsChange, label: 'vs. período anterior' }}
              loading={isLoading}
            />
            <StatCard
              title="Eventos Ativos"
              value={dashboardStats.activeEvents.toString()}
              icon={<CalendarIcon className="h-6 w-6" />}
              change={{ value: dashboardStats.eventsChange, label: 'novos' }}
              loading={isLoading}
            />
            <StatCard
              title="Taxa de Check-in"
              value={`${dashboardStats.checkInRate.toFixed(1)}%`}
              icon={<UserGroupIcon className="h-6 w-6" />}
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
                <h3 className="text-lg font-semibold text-gray-900">Receita ao Longo do Tempo</h3>
                <ChartBarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <ChartBarIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Gráfico de receita mensal</p>
                  <div className="mt-4 grid grid-cols-6 gap-4">
                    {analytics.revenueByMonth.slice(-6).map((month) => (
                      <div key={month.month} className="text-center">
                        <div
                          className="bg-purple-500 rounded-t mx-auto"
                          style={{
                            height: `${Math.max(20, (month.revenue / 500000) * 150)}px`,
                            width: '24px',
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-2">{month.month}</p>
                        <p className="text-xs font-medium text-gray-700">
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Vendas por Tipo de Bilhete
                </h3>
                <div className="space-y-4">
                  {analytics.ticketsByType.map((ticket) => {
                    const total = analytics.ticketsByType.reduce((sum, t) => sum + t.count, 0);
                    const percentage = total > 0 ? (ticket.count / total) * 100 : 0;

                    return (
                      <div key={ticket.type}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            {ticket.type}
                          </span>
                          <span className="text-sm text-gray-500">
                            {ticket.count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
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
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrophyIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Crescimento de Vendas</p>
                    <p className="text-2xl font-bold text-green-600">
                      +{analytics.trends.ticketSalesGrowth.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Crescimento de Receita</p>
                    <p className="text-2xl font-bold text-blue-600">
                      +{analytics.trends.revenueGrowth.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <UserGroupIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Preço Médio do Bilhete</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {analytics.overview.averageTicketPrice.toLocaleString('pt-PT')} CVE
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Período</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total de Eventos</span>
                    <span className="font-medium">{analytics.overview.totalEvents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bilhetes Vendidos</span>
                    <span className="font-medium">
                      {analytics.overview.totalTicketsSold.toLocaleString('pt-PT')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Receita Total</span>
                    <span className="font-medium">
                      {analytics.overview.totalRevenue.toLocaleString('pt-PT')} CVE
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Participantes</span>
                    <span className="font-medium">
                      {analytics.overview.totalAttendees.toLocaleString('pt-PT')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Taxa de Check-in</span>
                    <span className="font-medium">
                      {analytics.overview.checkInRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Metas e Objetivos</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-500">Meta de Vendas Mensal</span>
                      <span className="text-sm font-medium">75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-500">Meta de Check-in</span>
                      <span className="text-sm font-medium">
                        {analytics.overview.checkInRate.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, analytics.overview.checkInRate)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-500">Satisfação do Cliente</span>
                      <span className="text-sm font-medium">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '92%' }} />
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
