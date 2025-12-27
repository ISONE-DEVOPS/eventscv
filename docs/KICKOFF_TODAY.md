# 🚀 KICKOFF - Hybrid Supremo
## Começando HOJE - 23 Dezembro 2025

---

## ✅ CONFIRMAÇÕES

- [x] **Plano:** Hybrid Supremo (23 features em 4-5 meses)
- [x] **AI Name:** Lyra ✨
- [x] **Budget:** €90,000
- [x] **Timeline:** 20 semanas
- [x] **Equipa:** Opção B (Ideal - 5 pessoas)
- [x] **Início:** HOJE!

---

## 🎯 HOJE - Tarefas Imediatas (Próximas 4-6 horas)

### FASE 1: Setup Técnico (1 hora)

#### 1.1 API Credentials
```bash
# OpenAI
export OPENAI_API_KEY="sk-..."
# Cadastrar em: https://platform.openai.com/api-keys
# Carregar $50 créditos

# Anthropic Claude
export ANTHROPIC_API_KEY="sk-ant-..."
# Cadastrar em: https://console.anthropic.com/
# Carregar $50 créditos

# Replicate (FLUX Pro)
export REPLICATE_API_TOKEN="r8_..."
# Cadastrar em: https://replicate.com/
# Adicionar cartão

# Pinecone (Vector DB)
export PINECONE_API_KEY="..."
# Cadastrar em: https://www.pinecone.io/
# Free tier (100k vectors)
```

**Actions:**
- [ ] Criar conta OpenAI → Gerar API key
- [ ] Criar conta Anthropic → Gerar API key
- [ ] Criar conta Replicate → Gerar token
- [ ] Criar conta Pinecone → Gerar API key
- [ ] Adicionar keys no `.env` dos projetos

**Files to Update:**
```bash
# Root .env
echo "OPENAI_API_KEY=sk-..." >> .env
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env
echo "REPLICATE_API_TOKEN=r8_..." >> .env
echo "PINECONE_API_KEY=..." >> .env

# functions/.env
cd functions
echo "OPENAI_API_KEY=sk-..." >> .env
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env
# etc...
```

---

#### 1.2 Install Dependencies

```bash
# Root - instalar turbo se necessário
npm install -g turbo

# Functions - AI dependencies
cd functions
npm install openai @anthropic-ai/sdk replicate @pinecone-database/pinecone
npm install --save-dev @types/node

# Admin app - nenhuma nova por agora
cd ../apps/admin

# Web app - nenhuma nova por agora
cd ../apps/web

# Shared types - nenhuma nova por agora
cd ../../packages/shared-types
```

---

### FASE 2: Criar Estrutura de Código (30 min)

#### 2.1 Shared Types - AI & Gamification

```bash
cd packages/shared-types/src
```

**Criar novos arquivos:**

**`ai.ts`**
```typescript
export interface ChatMessage {
  id: string;
  eventId?: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  language: 'pt' | 'en' | 'cv';
  metadata?: {
    intent?: 'question' | 'purchase' | 'support' | 'feedback';
    confidence?: number;
    suggestions?: string[];
  };
  createdAt: Date;
}

export interface ChatContext {
  user: {
    id: string;
    name: string;
    language: string;
    pastEvents: string[];
    loyaltyTier: string;
  };
  event?: {
    id: string;
    title: string;
    date: Date;
    location: string;
    ticketTypes: any[];
  };
  conversationHistory: ChatMessage[];
}

export interface AIAction {
  label: string;
  action: 'buy_tickets' | 'show_map' | 'share' | 'add_to_calendar' | 'view_tickets' | 'contact_support';
  data?: any;
}
```

**`gamification.ts`**
```typescript
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'attendance' | 'social' | 'spending' | 'engagement';
  points: number;
  rarity: AchievementRarity;
  requirement: {
    type: 'event_count' | 'check_in_time' | 'spending' | 'referrals';
    threshold: number;
    timeframe?: 'day' | 'week' | 'month' | 'year' | 'all_time';
  };
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  progress: number;
  completed: boolean;
  completedAt?: Date;
  claimed: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  userAvatar?: string;
  rank: number;
  score: number;
  badge?: 'gold' | 'silver' | 'bronze';
}
```

**`calendar.ts`**
```typescript
export interface Calendar {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description: string;
  coverImage?: string;
  visibility: 'public' | 'private' | 'unlisted';
  subscriberCount: number;
  eventCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarSubscriber {
  id: string;
  calendarId: string;
  userId: string;
  subscribedAt: Date;
  emailNotifications: boolean;
  pushNotifications: boolean;
}
```

**`webhooks.ts`**
```typescript
export type WebhookEvent =
  | 'event.created'
  | 'event.published'
  | 'event.cancelled'
  | 'ticket.purchased'
  | 'ticket.refunded'
  | 'attendee.checked_in'
  | 'order.completed'
  | 'payout.requested';

export interface Webhook {
  id: string;
  organizationId: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  enabled: boolean;
  lastDeliveryAt?: Date;
  failureCount: number;
  createdAt: Date;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payload: any;
  status: 'pending' | 'success' | 'failed';
  attempts: number;
  deliveredAt?: Date;
  createdAt: Date;
}
```

