'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Input,
  Textarea,
  Select,
  Switch,
  FormSection,
  DateTimePicker,
  CurrencyInput,
} from '../ui';
import { Card } from '../ui/Card';
import { type EventFormData } from '../../lib/services/events';
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

interface TicketTypeForm {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  maxPerOrder: number;
  salesStart: string;
  salesEnd: string;
}

interface EventFormProps {
  initialData?: Partial<EventFormData>;
  onSubmit: (data: EventFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function EventForm({
  initialData,
  onSubmit,
  isLoading = false,
}: EventFormProps) {
  const router = useRouter();

  // Basic info
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');

  // Date & Time
  const [startDate, setStartDate] = useState(
    initialData?.startDate?.toISOString().slice(0, 16) || ''
  );
  const [endDate, setEndDate] = useState(
    initialData?.endDate?.toISOString().slice(0, 16) || ''
  );

  // Venue
  const [venueName, setVenueName] = useState(initialData?.venue?.name || '');
  const [venueAddress, setVenueAddress] = useState(initialData?.venue?.address || '');
  const [venueCity, setVenueCity] = useState(initialData?.venue?.city || '');

  // Images
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');

  // Settings
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? true);
  const [allowTransfers, setAllowTransfers] = useState(
    initialData?.settings?.allowTransfers ?? true
  );
  const [allowRefunds, setAllowRefunds] = useState(
    initialData?.settings?.allowRefunds ?? false
  );
  const [requireId, setRequireId] = useState(initialData?.settings?.requireId ?? false);
  const [ageRestriction, setAgeRestriction] = useState(
    initialData?.settings?.ageRestriction || 0
  );

  // Ticket Types
  const [ticketTypes, setTicketTypes] = useState<TicketTypeForm[]>([
    {
      id: '1',
      name: '',
      description: '',
      price: 0,
      quantity: 100,
      maxPerOrder: 10,
      salesStart: '',
      salesEnd: '',
    },
  ]);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    { value: 'music', label: 'Música' },
    { value: 'party', label: 'Festa' },
    { value: 'festival', label: 'Festival' },
    { value: 'sports', label: 'Desporto' },
    { value: 'theater', label: 'Teatro' },
    { value: 'conference', label: 'Conferência' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'other', label: 'Outro' },
  ];

  const cities = [
    { value: 'praia', label: 'Praia' },
    { value: 'mindelo', label: 'Mindelo' },
    { value: 'sal', label: 'Santa Maria (Sal)' },
    { value: 'boa-vista', label: 'Boa Vista' },
    { value: 'sao-filipe', label: 'São Filipe' },
    { value: 'assomada', label: 'Assomada' },
    { value: 'tarrafal', label: 'Tarrafal' },
    { value: 'other', label: 'Outra' },
  ];

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const addTicketType = () => {
    setTicketTypes([
      ...ticketTypes,
      {
        id: String(Date.now()),
        name: '',
        description: '',
        price: 0,
        quantity: 100,
        maxPerOrder: 10,
        salesStart: '',
        salesEnd: '',
      },
    ]);
  };

  const removeTicketType = (id: string) => {
    if (ticketTypes.length > 1) {
      setTicketTypes(ticketTypes.filter((t) => t.id !== id));
    }
  };

  const updateTicketType = (id: string, field: keyof TicketTypeForm, value: string | number) => {
    setTicketTypes(
      ticketTypes.map((t) =>
        t.id === id ? { ...t, [field]: value } : t
      )
    );
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!category) newErrors.category = 'Categoria é obrigatória';
    if (!startDate) newErrors.startDate = 'Data de início é obrigatória';
    if (!endDate) newErrors.endDate = 'Data de fim é obrigatória';
    if (!venueName.trim()) newErrors.venueName = 'Nome do local é obrigatório';
    if (!venueCity) newErrors.venueCity = 'Cidade é obrigatória';

