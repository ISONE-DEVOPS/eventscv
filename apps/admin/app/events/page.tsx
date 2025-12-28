'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { DataTable, Button, StatusBadge, ConfirmModal } from '../../components/ui';
import type { Column } from '../../components/ui';
import { deleteEvent } from '../../lib/services/events';
import { useAuthStore } from '@/stores/authStore';
import { useOrganizationEvents, type EventWithStats } from '@/hooks/useOrganizationEvents';
import type { Event } from '@eventscv/shared-types';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Calendar,
  Ticket,
} from 'lucide-react';

export default function EventsPage() {
  const router = useRouter();
  const { claims, organization } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Event['status'] | ''>('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<EventWithStats | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch events with real-time updates
  const { events: allEvents, loading: isLoading } = useOrganizationEvents(organization?.id);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Filter and paginate events
  const filteredEvents = useMemo(() => {
    let filtered = allEvents;

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter((event) => event.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      filtered = filtered.filter((event) =>
        event.title.toLowerCase().includes(search) ||
        event.venue?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [allEvents, statusFilter, searchQuery]);

  const paginatedEvents = useMemo(() => {
    return filteredEvents.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [filteredEvents, currentPage, pageSize]);

  const handleDelete = async () => {
    if (!eventToDelete) return;

    setIsDeleting(true);
    try {
      await deleteEvent(eventToDelete.id);
      setDeleteModalOpen(false);
      setEventToDelete(null);
    } catch (error) {
      console.error('Error deleting event:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<EventWithStats>[] = [
    {
      key: 'name',
      header: 'Evento',
      sortable: true,
      render: (event) => (
        <div className="flex items-center gap-3">
          {event.coverImage ? (
            <img
              src={event.coverImage}
              alt={event.title}
              className="h-10 w-10 rounded-lg object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-brand-primary/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-brand-primary" />
            </div>
          )}
          <div>
            <p className="font-medium text-[hsl(var(--foreground))]">{event.title}</p>
            <p className="text-sm text-[hsl(var(--foreground-secondary))]">{event.venue}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'startDate',
      header: 'Data',
      sortable: true,
      render: (event) => (
        <div>
          <p className="text-[hsl(var(--foreground))]">
            {event.startDate instanceof Date
              ? event.startDate.toLocaleDateString('pt-PT', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Data inválida'}
          </p>
          <p className="text-sm text-[hsl(var(--foreground-secondary))]">
            {event.startDate instanceof Date
              ? event.startDate.toLocaleTimeString('pt-PT', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (event) => <StatusBadge status={event.status} />,
    },
    {
      key: 'ticketsSold',
      header: 'Bilhetes',
      render: (event) => (
        <div className="flex items-center gap-2">
          <Ticket className="h-4 w-4 text-[hsl(var(--foreground-muted))]" />
          <span className="text-[hsl(var(--foreground))]">
            {event.ticketsSold || 0} / {event.totalCapacity || 0}
          </span>
        </div>
      ),
    },
    {
      key: 'totalRevenue',
      header: 'Receita',
      render: (event) => (
        <span className="font-medium text-[hsl(var(--foreground))]">
          {((event.revenue || 0)).toLocaleString('pt-PT')} CVE
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      width: '120px',
      render: (event) => (
        <div className="flex items-center gap-1">
          <Link href={`/events/${event.id}`}>
            <button className="p-2 hover:bg-[hsl(var(--background-tertiary))] rounded-lg transition-colors" title="Ver">
              <Eye className="h-4 w-4 text-[hsl(var(--foreground-muted))]" />
            </button>
          </Link>
          <Link href={`/events/${event.id}/edit`}>
            <button className="p-2 hover:bg-[hsl(var(--background-tertiary))] rounded-lg transition-colors" title="Editar">
              <Pencil className="h-4 w-4 text-[hsl(var(--foreground-muted))]" />
            </button>
          </Link>
          <button
            onClick={() => {
              setEventToDelete(event);
              setDeleteModalOpen(true);
            }}
            className="p-2 hover:bg-[hsl(var(--error))]/10 rounded-lg transition-colors"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4 text-[hsl(var(--error))]" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Eventos</h1>
            <p className="text-[hsl(var(--foreground-secondary))]">Gerencie os eventos da sua organização</p>
          </div>
          <Link href="/events/create">
            <Button leftIcon={<Plus className="h-5 w-5" />}>
              Criar Evento
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Event['status'] | '')}
            className="px-4 py-2 border border-[hsl(var(--border-color))] rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary bg-[hsl(var(--background-secondary))] text-[hsl(var(--foreground))]"
          >
            <option value="">Todos os estados</option>
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
            <option value="ongoing">A decorrer</option>
            <option value="completed">Concluído</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>

        {/* Events Table */}
        <DataTable
          columns={columns}
          data={paginatedEvents}
          keyExtractor={(event) => event.id}
          isLoading={isLoading}
          emptyMessage="Nenhum evento encontrado"
          searchPlaceholder="Pesquisar eventos..."
          onSearch={handleSearch}
          searchValue={searchQuery}
          pagination={{
            currentPage,
            totalPages: Math.ceil(filteredEvents.length / pageSize),
            pageSize,
            totalItems: filteredEvents.length,
            onPageChange: setCurrentPage,
          }}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setEventToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Eliminar Evento"
        message={`Tem a certeza que deseja eliminar o evento "${eventToDelete?.title}"? Esta ação não pode ser desfeita.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </DashboardLayout>
  );
}
