'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Ticket,
  Smartphone,
  Plus,
  Wallet,
  History,
  ChevronRight,
  Zap,
  Shield,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Watch,
  QrCode,
} from 'lucide-react';

// Mock wristbands data
const wristbands = [
  {
    id: 'NFC-001',
    name: 'Pulseira Principal',
    serialNumber: 'ECV-2024-A1B2C3D4',
    type: 'qrcode' as const, // 'qrcode' or 'rubber'
    status: 'active',
    balance: 8500,
    linkedEvent: {
      id: '1',
      name: 'Festival Baía das Gatas 2024',
      date: '2024-12-15',
    },
    lastUsed: '2024-12-10T14:30:00',
    color: 'purple',
  },
  {
    id: 'NFC-002',
    name: 'Pulseira Borracha',
    serialNumber: 'ECV-NFC-X7Y8Z9W0',
    type: 'rubber' as const,
    status: 'active',
    balance: 3200,
    linkedEvent: {
      id: '1',
      name: 'Festival Baía das Gatas 2024',
      date: '2024-12-15',
    },
    lastUsed: '2024-12-09T20:15:00',
    color: 'orange',
  },
  {
    id: 'NFC-003',
    name: 'Pulseira Secundária',
    serialNumber: 'ECV-2024-E5F6G7H8',
    type: 'qrcode' as const,
    status: 'inactive',
    balance: 0,
    linkedEvent: null,
    lastUsed: null,
    color: 'purple',
  },
];

const recentTransactions = [
  { id: '1', type: 'payment', description: 'Bar - Cerveja', amount: -350, time: '14:30', wristband: 'NFC-001' },
  { id: '2', type: 'payment', description: 'Food Truck - Cachupa', amount: -800, time: '13:15', wristband: 'NFC-001' },
  { id: '3', type: 'topup', description: 'Carregamento no evento', amount: 5000, time: '12:00', wristband: 'NFC-001' },
  { id: '4', type: 'payment', description: 'Merchandise - T-Shirt', amount: -2500, time: '11:30', wristband: 'NFC-001' },
];

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/20 text-success text-xs font-medium">
          <CheckCircle2 className="h-3 w-3" />
          Ativa
        </span>
      );
    case 'inactive':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-500/20 text-zinc-400 text-xs font-medium">
          <Clock className="h-3 w-3" />
          Inativa
        </span>
      );
    case 'blocked':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-error/20 text-error text-xs font-medium">
          <AlertCircle className="h-3 w-3" />
          Bloqueada
        </span>
      );
    default:
      return null;
  }
}

