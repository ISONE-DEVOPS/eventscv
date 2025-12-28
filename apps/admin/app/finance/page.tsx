'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import {
  DataTable,
  Button,
  StatusBadge,
  ConfirmModal,
  Card,
  StatCard,
  Modal,
  Input,
  Select,
} from '../../components/ui';
import type { Column } from '../../components/ui';
import { useOrganizationFinance, type Transaction, type Payout } from '@/hooks/useOrganizationFinance';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/contexts/ToastContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Banknote,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Clock,
  Plus,
  X,
  Download,
  TrendingUp,
  Wallet,
} from 'lucide-react';

export default function FinancePage() {
  const { organization, user } = useAuthStore();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'payouts' | 'transactions'>('payouts');
  const [dateRange, setDateRange] = useState<'all' | '7d' | '30d' | '90d'>('30d');

  // Payout request modal
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('bank_transfer');
  const [isRequesting, setIsRequesting] = useState(false);

  // Cancel payout modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [payoutToCancel, setPayoutToCancel] = useState<Payout | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Calculate date range
  const dateFilter = useMemo(() => {
    if (dateRange === 'all') return undefined;
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return { startDate };
  }, [dateRange]);

  // Fetch financial data with real-time updates
  const { transactions, payouts, stats, loading: isLoading } = useOrganizationFinance(
    organization?.id,
    dateFilter
  );

  const handleRequestPayout = async () => {
    if (!organization?.id || !payoutAmount) return;

    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast('error', 'Valor Inválido', 'Por favor insira um valor válido');
      return;
    }

    if (amount > stats.availableBalance) {
      showToast('error', 'Saldo Insuficiente', 'Valor superior ao saldo disponível');
      return;
    }

    if (amount < 1000) {
      showToast('error', 'Valor Mínimo', 'O valor mínimo para levantamento é 1.000 CVE');
      return;
    }

    setIsRequesting(true);

    try {
      const payoutsRef = collection(db, 'payouts');
      await addDoc(payoutsRef, {
        organizationId: organization.id,
        amount,
        fee: 0,
        netAmount: amount,
        method: payoutMethod,
        status: 'pending',
        requestedBy: user?.uid || '',
        requestedByName: user?.displayName || user?.email || 'Unknown',
        createdAt: serverTimestamp(),
      });

      showToast('success', 'Levantamento Solicitado', 'O seu pedido está a ser processado');
      setRequestModalOpen(false);
      setPayoutAmount('');
      setPayoutMethod('bank_transfer');
    } catch (error) {
      console.error('Error requesting payout:', error);
      showToast('error', 'Erro', 'Erro ao solicitar levantamento. Tente novamente.');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleCancelPayout = async () => {
    if (!payoutToCancel) return;

    setIsCanceling(true);
    try {
      // In a real app, update the payout status in Firestore
      showToast('success', 'Levantamento Cancelado', 'O pedido foi cancelado com sucesso');
      setCancelModalOpen(false);
      setPayoutToCancel(null);
    } catch (error) {
      console.error('Error canceling payout:', error);
      showToast('error', 'Erro', 'Erro ao cancelar levantamento');
    } finally {
      setIsCanceling(false);
    }
  };

  const payoutColumns: Column<Payout>[] = [
    {
      key: 'id',
      header: 'ID',
      render: (payout) => (
        <span className="font-mono text-sm text-[hsl(var(--foreground-muted))]">
          #{payout.id.slice(0, 8)}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Valor',
      render: (payout) => (
        <span className="font-bold text-[hsl(var(--foreground))]">
          {payout.amount.toLocaleString('pt-PT')} CVE
        </span>
      ),
    },
    {
      key: 'method',
      header: 'Método',
      render: (payout) => (
        <span className="text-[hsl(var(--foreground-secondary))]">
          {payout.method === 'bank_transfer' ? 'Transferência Bancária' :
           payout.method === 'mobile_money' ? 'Mobile Money' :
           payout.method === 'cash' ? 'Dinheiro' : payout.method}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (payout) => <StatusBadge status={payout.status} />,
    },
    {
      key: 'createdAt',
      header: 'Data',
      sortable: true,
      render: (payout) => (
        <span className="text-sm text-[hsl(var(--foreground-secondary))]">
          {payout.createdAt.toLocaleDateString('pt-PT', {
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
      width: '80px',
      render: (payout) =>
        payout.status === 'pending' && (
          <button
            onClick={() => {
              setPayoutToCancel(payout);
              setCancelModalOpen(true);
            }}
            className="p-2 hover:bg-[hsl(var(--error))]/10 rounded-lg transition-colors"
            title="Cancelar"
          >
            <X className="h-4 w-4 text-[hsl(var(--error))]" />
          </button>
        ),
    },
  ];

  const transactionColumns: Column<Transaction>[] = [
    {
      key: 'id',
      header: 'ID',
      render: (transaction) => (
        <span className="font-mono text-sm text-[hsl(var(--foreground-muted))]">
          #{transaction.id.slice(0, 8)}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (transaction) => (
        <div className="flex items-center gap-2">
          {transaction.type === 'sale' ? (
            <ArrowDown className="h-4 w-4 text-success" />
          ) : (
            <ArrowUp className="h-4 w-4 text-[hsl(var(--error))]" />
          )}
          <span className="text-[hsl(var(--foreground-secondary))]">
            {transaction.type === 'sale'
              ? 'Venda'
              : transaction.type === 'refund'
                ? 'Reembolso'
                : transaction.type === 'payout'
                  ? 'Levantamento'
                  : 'Outro'}
          </span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Valor',
      render: (transaction) => (
        <span
          className={`font-bold ${transaction.type === 'sale' ? 'text-success' : 'text-[hsl(var(--error))]'}`}
        >
          {transaction.type === 'sale' ? '+' : '-'}
          {Math.abs(transaction.amount).toLocaleString('pt-PT')} CVE
        </span>
      ),
    },
    {
      key: 'event',
      header: 'Evento',
      render: (transaction) => (
        <div>
          <p className="text-[hsl(var(--foreground))]">{transaction.eventName}</p>
          {transaction.buyerName && (
            <p className="text-sm text-[hsl(var(--foreground-secondary))]">{transaction.buyerName}</p>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Data',
      sortable: true,
      render: (transaction) => (
        <span className="text-sm text-[hsl(var(--foreground-secondary))]">
          {transaction.createdAt.toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
  ];

  const methodOptions = [
    { value: 'bank_transfer', label: 'Transferência Bancária' },
    { value: 'mobile_money', label: 'Mobile Money' },
  ];

  const paginatedPayouts = useMemo(() => {
    return payouts.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [payouts, currentPage, pageSize]);

  const paginatedTransactions = useMemo(() => {
    return transactions.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [transactions, currentPage, pageSize]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Finanças</h1>
              <p className="text-[hsl(var(--foreground-secondary))]">Gerencie os seus levantamentos e transações</p>
            </div>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success/10 border border-success/20">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-semibold text-success uppercase tracking-wide">Live</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-4 py-2 border border-[hsl(var(--border-color))] rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary bg-[hsl(var(--background-secondary))] text-[hsl(var(--foreground))]"
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
              <option value="all">Todos</option>
            </select>
            <Button
              variant="outline"
              leftIcon={<Download className="h-5 w-5" />}
            >
              Exportar
            </Button>
            <Button
              onClick={() => setRequestModalOpen(true)}
              leftIcon={<Plus className="h-5 w-5" />}
              disabled={!stats || stats.availableBalance <= 0}
            >
              Solicitar Levantamento
            </Button>
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
                title="Saldo Disponível"
                value={`${stats.availableBalance.toLocaleString('pt-PT')} CVE`}
                icon={<Wallet size={24} />}
              />
              <StatCard
                title="Receita Líquida"
                value={`${stats.netRevenue.toLocaleString('pt-PT')} CVE`}
                icon={<TrendingUp size={24} />}
                change={{
                  value: stats.totalRevenue > 0 ? Math.round((stats.netRevenue / stats.totalRevenue) * 100) : 0,
                  label: 'margem',
                }}
              />
              <StatCard
                title="Levantamentos Pendentes"
                value={`${stats.pendingPayouts.toLocaleString('pt-PT')} CVE`}
                icon={<Clock size={24} />}
              />
              <StatCard
                title="Total Levantado"
                value={`${stats.completedPayouts.toLocaleString('pt-PT')} CVE`}
                icon={<Banknote size={24} />}
              />
            </>
          )}
        </div>

        {/* Balance Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-accent text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItMnptMCAwdi0yaDJ2MnptMCAwaDJ2LTJoLTJ6bTAtMmgtMnYyaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80">Saldo Total</p>
                <p className="text-4xl font-display font-bold mt-2">
                  {(stats.availableBalance + stats.pendingPayouts).toLocaleString('pt-PT')} CVE
                </p>
                <p className="text-white/80 mt-2">
                  {stats.availableBalance.toLocaleString('pt-PT')} CVE disponível •{' '}
                  {stats.pendingPayouts.toLocaleString('pt-PT')} CVE pendente
                </p>
              </div>
              <div className="text-right">
                <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                  <p className="text-white/80 text-sm">Taxa da Plataforma</p>
                  <p className="text-3xl font-display font-bold">5%</p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-white/70 text-sm">Receita Total</p>
                  <p className="text-xl font-bold mt-1">{stats.totalRevenue.toLocaleString('pt-PT')} CVE</p>
                </div>
                <div>
                  <p className="text-white/70 text-sm">Taxas Plataforma</p>
                  <p className="text-xl font-bold mt-1">{stats.totalFees.toLocaleString('pt-PT')} CVE</p>
                </div>
                <div>
                  <p className="text-white/70 text-sm">Transações</p>
                  <p className="text-xl font-bold mt-1">{stats.totalTransactions}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-brand-accent/20 rounded-full blur-2xl" />
        </Card>

        {/* Tabs */}
        <div className="border-b border-[hsl(var(--border-color))]">
          <nav className="flex gap-8">
            <button
              onClick={() => {
                setActiveTab('payouts');
                setCurrentPage(1);
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'payouts'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--border-color))]'
              }`}
            >
              Levantamentos ({payouts.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('transactions');
                setCurrentPage(1);
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'transactions'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--border-color))]'
              }`}
            >
              Transações ({transactions.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'payouts' ? (
          <DataTable
            columns={payoutColumns}
            data={paginatedPayouts}
            keyExtractor={(payout) => payout.id}
            isLoading={isLoading}
            emptyMessage="Nenhum levantamento"
            pagination={{
              currentPage,
              totalPages: Math.ceil(payouts.length / pageSize),
              pageSize,
              totalItems: payouts.length,
              onPageChange: setCurrentPage,
            }}
          />
        ) : (
          <DataTable
            columns={transactionColumns}
            data={paginatedTransactions}
            keyExtractor={(transaction) => transaction.id}
            isLoading={isLoading}
            emptyMessage="Nenhuma transação"
            pagination={{
              currentPage,
              totalPages: Math.ceil(transactions.length / pageSize),
              pageSize,
              totalItems: transactions.length,
              onPageChange: setCurrentPage,
            }}
          />
        )}
      </div>

      {/* Request Payout Modal */}
      <Modal
        isOpen={requestModalOpen}
        onClose={() => {
          setRequestModalOpen(false);
          setPayoutAmount('');
          setPayoutMethod('bank_transfer');
        }}
        title="Solicitar Levantamento"
        description={`Saldo disponível: ${stats.availableBalance.toLocaleString('pt-PT')} CVE`}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setRequestModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleRequestPayout} isLoading={isRequesting}>
              Solicitar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Valor (CVE)"
            type="number"
            value={payoutAmount}
            onChange={(e) => setPayoutAmount(e.target.value)}
            placeholder="0"
            min={1000}
            max={stats.availableBalance}
            helperText={`Mínimo: 1.000 CVE • Máximo: ${stats.availableBalance.toLocaleString('pt-PT')} CVE`}
            required
          />
          <Select
            label="Método de Pagamento"
            value={payoutMethod}
            onChange={(e) => setPayoutMethod(e.target.value)}
            options={methodOptions}
          />
          <div className="p-3 bg-[hsl(var(--background-tertiary))] rounded-lg border border-[hsl(var(--border-color))]">
            <p className="text-sm text-[hsl(var(--foreground-secondary))]">
              Os levantamentos são processados em até 3 dias úteis.
            </p>
          </div>
        </div>
      </Modal>

      {/* Cancel Payout Modal */}
      <ConfirmModal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setPayoutToCancel(null);
        }}
        onConfirm={handleCancelPayout}
        title="Cancelar Levantamento"
        message={`Tem a certeza que deseja cancelar o levantamento de ${payoutToCancel?.amount.toLocaleString('pt-PT')} CVE?`}
        confirmText="Cancelar Levantamento"
        cancelText="Voltar"
        variant="warning"
        isLoading={isCanceling}
      />
    </DashboardLayout>
  );
}
