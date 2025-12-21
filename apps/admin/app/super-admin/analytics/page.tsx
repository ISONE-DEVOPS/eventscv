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
import { AnalyticsService, EventsService } from '@/lib/services';
import { toast } from 'react-hot-toast';

// Mock Data for Charts (Keep until aggregation API is ready)
const REVENUE_DATA = [
    { month: 'Jan', value: 1200000 },
    { month: 'Fev', value: 1800000 },
    { month: 'Mar', value: 1500000 },
    { month: 'Abr', value: 2200000 },
    { month: 'Mai', value: 2800000 },
    { month: 'Jun', value: 3500000 },
];

const ORG_GROWTH_DATA = [
    { month: 'Jan', count: 120 },
    { month: 'Fev', count: 128 },
    { month: 'Mar', count: 135 },
    { month: 'Abr', count: 145 },
    { month: 'Mai', count: 150 },
    { month: 'Jun', count: 165 },
];

const TICKET_SALES_DATA = [
    { day: '01', count: 450 },
    { day: '05', count: 620 },
    { day: '10', count: 800 },
    { day: '15', count: 1200 },
    { day: '20', count: 950 },
    { day: '25', count: 1100 },
    { day: '30', count: 1500 },
];

export default function AnalyticsPage() {
    const [period, setPeriod] = useState('6m');
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState<any>(null);
    const [topEvents, setTopEvents] = useState<any[]>([]);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [analyticsData, eventsData] = await Promise.all([
                AnalyticsService.getPlatformAnalytics(),
                EventsService.getAllEvents(undefined, { pageSize: 100 }) // Fetch more to sort
            ]);
            setOverview(analyticsData.overview);

            // Calc Top 5 Events by Revenue
            const sortedEvents = eventsData.events
                .map((e: any) => ({
                    id: e.id,
                    name: e.title,
                    revenue: e.stats?.revenue || e.totalRevenue || 0,
                    tickets: e.stats?.ticketsSold || e.ticketsSold || 0,
                    status: e.status
                }))
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5);

            setTopEvents(sortedEvents);

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
                            <h3 className="card-title">Receita Total (Simulado)</h3>
                        </div>
                        <div className="card-body h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={REVENUE_DATA}>
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
                        </div>
                    </div>

                    {/* Growth Chart */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Crescimento de Organizações (Simulado)</h3>
                        </div>
                        <div className="card-body h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={ORG_GROWTH_DATA}>
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
                        </div>
                    </div>

                    {/* Ticket Sales Chart */}
                    <div className="card lg:col-span-2">
                        <div className="card-header">
                            <h3 className="card-title">Venda de Bilhetes (Diário - Simulado)</h3>
                        </div>
                        <div className="card-body h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={TICKET_SALES_DATA}>
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
                                    <th>Status</th>
                                    <th>Bilhetes Vendidos</th>
                                    <th>Receita Gerada</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topEvents.map((event, idx) => (
                                    <tr key={idx}>
                                        <td className="font-medium text-[hsl(var(--foreground))]">{event.name}</td>
                                        <td><StatusBadge status={event.status} size="sm" /></td>
                                        <td>{formatNumber(event.tickets)}</td>
                                        <td className="font-bold text-[hsl(var(--foreground))]">{formatCurrency(event.revenue)}</td>
                                    </tr>
                                ))}
                                {topEvents.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={4} className="text-center py-4 text-zinc-500">Sem dados disponíveis</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
