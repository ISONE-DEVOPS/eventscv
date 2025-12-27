# 🎯 Social Sharing + Add to Calendar - Implementation Guide

**Status**: ✅ Implementado
**Semana**: 2 do Execution Plan
**Data**: 26 Dezembro 2024

---

## ✅ Componentes Criados

### 1. **AddToCalendar.tsx** - Componente de Adicionar ao Calendário

**Localização**: `/apps/web/components/event/AddToCalendar.tsx`

**Features**:
- ✅ Suporte para 5 calendários:
  - Google Calendar (deep link com timezone)
  - Apple Calendar (.ics download)
  - Outlook (web interface)
  - Yahoo Calendar
  - Download .ics genérico
- ✅ Formato .ics completo (VCALENDAR 2.0)
- ✅ Timezone automático (Atlantic/Cape_Verde)
- ✅ UI dropdown elegante
- ✅ Responsive e acessível

**Uso**:
```tsx
import { AddToCalendar } from '@/components/event/AddToCalendar';

<AddToCalendar event={event} className="..." />
```

---

### 2. **ShareEvent.tsx** - Componente de Partilha Social

**Localização**: `/apps/web/components/event/ShareEvent.tsx`

**Features**:
- ✅ 5 canais de partilha:
  - WhatsApp (🇨🇻 Popular em Cabo Verde!)
  - Facebook
  - Twitter / X
  - LinkedIn
  - Email
- ✅ Copiar link com feedback visual
- ✅ Native Share API (mobile)
- ✅ URL encurtados automáticos
- ✅ Texto pré-formatado otimizado

**Uso**:
```tsx
import { ShareEvent } from '@/components/event/ShareEvent';

<ShareEvent event={event} className="..." />
```

---

### 3. **generateMetadata.ts** - SEO & Open Graph Utilities

**Localização**: `/apps/web/lib/seo/generateMetadata.ts`

**Features**:
- ✅ Open Graph tags completos
- ✅ Twitter Card tags
- ✅ JSON-LD structured data (Schema.org Event)
- ✅ Multi-language support (PT-CV, PT-PT, PT-BR, EN)
- ✅ Dynamic OG images
- ✅ Event-specific metadata (price, location, datetime)

**Uso**:
```tsx
// app/events/[slug]/page.tsx
import { generateEventMetadata, generateEventStructuredData } from '@/lib/seo/generateMetadata';

export async function generateMetadata({ params }): Promise<Metadata> {
  const event = await getEvent(params.slug);
  return generateEventMetadata({ event });
}

export default async function EventPage({ params }) {
  const event = await getEvent(params.slug);
  const structuredData = generateEventStructuredData(event);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="event-page">
        {/* Event Header */}
        <div className="flex gap-3">
          <ShareEvent event={event} />
          <AddToCalendar event={event} />
        </div>

        {/* Rest of event content */}
      </div>
    </>
  );
}
```

---

## 📊 Funcionalidades Implementadas

### **Open Graph Tags**
```html
<!-- Auto-gerados pelo generateEventMetadata -->
<meta property="og:title" content="Festa de Kizomba - Praia" />
<meta property="og:description" content="A maior festa de kizomba do ano..." />
<meta property="og:image" content="https://events.cv/events/123/og-image.jpg" />
<meta property="og:url" content="https://events.cv/events/festa-kizomba" />
<meta property="og:type" content="website" />
<meta property="og:locale" content="pt_CV" />
<meta property="og:site_name" content="Events.cv" />

<!-- Event-specific metadata -->
<meta property="event:start_time" content="2025-01-15T22:00:00Z" />
<meta property="event:end_time" content="2025-01-16T04:00:00Z" />
<meta property="event:location" content="Quintal da Música, Praia" />
<meta property="og:price:amount" content="15" />
<meta property="og:price:currency" content="EUR" />
```

### **Twitter Card**
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Festa de Kizomba - Praia" />
<meta name="twitter:description" content="..." />
<meta name="twitter:image" content="https://events.cv/events/123/og-image.jpg" />
<meta name="twitter:creator" content="@eventscv" />
<meta name="twitter:site" content="@eventscv" />
```

### **Schema.org Structured Data**
```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Festa de Kizomba",
  "startDate": "2025-01-15T22:00:00Z",
  "endDate": "2025-01-16T04:00:00Z",
  "location": {
    "@type": "Place",
    "name": "Quintal da Música",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Achada Santo António",
      "addressLocality": "Praia",
      "addressCountry": "CV"
    }
  },
  "offers": [{
    "@type": "Offer",
    "price": "15",
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock"
  }]
}
```

---

## 🎨 UI/UX Design

### **AddToCalendar Button**
```
┌─────────────────────────────────┐
│ 📅 Adicionar ao Calendário  ▼  │  ← Main button
└─────────────────────────────────┘
          ↓ (on click)
┌─────────────────────────────────┐
│ 🔵 Google Calendar             │
│ 🍎 Apple Calendar              │
│ 📧 Outlook                     │
│ 🟣 Yahoo Calendar              │
│ ───────────────────────────── │
│ 💾 Download .ics               │
└─────────────────────────────────┘
```

### **ShareEvent Button**
```
┌─────────────────────────┐
│ 🔗 Partilhar           │  ← Main button
└─────────────────────────┘
          ↓ (on click)
