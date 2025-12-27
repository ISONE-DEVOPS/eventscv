'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  TrendingUp,
  Users,
  CreditCard,
  Clock,
  AlertCircle,
  Activity,
  RefreshCcw,
  MapPin
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface DashboardStats {
  eventId: string;
  totalTicketsSold: number;
  totalRevenue: number;
  currency: string;
  totalCapacity: number;
  capacityUsed: number;
  capacityPercentage: number;
  ticketsRemaining: number;
  salesLast1Hour: number;
  salesLast24Hours: number;
  salesLast7Days: number;
  averageSalesPerHour: number;
  revenueLast1Hour: number;
  revenueLast24Hours: number;
  revenueLast7Days: number;
  ticketTypeBreakdown: Array<{
    ticketTypeId: string;
    ticketTypeName: string;
    sold: number;
    capacity: number;
    revenue: number;
  }>;
  projectedSelloutTime?: Date;
  estimatedFinalSales?: number;
  lastUpdated: Date;
}

interface RecentBuyer {
  id: string;
  eventId: string;
  buyerName?: string;
  buyerCity?: string;
  buyerCountry?: string;
  ticketCount: number;
  ticketType: string;
  amount: number;
  currency: string;
  purchasedAt: Date;
}

interface LiveActivityItem {
  id: string;
  eventId: string;
  type: 'purchase' | 'capacity_milestone' | 'price_change' | 'social_proof' | 'urgency';
  message: string;
  icon?: string;
  data?: {
    ticketCount?: number;
    amount?: number;
    milestone?: string;
    location?: string;
  };
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
}

interface PriceCountdown {
  eventId: string;
  currentPrice: number;
  currency: string;
  nextPrice?: number;
  nextPriceChange?: Date;
  priceIncreasePercentage?: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  urgencyMessage: string;
  ticketsRemainingAtCurrentPrice?: number;
  isDynamicPricing: boolean;
}

