'use client';

import { useState, useRef, useMemo } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button, Card, StatCard, StatusBadge, Select } from '../../components/ui';
import { useOrganizationEvents } from '@/hooks/useOrganizationEvents';
import { useEventCheckIns } from '@/hooks/useEventCheckIns';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/contexts/ToastContext';
import {
  QrCode,
  CheckCircle,
  XCircle,
  Users,
  Ticket as TicketIcon,
  Search,
  ScanLine,
  TrendingUp,
} from 'lucide-react';

export default function CheckInPage() {
  const { user, organization } = useAuthStore();
  const { showToast } = useToast();
  const [selectedEventId, setSelectedEventId] = useState('');

  // Fetch events with real-time updates
  const { events, loading: eventsLoading } = useOrganizationEvents(organization?.id);

  // Fetch check-in stats with real-time updates
  const { stats, loading: statsLoading } = useEventCheckIns(selectedEventId || undefined);

  // Search/Scan
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Filter only published events
  const activeEvents = useMemo(() => {
    return events.filter((event) =>
      event.status === 'published'
    );
  }, [events]);

  const selectedEvent = useMemo(() => {
    return activeEvents.find((e) => e.id === selectedEventId) || null;
  }, [activeEvents, selectedEventId]);

  const handleSearch = async () => {
    if (!searchQuery.trim() || !selectedEventId) return;

    setIsSearching(true);

    try {
      // Find ticket by QR code
      const ticketsRef = collection(db, 'tickets');
      const ticketsQuery = query(
        ticketsRef,
        where('qrCode', '==', searchQuery.trim())
      );

      const snapshot = await getDocs(ticketsQuery);

      if (snapshot.empty) {
        showToast('error', 'Bilhete Não Encontrado', 'O código inserido não corresponde a nenhum bilhete.');
        setSearchQuery('');
        inputRef.current?.focus();
        return;
      }

      const ticketDoc = snapshot.docs[0];
      const ticket = ticketDoc.data();

      // Check if ticket is for this event
      if (ticket.eventId !== selectedEventId) {
        showToast('error', 'Evento Errado', `Este bilhete é para outro evento.`);
        setSearchQuery('');
        inputRef.current?.focus();
        return;
      }

      // Check ticket status
      if (ticket.status === 'used') {
        const checkedInAt = ticket.checkedInAt?.toDate();
        showToast('warning', 'Já Utilizado', `Este bilhete já foi utilizado em ${checkedInAt?.toLocaleString('pt-PT')}.`);
        setSearchQuery('');
        inputRef.current?.focus();
        return;
      }

      if (ticket.status === 'cancelled' || ticket.status === 'refunded') {
        showToast('error', 'Bilhete Inválido', `Este bilhete foi ${ticket.status === 'cancelled' ? 'cancelado' : 'reembolsado'}.`);
        setSearchQuery('');
        inputRef.current?.focus();
        return;
      }

      // Do check-in
      const ticketRef = doc(db, 'tickets', ticketDoc.id);
      await updateDoc(ticketRef, {
        status: 'used',
        checkedInAt: serverTimestamp(),
        checkedInBy: user?.uid || 'admin',
      });

      showToast('success', 'Check-in Realizado!', `${ticket.buyerName || 'Participante'} - ${ticket.ticketTypeName}`);
      setSearchQuery('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Check-in error:', error);
      showToast('error', 'Erro', 'Ocorreu um erro ao processar o check-in.');
      setSearchQuery('');
      inputRef.current?.focus();
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const eventOptions = activeEvents.map((event) => ({
    value: event.id,
    label: `${event.title} - ${event.startDate instanceof Date ? event.startDate.toLocaleDateString('pt-PT') : ''}`,
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Check-in</h1>
              <p className="text-[hsl(var(--foreground-secondary))]">Valide os bilhetes dos participantes</p>
            </div>
            {selectedEventId && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success/10 border border-success/20">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[10px] font-semibold text-success uppercase tracking-wide">Live</span>
              </span>
            )}
          </div>
        </div>

        {/* Event Selection */}
        <Card>
          <Select
            label="Selecione o Evento"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            options={eventOptions}
            placeholder="Escolha um evento para iniciar o check-in"
          />
        </Card>

        {selectedEventId && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {statsLoading ? (
                <>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="stat-card">
                      <div className="skeleton h-12 w-24 mb-2" />
                      <div className="skeleton h-4 w-32" />
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <StatCard
                    title="Check-ins Realizados"
                    value={stats.totalCheckIns.toLocaleString('pt-PT')}
                    icon={<CheckCircle size={24} />}
                  />
                  <StatCard
                    title="Total de Bilhetes"
                    value={stats.totalTickets.toLocaleString('pt-PT')}
                    icon={<TicketIcon size={24} />}
                  />
                  <StatCard
                    title="Taxa de Check-in"
                    value={`${stats.checkInRate.toFixed(1)}%`}
                    icon={<TrendingUp size={24} />}
                    change={{
                      value: Math.round(stats.checkInRate),
                      label: 'taxa',
                    }}
                  />
                </>
              )}
            </div>

            {/* Scanner Card */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-accent">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItMnptMCAwdi0yaDJ2MnptMCAwaDJ2LTJoLTJ6bTAtMmgtMnYyaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
              <div className="relative z-10 text-center py-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mb-4">
                  <ScanLine size={40} className="text-white" />
                </div>
                <h2 className="text-2xl font-display font-bold text-white mb-2">
                  Leia o QR Code ou digite o código
                </h2>
                <p className="text-white/80 mb-8">
                  Posicione o leitor de código de barras ou insira o código manualmente
                </p>
                <div className="max-w-md mx-auto">
                  <div className="relative">
                    <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[hsl(var(--foreground-muted))]" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Código do bilhete..."
                      className="w-full pl-12 pr-4 py-4 text-lg border-0 rounded-lg focus:ring-2 focus:ring-white shadow-lg text-[hsl(var(--foreground))] bg-white"
                      autoFocus
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    isLoading={isSearching}
                    className="mt-4 w-full bg-white text-brand-primary hover:bg-white/90"
                    size="lg"
                  >
                    <CheckCircle className="mr-2" size={20} />
                    Validar Bilhete
                  </Button>
                </div>
              </div>
              <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-brand-accent/20 rounded-full blur-2xl" />
            </Card>

            {/* Recent Check-ins */}
            {stats.recentCheckIns.length > 0 && (
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                    Check-ins Recentes
                  </h3>
                  <span className="text-sm text-[hsl(var(--foreground-secondary))]">
                    Últimos {stats.recentCheckIns.length}
                  </span>
                </div>
                <div className="divide-y divide-[hsl(var(--border-color))]">
                  {stats.recentCheckIns.map((checkIn, index) => (
                    <div
                      key={`${checkIn.id}-${index}`}
                      className="py-3 flex items-center justify-between hover:bg-[hsl(var(--background-tertiary))] -mx-4 px-4 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-success/10">
                          <CheckCircle size={20} className="text-success" />
                        </div>
                        <div>
                          <p className="font-medium text-[hsl(var(--foreground))]">
                            {checkIn.buyerName || 'Sem nome'}
                          </p>
                          <p className="text-sm text-[hsl(var(--foreground-secondary))]">
                            {checkIn.ticketTypeName} • {checkIn.qrCode.slice(0, 12)}...
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <StatusBadge status="used" />
                        <p className="text-xs text-[hsl(var(--foreground-muted))] mt-1">
                          {checkIn.checkedInAt.toLocaleTimeString('pt-PT', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}

        {/* No Events */}
        {!eventsLoading && activeEvents.length === 0 && (
          <Card className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[hsl(var(--background-tertiary))] mb-4">
              <QrCode size={40} className="text-[hsl(var(--foreground-muted))]" />
            </div>
            <h3 className="text-lg font-medium text-[hsl(var(--foreground))] mb-2">
              Nenhum evento ativo
            </h3>
            <p className="text-[hsl(var(--foreground-secondary))]">
              Publique um evento para começar a fazer check-in dos participantes.
            </p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
