import * as functions from 'firebase-functions/v2';
import Anthropic from '@anthropic-ai/sdk';
import { getFirestore } from 'firebase-admin/firestore';
import type {
  ChatContext,
  ChatResponse,
  AIAction,
  ChatLanguage,
  ChatIntent
} from '../../shared-types';

// Lazy initialization
let anthropicClient: Anthropic | null = null;

function getAnthropic(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropicClient;
}

const LYRA_SYSTEM_PROMPT = `Você é a Lyra, a assistente virtual do Events.cv - a plataforma de eventos de Cabo Verde.

PERSONALIDADE:
- Simpática, acolhedora e entusiasta de eventos
- Cabo-verdiana de coração (conhece cultura, música, tradições)
- Usa emojis ocasionalmente (não exagera)
- Chama users pelo nome quando souber
- Positiva e encorajadora
- Profissional mas descontraída

IDIOMAS:
- Português (Portugal) - principal
- Inglês - fluente
- Crioulo cabo-verdiano (variante Santiago/Badiu) - nativo

CAPACIDADES:
1. Ajudar a descobrir eventos (pesquisar, recomendar, filtrar)
2. Responder perguntas sobre eventos (local, horário, preços, disponibilidade)
3. Assistir na compra de bilhetes (explicar tipos, descontos, processo)
4. Fornecer suporte técnico (problemas com conta, bilhetes, pagamentos)
5. Partilhar informações culturais cabo-verdianas
6. Criar FOMO (Fear Of Missing Out) quando eventos estão quase esgotados

REGRAS:
- NUNCA inventes informações - se não sabes, diz claramente
- Usa os dados fornecidos no contexto para personalizar respostas
- Menciona amigos que vão ao evento quando relevante
- Sugere eventos similares quando apropriado
- Sempre oferece ações concretas (botões) quando possível
- Sê breve - max 2-3 frases por resposta
- Adapta o idioma ao user automaticamente

AÇÕES QUE PODES SUGERIR:
- Comprar bilhetes
- Ver no mapa
- Partilhar evento
- Adicionar ao calendário
- Ver os meus bilhetes
- Contactar suporte
- Descobrir mais eventos

EXEMPLOS DE INTERAÇÃO:

User (PT): "Que eventos há hoje à noite?"
Lyra: "Hoje há 3 eventos fixes! 🎉 Tens kizomba no Quintal da Música, DJ set na Praia Negra, e stand-up comedy no Teatro Nacional. Qual é o teu mood?"

User (EN): "Is the Jazz festival sold out?"
Lyra: "Not yet, but it's close! 🔥 Only 23 tickets left out of 200. Your friends Ana and João are already going. Want to grab yours before they're gone?"

User (CV): "Undi ki tem festa oji?"
Lyra: "Oji ten festa na Quintal di Música - é kizomba! 💃 Ten tambe DJ na Praia Negra. Bu sta kerê?"`

/**
 * Build context from Firestore for personalized Lyra responses
 */
async function buildChatContext(
  userId: string,
  eventId?: string
): Promise<ChatContext> {
  const db = getFirestore();

  // Get user data
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();

  // Get user's past events
  const ticketsSnapshot = await db
    .collection('tickets')
    .where('userId', '==', userId)
    .where('status', '==', 'active')
    .orderBy('purchasedAt', 'desc')
    .limit(10)
    .get();

  const pastEvents = ticketsSnapshot.docs.map(doc => doc.data().eventId);

  // Get user's loyalty data
  const loyaltyDoc = await db.collection('loyalty').doc(userId).get();
  const loyaltyData = loyaltyDoc.data();

  const context: ChatContext = {
    user: {
      id: userId,
      name: userData?.name || 'amigo',
      language: userData?.language || 'pt',
      location: userData?.city,
      pastEvents,
      loyaltyTier: loyaltyData?.tier || 'bronze',
      loyaltyPoints: loyaltyData?.points || 0,
      favoriteCategories: userData?.favoriteCategories || [],
    },
    conversationHistory: [],
  };

  // If specific event context requested
  if (eventId) {
    const eventDoc = await db.collection('events').doc(eventId).get();
    const eventData = eventDoc.data();

    if (eventData) {
      // Get ticket availability
      const ticketTypesSnapshot = await db
        .collection('events')
        .doc(eventId)
        .collection('ticketTypes')
        .get();

      const ticketTypes = ticketTypesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          name: data.name,
          price: data.price,
          available: data.quantity - data.sold,
        };
      });

      const totalAvailable = ticketTypes.reduce((sum, tt) => sum + tt.available, 0);
      const totalCapacity = ticketTypes.reduce((sum, tt) => sum + tt.available + (eventData.sold || 0), 0);
      const percentageSold = totalCapacity > 0 ? ((eventData.sold || 0) / totalCapacity) * 100 : 0;

      // Get friends going to this event
      const friendIds = userData?.friends || [];
      const friendTicketsSnapshot = await db
        .collection('tickets')
        .where('eventId', '==', eventId)
        .where('userId', 'in', friendIds.slice(0, 10)) // Firestore 'in' limit
        .get();

      context.event = {
        id: eventId,
        title: eventData.title,
        category: eventData.category,
        date: eventData.date.toDate(),
        time: eventData.time,
        venue: eventData.venue,
        address: eventData.address,
        city: eventData.city,
        ticketTypes,
        totalAvailable,
        percentageSold,
        friendsGoing: friendTicketsSnapshot.size,
      };
    }
  }

  // Get conversation history (last 10 messages)
  const messagesSnapshot = await db
    .collection('chatMessages')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(10)
    .get();

  context.conversationHistory = messagesSnapshot.docs
    .reverse()
    .map((doc) => {
      const data = doc.data();
      return {
        role: data.role as 'user' | 'assistant' | 'system',
        content: data.content,
      };
    });

  return context;
}

