# Events.cv: Plano Executivo - Hybrid Supremo
## 4-5 Meses para Liderança Absoluta de Mercado

---

## 🎯 Missão

**Transformar Events.cv na plataforma de eventos MAIS INOVADORA e COMPLETA do mundo, combinando:**
- ✅ Best practices comprovadas (Luma)
- ✅ Inovação única (Gamification, Live Dashboard)
- ✅ Inteligência Artificial (8 features AI)
- ✅ Vantagens existentes (NFC, Wallet, Loyalty)

**Timeline:** 18-20 semanas (4.5-5 meses)
**Investimento:** €60,000 - €80,000
**Resultado:** Plataforma impossível de competir

---

## 📊 O Que Vamos Construir (23 Features)

### CATEGORIA A: Do Luma (Comprovado) - 6 features
1. Event Calendars & Subscribers
2. Guest Chat (real-time)
3. Event Blasts (Email/SMS/Push)
4. Social Sharing Optimization (OG tags)
5. Add to Calendar (iOS/Android/Google)
6. Waitlist Management

### CATEGORIA B: Nossa Inovação (Único) - 9 features
7. Live Event Dashboard (FOMO + Social Proof)
8. Gamification (Achievements, Challenges, Leaderboards)
9. Dynamic Ticket Pricing (Surge Pricing)
10. Collaborative Playlists (Spotify/YouTube)
11. Local Talent Marketplace
12. Food & Drink Pre-Order (NFC)
13. Carbon Footprint Tracker
14. Community Event Voting
15. Event Cloning & Templates

### CATEGORIA C: AI Powered (Inteligente) - 8 features
16. AI Chat Assistant (Claude 3.5)
17. AI Poster Generator (FLUX Pro)
18. AI Recommendations (Personalized)
19. AI Analytics Insights
20. AI Content Moderation
21. AI Translation (PT/EN/Crioulo)
22. AI Dynamic Pricing Optimizer
23. AI Photo Enhancement

---

## 🗓️ Roadmap Executivo (20 Semanas)

### **MÊS 1: Fundação + Quick Wins** (Semanas 1-4)

#### Semana 1: Setup & Infrastructure
**Objetivo:** Preparar infraestrutura técnica

**Tarefas Técnicas:**
- [ ] Setup OpenAI API ($50 credits)
- [ ] Setup Anthropic Claude API ($50 credits)
- [ ] Setup Replicate API (FLUX Pro)
- [ ] Setup Pinecone (vector DB - free tier)
- [ ] Setup SendGrid advanced features
- [ ] Setup Twilio para SMS
- [ ] Criar Firebase collections novas
- [ ] Setup n8n.pagali.ai webhooks

**Shared Types:**
```bash
cd packages/shared-types
# Adicionar novos types
src/
├── ai.ts           # AI types
├── gamification.ts # Achievements, challenges
├── calendar.ts     # Calendar types
├── chat.ts         # Chat messages
├── music.ts        # Playlists, song requests
├── talent.ts       # Talent marketplace
└── webhooks.ts     # Webhook types
```

**Firestore Collections:**
```
/calendars/{calendarId}
/calendar_subscribers/{subscriberId}
/event_chats/{eventId}/messages/{messageId}
/event_blasts/{blastId}
/waitlists/{entryId}
/achievements/{achievementId}
/user_achievements/{userId}/achievements/{achievementId}
/leaderboards/{leaderboardId}
/song_requests/{requestId}
/talent_profiles/{talentId}
/food_orders/{orderId}
/webhooks/{webhookId}
/webhook_deliveries/{deliveryId}
/chat_messages/{messageId} # AI chat
/ai_generated_content/{contentId}
```

**Deliverables:**
- ✅ Todas APIs configuradas
- ✅ Types implementados
- ✅ Collections criadas
- ✅ n8n webhooks funcionais

**Budget:** €2,000 (setup + API credits)

---

