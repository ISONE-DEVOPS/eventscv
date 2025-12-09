'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import EventForm from '../../../components/events/EventForm';
import { createEvent, type EventFormData } from '../../../lib/services/events';
import { useAuthStore } from '../../../lib/store/auth';

export default function CreateEventPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: EventFormData) => {
    if (!user?.organizationId) {
      setError('Organização não encontrada');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const eventId = await createEvent(user.organizationId, data);
      router.push(`/events/${eventId}`);
    } catch (err) {
      console.error('Error creating event:', err);
      setError('Erro ao criar evento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Criar Novo Evento</h1>
          <p className="text-gray-500">Preencha os detalhes do seu evento</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <EventForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </DashboardLayout>
  );
}
