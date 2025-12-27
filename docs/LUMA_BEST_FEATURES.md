# EventsCV + Luma: Plano Pragmático de Features Essenciais

## 📋 Sumário Executivo

**Objetivo:** Adicionar as MELHORES features do Luma ao Events.cv de forma pragmática e executável, aproveitando o que já temos e focando em **alto impacto com esforço controlado**.

**Abordagem:** Matriz Impacto vs Esforço para priorizar features
**Integração:** n8n.pagali.ai (não Zapier) + Zoom
**Timeline:** 3-4 meses (ao invés de 9-12)
**Investimento:** €30,000 - €45,000 (ao invés de €120k)

---

## 🎯 Análise: O Que JÁ Temos (Vantagens Competitivas)

### ✅ Features Únicas do Events.cv que Luma NÃO TEM

1. **NFC Wristbands & Cashless Payments** 💪
   - Sistema completo de pulseiras NFC
   - Pagamentos cashless em eventos
   - Vendor management
   - Transaction tracking offline/online

2. **Digital Wallet System** 💳
   - User wallet com balance
   - Top-up system
   - Bonus balance
   - Transaction history

3. **Loyalty Program** ⭐
   - Loyalty points e tiers (bronze, silver, gold, platinum)
   - Reward system
   - Referral program infrastructure
   - Gamification

4. **Local Payment Integration** 🌍
   - Pagali (Cape Verde mobile money)
   - Vinti4 (Cape Verde cards)
   - MB WAY (Portugal)
   - Stripe (internacional)

5. **QR Registration System** 📱
   - QR code para guest registration
   - Custom fields
   - Demographics collection
   - Source tracking (web, QR, social)

6. **Multi-Tenant SaaS Architecture** 🏢
   - Organizations com subscriptions
   - Plans com limits
   - Platform role system
   - Commission management

7. **Advanced Team Management** 👥
   - Granular permissions
   - Role-based access
   - Event-scoped access
   - Invitation system

8. **Super-Admin Platform** 🛠️
   - Platform-wide analytics
   - Organization management
   - User verification
   - Payout approval

**CONCLUSÃO:** Já temos uma base SÓLIDA. Luma é forte em **comunidade e engagement**, precisamos adicionar isso.

---

## 🔍 Matriz Impacto vs Esforço: TOP Features do Luma

### QUADRANTE 1: 🚀 ALTO IMPACTO + BAIXO ESFORÇO (Implementar AGORA)

| # | Feature | Impacto | Esforço | Benefício |
|---|---------|---------|---------|-----------|
| 1 | **Event Calendars** | 🔥🔥🔥 | ⚙️⚙️ | Eventos recorrentes, comunidade, subscribers |
| 2 | **Guest Chat** | 🔥🔥🔥 | ⚙️⚙️ | Networking, engagement, retenção |
| 3 | **Event Blasts (Email/SMS)** | 🔥🔥🔥 | ⚙️⚙️ | Comunicação em massa, reminders |
| 4 | **Event Themes & Templates** | 🔥🔥 | ⚙️ | UX melhorado, páginas lindas |
| 5 | **Add to Calendar** | 🔥🔥 | ⚙️ | Conversion, user retention |
| 6 | **Social Sharing (OG tags)** | 🔥🔥🔥 | ⚙️ | Viral growth, descoberta |
| 7 | **Waitlist Management** | 🔥🔥 | ⚙️⚙️ | Captura demanda, FOMO |
| 8 | **Registration Questions** | 🔥🔥 | ⚙️ | Dados customizados, segmentação |

### QUADRANTE 2: 🎯 ALTO IMPACTO + MÉDIO ESFORÇO (Implementar DEPOIS)

| # | Feature | Impacto | Esforço | Benefício |
|---|---------|---------|---------|-----------|
| 9 | **Zoom Integration** | 🔥🔥🔥 | ⚙️⚙️⚙️ | Eventos virtuais, automação |
| 10 | **n8n Integration** | 🔥🔥🔥 | ⚙️⚙️⚙️ | Workflows, automação, conectividade |
| 11 | **Event Discovery Feed** | 🔥🔥🔥 | ⚙️⚙️⚙️ | Crescimento orgânico, SEO |
| 12 | **Calendar Newsletters** | 🔥🔥 | ⚙️⚙️ | Engagement, community building |
| 13 | **Post-Event Surveys** | 🔥🔥 | ⚙️⚙️ | Feedback, melhoria contínua |
| 14 | **Event Cloning** | 🔥🔥 | ⚙️⚙️ | Produtividade organizers |

