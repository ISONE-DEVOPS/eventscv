# Events.cv: Estratégia de AI
## Inteligência Artificial para Revolucionar Eventos

---

## 🎯 Visão: AI Como Co-Piloto de Eventos

**Não queremos AI só por hype. Queremos AI que RESOLVE PROBLEMAS REAIS.**

### Princípios da Nossa AI

1. **🎯 Útil, não decorativa** - Cada feature AI resolve um problema concreto
2. **⚡ Rápida e responsiva** - <2s de latência
3. **🌍 Multilingual** - PT, EN, Crioulo
4. **🔒 Privada e segura** - Dados não treinam modelos públicos
5. **💰 Cost-effective** - Mix de APIs pagas + modelos open source
6. **🎨 Invisível** - AI trabalha nos bastidores, UX é simples

---

## 🤖 AI Stack Recomendado

### Modelos & APIs

| Caso de Uso | Tecnologia | Custo | Latência |
|-------------|------------|-------|----------|
| **Chat/Assistant** | Claude 3.5 Sonnet (Anthropic) | $3/1M tokens | <1s |
| **Content Generation** | GPT-4o mini (OpenAI) | $0.15/1M tokens | <1s |
| **Image Generation** | FLUX Pro (Replicate) | $0.04/image | 3-5s |
| **Embeddings** | text-embedding-3-small (OpenAI) | $0.02/1M tokens | <0.5s |
| **Translation** | GPT-4o mini + Custom | $0.15/1M tokens | <1s |
| **Speech-to-Text** | Whisper (OpenAI) | $0.006/min | 2-3s |
| **Image Analysis** | GPT-4o Vision | $2.50/1M tokens | 1-2s |
| **Moderation** | OpenAI Moderation API | Grátis | <0.5s |

### Infraestrutura

```typescript
// AI Service Architecture
/functions/src/ai/
├── chat/
│   ├── claude.ts           // Claude API client
│   ├── eventAssistant.ts   // Event chatbot
│   └── contextBuilder.ts   // Build context from Firestore
├── generation/
│   ├── openai.ts           // OpenAI client
│   ├── posterGenerator.ts  // AI poster generation
│   ├── descriptionWriter.ts
│   └── emailComposer.ts
├── vision/
│   ├── imageAnalysis.ts    // Analyze event photos
│   ├── contentModeration.ts
│   └── faceDetection.ts
├── recommendations/
│   ├── embeddings.ts       // Vector embeddings
│   ├── vectorStore.ts      // Pinecone/Qdrant
│   └── recommender.ts      // Recommendation engine
├── translation/
│   ├── translator.ts       // PT/EN/CV translator
│   └── crioulo.ts          // Crioulo-specific
└── pricing/
    ├── priceOptimizer.ts   // ML-based pricing
    └── demandPredictor.ts  // Demand forecasting
```

**Custo Estimado Mensal:**
- 10k users, 100k mensagens: **~$150/mês**
- 1k image generations: **~$40/mês**
- 50k recommendations: **~$20/mês**
- **Total: ~$200-250/mês** (escala com uso)

---

## 🚀 Features AI (12 Inovadoras)

### 1. 🤖 AI Event Assistant (Chatbot)

**O Problema:**
- Users têm dúvidas sobre eventos (horário, localização, bilhetes)
- Organizers recebem 100s de mensagens repetitivas
- Suporte manual é caro e lento

**Nossa Solução:**
AI chatbot que responde automaticamente usando Claude 3.5

**Capabilities:**
- 💬 **Responde dúvidas** - "A que horas começa?" → "Às 21h00"
- 📍 **Dá direções** - "Como chego lá?" → Google Maps link
- 🎫 **Vende tickets** - "Quero 2 VIP" → Inicia checkout
- 🔄 **Mudanças de evento** - "Posso transferir bilhete?" → Explica processo
- 🌐 **Multilingual** - Responde em PT, EN, Crioulo
- 🧠 **Context-aware** - Sabe o histórico do user

**Tech Stack:**
```typescript
// packages/shared-types/src/ai.ts
interface ChatMessage {
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

interface ChatContext {
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
    faq: string[];
  };
  conversationHistory: ChatMessage[];
}
```

**Implementation:**
```typescript
// functions/src/ai/chat/eventAssistant.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const chatWithAssistant = functions.https.onCall(async (data, context) => {
  const { message, eventId, language = 'pt' } = data;
  const userId = context.auth?.uid;

  // Build context from Firestore
  const chatContext = await buildContext(userId, eventId);

  // System prompt
  const systemPrompt = `Você é o assistente de eventos da plataforma Events.cv.