export default function NFCPage() {
  const [activeTab, setActiveTab] = useState<'wristbands' | 'history'>('wristbands');
  const [mounted, setMounted] = useState(false);
  const totalBalance = wristbands.reduce((sum, w) => sum + w.balance, 0);
  const activeWristbands = wristbands.filter((w) => w.status === 'active').length;

  useEffect(() => {
    setMounted(true);
  }, []);

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
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Ticket className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-white">
                Events<span className="text-gradient">CV</span>
              </span>
            </Link>
            <Link href="/profile" className="btn btn-ghost btn-sm">
              Perfil
            </Link>
          </div>
        </div>
      </header>

      <div className="container-app">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="heading-display text-3xl mb-2">
            Pulseiras <span className="text-gradient">NFC</span>
          </h1>
          <p className="text-zinc-400">
            Gere as tuas pulseiras para pagamentos cashless
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-brand-accent/20 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-brand-accent" />
              </div>
              <span className="text-sm text-zinc-400">Saldo Total</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {totalBalance.toLocaleString('pt-CV')}$00
            </p>
          </div>
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/20 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-brand-primary" />
              </div>
              <span className="text-sm text-zinc-400">Pulseiras Ativas</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {activeWristbands} <span className="text-lg text-zinc-500">/ {wristbands.length}</span>
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 mb-8">
          <Link href="/nfc/activate" className="btn btn-primary flex-1">
            <Plus className="h-5 w-5" />
            Ativar Pulseira
          </Link>
          <Link href="/profile/wallet/topup" className="btn btn-ghost flex-1">
            <RefreshCw className="h-5 w-5" />
            Carregar Saldo
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('wristbands')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'wristbands'
                ? 'bg-brand-primary text-white'
                : 'bg-background-secondary text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone className="h-5 w-5" />
            Minhas Pulseiras
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'history'
                ? 'bg-brand-primary text-white'
                : 'bg-background-secondary text-zinc-400 hover:text-white'
            }`}
          >
            <History className="h-5 w-5" />
            Histórico
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'wristbands' ? (
          <div className="space-y-4">
            {wristbands.map((wristband) => (
              <Link
                key={wristband.id}
                href={`/nfc/${wristband.id}`}
                className="block glass-card p-5 hover:border-white/20 transition-all group"
              >
                <div className="flex items-start gap-4">
                  {/* Wristband Icon */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    wristband.color === 'purple'
                      ? 'bg-gradient-primary'
                      : 'bg-gradient-sunset'
                  }`}>
                    {wristband.type === 'rubber' ? (
                      <Watch className="h-7 w-7 text-white" />
                    ) : (
                      <QrCode className="h-7 w-7 text-white" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white group-hover:text-brand-accent transition-colors">
                        {wristband.name}
                      </h3>
                      {getStatusBadge(wristband.status)}
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        wristband.type === 'rubber'
                          ? 'bg-brand-primary/20 text-brand-light'
                          : 'bg-brand-accent/20 text-brand-accent'
                      }`}>
                        {wristband.type === 'rubber' ? 'Borracha' : 'QR Code'}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500 mb-2">
                      {wristband.serialNumber}
                    </p>

                    {wristband.linkedEvent && (
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-brand-primary/10 text-brand-light text-xs">
                        <Zap className="h-3 w-3" />
                        {wristband.linkedEvent.name}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold text-white">
                      {wristband.balance.toLocaleString('pt-CV')}$00
                    </p>
                    {wristband.lastUsed && (
                      <p className="text-xs text-zinc-500 mt-1">
                        Último uso: {formatTime(wristband.lastUsed)}
                      </p>
                    )}
                  </div>

                  <ChevronRight className="h-5 w-5 text-zinc-500 group-hover:text-white transition-colors" />
                </div>
              </Link>
            ))}

            {wristbands.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-background-secondary flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="h-10 w-10 text-zinc-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Sem pulseiras registadas
                </h3>
                <p className="text-zinc-400 mb-6">
                  Ativa a tua primeira pulseira NFC para começar
                </p>
                <Link href="/nfc/activate" className="btn btn-primary">
                  <Plus className="h-5 w-5" />
                  Ativar Pulseira
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card divide-y divide-white/5">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center gap-4 p-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.amount > 0 ? 'bg-success/20' : 'bg-background-tertiary'
                }`}>
                  {transaction.amount > 0 ? (
                    <Plus className="h-5 w-5 text-success" />
                  ) : (
                    <Zap className="h-5 w-5 text-brand-accent" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">{transaction.description}</p>
                  <p className="text-sm text-zinc-500">Hoje às {transaction.time}</p>
                </div>
                <p className={`font-semibold ${transaction.amount > 0 ? 'text-success' : 'text-white'}`}>
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString('pt-CV')}$00
                </p>
              </div>
            ))}

            {recentTransactions.length === 0 && (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-zinc-500 mx-auto mb-3" />
                <p className="text-zinc-400">Sem transações recentes</p>
              </div>
            )}
          </div>
        )}

        {/* Info Cards */}
        <div className="mt-8 space-y-4">
          <div className="glass-card p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-accent/20 flex items-center justify-center flex-shrink-0">
                <Zap className="h-6 w-6 text-brand-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Pagamentos Instantâneos</h3>
                <p className="text-sm text-zinc-400">
                  Aproxima a pulseira do terminal e paga em segundos. Sem filas, sem esperas.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-primary/20 flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-brand-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">100% Seguro</h3>
                <p className="text-sm text-zinc-400">
                  O teu saldo está protegido. Se perderes a pulseira, podes bloquear e transferir o saldo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