### QUADRANTE 3: 💡 MÉDIO IMPACTO + BAIXO ESFORÇO (Nice to Have)

| # | Feature | Impacto | Esforço | Benefício |
|---|---------|---------|---------|-----------|
| 15 | **Unlock Codes** | 🔥 | ⚙️ | Secret tickets, exclusividade |
| 16 | **Guest Profiles** | 🔥 | ⚙️ | Networking, social |
| 17 | **Rich Text Editor** | 🔥 | ⚙️ | Conteúdo formatado |
| 18 | **Cover Image Gallery** | 🔥 | ⚙️ | Stock photos curadas |

### QUADRANTE 4: ⏸️ BAIXO IMPACTO ou ALTO ESFORÇO (NÃO Implementar Agora)

- Crypto payments (complexo, baixo mercado)
- Token gating (nicho demais)
- Okta SSO (só enterprise)
- Public API completa (usar n8n)
- Passkeys (ainda cedo)
- WhatsApp integration (caro, regulado)

---

## 🏗️ Roadmap Pragmático: 3 Fases em 3-4 Meses

### **FASE 1: Foundation & Quick Wins** (4-5 semanas)
**Objetivo:** Features de alto impacto e baixo esforço

#### Semana 1-2: Event Themes & Social Sharing
**Esforço:** Baixo | **Impacto:** Alto

**Features:**
- [ ] Event theme selector (3-5 presets: default, minimal, vibrant, elegant, dark)
- [ ] Theme customization (colors, fonts)
- [ ] Open Graph meta tags optimization
- [ ] Dynamic OG image generation (event poster)
- [ ] Twitter card tags
- [ ] Add to Calendar button (iOS/Android/Google)

**Shared Types:**
```typescript
// packages/shared-types/src/event.ts
interface EventTheme {
  preset: 'default' | 'minimal' | 'vibrant' | 'elegant' | 'dark';
  primaryColor: string;
  backgroundColor: string;
  fontFamily: string;
}

// Add to Event interface
interface Event {
  // ... existing fields
  theme?: EventTheme;
}
```

**Frontend:**
```typescript
// apps/web/components/event/ThemeSelector.tsx
export function ThemeSelector({ eventId, currentTheme, onChange }) {
  const themes = [
    { id: 'default', name: 'Padrão', colors: {...} },
    { id: 'minimal', name: 'Minimalista', colors: {...} },
    // ...
  ];
  return <div>Theme selector UI</div>;
}

// apps/web/components/event/AddToCalendar.tsx
export function AddToCalendar({ event }) {
  const generateICS = () => { /* ICS file generation */ };
  const addToGoogleCalendar = () => { /* Google Calendar link */ };
  return <div>Add to calendar dropdown</div>;
}
```

**Backend:**
```typescript
// functions/src/events/generateOGImage.ts
export const generateOGImage = functions.https.onCall(async (data, context) => {
  // Use sharp or canvas to generate image
  // Upload to Cloud Storage
  // Return URL
});
```

#### Semana 3: Registration Questions & Waitlist
**Esforço:** Baixo-Médio | **Impacto:** Alto

**Features:**
- [ ] Custom registration questions builder
- [ ] Question types: text, email, phone, select, checkbox
- [ ] Required/optional fields
- [ ] Waitlist auto-enrollment when sold out
- [ ] Waitlist notification quando tickets disponíveis

**Shared Types:**
```typescript
// packages/shared-types/src/event.ts
interface RegistrationQuestion {
  id: string;
  type: 'text' | 'email' | 'phone' | 'select' | 'checkbox' | 'textarea';
  question: string;
  options?: string[];
  required: boolean;
  order: number;
}

interface Event {
  // ... existing
  registrationQuestions?: RegistrationQuestion[];
  waitlistEnabled: boolean;
  waitlistCapacity?: number;
}

// packages/shared-types/src/waitlist.ts
interface WaitlistEntry {
  id: string;
  eventId: string;
  userId?: string;
  email: string;
  name: string;
  position: number;
  notified: boolean;
  notifiedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}
```

**Collections:**
```
/waitlists/{entryId}
  - eventId
  - userId
  - email, name
  - position
  - notified, notifiedAt
  - expiresAt
```