#### Semana 2: Social Sharing + Add to Calendar
**Objetivo:** Viralização e conversão

**Features:**
- [ ] Open Graph meta tags dinâmicos
- [ ] Twitter card tags
- [ ] Dynamic OG image generation (AI)
- [ ] Add to Calendar button (iOS/Android/Google)
- [ ] .ics file generation
- [ ] Google Calendar deep link

**Implementation:**
```typescript
// apps/web/app/events/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const event = await getEvent(params.slug);

  return {
    title: event.title,
    description: event.description,
    openGraph: {
      title: event.title,
      description: event.description,
      images: [
        {
          url: event.coverImage || await generateOGImage(event.id),
          width: 1200,
          height: 630,
        }
      ],
      type: 'website',
      locale: 'pt_PT',
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description: event.description,
      images: [event.coverImage],
    },
  };
}

// components/event/AddToCalendar.tsx
export function AddToCalendar({ event }: Props) {
  const generateICS = () => {
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatDate(event.startDate)}
DTEND:${formatDate(event.endDate)}
SUMMARY:${event.title}
LOCATION:${event.venue}, ${event.address}
DESCRIPTION:${event.description}
URL:https://events.cv/events/${event.slug}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.slug}.ics`;
    link.click();
  };

  const addToGoogle = () => {
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatGoogleDate(event.startDate)}/${formatGoogleDate(event.endDate)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.venue)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="dropdown">
      <button className="btn btn-secondary">
        📅 Adicionar ao Calendário
      </button>
      <div className="dropdown-menu">
        <button onClick={addToGoogle}>Google Calendar</button>
        <button onClick={generateICS}>Apple Calendar</button>
        <button onClick={generateICS}>Outlook</button>
      </div>
    </div>
  );
}
```

**Deliverables:**
- ✅ OG tags em todos eventos
- ✅ Add to Calendar funcionando
- ✅ Social sharing otimizado

**Budget:** €3,000

---

#### Semana 3: AI Chat Assistant
**Objetivo:** Suporte 24/7 automático

**Implementation:**
```typescript
// functions/src/ai/chat/eventAssistant.ts
import Anthropic from '@anthropic-ai/sdk';

export const chatWithAssistant = functions.https.onCall(async (data, context) => {
  const { message, eventId, language = 'pt' } = data;

  const chatContext = await buildContext(context.auth.uid, eventId);

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 500,
    system: buildSystemPrompt(chatContext, language),
    messages: [
      ...chatContext.conversationHistory,
      { role: 'user', content: message }
    ],
  });

  await saveChatMessage(response);

  return {
    message: response.content[0].text,
    suggestions: extractSuggestions(response.content[0].text),
  };
});

// apps/web/components/ai/ChatWidget.tsx
export function AIChatWidget({ eventId }: Props) {
  // Chat UI implementation
  // Real-time messaging
  // Action suggestions
}
```

**Deliverables:**
- ✅ Chatbot funcional
- ✅ Responde em PT/EN/CV
- ✅ Context-aware
- ✅ Widget flutuante

**Budget:** €4,000

---

#### Semana 4: AI Poster Generator
**Objetivo:** Posters profissionais em segundos

**Implementation:**
```typescript
// functions/src/ai/generation/posterGenerator.ts
import Replicate from 'replicate';

export const generateEventPoster = functions.https.onCall(async (data) => {
  const { eventId, style } = data;
  const event = await getEvent(eventId);

  const output = await replicate.run("black-forest-labs/flux-1.1-pro", {
    input: {
      prompt: buildPosterPrompt(event, style),
      aspect_ratio: "4:3",
      output_quality: 90,
    }
  });

  const publicUrl = await uploadToStorage(output[0]);

  await updateEvent(eventId, { coverImage: publicUrl });

  return { imageUrl: publicUrl };
});

