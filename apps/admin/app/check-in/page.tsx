'use client';

import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button, Card, StatCard, StatusBadge, Input, Select, AlertModal } from '../../components/ui';
import { getEvents, type Event } from '../../lib/services/events';
import {
  getTicketByQRCode,
  checkInTicket,
  cancelCheckIn,
  type Ticket,
} from '../../lib/services/tickets';
import { useAuthStore } from '@/stores/authStore';
import {
  QrCode,
  CheckCircle,
  XCircle,
  Users,
  Ticket as TicketIcon,
  RefreshCw,
  Search,
} from 'lucide-react';

interface CheckInResult {
  success: boolean;
  ticket?: Ticket;
  message: string;
}

interface RecentCheckIn {
  ticket: Ticket;
  timestamp: Date;
  status: 'success' | 'error' | 'already_used';
}

export default function CheckInPage() {
  const { user, claims } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Search/Scan
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null);

  // Recent check-ins
  const [recentCheckIns, setRecentCheckIns] = useState<RecentCheckIn[]>([]);

  // Stats
  const [checkInCount, setCheckInCount] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);

  // Alert
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning'>('success');
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadEvents();
  }, [claims]);

  useEffect(() => {
    if (selectedEventId) {
      const event = events.find((e) => e.id === selectedEventId);
      setSelectedEvent(event || null);
      setCheckInCount(event?.checkIns || 0);
      setTotalTickets(event?.ticketsSold || 0);
    }
  }, [selectedEventId, events]);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, [selectedEventId]);

  const loadEvents = async () => {
    if (!claims?.organizationId) return;

    setIsLoading(true);
    try {
      const result = await getEvents(
        claims.organizationId,
        { status: 'published' },
        { pageSize: 50 }
      );
      setEvents(result.events);

      // Auto-select if only one event
      if (result.events.length === 1) {
        setSelectedEventId(result.events[0].id);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !selectedEventId) return;

    setIsSearching(true);
    setLastResult(null);

    try {
      // Try to find ticket by QR code
      const ticket = await getTicketByQRCode(selectedEventId, searchQuery.trim());

      if (!ticket) {
        showAlert('error', 'Bilhete Não Encontrado', 'O código inserido não corresponde a nenhum bilhete.');
        setLastResult({ success: false, message: 'Bilhete não encontrado' });
        return;
      }

      // Check if ticket is for this event
      if (ticket.eventId !== selectedEventId) {
        showAlert('error', 'Evento Errado', `Este bilhete é para o evento "${ticket.eventName}".`);
        setLastResult({
          success: false,
          ticket,
          message: 'Bilhete para evento diferente',
        });
        return;
      }

      // Check ticket status
      if (ticket.status === 'used') {
        showAlert('warning', 'Já Utilizado', `Este bilhete já foi utilizado em ${ticket.checkedInAt?.toLocaleString('pt-PT')}.`);
        setLastResult({
          success: false,
          ticket,
          message: 'Bilhete já utilizado',
        });
        addRecentCheckIn(ticket, 'already_used');
        return;
      }

      if (ticket.status === 'cancelled' || ticket.status === 'refunded') {
        showAlert('error', 'Bilhete Inválido', `Este bilhete foi ${ticket.status === 'cancelled' ? 'cancelado' : 'reembolsado'}.`);
        setLastResult({
          success: false,
          ticket,
          message: `Bilhete ${ticket.status === 'cancelled' ? 'cancelado' : 'reembolsado'}`,
        });
        return;
      }

      // Do check-in
      await checkInTicket(selectedEventId, ticket.id, user?.uid || 'admin');

      showAlert('success', 'Check-in Realizado!', `${ticket.buyerName || 'Participante'} - ${ticket.ticketTypeName}`);
      setLastResult({
        success: true,
        ticket,
        message: 'Check-in realizado com sucesso',
      });

      addRecentCheckIn(ticket, 'success');
      setCheckInCount((prev) => prev + 1);
    } catch (error) {
      console.error('Check-in error:', error);
      showAlert('error', 'Erro', 'Ocorreu um erro ao processar o check-in.');
      setLastResult({ success: false, message: 'Erro ao processar' });
    } finally {
      setIsSearching(false);
      setSearchQuery('');
      inputRef.current?.focus();
    }
  };

  const showAlert = (type: 'success' | 'error' | 'warning', title: string, message: string) => {
    setAlertType(type);
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertOpen(true);

    // Auto-close after 3 seconds
    setTimeout(() => setAlertOpen(false), 3000);
  };

  const addRecentCheckIn = (ticket: Ticket, status: 'success' | 'error' | 'already_used') => {
    setRecentCheckIns((prev) => [
      { ticket, timestamp: new Date(), status },
      ...prev.slice(0, 9), // Keep last 10
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const checkInRate = totalTickets > 0 ? ((checkInCount / totalTickets) * 100).toFixed(1) : '0';

  const eventOptions = events.map((event) => ({
    value: event.id,
    label: `${event.title} - ${event.startDate.toLocaleDateString('pt-PT')}`,
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Check-in</h1>
            <p className="text-gray-500">Valide os bilhetes dos participantes</p>
          </div>
          <Button
            variant="outline"
            onClick={loadEvents}
            leftIcon={<RefreshCw size={20} />}
          >
            Atualizar
          </Button>
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
              <StatCard
                title="Check-ins Realizados"
                value={checkInCount.toLocaleString('pt-PT')}
                icon={<CheckCircle size={24} />}
              />
              <StatCard
                title="Total de Bilhetes"
                value={totalTickets.toLocaleString('pt-PT')}
                icon={<TicketIcon size={24} />}
              />
              <StatCard
                title="Taxa de Check-in"
                value={`${checkInRate}%`}
                icon={<Users size={24} />}
              />
            </div>

            {/* Scanner Input */}
            <Card className="bg-gradient-to-r from-purple-600 to-purple-800">
              <div className="text-center py-8">
                <QrCode size={64} className="text-white mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">
                  Leia o QR Code ou digite o código
                </h2>
                <p className="text-purple-200 mb-6">
                  Posicione o leitor de código de barras ou insira o código manualmente
                </p>
                <div className="max-w-md mx-auto">
                  <div className="relative">
                    <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Código do bilhete..."
                      className="w-full pl-12 pr-4 py-4 text-lg border-0 rounded-lg focus:ring-2 focus:ring-white shadow-lg"
                      autoFocus
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    isLoading={isSearching}
                    className="mt-4 w-full"
                    size="lg"
                  >
                    Validar Bilhete
                  </Button>
                </div>
              </div>
            </Card>

            {/* Last Result */}
            {lastResult && (
              <Card
                className={`${
                  lastResult.success
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                } border-2`}
              >
                <div className="flex items-center gap-4">
                  {lastResult.success ? (
                    <CheckCircle size={48} className="text-green-500" />
                  ) : (
                    <XCircle size={48} className="text-red-500" />
                  )}
                  <div>
                    <p
                      className={`text-lg font-bold ${
                        lastResult.success ? 'text-green-800' : 'text-red-800'
                      }`}
                    >
                      {lastResult.message}
                    </p>
                    {lastResult.ticket && (
                      <p className="text-gray-600">
                        {lastResult.ticket.buyerName || 'Sem nome'} •{' '}
                        {lastResult.ticket.ticketTypeName}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Recent Check-ins */}
            {recentCheckIns.length > 0 && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Check-ins Recentes
                </h3>
                <div className="divide-y divide-gray-200">
                  {recentCheckIns.map((checkIn, index) => (
                    <div
                      key={`${checkIn.ticket.id}-${index}`}
                      className="py-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        {checkIn.status === 'success' ? (
                          <CheckCircle size={20} className="text-green-500" />
                        ) : checkIn.status === 'already_used' ? (
                          <XCircle size={20} className="text-yellow-500" />
                        ) : (
                          <XCircle size={20} className="text-red-500" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {checkIn.ticket.buyerName || 'Sem nome'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {checkIn.ticket.ticketTypeName} •{' '}
                            {checkIn.ticket.qrCode.slice(0, 12)}...
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <StatusBadge
                          status={
                            checkIn.status === 'success'
                              ? 'used'
                              : checkIn.status === 'already_used'
                              ? 'used'
                              : 'cancelled'
                          }
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          {checkIn.timestamp.toLocaleTimeString('pt-PT', {
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
        {!isLoading && events.length === 0 && (
          <Card className="text-center py-12">
            <QrCode size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum evento ativo
            </h3>
            <p className="text-gray-500">
              Publique um evento para começar a fazer check-in dos participantes.
            </p>
          </Card>
        )}
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
      />
    </DashboardLayout>
  );
}
