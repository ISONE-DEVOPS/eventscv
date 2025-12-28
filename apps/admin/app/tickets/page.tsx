'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { DataTable, Button, StatusBadge, ConfirmModal, Card, StatCard } from '../../components/ui';
import type { Column } from '../../components/ui';
import { refundTicket } from '../../lib/services/tickets';
import { useAuthStore } from '@/stores/authStore';
import { useOrganizationTickets, type TicketWithDetails } from '@/hooks/useOrganizationTickets';
import {
  Ticket as TicketIcon,
  RefreshCw,
  Eye,
  RotateCcw,
  QrCode,
  DollarSign,
  CheckCircle,
} from 'lucide-react';

export default function TicketsPage() {
  const { organization, user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [ticketToRefund, setTicketToRefund] = useState<TicketWithDetails | null>(null);
  const [isRefunding, setIsRefunding] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Fetch tickets with real-time updates
  const { tickets: allTickets, stats, loading: isLoading } = useOrganizationTickets(
    organization?.id,
    { status: statusFilter || undefined }
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredTickets = useMemo(() => {
    if (!searchQuery) return allTickets;
    const search = searchQuery.toLowerCase();
    return allTickets.filter((ticket) =>
      ticket.qrCode.toLowerCase().includes(search) ||
      ticket.eventName.toLowerCase().includes(search) ||
      ticket.buyerName?.toLowerCase().includes(search) ||
      ticket.buyerEmail?.toLowerCase().includes(search)
    );
  }, [allTickets, searchQuery]);

  const paginatedTickets = useMemo(() => {
    return filteredTickets.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [filteredTickets, currentPage, pageSize]);

  const handleRefund = async () => {
    if (!ticketToRefund) return;

    setIsRefunding(true);
    try {
      await refundTicket(ticketToRefund.eventId, ticketToRefund.id, 'Refund requested by admin', user?.uid || 'admin');
      setRefundModalOpen(false);
      setTicketToRefund(null);
    } catch (error) {
      console.error('Error refunding ticket:', error);
    } finally {
      setIsRefunding(false);
    }
  };

  const columns: Column<TicketWithDetails>[] = [
    {
      key: 'qrCode',
      header: 'Código',
      render: (ticket) => (
        <div className="flex items-center gap-2">
          <QrCode className="h-4 w-4 text-[hsl(var(--foreground-muted))]" />
          <span className="font-mono text-sm text-[hsl(var(--foreground))]">{ticket.qrCode.slice(0, 12)}...</span>
        </div>
      ),
    },
    {
      key: 'eventName',
      header: 'Evento',
      sortable: true,
      render: (ticket) => (
        <div>
          <p className="font-medium text-[hsl(var(--foreground))]">{ticket.eventName}</p>
          <p className="text-sm text-[hsl(var(--foreground-secondary))]">{ticket.ticketTypeName}</p>
        </div>
      ),
    },
    {
      key: 'buyerName',
      header: 'Comprador',
      render: (ticket) => (
        <div>
          <p className="text-[hsl(var(--foreground))]">{ticket.buyerName || '-'}</p>
          <p className="text-sm text-[hsl(var(--foreground-secondary))]">{ticket.buyerEmail}</p>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Preço',
      render: (ticket) => (
        <span className="font-medium text-[hsl(var(--foreground))]">
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
        <span className="text-sm text-[hsl(var(--foreground-secondary))]">
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
            <button className="p-2 hover:bg-[hsl(var(--background-tertiary))] rounded-lg transition-colors" title="Ver detalhes">
              <Eye className="h-4 w-4 text-[hsl(var(--foreground-muted))]" />
            </button>
          </Link>
          {ticket.status === 'confirmed' && (
            <button
              onClick={() => {
                setTicketToRefund(ticket);
                setRefundModalOpen(true);
              }}
              className="p-2 hover:bg-[hsl(var(--error))]/10 rounded-lg transition-colors"
              title="Reembolsar"
            >
              <RotateCcw className="h-4 w-4 text-[hsl(var(--error))]" />
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
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Bilhetes</h1>
              <p className="text-[hsl(var(--foreground-secondary))]">Gerencie todos os bilhetes vendidos</p>
            </div>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success/10 border border-success/20">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-semibold text-success uppercase tracking-wide">Live</span>
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="stat-card">
                  <div className="skeleton h-12 w-24 mb-2" />
                  <div className="skeleton h-4 w-32" />
                </div>
              ))}
            </>
          ) : (
            <>
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
                  value: stats.totalSold > 0 ? Math.round((stats.checkedIn / stats.totalSold) * 100) : 0,
                  label: 'taxa',
                }}
              />
              <StatCard
                title="Pendentes"
                value={stats.pending.toLocaleString('pt-PT')}
                icon={<TicketIcon size={24} />}
              />
            </>
          )}
        </div>

        {/* Filters */}
        <Card padding="sm">
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-[hsl(var(--border-color))] rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary bg-[hsl(var(--background-secondary))] text-[hsl(var(--foreground))]"
            >
              <option value="">Todos os estados</option>
              <option value="confirmed">Confirmado</option>
              <option value="used">Utilizado</option>
              <option value="cancelled">Cancelado</option>
              <option value="refunded">Reembolsado</option>
              <option value="pending">Pendente</option>
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
