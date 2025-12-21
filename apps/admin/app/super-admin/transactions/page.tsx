'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import DataTable, { Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import { Download, ExternalLink, RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { FinanceService } from '@/lib/services';
import { toast } from 'react-hot-toast';
import { DocumentSnapshot } from 'firebase/firestore';

// Define Interface locally
interface Transaction {
    id: string;
    organizationId: string;
    eventId: string;
    eventName: string;
    type: 'ticket_sale' | 'refund' | 'payout' | 'fee' | 'cashless';
    amount: number;
    currency: string;
    status: 'completed' | 'pending' | 'failed';
    description: string;
    reference?: string;
    userId?: string; // buyer ID
    userEmail?: string;
    createdAt: Date;
    [key: string]: any;
}

export default function TransactionsPage() {
    const [data, setData] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Pagination State
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [cursors, setCursors] = useState<{ [key: number]: DocumentSnapshot | undefined }>({ 1: undefined });
    const [hasMore, setHasMore] = useState(false);

    const loadTransactions = useCallback(async (currentPage: number, currentCursors: { [key: number]: DocumentSnapshot | undefined }) => {
        setLoading(true);
        // If sorting or searching changes, this needs reset. 
        // For now, search is client-side on fetched data (limited utility) or ignored.
        // Let's rely on standard fetch.

        try {
            const cursor = currentCursors[currentPage];

            const { transactions, lastDoc } = await FinanceService.getAllTransactions(
                undefined,
                { pageSize, lastDoc: cursor || undefined }
            );

            // Cast or map dates
            const formatted = transactions.map((t: any) => ({
                ...t,
                createdAt: t.createdAt?.toDate ? t.createdAt.toDate() : new Date(t.createdAt || Date.now()),
            }));

            setData(formatted as unknown as Transaction[]);

            // Update next cursor
            if (lastDoc) {
                setCursors(prev => ({ ...prev, [currentPage + 1]: lastDoc }));
            }
            // Simple check: if we got less than requested, no more. If we got full page, maybe more.
            setHasMore(transactions.length === pageSize);

        } catch (error) {
            console.error('Error loading transactions:', error);
            toast.error('Erro ao carregar transações');
        } finally {
            setLoading(false);
        }
    }, [pageSize]);

    useEffect(() => {
        loadTransactions(page, cursors);
    }, [page, pageSize, loadTransactions]); // Cursors dependency loop? 
    // We pass cursors to loadTransactions, but loadTransactions updates cursors. 
    // Better to read cursors inside. But cursors is state.
    // Actually, we only need to trigger load when 'page' or 'pageSize' changes.
    // 'cursors' should be stable for 'page' index when we navigate to it.

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
        // Reset everything
        setPage(1);
        setCursors({ 1: undefined });
        loadTransactions(1, { 1: undefined });
    };

    const handleExport = () => {
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 1500)),
            {
                loading: 'Exportando...',
                success: 'Exportação iniciada!',
                error: 'Erro ao exportar',
            }
        );
    };

    // Client-side visual search (optional, limited to current page)
    const filteredData = data.filter((tx) =>
        (tx.eventName || '').toLowerCase().includes(search.toLowerCase()) ||
        (tx.id || '').toLowerCase().includes(search.toLowerCase()) ||
        (tx.userEmail || '').toLowerCase().includes(search.toLowerCase())
    );

    const columns: Column<Transaction>[] = [
        {
            key: 'id',
            header: 'ID / Ref',
            sortable: true,
            render: (tx) => (
                <div className="flex flex-col">
                    <span className="font-mono text-xs text-zinc-500 bg-background-tertiary px-1 py-0.5 rounded w-fit">
                        {tx.id.substring(0, 8)}...
                    </span>
                    {tx.reference && <span className="text-[10px] text-zinc-400">{tx.reference}</span>}
                </div>
            ),
        },
        {
            key: 'eventName',
            header: 'Evento',
            sortable: true,
            render: (tx) => <span className="font-medium text-[hsl(var(--foreground))]">{tx.eventName || '-'}</span>,
        },
        {
            key: 'userEmail',
            header: 'Comprador',
            sortable: true,
            render: (tx) => <span className="text-zinc-500 text-sm truncate max-w-[150px] block" title={tx.userEmail}>{tx.userEmail || 'N/A'}</span>,
        },
        {
            key: 'amount',
            header: 'Valor',
            sortable: true,
            render: (tx) => <span className="font-semibold text-[hsl(var(--foreground))]">{formatCurrency(tx.amount)}</span>,
        },
        {
            key: 'status',
            header: 'Estado',
            sortable: true,
            render: (tx) => <StatusBadge status={tx.status} size="sm" />,
        },
        {
            key: 'createdAt',
            header: 'Data',
            sortable: true,
            render: (tx) => <span className="text-xs text-zinc-500">{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('pt-PT') : '-'}</span>,
        },
        {
            key: 'actions',
            header: '',
            width: '50px',
            render: (tx) => (
                <div className="flex items-center justify-end gap-2">
                    <button className="p-1.5 hover:bg-background-tertiary rounded text-zinc-500 hover:text-brand-primary transition-colors" title="Ver Detalhes">
                        <ExternalLink size={16} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <DashboardLayout title="Transações" requireSuperAdmin>
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Gestão de Transações</h2>
                        <p className="text-sm text-zinc-500">Histórico global de vendas e reembolsos</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleRefresh} className="btn btn-ghost" title="Atualizar">
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button onClick={handleExport} className="btn btn-secondary text-white">
                            <Download size={18} />
                            <span>Exportar CSV</span>
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <DataTable
                    columns={columns}
                    data={filteredData}
                    keyExtractor={(item) => item.id}
                    searchPlaceholder="Pesquisar (página atual)..."
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
                            setPage(1); // Reset to p1
                            setCursors({ 1: undefined });
                        }
                    }}
                />
            </div>
        </DashboardLayout>
    );
}
