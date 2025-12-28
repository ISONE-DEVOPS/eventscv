'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  Wallet,
  Gift,
} from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../../lib/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';

type PaymentStatus = 'checking' | 'success' | 'failed' | 'error';

function TopUpReturnPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, loadingAuth] = useAuthState(auth);

  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  const [status, setStatus] = useState<PaymentStatus>('checking');
  const [newBalance, setNewBalance] = useState(0);
  const [bonusAwarded, setBonusAwarded] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 10;

  useEffect(() => {
    if (loadingAuth) return;

    if (!user) {
      router.push('/auth/login?redirect=/wallet');
      return;
    }

    if (!orderId) {
      setStatus('error');
      return;
    }

    checkPaymentStatus();
  }, [user, loadingAuth, orderId]);

  const checkPaymentStatus = async () => {
    if (!orderId) return;

    try {
      const db = getFirestore();
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);

      if (!orderDoc.exists()) {
        setStatus('error');
        return;
      }

      const orderData = orderDoc.data();

      if (orderData.status === 'paid') {
        // Payment successful
        setStatus('success');

        // Get updated wallet balance
        const functions = getFunctions();
        const getBalanceFn = httpsCallable(functions, 'getWalletBalance');
        const balanceResult = await getBalanceFn();
        const balanceData = balanceResult.data as any;

        setNewBalance(balanceData.totalBalance || 0);

        // Calculate bonus awarded
        const topUpAmount = parseInt(amount || '0');
        const bonus = topUpAmount >= 1000 ? Math.floor(topUpAmount * 0.02) : 0;
        setBonusAwarded(bonus);
      } else if (orderData.status === 'failed') {
        setStatus('failed');
      } else if (attempts < maxAttempts) {
        // Still pending, check again
        setAttempts((prev) => prev + 1);
        setTimeout(checkPaymentStatus, 3000); // Check every 3 seconds
      } else {
        // Max attempts reached
        setStatus('error');
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
      if (attempts < maxAttempts) {
        setAttempts((prev) => prev + 1);
        setTimeout(checkPaymentStatus, 3000);
      } else {
        setStatus('error');
      }
    }
  };

  if (loadingAuth || status === 'checking') {
    return (
      <main className="min-h-screen bg-background pt-20 pb-16">
        <div className="container-app max-w-2xl">
          <div className="bg-zinc-900 rounded-2xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-primary/20 rounded-full mb-6">
              <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              A verificar pagamento...
            </h1>
            <p className="text-zinc-400 mb-4">
              Estamos a confirmar o teu carregamento. Isto pode demorar alguns segundos.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
              <span>Tentativa {attempts + 1} de {maxAttempts}</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (status === 'success') {
    return (
      <main className="min-h-screen bg-background pt-20 pb-16">
        <div className="container-app max-w-2xl">
          <div className="bg-zinc-900 rounded-2xl p-12 text-center">
            {/* Success Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-white mb-2">
              Carregamento Realizado!
            </h1>

            {/* Amount */}
            <p className="text-zinc-400 mb-8">
              Foram adicionados{' '}
              <span className="text-brand-primary font-semibold">
                {parseInt(amount || '0').toLocaleString('pt-CV')}$00
              </span>{' '}
              à tua carteira.
            </p>

            {/* Bonus */}
            {bonusAwarded > 0 && (
              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-6 border border-amber-500/30 mb-8">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Gift className="w-5 h-5 text-amber-400" />
                  <h3 className="font-semibold text-white">Bónus Ganho!</h3>
                </div>
                <p className="text-2xl font-bold text-amber-400">
                  +{bonusAwarded.toLocaleString('pt-CV')}$00
                </p>
                <p className="text-xs text-amber-400/70 mt-1">
                  2% de bónus em carregamentos acima de 1.000$00
                </p>
              </div>
            )}

            {/* New Balance */}
            <div className="bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 rounded-xl p-6 border border-brand-primary/30 mb-8">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Wallet className="w-5 h-5 text-brand-primary" />
                <p className="text-sm text-zinc-400">Novo Saldo Total</p>
              </div>
              <p className="text-3xl font-bold text-white">
                {newBalance.toLocaleString('pt-CV')}$00
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/wallet"
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <Wallet className="w-5 h-5" />
                <span>Ver Carteira</span>
              </Link>
              <Link
                href="/events"
                className="btn-primary flex items-center justify-center gap-2"
              >
                <span>Explorar Eventos</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (status === 'failed') {
    return (
      <main className="min-h-screen bg-background pt-20 pb-16">
        <div className="container-app max-w-2xl">
          <div className="bg-zinc-900 rounded-2xl p-12 text-center">
            {/* Error Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full mb-6">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-white mb-2">
              Pagamento Falhou
            </h1>

            {/* Message */}
            <p className="text-zinc-400 mb-8">
              O carregamento não pôde ser processado. Nenhum valor foi debitado da tua conta.
            </p>

            {/* Info */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8 text-left">
              <h3 className="text-sm font-semibold text-red-400 mb-2">
                Possíveis motivos:
              </h3>
              <ul className="text-sm text-zinc-400 space-y-1">
                <li>• Saldo insuficiente no cartão</li>
                <li>• Dados de pagamento incorretos</li>
                <li>• Transação cancelada</li>
                <li>• Problema temporário com o gateway</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/wallet/topup"
                className="btn-primary"
              >
                Tentar Novamente
              </Link>
              <Link
                href="/wallet"
                className="btn-secondary"
              >
                Voltar à Carteira
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  return (
    <main className="min-h-screen bg-background pt-20 pb-16">
      <div className="container-app max-w-2xl">
        <div className="bg-zinc-900 rounded-2xl p-12 text-center">
          {/* Error Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-zinc-800 rounded-full mb-6">
            <XCircle className="w-10 h-10 text-zinc-500" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-2">
            Erro ao Verificar Pagamento
          </h1>

          {/* Message */}
          <p className="text-zinc-400 mb-8">
            Não conseguimos verificar o estado do teu pagamento. Por favor, verifica o teu saldo na carteira.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/wallet"
              className="btn-primary"
            >
              Ver Carteira
            </Link>
            <Link
              href="/profile"
              className="btn-secondary"
            >
              Ver Perfil
            </Link>
          </div>

          {/* Support */}
          <div className="mt-8 pt-8 border-t border-zinc-800">
            <p className="text-sm text-zinc-500 mb-2">
              Se o problema persistir, contacta o suporte:
            </p>
            <a
              href="mailto:support@events.cv"
              className="text-brand-primary hover:underline"
            >
              support@events.cv
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function TopUpReturnPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
      </main>
    }>
      <TopUpReturnPageContent />
    </Suspense>
  );
}
