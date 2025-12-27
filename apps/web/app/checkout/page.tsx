'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Lock,
  Info,
  Plus,
} from 'lucide-react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface Event {
  id: string;
  title: string;
  startDate: Date;
  location: {
    city: string;
    island: string;
  };
  coverImage?: string;
  ticketTypes: Array<{
    id: string;
    name: string;
    price: number;
    currency: string;
  }>;
}

interface TicketSelection {
  ticketTypeId: string;
  ticketTypeName: string;
  quantity: number;
  price: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event');

  const [event, setEvent] = useState<Event | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<TicketSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState('wallet');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'details' | 'payment' | 'processing' | 'success'>('details');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User details
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Wallet balance (would come from user context/Firebase)
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    if (eventId) {
      loadEventAndTickets();
    } else {
      setError('Evento não especificado');
      setLoading(false);
    }
  }, [eventId]);

  const loadEventAndTickets = async () => {
    try {
      setLoading(true);
      const db = getFirestore();
      const eventDoc = await getDoc(doc(db, 'events', eventId!));

      if (!eventDoc.exists()) {
        setError('Evento não encontrado');
        setLoading(false);
        return;
      }

      const data = eventDoc.data();
      const eventData: Event = {
        id: eventDoc.id,
        title: data.title,
        startDate: data.startDate?.toDate() || new Date(),
        location: data.location || { city: '', island: '' },
        coverImage: data.coverImage,
        ticketTypes: data.ticketTypes || [],
      };

      setEvent(eventData);

      // Get ticket selections from session storage
      const stored = sessionStorage.getItem(`tickets_${eventId}`);
      if (stored) {
        setSelectedTickets(JSON.parse(stored));
      }

      // Load wallet balance (would come from user context)
      // For now using mock data
      setWalletBalance(15500);

      setLoading(false);
    } catch (err) {
      console.error('Error loading event:', err);
      setError('Erro ao carregar evento');
      setLoading(false);
    }
  };

  const subtotal = selectedTickets.reduce((sum, t) => sum + t.price * t.quantity, 0);
  const serviceFee = Math.round(subtotal * 0.05);
  const total = subtotal + serviceFee;
  const totalTickets = selectedTickets.reduce((sum, t) => sum + t.quantity, 0);

  const hasInsufficientBalance = selectedPayment === 'wallet' && walletBalance < total;

  const paymentMethods = [
    {
      id: 'wallet',
      name: 'Carteira EventsCV',
      description: `Saldo disponível: ${walletBalance.toLocaleString('pt-CV')}$00`,
      icon: Wallet,
      available: true,
      insufficient: hasInsufficientBalance,
    },
    {
      id: 'pagali',
      name: 'Cartão SISP / Vinti4',
      description: 'Pagamento via Pagali (Visa, Mastercard)',
      icon: CreditCard,
      available: true,
      insufficient: false,
    },
    {
      id: 'mbway',
      name: 'MB WAY',
      description: 'Pagamento por telemóvel',
      icon: Smartphone,
      available: false, // Not implemented yet
      insufficient: false,
    },
  ];

  const handleProceedToPayment = () => {
    // Validate user details
    if (!userDetails.name || !userDetails.email || !userDetails.phone) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userDetails.email)) {
      setError('Email inválido');
      return;
    }

    setError(null);
    setStep('payment');
  };

  const handlePayment = async () => {
    if (hasInsufficientBalance || !acceptTerms) return;

    setIsProcessing(true);
    setStep('processing');
    setError(null);

    try {
      const functions = getFunctions();

      // Step 1: Create order
      const createOrderFn = httpsCallable(functions, 'createOrder');
      const orderResult = await createOrderFn({
        eventId,
        tickets: selectedTickets.map((t) => ({
          ticketTypeId: t.ticketTypeId,
          ticketTypeName: t.ticketTypeName,
          price: t.price,
          currency: 'CVE',
          quantity: t.quantity,
        })),
        buyerName: userDetails.name,
        buyerEmail: userDetails.email,
        buyerPhone: userDetails.phone,
      });

      const { orderId } = orderResult.data as any;

      // Step 2: Process payment based on selected method
      if (selectedPayment === 'pagali') {
        // Initiate Pagali payment
        const initiatePagaliPaymentFn = httpsCallable(functions, 'initiatePagaliPayment');
        const pagaliResult = await initiatePagaliPaymentFn({
          orderId,
          eventId,
          userId: 'current-user-id', // Should come from auth context
          items: selectedTickets.map((t, index) => ({
            name: t.ticketTypeName,
            quantity: t.quantity,
            itemNumber: `${t.ticketTypeId}-${index}`,
            amount: t.price,
            totalItem: t.price * t.quantity,
          })),
          total,
          currencyCode: 'CVE',
          returnUrl: `${window.location.origin}/checkout/return?orderId=${orderId}`,
          notifyUrl: `${window.location.origin}/api/webhooks/pagali`,
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
      } else if (selectedPayment === 'wallet') {
        // TODO: Implement wallet payment
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setStep('success');
        sessionStorage.removeItem(`tickets_${eventId}`);
      }
    } catch (err: any) {
      console.error('Payment failed:', err);
      setError(err.message || 'Falha no pagamento. Tenta novamente.');
      setStep('payment');
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background pt-20 pb-16">
        <div className="container-app flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
            <p className="text-zinc-400">A carregar...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error && !event) {
    return (
      <main className="min-h-screen bg-background pt-20 pb-16">
        <div className="container-app flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Erro</h2>
            <p className="text-zinc-400 mb-6">{error}</p>
            <Link href="/events" className="btn btn-primary">
              Ver Eventos
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (step === 'success') {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Check className="h-10 w-10 text-success" />
          </div>
          <h1 className="heading-display text-2xl mb-2">Pagamento Confirmado!</h1>
          <p className="text-zinc-400 mb-8">
            Os teus bilhetes foram enviados para <span className="text-white font-medium">{userDetails.email}</span>
          </p>

          <div className="glass-card p-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              {event?.coverImage && (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden">
                  <Image
                    src={event.coverImage}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="text-left flex-1">
                <p className="font-semibold text-white">{event?.title}</p>
                <p className="text-sm text-zinc-500">{totalTickets} bilhete(s)</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-zinc-400">Total pago</span>
              <span className="text-xl font-bold text-gradient">{total.toLocaleString('pt-CV')}$00</span>
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
                Os bilhetes podem ser acedidos a qualquer momento na secção "Meus Bilhetes" ou através do email recebido.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (step === 'processing') {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <Loader2 className="w-20 h-20 text-brand-primary mx-auto mb-6 animate-spin" />
          <h1 className="heading-display text-2xl mb-2">A processar pagamento...</h1>
          <p className="text-zinc-400 mb-8">
            Por favor aguarda enquanto processamos o teu pagamento de forma segura.
          </p>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 text-zinc-400">
              <Shield className="w-5 h-5 text-success" />
              <p className="text-sm">Conexão segura SSL</p>
            </div>
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
            <Link href={`/events/${eventId}`} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span>Voltar</span>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-success" />
              <span className="text-sm text-zinc-400">Checkout Seguro</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container-app max-w-5xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${step === 'details' ? 'text-brand-primary' : 'text-success'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'details' ? 'bg-brand-primary' : 'bg-success'}`}>
                {step === 'details' ? '1' : <Check className="w-5 h-5" />}
              </div>
              <span className="hidden sm:inline font-medium">Detalhes</span>
            </div>
            <div className="h-px w-12 bg-white/10" />
            <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-brand-primary' : step === 'details' ? 'text-zinc-600' : 'text-success'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-brand-primary' : step === 'details' ? 'bg-zinc-800' : 'bg-success'}`}>
                {step === 'details' ? '2' : step === 'payment' ? '2' : <Check className="w-5 h-5" />}
              </div>
              <span className="hidden sm:inline font-medium">Pagamento</span>
            </div>
            <div className="h-px w-12 bg-white/10" />
            <div className="flex items-center gap-2 text-zinc-600">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">3</div>
              <span className="hidden sm:inline font-medium">Confirmação</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 'details' && (
              <div className="space-y-6">
                {/* User Details */}
                <div className="glass-card p-6">
                  <h2 className="text-xl font-bold text-white mb-6">Detalhes do Comprador</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">Nome Completo *</label>
                      <input
                        type="text"
                        value={userDetails.name}
                        onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
                        className="input w-full"
                        placeholder="João Silva"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">Email *</label>
                      <input
                        type="email"
                        value={userDetails.email}
                        onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
                        className="input w-full"
                        placeholder="joao@email.com"
                      />
                      <p className="text-xs text-zinc-500 mt-1">Os bilhetes serão enviados para este email</p>
                    </div>

                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">Telefone *</label>
                      <input
                        type="tel"
                        value={userDetails.phone}
                        onChange={(e) => setUserDetails({ ...userDetails, phone: e.target.value })}
                        className="input w-full"
                        placeholder="+238 999 1234"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="mt-6 p-4 rounded-lg bg-error/10 border border-error/20 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-error">{error}</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleProceedToPayment}
                  className="btn btn-primary w-full"
                >
                  Continuar para Pagamento
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div className="space-y-6">
                {/* Payment Methods */}
                <div className="glass-card p-6">
                  <h2 className="text-xl font-bold text-white mb-6">Método de Pagamento</h2>

                  <div className="space-y-3">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <button
                          key={method.id}
                          onClick={() => method.available && setSelectedPayment(method.id)}
                          disabled={!method.available}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                            selectedPayment === method.id
                              ? 'border-brand-primary bg-brand-primary/10'
                              : method.available
                              ? 'border-white/10 bg-background-secondary hover:border-white/20'
                              : 'border-white/5 bg-background-secondary opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              selectedPayment === method.id ? 'bg-brand-primary/20' : 'bg-background-tertiary'
                            }`}>
                              <Icon className={`w-6 h-6 ${
                                selectedPayment === method.id ? 'text-brand-primary' : 'text-zinc-400'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-white">{method.name}</p>
                                {!method.available && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-400">
                                    Em breve
                                  </span>
                                )}
                              </div>
                              <p className={`text-sm ${method.insufficient ? 'text-error' : 'text-zinc-400'}`}>
                                {method.description}
                              </p>
                              {method.insufficient && (
                                <div className="flex items-center gap-1 mt-1 text-error">
                                  <AlertCircle className="w-3 h-3" />
                                  <span className="text-xs">Saldo insuficiente</span>
                                </div>
                              )}
                            </div>
                            {selectedPayment === method.id && (
                              <Check className="w-5 h-5 text-brand-primary" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedPayment === 'wallet' && hasInsufficientBalance && (
                    <div className="mt-6 p-4 rounded-lg bg-warning/10 border border-warning/20">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-warning mb-2">Saldo insuficiente na carteira</p>
                          <Link href="/profile/wallet/topup" className="text-sm text-brand-primary hover:underline flex items-center gap-1">
                            <Plus className="w-4 h-4" />
                            Carregar Carteira
                          </Link>
                        </div>
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
                      className="mt-1 rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-zinc-300">
                        Aceito os{' '}
                        <Link href="/terms" className="text-brand-primary hover:underline">
                          Termos e Condições
                        </Link>{' '}
                        e a{' '}
                        <Link href="/privacy" className="text-brand-primary hover:underline">
                          Política de Privacidade
                        </Link>
                      </p>
                    </div>
                  </label>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep('details')}
                    className="btn btn-ghost flex-1"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={hasInsufficientBalance || !acceptTerms || isProcessing}
                    className="btn btn-primary flex-1"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        A processar...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        Confirmar Pagamento
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-20">
              <h2 className="text-lg font-bold text-white mb-6">Resumo do Pedido</h2>

              {/* Event Info */}
              {event && (
                <div className="mb-6 pb-6 border-b border-white/10">
                  <div className="flex gap-3 mb-4">
                    {event.coverImage && (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={event.coverImage}
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm line-clamp-2">{event.title}</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {event.location.city}, {event.location.island}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Calendar className="w-4 h-4" />
                    {event.startDate.toLocaleDateString('pt-CV', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              )}

              {/* Tickets */}
              <div className="space-y-3 mb-6 pb-6 border-b border-white/10">
                {selectedTickets.map((ticket) => (
                  <div key={ticket.ticketTypeId} className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-white">{ticket.ticketTypeName}</p>
                      <p className="text-xs text-zinc-500">Qty: {ticket.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-white">
                      {(ticket.price * ticket.quantity).toLocaleString('pt-CV')}$00
                    </p>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Subtotal</span>
                  <span className="text-white">{subtotal.toLocaleString('pt-CV')}$00</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Taxa de serviço (5%)</span>
                  <span className="text-white">{serviceFee.toLocaleString('pt-CV')}$00</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <span className="font-semibold text-white">Total</span>
                <span className="text-2xl font-bold text-gradient">{total.toLocaleString('pt-CV')}$00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