// apps/admin/components/events/PosterGenerator.tsx
export function PosterGenerator({ eventId }: Props) {
  // Style selector
  // Generate button
  // Preview
}
```

**Deliverables:**
- ✅ 4 estilos (vibrant, minimal, elegant, dark)
- ✅ Geração em <10s
- ✅ Upload automático

**Budget:** €3,000

**MÊS 1 TOTAL:** €12,000 | **4 Features Completas**

---

### **MÊS 2: Engagement & Community** (Semanas 5-8)

#### Semana 5-6: Event Calendars & Subscribers
**Objetivo:** Comunidades recorrentes

**Features:**
- [ ] Calendar CRUD
- [ ] Public calendar pages
- [ ] Subscribe/unsubscribe
- [ ] Email notifications para subscribers
- [ ] Calendar analytics

**Implementation:**
```typescript
// Backend
export const createCalendar = functions.https.onCall(async (data, context) => {
  const { name, description, visibility } = data;

  const calendarRef = await db.collection('calendars').add({
    organizationId: context.auth.token.organizationId,
    name,
    slug: slugify(name),
    description,
    visibility,
    subscriberCount: 0,
    eventCount: 0,
    createdAt: new Date(),
  });

  return { calendarId: calendarRef.id };
});

export const subscribeToCalendar = functions.https.onCall(async (data, context) => {
  const { calendarId } = data;

  await db.collection('calendar_subscribers').add({
    calendarId,
    userId: context.auth.uid,
    emailNotifications: true,
    pushNotifications: true,
    subscribedAt: new Date(),
  });

  await db.collection('calendars').doc(calendarId).update({
    subscriberCount: admin.firestore.FieldValue.increment(1)
  });

  return { success: true };
});

// Frontend
// apps/web/app/calendars/[slug]/page.tsx
export default function CalendarPage({ params }) {
  const { calendar, events, isSubscribed } = useCalendar(params.slug);

  return (
    <div>
      <CalendarHeader calendar={calendar} />
      <SubscribeButton calendarId={calendar.id} isSubscribed={isSubscribed} />
      <EventList events={events} />
    </div>
  );
}
```

**Deliverables:**
- ✅ Calendars funcionais
- ✅ Subscribe system
- ✅ Notifications
- ✅ Public pages

**Budget:** €6,000

---

#### Semana 7: Guest Chat (Real-time)
**Objetivo:** Networking entre attendees

**Implementation:**
```typescript
// Real-time Firestore listeners
// apps/web/hooks/useEventChat.ts
export function useEventChat(eventId: string) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const unsubscribe = db
      .collection('event_chats')
      .doc(eventId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .onSnapshot((snapshot) => {
        const msgs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMessages(msgs);
      });

    return unsubscribe;
  }, [eventId]);

  const sendMessage = async (message: string) => {
    await db
      .collection('event_chats')
      .doc(eventId)
      .collection('messages')
      .add({
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatarUrl,
        message,
        deleted: false,
        createdAt: new Date(),
      });
  };

  return { messages, sendMessage };
}

// apps/web/components/chat/ChatWindow.tsx
// Real-time chat UI
// Image sharing
// Moderation controls
```

**Deliverables:**
- ✅ Real-time messaging
- ✅ Image sharing
- ✅ User profiles
- ✅ Moderation

**Budget:** €4,000

---

#### Semana 8: Event Blasts
**Objetivo:** Comunicação em massa

**Implementation:**
```typescript
// functions/src/communication/sendEventBlast.ts
export const sendEventBlast = functions.https.onCall(async (data, context) => {
  const { eventId, subject, message, channels, recipientFilter } = data;

  const recipients = await getBlastRecipients(eventId, recipientFilter);

  const blastRef = await db.collection('event_blasts').add({
    eventId,
    subject,
    message,
    channels,
    recipientCount: recipients.length,
    sentCount: 0,
    createdBy: context.auth.uid,
    createdAt: new Date(),
  });

  // Queue deliveries
  for (const recipient of recipients) {
    if (channels.includes('email')) {
      await sendEmail(recipient.email, subject, message);
    }
    if (channels.includes('sms') && recipient.phone) {
      await sendSMS(recipient.phone, message);
    }
    if (channels.includes('push')) {
      await sendPushNotification(recipient.userId, subject, message);
    }
  }

  return { success: true, blastId: blastRef.id };
});

