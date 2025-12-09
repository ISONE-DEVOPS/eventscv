'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Building2,
  Calendar,
  Ticket,
  TrendingUp,
  Users,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

// Mock data - will be replaced with real data from Firestore
const platformStats = {
  totalOrganizations: 156,
  activeOrganizations: 142,
  totalEvents: 1247,
  activeEvents: 89,
  totalTicketsSold: 45678,
  totalRevenue: 12500000,
  platformFees: 625000,
  growthOrgs: 12.5,
  growthEvents: 8.3,
  growthTickets: 23.7,
  growthRevenue: 18.2,
};

const recentOrganizations = [
  { id: '1', name: 'Praia Nights', plan: 'pro', events: 12, status: 'active' },
  { id: '2', name: 'Festival CV', plan: 'business', events: 45, status: 'active' },
  { id: '3', name: 'Mindelo Music', plan: 'starter', events: 3, status: 'pending' },
  { id: '4', name: 'Sal Events', plan: 'pro', events: 8, status: 'active' },
];

const recentEvents = [
  { id: '1', title: 'Gamboa Beach Festival 2024', org: 'Praia Nights', tickets: 2500, date: '2024-08-15' },
  { id: '2', name: 'Baia das Gatas', org: 'Festival CV', tickets: 15000, date: '2024-08-10' },
  { id: '3', name: 'Jazz no Tarrafal', org: 'Mindelo Music', tickets: 500, date: '2024-07-20' },
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

export default function SuperAdminDashboard() {
  return (
    <DashboardLayout title="Dashboard da Plataforma" requireSuperAdmin>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Organizacoes Ativas"
            value={platformStats.activeOrganizations}
            icon={Building2}
            trend="up"
            trendValue={platformStats.growthOrgs}
          />
          <StatCard
            label="Eventos Ativos"
            value={platformStats.activeEvents}
            icon={Calendar}
            trend="up"
            trendValue={platformStats.growthEvents}
          />
          <StatCard
            label="Bilhetes Vendidos"
            value={platformStats.totalTicketsSold}
            icon={Ticket}
            trend="up"
            trendValue={platformStats.growthTickets}
          />
          <StatCard
            label="Receita Total"
            value={platformStats.totalRevenue}
            icon={CreditCard}
            trend="up"
            trendValue={platformStats.growthRevenue}
            format="currency"
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Organizations */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Organizacoes Recentes</h2>
              <button className="btn btn-ghost btn-sm">Ver todas</button>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Organizacao</th>
                    <th>Plano</th>
                    <th>Eventos</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrganizations.map((org) => (
                    <tr key={org.id} className="cursor-pointer">
                      <td className="font-medium text-white">{org.name}</td>
                      <td>
                        <span className="badge badge-info capitalize">{org.plan}</span>
                      </td>
                      <td>{org.events}</td>
                      <td>
                        <span
                          className={`badge ${
                            org.status === 'active' ? 'badge-success' : 'badge-warning'
                          }`}
                        >
                          {org.status === 'active' ? 'Ativo' : 'Pendente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Platform Revenue */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Resumo Financeiro</h2>
              <select className="form-select w-auto text-sm py-1.5 px-3">
                <option>Este Mes</option>
                <option>Ultimos 3 Meses</option>
                <option>Este Ano</option>
              </select>
            </div>
            <div className="card-body space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-zinc-400">Receita Bruta</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(platformStats.totalRevenue)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Taxas da Plataforma</p>
                  <p className="text-2xl font-bold text-success">
                    {formatCurrency(platformStats.platformFees)}
                  </p>
                </div>
              </div>

              <div className="h-px bg-white/10" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Pagamentos Processados</span>
                  <span className="font-medium text-white">3,247</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Payouts Pendentes</span>
                  <span className="font-medium text-warning">{formatCurrency(2450000)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Reembolsos</span>
                  <span className="font-medium text-error">{formatCurrency(125000)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Acoes Rapidas</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="p-4 rounded-xl bg-background hover:bg-background-tertiary border border-white/5 hover:border-white/10 transition-all text-left">
                <Building2 size={24} className="text-brand-primary mb-3" />
                <p className="font-medium text-white">Nova Organizacao</p>
                <p className="text-sm text-zinc-500 mt-1">Criar organizacao</p>
              </button>
              <button className="p-4 rounded-xl bg-background hover:bg-background-tertiary border border-white/5 hover:border-white/10 transition-all text-left">
                <Users size={24} className="text-brand-secondary mb-3" />
                <p className="font-medium text-white">Gerir Utilizadores</p>
                <p className="text-sm text-zinc-500 mt-1">Ver todos os utilizadores</p>
              </button>
              <button className="p-4 rounded-xl bg-background hover:bg-background-tertiary border border-white/5 hover:border-white/10 transition-all text-left">
                <CreditCard size={24} className="text-brand-accent mb-3" />
                <p className="font-medium text-white">Processar Payouts</p>
                <p className="text-sm text-zinc-500 mt-1">12 payouts pendentes</p>
              </button>
              <button className="p-4 rounded-xl bg-background hover:bg-background-tertiary border border-white/5 hover:border-white/10 transition-all text-left">
                <TrendingUp size={24} className="text-success mb-3" />
                <p className="font-medium text-white">Ver Analytics</p>
                <p className="text-sm text-zinc-500 mt-1">Relatorios detalhados</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