Você ajuda utilizadores com informações sobre eventos, compra de bilhetes, e suporte geral.

Contexto do utilizador:
- Nome: ${chatContext.user.name}
- Idioma preferido: ${language}
- Nível de fidelidade: ${chatContext.user.loyaltyTier}

${eventId ? `
Contexto do evento:
- Nome: ${chatContext.event.title}
- Data: ${chatContext.event.date}
- Local: ${chatContext.event.location}
- Tipos de bilhete: ${JSON.stringify(chatContext.event.ticketTypes)}

Perguntas frequentes:
${chatContext.event.faq.join('\n')}
` : ''}

Regras:
- Seja simpático, conciso e útil
- Responda em ${language === 'pt' ? 'Português' : language === 'en' ? 'Inglês' : 'Crioulo cabo-verdiano'}
- Se não souber algo, diga honestamente
- Sugira ações quando apropriado (comprar bilhete, ver detalhes)
- Use emojis ocasionalmente para ser amigável
`;

  // Call Claude API
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 500,
    system: systemPrompt,
    messages: [
      ...chatContext.conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      {
        role: 'user',
        content: message,
      }
    ],
  });

  const assistantMessage = response.content[0].text;

  // Save to Firestore
  await db.collection('chat_messages').add({
    eventId,
    userId,
    role: 'assistant',
    content: assistantMessage,
    language,
    createdAt: new Date(),
  });

  return {
    message: assistantMessage,
    suggestions: extractSuggestions(assistantMessage),
  };
});

function extractSuggestions(message: string): string[] {
  // Extract action buttons from AI response
  // e.g., "Quer comprar bilhetes?" → ["Comprar Bilhetes"]
  const suggestions = [];

  if (message.includes('comprar') || message.includes('bilhete')) {
    suggestions.push('🎫 Comprar Bilhetes');
  }
  if (message.includes('direções') || message.includes('localização')) {
    suggestions.push('📍 Ver no Mapa');
  }
  if (message.includes('partilhar') || message.includes('amigos')) {
    suggestions.push('📤 Partilhar Evento');
  }

  return suggestions;
}
```

**Frontend:**
```typescript
// apps/web/components/ai/ChatWidget.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

export function AIChatWidget({ eventId }: { eventId?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input,
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          eventId,
          language: 'pt',
        }),
      });

      const data = await response.json();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        suggestions: data.suggestions,
        createdAt: new Date(),
      }]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-brand-primary rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50"
        >
          <MessageCircle size={24} className="text-white" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-primary/20 rounded-full flex items-center justify-center">
                🤖
              </div>
              <div>
                <h3 className="font-semibold">Assistente AI</h3>
                <p className="text-xs text-zinc-400">Sempre disponível</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-zinc-400 py-8">
                <p>👋 Olá! Como posso ajudar?</p>
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => setInput('Que eventos acontecem esta semana?')}
                    className="block w-full p-3 bg-white/5 rounded-lg hover:bg-white/10 text-sm"
                  >
                    Que eventos acontecem esta semana?
                  </button>
                  <button
                    onClick={() => setInput('Como funciona o sistema de pontos?')}
                    className="block w-full p-3 bg-white/5 rounded-lg hover:bg-white/10 text-sm"
                  >
                    Como funciona o sistema de pontos?
                  </button>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-brand-primary text-white'
                    : 'bg-white/5'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                  {/* Action suggestions */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.suggestions.map((suggestion, j) => (
                        <button
                          key={j}
                          className="block w-full p-2 bg-white/10 rounded text-xs hover:bg-white/20"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/5 p-3 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Escreva sua pergunta..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brand-primary"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="w-10 h-10 bg-brand-primary rounded-lg flex items-center justify-center disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

**Custo:**
- 1000 conversas/dia × 20 mensagens = 20k mensagens
- ~500 tokens/conversa = 10M tokens/mês
- **Custo: ~$30/mês** (Claude 3.5 Sonnet)

---

### 2. 🎨 AI Poster & Content Generator

**O Problema:**
- Organizers não têm designers
- Stock images genéricas
- Criar posters leva horas

**Nossa Solução:**
AI gera posters, descriptions, emails automaticamente

**Features:**
- 🖼️ **Auto-generate event poster** - Com base em título + categoria
- ✍️ **Write event description** - AI sugere descrição profissional
- 📧 **Email templates** - Gera emails de reminder/confirmação
- 🎭 **Social media posts** - Copia para Instagram/Facebook
- 🌐 **Multi-language** - Gera em PT, EN, Crioulo simultâneo

**Workflow:**
```
1. Organizer cria evento → "Festival de Verão"
2. Click "Generate Poster with AI"
3. AI pergunta: "Que estilo? (Vibrant/Minimal/Elegant)"
4. User seleciona "Vibrant"
5. AI gera poster em 5 segundos
6. User pode editar cores/texto
7. Save & publish
```

**Tech Stack:**
```typescript
// functions/src/ai/generation/posterGenerator.ts
import Replicate from 'replicate';
import { Storage } from '@google-cloud/storage';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const storage = new Storage();
const bucket = storage.bucket('events-cv-posters');

