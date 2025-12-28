'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Wallet,
  Plus,
  TrendingUp,
  TrendingDown,
  Gift,
  Calendar,
  ArrowUpRight,
  Loader2,
  CreditCard,
} from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../lib/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore, collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import Link from 'next/link';

interface WalletTransaction {
  id: string;
  type: 'topup' | 'payment' | 'refund' | 'bonus';
  amount: number;
  bonusAmount?: number;
  balanceAfter: number;
  bonusBalanceAfter: number;
  description: string;
  relatedOrderId?: string;
  relatedEventId?: string;
  createdAt: Date;
}

export default function WalletPage() {
  const router = useRouter();
  const [user, loadingAuth] = useAuthState(auth);
  const [balance, setBalance] = useState(0);
  const [bonusBalance, setBonusBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loadingAuth) return;

    if (!user) {
      router.push('/auth/login?redirect=/wallet');
      return;
    }

    loadWalletData();
  }, [user, loadingAuth]);

  const loadWalletData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get wallet balance
      const functions = getFunctions();
      const getBalanceFn = httpsCallable(functions, 'getWalletBalance');
      const balanceResult = await getBalanceFn();
      const balanceData = balanceResult.data as any;

      setBalance(balanceData.balance || 0);
      setBonusBalance(balanceData.bonusBalance || 0);

      // Get recent transactions
      const db = getFirestore();
      const transactionsQuery = query(
        collection(db, 'wallet-transactions'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      const transactionsSnapshot = await getDocs(transactionsQuery);
      const transactionsData: WalletTransaction[] = [];

      transactionsSnapshot.forEach((doc) => {
        const data = doc.data();
        transactionsData.push({
          id: doc.id,
          type: data.type,
          amount: data.amount,
          bonusAmount: data.bonusAmount,
          balanceAfter: data.balanceAfter,
          bonusBalanceAfter: data.bonusBalanceAfter,
          description: data.description,
          relatedOrderId: data.relatedOrderId,
          relatedEventId: data.relatedEventId,
          createdAt: (data.createdAt as Timestamp).toDate(),
        });
      });

      setTransactions(transactionsData);
    } catch (err) {
      console.error('Error loading wallet data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'topup':
        return <ArrowUpRight className="w-5 h-5 text-green-500" />;
      case 'payment':
        return <TrendingDown className="w-5 h-5 text-red-400" />;
      case 'refund':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'bonus':
        return <Gift className="w-5 h-5 text-amber-400" />;
      default:
        return <Wallet className="w-5 h-5 text-zinc-400" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'topup':
      case 'refund':
      case 'bonus':
        return 'text-green-500';
      case 'payment':
        return 'text-red-400';
      default:
        return 'text-zinc-400';
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Hoje às ${date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Ontem às ${date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  if (loadingAuth || loading) {
    return (
      <main className="min-h-screen bg-background pt-20 pb-16">
        <div className="container-app max-w-4xl flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
        </div>
      </main>
    );
  }

  const totalBalance = balance + bonusBalance;

  return (
    <main className="min-h-screen bg-background pt-20 pb-16">
      <div className="container-app max-w-4xl">
        {/* Header */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Minha Carteira</h1>
          <p className="text-zinc-400">Gere o teu saldo e transações</p>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-2xl p-8 border border-brand-primary/30 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm text-zinc-400 mb-2">Saldo Total Disponível</p>
              <h2 className="text-5xl font-bold text-white mb-4">
                {totalBalance.toLocaleString('pt-CV')}$00
              </h2>

              {/* Balance Breakdown */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-brand-primary" />
                  <span className="text-sm text-zinc-300">
                    Principal: {balance.toLocaleString('pt-CV')}$00
                  </span>
                </div>
                {bonusBalance > 0 && (
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-amber-400" />
                    <span className="text-sm text-amber-400">
                      Bónus: {bonusBalance.toLocaleString('pt-CV')}$00
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Wallet Icon */}
            <div className="p-4 bg-brand-primary/20 rounded-xl">
              <Wallet className="w-8 h-8 text-brand-primary" />
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/wallet/topup"
              className="btn-primary flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Carregar Saldo</span>
            </Link>
            <Link
              href="/events"
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              <span>Explorar Eventos</span>
            </Link>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Bonus Info */}
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-6 border border-amber-500/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Gift className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="font-semibold text-white">Ganha Bónus</h3>
            </div>
            <p className="text-sm text-zinc-300 mb-2">
              Recebe 2% de bónus em cada carregamento acima de 1.000$00!
            </p>
            <Link href="/wallet/topup" className="text-sm text-amber-400 hover:underline">
              Carregar agora →
            </Link>
          </div>

          {/* Payment Info */}
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-brand-primary/20 rounded-lg">
                <CreditCard className="w-5 h-5 text-brand-primary" />
              </div>
              <h3 className="font-semibold text-white">Checkout Instantâneo</h3>
            </div>
            <p className="text-sm text-zinc-300 mb-2">
              Compra bilhetes instantaneamente usando o saldo da tua carteira.
            </p>
            <p className="text-xs text-zinc-500">Sem taxas adicionais</p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Transações Recentes</h3>
            {transactions.length > 0 && (
              <button className="text-sm text-brand-primary hover:underline">
                Ver todas
              </button>
            )}
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-800 rounded-full mb-4">
                <Wallet className="w-8 h-8 text-zinc-600" />
              </div>
              <p className="text-zinc-400 mb-2">Nenhuma transação ainda</p>
              <p className="text-sm text-zinc-500 mb-6">
                Carrega saldo ou compra bilhetes para ver transações aqui
              </p>
              <Link href="/wallet/topup" className="btn-primary inline-flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <span>Carregar Saldo</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl hover:bg-zinc-800 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-zinc-900 rounded-lg">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'payment' ? '-' : '+'}
                      {transaction.amount.toLocaleString('pt-CV')}$00
                    </p>
                    {transaction.bonusAmount && transaction.bonusAmount > 0 && (
                      <p className="text-xs text-amber-400">
                        +{transaction.bonusAmount.toLocaleString('pt-CV')}$00 bónus
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