**Cloud Functions:**
```typescript
// functions/src/waitlist/onTicketAvailable.ts
export const onTicketAvailable = functions.firestore
  .document('ticket_types/{ticketTypeId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Check if tickets became available
    const beforeAvailable = before.quantityTotal - before.quantitySold;
    const afterAvailable = after.quantityTotal - after.quantitySold;

    if (beforeAvailable === 0 && afterAvailable > 0) {
      // Notify waitlist
      const waitlist = await getWaitlistEntries(after.eventId);
      const toNotify = waitlist.slice(0, afterAvailable);

      for (const entry of toNotify) {
        await sendWaitlistNotification(entry);
        await markAsNotified(entry.id);
      }
    }
  });
```

#### Semana 4-5: Event Calendars
**Esforço:** Médio | **Impacto:** Muito Alto

**Features:**
- [ ] Calendar CRUD (create, read, update, delete)
- [ ] Calendar public page
- [ ] Subscribe/unsubscribe to calendars
- [ ] List events in calendar
- [ ] Calendar subscribers count
- [ ] Calendar visibility (public/private/unlisted)

**Shared Types:**
```typescript
// packages/shared-types/src/calendar.ts
interface Calendar {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description: string;
  coverImage?: string;
  visibility: 'public' | 'private' | 'unlisted';
  subscriberCount: number;
  eventCount: number;
  settings: {
    allowMemberEvents: boolean;
    requireApproval: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface CalendarSubscriber {
  id: string;
  calendarId: string;
  userId: string;
  subscribedAt: Date;
  emailNotifications: boolean;
  pushNotifications: boolean;
}
```

**Collections:**
```
/calendars/{calendarId}
/calendar_subscribers/{subscriberId}
```

**Add to Event:**
```typescript
interface Event {
  // ... existing
  calendarId?: string;
}
```

**Frontend:**
```typescript
// apps/web/app/calendars/[slug]/page.tsx
export default function CalendarPage({ params }) {
  const { calendar, events, isSubscribed } = useCalendar(params.slug);

  return (
    <div>
      <CalendarHeader calendar={calendar} />
      <SubscribeButton
        calendarId={calendar.id}
        isSubscribed={isSubscribed}
      />
      <EventList events={events} />
    </div>
  );
}

// apps/admin/app/calendars/page.tsx
export default function CalendarsPage() {
  return <CalendarManagement />;
}
```

**Cloud Functions:**
```typescript
// functions/src/calendars/onSubscribe.ts
export const onSubscribe = functions.firestore
  .document('calendar_subscribers/{subscriberId}')
  .onCreate(async (snap, context) => {
    const subscriber = snap.data();

    // Increment subscriber count
    await db.collection('calendars').doc(subscriber.calendarId).update({
      subscriberCount: admin.firestore.FieldValue.increment(1)
    });

    // Send welcome email
    await sendCalendarWelcomeEmail(subscriber);
  });
```

---

### **FASE 2: Communication & Engagement** (4-5 semanas)
**Objetivo:** Aumentar engagement drasticamente

#### Semana 6-7: Event Blasts (Email/SMS/Push)
**Esforço:** Médio | **Impacto:** Muito Alto

**Features:**
- [ ] Blast composer (email, SMS, push)
- [ ] Recipient filtering (all, registered, checked-in)
- [ ] Scheduled blasts
- [ ] Blast templates
- [ ] Delivery tracking

**Shared Types:**
```typescript
// packages/shared-types/src/communication.ts
interface EventBlast {
  id: string;
  eventId: string;
  organizationId: string;
  subject: string;
  message: string;
  channels: ('email' | 'sms' | 'push')[];
  recipientFilter: 'all' | 'registered' | 'checked_in';
  recipientCount: number;
  sentCount: number;
  deliveredCount: number;
  scheduledFor?: Date;
  sentAt?: Date;
  createdBy: string;
  createdAt: Date;
}
```

**Collections:**
```
/event_blasts/{blastId}
/blast_deliveries/{deliveryId}
  - blastId
  - userId
  - channel
  - status: 'pending' | 'sent' | 'delivered' | 'failed'
  - sentAt, deliveredAt
```

**Cloud Functions:**
```typescript
// functions/src/communication/sendEventBlast.ts
export const sendEventBlast = functions.https.onCall(async (data, context) => {
  const { eventId, subject, message, channels, recipientFilter } = data;

  // Get recipients
  const recipients = await getBlastRecipients(eventId, recipientFilter);

  // Create blast record
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
```

