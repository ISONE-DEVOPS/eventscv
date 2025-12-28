'use client';

import { useState } from 'react';
import {
  Calendar,
  MapPin,
  Settings,
  Image as ImageIcon,
  Eye,
  ChevronRight,
  ChevronLeft,
  Check
} from 'lucide-react';
import { EventFormData } from '@/lib/services/events';

interface EventFormWizardProps {
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

const STEPS = [
  { id: 1, name: 'Informação Básica', icon: Calendar },
  { id: 2, name: 'Localização', icon: MapPin },
  { id: 3, name: 'Configurações', icon: Settings },
  { id: 4, name: 'Imagens', icon: ImageIcon },
  { id: 5, name: 'Revisão', icon: Eye },
];

export default function EventFormWizard({ initialData, onSubmit, isLoading }: EventFormWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
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
    capacity: 100,
    status: 'draft',
    isPublic: true,
    ageRestriction: undefined,
    coverImage: '',
    gallery: [],
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when field changes
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
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

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.title?.trim()) newErrors.title = 'Título é obrigatório';
        if (!formData.description?.trim()) newErrors.description = 'Descrição é obrigatória';
        if (!formData.category) newErrors.category = 'Categoria é obrigatória';
        if (!formData.startDate) newErrors.startDate = 'Data de início é obrigatória';
        if (!formData.endDate) newErrors.endDate = 'Data de fim é obrigatória';
        if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
          newErrors.endDate = 'Data de fim deve ser posterior à data de início';
        }
        break;
      case 2:
        if (!formData.location?.name?.trim()) newErrors.locationName = 'Nome do local é obrigatório';
        if (!formData.location?.address?.trim()) newErrors.locationAddress = 'Endereço é obrigatório';
        if (!formData.location?.city?.trim()) newErrors.locationCity = 'Cidade é obrigatória';
        break;
      case 3:
        if (!formData.capacity || formData.capacity < 1) newErrors.capacity = 'Capacidade deve ser pelo menos 1';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      onSubmit(formData as EventFormData);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Steps Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
                      ${isCurrent ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white scale-110' : ''}
                      ${isCompleted ? 'bg-success text-white' : ''}
                      ${!isCurrent && !isCompleted ? 'bg-[hsl(var(--background-tertiary))] text-[hsl(var(--foreground-muted))]' : ''}
                    `}
                  >
                    {isCompleted ? <Check size={20} /> : <Icon size={20} />}
                  </div>
                  <span className={`text-xs mt-2 text-center ${isCurrent ? 'text-[hsl(var(--foreground))] font-semibold' : 'text-[hsl(var(--foreground-secondary))]'}`}>
                    {step.name}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 ${isCompleted ? 'bg-success' : 'bg-[hsl(var(--border-color))]'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="card p-6">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-6">Informação Básica</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                Título do Evento *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className={`input ${errors.title ? 'border-error' : ''}`}
                placeholder="Ex: Festival de Música ao Vivo"
              />
              {errors.title && <p className="text-error text-xs mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                Descrição Curta
              </label>
              <input
                type="text"
                value={formData.shortDescription || ''}
                onChange={(e) => handleChange('shortDescription', e.target.value)}
                className="input"
                placeholder="Uma breve descrição do evento"
                maxLength={200}
              />
              <p className="text-xs text-[hsl(var(--foreground-muted))] mt-1">
                {formData.shortDescription?.length || 0}/200 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                Descrição Completa *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={6}
                className={`input ${errors.description ? 'border-error' : ''}`}
                placeholder="Descreva o evento em detalhe..."
              />
              {errors.description && <p className="text-error text-xs mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                Categoria *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="input"
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
                <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                  Data e Hora de Início *
                </label>
                <input
                  type="datetime-local"
                  value={formData.startDate ? new Date(formData.startDate).toISOString().slice(0, 16) : ''}
                  onChange={(e) => handleChange('startDate', new Date(e.target.value))}
                  className={`input ${errors.startDate ? 'border-error' : ''}`}
                />
                {errors.startDate && <p className="text-error text-xs mt-1">{errors.startDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                  Data e Hora de Fim *
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDate ? new Date(formData.endDate).toISOString().slice(0, 16) : ''}
                  onChange={(e) => handleChange('endDate', new Date(e.target.value))}
                  className={`input ${errors.endDate ? 'border-error' : ''}`}
                />
                {errors.endDate && <p className="text-error text-xs mt-1">{errors.endDate}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-6">Localização do Evento</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                Nome do Local *
              </label>
              <input
                type="text"
                value={formData.location?.name || ''}
                onChange={(e) => handleLocationChange('name', e.target.value)}
                className={`input ${errors.locationName ? 'border-error' : ''}`}
                placeholder="Ex: Centro Cultural Mindelo"
              />
              {errors.locationName && <p className="text-error text-xs mt-1">{errors.locationName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                Endereço Completo *
              </label>
              <input
                type="text"
                value={formData.location?.address || ''}
                onChange={(e) => handleLocationChange('address', e.target.value)}
                className={`input ${errors.locationAddress ? 'border-error' : ''}`}
                placeholder="Rua, número, bairro"
              />
              {errors.locationAddress && <p className="text-error text-xs mt-1">{errors.locationAddress}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                  Cidade *
                </label>
                <input
                  type="text"
                  value={formData.location?.city || ''}
                  onChange={(e) => handleLocationChange('city', e.target.value)}
                  className={`input ${errors.locationCity ? 'border-error' : ''}`}
                  placeholder="Ex: Mindelo"
                />
                {errors.locationCity && <p className="text-error text-xs mt-1">{errors.locationCity}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                  Ilha *
                </label>
                <select
                  value={formData.location?.island || 'Santiago'}
                  onChange={(e) => handleLocationChange('island', e.target.value)}
                  className="input"
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
        )}

        {/* Step 3: Settings */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-6">Configurações do Evento</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                  Capacidade Total *
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => handleChange('capacity', parseInt(e.target.value))}
                  min={1}
                  className={`input ${errors.capacity ? 'border-error' : ''}`}
                  placeholder="100"
                />
                {errors.capacity && <p className="text-error text-xs mt-1">{errors.capacity}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                  Restrição de Idade
                </label>
                <input
                  type="number"
                  value={formData.ageRestriction || ''}
                  onChange={(e) => handleChange('ageRestriction', e.target.value ? parseInt(e.target.value) : undefined)}
                  min={0}
                  max={99}
                  className="input"
                  placeholder="18"
                />
                <p className="text-xs text-[hsl(var(--foreground-muted))] mt-1">
                  Deixe em branco se não houver restrição
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                Estado do Evento *
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="input"
              >
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
              </select>
              <p className="text-xs text-[hsl(var(--foreground-muted))] mt-1">
                Eventos em rascunho não são visíveis ao público
              </p>
            </div>

            <div className="flex items-center gap-3 p-4 bg-[hsl(var(--background-secondary))] rounded-xl">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => handleChange('isPublic', e.target.checked)}
                className="w-5 h-5 rounded border-[hsl(var(--border-color))] text-brand-primary focus:ring-brand-primary"
              />
              <label htmlFor="isPublic" className="text-sm font-medium text-[hsl(var(--foreground))] cursor-pointer flex-1">
                Evento Público
                <p className="text-xs text-[hsl(var(--foreground-secondary))] mt-1 font-normal">
                  Eventos públicos aparecem na listagem geral
                </p>
              </label>
            </div>
          </div>
        )}

        {/* Step 4: Images */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-6">Imagens do Evento</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                Imagem de Capa
              </label>
              <div className="border-2 border-dashed border-[hsl(var(--border-color))] rounded-xl p-8 text-center hover:border-brand-primary transition-colors">
                <ImageIcon size={48} className="mx-auto text-[hsl(var(--foreground-muted))] mb-3" />
                <p className="text-sm text-[hsl(var(--foreground-secondary))] mb-2">
                  Arraste uma imagem ou clique para selecionar
                </p>
                <p className="text-xs text-[hsl(var(--foreground-muted))]">
                  Recomendado: 1920x1080px, PNG ou JPG
                </p>
                <input
                  type="text"
                  value={formData.coverImage || ''}
                  onChange={(e) => handleChange('coverImage', e.target.value)}
                  className="input mt-4"
                  placeholder="URL da imagem"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                Galeria de Imagens
              </label>
              <p className="text-xs text-[hsl(var(--foreground-muted))] mb-3">
                Adicione imagens adicionais do evento
              </p>
              <div className="text-center p-8 bg-[hsl(var(--background-secondary))] rounded-xl">
                <p className="text-sm text-[hsl(var(--foreground-secondary))]">
                  Funcionalidade de galeria em breve
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-6">Revise os Detalhes</h3>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-[hsl(var(--background-secondary))] rounded-xl">
                <h4 className="font-semibold text-[hsl(var(--foreground))] mb-3">Informação Básica</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[hsl(var(--foreground-secondary))]">Título:</dt>
                    <dd className="text-[hsl(var(--foreground))] font-medium">{formData.title}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[hsl(var(--foreground-secondary))]">Categoria:</dt>
                    <dd className="text-[hsl(var(--foreground))] font-medium">{formData.category}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[hsl(var(--foreground-secondary))]">Início:</dt>
                    <dd className="text-[hsl(var(--foreground))] font-medium">
                      {formData.startDate && new Date(formData.startDate).toLocaleString('pt-PT')}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[hsl(var(--foreground-secondary))]">Fim:</dt>
                    <dd className="text-[hsl(var(--foreground))] font-medium">
                      {formData.endDate && new Date(formData.endDate).toLocaleString('pt-PT')}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="p-4 bg-[hsl(var(--background-secondary))] rounded-xl">
                <h4 className="font-semibold text-[hsl(var(--foreground))] mb-3">Localização</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[hsl(var(--foreground-secondary))]">Local:</dt>
                    <dd className="text-[hsl(var(--foreground))] font-medium">{formData.location?.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[hsl(var(--foreground-secondary))]">Cidade:</dt>
                    <dd className="text-[hsl(var(--foreground))] font-medium">{formData.location?.city}, {formData.location?.island}</dd>
                  </div>
                </dl>
              </div>

              <div className="p-4 bg-[hsl(var(--background-secondary))] rounded-xl">
                <h4 className="font-semibold text-[hsl(var(--foreground))] mb-3">Configurações</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[hsl(var(--foreground-secondary))]">Capacidade:</dt>
                    <dd className="text-[hsl(var(--foreground))] font-medium">{formData.capacity} pessoas</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[hsl(var(--foreground-secondary))]">Idade Mínima:</dt>
                    <dd className="text-[hsl(var(--foreground))] font-medium">
                      {formData.ageRestriction ? `${formData.ageRestriction}+` : 'Sem restrição'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[hsl(var(--foreground-secondary))]">Estado:</dt>
                    <dd className="text-[hsl(var(--foreground))] font-medium">
                      {formData.status === 'draft' ? 'Rascunho' : 'Publicado'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-[hsl(var(--border-color))]">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1 || isLoading}
            className="btn btn-ghost"
          >
            <ChevronLeft size={20} />
            Anterior
          </button>

          <div className="flex gap-3">
            {currentStep < STEPS.length ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={isLoading}
                className="btn btn-primary"
              >
                Próximo
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isLoading ? 'A criar...' : 'Criar Evento'}
                <Check size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