export const generateEventPoster = functions.https.onCall(async (data, context) => {
  const { eventId, style = 'vibrant' } = data;

  const event = await getEvent(eventId);

  // Build prompt
  const prompt = buildPosterPrompt(event, style);

  // Generate image with FLUX Pro
  const output = await replicate.run(
    "black-forest-labs/flux-1.1-pro",
    {
      input: {
        prompt,
        aspect_ratio: "4:3", // Event poster ratio
        output_format: "png",
        output_quality: 90,
      }
    }
  );

  // Download image
  const imageUrl = output[0];
  const response = await fetch(imageUrl);
  const buffer = await response.arrayBuffer();

  // Upload to Cloud Storage
  const filename = `posters/${eventId}-${Date.now()}.png`;
  const file = bucket.file(filename);

  await file.save(Buffer.from(buffer), {
    contentType: 'image/png',
    metadata: {
      cacheControl: 'public, max-age=31536000',
    },
  });

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

  // Update event
  await db.collection('events').doc(eventId).update({
    coverImage: publicUrl,
    aiGenerated: true,
  });

  return { imageUrl: publicUrl };
});

function buildPosterPrompt(event: Event, style: string): string {
  const styleDescriptions = {
    vibrant: 'vibrant colors, energetic, dynamic, modern design, gradient backgrounds',
    minimal: 'minimalist, clean, monochromatic, simple typography, lots of white space',
    elegant: 'sophisticated, luxury, gold accents, serif fonts, premium feel',
    dark: 'dark mode, neon lights, cyberpunk aesthetic, bold contrast',
  };

  return `Create a professional event poster for "${event.title}".
Event category: ${event.category}
Date: ${event.startDate.toLocaleDateString('pt-PT')}
Location: ${event.venue}, ${event.city}

Style: ${styleDescriptions[style]}

Design requirements:
- Event title prominently displayed
- Date and location clearly visible
- ${event.category === 'music' ? 'Musical theme with instruments or sound waves' : ''}
- ${event.category === 'sports' ? 'Athletic, dynamic, action-oriented' : ''}
- High quality, professional, eye-catching
- Suitable for social media sharing
- No text overlapping important elements
- 4:3 aspect ratio

Do NOT include: watermarks, logos, URLs, phone numbers`;
}
```

**Content Generation:**
```typescript
// functions/src/ai/generation/descriptionWriter.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateEventDescription = functions.https.onCall(async (data, context) => {
  const { eventTitle, category, venue, highlights = [] } = data;

  const prompt = `Escreva uma descrição profissional e envolvente para um evento.

Título: ${eventTitle}
Categoria: ${category}
Local: ${venue}
${highlights.length > 0 ? `Destaques: ${highlights.join(', ')}` : ''}

Requisitos:
- 2-3 parágrafos (150-200 palavras)
- Tom amigável mas profissional
- Destacar a experiência única
- Incluir call-to-action no final
- Em português de Portugal
- Usar emojis ocasionalmente`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Você é um copywriter especializado em eventos. Escreve descrições envolventes que fazem pessoas quererem participar.',
      },
      {
        role: 'user',
        content: prompt,
      }
    ],
    temperature: 0.7,
    max_tokens: 400,
  });

  const description = completion.choices[0].message.content;

  return { description };
});
```

**Frontend:**
```typescript
// apps/admin/components/events/AIContentGenerator.tsx
export function AIContentGenerator({ eventId }: Props) {
  const [generating, setGenerating] = useState(false);

  const generatePoster = async (style: string) => {
    setGenerating(true);
    try {
      const result = await functions.httpsCallable('generateEventPoster')({
        eventId,
        style,
      });
      toast.success('Poster gerado com sucesso!');
      // Update event cover image
    } catch (error) {
      toast.error('Erro ao gerar poster');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Poster Generator */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">🎨 Gerar Poster com AI</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {['vibrant', 'minimal', 'elegant', 'dark'].map(style => (
            <button
              key={style}
              onClick={() => generatePoster(style)}
              className="p-4 border border-white/10 rounded-lg hover:border-brand-primary"
            >
              <div className="font-semibold capitalize">{style}</div>
              <p className="text-xs text-zinc-400 mt-1">
                {style === 'vibrant' && 'Cores vibrantes e energia'}
                {style === 'minimal' && 'Limpo e moderno'}
                {style === 'elegant' && 'Sofisticado e premium'}
                {style === 'dark' && 'Dark mode com neon'}
              </p>
            </button>
          ))}
        </div>
        {generating && (
          <div className="text-center py-4">
            <Loader2 className="animate-spin mx-auto mb-2" />
            <p className="text-sm text-zinc-400">Gerando poster mágico... ✨</p>
          </div>
        )}
      </div>

      {/* Description Generator */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">✍️ Escrever Descrição com AI</h3>
        <button onClick={generateDescription} className="btn btn-secondary">
          Gerar Descrição
        </button>
      </div>
    </div>
  );
}
```

**Custo:**
- 100 posters/mês: ~$4
- 200 descriptions/mês: ~$1
- **Total: ~$5/mês**

---

### 3. 🎯 AI Personalized Recommendations

**O Problema:**
- Users perdem eventos que iriam adorar
- Feed genérico igual para todos
- Descoberta é aleatória

**Nossa Solução:**
ML-powered recommendations baseado em comportamento

**How it Works:**
```
1. Cria embedding de cada evento (vector 1536D)
2. Cria embedding do perfil do user (baseado em histórico)
3. Similarity search (cosine) para encontrar eventos similares
4. Ranking baseado em:
   - Similaridade semântica (40%)
   - Amigos que vão (30%)
   - Localização (15%)
   - Preço (10%)
   - Novidade (5%)
