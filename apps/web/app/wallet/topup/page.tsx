'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Wallet,
  CreditCard,
  Zap,
  Gift,
  Info,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../lib/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';

export default function TopUpPage() {
  const router = useRouter();
  const [user, loadingAuth] = useAuthState(auth);
  const [walletBalance, setWalletBalance] = useState(0);
  const [bonusBalance, setBonusBalance] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick top-up amounts
  const quickAmounts = [
    { value: 500, label: '500$00', bonus: 0 },
    { value: 1000, label: '1.000$00', bonus: 20 },
    { value: 2000, label: '2.000$00', bonus: 40 },
    { value: 5000, label: '5.000$00', bonus: 100 },
    { value: 10000, label: '10.000$00', bonus: 200 },
  ];

  useEffect(() => {
    if (loadingAuth) return;

    if (!user) {
      router.push('/auth/login?redirect=/wallet/topup');
      return;
    }

    loadWalletBalance();
  }, [user, loadingAuth]);

  const loadWalletBalance = async () => {
    if (!user) return;

    try {
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setWalletBalance(userData?.wallet?.balance || 0);
        setBonusBalance(userData?.wallet?.bonusBalance || 0);
      }
    } catch (err) {
      console.error('Error loading wallet balance:', err);
    }
  };

  const calculateBonus = (amount: number): number => {
    return amount >= 1000 ? Math.floor(amount * 0.02) : 0;
  };

  const getSelectedAmountValue = (): number => {
    if (selectedAmount) return selectedAmount;
    const custom = parseInt(customAmount);
    return isNaN(custom) ? 0 : custom;
  };

  const bonus = calculateBonus(getSelectedAmountValue());

  const handleTopUp = async () => {
    const amount = getSelectedAmountValue();

    if (amount < 100) {
      setError('O valor mínimo de carregamento é 100$00');
      return;
    }

    if (amount > 50000) {
      setError('O valor máximo de carregamento é 50.000$00');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // In production, this would redirect to payment gateway
      // For now, we'll simulate the top-up process

      const functions = getFunctions();

      // Option 1: Direct top-up via Pagali (same as checkout)
      // For simplicity, we'll create an order for the top-up amount
      // and redirect to Pagali payment

      // Create a special "wallet top-up" order
      const createOrderFn = httpsCallable(functions, 'createOrder');
      const orderResult = await createOrderFn({
        eventId: 'wallet-topup', // Special event ID for top-ups
        tickets: [
          {
            ticketTypeId: 'topup',
            ticketTypeName: `Carregamento de Carteira - ${amount.toLocaleString('pt-CV')}$00`,
            price: amount,
            currency: 'CVE',
            quantity: 1,
          },
        ],
        buyerName: user?.displayName || '',
        buyerEmail: user?.email || '',
        buyerPhone: '', // Would get from user profile
      });

      const { orderId } = orderResult.data as any;

      // Initiate Pagali payment
      const initiatePagaliPaymentFn = httpsCallable(functions, 'initiatePagaliPayment');

      const webhookUrl = process.env.NEXT_PUBLIC_API_URL
        ? `${process.env.NEXT_PUBLIC_API_URL}/pagaliWebhook`
        : `https://europe-west1-eventscv-platform.cloudfunctions.net/pagaliWebhook`;

      const pagaliResult = await initiatePagaliPaymentFn({
        orderId,
        eventId: 'wallet-topup',
        userId: user?.uid || '',
        items: [
          {
            name: `Carregamento de Carteira`,
            quantity: 1,
            itemNumber: 'topup-1',
            amount,
            totalItem: amount,
          },
        ],
        total: amount,
        currencyCode: 'CVE',
        returnUrl: `${window.location.origin}/wallet/topup/return?orderId=${orderId}&amount=${amount}`,
        notifyUrl: webhookUrl,
      });

      const { paymentUrl, formData } = pagaliResult.data as any;

      // Create a form and submit it to redirect to Pagali
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = paymentUrl;

      Object.entries(formData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err: any) {
      console.error('Top-up failed:', err);
      setError(err.message || 'Falha ao processar carregamento. Tenta novamente.');
      setIsProcessing(false);
    }
  };

  if (loadingAuth) {
    return (
      <main className="min-h-screen bg-background pt-20 pb-16">
        <div className="container-app flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main className="min-h-screen bg-background pt-20 pb-16">
        <div className="container-app max-w-2xl">
          <div className="bg-zinc-900 rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Carregamento Realizado!</h1>
            <p className="text-zinc-400 mb-6">
              A tua carteira foi carregada com sucesso.
              {bonus > 0 && ` Ganhaste ${bonus.toLocaleString('pt-CV')}$00 de bónus!`}
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/wallet"
                className="btn-secondary"
              >
                Ver Carteira
              </Link>
              <Link
                href="/events"
                className="btn-primary"
              >
                Explorar Eventos
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

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
          <h1 className="text-3xl font-bold text-white mb-2">Carregar Carteira</h1>
          <p className="text-zinc-400">Adiciona saldo à tua carteira EventsCV</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Balance */}
            <div className="bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-2xl p-6 border border-brand-primary/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-brand-primary/20 rounded-xl">
                  <Wallet className="w-6 h-6 text-brand-primary" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Saldo Atual</p>
                  <h3 className="text-2xl font-bold text-white">
                    {walletBalance.toLocaleString('pt-CV')}$00
                  </h3>
                </div>
              </div>
              {bonusBalance > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Gift className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400">
                    +{bonusBalance.toLocaleString('pt-CV')}$00 em bónus
                  </span>
                </div>
              )}
            </div>

            {/* Quick Amounts */}
            <div>
              <label className="block text-sm font-medium text-white mb-4">
                Escolhe um valor
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount.value}
                    onClick={() => {
                      setSelectedAmount(amount.value);
                      setCustomAmount('');
                      setError(null);
                    }}
                    className={`relative p-4 rounded-xl border-2 transition ${
                      selectedAmount === amount.value
                        ? 'border-brand-primary bg-brand-primary/10'
                        : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-lg font-semibold text-white mb-1">
                      {amount.label}
                    </div>
                    {amount.bonus > 0 && (
                      <div className="flex items-center gap-1 text-xs text-amber-400">
                        <Zap className="w-3 h-3" />
                        <span>+{amount.bonus}$00 bónus</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Ou insere um valor personalizado
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="100"
                  max="50000"
                  step="100"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(null);
                    setError(null);
                  }}
                  placeholder="Mínimo 100$00"
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-brand-primary"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">
                  $00
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                Valor entre 100$00 e 50.000$00
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Payment Button */}
            <button
              onClick={handleTopUp}
              disabled={isProcessing || getSelectedAmountValue() === 0}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>A processar...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>
                    Carregar {getSelectedAmountValue().toLocaleString('pt-CV')}$00
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Bonus Info */}
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl p-6 border border-amber-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Gift className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="font-semibold text-white">Bónus de Carregamento</h3>
              </div>
              <p className="text-sm text-zinc-300 mb-3">
                Ganha 2% de bónus em carregamentos acima de 1.000$00!
              </p>
              {bonus > 0 && (
                <div className="p-3 bg-amber-500/10 rounded-lg">
                  <p className="text-xs text-amber-400 mb-1">Bónus deste carregamento:</p>
                  <p className="text-lg font-bold text-amber-400">
                    +{bonus.toLocaleString('pt-CV')}$00
                  </p>
                </div>
              )}
            </div>

            {/* Payment Info */}
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
              <div className="flex items-center gap-3 mb-4">
                <Info className="w-5 h-5 text-brand-primary" />
                <h3 className="font-semibold text-white">Métodos de Pagamento</h3>
              </div>
              <ul className="space-y-3 text-sm text-zinc-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Cartão SISP / Vinti4</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Visa & Mastercard</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Pagamento seguro via Pagali</span>
                </li>
              </ul>
            </div>

            {/* Benefits */}
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
              <h3 className="font-semibold text-white mb-4">Vantagens da Carteira</h3>
              <ul className="space-y-3 text-sm text-zinc-400">
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
                  <span>Checkout instantâneo</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
                  <span>Sem taxas adicionais</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
                  <span>Bónus em carregamentos</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
