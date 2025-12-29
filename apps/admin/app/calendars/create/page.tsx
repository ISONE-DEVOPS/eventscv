'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar as CalendarIcon, Save, Loader2 } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import type { Calendar } from '@eventscv/shared-types';

export default function CreateCalendarPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    coverImage: '',
    bannerImage: '',
    visibility: 'public' as 'public' | 'private' | 'unlisted',
    settings: {
      allowMemberEvents: false,
      requireApproval: true,
      allowDiscussions: true,
      membershipRequired: false,
    },
    website: '',
    instagram: '',
    facebook: '',
    twitter: '',
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const createFn = httpsCallable<
        {
          organizationId: string;
          name: string;
          slug: string;
          description: string;
          coverImage?: string;
          bannerImage?: string;
          visibility: 'public' | 'private' | 'unlisted';
          settings?: Partial<Calendar['settings']>;
          website?: string;
          instagram?: string;
          facebook?: string;
          twitter?: string;
        },
        { calendarId: string; success: boolean }
      >(functions, 'createCalendar');

      const result = await createFn({
        organizationId: 'mock-org-id', // TODO: Get from auth context
        ...formData,
      });

      if (result.data.success) {
        router.push(`/calendars/${result.data.calendarId}`);
      }
    } catch (err: any) {
      console.error('Error creating calendar:', err);
      setError(err.message || 'Erro ao criar calendário. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Criar Calendário</h1>
            <p className="text-zinc-400 mt-1">
              Cria um calendário para organizar eventos recorrentes e construir uma comunidade
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Informação Básica</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Nome do Calendário *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Ex: Meetup de Tech Mindelo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  URL do Calendário *
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 text-sm">events.cv/calendars/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    className="flex-1 px-4 py-3 bg-zinc-800 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="meetup-tech-mindelo"
                    pattern="[a-z0-9-]+"
                    required
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Apenas letras minúsculas, números e hífens
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Descrição *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-zinc-800 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  placeholder="Descreve o propósito deste calendário..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Visibilidade
                </label>
                <select
                  value={formData.visibility}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      visibility: e.target.value as 'public' | 'private' | 'unlisted',
                    }))
                  }
                  className="w-full px-4 py-3 bg-zinc-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="public">Público - Visível para todos</option>
                  <option value="unlisted">Unlisted - Apenas com link</option>
                  <option value="private">Privado - Apenas para membros</option>
                </select>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Imagens</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Imagem de Capa (URL)
                </label>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, coverImage: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-zinc-800 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="https://..."
                />
                <p className="text-xs text-zinc-500 mt-1">Quadrada, mín. 400x400px</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Banner (URL)
                </label>
                <input
                  type="url"
                  value={formData.bannerImage}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bannerImage: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-zinc-800 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="https://..."
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Formato wide, mín. 1200x400px
                </p>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Configurações</h2>

            <div className="space-y-4">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={formData.settings.allowMemberEvents}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        allowMemberEvents: e.target.checked,
                      },
                    }))
                  }
                  className="mt-1 w-4 h-4 text-purple-500 bg-zinc-800 border-white/10 rounded focus:ring-purple-500"
                />
                <div>
                  <span className="text-white font-medium">Permitir submissão de eventos</span>
                  <p className="text-sm text-zinc-400 mt-1">
                    Membros podem submeter eventos para este calendário
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={formData.settings.requireApproval}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        requireApproval: e.target.checked,
                      },
                    }))
                  }
                  className="mt-1 w-4 h-4 text-purple-500 bg-zinc-800 border-white/10 rounded focus:ring-purple-500"
                />
                <div>
                  <span className="text-white font-medium">Aprovar eventos antes de publicar</span>
                  <p className="text-sm text-zinc-400 mt-1">
                    Eventos submetidos precisam de aprovação
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={formData.settings.allowDiscussions}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        allowDiscussions: e.target.checked,
                      },
                    }))
                  }
                  className="mt-1 w-4 h-4 text-purple-500 bg-zinc-800 border-white/10 rounded focus:ring-purple-500"
                />
                <div>
                  <span className="text-white font-medium">Permitir discussões</span>
                  <p className="text-sm text-zinc-400 mt-1">
                    Ativar fórum de discussão para a comunidade
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={formData.settings.membershipRequired}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        membershipRequired: e.target.checked,
                      },
                    }))
                  }
                  className="mt-1 w-4 h-4 text-purple-500 bg-zinc-800 border-white/10 rounded focus:ring-purple-500"
                />
                <div>
                  <span className="text-white font-medium">Membership obrigatória</span>
                  <p className="text-sm text-zinc-400 mt-1">
                    Apenas membros pagos podem subscrever
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Links Sociais</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, website: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-zinc-800 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Instagram</label>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500">@</span>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, instagram: e.target.value }))
                    }
                    className="flex-1 px-4 py-3 bg-zinc-800 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Facebook</label>
                <input
                  type="text"
                  value={formData.facebook}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, facebook: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-zinc-800 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="username or page"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Twitter/X</label>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500">@</span>
                  <input
                    type="text"
                    value={formData.twitter}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, twitter: e.target.value }))
                    }
                    className="flex-1 px-4 py-3 bg-zinc-800 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="username"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-xl font-semibold text-white transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-white transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  A criar...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Criar Calendário
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
