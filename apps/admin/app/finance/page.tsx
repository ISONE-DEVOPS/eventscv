'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
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
import {
  getPayouts,
  getTransactions,
  getFinanceStats,
  requestPayout,
  cancelPayout,
  type Payout,
  type Transaction,
  type FinanceStats,
} from '../../lib/services/finance';
import { useAuthStore } from '../../lib/store/auth';
import {
  BanknotesIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowPathIcon,
  PlusIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

export default function FinancePage() {
  const { user } = useAuthStore();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'payouts' | 'transactions'>('payouts');

  // Payout request modal
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('bank_transfer');
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestError, setRequestError] = useState('');

  // Cancel payout modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [payoutToCancel, setPayoutToCancel] = useState<Payout | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user?.organizationId) return;

    setIsLoading(true);
    try {
      const [payoutsData, transactionsData, statsData] = await Promise.all([
        getPayouts(user.organizationId, { pageSize: 100 }),
        getTransactions(user.organizationId, { pageSize: 100 }),
        getFinanceStats(user.organizationId),
      ]);

      setPayouts(payoutsData.payouts);
      setTransactions(transactionsData.transactions);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading finance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    if (!user?.organizationId || !payoutAmount) return;

    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      setRequestError('Valor inválido');
      return;
    }

    if (stats && amount > stats.availableBalance) {
      setRequestError('Valor superior ao saldo disponível');
      return;
    }

    setIsRequesting(true);
    setRequestError('');

    try {
      await requestPayout(user.organizationId, {
        amount,
        method: payoutMethod as 'bank_transfer' | 'mobile_money',
      });

      await loadData();
      setRequestModalOpen(false);
      setPayoutAmount('');
      setPayoutMethod('bank_transfer');
    } catch (error: unknown) {
      console.error('Error requesting payout:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setRequestError(errorMessage || 'Erro ao solicitar levantamento');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleCancelPayout = async () => {
    if (!payoutToCancel || !user?.organizationId) return;

    setIsCanceling(true);
    try {
      await cancelPayout(user.organizationId, payoutToCancel.id);
      await loadData();
      setCancelModalOpen(false);
      setPayoutToCancel(null);
    } catch (error) {
      console.error('Error canceling payout:', error);
    } finally {
      setIsCanceling(false);
    }
  };

  const payoutColumns: Column<Payout>[] = [
    {
      key: 'id',
      header: 'ID',
      render: (payout) => (
        <span className="font-mono text-sm text-gray-500">
          #{payout.id.slice(0, 8)}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Valor',
      render: (payout) => (
        <span className="font-bold text-gray-900">
          {payout.amount.toLocaleString('pt-PT')} CVE
        </span>
      ),
    },
    {
      key: 'method',
      header: 'Método',
      render: (payout) => (
        <span className="text-gray-600">
          {payout.method === 'bank_transfer' ? 'Transferência Bancária' : 'Mobile Money'}
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
        <span className="text-sm text-gray-500">
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
            className="p-2 hover:bg-red-50 rounded-lg"
            title="Cancelar"
          >
            <XMarkIcon className="h-4 w-4 text-red-500" />
          </button>
        ),
    },
  ];

  const transactionColumns: Column<Transaction>[] = [
    {
      key: 'id',
      header: 'ID',
      render: (transaction) => (
        <span className="font-mono text-sm text-gray-500">
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
            <ArrowDownIcon className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowUpIcon className="h-4 w-4 text-red-500" />
          )}
          <span className="text-gray-600">
            {transaction.type === 'sale'
              ? 'Venda'
              : transaction.type === 'refund'
              ? 'Reembolso'
              : transaction.type === 'payout'
              ? 'Levantamento'
              : 'Taxa'}
          </span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Valor',
      render: (transaction) => (
        <span
          className={`font-bold ${
            transaction.type === 'sale' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {transaction.type === 'sale' ? '+' : '-'}
          {transaction.amount.toLocaleString('pt-PT')} CVE
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Descrição',
      render: (transaction) => (
        <div>
          <p className="text-gray-900">{transaction.description}</p>
          {transaction.eventName && (
            <p className="text-sm text-gray-500">{transaction.eventName}</p>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Data',
      sortable: true,
      render: (transaction) => (
        <span className="text-sm text-gray-500">
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

  const paginatedPayouts = payouts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Finanças</h1>
            <p className="text-gray-500">Gerencie os seus levantamentos e transações</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={loadData}
              leftIcon={<ArrowPathIcon className="h-5 w-5" />}
            >
              Atualizar
            </Button>
            <Button
              variant="outline"
              leftIcon={<ArrowDownTrayIcon className="h-5 w-5" />}
            >
              Exportar
            </Button>
            <Button
              onClick={() => setRequestModalOpen(true)}
              leftIcon={<PlusIcon className="h-5 w-5" />}
              disabled={!stats || stats.availableBalance <= 0}
            >
              Solicitar Levantamento
            </Button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Saldo Disponível"
              value={`${stats.availableBalance.toLocaleString('pt-PT')} CVE`}
              icon={<BanknotesIcon className="h-6 w-6" />}
            />
            <StatCard
              title="Pendente"
              value={`${stats.pendingBalance.toLocaleString('pt-PT')} CVE`}
              icon={<ClockIcon className="h-6 w-6" />}
            />
            <StatCard
              title="Total de Vendas"
              value={`${stats.totalSales.toLocaleString('pt-PT')} CVE`}
              icon={<CurrencyDollarIcon className="h-6 w-6" />}
              change={{ value: 12.5, label: 'este mês' }}
            />
            <StatCard
              title="Levantado"
              value={`${stats.totalWithdrawn.toLocaleString('pt-PT')} CVE`}
              icon={<ArrowUpIcon className="h-6 w-6" />}
            />
          </div>
        )}

        {/* Balance Card */}
        {stats && (
          <Card className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200">Saldo Total</p>
                <p className="text-4xl font-bold mt-2">
                  {(stats.availableBalance + stats.pendingBalance).toLocaleString('pt-PT')} CVE
                </p>
                <p className="text-purple-200 mt-2">
                  {stats.availableBalance.toLocaleString('pt-PT')} CVE disponível •{' '}
                  {stats.pendingBalance.toLocaleString('pt-PT')} CVE pendente
                </p>
              </div>
              <div className="text-right">
                <p className="text-purple-200">Taxa da Plataforma</p>
                <p className="text-2xl font-bold">5%</p>
              </div>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-8">
            <button
              onClick={() => {
                setActiveTab('payouts');
                setCurrentPage(1);
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payouts'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Levantamentos ({payouts.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('transactions');
                setCurrentPage(1);
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transactions'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
          setRequestError('');
        }}
        title="Solicitar Levantamento"
        description={`Saldo disponível: ${stats?.availableBalance.toLocaleString('pt-PT') || 0} CVE`}
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
          {requestError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{requestError}</p>
            </div>
          )}
          <Input
            label="Valor (CVE)"
            type="number"
            value={payoutAmount}
            onChange={(e) => setPayoutAmount(e.target.value)}
            placeholder="0"
            min={1000}
            max={stats?.availableBalance || 0}
            helperText={`Mínimo: 1.000 CVE • Máximo: ${stats?.availableBalance.toLocaleString('pt-PT') || 0} CVE`}
            required
          />
          <Select
            label="Método de Pagamento"
            value={payoutMethod}
            onChange={(e) => setPayoutMethod(e.target.value)}
            options={methodOptions}
          />
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
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