```

**Tech Stack:**
```typescript
// functions/src/ai/recommendations/embeddings.ts
import OpenAI from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';

const openai = new OpenAI();
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pinecone.index('events');

// Create event embedding
export async function createEventEmbedding(event: Event) {
  const text = `${event.title} ${event.description} ${event.category} ${event.tags.join(' ')}`;

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  const embedding = response.data[0].embedding;

  // Store in Pinecone
  await index.upsert([{
    id: event.id,
    values: embedding,
    metadata: {
      title: event.title,
      category: event.category,
      city: event.city,
      price: event.ticketTypes[0]?.price || 0,
      date: event.startDate.getTime(),
    }
  }]);

  return embedding;
}

// Get recommendations for user
export async function getRecommendations(userId: string, limit = 10) {
  const user = await getUser(userId);
  const userHistory = await getUserEventHistory(userId);

  // Build user profile text
  const profileText = buildUserProfile(user, userHistory);

  // Create user embedding
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: profileText,
  });

  const userEmbedding = response.data[0].embedding;

  // Query Pinecone
  const queryResponse = await index.query({
    vector: userEmbedding,
    topK: limit * 2, // Get more for filtering
    includeMetadata: true,
    filter: {
      date: { $gte: Date.now() } // Only future events
    }
  });

  // Re-rank with additional signals
  const scored = await Promise.all(
    queryResponse.matches.map(async match => {
      const event = await getEvent(match.id);

      // Get friend attendance
      const friendsGoing = await getFriendsAttending(userId, match.id);

      // Calculate final score
      const finalScore =
        match.score * 0.4 + // Semantic similarity
        (friendsGoing.length / 10) * 0.3 + // Friend signal
        locationScore(user.city, event.city) * 0.15 +
        priceScore(user.wallet.totalSpent, event.price) * 0.1 +
        freshnessScore(event.publishedAt) * 0.05;

      return {
        event,
        score: finalScore,
        friendsGoing,
        reason: generateReason(match.score, friendsGoing, event),
      };
    })
  );

  // Sort and limit
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function buildUserProfile(user: User, history: Event[]): string {
  const categories = history.map(e => e.category).join(', ');
  const avgPrice = history.reduce((sum, e) => sum + (e.price || 0), 0) / history.length;

  return `User profile:
Preferred categories: ${categories}
Loyalty tier: ${user.loyalty.tier}
Average ticket price: €${avgPrice}
Location: ${user.city}
Past events: ${history.map(e => e.title).join(', ')}`;
}