    // Validate dates
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      newErrors.endDate = 'Data de fim deve ser após a data de início';
    }

    // Validate ticket types
    ticketTypes.forEach((ticket, index) => {
      if (!ticket.name.trim()) {
        newErrors[`ticket_${index}_name`] = 'Nome do bilhete é obrigatório';
      }
      if (ticket.price < 0) {
        newErrors[`ticket_${index}_price`] = 'Preço deve ser maior ou igual a 0';
      }
      if (ticket.quantity <= 0) {
        newErrors[`ticket_${index}_quantity`] = 'Quantidade deve ser maior que 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const formData: EventFormData = {
      name,
      description,
      category,
      tags,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      venue: {
        name: venueName,
        address: venueAddress,
        city: venueCity,
      },
      coverImage,
      isPublic,
      settings: {
        allowTransfers,
        allowRefunds,
        refundDeadlineHours: 24,
        requireId,
        ageRestriction,
        maxTicketsPerOrder: 10,
      },
      ticketTypes: ticketTypes.map((t) => ({
        name: t.name,
        description: t.description,
        price: t.price,
        quantity: t.quantity,
        maxPerOrder: t.maxPerOrder,
        salesStart: t.salesStart ? new Date(t.salesStart) : undefined,
        salesEnd: t.salesEnd ? new Date(t.salesEnd) : undefined,
      })),
    };

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <FormSection
          title="Informações Básicas"
          description="Detalhes principais do seu evento"
        >
          <Input
            label="Nome do Evento"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Festival de Música de Mindelo"
            error={errors.name}
            required
          />

          <Textarea
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o seu evento..."
            error={errors.description}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Categoria"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={categories}
              placeholder="Selecione uma categoria"
              error={errors.category}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Adicionar tag..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                />
                <Button type="button" variant="secondary" onClick={addTag}>
                  Adicionar
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-purple-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </FormSection>
      </Card>

      {/* Date & Time */}
      <Card>
        <FormSection
          title="Data e Hora"
          description="Quando o seu evento irá acontecer"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DateTimePicker
              label="Data e Hora de Início"
              value={startDate}
              onChange={setStartDate}
              error={errors.startDate}
              required
            />

            <DateTimePicker
              label="Data e Hora de Fim"
              value={endDate}
              onChange={setEndDate}
              min={startDate}
              error={errors.endDate}
              required
            />
          </div>
        </FormSection>
      </Card>

      {/* Venue */}
      <Card>
        <FormSection
          title="Local"
          description="Onde o evento irá acontecer"
        >
          <Input
            label="Nome do Local"
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            placeholder="Ex: Praça Nova, Centro Cultural"
            error={errors.venueName}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Endereço"
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              placeholder="Rua, número..."
            />

            <Select
              label="Cidade"
              value={venueCity}
              onChange={(e) => setVenueCity(e.target.value)}
              options={cities}
              placeholder="Selecione a cidade"
              error={errors.venueCity}
              required
            />
          </div>
        </FormSection>
      </Card>

      {/* Cover Image */}
      <Card>
        <FormSection
          title="Imagem de Capa"
          description="Imagem principal do evento"
        >
          <Input
            label="URL da Imagem"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://..."
            leftIcon={<PhotoIcon className="h-5 w-5" />}
          />
          {coverImage && (
            <div className="mt-4">
              <img
                src={coverImage}
                alt="Preview"
                className="max-h-48 rounded-lg object-cover"
              />
            </div>
          )}
        </FormSection>
      </Card>

      {/* Ticket Types */}
      <Card>
        <FormSection
          title="Tipos de Bilhetes"
          description="Configure os bilhetes disponíveis"
        >
          <div className="space-y-6">
            {ticketTypes.map((ticket, index) => (
              <div
                key={ticket.id}
                className="p-4 border border-gray-200 rounded-lg space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">
                    Bilhete {index + 1}
                  </h4>
                  {ticketTypes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTicketType(ticket.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nome"
                    value={ticket.name}
                    onChange={(e) =>
                      updateTicketType(ticket.id, 'name', e.target.value)
                    }
                    placeholder="Ex: VIP, Regular, Early Bird"
                    error={errors[`ticket_${index}_name`]}
                    required
                  />

                  <CurrencyInput
                    label="Preço"
                    value={ticket.price}
                    onChange={(value) =>
                      updateTicketType(ticket.id, 'price', value)
                    }
                    error={errors[`ticket_${index}_price`]}
                    required
                  />
                </div>

                <Input
                  label="Descrição"
                  value={ticket.description}
                  onChange={(e) =>
                    updateTicketType(ticket.id, 'description', e.target.value)
                  }
                  placeholder="Benefícios incluídos..."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Quantidade"
                    type="number"
                    value={ticket.quantity}
                    onChange={(e) =>
                      updateTicketType(ticket.id, 'quantity', Number(e.target.value))
                    }
                    min={1}
                    error={errors[`ticket_${index}_quantity`]}
                    required
                  />

                  <Input
                    label="Máx. por encomenda"
                    type="number"
                    value={ticket.maxPerOrder}
                    onChange={(e) =>
                      updateTicketType(ticket.id, 'maxPerOrder', Number(e.target.value))
                    }
                    min={1}
                    max={20}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DateTimePicker
                    label="Início das Vendas"
                    value={ticket.salesStart}
                    onChange={(value) =>
                      updateTicketType(ticket.id, 'salesStart', value)
                    }
                  />

                  <DateTimePicker
                    label="Fim das Vendas"
                    value={ticket.salesEnd}
                    onChange={(value) =>
                      updateTicketType(ticket.id, 'salesEnd', value)
                    }
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addTicketType}
              leftIcon={<PlusIcon className="h-5 w-5" />}
            >
              Adicionar Tipo de Bilhete
            </Button>
          </div>
        </FormSection>
      </Card>

      {/* Settings */}
      <Card>
        <FormSection
          title="Configurações"
          description="Opções adicionais do evento"
        >
          <div className="space-y-4">
            <Switch
              checked={isPublic}
              onChange={setIsPublic}
              label="Evento Público"
              description="Visível para todos os utilizadores na plataforma"
            />

            <Switch
              checked={allowTransfers}
              onChange={setAllowTransfers}
              label="Permitir Transferências"
              description="Os compradores podem transferir bilhetes para outros utilizadores"
            />

            <Switch
              checked={allowRefunds}
              onChange={setAllowRefunds}
              label="Permitir Reembolsos"
              description="Os compradores podem solicitar reembolso"
            />

            <Switch
              checked={requireId}
              onChange={setRequireId}
              label="Exigir Identificação"
              description="Verificação de identidade no check-in"
            />

            <Input
              label="Restrição de Idade"
              type="number"
              value={ageRestriction}
              onChange={(e) => setAgeRestriction(Number(e.target.value))}
              min={0}
              max={21}
              helperText="0 para sem restrição"
            />
          </div>
        </FormSection>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
        >
          Cancelar
        </Button>

        <div className="flex gap-3">
          <Button type="submit" variant="secondary" disabled={isLoading}>
            Guardar como Rascunho
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Criar Evento
          </Button>
        </div>
      </div>
    </form>
  );
}
