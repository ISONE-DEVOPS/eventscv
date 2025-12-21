'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import DataTable, { Column } from '@/components/ui/DataTable';
import { StatusBadge, PayoutStatus } from '@/components/ui/Badge';
import { MoreVertical, Settings, HelpCircle, RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { OrganizationsService } from '@/lib/services';
import { toast } from 'react-hot-toast';

// Define Interface locally based on Organization
interface Subscription {
    id: string; // org id
    organization: string;
    plan: 'free' | 'starter' | 'pro' | 'business';
    status: 'active' | 'cancelled' | 'past_due';
    price: number;
    billingCycle: 'monthly' | 'yearly';
    startDate: Date;
    nextBillingDate: Date;
    [key: string]: any;
}

const PLAN_PRICES = {
    free: 0,
    starter: 1999,
    pro: 4999,
    business: 9999
};

export default function SubscriptionsPage() {
    const [data, setData] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    const loadSubscriptions = useCallback(async () => {
        setLoading(true);
        try {
            const { organizations } = await OrganizationsService.getOrganizations(
                undefined,
                { pageSize: 100 }
            );

            const subs = organizations.map((org: any) => ({
                id: org.id,
                organization: org.name,
                plan: org.subscriptionPlan || 'free',
                status: org.subscriptionStatus || 'active',
                price: PLAN_PRICES[org.subscriptionPlan as keyof typeof PLAN_PRICES] || 0,
                billingCycle: 'monthly', // Default for now
                startDate: org.createdAt?.toDate ? org.createdAt.toDate() : new Date(),
                nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Mock next date
            }));

            setData(subs as Subscription[]);
        } catch (error) {
            console.error('Error loading subscriptions:', error);
            toast.error('Erro ao carregar subscrições');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSubscriptions();
    }, [loadSubscriptions]);

    // Filter Logic
    const filteredData = data.filter((sub) =>
        sub.organization.toLowerCase().includes(search.toLowerCase()) ||
        sub.plan.toLowerCase().includes(search.toLowerCase())
    );

    // Pagination Logic
    const paginatedData = filteredData.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    const columns: Column<Subscription>[] = [
        {
            key: 'organization',
            header: 'Organização',
            sortable: true,
            render: (sub) => <span className="font-medium text-[hsl(var(--foreground))]">{sub.organization}</span>,
        },
        {
            key: 'plan',
            header: 'Plano',
            sortable: true,
            render: (sub) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300 capitalize">{sub.plan}</span>
                    <span className="text-xs text-zinc-500 capitalize">{sub.billingCycle}</span>
                </div>
            ),
        },
        {
            key: 'price',
            header: 'Valor',
            sortable: true,
            render: (sub) => <span className="text-[hsl(var(--foreground))]">{formatCurrency(sub.price)}</span>,
        },
        {
            key: 'status',
            header: 'Estado',
            sortable: true,
            render: (sub) => {
                let variant: any = 'default';
                let label: string = sub.status;
                if (sub.status === 'active') { variant = 'success'; label = 'Ativo'; }
                if (sub.status === 'cancelled') { variant = 'danger'; label = 'Cancelado'; }
                if (sub.status === 'past_due') { variant = 'warning'; label = 'Em atraso'; }

                return (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-${variant === 'success' ? 'emerald' : variant === 'warning' ? 'amber' : 'red'}-100 text-${variant === 'success' ? 'emerald' : variant === 'warning' ? 'amber' : 'red'}-800 dark:bg-opacity-20`}>
                        {label}
                    </span>
                );
            },
        },
        {
            key: 'nextBillingDate',
            header: 'Próx. Renovação',
            sortable: true,
            render: (sub) => <span className="text-zinc-500 font-mono text-sm">{sub.nextBillingDate ? sub.nextBillingDate.toLocaleDateString('pt-PT') : '-'}</span>,
        },
        {
            key: 'actions',
            header: '',
            width: '50px',
            render: (sub) => (
                <div className="flex items-center justify-end gap-2">
                    <button className="p-1.5 hover:bg-background-tertiary rounded text-zinc-500 hover:text-brand-primary transition-colors" title="Gerir Subscrição">
                        <Settings size={16} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <DashboardLayout title="Subscrições" requireSuperAdmin>
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Gestão de Subscrições</h2>
                        <p className="text-sm text-zinc-500">Monitorizar planos e renovações das organizações</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => loadSubscriptions()} className="btn btn-ghost" title="Atualizar">
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button className="btn btn-secondary text-white">
                            <HelpCircle size={18} />
                            <span>Planos e Preços</span>
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <DataTable<Subscription>
                    columns={columns}
                    data={paginatedData}
                    keyExtractor={(item) => item.id}
                    searchPlaceholder="Pesquisar por organização ou plano..."
                    onSearch={setSearch}
                    searchValue={search}
                    isLoading={loading}
                    pagination={{
                        currentPage: page,
                        totalPages: Math.ceil(filteredData.length / pageSize) || 1,
                        pageSize,
                        totalItems: filteredData.length,
                        onPageChange: setPage,
                        onPageSizeChange: setPageSize
                    }}
                />
            </div>
        </DashboardLayout>
    );
}