function generateReason(similarity: number, friendsGoing: User[], event: Event): string {
  if (friendsGoing.length >= 3) {
    return `${friendsGoing.length} amigos vão a este evento`;
  }
  if (similarity > 0.9) {
    return `Perfeito para o seu gosto`;
  }
  if (event.category === user.favoriteCategory) {
    return `${event.category} é a sua categoria favorita`;
  }
  return `Recomendado para si`;
}
```

**Frontend:**
```typescript
// apps/web/app/page.tsx
export default async function HomePage() {
  const recommendations = await getRecommendations(currentUser.id);

  return (
    <div>
      <section className="py-12">
        <h2 className="text-2xl font-bold mb-6">🎯 Recomendado Para Si</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.map(({ event, score, friendsGoing, reason }) => (
            <EventCard
              key={event.id}
              event={event}
              badge={
                <div className="absolute top-4 right-4 bg-brand-primary/90 px-3 py-1 rounded-full text-xs font-semibold">
                  ✨ {Math.round(score * 100)}% match
                </div>
              }
              footer={
                <div className="mt-2">
                  <p className="text-sm text-zinc-400">{reason}</p>
                  {friendsGoing.length > 0 && (
                    <div className="flex -space-x-2 mt-2">
                      {friendsGoing.slice(0, 3).map(friend => (
                        <img
                          key={friend.id}
                          src={friend.avatarUrl}
                          className="w-8 h-8 rounded-full border-2 border-zinc-900"
                          title={friend.name}
                        />
                      ))}
                      {friendsGoing.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-xs">
                          +{friendsGoing.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              }
            />
          ))}
        </div>
      </section>
    </div>
  );
}
```

**Custo:**
- 10k users × 10 recommendations/dia = 100k queries/dia
- Embeddings: $0.02/1M tokens ~ $2/mês
- Pinecone: Free tier (100k vectors)
- **Total: ~$2-5/mês**

---

### 4. 📊 AI Analytics & Insights

**O Problema:**
- Organizers veem números mas não insights
- Não sabem PORQUÊ vendas caíram
- Decisões baseadas em "feeling"

**Nossa Solução:**
AI analisa dados e dá insights acionáveis

**Features:**
- 📈 **Trend analysis** - "Vendas 30% abaixo do esperado porque..."
- 🎯 **Optimization suggestions** - "Mude o horário para 21h para +20% vendas"
- 💡 **Predictions** - "Este evento vai vender 450 bilhetes (±50)"
- ⚠️ **Alerts** - "Vendas pararam. Sugestão: baixar preço 15%"
- 📊 **Comparisons** - "VS eventos similares: você está 25% melhor"

**Example Insights:**
```
🔥 Insight: Vendas aceleraram 40% ontem
Razão detectada: Partilha do artista nas redes sociais
Ação recomendada: Contactar artista para mais posts

⚠️ Alert: Capacidade só 30% vendida 7 dias antes
Comparação: Eventos similares estão 70% vendidos
Sugestões:
- Reduzir preço em 20% (early bird revival)
- Criar promoção "Traz um amigo" (2x1)
- Fazer blast para subscribers do calendar
```

**Tech Stack:**
```typescript
// functions/src/ai/analytics/insights.ts
export const generateEventInsights = functions.https.onCall(async (data, context) => {
  const { eventId } = data;

  const event = await getEvent(eventId);
  const analytics = await getEventAnalytics(eventId);
  const similarEvents = await getSimilarEvents(event);

  // Prepare context for Claude
  const analyticsContext = `
Evento: ${event.title}
Capacidade: ${event.totalCapacity}
Vendidos: ${event.ticketsSold} (${(event.ticketsSold / event.totalCapacity * 100).toFixed(1)}%)
Dias até evento: ${Math.ceil((event.startDate - new Date()) / (1000 * 60 * 60 * 24))}
Preço médio: €${analytics.avgTicketPrice}

Vendas nos últimos 7 dias:
${analytics.last7Days.map(d => `${d.date}: ${d.sales} bilhetes`).join('\n')}

Eventos similares (benchmark):
${similarEvents.map(e => `${e.title}: ${e.sellThroughRate}% vendidos`).join('\n')}

Views: ${event.views}
Conversão: ${(event.ticketsSold / event.views * 100).toFixed(1)}%
`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1000,
    system: `Você é um analista de eventos expert. Analisa dados e dá insights acionáveis para organizers.

Regras:
- Identifique padrões e anomalias
- Dê explicações claras do PORQUÊ
- Sugira ações específicas e práticas
- Use emojis para categorizar (🔥 positivo, ⚠️ alerta, 💡 sugestão)
- Seja conciso mas informativo
- Priorize insights acionáveis sobre descrições`,
    messages: [{
      role: 'user',
      content: `Analise este evento e dê 3-5 insights importantes:\n\n${analyticsContext}`,
    }],
  });

  const insights = response.content[0].text;

  // Store insights
  await db.collection('events').doc(eventId).update({
    aiInsights: insights,
    insightsGeneratedAt: new Date(),
  });

  return { insights };
});
```

**Frontend:**
```typescript
// apps/admin/components/analytics/AIInsights.tsx
export function AIInsights({ eventId }: Props) {
  const { insights, loading } = useAIInsights(eventId);

  if (loading) return <Skeleton />;

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold">🤖 AI Insights</h3>
        <p className="text-sm text-zinc-400">Análise automática do seu evento</p>
      </div>
      <div className="card-body prose prose-invert max-w-none">
        <ReactMarkdown>{insights}</ReactMarkdown>
      </div>
      <div className="card-footer">
        <button className="btn btn-secondary btn-sm">
          Gerar Novos Insights
        </button>
      </div>
    </div>
  );
}
```

---

### 5. 🛡️ AI Content Moderation

**O Problema:**
- Spam em chats de eventos
- Comentários ofensivos
- Eventos falsos/scam

**Nossa Solução:**
AI modera conteúdo automaticamente

**Features:**
- 🚫 **Auto-block spam** - Mensagens repetitivas, links suspeitos
- 🔞 **Detect inappropriate content** - Profanity, hate speech
- 🎭 **Fake event detection** - Preço anormal, imagens stock, descrição vaga
- ⚖️ **Automatic actions** - Delete message, warn user, ban repeat offenders

**Tech Stack:**
```typescript
// functions/src/ai/moderation/contentModerator.ts
import OpenAI from 'openai';

