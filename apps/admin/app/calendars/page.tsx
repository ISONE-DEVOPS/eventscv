'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar as CalendarIcon, Users, Eye, Lock, Link2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Calendar } from '@eventscv/shared-types';

export default function CalendarsPage() {
  const router = useRouter();
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string>('');

  useEffect(() => {
    // TODO: Get organizationId from auth context
    const mockOrgId = 'mock-org-id';
    setOrganizationId(mockOrgId);
    loadCalendars(mockOrgId);
  }, []);

  const loadCalendars = async (orgId: string) => {
    try {
      setIsLoading(true);

      const calendarsQuery = query(
        collection(db, 'calendars'),
        where('organizationId', '==', orgId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(calendarsQuery);

      const calendarsList: Calendar[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Calendar[];

      setCalendars(calendarsList);
    } catch (error) {
      console.error('Error loading calendars:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return <Eye className="w-4 h-4" />;
      case 'private':
        return <Lock className="w-4 h-4" />;
      case 'unlisted':
        return <Link2 className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'private':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'unlisted':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default:
        return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Calendários</h1>
            <p className="text-zinc-400">
              Crie e gerencie calendários de eventos para a sua comunidade
            </p>
          </div>
          <button
            onClick={() => router.push('/calendars/create')}
            className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-xl font-semibold text-white transition-colors"
          >
            <Plus className="w-5 h-5" />
            Criar Calendário
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-zinc-400">A carregar calendários...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && calendars.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarIcon className="w-10 h-10 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhum calendário criado
            </h3>
            <p className="text-zinc-400 mb-6 max-w-md mx-auto">
              Crie o seu primeiro calendário para organizar eventos recorrentes e construir uma
              comunidade
            </p>
            <button
              onClick={() => router.push('/calendars/create')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-xl font-semibold text-white transition-colors"
            >
              <Plus className="w-5 h-5" />
              Criar Primeiro Calendário
            </button>
          </div>
        )}

        {/* Calendars Grid */}
        {!isLoading && calendars.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {calendars.map((calendar) => (
              <div
                key={calendar.id}
                onClick={() => router.push(`/calendars/${calendar.id}`)}
                className="group bg-zinc-900 border border-white/10 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all cursor-pointer"
              >
                {/* Cover Image */}
                <div className="aspect-video bg-zinc-800 relative overflow-hidden">
                  {calendar.coverImage ? (
                    <img
                      src={calendar.coverImage}
                      alt={calendar.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <CalendarIcon className="w-16 h-16 text-zinc-700" />
                    </div>
                  )}

                  {/* Visibility Badge */}
                  <div className="absolute top-3 right-3">
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border backdrop-blur-sm ${getVisibilityColor(
                        calendar.visibility
                      )}`}
                    >
                      {getVisibilityIcon(calendar.visibility)}
                      <span className="text-xs font-medium capitalize">
                        {calendar.visibility}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-500 transition-colors">
                    {calendar.name}
                  </h3>
                  <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
                    {calendar.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <Users className="w-4 h-4" />
                      <span>{calendar.subscriberCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{calendar.eventCount || 0}</span>
                    </div>
                  </div>

                  {/* Membership Badge */}
                  {calendar.membershipEnabled && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                        <span className="text-xs font-medium text-purple-500">
                          Membership Ativa
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-12 p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <CalendarIcon className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-blue-500 mb-2">
                O que são Calendários?
              </h4>
              <p className="text-sm text-blue-400 mb-3">
                Calendários permitem-lhe criar séries de eventos recorrentes e construir uma
                comunidade de subscritores. Perfeito para:
              </p>
              <ul className="text-sm text-blue-400 space-y-1">
                <li>• Eventos semanais ou mensais (workshops, meetups, etc.)</li>
                <li>• Festivais e conferências anuais</li>
                <li>• Comunidades com membership paga</li>
                <li>• Newsletters automáticas para subscritores</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
