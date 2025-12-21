'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import DataTable, { Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import { Plus, Edit, Ban, CheckCircle, RefreshCw } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { OrganizationsService } from '@/lib/services';
import { toast } from 'react-hot-toast';
import { DocumentSnapshot } from 'firebase/firestore';

// Define the interface locally to match Firestore data structure
interface Organization {
    id: string;
    name: string;
    slug?: string;
    status: 'active' | 'suspended' | 'pending';
    subscriptionPlan?: 'free' | 'starter' | 'pro' | 'business';
    owner?: string;
    stats?: {
        totalEvents: number;
        totalRevenue: number;
        [key: string]: number;
    };
    [key: string]: any;
}

export default function OrganizationsPage() {
    const [data, setData] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Pagination
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [cursors, setCursors] = useState<{ [key: number]: DocumentSnapshot | undefined }>({ 1: undefined });
    const [hasMore, setHasMore] = useState(false);

    const loadOrganizations = useCallback(async (currentPage: number, currentCursors: { [key: number]: DocumentSnapshot | undefined }) => {
        setLoading(true);
        try {
            const cursor = currentCursors[currentPage];
            const { organizations, lastDoc } = await OrganizationsService.getOrganizations(
                undefined,
                { pageSize, lastDoc: cursor || undefined }
            );
            // Cast the result to our local type
            setData(organizations as unknown as Organization[]);

            // Update next cursor
            if (lastDoc) {
                setCursors(prev => ({ ...prev, [currentPage + 1]: lastDoc }));
            }
            // Simple check
            setHasMore(organizations.length === pageSize);

        } catch (error) {
            console.error('Error loading organizations:', error);
            toast.error('Erro ao carregar organizações');
        } finally {
            setLoading(false);
        }
    }, [pageSize]);

    useEffect(() => {
        loadOrganizations(page, cursors);
    }, [page, pageSize, loadOrganizations]);

    const handleNextPage = () => {
        if (hasMore) {
            setPage(p => p + 1);
        }
    };

    const handlePrevPage = () => {
        if (page > 1) {
            setPage(p => p - 1);
        }
    };

    const handleRefresh = () => {
        setPage(1);
        setCursors({ 1: undefined });
        loadOrganizations(1, { 1: undefined });
    }

    const handleStatusChange = async (orgId: string, currentStatus: string) => {
        if (!confirm('Tem a certeza que deseja alterar o estado desta organização?')) return;

        try {
            if (currentStatus === 'suspended') {
                await OrganizationsService.reactivateOrganization(orgId);
            } else {
                await OrganizationsService.suspendOrganization(orgId, 'Admin action');
            }
            loadOrganizations(page, cursors);
            toast.success('Estado atualizado');
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Erro ao atualizar estado');
        }
    };

    // Filter Logic (Client-side for now as Firestore search is limited)
    const filteredData = data.filter((org) =>
        org.name.toLowerCase().includes(search.toLowerCase()) ||
        org.slug?.toLowerCase().includes(search.toLowerCase())
    );

    const columns: Column<Organization>[] = [
        {
            key: 'name',
            header: 'Organização',
            sortable: true,
            render: (org) => (
                <div>
                    <div className="font-medium text-[hsl(var(--foreground))]">{org.name}</div>
                    <div className="text-xs text-zinc-500">{org.slug}</div>
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Estado',
            sortable: true,
            render: (org) => <StatusBadge status={org.status} size="sm" />,
        },
        {
            key: 'subscriptionPlan',
            header: 'Plano',
            sortable: true,
            render: (org) => (
                <span className="capitalize px-2 py-1 rounded-full text-xs font-medium bg-background-tertiary text-zinc-500">
                    {org.subscriptionPlan || 'Free'}
                </span>
            ),
        },
        {
            key: 'stats.totalEvents',
            header: 'Eventos',
            sortable: true,
            render: (org) => <span>{formatNumber(org.stats?.totalEvents || 0)}</span>,
        },
        {
            key: 'stats.totalRevenue',
            header: 'Receita Total',
            sortable: true,
            render: (org) => <span>{formatCurrency(org.stats?.totalRevenue || 0)}</span>,
        },
        {
            key: 'actions',
            header: '',
            width: '100px',
            render: (org) => (
                <div className="flex items-center justify-end gap-2">
                    <button className="p-1.5 hover:bg-background-tertiary rounded text-zinc-500 hover:text-brand-primary transition-colors" title="Editar">
                        <Edit size={16} />
                    </button>
                    {org.status === 'suspended' ? (
                        <button
                            onClick={() => handleStatusChange(org.id, org.status)}
                            className="p-1.5 hover:bg-background-tertiary rounded text-zinc-500 hover:text-success transition-colors"
                            title="Ativar">
                            <CheckCircle size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={() => handleStatusChange(org.id, org.status)}
                            className="p-1.5 hover:bg-background-tertiary rounded text-zinc-500 hover:text-error transition-colors"
                            title="Suspender">
                            <Ban size={16} />
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <DashboardLayout title="Organizações" requireSuperAdmin>
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Gestão de Organizações</h2>
                        <p className="text-sm text-zinc-500">Gerir todas as organizações registadas na plataforma</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleRefresh} className="btn btn-ghost" title="Atualizar">
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button className="btn btn-primary" onClick={() => alert('Coming soon!')}>
                            <Plus size={18} />
                            <span>Nova Organização</span>
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <DataTable
                    columns={columns}
                    data={filteredData}
                    keyExtractor={(item) => item.id}
                    searchPlaceholder="Pesquisar por nome ou slug..."
                    onSearch={setSearch}
                    searchValue={search}
                    isLoading={loading}
                    serverSidePagination={{
                        currentPage: page,
                        hasNextPage: hasMore,
                        hasPrevPage: page > 1,
                        onNextPage: handleNextPage,
                        onPrevPage: handlePrevPage,
                        pageSize,
                        onPageSizeChange: (s) => {
                            setPageSize(s);
                            setPage(1);
                            setCursors({ 1: undefined });
                        }
                    }}
                />
            </div>
        </DashboardLayout>
    );
}