┌───────────────────────────┐
│ 📋 Copiar link           │
│ ────────────────────────│
│ 📱 WhatsApp              │
│ 🔵 Facebook              │
│ 🐦 Twitter / X           │
│ 💼 LinkedIn              │
│ 📧 Email                 │
└───────────────────────────┘
```

---

## 🚀 Como Integrar em Eventos Existentes

### **Passo 1: Importar componentes**
```tsx
import { AddToCalendar } from '@/components/event/AddToCalendar';
import { ShareEvent } from '@/components/event/ShareEvent';
```

### **Passo 2: Adicionar à página**
```tsx
<div className="event-actions flex gap-3">
  <ShareEvent event={event} />
  <AddToCalendar event={event} />
</div>
```

### **Passo 3: Configurar metadata**
```tsx
// app/events/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const event = await getEvent(params.slug);
  return generateEventMetadata({ event });
}
```

### **Passo 4: Adicionar structured data**
```tsx
export default async function EventPage({ params }) {
  const event = await getEvent(params.slug);
  const structuredData = generateEventStructuredData(event);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* ... rest of page */}
    </>
  );
}
```

---

## 📈 Métricas Esperadas (KPIs - Semana 2)

Segundo o Execution Plan:

- ✅ 100 eventos com OG tags otimizados
- ✅ 500 Add to Calendar clicks
- ✅ Social sharing otimizado
- ✅ Aumento de 30% em partilhas

**Como medir**:
```typescript
// Track Add to Calendar
const addToGoogle = (): void => {
  // Analytics tracking
  analytics.track('add_to_calendar', {
    calendar: 'google',
    eventId: event.id,
    eventSlug: event.slug,
  });

  // Open Google Calendar
  window.open(googleUrl.toString(), '_blank');
};

// Track Social Share
const shareOnFacebook = (): void => {
  analytics.track('share_event', {
    platform: 'facebook',
    eventId: event.id,
    method: 'social_share_button',
  });

  window.open(url, '_blank');
};
```

---

## 🔧 Configurações Recomendadas

### **Next.js Config**
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/events/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};
```

### **OG Image Generation (Opcional)**
```typescript
// app/api/og/route.tsx
import { ImageResponse } from 'next/og';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('event');

  const event = await getEvent(eventId);

  return new ImageResponse(
    (
      <div style={{ /* ... */ }}>
        <h1>{event.title}</h1>
        <p>{event.venue} • {event.city}</p>
        <p>{formatDate(event.startDate)}</p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
```

---

## ✅ Checklist de Implementação

### **Componentes**
- [x] AddToCalendar component criado
- [x] ShareEvent component criado
- [x] generateMetadata utility criado
- [x] generateEventStructuredData criado

### **Integrações**
- [ ] Adicionar componentes às páginas de evento
- [ ] Configurar metadata em todas as rotas
- [ ] Adicionar structured data
- [ ] Testar em Facebook Debugger
- [ ] Testar em Twitter Card Validator
- [ ] Testar .ics downloads em diferentes dispositivos

### **Analytics**
- [ ] Setup event tracking (add_to_calendar)
- [ ] Setup event tracking (share_event)
- [ ] Dashboard para métricas de viralização
- [ ] A/B testing de copy e posicionamento

---

## 🧪 Testing

### **Facebook Debugger**
```
https://developers.facebook.com/tools/debug/
```
Colar URL do evento e verificar OG tags.

### **Twitter Card Validator**
```
https://cards-dev.twitter.com/validator
```
Validar Twitter Card.

### **Google Rich Results Test**
```
https://search.google.com/test/rich-results
```
Verificar structured data.

### **Manual Testing**
1. ✅ Testar download .ics em iPhone
2. ✅ Testar Google Calendar em Android
3. ✅ Testar partilha WhatsApp
4. ✅ Verificar meta tags no source code
5. ✅ Testar native share API em mobile

---

## 📱 Mobile Optimization

### **Native Share API**
Automaticamente detectado e usado em dispositivos móveis:
```typescript
if (navigator.share) {
  await navigator.share({
    title: event.title,
    text: event.description,
    url: eventUrl,
  });
}
```

### **WhatsApp Deep Link**
Otimizado para Cabo Verde (WhatsApp é o canal #1):
```typescript
const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
```

---

## 🎯 Próximos Passos

### **Otimizações Futuras**
1. Dynamic OG image generation (Next.js API route)
2. QR code para partilha offline
3. Deep links para apps (Facebook, Instagram)
4. UTM parameters automáticos para tracking
5. Preview de partilha antes de enviar

### **A/B Tests**
1. Copy do botão ("Partilhar" vs "Convidar amigos")
2. Posicionamento (header vs footer vs sticky)
3. Icones vs texto
4. Cores e design

---

## 📊 Budget & Timeline

**Tempo de Implementação**: 1 dia
**Custo**: €0 (componentes nativos)
**Próxima Feature**: Event Calendars & Subscribers (Semana 5-6)

---

**Status**: ✅ **COMPLETO - Ready for Integration**
**Next**: Integrar nas páginas de evento existentes