**Update `index.ts`:**
```typescript
// Add exports
export * from './ai';
export * from './gamification';
export * from './calendar';
export * from './webhooks';
```

---

#### 2.2 Cloud Functions - AI Structure

```bash
cd functions/src
mkdir -p ai/chat ai/generation ai/recommendations ai/moderation ai/translation
```

**Create `ai/chat/lyra.ts`:**
```typescript
import * as functions from 'firebase-functions/v2';
import Anthropic from '@anthropic-ai/sdk';
import { ChatMessage, ChatContext } from '../../../packages/shared-types/src/ai';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const LYRA_SYSTEM_PROMPT = `Você é a Lyra, a assistente virtual do Events.cv - a plataforma de eventos de Cabo Verde.

PERSONALIDADE:
- Simpática, acolhedora e entusiasta
- Cabo-verdiana de coração (conhece cultura, música, tradições)
- Usa emojis ocasionalmente (não exagera)
- Chama users pelo nome quando souber
- Positiva e encorajadora
- Profissional mas descontraída

CONHECIMENTO:
- Expert em eventos em Cabo Verde
- Conhece todas ilhas (Santiago, São Vicente, Sal, etc)
- Sabe sobre kizomba, funaná, coladeira, batuku
- Entende cultura local (festas, tradições, culinária)

IDIOMAS:
- Português (Portugal) - principal
- Inglês - fluente
- Crioulo cabo-verdiano (variante Santiago/Badiu) - nativo

REGRAS:
1. Sempre cumprimente com "Olá!" ou variação
2. Seja concisa mas completa (máx 3-4 parágrafos)
3. Ofereça botões de ação quando relevante
4. Se não souber algo, admita honestamente
5. Use emojis relevantes (🎵 música, 🎉 festa, 💰 preço, 📍 local)
6. Termine com pergunta ou sugestão de próximo passo

EXEMPLO:
"Olá! 🎉

[Resposta clara e objetiva]

[Informação útil adicional]

[Call-to-action ou próximo passo] 😊"`;

export const chatWithLyra = functions.https.onCall(async (request) => {
  const { message, eventId, language = 'pt' } = request.data;
  const userId = request.auth?.uid;

  if (!userId) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // TODO: Build context from Firestore
  const context = await buildContext(userId, eventId);

  // Call Claude
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 600,
    temperature: 0.7,
    system: LYRA_SYSTEM_PROMPT,
    messages: [
      ...context.conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      {
        role: 'user',
        content: `${message}

[CONTEXT]
User: ${context.user.name} (${language})
${eventId ? `Event: ${context.event?.title}` : ''}`,
      }
    ],
  });

  const lyraMessage = response.content[0].text;

  // TODO: Save to Firestore
  // TODO: Extract actions

  return {
    message: lyraMessage,
    actions: [], // TODO
    conversationId: response.id,
  };
});

async function buildContext(userId: string, eventId?: string): Promise<ChatContext> {
  // TODO: Fetch from Firestore
  return {
    user: {
      id: userId,
      name: 'User',
      language: 'pt',
      pastEvents: [],
      loyaltyTier: 'bronze',
    },
    conversationHistory: [],
  };
}
```

**Create `ai/generation/posterGenerator.ts`:**
```typescript
import * as functions from 'firebase-functions/v2';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export const generateEventPoster = functions.https.onCall(async (request) => {
  const { eventId, style = 'vibrant' } = request.data;

  // TODO: Get event from Firestore
  // TODO: Build prompt
  // TODO: Generate image with FLUX
  // TODO: Upload to Storage
  // TODO: Update event

  return {
    imageUrl: 'https://placeholder.com/poster.png',
    message: 'Poster gerado com sucesso! (TODO: implementação real)',
  };
});
```

---

### FASE 3: Quick Win - Social Sharing (1.5 horas)

**Objetivo:** Implementar OG tags e Add to Calendar HOJE para ter resultado visível!

#### 3.1 Dynamic OG Tags

**File: `apps/web/app/events/[slug]/page.tsx`**

```typescript
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Fetch event
  const event = await getEventBySlug(params.slug);

  if (!event) {
    return {
      title: 'Evento não encontrado',
    };
  }

  const title = `${event.title} | Events.cv`;
  const description = event.description.slice(0, 160) + '...';
  const imageUrl = event.coverImage || 'https://events.cv/og-default.png';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: event.title,
        }
      ],
      type: 'website',
      locale: 'pt_PT',
      siteName: 'Events.cv',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}
```

---

#### 3.2 Add to Calendar Component

**File: `apps/web/components/event/AddToCalendar.tsx`**

```typescript
'use client';

