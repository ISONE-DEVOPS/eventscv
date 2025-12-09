'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Ticket,
  Smartphone,
  Wallet,
  History,
  ChevronRight,
  Zap,
  Shield,
  RefreshCw,
  CheckCircle2,
  Lock,
  Trash2,
  Edit2,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  Share2,
} from 'lucide-react';

// Mock wristband data
const wristbandData = {
  id: 'NFC-001',
  name: 'Pulseira Principal',
  serialNumber: 'ECV-2024-A1B2C3D4',
  status: 'active',
  balance: 8500,
  linkedEvent: {
    id: '1',
    name: 'Festival Baía das Gatas 2024',
    date: '2024-12-15',
    location: 'Mindelo, São Vicente',
  },
  activatedAt: '2024-12-01T10:30:00',
  lastUsed: '2024-12-10T14:30:00',
  color: 'purple',
  stats: {
    totalSpent: 12500,
    totalTopups: 21000,
    transactionsCount: 28,
  },
};

const transactions = [
  { id: '1', type: 'payment', description: 'Bar - Cerveja', amount: -350, date: '2024-12-10T14:30:00', vendor: 'Bar Central' },
  { id: '2', type: 'payment', description: 'Food Truck - Cachupa', amount: -800, date: '2024-12-10T13:15:00', vendor: 'Sabores de CV' },
  { id: '3', type: 'topup', description: 'Carregamento no evento', amount: 5000, date: '2024-12-10T12:00:00', vendor: 'Bilheteira' },
  { id: '4', type: 'payment', description: 'Merchandise - T-Shirt', amount: -2500, date: '2024-12-10T11:30:00', vendor: 'Loja Oficial' },
  { id: '5', type: 'payment', description: 'Bar - Cocktail', amount: -600, date: '2024-12-09T22:45:00', vendor: 'Bar VIP' },
  { id: '6', type: 'topup', description: 'Carregamento inicial', amount: 8000, date: '2024-12-09T18:00:00', vendor: 'Bilheteira' },
  { id: '7', type: 'bonus', description: 'Bónus de ativação', amount: 500, date: '2024-12-01T10:30:00', vendor: 'EventsCV' },
];

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-PT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(dateStr: string) {
  return `${formatDate(dateStr)} às ${formatTime(dateStr)}`;
}

