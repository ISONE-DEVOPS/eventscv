'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { DataTable, Button, StatusBadge, ConfirmModal } from '../../components/ui';
import type { Column } from '../../components/ui';
import { getEvents, deleteEvent, type Event, type EventFilters } from '../../lib/services/events';
import { useAuthStore } from '../../lib/store/auth';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  TicketIcon,
} from '@heroicons/react/24/outline';

export default function EventsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Event['status'] | ''>('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    loadEvents();
  }, [statusFilter, user]);

  const loadEvents = async () => {
    if (!user?.organizationId) return;

    setIsLoading(true);
    try {
      const filters: EventFilters = {
        organizationId: user.organizationId,
      };

      if (statusFilter) {
        filters.status = statusFilter;
      }

      const result = await getEvents(filters, { pageSize: 100 });
      setEvents(result.events);
      setTotalItems(result.events.length);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredEvents = events.filter((event) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      event.name.toLowerCase().includes(search) ||
      event.venue.name.toLowerCase().includes(search)
    );
  });

  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleDelete = async () => {
    if (!eventToDelete) return;

    setIsDeleting(true);
    try {
      await deleteEvent(eventToDelete.id);
      setEvents(events.filter((e) => e.id !== eventToDelete.id));
      setDeleteModalOpen(false);
      setEventToDelete(null);
    } catch (error) {
      console.error('Error deleting event:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<Event>[] = [
    {
      key: 'name',
      header: 'Evento',
      sortable: true,
      render: (event) => (
        <div className="flex items-center gap-3">
          {event.coverImage ? (
            <img
              src={event.coverImage}
              alt={event.name}
              className="h-10 w-10 rounded-lg object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <CalendarIcon className="h-5 w-5 text-purple-600" />
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{event.name}</p>
            <p className="text-sm text-gray-500">{event.venue.name}</p>
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
          <p className="text-gray-900">
            {event.startDate.toLocaleDateString('pt-PT', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </p>
          <p className="text-sm text-gray-500">
            {event.startDate.toLocaleTimeString('pt-PT', {
              hour: '2-digit',
              minute: '2-digit',
            })}
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
          <TicketIcon className="h-4 w-4 text-gray-400" />
          <span>
            {event.ticketsSold || 0} / {event.totalCapacity || 0}
          </span>
        </div>
      ),
    },
    {
      key: 'totalRevenue',
      header: 'Receita',
      render: (event) => (
        <span className="font-medium">
          {(event.totalRevenue || 0).toLocaleString('pt-PT')} CVE
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
            <button className="p-2 hover:bg-gray-100 rounded-lg" title="Ver">
              <EyeIcon className="h-4 w-4 text-gray-500" />
            </button>
          </Link>
          <Link href={`/events/${event.id}/edit`}>
            <button className="p-2 hover:bg-gray-100 rounded-lg" title="Editar">
              <PencilIcon className="h-4 w-4 text-gray-500" />
            </button>
          </Link>
          <button
            onClick={() => {
              setEventToDelete(event);
              setDeleteModalOpen(true);
            }}
            className="p-2 hover:bg-red-50 rounded-lg"
            title="Eliminar"
          >
            <TrashIcon className="h-4 w-4 text-red-500" />
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
            <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
            <p className="text-gray-500">Gerencie os eventos da sua organização</p>
          </div>
          <Link href="/events/create">
            <Button leftIcon={<PlusIcon className="h-5 w-5" />}>
              Criar Evento
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Event['status'] | '')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
        message={`Tem a certeza que deseja eliminar o evento "${eventToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </DashboardLayout>
  );
}