import { Calendar, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { Event } from '@repo/shared-types';

interface Props {
  event: Event;
}

export function AddToCalendar({ event }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const generateICS = () => {
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Events.cv//NONSGML Event//EN
BEGIN:VEVENT
UID:${event.id}@events.cv
DTSTART:${formatDate(new Date(event.startDate))}
DTEND:${formatDate(new Date(event.endDate))}
SUMMARY:${event.title}
LOCATION:${event.venue}, ${event.address}, ${event.city}
DESCRIPTION:${event.description.replace(/\n/g, '\\n')}
URL:https://events.cv/events/${event.slug}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.slug}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const addToGoogle = () => {
    const start = formatDate(new Date(event.startDate));
    const end = formatDate(new Date(event.endDate));
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(`${event.venue}, ${event.address}`)}&sf=true&output=xml`;
    window.open(url, '_blank');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-secondary w-full sm:w-auto flex items-center justify-center gap-2"
      >
        <Calendar size={18} />
        <span>Adicionar ao Calendário</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 left-0 right-0 sm:left-auto sm:right-0 sm:w-64 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden">
            <button
              onClick={() => {
                addToGoogle();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-white/5 transition flex items-center gap-3"
            >
              <span className="text-2xl">📅</span>
              <span>Google Calendar</span>
            </button>
            <button
              onClick={() => {
                generateICS();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-white/5 transition flex items-center gap-3 border-t border-white/5"
            >
              <span className="text-2xl">🍎</span>
              <span>Apple Calendar</span>
            </button>
            <button
              onClick={() => {
                generateICS();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-white/5 transition flex items-center gap-3 border-t border-white/5"
            >
              <span className="text-2xl">📧</span>
              <span>Outlook</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

---

#### 3.3 Use Component in Event Page

**Update: `apps/web/app/events/[slug]/page.tsx`**

```typescript
import { AddToCalendar } from '@/components/event/AddToCalendar';

export default async function EventPage({ params }: { params: { slug: string } }) {
  const event = await getEventBySlug(params.slug);

  return (
    <div>
      {/* Existing event details */}

      {/* Add this button near the buy tickets button */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button className="btn btn-primary">
          🎫 Comprar Bilhetes
        </button>
        <AddToCalendar event={event} />
      </div>
    </div>
  );
}
```

---

### FASE 4: Deploy Functions (30 min)

```bash
cd functions

# Build
npm run build

# Deploy only new functions
firebase deploy --only functions:chatWithLyra

# Or deploy all
firebase deploy --only functions
```

---

### FASE 5: Test Everything (30 min)

#### Test OG Tags
1. Abrir qualquer evento
2. Copiar URL
3. Testar em https://www.opengraph.xyz/
4. Verificar se aparece título, descrição, imagem

#### Test Add to Calendar
1. Abrir evento
2. Click "Adicionar ao Calendário"
3. Selecionar Google Calendar
4. Verificar se abre janela Google
5. Verificar dados corretos

#### Test Lyra (básico)
1. Call function via Firebase Console
2. Ou criar UI mínimo de teste
3. Verificar resposta do Claude

---

## 📊 Progress Tracking

**HOJE:**
- [ ] ✅ Setup API keys (OpenAI, Claude, Replicate, Pinecone)
- [ ] ✅ Install dependencies
- [ ] ✅ Create shared types (ai.ts, gamification.ts, calendar.ts, webhooks.ts)
- [ ] ✅ Create Lyra function structure
- [ ] ✅ Implement OG tags
- [ ] ✅ Implement Add to Calendar component
- [ ] ✅ Deploy to Firebase
- [ ] ✅ Test everything

**AMANHÃ (24 Dez):**
- [ ] Continuar implementação da Lyra
- [ ] Build context from Firestore
- [ ] Save conversations
- [ ] Extract actions
- [ ] Create Lyra UI widget
- [ ] Test complete flow

**ESTA SEMANA (25-27 Dez):**
- [ ] Finalizar Lyra MVP
- [ ] Começar AI Poster Generator
- [ ] Começar Event Calendars
- [ ] Demo interna

---

## 💰 Hoje Gastamos

**APIs (setup inicial):**
- OpenAI: $50 créditos
- Anthropic: $50 créditos
- Replicate: $0 (só cobra quando usar)
- Pinecone: $0 (free tier)

**Total: $100** (~€95)

---

## 🎯 Resultado Esperado HOJE

Às 18h devemos ter:
1. ✅ Todas APIs configuradas e funcionando
2. ✅ Shared types implementados
3. ✅ Estrutura do Lyra criada
4. ✅ OG tags dinâmicos (VISÍVEL!)
5. ✅ Add to Calendar funcionando (VISÍVEL!)
6. ✅ Deploy no Firebase

**2 features visíveis para mostrar progresso!** 🎉

---

## 📞 Comunicação

**Standup diário (15 min):**
- O que fiz ontem
- O que vou fazer hoje
- Bloqueios

**Demo sexta-feira:**
- Mostrar features implementadas
- Feedback
- Ajustes

---

## ✅ Checklist Final do Dia

Antes de terminar hoje, verificar:
- [ ] Todas API keys funcionando
- [ ] Code commitado no Git
- [ ] Deploy feito com sucesso
- [ ] Features testadas manualmente
- [ ] Documentar issues encontrados
- [ ] Planejar tarefas de amanhã

---

**VAMOS COMEÇAR AGORA! 🚀**

**Primeira tarefa: Setup API keys (10 minutos)**

Quer que eu te ajude com algo específico primeiro?