// apps/admin/components/communication/BlastComposer.tsx
// Email/SMS/Push composer
// Recipient filter
// Schedule
// Preview
```

**Deliverables:**
- ✅ Multi-channel blasts
- ✅ Recipient filtering
- ✅ Scheduling
- ✅ Tracking

**Budget:** €4,000

**MÊS 2 TOTAL:** €14,000 | **3 Features Completas** (Total: 7)

---

### **MÊS 3: Gamification & Innovation** (Semanas 9-12)

#### Semana 9-10: Gamification System
**Objetivo:** Engagement 3x maior

**Features:**
- [ ] Achievement system
- [ ] Challenge system
- [ ] Leaderboards
- [ ] Points & rewards
- [ ] Badges & tiers

**Implementation:**
```typescript
// functions/src/gamification/checkAchievements.ts
export const checkAchievements = functions.firestore
  .document('checkins/{checkinId}')
  .onCreate(async (snap, context) => {
    const checkin = snap.data();
    const userId = checkin.userId;

    // Check Early Bird
    const event = await getEvent(checkin.eventId);
    const minutesSinceStart = (checkin.timestamp - event.startDate) / 60000;

    if (minutesSinceStart < 30) {
      await unlockAchievement(userId, 'early_bird');
      await addLoyaltyPoints(userId, 50);
    }

    // Check event count achievements
    const userEvents = await getUserEventCount(userId);
    if (userEvents === 5) await unlockAchievement(userId, 'event_explorer');
    if (userEvents === 10) await unlockAchievement(userId, 'superfan');
    if (userEvents === 50) await unlockAchievement(userId, 'legend');

    // Update leaderboards
    await updateLeaderboard(userId, 'events_attended', 1);
  });

// Seed achievements
const achievements = [
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Check-in nos primeiros 30 minutos',
    icon: '🎉',
    points: 50,
    rarity: 'common',
  },
  {
    id: 'superfan',
    name: 'Superfan',
    description: 'Participou em 10 eventos',
    icon: '⭐',
    points: 200,
    rarity: 'rare',
  },
  {
    id: 'party_animal',
    name: 'Party Animal',
    description: '3 eventos numa semana',
    icon: '💃',
    points: 100,
    rarity: 'rare',
  },
  {
    id: 'vip_status',
    name: 'VIP Status',
    description: 'Gastou €500+ em eventos',
    icon: '💎',
    points: 500,
    rarity: 'epic',
  },
  {
    id: 'legend',
    name: 'Lenda',
    description: '50 eventos participados',
    icon: '👑',
    points: 1000,
    rarity: 'legendary',
  },
];

// apps/web/app/profile/achievements/page.tsx
export default function AchievementsPage() {
  const { achievements, leaderboard, challenges } = useGamification();

  return (
    <div>
      <StatsOverview />
      <AchievementGrid achievements={achievements} />
      <ActiveChallenges challenges={challenges} />
      <Leaderboard entries={leaderboard} />
    </div>
  );
}
```

**Deliverables:**
- ✅ 20+ achievements
- ✅ Leaderboards (daily, weekly, monthly)
- ✅ Challenge system
- ✅ Badge display

**Budget:** €7,000

---

#### Semana 11: Live Event Dashboard
**Objetivo:** FOMO e social proof

**Implementation:**
```typescript
// Real-time stats
export const onTicketPurchased = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const order = snap.data();

    await db.collection('events').doc(order.eventId).collection('live_stats').add({
      type: 'purchase',
      userName: order.guestInfo?.name || 'Anónimo',
      userAvatar: order.userId ? (await getUser(order.userId)).avatarUrl : null,
      ticketCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      timestamp: new Date(),
    });

    // Update aggregates
    await updateLiveAggregates(order.eventId);
  });