**Integration com n8n:**
- Webhook para disparar workflows n8n quando blast é enviado
- n8n pode processar envios em massa
- Tracking de delivery via webhooks de volta

#### Semana 8-9: Guest Chat (Firestore Realtime)
**Esforço:** Médio | **Impacto:** Muito Alto

**Features:**
- [ ] Event chat room
- [ ] Real-time messaging (Firestore)
- [ ] User profiles in chat
- [ ] Image sharing
- [ ] Message moderation
- [ ] Chat enable/disable per event
- [ ] Chat available before/after event (configurable)

**Shared Types:**
```typescript
// packages/shared-types/src/chat.ts
interface EventChat {
  id: string;
  eventId: string;
  enabled: boolean;
  moderationEnabled: boolean;
  allowedBefore: number; // days
  allowedAfter: number; // days
}

interface ChatMessage {
  id: string;
  chatId: string;
  eventId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  imageUrl?: string;
  deleted: boolean;
  flagged: boolean;
  createdAt: Date;
}

interface ChatParticipant {
  userId: string;
  eventId: string;
  lastRead: Date;
  joinedAt: Date;
}
```

**Collections:**
```
/event_chats/{eventId}
/event_chats/{eventId}/messages/{messageId}
/event_chats/{eventId}/participants/{userId}
```

**Frontend:**
```typescript
// apps/web/components/chat/ChatWindow.tsx
export function ChatWindow({ eventId }) {
  const { messages, sendMessage } = useEventChat(eventId);

  return (
    <div className="flex flex-col h-full">
      <ChatHeader eventId={eventId} />
      <MessageList messages={messages} />
      <MessageInput onSend={sendMessage} />
    </div>
  );
}

// apps/web/hooks/useEventChat.ts
export function useEventChat(eventId: string) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Firestore realtime listener
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
        flagged: false,
        createdAt: new Date(),
      });
  };

  return { messages, sendMessage };
}
```

**Mobile:**
```dart
// apps/mobile/lib/features/chat/event_chat_screen.dart
class EventChatScreen extends StatelessWidget {
  final String eventId;

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<QuerySnapshot>(
      stream: FirebaseFirestore.instance
        .collection('event_chats')
        .doc(eventId)
        .collection('messages')
        .orderBy('createdAt', descending: true)
        .limit(50)
        .snapshots(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) return CircularProgressIndicator();

        final messages = snapshot.data!.docs;
        return ListView.builder(
          reverse: true,
          itemCount: messages.length,
          itemBuilder: (context, index) {
            return ChatMessageTile(message: messages[index]);
          },
        );
      },
    );
  }
}
```

#### Semana 10: Event Cloning & Templates
**Esforço:** Baixo-Médio | **Impacto:** Alto

**Features:**
- [ ] Clone event button
- [ ] Clone settings selector
- [ ] Save event as template
- [ ] Template library (3-5 templates)
- [ ] Create from template

**Frontend:**
```typescript
// apps/admin/components/events/CloneEventModal.tsx
export function CloneEventModal({ eventId }) {
  const [cloneOptions, setCloneOptions] = useState({
    basicInfo: true,
    tickets: true,
    registrationQuestions: true,
    theme: true,
    team: false,
  });

  const handleClone = async () => {
    await cloneEvent(eventId, cloneOptions);
  };

  return <Modal>Clone options UI</Modal>;
}
```

**Cloud Function:**
```typescript
// functions/src/events/cloneEvent.ts
export const cloneEvent = functions.https.onCall(async (data, context) => {
  const { eventId, options } = data;

  const sourceEvent = await db.collection('events').doc(eventId).get();
  const eventData = sourceEvent.data();

  const newEvent = {
    ...eventData,
    id: undefined, // Remove ID
    status: 'draft',
    slug: `${eventData.slug}-copy-${Date.now()}`,
    createdAt: new Date(),
    publishedAt: null,
    clonedFrom: eventId,
  };

  // Remove fields based on options
  if (!options.tickets) {
    // Don't copy ticket types
  }
  if (!options.team) {
    // Don't assign team
  }

  const newEventRef = await db.collection('events').add(newEvent);

  // Clone ticket types if needed
  if (options.tickets) {
    const ticketTypes = await db
      .collection('events')
      .doc(eventId)
      .collection('ticketTypes')
      .get();

    for (const tt of ticketTypes.docs) {
      await db
        .collection('events')
        .doc(newEventRef.id)
        .collection('ticketTypes')
        .add(tt.data());
    }
  }

  return { eventId: newEventRef.id };
});
```

