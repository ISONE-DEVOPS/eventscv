'use client';

import { useState } from 'react';
import { Image, Trash2, Plus } from 'lucide-react';
import { EventFormData } from '@/lib/services/events';

interface EventFormProps {
  initialData?: Partial<EventFormData>;
  onSubmit: (data: EventFormData) => void;
  isLoading?: boolean;
}

const CABO_VERDE_ISLANDS = [
  'Santiago',
  'São Vicente',
  'Santo Antão',
  'Fogo',
  'Sal',
  'Boa Vista',
  'Maio',
  'Brava',
  'São Nicolau',
];

const EVENT_CATEGORIES = [
  'Música',
  'Arte & Cultura',
  'Desporto',
  'Tecnologia',
  'Educação',
  'Negócios',
  'Entretenimento',
  'Gastronomia',
  'Outro',
];

export default function EventForm({ initialData, onSubmit, isLoading }: EventFormProps) {
  const [formData, setFormData] = useState<Partial<EventFormData>>({
    title: '',
    description: '',
    shortDescription: '',
    category: 'Música',
    startDate: new Date(),
    endDate: new Date(),
    location: {
      name: '',
      address: '',
      city: '',
      island: 'Santiago',
    },
    capacity: 1000,
    status: 'draft',
    isPublic: true,
    ...initialData,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as EventFormData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLocationChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        name: prev.location?.name || '',
        address: prev.location?.address || '',
        city: prev.location?.city || '',
        island: prev.location?.island || 'Santiago',
        [field]: value,
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Informação Básica</h2>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Título do Evento *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Descrição Curta
          </label>
          <input
            type="text"
            value={formData.shortDescription || ''}
            onChange={(e) => handleChange('shortDescription', e.target.value)}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            maxLength={200}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Descrição *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={6}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Categoria *
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            required
          >
            {EVENT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Data de Início *
            </label>
            <input
              type="datetime-local"
              value={formData.startDate ? new Date(formData.startDate).toISOString().slice(0, 16) : ''}
              onChange={(e) => handleChange('startDate', new Date(e.target.value))}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Data de Fim *
            </label>
            <input
              type="datetime-local"
              value={formData.endDate ? new Date(formData.endDate).toISOString().slice(0, 16) : ''}
              onChange={(e) => handleChange('endDate', new Date(e.target.value))}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
              required
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Localização</h2>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Nome do Local *
          </label>
          <input
            type="text"
            value={formData.location?.name || ''}
            onChange={(e) => handleLocationChange('name', e.target.value)}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Endereço *
          </label>
          <input
            type="text"
            value={formData.location?.address || ''}
            onChange={(e) => handleLocationChange('address', e.target.value)}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Cidade *
            </label>
            <input
              type="text"
              value={formData.location?.city || ''}
              onChange={(e) => handleLocationChange('city', e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Ilha *
            </label>
            <select
              value={formData.location?.island || 'Santiago'}
              onChange={(e) => handleLocationChange('island', e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
              required
            >
              {CABO_VERDE_ISLANDS.map((island) => (
                <option key={island} value={island}>
                  {island}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Event Settings */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Configurações</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Capacidade *
            </label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => handleChange('capacity', parseInt(e.target.value))}
              min={1}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Restrição de Idade
            </label>
            <input
              type="number"
              value={formData.ageRestriction || ''}
              onChange={(e) => handleChange('ageRestriction', e.target.value ? parseInt(e.target.value) : undefined)}
              min={0}
              max={99}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Status *
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            required
          >
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublic"
            checked={formData.isPublic}
            onChange={(e) => handleChange('isPublic', e.target.checked)}
            className="w-4 h-4 text-primary-600 bg-zinc-800 border-zinc-700 rounded focus:ring-primary-500"
          />
          <label htmlFor="isPublic" className="ml-2 text-sm font-medium text-zinc-300">
            Evento Público
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4 pt-6 border-t border-zinc-700">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'A guardar...' : 'Guardar Evento'}
        </button>
      </div>
    </form>
  );
}
