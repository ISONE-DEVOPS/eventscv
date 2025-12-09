'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import EventForm from '../../../../components/events/EventForm';
import {
  getEvent,
  getTicketTypes,
  updateEvent,
  type Event,
  type EventFormData,
} from '../../../../lib/services/events';

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // Merge ticket types into event data for the form
      setEvent({
        ...eventData,
        ticketTypes: ticketTypesData,
      } as Event);
    } catch (error) {
      console.error('Error loading event:', error);
      router.push('/events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: EventFormData) => {
    setIsSaving(true);
    setError(null);

    try {
      await updateEvent(eventId, data);
      router.push(`/events/${eventId}`);
    } catch (err) {
      console.error('Error updating event:', err);
      setError('Erro ao atualizar evento. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded-lg" />
          <div className="h-48 bg-gray-200 rounded-lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!event) {
    return null;
  }

  // Convert event to form data format
  const initialData: Partial<EventFormData> = {
    name: event.name,
    description: event.description,
    category: event.category,
    tags: event.tags,
    startDate: event.startDate,
    endDate: event.endDate,
    venue: event.venue,
    coverImage: event.coverImage,
    isPublic: event.isPublic,
    settings: event.settings,
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Editar Evento</h1>
          <p className="text-gray-500">Atualize os detalhes do evento</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <EventForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isLoading={isSaving}
        />
      </div>
    </DashboardLayout>
  );
}
