'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Mail,
  MessageSquare,
  Bell,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Eye,
  Trash2,
  Users,
  TrendingUp,
} from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { getFunctions, httpsCallable } from 'firebase/functions';

type BlastChannel = 'email' | 'sms' | 'push';
type BlastStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled' | 'failed';
type BlastType = 'announcement' | 'reminder' | 'update' | 'promotion' | 'last_call';

interface EventBlast {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  type: BlastType;
  channels: BlastChannel[];
  status: BlastStatus;
  recipientCount?: number;
  schedule: {
    sendAt: Date;
    sendImmediately?: boolean;
  };
  deliveryStats?: {
    totalRecipients: number;
    totalSent: number;
    totalFailed: number;
    totalPending: number;
    openRate?: number;
    clickRate?: number;
  };
  createdAt: Date;
  sentAt?: Date;
}

export default function EventBlastsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [blasts, setBlasts] = useState<EventBlast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBlasts = async () => {
    try {
      const functions = getFunctions();
      const getEventBlasts = httpsCallable(functions, 'getEventBlasts');

      const result = await getEventBlasts({ eventId });
      const blastsData = (result.data as any).blasts || [];

      setBlasts(blastsData);
      setLoading(false);
      setError(null);
    } catch (err: any) {
      console.error('Error loading blasts:', err);
      setError(err.message || 'Failed to load blasts');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlasts();
  }, [eventId]);

  const getStatusColor = (status: BlastStatus) => {
    switch (status) {
      case 'sent':
        return 'text-success';
      case 'sending':
        return 'text-brand-primary';
      case 'scheduled':
        return 'text-brand-secondary';
      case 'draft':
        return 'text-zinc-500';
      case 'cancelled':
      case 'failed':
        return 'text-error';
      default:
        return 'text-zinc-400';
    }
  };

  const getStatusIcon = (status: BlastStatus) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-5 h-5" />;
      case 'sending':
        return <Send className="w-5 h-5 animate-pulse" />;
      case 'scheduled':
        return <Clock className="w-5 h-5" />;
      case 'draft':
        return <Mail className="w-5 h-5" />;
      case 'cancelled':
      case 'failed':
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getChannelIcon = (channel: BlastChannel) => {
    switch (channel) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'sms':
        return <MessageSquare className="w-4 h-4" />;
      case 'push':
        return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: BlastType) => {
    const labels: Record<BlastType, string> = {
      announcement: 'Anúncio',
      reminder: 'Lembrete',
      update: 'Actualização',
      promotion: 'Promoção',
      last_call: 'Última Chamada',
    };
    return labels[type] || type;
  };

  const handleCancelBlast = async (blastId: string) => {
    if (!confirm('Tem a certeza que deseja cancelar este blast?')) return;

    try {
      const functions = getFunctions();
      const cancelBlast = httpsCallable(functions, 'cancelBlast');

      await cancelBlast({ blastId, reason: 'Cancelled by organizer' });
      await loadBlasts();
    } catch (err: any) {
      alert('Erro ao cancelar blast: ' + err.message);
    }
  };

  const handleSendTestBlast = async (blastId: string) => {
    const email = prompt('Introduza o email de teste:');
    if (!email) return;

    try {
      const functions = getFunctions();
      const sendTestBlast = httpsCallable(functions, 'sendTestBlast');

      await sendTestBlast({
        blastId,
        testRecipients: [{ email }],
      });

      alert('Blast de teste enviado com sucesso!');
    } catch (err: any) {
      alert('Erro ao enviar blast de teste: ' + err.message);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Mensagens">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <Send className="w-8 h-8 text-brand-primary animate-spin" />
            <p className="text-zinc-400">A carregar mensagens...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Mensagens">
        <div className="card">
          <div className="card-body text-center">
            <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Erro ao carregar mensagens</h3>
            <p className="text-zinc-400 mb-4">{error}</p>
            <button onClick={loadBlasts} className="btn btn-primary">
              Tentar novamente
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate summary stats
  const totalSent = blasts.reduce((sum, b) => sum + (b.deliveryStats?.totalSent || 0), 0);
  const totalRecipients = blasts.reduce((sum, b) => sum + (b.recipientCount || 0), 0);
  const avgOpenRate =
    blasts.filter((b) => b.deliveryStats?.openRate).length > 0
      ? blasts.reduce((sum, b) => sum + (b.deliveryStats?.openRate || 0), 0) /
        blasts.filter((b) => b.deliveryStats?.openRate).length
      : 0;

  return (
    <DashboardLayout
      title="Mensagens Multi-Canal"
      actions={
        <button
          onClick={() => router.push(`/events/${eventId}/blasts/new`)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          Nova Mensagem
        </button>
      }
    >
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="stat-card-value">{blasts.length}</p>
                <p className="stat-card-label">Total de Blasts</p>
                <p className="text-xs text-zinc-500 mt-1">
                  {blasts.filter((b) => b.status === 'sent').length} enviados
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                <Send size={24} className="text-brand-primary" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="stat-card-value">{formatNumber(totalRecipients)}</p>
                <p className="stat-card-label">Total Destinatários</p>
                <p className="text-xs text-zinc-500 mt-1">
                  {formatNumber(totalSent)} mensagens enviadas
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Users size={24} className="text-success" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="stat-card-value">{avgOpenRate.toFixed(1)}%</p>
                <p className="stat-card-label">Taxa de Abertura</p>
                <p className="text-xs text-zinc-500 mt-1">Média de emails</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-brand-secondary/10 flex items-center justify-center">
                <TrendingUp size={24} className="text-brand-secondary" />
              </div>
            </div>
          </div>
        </div>

        {/* Blasts List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Todas as Mensagens</h2>
          </div>

          {blasts.length === 0 ? (
            <div className="card-body text-center py-12">
              <Send className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                Nenhuma mensagem criada
              </h3>
              <p className="text-zinc-400 mb-6">
                Comece a comunicar com os participantes do seu evento.
              </p>
              <button
                onClick={() => router.push(`/events/${eventId}/blasts/new`)}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4" />
                Criar Primeira Mensagem
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {blasts.map((blast) => (
                <div
                  key={blast.id}
                  className="p-6 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Blast Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={getStatusColor(blast.status)}>
                          {getStatusIcon(blast.status)}
                        </div>
                        <h3 className="font-medium text-white">{blast.name}</h3>
                        <span className="badge badge-sm">
                          {getTypeLabel(blast.type)}
                        </span>
                      </div>

                      {blast.description && (
                        <p className="text-sm text-zinc-400 mb-3">
                          {blast.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
                        {/* Channels */}
                        <div className="flex items-center gap-2">
                          <span>Canais:</span>
                          <div className="flex gap-1">
                            {blast.channels.map((channel) => (
                              <div
                                key={channel}
                                className="flex items-center gap-1 px-2 py-1 rounded bg-background-secondary"
                              >
                                {getChannelIcon(channel)}
                                <span className="text-xs capitalize">{channel}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Recipients */}
                        {blast.recipientCount && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{formatNumber(blast.recipientCount)} destinatários</span>
                          </div>
                        )}

                        {/* Schedule */}
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {blast.schedule.sendImmediately
                              ? 'Imediato'
                              : new Date(blast.schedule.sendAt).toLocaleString('pt-CV', {
                                  dateStyle: 'short',
                                  timeStyle: 'short',
                                })}
                          </span>
                        </div>
                      </div>

                      {/* Delivery Stats */}
                      {blast.deliveryStats && blast.status === 'sent' && (
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-background-secondary">
                          <div>
                            <p className="text-xs text-zinc-500">Enviados</p>
                            <p className="text-lg font-medium text-white">
                              {formatNumber(blast.deliveryStats.totalSent)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500">Falhados</p>
                            <p className="text-lg font-medium text-error">
                              {formatNumber(blast.deliveryStats.totalFailed)}
                            </p>
                          </div>
                          {blast.deliveryStats.openRate !== undefined && (
                            <div>
                              <p className="text-xs text-zinc-500">Taxa Abertura</p>
                              <p className="text-lg font-medium text-success">
                                {blast.deliveryStats.openRate.toFixed(1)}%
                              </p>
                            </div>
                          )}
                          {blast.deliveryStats.clickRate !== undefined && (
                            <div>
                              <p className="text-xs text-zinc-500">Taxa Clique</p>
                              <p className="text-lg font-medium text-brand-primary">
                                {blast.deliveryStats.clickRate.toFixed(1)}%
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {(blast.status === 'draft' || blast.status === 'scheduled') && (
                        <>
                          <button
                            onClick={() => handleSendTestBlast(blast.id)}
                            className="btn btn-ghost btn-sm"
                            title="Enviar teste"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCancelBlast(blast.id)}
                            className="btn btn-ghost btn-sm text-error"
                            title="Cancelar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {blast.status === 'sent' && (
                        <button
                          onClick={() =>
                            router.push(`/events/${eventId}/blasts/${blast.id}`)
                          }
                          className="btn btn-ghost btn-sm"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
