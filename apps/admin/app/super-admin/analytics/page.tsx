'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Download, Calendar, Users, Building2, Ticket, DollarSign, TrendingUp, RefreshCw } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/Badge';
import { AnalyticsService } from '@/lib/services';
import { toast } from 'react-hot-toast';

export default function AnalyticsPage() {
    const [period, setPeriod] = useState('6m');
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState<any>(null);
    const [topEvents, setTopEvents] = useState<any[]>([]);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [orgGrowthData, setOrgGrowthData] = useState<any[]>([]);
    const [ticketSalesData, setTicketSalesData] = useState<any[]>([]);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [analyticsData, topEventsData, revenueChart, orgGrowthChart, ticketSalesChart] = await Promise.all([
                AnalyticsService.getPlatformAnalytics(),
                AnalyticsService.getTopEvents(5),
                AnalyticsService.getRevenueChartData(6),
                AnalyticsService.getOrganizationGrowthData(6),
                AnalyticsService.getDailyTicketSalesData(30),
            ]);

            setOverview(analyticsData.overview);
            setTopEvents(topEventsData);
            setRevenueData(revenueChart);
            setOrgGrowthData(orgGrowthChart);
            setTicketSalesData(ticketSalesChart);

        } catch (error) {
            console.error('Error loading analytics:', error);
            toast.error('Erro ao carregar dados analíticos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return (
        <DashboardLayout title="Analytics" requireSuperAdmin>
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Análise da Plataforma</h2>
                        <p className="text-sm text-zinc-500">Métricas de crescimento e desempenho financeiro</p>
                    </div>
                    <div className="flex gap-2">
                        <select
                            className="form-select w-auto text-sm py-1.5 px-3"
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                        >
                            <option value="7d">Últimos 7 dias</option>
                            <option value="30d">Últimos 30 dias</option>
                            <option value="6m">Últimos 6 meses</option>
                            <option value="1y">Este Ano</option>
                        </select>
                        <button onClick={() => loadData()} className="btn btn-ghost" title="Atualizar">
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button className="btn btn-secondary text-white">
                            <Download size={18} />
                            <span>Relatório</span>
                        </button>
                    </div>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="card p-4 flex items-center gap-4">
                        <div className="p-3 bg-brand-primary/10 rounded-full text-brand-primary">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-zinc-500">Receita Total</p>
                            <h3 className="text-2xl font-bold text-[hsl(var(--foreground))]">
                                {loading ? '-' : formatCurrency(overview?.totalRevenue || 0)}
                            </h3>
                        </div>
                    </div>
                    <div className="card p-4 flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-full text-blue-500">
                            <Ticket size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-zinc-500">Bilhetes Vendidos</p>
                            <h3 className="text-2xl font-bold text-[hsl(var(--foreground))]">
                                {loading ? '-' : formatNumber(overview?.totalTicketsSold || 0)}
                            </h3>
                        </div>
                    </div>
                    <div className="card p-4 flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-full text-purple-500">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-zinc-500">Utilizadores</p>
                            <h3 className="text-2xl font-bold text-[hsl(var(--foreground))]">
                                {loading ? '-' : formatNumber(overview?.totalUsers || 0)}
                            </h3>
                        </div>
                    </div>
                    <div className="card p-4 flex items-center gap-4">
                        <div className="p-3 bg-green-500/10 rounded-full text-green-500">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-zinc-500">Organizações</p>
                            <h3 className="text-2xl font-bold text-[hsl(var(--foreground))]">
                                {loading ? '-' : formatNumber(overview?.totalOrganizations || 0)}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Chart */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Receita Total</h3>
                        </div>
                        <div className="card-body h-[300px]">
                            {loading || revenueData.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-zinc-500">
                                    {loading ? 'Carregando...' : 'Sem dados disponíveis'}
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueData}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                        <XAxis dataKey="month" stroke="#666" />
                                        <YAxis stroke="#666" tickFormatter={(value) => `CVE ${value / 1000}k`} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                            itemStyle={{ color: '#fff' }}
                                            formatter={(value: number) => formatCurrency(value)}
                                        />
                                        <Area type="monotone" dataKey="value" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Growth Chart */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Crescimento de Organizações</h3>
                        </div>
                        <div className="card-body h-[300px]">
                            {loading || orgGrowthData.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-zinc-500">
                                    {loading ? 'Carregando...' : 'Sem dados disponíveis'}
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={orgGrowthData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                        <XAxis dataKey="month" stroke="#666" />
                                        <YAxis stroke="#666" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Ticket Sales Chart */}
                    <div className="card lg:col-span-2">
                        <div className="card-header">
                            <h3 className="card-title">Venda de Bilhetes (Últimos 30 Dias)</h3>
                        </div>
                        <div className="card-body h-[300px]">
                            {loading || ticketSalesData.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-zinc-500">
                                    {loading ? 'Carregando...' : 'Sem dados disponíveis'}
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={ticketSalesData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                        <XAxis dataKey="day" stroke="#666" />
                                        <YAxis stroke="#666" />
                                        <Tooltip
                                            cursor={{ fill: '#ffffff10' }}
                                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>

                {/* Top Events Table */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Top Eventos por Receita</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Evento</th>
                                    <th>Organização</th>
                                    <th>Bilhetes Vendidos</th>
                                    <th>Receita Gerada</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-4 text-zinc-500">Carregando...</td>
                                    </tr>
                                ) : topEvents.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-4 text-zinc-500">Sem dados disponíveis</td>
                                    </tr>
                                ) : (
                                    topEvents.map((event, idx) => (
                                        <tr key={event.id || idx}>
                                            <td className="font-medium text-[hsl(var(--foreground))]">{event.name}</td>
                                            <td className="text-zinc-400">{event.organizationName}</td>
                                            <td>{formatNumber(event.ticketsSold)}</td>
                                            <td className="font-bold text-[hsl(var(--foreground))]">{formatCurrency(event.revenue)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