const openai = new OpenAI();

// On chat message created
export const moderateChatMessage = functions.firestore
  .document('event_chats/{chatId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();

    // OpenAI Moderation API (free!)
    const moderation = await openai.moderations.create({
      input: message.content,
    });

    const result = moderation.results[0];

    if (result.flagged) {
      // Flag message
      await snap.ref.update({
        flagged: true,
        moderationCategories: result.categories,
        moderationScores: result.category_scores,
      });

      // Auto-delete if high severity
      const highSeverity = ['hate', 'hate/threatening', 'violence', 'violence/graphic'];
      const hasHighSeverity = highSeverity.some(cat => result.categories[cat]);

      if (hasHighSeverity) {
        await snap.ref.update({ deleted: true });

        // Warn user
        await notifyUser(message.userId, 'Sua mensagem foi removida por violar regras da comunidade');

        // Log for review
        await db.collection('moderation_logs').add({
          messageId: snap.id,
          userId: message.userId,
          content: message.content,
          categories: result.categories,
          action: 'auto_delete',
          timestamp: new Date(),
        });
      }
    }
  });

// Spam detection
export async function detectSpam(message: string, userId: string): Promise<boolean> {
  // Check recent message frequency
  const recentMessages = await db
    .collection('event_chats')
    .where('userId', '==', userId)
    .where('createdAt', '>', new Date(Date.now() - 60000)) // Last minute
    .get();

  if (recentMessages.size > 10) {
    return true; // Too many messages
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /http[s]?:\/\//gi, // URLs
    /\b(viagra|casino|lottery|winner)\b/gi, // Spam keywords
    /(.)\1{5,}/gi, // Repeated characters
  ];

  return suspiciousPatterns.some(pattern => pattern.test(message));
}
```

---

### 6. 🌐 AI Translation (PT/EN/Crioulo)

**O Problema:**
- Users falam PT, EN, Crioulo
- Organizers escrevem só em PT
- Tradução manual é cara

**Nossa Solução:**
AI traduz automaticamente para 3 idiomas

**Features:**
- 🇵🇹 → 🇬🇧 → 🇨🇻 Auto-translate event content
- 🎤 Voice input em Crioulo → text
- 💬 Chat traduzido automaticamente
- 📧 Emails em idioma preferido do user

**Tech Stack:**
```typescript
// functions/src/ai/translation/translator.ts
export async function translateEventContent(event: Event) {
  const { title, description } = event;

  // Translate to English
  const enTranslation = await translateTo(title, description, 'en');

  // Translate to Crioulo (Cape Verdean Creole)
  const cvTranslation = await translateTo(title, description, 'cv');

  await db.collection('events').doc(event.id).update({
    titleEN: enTranslation.title,
    descriptionEN: enTranslation.description,
    titleCV: cvTranslation.title,
    descriptionCV: cvTranslation.description,
  });
}