export default function WristbandDetailClient() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'settings'>('overview');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBlock = async () => {
    setIsBlocking(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsBlocking(false);
    setShowBlockModal(false);
  };

  const copySerialNumber = () => {
    navigator.clipboard.writeText(wristbandData.serialNumber);
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-background pt-20 pb-16">
        <div className="container-app flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-zinc-500">A carregar...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-20 pb-16">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-subtle">
        <div className="container-app">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/nfc"
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Voltar</span>
            </Link>
            <h1 className="font-display font-semibold text-white">Detalhes da Pulseira</h1>
            <button className="p-2 rounded-full glass hover:bg-white/10 text-zinc-400 transition-colors">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="container-app">
        {/* Wristband Card */}
        <div className={`glass-card p-6 mb-6 bg-gradient-to-br ${
          wristbandData.color === 'purple'
            ? 'from-brand-primary/20 to-brand-secondary/20'
            : 'from-brand-accent/20 to-brand-light/20'
        }`}>
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              wristbandData.color === 'purple'
                ? 'bg-gradient-primary'
                : 'bg-gradient-sunset'
            }`}>
              <Smartphone className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-white">{wristbandData.name}</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/20 text-success text-xs font-medium">
                  <CheckCircle2 className="h-3 w-3" />
                  Ativa
                </span>
              </div>
              <button
                onClick={copySerialNumber}
                className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                <span className="font-mono">{wristbandData.serialNumber}</span>
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Balance */}
          <div className="text-center py-6 border-y border-white/10">
            <p className="text-sm text-zinc-400 mb-1">Saldo Disponível</p>
            <p className="text-4xl font-bold text-white">
              {wristbandData.balance.toLocaleString('pt-CV')}$00
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3 mt-6">
            <Link href="/profile/wallet/topup" className="btn btn-primary flex-1">
              <Plus className="h-5 w-5" />
              Carregar
            </Link>
            <button className="btn btn-ghost flex-1">
              <RefreshCw className="h-5 w-5" />
              Transferir
            </button>
          </div>
        </div>

        {/* Linked Event */}
        {wristbandData.linkedEvent && (
          <Link
            href={`/events/${wristbandData.linkedEvent.id}`}
            className="flex items-center gap-4 p-4 glass-card mb-6 hover:border-white/20 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-accent/20 flex items-center justify-center">
              <Zap className="h-6 w-6 text-brand-accent" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-zinc-500 mb-0.5">Evento Associado</p>
              <p className="font-semibold text-white group-hover:text-brand-accent transition-colors">
                {wristbandData.linkedEvent.name}
              </p>
              <p className="text-sm text-zinc-500">{wristbandData.linkedEvent.location}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-zinc-500 group-hover:text-white transition-colors" />
          </Link>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-background-secondary mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'overview'
                ? 'bg-white/10 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Resumo
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'history'
                ? 'bg-white/10 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Histórico
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'settings'
                ? 'bg-white/10 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Definições
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="glass-card p-4 text-center">
                <p className="text-2xl font-bold text-white">
                  {wristbandData.stats.transactionsCount}
                </p>
                <p className="text-xs text-zinc-500 mt-1">Transações</p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-2xl font-bold text-brand-accent">
                  {(wristbandData.stats.totalTopups / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-zinc-500 mt-1">Carregado</p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-2xl font-bold text-brand-secondary">
                  {(wristbandData.stats.totalSpent / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-zinc-500 mt-1">Gasto</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="font-semibold text-white">Atividade Recente</h3>
                <button
                  onClick={() => setActiveTab('history')}
                  className="text-sm text-brand-accent hover:text-brand-light transition-colors"
                >
                  Ver tudo
                </button>
              </div>
              <div className="divide-y divide-white/5">
                {transactions.slice(0, 4).map((tx) => (
                  <div key={tx.id} className="flex items-center gap-4 p-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.amount > 0 ? 'bg-success/20' : 'bg-background-tertiary'
                    }`}>
                      {tx.amount > 0 ? (
                        <ArrowDownLeft className={`h-5 w-5 ${
                          tx.type === 'bonus' ? 'text-brand-accent' : 'text-success'
                        }`} />
                      ) : (
                        <ArrowUpRight className="h-5 w-5 text-zinc-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{tx.description}</p>
                      <p className="text-sm text-zinc-500">{tx.vendor}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${tx.amount > 0 ? 'text-success' : 'text-white'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('pt-CV')}$00
                      </p>
                      <p className="text-xs text-zinc-500">{formatTime(tx.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-4">Informações</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Ativada em</span>
                  <span className="text-white">{formatDateTime(wristbandData.activatedAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Último uso</span>
                  <span className="text-white">{formatDateTime(wristbandData.lastUsed)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="glass-card divide-y divide-white/5">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 p-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.amount > 0 ? 'bg-success/20' : 'bg-background-tertiary'
                }`}>
                  {tx.amount > 0 ? (
                    <ArrowDownLeft className={`h-5 w-5 ${
                      tx.type === 'bonus' ? 'text-brand-accent' : 'text-success'
                    }`} />
                  ) : (
                    <ArrowUpRight className="h-5 w-5 text-zinc-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">{tx.description}</p>
                  <p className="text-sm text-zinc-500">{tx.vendor} • {formatDate(tx.date)}</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${tx.amount > 0 ? 'text-success' : 'text-white'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('pt-CV')}$00
                  </p>
                  <p className="text-xs text-zinc-500">{formatTime(tx.date)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            {/* Edit Name */}
            <button className="w-full flex items-center gap-4 p-4 glass-card hover:border-white/20 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-background-secondary flex items-center justify-center">
                <Edit2 className="h-5 w-5 text-zinc-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-white">Editar Nome</p>
                <p className="text-sm text-zinc-500">{wristbandData.name}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-zinc-500 group-hover:text-white transition-colors" />
            </button>

            {/* Change Event */}
            <button className="w-full flex items-center gap-4 p-4 glass-card hover:border-white/20 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-background-secondary flex items-center justify-center">
                <Zap className="h-5 w-5 text-zinc-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-white">Alterar Evento</p>
                <p className="text-sm text-zinc-500">
                  {wristbandData.linkedEvent?.name || 'Nenhum evento associado'}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-zinc-500 group-hover:text-white transition-colors" />
            </button>

            {/* Transfer Balance */}
            <button className="w-full flex items-center gap-4 p-4 glass-card hover:border-white/20 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-background-secondary flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-zinc-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-white">Transferir Saldo</p>
                <p className="text-sm text-zinc-500">Mover saldo para outra pulseira ou carteira</p>
              </div>
              <ChevronRight className="h-5 w-5 text-zinc-500 group-hover:text-white transition-colors" />
            </button>

            {/* Block Wristband */}
            <button
              onClick={() => setShowBlockModal(true)}
              className="w-full flex items-center gap-4 p-4 glass-card hover:border-warning/50 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                <Lock className="h-5 w-5 text-warning" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-warning">Bloquear Pulseira</p>
                <p className="text-sm text-zinc-500">Impede pagamentos até desbloquear</p>
              </div>
              <ChevronRight className="h-5 w-5 text-zinc-500 group-hover:text-warning transition-colors" />
            </button>

            {/* Unlink Wristband */}
            <button className="w-full flex items-center gap-4 p-4 glass-card hover:border-error/50 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-error/20 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-error" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-error">Desassociar Pulseira</p>
                <p className="text-sm text-zinc-500">Remove a pulseira da tua conta</p>
              </div>
              <ChevronRight className="h-5 w-5 text-zinc-500 group-hover:text-error transition-colors" />
            </button>

            {/* Security Info */}
            <div className="mt-6 p-4 rounded-xl bg-brand-primary/10 border border-brand-primary/20">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-brand-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-brand-light">Proteção de Saldo</p>
                  <p className="text-sm text-zinc-400 mt-1">
                    Se perderes a pulseira, bloqueia-a imediatamente e o teu saldo fica protegido.
                    Podes transferir o valor para outra pulseira ou para a carteira.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Block Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-background-secondary rounded-3xl border border-white/10 overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-warning" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Bloquear Pulseira?</h3>
              <p className="text-zinc-400 mb-6">
                A pulseira não poderá ser usada para pagamentos até ser desbloqueada.
                O saldo permanecerá seguro.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="btn btn-ghost flex-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleBlock}
                  disabled={isBlocking}
                  className="btn bg-warning text-black hover:bg-warning/90 flex-1"
                >
                  {isBlocking ? 'A bloquear...' : 'Bloquear'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