/**
 * Detect intent from user message
 */
function detectIntent(message: string): ChatIntent {
  const lower = message.toLowerCase();

  if (lower.includes('comprar') || lower.includes('bilhete') || lower.includes('buy') || lower.includes('ticket')) {
    return 'purchase';
  }
  if (lower.includes('problema') || lower.includes('ajuda') || lower.includes('help') || lower.includes('support')) {
    return 'support';
  }
  if (lower.includes('descobrir') || lower.includes('procurar') || lower.includes('search') || lower.includes('find')) {
    return 'discovery';
  }
  if (lower.includes('feedback') || lower.includes('opinião') || lower.includes('sugestão')) {
    return 'feedback';
  }

  return 'question';
}

/**
 * Extract action buttons from Lyra's response
 */
function extractActions(
  responseText: string,
  context: ChatContext,
  intent: ChatIntent
): AIAction[] {
  const actions: AIAction[] = [];

  // If event context exists and user seems interested in purchasing
  if (context.event && (intent === 'purchase' || responseText.includes('comprar') || responseText.includes('buy'))) {
    actions.push({
      label: 'Comprar Bilhetes',
      action: 'buy_tickets',
      data: { eventId: context.event.id },
    });
  }

  // If event context exists, offer to show map
  if (context.event) {
    actions.push({
      label: 'Ver no Mapa',
      action: 'show_map',
      data: { eventId: context.event.id },
    });

    actions.push({
      label: 'Partilhar',
      action: 'share',
      data: { eventId: context.event.id },
    });

    actions.push({
      label: 'Adicionar ao Calendário',
      action: 'add_to_calendar',
      data: { eventId: context.event.id },
    });
  }

  // If discovery intent, offer to browse
  if (intent === 'discovery') {
    actions.push({
      label: 'Descobrir Eventos',
      action: 'browse_events',
    });
  }

  // If support intent, offer contact support
  if (intent === 'support') {
    actions.push({
      label: 'Contactar Suporte',
      action: 'contact_support',
    });
  }

  return actions;
}

/**
 * Main Lyra chat function
 */
export const chat = functions.https.onCall(
  {
    region: 'europe-west1',
    cors: ['https://events.cv', 'https://www.events.cv'],
  },
  async (request) => {
    const { message, userId, eventId, language } = request.data;

    if (!message || !userId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Message and userId are required'
      );
    }

    try {
      const db = getFirestore();

      // Build context
      const context = await buildChatContext(userId, eventId);

      // Detect intent
      const intent = detectIntent(message);

      // Build messages for Claude
      const messages: Anthropic.Messages.MessageParam[] = [
        // Add conversation history
        ...context.conversationHistory.map(msg => ({
          role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content,
        })),
        // Add current message with context
        {
          role: 'user',
          content: `${message}

CONTEXT:
- User: ${context.user.name} (${context.user.loyaltyTier} tier, ${context.user.loyaltyPoints} pontos)
- Language: ${context.user.language}
- Location: ${context.user.location || 'unknown'}
- Past events: ${context.user.pastEvents.length}
${context.event ? `
- Current Event: ${context.event.title}
- Date: ${context.event.date.toLocaleDateString('pt-PT')} às ${context.event.time}
- Available: ${context.event.totalAvailable} bilhetes (${context.event.percentageSold.toFixed(0)}% vendidos)
- Friends going: ${context.event.friendsGoing}
- Tickets: ${context.event.ticketTypes.map(tt => `${tt.name} (€${tt.price})`).join(', ')}
` : ''}`,
        },
      ];

      // Call Claude API
      const response = await getAnthropic().messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        system: LYRA_SYSTEM_PROMPT,
        messages,
      });

      const responseText = response.content[0].type === 'text'
        ? response.content[0].text
        : '';

      // Extract actions
      const actions = extractActions(responseText, context, intent);

      // Save user message to Firestore
      await db.collection('chatMessages').add({
        userId,
        eventId: eventId || null,
        role: 'user',
        content: message,
        language: language || context.user.language,
        metadata: {
          intent,
          confidence: 0.8,
        },
        createdAt: new Date(),
      });

      // Save Lyra's response to Firestore
      await db.collection('chatMessages').add({
        userId,
        eventId: eventId || null,
        role: 'assistant',
        content: responseText,
        language: language || context.user.language,
        metadata: {
          model: 'claude-3-5-sonnet-20241022',
          actions: actions.map(a => a.action),
        },
        createdAt: new Date(),
      });

      const chatResponse: ChatResponse = {
        message: responseText,
        actions,
        conversationId: userId, // Simple conversation ID for now
        language: (language || context.user.language) as ChatLanguage,
      };

      return chatResponse;
    } catch (error) {
      console.error('Lyra chat error:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to process chat message'
      );
    }
  }
);
