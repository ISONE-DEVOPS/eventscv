'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import DataTable, { Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import { Eye, Ban, Star, StarOff, CheckCircle, RefreshCw } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { EventsService } from '@/lib/services';
import { toast } from 'react-hot-toast';
import { DocumentSnapshot } from 'firebase/firestore';

// Define Interface locally
interface Event {
    id: string;
    title: string;
    organizationId: string;
    startDate: Date;
    location: { address?: string; name?: string } | string;
    status: 'draft' | 'published' | 'cancelled' | 'ended';
    isFeatured?: boolean;
    stats?: {
        ticketsSold: number;
        revenue: number;
    };
    [key: string]: any;
}

export default function EventsPage() {
    const [data, setData] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Pagination
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [cursors, setCursors] = useState<{ [key: number]: DocumentSnapshot | undefined }>({ 1: undefined });
    const [hasMore, setHasMore] = useState(false);

    const loadEvents = useCallback(async (currentPage: number, currentCursors: { [key: number]: DocumentSnapshot | undefined }) => {
        setLoading(true);
        try {
            const cursor = currentCursors[currentPage];

            const { events, lastDoc } = await EventsService.getAllEvents(
                undefined,
                { pageSize, lastDoc: cursor || undefined }
            );

            // Cast or map dates
            const formattedEvents = events.map((e: any) => ({
                ...e,
                startDate: e.startDate?.toDate ? e.startDate.toDate() : new Date(e.startDate),
            }));

            setData(formattedEvents as unknown as Event[]);

            // Update next cursor
            if (lastDoc) {
                setCursors(prev => ({ ...prev, [currentPage + 1]: lastDoc }));
            }
            // Simple check
            setHasMore(events.length === pageSize);

        } catch (error) {
            console.error('Error loading events:', error);
            toast.error('Erro ao carregar eventos');
        } finally {
            setLoading(false);
        }
    }, [pageSize]);

    useEffect(() => {
        loadEvents(page, cursors);
    }, [page, pageSize, loadEvents]);

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
        loadEvents(1, { 1: undefined });
    }

    const toggleFeatured = async (event: Event) => {
        const newValue = !event.isFeatured;
        try {
            await EventsService.updateEvent(event.id, { isFeatured: newValue } as any);
            setData(prev => prev.map(e => e.id === event.id ? { ...e, isFeatured: newValue } : e));
            toast.success(newValue ? 'Evento destacado' : 'Destaque removido');
        } catch (error) {
            console.error('Error updating event:', error);
            toast.error('Erro ao atualizar destaque');
        }
    };

    const handleStatusChange = async (event: Event, newStatus: 'published' | 'cancelled') => {
        if (!confirm(`Tem a certeza que deseja alterar o estado para ${newStatus}?`)) return;
        try {
            if (newStatus === 'published') {
                await EventsService.publishEvent(event.id);
            } else if (newStatus === 'cancelled') {
                await EventsService.updateEvent(event.id, { status: newStatus } as any);
            }
            // Refresh current page
            loadEvents(page, cursors);
            toast.success('Estado atualizado');
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Erro ao atualizar estado');
        }
    };


    // Filter Logic (Client Side for current page)
    const filteredData = data.filter((event) =>
        (event.title?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (event.organizationId?.toLowerCase() || '').includes(search.toLowerCase())
    );

    const columns: Column<Event>[] = [
        {
            key: 'title',
            header: 'Evento',
            sortable: true,
            render: (event) => (
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-[hsl(var(--foreground))]">{event.title}</span>
                        {event.isFeatured && <Star size={12} className="text-yellow-500 fill-yellow-500" />}
                    </div>
                    <div className="text-xs text-zinc-500">
                        {typeof event.location === 'string' ? event.location : event.location?.name || 'Localização desconhecida'}
                    </div>
                </div>
            ),
        },
        {
            key: 'organizationId',
            header: 'Organização',
            sortable: true,
            render: (event) => <span className="text-zinc-500 font-medium text-xs truncate max-w-[150px] block" title={event.organizationId}>{event.organizationId}</span>,

        },
        {
            key: 'startDate',
            header: 'Data',
            sortable: true,
            render: (event) => <span className="text-zinc-500">{event.startDate ? new Date(event.startDate).toLocaleDateString('pt-PT') : '-'}</span>,
        },
        {
            key: 'status',
            header: 'Estado',
            sortable: true,
            render: (event) => <StatusBadge status={event.status} size="sm" />,
        },
        {
            key: 'stats',
            header: 'Bilhetes',
            sortable: true,
            render: (event) => <span>{formatNumber(event.stats?.ticketsSold || 0)}</span>,
        },
        {
            key: 'stats',
            header: 'Receita',
            sortable: true,
            render: (event) => <span>{formatCurrency(event.stats?.revenue || 0)}</span>,
        },
        {
            key: 'actions',
            header: '',
            width: '100px',
            render: (event) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => toggleFeatured(event)}
                        className={`p-1.5 hover:bg-background-tertiary rounded transition-colors ${event.isFeatured ? 'text-yellow-500' : 'text-zinc-400 hover:text-yellow-500'}`}
                        title={event.isFeatured ? "Remover destaque" : "Destacar"}
                    >
                        {event.isFeatured ? <StarOff size={16} /> : <Star size={16} />}
                    </button>
                    <button className="p-1.5 hover:bg-background-tertiary rounded text-zinc-500 hover:text-brand-primary transition-colors" title="Ver Detalhes">
                        <Eye size={16} />
                    </button>
                    {event.status === 'published' ? (
                        <button
                            onClick={() => handleStatusChange(event, 'cancelled')}
                            className="p-1.5 hover:bg-background-tertiary rounded text-zinc-500 hover:text-error transition-colors"
                            title="Cancelar Evento">
                            <Ban size={16} />
                        </button>
                    ) : event.status === 'cancelled' && (
                        <button
                            onClick={() => handleStatusChange(event, 'published')}
                            className="p-1.5 hover:bg-background-tertiary rounded text-zinc-500 hover:text-success transition-colors"
                            title="Republicar">
                            <CheckCircle size={16} />
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <DashboardLayout title="Eventos" requireSuperAdmin>
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Gestão de Eventos</h2>
                        <p className="text-sm text-zinc-500">Monitorizar e moderar eventos na plataforma</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleRefresh} className="btn btn-ghost" title="Atualizar">
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <DataTable
                    columns={columns}
                    data={filteredData}
                    keyExtractor={(item) => item.id}
                    searchPlaceholder="Pesquisar evento ou organização..."
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
