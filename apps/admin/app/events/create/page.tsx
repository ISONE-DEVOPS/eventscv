'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import EventFormWizard from '../../../components/events/EventFormWizard';
import { createEvent, type EventFormData } from '../../../lib/services/events';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/contexts/ToastContext';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateEventPage() {
  const router = useRouter();
  const { claims, organization } = useAuthStore();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: EventFormData) => {
    if (!organization?.id) {
      showToast('error', 'Erro', 'Organização não encontrada');
      return;
    }

    setIsLoading(true);

    try {
      const eventId = await createEvent(organization.id, data);
      showToast('success', 'Evento Criado!', 'O evento foi criado com sucesso');
      router.push(`/events/${eventId}`);
    } catch (err) {
      console.error('Error creating event:', err);
      showToast('error', 'Erro ao Criar Evento', 'Tente novamente mais tarde');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-[hsl(var(--foreground-secondary))] hover:text-[hsl(var(--foreground))] transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Voltar aos Eventos</span>
          </Link>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-accent p-8 shadow-xl">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItMnptMCAwdi0yaDJ2MnptMCAwaDJ2LTJoLTJ6bTAtMmgtMnYyaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
            <div className="relative z-10">
              <h1 className="text-3xl font-display font-bold text-white mb-2">
                Criar Novo Evento
              </h1>
              <p className="text-white/90">
                Preencha os detalhes do seu evento passo a passo
              </p>
            </div>
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-brand-accent/20 rounded-full blur-2xl" />
          </div>
        </div>

        {/* Wizard Form */}
        <EventFormWizard onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </DashboardLayout>
  );
}
