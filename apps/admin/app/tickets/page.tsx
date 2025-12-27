'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { DataTable, Button, StatusBadge, ConfirmModal, Card, StatCard } from '../../components/ui';
import type { Column } from '../../components/ui';
import {
  getTickets,
  refundTicket,
  getTicketStats,
  type Ticket,
  type TicketFilters,
  type TicketStats,
} from '../../lib/services/tickets';
import { useAuthStore } from '@/stores/authStore';
import {
  Ticket as TicketIcon,
  Search,
  RefreshCw,
  Eye,
  RotateCcw,
  QrCode,
  DollarSign,
  CheckCircle,
} from 'lucide-react';

export default function TicketsPage() {
  const { claims, user } = useAuthStore();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Ticket['status'] | ''>('');
  const [eventFilter, setEventFilter] = useState('');
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [ticketToRefund, setTicketToRefund] = useState<Ticket | null>(null);
  const [isRefunding, setIsRefunding] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    loadData();
  }, [statusFilter, eventFilter, claims]);

  const loadData = async () => {
    if (!claims?.organizationId) return;

    setIsLoading(true);
    try {
      const filters: TicketFilters = {
        organizationId: claims.organizationId,
      };

      if (statusFilter) {
        filters.status = statusFilter;
      }

      if (eventFilter) {
        filters.eventId = eventFilter;
      }

      const [ticketsResult, statsResult] = await Promise.all([
        getTickets(filters, { pageSize: 200 }),
        getTicketStats(claims.organizationId),
      ]);

      setTickets(ticketsResult.tickets);
      setStats(statsResult);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      ticket.qrCode.toLowerCase().includes(search) ||
      ticket.eventName.toLowerCase().includes(search) ||
      ticket.buyerName?.toLowerCase().includes(search) ||
      ticket.buyerEmail?.toLowerCase().includes(search)
    );
  });

  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleRefund = async () => {
    if (!ticketToRefund) return;

    setIsRefunding(true);
    try {
      await refundTicket(ticketToRefund.eventId, ticketToRefund.id, 'Refund requested by admin', user?.uid || 'admin');
      await loadData();
      setRefundModalOpen(false);
      setTicketToRefund(null);
    } catch (error) {
      console.error('Error refunding ticket:', error);
    } finally {
      setIsRefunding(false);
    }
  };

  const columns: Column<Ticket>[] = [
    {
      key: 'qrCode',
      header: 'Código',
      render: (ticket) => (
        <div className="flex items-center gap-2">
          <QrCode className="h-4 w-4 text-gray-400" />
          <span className="font-mono text-sm">{ticket.qrCode.slice(0, 12)}...</span>
        </div>
      ),
    },
    {
      key: 'eventName',
      header: 'Evento',
      sortable: true,
      render: (ticket) => (
        <div>
          <p className="font-medium text-gray-900">{ticket.eventName}</p>
          <p className="text-sm text-gray-500">{ticket.ticketTypeName}</p>
        </div>
      ),
    },
    {
      key: 'buyerName',
      header: 'Comprador',
      render: (ticket) => (
        <div>
          <p className="text-gray-900">{ticket.buyerName || '-'}</p>
          <p className="text-sm text-gray-500">{ticket.buyerEmail}</p>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Preço',
      render: (ticket) => (
        <span className="font-medium">
          {ticket.price.toLocaleString('pt-PT')} CVE
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (ticket) => <StatusBadge status={ticket.status} />,
    },
    {
      key: 'purchasedAt',
      header: 'Data',
      sortable: true,
      render: (ticket) => (
        <span className="text-sm text-gray-500">
          {ticket.purchasedAt.toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      width: '100px',
      render: (ticket) => (
        <div className="flex items-center gap-1">
          <Link href={`/tickets/${ticket.id}`}>
            <button className="p-2 hover:bg-gray-100 rounded-lg" title="Ver detalhes">
              <Eye className="h-4 w-4 text-gray-500" />
            </button>
          </Link>
          {ticket.status === 'valid' && (
            <button
              onClick={() => {
                setTicketToRefund(ticket);
                setRefundModalOpen(true);
              }}
              className="p-2 hover:bg-red-50 rounded-lg"
              title="Reembolsar"
            >
              <RotateCcw className="h-4 w-4 text-red-500" />
            </button>
          )}
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
            <h1 className="text-2xl font-bold text-gray-900">Bilhetes</h1>
            <p className="text-gray-500">Gerencie todos os bilhetes vendidos</p>
          </div>
          <Button
            variant="outline"
            onClick={loadData}
            leftIcon={<RefreshCw className="h-5 w-5" />}
          >
            Atualizar
          </Button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Vendidos"
              value={stats.totalSold.toLocaleString('pt-PT')}
              icon={<TicketIcon size={24} />}
            />
            <StatCard
              title="Receita Total"
              value={`${stats.totalRevenue.toLocaleString('pt-PT')} CVE`}
              icon={<DollarSign size={24} />}
            />
            <StatCard
              title="Check-ins"
              value={stats.checkedIn.toLocaleString('pt-PT')}
              icon={<CheckCircle size={24} />}
              change={{
                value: stats.totalSold > 0 ? (stats.checkedIn / stats.totalSold) * 100 : 0,
                label: 'taxa',
              }}
            />
            <StatCard
              title="Pendentes"
              value={stats.pending.toLocaleString('pt-PT')}
              icon={<TicketIcon size={24} />}
            />
          </div>
        )}

        {/* Filters */}
        <Card padding="sm">
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Ticket['status'] | '')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Todos os estados</option>
              <option value="valid">Válido</option>
              <option value="used">Utilizado</option>
              <option value="cancelled">Cancelado</option>
              <option value="refunded">Reembolsado</option>
              <option value="transferred">Transferido</option>
            </select>
          </div>
        </Card>

        {/* Tickets Table */}
        <DataTable
          columns={columns}
          data={paginatedTickets}
          keyExtractor={(ticket) => ticket.id}
          isLoading={isLoading}
          emptyMessage="Nenhum bilhete encontrado"
          searchPlaceholder="Pesquisar por código, evento, comprador..."
          onSearch={handleSearch}
          searchValue={searchQuery}
          pagination={{
            currentPage,
            totalPages: Math.ceil(filteredTickets.length / pageSize),
            pageSize,
            totalItems: filteredTickets.length,
            onPageChange: setCurrentPage,
          }}
        />
      </div>

      {/* Refund Confirmation Modal */}
      <ConfirmModal
        isOpen={refundModalOpen}
        onClose={() => {
          setRefundModalOpen(false);
          setTicketToRefund(null);
        }}
        onConfirm={handleRefund}
        title="Reembolsar Bilhete"
        message={`Tem a certeza que deseja reembolsar o bilhete "${ticketToRefund?.qrCode}"? O valor de ${ticketToRefund?.price.toLocaleString('pt-PT')} CVE será devolvido ao comprador.`}
        confirmText="Reembolsar"
        cancelText="Cancelar"
        variant="warning"
        isLoading={isRefunding}
      />
    </DashboardLayout>
  );
}