---

### **FASE 3: Integrations & Discovery** (4-5 semanas)
**Objetivo:** Conectividade e crescimento

#### Semana 11-12: Zoom Integration
**Esforço:** Médio-Alto | **Impacto:** Muito Alto

**Features:**
- [ ] OAuth connection to Zoom
- [ ] Auto-create Zoom meeting on event publish
- [ ] Auto-add meeting link to event
- [ ] Auto-send link to attendees
- [ ] Meeting settings (waiting room, recording)
- [ ] Sync attendance from Zoom (optional)

**Shared Types:**
```typescript
// packages/shared-types/src/integrations.ts
interface ZoomMeeting {
  id: string;
  eventId: string;
  organizationId: string;
  meetingId: string; // Zoom meeting ID
  meetingUrl: string;
  password?: string;
  startUrl: string; // For host
  settings: {
    waitingRoom: boolean;
    recording: boolean;
    approval: boolean;
  };
  createdAt: Date;
}

// Add to Event
interface Event {
  // ... existing
  virtualMeetingProvider?: 'zoom' | 'google_meet' | 'custom';
  virtualMeetingUrl?: string;
  virtualMeetingId?: string;
}
```

**Collections:**
```
/zoom_meetings/{meetingId}
/zoom_credentials/{organizationId}
  - accessToken
  - refreshToken
  - expiresAt
```

**Cloud Functions:**
```typescript
// functions/src/integrations/zoom/createMeeting.ts
export const createZoomMeeting = functions.https.onCall(async (data, context) => {
  const { eventId } = data;
  const event = await getEvent(eventId);

  // Get Zoom credentials
  const creds = await getZoomCredentials(event.organizationId);

  // Create meeting via Zoom API
  const meeting = await axios.post('https://api.zoom.us/v2/users/me/meetings', {
    topic: event.title,
    type: 2, // Scheduled meeting
    start_time: event.startDate.toISOString(),
    duration: Math.ceil((event.endDate - event.startDate) / 60000), // minutes
    timezone: event.timezone,
    settings: {
      host_video: true,
      participant_video: true,
      join_before_host: false,
      waiting_room: true,
      auto_recording: 'none',
    }
  }, {
    headers: {
      'Authorization': `Bearer ${creds.accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  // Store meeting info
  await db.collection('zoom_meetings').add({
    eventId,
    organizationId: event.organizationId,
    meetingId: meeting.data.id,
    meetingUrl: meeting.data.join_url,
    password: meeting.data.password,
    startUrl: meeting.data.start_url,
    createdAt: new Date(),
  });

  // Update event
  await db.collection('events').doc(eventId).update({
    virtualMeetingProvider: 'zoom',
    virtualMeetingUrl: meeting.data.join_url,
    virtualMeetingId: meeting.data.id,
  });

  return { success: true, meetingUrl: meeting.data.join_url };
});

// functions/src/integrations/zoom/oauth.ts
export const zoomOAuthCallback = functions.https.onRequest(async (req, res) => {
  const { code, state } = req.query;
  const organizationId = state; // Passed in OAuth flow

  // Exchange code for tokens
  const tokens = await axios.post('https://zoom.us/oauth/token', {
    grant_type: 'authorization_code',
    code,
    redirect_uri: 'https://events.cv/api/zoom/callback',
  }, {
    auth: {
      username: process.env.ZOOM_CLIENT_ID,
      password: process.env.ZOOM_CLIENT_SECRET,
    }
  });

  // Store credentials
  await db.collection('zoom_credentials').doc(organizationId).set({
    accessToken: tokens.data.access_token,
    refreshToken: tokens.data.refresh_token,
    expiresAt: new Date(Date.now() + tokens.data.expires_in * 1000),
    updatedAt: new Date(),
  });

  res.redirect('/admin/settings/integrations?zoom=connected');
});
```

**Frontend:**
```typescript
// apps/admin/components/integrations/ZoomConnect.tsx
export function ZoomConnect() {
  const handleConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_ZOOM_CLIENT_ID;
    const redirectUri = 'https://events.cv/api/zoom/callback';
    const state = currentOrganization.id;

    const authUrl = `https://zoom.us/oauth/authorize?` +
      `response_type=code` +
      `&client_id=${clientId}` +
      `&redirect_uri=${redirectUri}` +
      `&state=${state}`;

    window.location.href = authUrl;
  };

  return (
    <button onClick={handleConnect} className="btn btn-primary">
      <ZoomIcon /> Conectar Zoom
    </button>
  );
}
```

#### Semana 13-14: n8n.pagali.ai Integration
**Esforço:** Médio | **Impacto:** Muito Alto

**Features:**
- [ ] Webhooks system (send events to n8n)
- [ ] n8n workflow triggers (new ticket, new event, check-in, etc)
- [ ] Webhook signature validation
- [ ] Webhook delivery logs
- [ ] Retry logic
- [ ] n8n workflow templates

**Shared Types:**
```typescript
// packages/shared-types/src/webhooks.ts
interface Webhook {
  id: string;
  organizationId: string;
  url: string; // n8n webhook URL
  events: WebhookEvent[];
  secret: string;
  enabled: boolean;
  lastDeliveryAt?: Date;
  failureCount: number;
  createdAt: Date;
}