async function translateTo(title: string, description: string, targetLang: 'en' | 'cv') {
  const langNames = { en: 'English', cv: 'Cape Verdean Creole' };

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'system',
      content: `Translate event content to ${langNames[targetLang]}. Maintain the tone and energy. For Cape Verdean Creole, use Santiago variant (Badiu).`,
    }, {
      role: 'user',
      content: `Title: ${title}\n\nDescription: ${description}`,
    }],
    temperature: 0.3, // Low temperature for consistency
  });

  const translated = completion.choices[0].message.content;
  const [translatedTitle, ...translatedDescParts] = translated.split('\n\n');

  return {
    title: translatedTitle.replace(/^Title:\s*/i, ''),
    description: translatedDescParts.join('\n\n').replace(/^Description:\s*/i, ''),
  };
}
```

---

### 7. 💰 AI Dynamic Pricing Optimizer

**O Problema:**
- Preço fixo deixa dinheiro na mesa
- Não sabem quando subir/baixar preço
- Sem dados para decisões

**Nossa Solução:**
ML prediz demanda e otimiza preço

**Features:**
- 📈 **Demand prediction** - Prevê quantos vão comprar
- 💵 **Price optimization** - Preço ideal para maximizar revenue
- ⏰ **Time-based pricing** - Quando baixar/subir preço
- 🎯 **Personalized pricing** - Desconto para fans leais

**ML Model:**
```python
# Demand prediction model
features = [
    - days_until_event
    - current_tickets_sold
    - sales_velocity (tickets/day)
    - event_category
    - price
    - organizer_reputation
    - day_of_week
    - weather_forecast
    - similar_event_performance
]

target = tickets_will_sell_in_next_7_days

model = RandomForestRegressor()
model.fit(X_train, y_train)

# Price optimization
def optimal_price(event, current_sales):
    demand_curve = []
    for price in range(10, 100, 5):
        predicted_sales = model.predict(price)
        revenue = price * predicted_sales
        demand_curve.append((price, revenue))

    optimal = max(demand_curve, key=lambda x: x[1])
    return optimal[0] # Optimal price
```

---

### 8. 📸 AI Photo Enhancement & Tagging

**O Problema:**
- Fotos de evento low quality
- Difícil encontrar fotos onde aparece
- Sem memórias organizadas

**Nossa Solução:**
AI melhora fotos e detecta faces

**Features:**
- ✨ **Auto-enhance** - Brightness, contrast, sharpness
- 👤 **Face recognition** - "Você aparece em 12 fotos"
- 🏷️ **Auto-tagging** - "dança", "palco", "multidão"
- 🎬 **Auto video recap** - Compila em vídeo com música
- 📤 **Easy sharing** - "Baixar todas minhas fotos"

**Tech Stack:**
```typescript
// functions/src/ai/vision/photoEnhancer.ts
import { ImageAnnotatorClient } from '@google-cloud/vision';
import sharp from 'sharp';

const vision = new ImageAnnotatorClient();