export default function EventLiveDashboard() {
  const params = useParams();
  const eventId = params.id as string;

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBuyers, setRecentBuyers] = useState<RecentBuyer[]>([]);
  const [liveActivity, setLiveActivity] = useState<LiveActivityItem[]>([]);
  const [priceCountdown, setPriceCountdown] = useState<PriceCountdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadDashboard = async () => {
    try {
      const functions = getFunctions();
      const getCompleteDashboard = httpsCallable(functions, 'getCompleteDashboard');

      const result = await getCompleteDashboard({ eventId });
      const dashboard = (result.data as any).dashboard;

      setStats(dashboard.stats);
      setRecentBuyers(dashboard.recentBuyers || []);
      setLiveActivity(dashboard.liveActivity || []);

      // Also load price countdown separately
      const getPriceCountdown = httpsCallable(functions, 'getPriceCountdown');
      const countdownResult = await getPriceCountdown({ eventId });
      setPriceCountdown((countdownResult.data as any).countdown);

      setLoading(false);
      setError(null);
    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      setError(err.message || 'Failed to load dashboard');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [eventId]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadDashboard();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, eventId]);

  if (loading) {
    return (
      <DashboardLayout title="Dashboard ao Vivo">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <RefreshCcw className="w-8 h-8 text-brand-primary animate-spin" />
            <p className="text-zinc-400">A carregar dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !stats) {
    return (
      <DashboardLayout title="Dashboard ao Vivo">
        <div className="card">
          <div className="card-body text-center">
            <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Erro ao carregar dashboard</h3>
            <p className="text-zinc-400 mb-4">{error || 'Dados não disponíveis'}</p>
            <button onClick={loadDashboard} className="btn btn-primary">
              Tentar novamente
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-error';
      case 'high': return 'text-warning';
      case 'medium': return 'text-brand-secondary';
      default: return 'text-success';
    }
  };

  return (
    <DashboardLayout
      title="Dashboard ao Vivo"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`btn btn-sm ${autoRefresh ? 'btn-primary' : 'btn-ghost'}`}
          >
            <RefreshCcw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh
          </button>
          <button onClick={loadDashboard} className="btn btn-ghost btn-sm">
            <RefreshCcw className="w-4 h-4" />
            Actualizar
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Sales */}
          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="stat-card-value">{formatNumber(stats.totalTicketsSold)}</p>
                <p className="stat-card-label">Bilhetes Vendidos</p>
                <div className="stat-card-trend up">
                  <TrendingUp size={16} />
                  <span>{stats.salesLast24Hours} nas últimas 24h</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                <Users size={24} className="text-brand-primary" />
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="stat-card-value">{formatCurrency(stats.totalRevenue)}</p>
                <p className="stat-card-label">Receita Total</p>
                <div className="stat-card-trend up">
                  <TrendingUp size={16} />
                  <span>{formatCurrency(stats.revenueLast24Hours)} 24h</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <CreditCard size={24} className="text-success" />
              </div>
            </div>
          </div>

          {/* Capacity */}
          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="stat-card-value">{stats.capacityPercentage.toFixed(1)}%</p>
                <p className="stat-card-label">Lotação</p>
                <div className="mt-2">
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        stats.capacityPercentage >= 95
                          ? 'bg-error'
                          : stats.capacityPercentage >= 80
                          ? 'bg-warning'
                          : 'bg-brand-primary'
                      }`}
                      style={{ width: `${Math.min(stats.capacityPercentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    {stats.ticketsRemaining} bilhetes restantes
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sales Velocity */}
          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="stat-card-value">
                  {stats.averageSalesPerHour.toFixed(1)}
                </p>
                <p className="stat-card-label">Bilhetes/Hora</p>
                <div className="stat-card-trend up">
                  <Clock size={16} />
                  <span>{stats.salesLast1Hour} na última hora</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-brand-secondary/10 flex items-center justify-center">
                <Activity size={24} className="text-brand-secondary" />
              </div>
            </div>
          </div>
        </div>

        {/* Price Countdown Alert */}
        {priceCountdown && priceCountdown.urgencyLevel !== 'low' && (
          <div className={`card border-2 ${
            priceCountdown.urgencyLevel === 'critical'
              ? 'border-error bg-error/5'
              : priceCountdown.urgencyLevel === 'high'
              ? 'border-warning bg-warning/5'
              : 'border-brand-secondary bg-brand-secondary/5'
          }`}>
            <div className="card-body">
              <div className="flex items-start gap-4">
                <AlertCircle className={`w-6 h-6 ${getUrgencyColor(priceCountdown.urgencyLevel)}`} />
                <div className="flex-1">
                  <h3 className={`font-medium ${getUrgencyColor(priceCountdown.urgencyLevel)}`}>
                    {priceCountdown.urgencyMessage}
                  </h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    Preço actual: {formatCurrency(priceCountdown.currentPrice)} {priceCountdown.currency}
                    {priceCountdown.nextPrice && (
                      <> • Próximo: {formatCurrency(priceCountdown.nextPrice)} (+{priceCountdown.priceIncreasePercentage?.toFixed(0)}%)</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Buyers */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Compradores Recentes</h2>
              <span className="badge badge-success">Ao vivo</span>
            </div>
            <div className="divide-y divide-white/5">
              {recentBuyers.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">
                  Nenhuma venda recente
                </div>
              ) : (
                recentBuyers.map((buyer) => (
                  <div key={buyer.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">{buyer.buyerName || 'Comprador'}</p>
                          {buyer.buyerCity && (
                            <span className="flex items-center gap-1 text-xs text-zinc-500">
                              <MapPin size={12} />
                              {buyer.buyerCity}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-400">
                          {buyer.ticketType} • {buyer.ticketCount} {buyer.ticketCount === 1 ? 'bilhete' : 'bilhetes'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-white">
                          {formatCurrency(buyer.amount)} {buyer.currency}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {new Date(buyer.purchasedAt).toLocaleTimeString('pt-CV', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Actividade ao Vivo</h2>
              <Activity className="w-5 h-5 text-brand-primary animate-pulse" />
            </div>
            <div className="divide-y divide-white/5">
              {liveActivity.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">
                  Nenhuma actividade recente
                </div>
              ) : (
                liveActivity.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{item.icon || '🎟️'}</div>
                      <div className="flex-1">
                        <p className="text-white">{item.message}</p>
                        {item.data && (
                          <div className="flex gap-3 mt-1 text-xs text-zinc-500">
                            {item.data.ticketCount && (
                              <span>{item.data.ticketCount} bilhetes</span>
                            )}
                            {item.data.amount && (
                              <span>{formatCurrency(item.data.amount)}</span>
                            )}
                            {item.data.location && (
                              <span>{item.data.location}</span>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-zinc-600 mt-1">
                          {new Date(item.timestamp).toLocaleTimeString('pt-CV')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Ticket Type Breakdown */}
        {stats.ticketTypeBreakdown && stats.ticketTypeBreakdown.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Vendas por Tipo de Bilhete</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.ticketTypeBreakdown.map((ticketType) => {
                  const percentage = ticketType.capacity > 0
                    ? (ticketType.sold / ticketType.capacity) * 100
                    : 0;

                  return (
                    <div key={ticketType.ticketTypeId} className="p-4 rounded-xl bg-background-secondary border border-white/5">
                      <h3 className="font-medium text-white mb-2">{ticketType.ticketTypeName}</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">Vendidos</span>
                          <span className="text-white font-medium">
                            {ticketType.sold} / {ticketType.capacity}
                          </span>
                        </div>
                        <div className="h-2 bg-background rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full"
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">Receita</span>
                          <span className="text-white font-medium">
                            {formatCurrency(ticketType.revenue)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