type WebhookEvent =
  | 'event.created'
  | 'event.published'
  | 'event.cancelled'
  | 'ticket.purchased'
  | 'ticket.refunded'
  | 'attendee.checked_in'
  | 'order.completed'
  | 'payout.requested';

interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payload: any;
  status: 'pending' | 'success' | 'failed';
  statusCode?: number;
  responseBody?: string;
  attempts: number;
  nextRetryAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
}
```

**Collections:**
```
/webhooks/{webhookId}
/webhook_deliveries/{deliveryId}
```

**Cloud Functions:**
```typescript
// functions/src/webhooks/dispatcher.ts
import * as crypto from 'crypto';

export async function dispatchWebhook(
  event: WebhookEvent,
  payload: any,
  organizationId: string
) {
  // Get webhooks for this organization and event
  const webhooks = await db
    .collection('webhooks')
    .where('organizationId', '==', organizationId)
    .where('enabled', '==', true)
    .where('events', 'array-contains', event)
    .get();

  for (const webhookDoc of webhooks.docs) {
    const webhook = webhookDoc.data() as Webhook;

    // Create delivery record
    const deliveryRef = await db.collection('webhook_deliveries').add({
      webhookId: webhook.id,
      event,
      payload,
      status: 'pending',
      attempts: 0,
      createdAt: new Date(),
    });

    // Queue for delivery
    await deliverWebhook(deliveryRef.id, webhook, payload);
  }
}

async function deliverWebhook(
  deliveryId: string,
  webhook: Webhook,
  payload: any
) {
  const signature = crypto
    .createHmac('sha256', webhook.secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  try {
    const response = await axios.post(webhook.url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-EventsCV-Signature': signature,
        'X-EventsCV-Event': payload.event,
      },
      timeout: 10000,
    });

    await db.collection('webhook_deliveries').doc(deliveryId).update({
      status: 'success',
      statusCode: response.status,
      responseBody: JSON.stringify(response.data),
      deliveredAt: new Date(),
    });

    await db.collection('webhooks').doc(webhook.id).update({
      lastDeliveryAt: new Date(),
      failureCount: 0,
    });
  } catch (error) {
    const attempts = (await db.collection('webhook_deliveries').doc(deliveryId).get()).data().attempts;

    await db.collection('webhook_deliveries').doc(deliveryId).update({
      status: 'failed',
      statusCode: error.response?.status,
      responseBody: error.message,
      attempts: attempts + 1,
      nextRetryAt: new Date(Date.now() + Math.pow(2, attempts) * 60000), // Exponential backoff
    });

    await db.collection('webhooks').doc(webhook.id).update({
      failureCount: admin.firestore.FieldValue.increment(1),
    });
  }
}

// Trigger on ticket purchase
export const onTicketPurchased = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const order = snap.data();

    if (order.status === 'paid') {
      await dispatchWebhook('ticket.purchased', {
        event: 'ticket.purchased',
        data: {
          orderId: snap.id,
          eventId: order.eventId,
          userId: order.userId,
          totalAmount: order.totalAmount,
          items: order.items,
          timestamp: new Date().toISOString(),
        }
      }, order.organizationId);
    }
  });
