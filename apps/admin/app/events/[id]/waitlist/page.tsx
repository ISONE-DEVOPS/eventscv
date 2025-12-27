'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Users,
  Mail,
  MessageSquare,
  Bell,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Send,
  RefreshCcw,
} from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { getFunctions, httpsCallable } from 'firebase/functions';

type WaitlistStatus = 'active' | 'notified' | 'converted' | 'expired' | 'cancelled';
type WaitlistPriority = 'low' | 'normal' | 'high' | 'vip';

interface WaitlistEntry {
  id: string;
  eventId: string;
  ticketTypeId?: string;
  userId: string;
  userEmail: string;
  userName?: string;
  userPhone?: string;
  status: WaitlistStatus;
  priority: WaitlistPriority;
  position: number;
  quantity: number;
  maxPrice?: number;
  autoConvert?: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  notifiedAt?: Date;
  notificationsSent: number;
  convertedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

interface WaitlistStats {
  totalActive: number;
  totalNotified: number;
  totalConverted: number;
  conversionRate: number;
  averageWaitTime: number; // hours
  byTicketType: {
    ticketTypeId: string;
    ticketTypeName: string;
    activeCount: number;
    convertedCount: number;
  }[];
}

export default function EventWaitlistPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [stats, setStats] = useState<WaitlistStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());

  const loadWaitlist = async () => {
    try {
      const functions = getFunctions();
      const getUserWaitlists = httpsCallable(functions, 'getUserWaitlists');

      // Get waitlist entries for this event
      const result = await getUserWaitlists({ eventId });
      const entries = (result.data as any).waitlists || [];

      setWaitlistEntries(entries);

      // Calculate stats
      const activeEntries = entries.filter((e: WaitlistEntry) => e.status === 'active');
      const notifiedEntries = entries.filter((e: WaitlistEntry) => e.status === 'notified');
      const convertedEntries = entries.filter((e: WaitlistEntry) => e.status === 'converted');

      const statsData: WaitlistStats = {
        totalActive: activeEntries.length,
        totalNotified: notifiedEntries.length,
        totalConverted: convertedEntries.length,
        conversionRate:
          entries.length > 0 ? (convertedEntries.length / entries.length) * 100 : 0,
        averageWaitTime: 24, // TODO: Calculate from actual data
        byTicketType: [], // TODO: Group by ticket type
      };

      setStats(statsData);
      setLoading(false);
      setError(null);
    } catch (err: any) {
      console.error('Error loading waitlist:', err);
      setError(err.message || 'Failed to load waitlist');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWaitlist();
  }, [eventId]);

  const getStatusColor = (status: WaitlistStatus) => {
    switch (status) {
      case 'active':
        return 'text-brand-primary';
      case 'notified':
        return 'text-warning';
      case 'converted':
        return 'text-success';
      case 'expired':
      case 'cancelled':
        return 'text-zinc-500';
      default:
        return 'text-zinc-400';
    }
  };

  const getStatusIcon = (status: WaitlistStatus) => {
    switch (status) {
      case 'active':
        return <Clock className="w-4 h-4" />;
      case 'notified':
        return <Bell className="w-4 h-4" />;
      case 'converted':
        return <CheckCircle className="w-4 h-4" />;
      case 'expired':
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: WaitlistStatus) => {
    const labels: Record<WaitlistStatus, string> = {
      active: 'Activo',
      notified: 'Notificado',
      converted: 'Convertido',
      expired: 'Expirado',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority: WaitlistPriority) => {
    switch (priority) {
      case 'vip':
        return 'text-brand-secondary';
      case 'high':
        return 'text-warning';
      case 'normal':
        return 'text-zinc-400';
      case 'low':
        return 'text-zinc-600';
    }
  };

  const getPriorityLabel = (priority: WaitlistPriority) => {
    const labels: Record<WaitlistPriority, string> = {
      vip: 'VIP',
      high: 'Alta',
      normal: 'Normal',
      low: 'Baixa',
    };
    return labels[priority] || priority;
  };

  const handleNotifySelected = async () => {
    if (selectedEntries.size === 0) {
      alert('Seleccione pelo menos uma entrada da waitlist');
      return;
    }

    const ticketsAvailable = prompt(
      `Quantos bilhetes estão disponíveis? (${selectedEntries.size} pessoas seleccionadas)`
    );
    if (!ticketsAvailable) return;

    try {
      const functions = getFunctions();
      const notifyWaitlist = httpsCallable(functions, 'notifyWaitlist');

      await notifyWaitlist({
        eventId,
        ticketsAvailable: parseInt(ticketsAvailable),
      });

      alert(`${selectedEntries.size} pessoas notificadas com sucesso!`);
      setSelectedEntries(new Set());
      await loadWaitlist();
    } catch (err: any) {
      alert('Erro ao notificar waitlist: ' + err.message);
    }
  };

  const handleToggleSelection = (entryId: string) => {
    const newSelection = new Set(selectedEntries);
    if (newSelection.has(entryId)) {
      newSelection.delete(entryId);
    } else {
      newSelection.add(entryId);
    }
    setSelectedEntries(newSelection);
  };

  const handleSelectAll = () => {
    const activeEntries = waitlistEntries.filter((e) => e.status === 'active');
    if (selectedEntries.size === activeEntries.length) {
      setSelectedEntries(new Set());
    } else {
      setSelectedEntries(new Set(activeEntries.map((e) => e.id)));
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Lista de Espera">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <RefreshCcw className="w-8 h-8 text-brand-primary animate-spin" />
            <p className="text-zinc-400">A carregar lista de espera...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Lista de Espera">
        <div className="card">
          <div className="card-body text-center">
            <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              Erro ao carregar lista de espera
            </h3>
            <p className="text-zinc-400 mb-4">{error}</p>
            <button onClick={loadWaitlist} className="btn btn-primary">
              Tentar novamente
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Lista de Espera"
      actions={
        <div className="flex items-center gap-2">
          {selectedEntries.size > 0 && (
            <button onClick={handleNotifySelected} className="btn btn-primary btn-sm">
              <Send className="w-4 h-4" />
              Notificar {selectedEntries.size} seleccionados
            </button>
          )}
          <button onClick={loadWaitlist} className="btn btn-ghost btn-sm">
            <RefreshCcw className="w-4 h-4" />
            Actualizar
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="stat-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="stat-card-value">{formatNumber(stats.totalActive)}</p>
                  <p className="stat-card-label">Activos</p>
                  <p className="text-xs text-zinc-500 mt-1">A aguardar bilhetes</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                  <Clock size={24} className="text-brand-primary" />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="stat-card-value">{formatNumber(stats.totalNotified)}</p>
                  <p className="stat-card-label">Notificados</p>
                  <p className="text-xs text-zinc-500 mt-1">Aguardam conversão</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Bell size={24} className="text-warning" />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="stat-card-value">{formatNumber(stats.totalConverted)}</p>
                  <p className="stat-card-label">Convertidos</p>
                  <p className="text-xs text-zinc-500 mt-1">Compraram bilhetes</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <CheckCircle size={24} className="text-success" />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="stat-card-value">{stats.conversionRate.toFixed(1)}%</p>
                  <p className="stat-card-label">Taxa de Conversão</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {stats.averageWaitTime}h tempo médio
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-brand-secondary/10 flex items-center justify-center">
                  <TrendingUp size={24} className="text-brand-secondary" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Waitlist Entries */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Entradas na Lista de Espera</h2>
            {waitlistEntries.filter((e) => e.status === 'active').length > 0 && (
              <button onClick={handleSelectAll} className="btn btn-ghost btn-sm">
                {selectedEntries.size ===
                waitlistEntries.filter((e) => e.status === 'active').length
                  ? 'Desmarcar todos'
                  : 'Seleccionar todos'}
              </button>
            )}
          </div>

          {waitlistEntries.length === 0 ? (
            <div className="card-body text-center py-12">
              <Users className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                Nenhuma entrada na lista de espera
              </h3>
              <p className="text-zinc-400">
                Quando o evento estiver esgotado, os utilizadores podem juntar-se à lista de
                espera.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left p-4 text-sm font-medium text-zinc-400">
                      <input
                        type="checkbox"
                        checked={
                          selectedEntries.size > 0 &&
                          selectedEntries.size ===
                            waitlistEntries.filter((e) => e.status === 'active').length
                        }
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-zinc-400">Posição</th>
                    <th className="text-left p-4 text-sm font-medium text-zinc-400">
                      Utilizador
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-zinc-400">
                      Quantidade
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-zinc-400">
                      Prioridade
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-zinc-400">Estado</th>
                    <th className="text-left p-4 text-sm font-medium text-zinc-400">
                      Notificações
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-zinc-400">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {waitlistEntries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="p-4">
                        {entry.status === 'active' && (
                          <input
                            type="checkbox"
                            checked={selectedEntries.has(entry.id)}
                            onChange={() => handleToggleSelection(entry.id)}
                            className="rounded"
                          />
                        )}
                      </td>
                      <td className="p-4">
                        <span className="text-white font-medium">#{entry.position}</span>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-white font-medium">
                            {entry.userName || 'Utilizador'}
                          </p>
                          <p className="text-sm text-zinc-500">{entry.userEmail}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-white">
                          {entry.quantity} {entry.quantity === 1 ? 'bilhete' : 'bilhetes'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`font-medium ${getPriorityColor(entry.priority)}`}>
                          {getPriorityLabel(entry.priority)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className={`flex items-center gap-2 ${getStatusColor(entry.status)}`}>
                          {getStatusIcon(entry.status)}
                          <span>{getStatusLabel(entry.status)}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          {entry.emailNotifications && (
                            <Mail className="w-4 h-4 text-zinc-400" title="Email" />
                          )}
                          {entry.smsNotifications && (
                            <MessageSquare className="w-4 h-4 text-zinc-400" title="SMS" />
                          )}
                          {entry.pushNotifications && (
                            <Bell className="w-4 h-4 text-zinc-400" title="Push" />
                          )}
                        </div>
                        {entry.notificationsSent > 0 && (
                          <p className="text-xs text-zinc-500 mt-1">
                            {entry.notificationsSent} enviadas
                          </p>
                        )}
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-zinc-400">
                          {new Date(entry.createdAt).toLocaleDateString('pt-CV')}
                        </p>
                        {entry.convertedAt && (
                          <p className="text-xs text-success">
                            Convertido{' '}
                            {new Date(entry.convertedAt).toLocaleDateString('pt-CV')}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
