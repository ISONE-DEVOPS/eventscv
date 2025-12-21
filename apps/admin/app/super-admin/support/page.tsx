'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import DataTable, { Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { MessageSquare, ExternalLink, CheckCircle, RefreshCw } from 'lucide-react';
import { SupportService } from '@/lib/services';
import { toast } from 'react-hot-toast';

// Define Interface locally
interface Ticket {
    id: string;
    subject: string;
    userId: string;
    userEmail?: string;
    userName?: string;
    category: 'technical' | 'billing' | 'feature' | 'other';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high';
    createdAt: Date;
    [key: string]: any;
}

export default function SupportPage() {
    const [data, setData] = useState<Ticket[]>([]); // Start empty
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    const loadTickets = useCallback(async () => {
        setLoading(true);
        try {
            const { tickets } = await SupportService.getTickets(
                undefined,
                { pageSize: 100 }
            );
            // Cast or map dates
            const formatted = tickets.map((t: any) => ({
                ...t,
                createdAt: t.createdAt?.toDate ? t.createdAt.toDate() : new Date(t.createdAt || Date.now()),
            }));
            setData(formatted as unknown as Ticket[]);
        } catch (error) {
            console.error('Error loading tickets:', error);
            toast.error('Erro ao carregar tickets');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTickets();
    }, [loadTickets]);

    const handleResolve = async (ticket: Ticket) => {
        if (!confirm('Marcar este ticket como resolvido?')) return;
        try {
            await SupportService.updateTicketStatus(ticket.id, 'resolved');
            await loadTickets();
            toast.success('Ticket resolvido');
        } catch (error) {
            console.error('Error resolving ticket:', error);
            toast.error('Erro ao resolver ticket');
        }
    };

    // Filter Logic
    const filteredData = data.filter((ticket) =>
        (ticket.subject || '').toLowerCase().includes(search.toLowerCase()) ||
        (ticket.userEmail || '').toLowerCase().includes(search.toLowerCase()) ||
        ticket.id.toLowerCase().includes(search.toLowerCase())
    );

    // Pagination Logic
    const paginatedData = filteredData.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    const getStatusBadge = (status: Ticket['status']) => {
        switch (status) {
            case 'open': return <Badge variant="danger" dot>Aberto</Badge>;
            case 'in_progress': return <Badge variant="warning" dot>Em Progresso</Badge>;
            case 'resolved': return <Badge variant="success" dot>Resolvido</Badge>;
            case 'closed': return <Badge variant="default">Fechado</Badge>;
            default: return <Badge variant="default">{status}</Badge>;
        }
    };

    const getPriorityBadge = (priority: Ticket['priority']) => {
        switch (priority) {
            case 'high': return <Badge variant="danger" size="sm">Alta</Badge>;
            case 'medium': return <Badge variant="warning" size="sm">Média</Badge>;
            case 'low': return <Badge variant="info" size="sm">Baixa</Badge>;
            default: return <Badge variant="default" size="sm">{priority}</Badge>;
        }
    };

    const columns: Column<Ticket>[] = [
        {
            key: 'id',
            header: 'ID',
            sortable: true,
            render: (ticket) => (
                <span className="font-mono text-xs text-zinc-500 bg-background-tertiary px-2 py-1 rounded">
                    {ticket.id.substring(0, 8)}...
                </span>
            ),
        },
        {
            key: 'subject',
            header: 'Assunto',
            sortable: true,
            render: (ticket) => (
                <div>
                    <div className="font-medium text-[hsl(var(--foreground))]">{ticket.subject}</div>
                    <div className="text-xs text-zinc-400 capitalize">{ticket.category}</div>
                </div>
            ),
        },
        {
            key: 'user', // mapping to userEmail/userName
            header: 'Utilizador',
            sortable: true,
            render: (ticket) => (
                <div>
                    <div className="text-[hsl(var(--foreground))] text-sm">{ticket.userName || 'Unknown'}</div>
                    <div className="text-xs text-zinc-500">{ticket.userEmail || ticket.userId}</div>
                </div>
            ),
        },
        {
            key: 'priority',
            header: 'Prioridade',
            sortable: true,
            render: (ticket) => getPriorityBadge(ticket.priority),
        },
        {
            key: 'status',
            header: 'Estado',
            sortable: true,
            render: (ticket) => getStatusBadge(ticket.status),
        },
        {
            key: 'createdAt',
            header: 'Data',
            sortable: true,
            render: (ticket) => <span className="text-xs text-zinc-500">{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('pt-PT') : '-'}</span>,
        },
        {
            key: 'actions',
            header: '',
            width: '50px',
            render: (ticket) => (
                <div className="flex items-center justify-end gap-2">
                    <button className="p-1.5 hover:bg-background-tertiary rounded text-zinc-500 hover:text-brand-primary transition-colors" title="Ver Ticket">
                        <MessageSquare size={16} />
                    </button>
                    {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                        <button
                            onClick={() => handleResolve(ticket)}
                            className="p-1.5 hover:bg-background-tertiary rounded text-zinc-500 hover:text-success transition-colors"
                            title="Marcar Resolvido">
                            <CheckCircle size={16} />
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <DashboardLayout title="Suporte" requireSuperAdmin>
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Central de Suporte</h2>
                        <p className="text-sm text-zinc-500">Gerir tickets e pedidos de ajuda</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => loadTickets()} className="btn btn-ghost" title="Atualizar">
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <DataTable
                    columns={columns}
                    data={paginatedData}
                    keyExtractor={(item) => item.id}
                    searchPlaceholder="Pesquisar por assunto ou utilizador..."
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
