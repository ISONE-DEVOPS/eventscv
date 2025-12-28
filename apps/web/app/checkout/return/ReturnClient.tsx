'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check, XCircle, Loader2, AlertCircle, Info } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';

type PaymentStatus = 'checking' | 'success' | 'failed' | 'pending' | 'error';

export default function ReturnClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [status, setStatus] = useState<PaymentStatus>('checking');
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      checkPaymentStatus();
    } else {
      setStatus('error');
      setErrorMessage('ID do pedido não especificado');
    }
  }, [orderId]);

  const checkPaymentStatus = async () => {
    try {
      setStatus('checking');
      const functions = getFunctions();

      // Poll for payment status (Pagali webhook might take a moment)
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        const getPagaliPaymentStatusFn = httpsCallable(functions, 'getPagaliPaymentStatus');
        const result = await getPagaliPaymentStatusFn({ orderId });
        const data = result.data as any;

        if (data.paymentStatus === 'completed') {
          setStatus('success');
          setOrderDetails(data);
          break;
        } else if (data.paymentStatus === 'failed') {
          setStatus('failed');
          setOrderDetails(data);
          break;
        } else if (data.paymentStatus === 'pending') {
          // Still pending, wait and retry
          attempts++;
          if (attempts >= maxAttempts) {
            setStatus('pending');
            setOrderDetails(data);
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    } catch (err: any) {
      console.error('Error checking payment status:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Erro ao verificar estado do pagamento');
    }
  };

  if (status === 'checking') {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <Loader2 className="w-20 h-20 text-brand-primary mx-auto mb-6 animate-spin" />
          <h1 className="heading-display text-2xl mb-2">A verificar pagamento...</h1>
          <p className="text-zinc-400 mb-8">
            Por favor aguarda enquanto verificamos o estado do teu pagamento.
          </p>
        </div>
      </main>
    );
  }

  if (status === 'success') {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Check className="h-10 w-10 text-success" />
          </div>
          <h1 className="heading-display text-2xl mb-2">Pagamento Confirmado!</h1>
          <p className="text-zinc-400 mb-8">
            O teu pagamento foi processado com sucesso. Os bilhetes foram enviados para o teu email.
          </p>

          <div className="glass-card p-6 mb-8 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">ID do Pedido</span>
              <span className="text-sm text-white font-mono">{orderId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Estado</span>
              <span className="text-sm text-success font-medium">Completo</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <Link href="/tickets" className="btn btn-primary">
              Ver Bilhetes
            </Link>
            <Link href="/events" className="btn btn-ghost">
              Mais Eventos
            </Link>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-zinc-400 text-left">
                Os bilhetes podem ser acedidos a qualquer momento na secção "Meus Bilhetes".
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (status === 'failed') {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-error/20 flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-10 w-10 text-error" />
          </div>
          <h1 className="heading-display text-2xl mb-2">Pagamento Falhado</h1>
          <p className="text-zinc-400 mb-8">
            Infelizmente, o pagamento não foi processado. Por favor, tenta novamente.
          </p>

          <div className="glass-card p-6 mb-8 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">ID do Pedido</span>
              <span className="text-sm text-white font-mono">{orderId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Estado</span>
              <span className="text-sm text-error font-medium">Falhado</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <Link href="/events" className="btn btn-primary">
              Ver Eventos
            </Link>
            <button
              onClick={() => router.back()}
              className="btn btn-ghost"
            >
              Tentar Novamente
            </button>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <p className="text-sm text-zinc-400 text-left">
                Se o problema persistir, contacta o suporte em support@eventscv.com
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (status === 'pending') {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-warning" />
          </div>
          <h1 className="heading-display text-2xl mb-2">Pagamento Pendente</h1>
          <p className="text-zinc-400 mb-8">
            O teu pagamento está a ser processado. Vais receber uma confirmação por email quando estiver completo.
          </p>

          <div className="glass-card p-6 mb-8 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">ID do Pedido</span>
              <span className="text-sm text-white font-mono">{orderId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Estado</span>
              <span className="text-sm text-warning font-medium">Pendente</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <Link href="/events" className="btn btn-primary">
              Ver Eventos
            </Link>
            <button
              onClick={checkPaymentStatus}
              className="btn btn-ghost"
            >
              Verificar Novamente
            </button>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-zinc-400 text-left">
                Podes fechar esta página. Vais receber um email quando o pagamento for confirmado.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-error/20 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-10 w-10 text-error" />
        </div>
        <h1 className="heading-display text-2xl mb-2">Erro</h1>
        <p className="text-zinc-400 mb-8">
          {errorMessage || 'Ocorreu um erro ao processar o pagamento.'}
        </p>

        <Link href="/events" className="btn btn-primary w-full mb-6">
          Voltar aos Eventos
        </Link>

        <div className="glass-card p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <p className="text-sm text-zinc-400 text-left">
              Se precisares de ajuda, contacta support@eventscv.com
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
