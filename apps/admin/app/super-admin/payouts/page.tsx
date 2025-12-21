'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import DataTable, { Column } from '@/components/ui/DataTable';
import { StatusBadge, PayoutStatus } from '@/components/ui/Badge';
import { CheckCircle, XCircle, FileText, ArrowRight, RefreshCw, Send } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { FinanceService } from '@/lib/services';
import { toast } from 'react-hot-toast';

// Define Interface locally
interface Payout {
    id: string;
    organizationId: string;
    organizationName?: string; // from join
    amount: number;
    method: 'bank_transfer' | 'mobile_money';
    requestedAt: Date;
    processedAt?: Date;
    completedAt?: Date;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    bankAccount?: any;
    mobileAccount?: any;
    [key: string]: any;
}

export default function PayoutsPage() {
    const [data, setData] = useState<Payout[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    const loadPayouts = useCallback(async () => {
        setLoading(true);
        try {
            const { payouts } = await FinanceService.getAllPayouts(
                undefined,
                { pageSize: 100 }
            );
            // Cast or map dates
            const formatted = payouts.map((p: any) => ({
                ...p,
                requestedAt: p.requestedAt?.toDate ? p.requestedAt.toDate() : new Date(p.requestedAt || Date.now()),
            }));
            setData(formatted as unknown as Payout[]);
        } catch (error) {
            console.error('Error loading payouts:', error);
            toast.error('Erro ao carregar payouts');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPayouts();
    }, [loadPayouts]);

    const handleProcess = async (payout: Payout) => {
        if (!confirm('Iniciar processamento deste pagamento?')) return;
        try {
            await FinanceService.processPayout(payout.organizationId, payout.id, 'Admin');
            await loadPayouts();
            toast.success('Pagamento em processamento');
        } catch (error) {
            console.error('Error processing payout:', error);
            toast.error('Erro ao processar');
        }
    };

    const handleComplete = async (payout: Payout) => {
        const ref = prompt('Insira a referência da transação:');
        if (!ref) return;

        try {
            await FinanceService.completePayout(payout.organizationId, payout.id, ref);
            await loadPayouts();
            toast.success('Pagamento concluído');
        } catch (error) {
            console.error('Error completing payout:', error);
            toast.error('Erro ao concluir');
        }
    };

    const handleReject = async (payout: Payout) => {
        const reason = prompt('Motivo da rejeição:');
        if (!reason) return;

        try {
            await FinanceService.failPayout(payout.organizationId, payout.id, reason);
            await loadPayouts();
            toast.success('Pagamento rejeitado');
        } catch (error) {
            console.error('Error rejecting payout:', error);
            toast.error('Erro ao rejeitar');
        }
    };

    // Filter Logic
    const filteredData = data.filter((payout) =>
        (payout.organizationId || '').toLowerCase().includes(search.toLowerCase()) ||
        payout.id.toLowerCase().includes(search.toLowerCase())
    );

    // Pagination Logic
    const paginatedData = filteredData.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    const columns: Column<Payout>[] = [
        {
            key: 'id',
            header: 'ID',
            sortable: true,
            render: (payout) => (
                <span className="font-mono text-xs text-zinc-500 bg-background-tertiary px-2 py-1 rounded">
                    {payout.id.substring(0, 8)}...
                </span>
            ),
        },
        {
            key: 'organizationId',
            header: 'Organização',
            sortable: true,
            render: (payout) => <span className="font-medium text-[hsl(var(--foreground))]">{payout.organizationName || payout.organizationId || 'N/A'}</span>,
        },
        {
            key: 'amount',
            header: 'Valor',
            sortable: true,
            render: (payout) => <span className="font-bold text-[hsl(var(--foreground))]">{formatCurrency(payout.amount)}</span>,
        },
        {
            key: 'status',
            header: 'Estado',
            sortable: true,
            render: (payout) => <StatusBadge status={payout.status} size="sm" />,
        },
        {
            key: 'requestedAt',
            header: 'Data Pedido',
            sortable: true,
            render: (payout) => <div className="text-xs text-zinc-500">{payout.requestedAt ? new Date(payout.requestedAt).toLocaleDateString('pt-PT') : '-'}</div>,
        },
        {
            key: 'method',
            header: 'Método',
            sortable: false,
            render: (payout) => <span className="text-xs text-zinc-400 capitalize">{payout.method?.replace('_', ' ')}</span>,
        },
        {
            key: 'actions',
            header: '',
            width: '140px',
            render: (payout) => (
                <div className="flex items-center justify-end gap-2">
                    {payout.status === 'pending' && (
                        <>
                            <button
                                onClick={() => handleProcess(payout)}
                                className="p-1.5 hover:bg-background-tertiary rounded text-zinc-500 hover:text-brand-primary transition-colors"
                                title="Iniciar Processamento">
                                <ArrowRight size={16} />
                            </button>
                            <button
                                onClick={() => handleReject(payout)}
                                className="p-1.5 hover:bg-background-tertiary rounded text-zinc-500 hover:text-error transition-colors"
                                title="Rejeitar">
                                <XCircle size={16} />
                            </button>
                        </>
                    )}
                    {payout.status === 'processing' && (
                        <button
                            onClick={() => handleComplete(payout)}
                            className="p-1.5 hover:bg-background-tertiary rounded text-zinc-500 hover:text-success transition-colors"
                            title="Concluir (Enviar Comprovativo)">
                            <Send size={16} />
                        </button>
                    )}
                    <button className="p-1.5 hover:bg-background-tertiary rounded text-zinc-500 hover:text-blue-600 transition-colors" title="Ver Detalhes">
                        <FileText size={16} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <DashboardLayout title="Payouts" requireSuperAdmin>
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Pedidos de Levantamento</h2>
                        <p className="text-sm text-zinc-500">Gerir e processar pagamentos a organizadores</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => loadPayouts()} className="btn btn-ghost" title="Atualizar">
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <DataTable
                    columns={columns}
                    data={paginatedData}
                    keyExtractor={(item) => item.id}
                    searchPlaceholder="Pesquisar por organização ou ID..."
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