export async function enhanceEventPhoto(photoId: string) {
  const photo = await getPhoto(photoId);
  const imageBuffer = await downloadImage(photo.url);

  // Enhance with sharp
  const enhanced = await sharp(imageBuffer)
    .normalize() // Auto levels
    .sharpen() // Sharpen
    .modulate({
      brightness: 1.1,
      saturation: 1.2,
    })
    .toBuffer();

  // Detect faces with Google Vision
  const [result] = await vision.faceDetection(enhanced);
  const faces = result.faceAnnotations;

  // Detect labels/tags
  const [labels] = await vision.labelDetection(enhanced);
  const tags = labels.labelAnnotations.map(l => l.description);

  // Upload enhanced
  const enhancedUrl = await uploadImage(enhanced, `enhanced/${photoId}.jpg`);

  // Update photo
  await db.collection('event_photos').doc(photoId).update({
    enhancedUrl,
    faces: faces.length,
    tags,
    processed: true,
  });

  return { enhancedUrl, faces: faces.length, tags };
}
```

---

## 💰 Custo Total de AI (Mensal)

| Feature | Tecnologia | Uso Estimado | Custo/Mês |
|---------|------------|--------------|-----------|
| AI Chat Assistant | Claude 3.5 | 20k conversas | $30 |
| Poster Generation | FLUX Pro | 100 posters | $4 |
| Content Generation | GPT-4o mini | 500 texts | $2 |
| Recommendations | Embeddings + Pinecone | 100k queries | $5 |
| Analytics Insights | Claude 3.5 | 1k reports | $5 |
| Moderation | OpenAI (free) | Unlimited | $0 |
| Translation | GPT-4o mini | 300 events × 2 langs | $3 |
| Pricing Optimizer | Custom ML | Self-hosted | $0 |
| Photo Enhancement | Google Vision | 1k photos | $15 |
| **TOTAL** | | | **$64/mês** |

**ROI:**
- $64/mês de custo
- Se aumentar conversão 10% = +€5,000/mês revenue
- **ROI: 78x** 🚀

---

## 🗺️ Roadmap de Implementação AI

### FASE 1: AI Foundations (4 semanas) - €10-15k

**Setup:**
- [ ] OpenAI API integration
- [ ] Anthropic Claude API integration
- [ ] Replicate API integration
- [ ] Pinecone vector DB setup
- [ ] Google Vision API setup

**Features:**
1. ✅ AI Chat Assistant (chat básico)
2. ✅ AI Poster Generator
3. ✅ AI Content Moderation

**Resultado:**
- Chatbot funcional em 3 idiomas
- Posters automáticos
- Chat moderado

---

### FASE 2: AI Intelligence (4 semanas) - €10-15k

**Features:**
4. ✅ AI Recommendations (personalizadas)
5. ✅ AI Analytics Insights
6. ✅ AI Translation (PT/EN/CV)

**Resultado:**
- Feed personalizado
- Insights automáticos
- Conteúdo multilingual

---

### FASE 3: AI Advanced (4 semanas) - €10-15k

**Features:**
7. ✅ AI Dynamic Pricing
8. ✅ AI Photo Enhancement
9. ✅ AI Voice Assistant (bonus)

**Resultado:**
- Pricing otimizado
- Fotos melhoradas
- Voice commands

---

## 🎯 Decisão: Como Incorporar AI?

### Opção 1: AI COMPLETO (Todas as 8 features)
**Timeline:** 12 semanas
**Investimento:** €30-45k
**Resultado:** Plataforma AI-first

### Opção 2: AI ESSENCIAL (Top 4 features)
**Features:**
1. AI Chat Assistant
2. AI Poster Generator
3. AI Recommendations
4. AI Moderation

**Timeline:** 6-8 semanas
**Investimento:** €15-20k
**Resultado:** Experiência AI sólida

### Opção 3: AI HYBRID (Luma + AI + Inovação)
**Combine:**
- Luma Best (Calendars, Chat) - 6 semanas
- AI Essencial (4 features) - 6 semanas
- Nossa Inovação (Gamification, Live Dashboard) - 6 semanas

**Timeline:** 18 semanas (4-5 meses)
**Investimento:** €50-70k
**Resultado:** **LIDER DE MERCADO** 👑

---

## 📊 Comparação Final

| Abordagem | Features | Timeline | Investimento | Diferenciação |
|-----------|----------|----------|--------------|---------------|
| **Só Luma** | 15 | 3-4 meses | €30-45k | Paridade |
| **Só Inovação** | 12 | 4-5 meses | €40-55k | Único |
| **Só AI** | 8 | 3 meses | €30-45k | Tech-forward |
| **🏆 HYBRID** | **35** | **4-5 meses** | **€50-70k** | **Imbatível** |

---

## 🚀 Minha Recomendação: HYBRID COMPLETO

**Por Quê:**
1. ✅ Aproveita best practices (Luma)
2. ✅ Inova onde importa (Gamification, Live Dashboard)
3. ✅ AI em tudo (Chat, Recommendations, Insights)
4. ✅ Capitaliza vantagens (NFC, Wallet, Loyalty)
5. ✅ Impossível de copiar (muita integração)

**O Que Ficamos Com:**
- Event Calendars & Subscribers
- Guest Chat (networking)
- Event Blasts (comunicação)
- **+ AI Chat Assistant** 🤖
- **+ AI Poster Generator** 🎨
- **+ AI Recommendations** 🎯
- **+ Live Dashboard** 🔴
- **+ Gamification** 🎮
- **+ Collaborative Playlists** 🎵
- **+ NFC Food Pre-Order** 🍔
- **+ Carbon Footprint** 🌱

**= MELHOR PLATAFORMA DE EVENTOS DO MUNDO** 🌍

---

## ✅ Próximos Passos

1. ⬜ Aprovar estratégia de AI
2. ⬜ Decidir: AI Essencial, Completo, ou Hybrid?
3. ⬜ Setup API keys (OpenAI, Anthropic, Replicate)
4. ⬜ Começar com AI Chat Assistant (Semana 1)

**Quer começar com AI?** 🚀

---

**Documento Criado:** 2025-12-23
**Versão:** 1.0
**Status:** Aguardando Aprovação
