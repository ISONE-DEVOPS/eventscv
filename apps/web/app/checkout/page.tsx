'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Ticket,
  Wallet,
  CreditCard,
  Smartphone,
  Shield,
  Check,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';

// Mock order data
const orderData = {
  event: {
    id: '1',
    title: 'Festival Baía das Gatas 2024',
    date: '2024-12-15',
    time: '18:00',
    location: 'Mindelo, São Vicente',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=200&fit=crop',
  },
  tickets: [
    { id: 'vip', name: 'VIP Pass', quantity: 2, price: 7500 },
    { id: 'general', name: 'Entrada Geral', quantity: 1, price: 2500 },
  ],
  subtotal: 17500,
  serviceFee: 875,
  total: 18375,
};

const paymentMethods = [
  {
    id: 'wallet',
    name: 'Carteira EventsCV',
    description: 'Saldo disponível: 15.500$00',
    icon: Wallet,
    available: true,
    balance: 15500,
  },
  {
    id: 'sisp',
    name: 'Cartão SISP',
    description: 'Vinti4, Visa, Mastercard',
    icon: CreditCard,
    available: true,
  },
  {
    id: 'mbway',
    name: 'MB WAY',
    description: 'Pagamento por telemóvel',
    icon: Smartphone,
    available: true,
  },
];

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-PT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const [selectedPayment, setSelectedPayment] = useState('wallet');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'payment' | 'confirm' | 'success'>('payment');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedMethod = paymentMethods.find((m) => m.id === selectedPayment);
  const hasInsufficientBalance = selectedPayment === 'wallet' &&
    (selectedMethod as any)?.balance < orderData.total;

  const handlePayment = async () => {
    if (hasInsufficientBalance || !acceptTerms) return;

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStep('success');
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsProcessing(false);
    }
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

  if (step === 'success') {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-success" />
          </div>
          <h1 className="heading-display text-2xl mb-2">Pagamento Confirmado!</h1>
          <p className="text-zinc-400 mb-8">
            Os teus bilhetes foram enviados para o teu email e estão disponíveis na app.
          </p>

          <div className="glass-card p-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden">
                <Image
                  src={orderData.event.image}
                  alt={orderData.event.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">{orderData.event.title}</p>
                <p className="text-sm text-zinc-500">{orderData.tickets.reduce((sum, t) => sum + t.quantity, 0)} bilhete(s)</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-zinc-400">Total pago</span>
              <span className="text-xl font-bold text-gradient">{orderData.total.toLocaleString('pt-CV')}$00</span>
            </div>
          </div>

          <div className="flex gap-4">
            <Link href="/tickets" className="btn btn-primary flex-1">
              <Ticket className="h-5 w-5" />
              Ver Bilhetes
            </Link>
            <Link href="/events" className="btn btn-ghost flex-1">
              Explorar Mais
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-20 pb-32">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-subtle">
        <div className="container-app">
          <div className="flex h-16 items-center justify-between">
            <Link
              href={`/events/${orderData.event.id}`}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Voltar</span>
            </Link>
            <h1 className="font-display font-semibold text-white">Checkout</h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <div className="container-app max-w-4xl">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Event Summary */}
            <div className="glass-card p-6">
              <h2 className="font-display font-semibold text-lg mb-4">Resumo do Evento</h2>
              <div className="flex gap-4">
                <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                  <Image
                    src={orderData.event.image}
                    alt={orderData.event.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">{orderData.event.title}</h3>
                  <div className="space-y-1 text-sm text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(orderData.event.date)} às {orderData.event.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {orderData.event.location}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tickets */}
            <div className="glass-card p-6">
              <h2 className="font-display font-semibold text-lg mb-4">Bilhetes Selecionados</h2>
              <div className="space-y-3">
                {orderData.tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-background-secondary"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-primary/20 flex items-center justify-center">
                        <Ticket className="h-5 w-5 text-brand-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{ticket.name}</p>
                        <p className="text-sm text-zinc-500">{ticket.quantity}x {ticket.price.toLocaleString('pt-CV')}$00</p>
                      </div>
                    </div>
                    <p className="font-semibold text-white">
                      {(ticket.price * ticket.quantity).toLocaleString('pt-CV')}$00
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="glass-card p-6">
              <h2 className="font-display font-semibold text-lg mb-4">Método de Pagamento</h2>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    disabled={!method.available}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      selectedPayment === method.id
                        ? 'border-brand-primary bg-brand-primary/10'
                        : 'border-white/10 bg-background-secondary hover:border-white/20'
                    } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedPayment === method.id ? 'bg-brand-primary/20' : 'bg-background-tertiary'
                    }`}>
                      <method.icon className={`h-6 w-6 ${
                        selectedPayment === method.id ? 'text-brand-primary' : 'text-zinc-400'
                      }`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-white">{method.name}</p>
                      <p className="text-sm text-zinc-500">{method.description}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedPayment === method.id
                        ? 'border-brand-primary bg-brand-primary'
                        : 'border-zinc-600'
                    }`}>
                      {selectedPayment === method.id && (
                        <Check className="h-4 w-4 text-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {hasInsufficientBalance && (
                <div className="mt-4 p-4 rounded-xl bg-warning/10 border border-warning/20 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-warning">Saldo insuficiente</p>
                    <p className="text-sm text-zinc-400 mt-1">
                      O teu saldo é de {(selectedMethod as any)?.balance.toLocaleString('pt-CV')}$00.
                      Precisas de mais {(orderData.total - (selectedMethod as any)?.balance).toLocaleString('pt-CV')}$00.
                    </p>
                    <Link href="/profile/wallet/topup" className="inline-flex items-center gap-1 text-sm text-brand-primary hover:text-brand-secondary mt-2">
                      Carregar carteira
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Terms */}
            <div className="glass-card p-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-white/10 bg-background-secondary text-brand-primary focus:ring-brand-primary focus:ring-offset-0"
                />
                <span className="text-sm text-zinc-400">
                  Li e aceito os{' '}
                  <Link href="/terms" className="text-brand-primary hover:text-brand-secondary">
                    Termos e Condições
                  </Link>{' '}
                  de compra e a{' '}
                  <Link href="/refund" className="text-brand-primary hover:text-brand-secondary">
                    Política de Reembolso
                  </Link>
                  . Compreendo que os bilhetes são nominativos e intransferíveis.
                </span>
              </label>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6 sticky top-20">
              <h2 className="font-display font-semibold text-lg mb-6">Resumo do Pedido</h2>

              <div className="space-y-3 pb-4 border-b border-white/10">
                {orderData.tickets.map((ticket) => (
                  <div key={ticket.id} className="flex justify-between text-sm">
                    <span className="text-zinc-400">{ticket.quantity}x {ticket.name}</span>
                    <span className="text-white">{(ticket.price * ticket.quantity).toLocaleString('pt-CV')}$00</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 py-4 border-b border-white/10">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Subtotal</span>
                  <span className="text-white">{orderData.subtotal.toLocaleString('pt-CV')}$00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Taxa de serviço (5%)</span>
                  <span className="text-white">{orderData.serviceFee.toLocaleString('pt-CV')}$00</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-4">
                <span className="font-semibold text-white">Total</span>
                <span className="text-2xl font-bold text-gradient">
                  {orderData.total.toLocaleString('pt-CV')}$00
                </span>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing || hasInsufficientBalance || !acceptTerms}
                className="btn btn-primary w-full mb-4"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    A processar...
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5" />
                    Pagar {orderData.total.toLocaleString('pt-CV')}$00
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
                <Shield className="h-4 w-4" />
                Pagamento seguro e encriptado
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 glass-subtle border-t border-white/10 p-4 lg:hidden">
        <div className="flex items-center justify-between gap-4 mb-3">
          <span className="text-zinc-400">Total</span>
          <span className="text-xl font-bold text-gradient">
            {orderData.total.toLocaleString('pt-CV')}$00
          </span>
        </div>
        <button
          onClick={handlePayment}
          disabled={isProcessing || hasInsufficientBalance || !acceptTerms}
          className="btn btn-primary w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              A processar...
            </>
          ) : (
            <>
              <Shield className="h-5 w-5" />
              Confirmar Pagamento
            </>
          )}
        </button>
      </div>
    </main>
  );
}
