'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import {
  Button,
  Card,
  CardHeader,
  StatCard,
  StatusBadge,
  Badge,
  ConfirmModal,
} from '../../../components/ui';
import { SharePanel } from '../../../components/events/SharePanel';
import {
  getEvent,
  getTicketTypes,
  publishEvent,
  unpublishEvent,
  deleteEvent,
  type Event,
  type TicketType,
} from '../../../lib/services/events';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Globe,
  EyeOff,
  Calendar,
  MapPin,
  Ticket,
  DollarSign,
  Users,
  Clock,
  Share2,
  QrCode,
} from 'lucide-react';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sharePanelOpen, setSharePanelOpen] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const [eventData, ticketTypesData] = await Promise.all([
        getEvent(eventId),
        getTicketTypes(eventId),
      ]);

      if (!eventData) {
        router.push('/events');
        return;
      }

      setEvent(eventData);
      setTicketTypes(ticketTypesData);
    } catch (error) {
      console.error('Error loading event:', error);
      router.push('/events');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!event) return;

    setIsPublishing(true);
    try {
      if (event.status === 'published') {
        await unpublishEvent(eventId);
        setEvent({ ...event, status: 'draft' });
      } else {
        await publishEvent(eventId);
        setEvent({ ...event, status: 'published' });
      }
    } catch (error) {
      console.error('Error updating event status:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteEvent(eventId);
      router.push('/events');
    } catch (error) {
      console.error('Error deleting event:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded-lg" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!event) {
    return null;
  }

  const totalTickets = ticketTypes.reduce((sum, t) => sum + t.quantityTotal, 0);
  const totalSold = ticketTypes.reduce((sum, t) => sum + (t.quantitySold || 0), 0);
  const totalRevenue = ticketTypes.reduce(
    (sum, t) => sum + (t.quantitySold || 0) * t.price,
    0
  );
  const checkInRate = totalSold > 0 ? ((event.checkIns || 0) / totalSold) * 100 : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Link href="/events">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="h-5 w-5 text-gray-500" />
              </button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
                <StatusBadge status={event.status} />
              </div>
              <p className="text-gray-500 mt-1">
                {event.category && (
                  <Badge variant="default" size="sm">
                    {event.category}
                  </Badge>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handlePublish}
              isLoading={isPublishing}
              leftIcon={
                event.status === 'published' ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Globe className="h-5 w-5" />
                )
              }
            >
              {event.status === 'published' ? 'Despublicar' : 'Publicar'}
            </Button>
            <Link href={`/events/${eventId}/edit`}>
              <Button variant="secondary" leftIcon={<Pencil className="h-5 w-5" />}>
                Editar
              </Button>
            </Link>
            <Button
              variant="danger"
              onClick={() => setDeleteModalOpen(true)}
              leftIcon={<Trash2 className="h-5 w-5" />}
            >
              Eliminar
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Bilhetes Vendidos"
            value={`${totalSold} / ${totalTickets}`}
            icon={<Ticket className="h-6 w-6" />}
            change={{ value: 12.5, label: 'vs. semana passada' }}
          />
          <StatCard
            title="Receita Total"
            value={`${totalRevenue.toLocaleString('pt-PT')} CVE`}
            icon={<DollarSign className="h-6 w-6" />}
            change={{ value: 8.3, label: 'vs. semana passada' }}
          />
          <StatCard
            title="Check-ins"
            value={`${event.checkIns || 0}`}
            icon={<Users className="h-6 w-6" />}
            change={{ value: checkInRate, label: `${checkInRate.toFixed(1)}% taxa` }}
          />
          <StatCard
            title="Visualizações"
            value={event.views || 0}
            icon={<Globe className="h-6 w-6" />}
            change={{ value: 25.3, label: 'vs. semana passada' }}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Event Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cover Image */}
            {event.coverImage && (
              <Card padding="none">
                <img
                  src={event.coverImage}
                  alt={event.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </Card>
            )}

            {/* Description */}
            <Card>
              <CardHeader title="Descrição" />
              <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>

              {event.tags && event.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <Badge key={tag} variant="purple" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>

            {/* Ticket Types */}
            <Card>
              <CardHeader
                title="Tipos de Bilhetes"
                action={
                  <Link href={`/events/${eventId}/tickets`}>
                    <Button variant="ghost" size="sm">
                      Gerir Bilhetes
                    </Button>
                  </Link>
                }
              />
              <div className="space-y-4">
                {ticketTypes.map((ticket) => {
                  const soldPercentage =
                    ticket.quantityTotal > 0
                      ? ((ticket.quantitySold || 0) / ticket.quantityTotal) * 100
                      : 0;

                  return (
                    <div
                      key={ticket.id}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{ticket.name}</h4>
                          {ticket.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {ticket.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            {ticket.price.toLocaleString('pt-PT')} CVE
                          </p>
                          <p className="text-sm text-gray-500">
                            {ticket.quantitySold || 0} / {ticket.quantityTotal} vendidos
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${soldPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Date & Time */}
            <Card>
              <CardHeader title="Data e Hora" />
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {event.startDate.toLocaleDateString('pt-PT', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {event.startDate.toLocaleTimeString('pt-PT', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      -{' '}
                      {event.endDate.toLocaleTimeString('pt-PT', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader title="Local" />
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">{event.venue}</p>
                  {event.address && (
                    <p className="text-sm text-gray-500">{event.address}</p>
                  )}
                  <p className="text-sm text-gray-500">{event.city}</p>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader title="Ações Rápidas" />
              <div className="space-y-2">
                <Link href={`/events/${eventId}/check-in`} className="block">
                  <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg">
                    <QrCode className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">Iniciar Check-in</span>
                  </button>
                </Link>
                <Link href={`/events/${eventId}/orders`} className="block">
                  <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg">
                    <Ticket className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">Ver Encomendas</span>
                  </button>
                </Link>
                <button
                  onClick={() => setSharePanelOpen(true)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Share2 className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">Partilhar Evento</span>
                </button>
              </div>
            </Card>

            {/* Settings Summary */}
            <Card>
              <CardHeader title="Configurações" />
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Visibilidade</span>
                  <span className="text-gray-900">
                    {event.isPublic ? 'Público' : 'Privado'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Transferências</span>
                  <span className="text-gray-900">
                    {event.settings?.allowTransfers ? 'Permitido' : 'Não permitido'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Reembolsos</span>
                  <span className="text-gray-900">
                    {event.settings?.allowRefunds ? 'Permitido' : 'Não permitido'}
                  </span>
                </div>
                {event.settings?.ageRestriction > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Idade mínima</span>
                    <span className="text-gray-900">
                      {event.settings.ageRestriction}+ anos
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Evento"
        message={`Tem a certeza que deseja eliminar o evento "${event.title}"? Esta ação não pode ser desfeita e todos os bilhetes associados serão cancelados.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Share Panel Modal */}
      {event && (
        <SharePanel
          isOpen={sharePanelOpen}
          onClose={() => setSharePanelOpen(false)}
          event={event}
        />
      )}
    </DashboardLayout>
  );
}