// apps/web/components/event/LiveDashboard.tsx
export function LiveEventDashboard({ eventId }: Props) {
  const { stats, recentBuyers } = useLiveStats(eventId);

  return (
    <div className="live-dashboard">
      <div className="stat">
        🔴 Últimos 10 min: <strong>{stats.last10MinSales}</strong> bilhetes
      </div>
      <div className="capacity-bar">
        <div className="fill" style={{ width: `${stats.capacityPercent}%` }} />
        <span>{stats.capacityPercent}% vendido</span>
      </div>
      <div className="countdown">
        ⏰ Preço sobe em <Countdown until={stats.nextPriceIncrease} />
      </div>
      <div className="recent-buyers">
        {recentBuyers.map(buyer => (
          <div key={buyer.id} className="buyer">
            <Avatar src={buyer.avatar} />
            <span>{buyer.name} comprou {buyer.tickets} bilhetes</span>
            <TimeAgo date={buyer.timestamp} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Deliverables:**
- ✅ Real-time sales counter
- ✅ Capacity bar
- ✅ Recent buyers feed
- ✅ Price countdown

**Budget:** €4,000

---

#### Semana 12: Waitlist + Dynamic Pricing
**Objetivo:** Captura demanda + otimização revenue

**Implementation:**
```typescript
// Waitlist
export const joinWaitlist = functions.https.onCall(async (data, context) => {
  const { eventId, email, name } = data;

  const position = await getWaitlistPosition(eventId);

  await db.collection('waitlists').add({
    eventId,
    userId: context.auth?.uid,
    email,
    name,
    position,
    notified: false,
    createdAt: new Date(),
  });

  return { position };
});

export const onTicketAvailable = functions.firestore
  .document('ticket_types/{ticketTypeId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    const beforeAvailable = before.quantityTotal - before.quantitySold;
    const afterAvailable = after.quantityTotal - after.quantitySold;

    if (beforeAvailable === 0 && afterAvailable > 0) {
      const waitlist = await getWaitlistEntries(after.eventId);
      const toNotify = waitlist.slice(0, afterAvailable);

      for (const entry of toNotify) {
        await sendWaitlistNotification(entry);
      }
    }
  });

// Dynamic Pricing
export const calculateCurrentPrice = functions.https.onCall(async (data) => {
  const { eventId, ticketTypeId } = data;

  const ticketType = await getTicketType(eventId, ticketTypeId);
  const pricing = await getDynamicPricing(eventId);

  if (!pricing.enabled) {
    return { price: ticketType.price };
  }

  let currentPrice = pricing.basePrice;

  // Capacity tier
  const sold = ticketType.quantitySold;
  const tier = pricing.tiers.find(t => sold >= t.fromQuantity && sold < t.toQuantity);
  if (tier) {
    currentPrice = tier.price;
  }

  // Surge pricing
  const recentSales = await getSalesVelocity(eventId, 60);
  const surgeRule = pricing.surgeRules.find(r => r.trigger === 'sales_velocity');
  if (surgeRule && recentSales >= surgeRule.threshold) {
    currentPrice += surgeRule.priceIncrease;
  }

  return {
    price: currentPrice,
    tier: tier?.name,
    nextTier: pricing.tiers.find(t => t.fromQuantity > sold),
  };
});
```

**Deliverables:**
- ✅ Waitlist system
- ✅ Auto-notifications
- ✅ Dynamic pricing
- ✅ Surge rules

**Budget:** €5,000

**MÊS 3 TOTAL:** €16,000 | **3 Features Completas** (Total: 10)

---

### **MÊS 4: AI Intelligence** (Semanas 13-16)

#### Semana 13: AI Recommendations
**Objetivo:** Descoberta personalizada

**Implementation:**
```typescript
// Embeddings + Vector search
import OpenAI from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';

export async function createEventEmbedding(event: Event) {
  const text = `${event.title} ${event.description} ${event.category} ${event.tags.join(' ')}`;

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  await pinecone.index('events').upsert([{
    id: event.id,
    values: response.data[0].embedding,
    metadata: {
      title: event.title,
      category: event.category,
      city: event.city,
      price: event.ticketTypes[0]?.price || 0,
    }
  }]);
}

export async function getRecommendations(userId: string) {
  const user = await getUser(userId);
  const userHistory = await getUserEventHistory(userId);

  const profileText = buildUserProfile(user, userHistory);

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: profileText,
  });

  const queryResponse = await pinecone.index('events').query({
    vector: response.data[0].embedding,
    topK: 20,
    includeMetadata: true,
    filter: { date: { $gte: Date.now() } }
  });

  // Re-rank with friend signals
  const scored = await Promise.all(
    queryResponse.matches.map(async match => {
      const event = await getEvent(match.id);
      const friendsGoing = await getFriendsAttending(userId, match.id);

      const finalScore =
        match.score * 0.4 +
        (friendsGoing.length / 10) * 0.3 +
        locationScore(user.city, event.city) * 0.15 +
        priceScore(user.wallet.totalSpent, event.price) * 0.1 +
        freshnessScore(event.publishedAt) * 0.05;

      return { event, score: finalScore, friendsGoing };
    })
  );

  return scored.sort((a, b) => b.score - a.score).slice(0, 10);
}
```

**Deliverables:**
- ✅ Personalized feed
- ✅ Friend signals
- ✅ Match percentage
- ✅ Reasons display

**Budget:** €5,000

---

#### Semana 14: AI Analytics Insights
**Objetivo:** Insights acionáveis automáticos

**Implementation:**
```typescript
export const generateEventInsights = functions.https.onCall(async (data) => {
  const { eventId } = data;

  const event = await getEvent(eventId);
  const analytics = await getEventAnalytics(eventId);
  const similarEvents = await getSimilarEvents(event);

  const analyticsContext = `
Evento: ${event.title}
Vendidos: ${event.ticketsSold}/${event.totalCapacity} (${(event.ticketsSold / event.totalCapacity * 100).toFixed(1)}%)
Dias até evento: ${Math.ceil((event.startDate - new Date()) / (1000 * 60 * 60 * 24))}
Preço médio: €${analytics.avgTicketPrice}

Vendas últimos 7 dias:
${analytics.last7Days.map(d => `${d.date}: ${d.sales}`).join('\n')}

Benchmark (eventos similares):
${similarEvents.map(e => `${e.title}: ${e.sellThroughRate}%`).join('\n')}

Views: ${event.views}
Conversão: ${(event.ticketsSold / event.views * 100).toFixed(1)}%
`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1000,
    system: `Você é um analista de eventos expert. Dá insights acionáveis.

Regras:
- Identifique padrões
- Explique PORQUÊ
- Sugira ações específicas
- Use emojis (🔥 positivo, ⚠️ alerta, 💡 sugestão)`,
    messages: [{
      role: 'user',
      content: `Analise este evento:\n\n${analyticsContext}`,
    }],
  });

  return { insights: response.content[0].text };
});
```

**Deliverables:**
- ✅ Auto-insights
- ✅ Comparisons
- ✅ Action suggestions
- ✅ Alerts

**Budget:** €4,000

---

#### Semana 15: AI Moderation + Translation
**Objetivo:** Conteúdo seguro e multilingual

**Implementation:**
```typescript
// Moderation
export const moderateChatMessage = functions.firestore
  .document('event_chats/{chatId}/messages/{messageId}')
  .onCreate(async (snap) => {
    const message = snap.data();

    const moderation = await openai.moderations.create({
      input: message.content,
    });

    if (moderation.results[0].flagged) {
      await snap.ref.update({
        flagged: true,
        deleted: moderation.results[0].categories.hate || moderation.results[0].categories.violence,
      });
    }
  });

// Translation
export async function translateEventContent(event: Event) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'system',
      content: 'Translate to English and Cape Verdean Creole (Santiago variant)',
    }, {
      role: 'user',
      content: `Title: ${event.title}\nDescription: ${event.description}`,
    }],
  });

  // Parse and save translations
}
```

**Deliverables:**
- ✅ Auto-moderation
- ✅ PT/EN/CV translations
- ✅ Spam detection

**Budget:** €3,000

---

#### Semana 16: Collaborative Playlists + Talent Marketplace
**Objetivo:** Experiência física melhorada

**Features:**
- [ ] Spotify integration
- [ ] Song requests
- [ ] Vote system
- [ ] Talent profiles
- [ ] Booking system

**Budget:** €6,000

**MÊS 4 TOTAL:** €18,000 | **5 Features Completas** (Total: 15)

---

### **MÊS 5: Integration & Polish** (Semanas 17-20)

#### Semana 17: n8n Integration + Zoom
**Objetivo:** Conectividade externa

**Features:**
- [ ] Webhook system
- [ ] n8n workflows
- [ ] Zoom OAuth
- [ ] Auto-create meetings

**Budget:** €6,000

---

#### Semana 18: Event Cloning + Templates
**Objetivo:** Produtividade organizers

**Features:**
- [ ] Clone events
- [ ] Save as template
- [ ] Template library
- [ ] Bulk operations

**Budget:** €4,000

---

#### Semana 19: Food Pre-Order + Carbon Tracker
**Objetivo:** Sustentabilidade e conveniência

**Features:**
- [ ] Vendor menus
- [ ] NFC ordering
- [ ] Carbon calculator
- [ ] Offset options

**Budget:** €6,000

---

#### Semana 20: Testing, Polish & Launch
**Objetivo:** Preparação para lançamento

**Tasks:**
- [ ] End-to-end testing
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Documentation
- [ ] Marketing materials
- [ ] Soft launch

**Budget:** €4,000

**MÊS 5 TOTAL:** €20,000 | **8 Features Completas** (Total: 23)

---

## 💰 Budget Breakdown Completo

### Desenvolvimento (por mês)

| Mês | Features | Horas | Custo |
|-----|----------|-------|-------|
| Mês 1 | Setup + 4 features | 320h | €12,000 |
| Mês 2 | 3 features | 300h | €14,000 |
| Mês 3 | 3 features | 340h | €16,000 |
| Mês 4 | 5 features | 360h | €18,000 |
| Mês 5 | 8 features | 400h | €20,000 |
| **TOTAL** | **23 features** | **1720h** | **€80,000** |

### Infraestrutura & APIs (5 meses)

| Serviço | Mensal | 5 Meses |
|---------|--------|---------|
| OpenAI API | €30 | €150 |
| Anthropic Claude | €30 | €150 |
| Replicate (FLUX) | €10 | €50 |
| Pinecone | €0 (free) | €0 |
| SendGrid | €30 | €150 |
| Twilio SMS | €50 | €250 |
| Firebase (incremento) | €100 | €500 |
| Google Vision | €15 | €75 |
| **TOTAL** | **€265/mês** | **€1,325** |

### **INVESTIMENTO TOTAL: €81,325**
### **Com margem 10%: €90,000**

---

## 🎯 KPIs & Métricas de Sucesso

### Após Mês 1 (4 features)
- [ ] 100 eventos com OG tags otimizados
- [ ] 500 Add to Calendar clicks
- [ ] 1,000 conversas no AI chatbot
- [ ] 50 posters gerados com AI

### Após Mês 2 (7 features)
- [ ] 10 calendars criados
- [ ] 500 subscribers totais
- [ ] 50 eventos com chat ativo
- [ ] 200 blasts enviados

### Após Mês 3 (10 features)
- [ ] 500 achievements desbloqueados
- [ ] 10,000 eventos visualizaram live dashboard
- [ ] 100 eventos com dynamic pricing
- [ ] 200 pessoas em waitlists

### Após Mês 4 (15 features)
- [ ] 2x descoberta de eventos (recommendations)
- [ ] 100 insights gerados automaticamente
- [ ] 1,000 mensagens moderadas
- [ ] 50 talents registados

### Após Mês 5 (23 features)
- [ ] 20 eventos com Zoom
- [ ] 10 organizações usando n8n
- [ ] 100 eventos clonados
- [ ] 20 eventos carbon neutral

### 🏆 Métricas de Negócio (6 meses pós-lançamento)
- [ ] 10,000+ eventos criados
- [ ] 100,000+ tickets vendidos
- [ ] €500,000+ GMV
- [ ] 50+ organizações premium
- [ ] 40%+ monthly retention
- [ ] 4.5+ rating app stores

---

## 🚀 AÇÃO IMEDIATA - Esta Semana

### Segunda-feira (Hoje)
- [x] ✅ Aprovar plano executivo
- [ ] ⬜ Confirmar budget (€80-90k)
- [ ] ⬜ Recrutar equipa (se necessário)
- [ ] ⬜ Setup project management (Linear/Jira)

### Terça-feira
- [ ] ⬜ Criar branch `feature/hybrid-supremo`
- [ ] ⬜ Setup OpenAI API key
- [ ] ⬜ Setup Anthropic Claude API key
- [ ] ⬜ Setup Replicate API key
- [ ] ⬜ Setup Pinecone account

### Quarta-feira
- [ ] ⬜ Implementar shared types (ai.ts, gamification.ts, etc)
- [ ] ⬜ Criar Firestore collections
- [ ] ⬜ Setup SendGrid templates

### Quinta-feira
- [ ] ⬜ Começar AI Chat Assistant
- [ ] ⬜ Implementar chat UI básico
- [ ] ⬜ Test Claude API integration

### Sexta-feira
- [ ] ⬜ Deploy AI chatbot (MVP)
- [ ] ⬜ Demo interno
- [ ] ⬜ Planejar Semana 2

---

## 📞 Equipa Recomendada

### Opção A: Equipa Lean (Mais tempo)
- **1 Full-Stack Senior** (40h/semana) - €40/h
- **1 Mobile Developer** (20h/semana) - €35/h
- **1 UI/UX Designer** (10h/semana) - €30/h

**Timeline:** 22-24 semanas
**Custo:** €75,000

### Opção B: Equipa Ideal (Recomendado)
- **1 Full-Stack Senior** (40h/semana) - €40/h
- **1 Full-Stack Mid** (40h/semana) - €35/h
- **1 Mobile Developer** (30h/semana) - €35/h
- **1 UI/UX Designer** (15h/semana) - €30/h
- **1 QA Tester** (15h/semana) - €25/h

**Timeline:** 18-20 semanas (conforme plano)
**Custo:** €90,000

---

## 🎓 Conclusão

**Temos um plano claro, executável e ambicioso:**
- ✅ 23 features poderosas
- ✅ 4-5 meses timeline
- ✅ €80-90k investimento
- ✅ ROI esperado: 10x

**O que nos torna únicos:**
- Do Luma: Calendars, Chat, Blasts
- Nossa Inovação: Gamification, Live Dashboard, Playlists
- AI: Chat, Posters, Recommendations, Insights
- Vantagens: NFC, Wallet, Loyalty

**= IMPOSSÍVEL DE COMPETIR** 🏆

---

## ✅ Próximo Passo

**Confirma para eu começar?**
1. ⬜ Aprovar plano
2. ⬜ Confirmar budget
3. ⬜ Setup APIs (OpenAI, Claude, Replicate)
4. ⬜ Começar Semana 1

**Quer que eu comece a implementar AGORA?** 🚀

---

**Documento Criado:** 2025-12-23
**Versão:** 1.0 - Plano Executivo Final
**Status:** PRONTO PARA EXECUÇÃO