```

**n8n Workflow Templates:**
```json
{
  "name": "EventsCV - New Ticket Purchased",
  "nodes": [
    {
      "type": "n8n-nodes-base.webhook",
      "name": "Webhook Trigger",
      "webhookUrl": "https://n8n.pagali.ai/webhook/eventsvc-ticket-purchased",
      "authentication": "headerAuth"
    },
    {
      "type": "n8n-nodes-base.emailSend",
      "name": "Send Confirmation Email",
      "parameters": {
        "to": "={{$json.data.userEmail}}",
        "subject": "Ticket Confirmation - {{$json.data.eventName}}",
        "text": "Your ticket has been confirmed..."
      }
    },
    {
      "type": "n8n-nodes-base.googleSheets",
      "name": "Log to Google Sheets",
      "parameters": {
        "operation": "append",
        "sheetId": "...",
        "values": "={{[$json.data.orderId, $json.data.eventName, $json.data.totalAmount]}}"
      }
    }
  ]
}
```

**Frontend:**
```typescript
// apps/admin/app/settings/webhooks/page.tsx
export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState([]);

  const createWebhook = async (url: string, events: string[]) => {
    const secret = generateSecret();
    await db.collection('webhooks').add({
      organizationId: currentOrganization.id,
      url,
      events,
      secret,
      enabled: true,
      failureCount: 0,
      createdAt: new Date(),
    });
  };

  return (
    <div>
      <WebhookList webhooks={webhooks} />
      <CreateWebhookModal onCreate={createWebhook} />
      <WebhookDocs /> {/* How to use with n8n */}
    </div>
  );
}
```

#### Semana 15: Event Discovery Feed (MVP)
**Esforço:** Médio | **Impacto:** Alto

**Features:**
- [ ] Public event feed homepage
- [ ] Basic filtering (category, city, date range)
- [ ] Search by title
- [ ] Sort by date/popularity
- [ ] Pagination

**Frontend:**
```typescript
// apps/web/app/page.tsx
export default async function HomePage() {
  const upcomingEvents = await getUpcomingEvents({ limit: 12 });
  const featuredEvents = await getFeaturedEvents({ limit: 3 });

  return (
    <div>
      <Hero />
      <FeaturedEvents events={featuredEvents} />
      <EventFilters />
      <EventGrid events={upcomingEvents} />
      <LoadMore />
    </div>
  );
}

// apps/web/components/discovery/EventFilters.tsx
export function EventFilters() {
  const [filters, setFilters] = useState({
    category: 'all',
    city: 'all',
    dateRange: 'all',
  });

  return (
    <div className="filters">
      <CategoryFilter value={filters.category} onChange={...} />
      <CityFilter value={filters.city} onChange={...} />
      <DateRangeFilter value={filters.dateRange} onChange={...} />
    </div>
  );
}
```

**Backend:**
```typescript
// apps/web/lib/services/discovery.ts
export async function getUpcomingEvents(filters: {
  category?: string;
  city?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
}) {
  let query = db
    .collection('events')
    .where('status', '==', 'published')
    .where('isPublic', '==', true)
    .where('startDate', '>=', new Date());

  if (filters.category && filters.category !== 'all') {
    query = query.where('category', '==', filters.category);
  }

  if (filters.city && filters.city !== 'all') {
    query = query.where('city', '==', filters.city);
  }

  query = query.orderBy('startDate', 'asc').limit(filters.limit || 20);

  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
```

---

## 💰 Estimativa de Custos (Pragmática)

### Desenvolvimento

**Opção A - Equipa Reduzida:**
- 1 Full-Stack Developer: €35/h × 500h = €17,500
- 1 Mobile Developer (part-time): €30/h × 200h = €6,000
- 1 UI/UX Designer (part-time): €25/h × 100h = €2,500
- **Total: €26,000**

**Opção B - Equipa Ideal:**
- 1 Full-Stack Senior: €40/h × 500h = €20,000
- 1 Mobile Developer: €35/h × 300h = €10,500
- 1 UI/UX Designer: €30/h × 150h = €4,500
- 1 QA (part-time): €25/h × 100h = €2,500
- **Total: €37,500**

### Infraestrutura (3 meses)

**Mensal:**
- Firebase (incremento): +€100/mês
- SendGrid (50k emails): €30/mês
- Twilio (SMS): €50/mês (opt-in)
- n8n (self-hosted): €0 (em pagali.ai)
- Zoom API: €0 (free tier)
- **Total Mensal: €180/mês × 3 = €540**

### Serviços

- Stock photos API: €0 (Unsplash free)
- Icon library: €0 (Lucide React já instalado)
- **Total: €0**

### **TOTAL ESTIMADO:**
- **Mínimo (Opção A):** €26,540
- **Ideal (Opção B):** €38,040
- **Com margem 20%:** €30,000 - €45,000

---

## 📊 Métricas de Sucesso

### Após FASE 1 (Semana 5)
- [ ] 100 eventos com themes customizados
- [ ] 500 Add to Calendar clicks
- [ ] 20% sharing rate (eventos compartilhados)
- [ ] 50 eventos com waitlist ativo
- [ ] 10 calendars criados

### Após FASE 2 (Semana 10)
- [ ] 200 event blasts enviados
- [ ] 80% open rate em blasts
- [ ] 50 eventos com chat ativo
- [ ] 1,000 mensagens de chat
- [ ] 30% engagement rate em chat

### Após FASE 3 (Semana 15)
- [ ] 20 eventos com Zoom integration
- [ ] 10 organizações usando n8n webhooks
- [ ] 500 descobertas via event feed
- [ ] 20% organic traffic growth
- [ ] 50 workflows n8n ativos

---

## ⚠️ Riscos & Mitigações

### Riscos Técnicos

1. **Chat em Realtime pode ser caro (Firestore reads)**
   - **Mitigação:** Pagination, limit 50 messages, cache local
   - **Custo estimado:** €20/mês para 1000 users ativos

2. **Zoom API rate limits**
   - **Mitigação:** Queue requests, retry logic
   - **Free tier:** 100 requests/day (suficiente)

3. **n8n webhook failures**
   - **Mitigação:** Retry exponencial, delivery logs
   - **Monitoramento:** Alert se failure rate > 10%

### Riscos de Negócio

4. **Adoção lenta de calendars**
   - **Mitigação:** Onboarding tutorial, templates prontos
   - **Marketing:** Email campaign explicando benefício

5. **Spam no chat**
   - **Mitigação:** Moderation tools, report button, auto-ban palavras
   - **Custo:** €0 (automated)

---

## 🎯 Decisão: O Que Implementar?

### RECOMENDAÇÃO: Opção HÍBRIDA

**FASE 1 (OBRIGATÓRIA) - 5 semanas:**
1. Event Themes & Social Sharing ✅
2. Registration Questions & Waitlist ✅
3. Event Calendars ✅

**FASE 2 (CRÍTICA) - 5 semanas:**
4. Event Blasts ✅
5. Guest Chat ✅
6. Event Cloning ✅

**FASE 3 (OPCIONAL CONFORME BUDGET) - 5 semanas:**
7. Zoom Integration ⚠️ (só se houver demanda)
8. n8n Integration ✅ (alto ROI)
9. Event Discovery Feed ✅

**Total:** 10-15 semanas (2.5-3.5 meses)
**Investimento:** €30,000 - €40,000

---

## 📝 Próximos Passos

### Esta Semana
1. ✅ Aprovar este plano
2. ⬜ Decidir orçamento (Opção A ou B)
3. ⬜ Confirmar integrações necessárias (Zoom sim/não?)
4. ⬜ Setup n8n.pagali.ai webhooks

### Próxima Semana (Kickoff)
1. ⬜ Criar branch `feature/luma-best-features`
2. ⬜ Setup Firestore collections
3. ⬜ Implementar EventTheme types
4. ⬜ Começar ThemeSelector component
5. ⬜ Implementar OG tags

### Semana 2
1. ⬜ Complete theme system
2. ⬜ Add to Calendar button
3. ⬜ Testing OG images em social media

---

## 🎓 Conclusão

Este plano é **MUITO MAIS REALISTA** que o anterior:
- ✅ Foco em 15 features de alto impacto (não 131)
- ✅ 3-4 meses (não 9-12)
- ✅ €30-45k investimento (não €120k)
- ✅ Aproveita o que já temos
- ✅ Integra com n8n.pagali.ai (não Zapier)
- ✅ Zoom como opcional

**ROI Esperado:**
- 2x mais engagement (chat, blasts)
- 3x mais descoberta orgânica (feed, sharing)
- 50% mais produtividade (cloning, calendars)
- 30% mais conversão (waitlist, themes)

Vamos? 🚀

---

**Documento Criado:** 2025-12-23
**Versão:** 1.0
**Status:** Aguardando Aprovação
