# Events.cv: Roadmap de Inovação
## Além do Luma - Criando o Futuro dos Eventos

---

## 🎯 Visão: Não Queremos Ser o Luma

**Queremos ser a plataforma de eventos MAIS INOVADORA do mundo.**

### Por Que Somos Diferentes

**Luma é forte em:** 🇺🇸
- Eventos virtuais/híbridos
- Comunidades online
- Calendários de meetups
- Mercado tech/startup

**Events.cv é forte em:** 🇨🇻
- **Eventos presenciais** (música, festivais, desporto)
- **Cashless & NFC** (experiência física)
- **Wallet & Loyalty** (gamification)
- **Mercado local** (Cabo Verde, África lusófona)
- **Cultura local** (músicos, vendors, tradição)

### Nossa Vantagem Competitiva

```
Luma = Comunidade Virtual + Calendários
Events.cv = Experiência Física + Gamification + Cultura Local
```

**Não vamos copiar. Vamos INOVAR.** 🚀

---

## 🔥 Features Inovadoras (Que Ninguém Tem)

### CATEGORIA 1: 🎮 Gamification & Social Proof

#### 1.1 Live Event Dashboard (Public)
**O Problema:** Eventos publicam e esperam. Não há urgência, FOMO ou prova social.

**Nossa Solução:** Dashboard público em tempo real mostrando:
- 🔴 **Vendas ao vivo** - "3 pessoas compraram nos últimos 10 minutos"
- 📊 **Capacidade restante** - "Só restam 15% dos bilhetes!"
- 🔥 **Heatmap de interesse** - Mapa de onde vêm os compradores
- ⏰ **Countdown dinâmico** - "Preço sobe em 2h 15m"
- 👥 **Quem está a ir** - Avatares dos amigos que já compraram
- 💬 **Live feed** - "João acabou de comprar 2 VIP tickets"

**Impacto:**
- ⬆️ 40% mais conversão (urgência + FOMO)
- ⬆️ 3x engagement (pessoas voltam para ver)
- ⬆️ Viral (partilham "olha quanta gente vai!")

**Tech Stack:**
```typescript
// Real-time Firestore listener
/events/{eventId}/live_stats
  - ticketsSoldLast10Min
  - capacityRemaining (%)
  - recentBuyers (avatars)
  - buyerLocations (heatmap)
  - nextPriceIncrease (countdown)

// Component
<LiveEventDashboard eventId={eventId}>
  <SalesCounter />
  <CapacityBar />
  <RecentBuyers />
  <BuyerHeatmap />
  <PriceCountdown />
  <FriendsList />
</LiveEventDashboard>
```

**Exemplo Visual:**
```
┌─────────────────────────────────────┐
│  🔴 FESTIVAL DE VERÃO 2025          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  🔥 ÚLTIMOS 10 MIN: 8 tickets      │
│  📊 85% VENDIDO (só 45 restantes!) │
│  ⏰ Preço sobe em 1h 23m            │
│                                     │
│  👤👤👤 +127 pessoas vão            │
│  🗺️ [Mapa: Praia 45%, Mindelo 20%]│
│                                     │
│  💬 "Maria comprou 2 VIP - agora"  │
│  💬 "João comprou 1 Standard - 2m" │
└─────────────────────────────────────┘
```

#### 1.2 Event Achievements & Challenges
**O Problema:** Ir a eventos é passivo. Não há gamification.

**Nossa Solução:** Sistema de conquistas e desafios
- 🏆 **Achievements** - "Participou em 5 eventos este mês"
- 🎯 **Challenges** - "Check-in nos primeiros 30 minutos (+50 pontos)"
- 🥇 **Leaderboards** - Top fans por evento/organizer
- 🎁 **Rewards** - Desbloqueia merchandising, meet&greets
- ⭐ **Event Streaks** - "10 eventos consecutivos (streak!)"
- 👥 **Social Challenges** - "Traga 3 amigos (+500 pontos)"

**Exemplos de Achievements:**
```
🎉 Early Bird - Check-in nos primeiros 10% (50pts)
🎸 Superfan - Participou em 10 eventos do mesmo organizer (200pts)
🌟 VIP Status - Gastou €500+ em eventos (500pts)
💃 Party Animal - 3 eventos numa semana (100pts)
📸 Paparazzi - Partilhou 5 fotos de eventos (50pts)
🎤 Local Hero - Participou em 20 eventos locais (300pts)
```

**Tech Stack:**
```typescript
// packages/shared-types/src/gamification.ts
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'attendance' | 'social' | 'spending' | 'engagement';
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement: {
    type: 'event_count' | 'check_in_time' | 'spending' | 'referrals';
    threshold: number;
    timeframe?: 'day' | 'week' | 'month' | 'year' | 'all_time';
  };
  reward?: {
    type: 'discount' | 'free_ticket' | 'merchandise' | 'access';
    value: number | string;
  };
}

interface UserAchievement {
  userId: string;
  achievementId: string;
  progress: number; // 0-100%
  completed: boolean;
  completedAt?: Date;
  claimed: boolean;
}

interface Challenge {
  id: string;
  eventId?: string; // Event-specific or platform-wide
  name: string;
  description: string;
  type: 'check_in_early' | 'bring_friends' | 'spend_amount' | 'share_social';
  points: number;
  expiresAt: Date;
  participantCount: number;
  completionCount: number;
}

interface Leaderboard {
  eventId?: string;
  organizationId?: string;
  type: 'points' | 'events_attended' | 'spending' | 'referrals';
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
  entries: LeaderboardEntry[];
}

interface LeaderboardEntry {
  userId: string;
  userName: string;
  userAvatar?: string;
  rank: number;
  score: number;
  badge?: 'gold' | 'silver' | 'bronze';
}
```

**Cloud Functions:**
```typescript
// functions/src/gamification/checkAchievements.ts
export const checkAchievements = functions.firestore
  .document('checkins/{checkinId}')
  .onCreate(async (snap, context) => {
    const checkin = snap.data();
    const userId = checkin.userId;

    // Check Early Bird achievement
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
```

**UI Components:**
```typescript
// apps/web/components/gamification/AchievementBadge.tsx
export function AchievementBadge({ achievement, progress }: Props) {
  return (
    <div className="achievement-badge">
      <div className={`icon ${achievement.rarity}`}>
        {achievement.icon}
      </div>
      <div className="details">
        <h4>{achievement.name}</h4>
        <p>{achievement.description}</p>
        {!achievement.completed && (
          <ProgressBar value={progress} max={100} />
        )}
        {achievement.completed && (
          <span className="completed">✓ Completado</span>
        )}
      </div>
    </div>
  );
}

// apps/web/app/profile/achievements/page.tsx
export default function AchievementsPage() {
  const { achievements, challenges, leaderboard } = useGamification();

  return (
    <div>
      <h1>Minhas Conquistas</h1>
      <StatsOverview
        totalPoints={user.loyalty.points}
        achievementsCompleted={achievements.completed}
        currentRank={leaderboard.rank}
      />
      <AchievementGrid achievements={achievements.all} />
      <ActiveChallenges challenges={challenges.active} />
      <Leaderboard entries={leaderboard.entries} />
    </div>
  );
}
```

#### 1.3 Dynamic Ticket Pricing (Surge Pricing)
**O Problema:** Preços fixos deixam dinheiro na mesa. Hot events vendem rápido ao mesmo preço.

**Nossa Solução:** Preços dinâmicos baseados em demanda
- 📈 **Early bird automático** - Primeiros 20% mais baratos
- 🔥 **Surge pricing** - Preço sobe quando vendas aceleram
- ⏰ **Time-based pricing** - Preço sobe a cada X dias
- 🎯 **Demand tiers** - 5 níveis de preço conforme disponibilidade
- 💎 **Last minute deals** - Descontos se não vender tudo

**Exemplo:**
```
Capacidade: 1000 tickets
- Tickets 1-200: €20 (Early Bird)
- Tickets 201-500: €25 (Standard)
- Tickets 501-750: €30 (Regular)
- Tickets 751-950: €35 (Hot)
- Tickets 951-1000: €45 (Last Call)

+ Surge pricing: Se vender 50 tickets em 1h, sobe €5
```

**Tech Stack:**
```typescript
// packages/shared-types/src/pricing.ts
interface DynamicPricing {
  eventId: string;
  enabled: boolean;
  strategy: 'capacity_based' | 'time_based' | 'surge' | 'hybrid';
  basePrice: number;
  tiers: PriceTier[];
  surgeRules: SurgeRule[];
}

interface PriceTier {
  name: string;
  fromQuantity: number; // Ticket #
  toQuantity: number;
  price: number;
  discount?: number; // % off base
}

interface SurgeRule {
  trigger: 'sales_velocity' | 'time_remaining' | 'capacity_remaining';
  threshold: number; // e.g., 50 sales/hour
  priceIncrease: number; // € or %
  maxPrice?: number; // Cap
}

interface PriceHistory {
  eventId: string;
  ticketTypeId: string;
  timestamp: Date;
  price: number;
  reason: 'tier_change' | 'surge' | 'time_decay' | 'last_minute';
  ticketsSold: number;
}
```

**Cloud Function:**
```typescript
// functions/src/pricing/calculateCurrentPrice.ts
export const calculateCurrentPrice = functions.https.onCall(async (data) => {
  const { eventId, ticketTypeId } = data;

  const ticketType = await getTicketType(eventId, ticketTypeId);
  const pricing = await getDynamicPricing(eventId);

  if (!pricing.enabled) {
    return { price: ticketType.price };
  }

  let currentPrice = pricing.basePrice;

  // 1. Check capacity tier
  const sold = ticketType.quantitySold;
  const tier = pricing.tiers.find(t => sold >= t.fromQuantity && sold < t.toQuantity);
  if (tier) {
    currentPrice = tier.price;
  }

  // 2. Check surge rules
  const recentSales = await getSalesVelocity(eventId, 60); // Last 60min
  const surgeRule = pricing.surgeRules.find(r => r.trigger === 'sales_velocity');
  if (surgeRule && recentSales >= surgeRule.threshold) {
    currentPrice += surgeRule.priceIncrease;
    if (surgeRule.maxPrice) {
      currentPrice = Math.min(currentPrice, surgeRule.maxPrice);
    }
  }

  // 3. Log price history
  await db.collection('price_history').add({
    eventId,
    ticketTypeId,
    timestamp: new Date(),
    price: currentPrice,
    reason: tier ? 'tier_change' : 'surge',
    ticketsSold: sold,
  });

  return {
    price: currentPrice,
    tier: tier?.name,
    nextTier: pricing.tiers.find(t => t.fromQuantity > sold),
  };
});
```

---

### CATEGORIA 2: 🎵 Experiência Física & Cultural

#### 2.1 Collaborative Event Playlists
**O Problema:** DJ decide tudo. Audiência quer participar.

**Nossa Solução:** Playlist colaborativa para eventos
- 🎵 **Vote nas músicas** - Attendees votam no que tocar
- ➕ **Sugere músicas** - Adiciona à queue
- 🔥 **Top requests** - Músicas mais pedidas
- 🎧 **DJ mode** - Organizer aprova ou rejeita
- 📊 **Music analytics** - Géneros preferidos, vibe do evento
- 🎤 **Request with tip** - Pagar para tocar (via wallet)

**Use Cases:**
- Festa de aniversário: Convidados sugerem músicas
- Festival: Crowd vote para próxima música
- Casamento: Noivos aprovam requests
- Clube: DJ vê o que crowd quer

**Tech Stack:**
```typescript
// packages/shared-types/src/music.ts
interface EventPlaylist {
  eventId: string;
  enabled: boolean;
  provider: 'spotify' | 'youtube' | 'soundcloud' | 'manual';
  playlistId?: string; // Spotify playlist ID
  mode: 'open' | 'moderated' | 'voting_only';
  allowRequests: boolean;
  allowTips: boolean;
  minTipAmount?: number;
}

interface SongRequest {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  songTitle: string;
  artist: string;
  spotifyUri?: string;
  youtubeUrl?: string;
  votes: number;
  tipAmount?: number;
  status: 'pending' | 'approved' | 'rejected' | 'played';
  requestedAt: Date;
  playedAt?: Date;
}

interface PlaylistVote {
  userId: string;
  songRequestId: string;
  votedAt: Date;
}
```

**Integration com Spotify:**
```typescript
// functions/src/music/spotifyIntegration.ts
import SpotifyWebApi from 'spotify-web-api-node';

export const addToPlaylist = functions.https.onCall(async (data, context) => {
  const { eventId, spotifyUri, userId } = data;

  const playlist = await getEventPlaylist(eventId);
  const spotify = new SpotifyWebApi({
    accessToken: playlist.accessToken,
  });

  // Add song to Spotify playlist
  await spotify.addTracksToPlaylist(playlist.playlistId, [spotifyUri]);

  // Create request record
  await db.collection('song_requests').add({
    eventId,
    userId,
    userName: context.auth.token.name,
    spotifyUri,
    votes: 0,
    status: 'approved',
    requestedAt: new Date(),
  });

  return { success: true };
});

// Get top voted songs
export const getTopSongs = functions.https.onCall(async (data) => {
  const { eventId } = data;

  const requests = await db
    .collection('song_requests')
    .where('eventId', '==', eventId)
    .where('status', '==', 'pending')
    .orderBy('votes', 'desc')
    .limit(20)
    .get();

  return requests.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});
```

**UI:**
```typescript
// apps/web/components/music/PlaylistWidget.tsx
export function PlaylistWidget({ eventId }: Props) {
  const { requests, vote, suggest } = useEventPlaylist(eventId);

  return (
    <div className="playlist-widget">
      <h3>🎵 Playlist Colaborativa</h3>

      <SongSearch onSelect={(song) => suggest(song)} />

      <div className="song-requests">
        {requests.map(request => (
          <SongRequestCard
            key={request.id}
            request={request}
            onVote={() => vote(request.id)}
            onTip={(amount) => tipSong(request.id, amount)}
          />
        ))}
      </div>
    </div>
  );
}

function SongRequestCard({ request, onVote, onTip }) {
  return (
    <div className="song-card">
      <div className="song-info">
        <h4>{request.songTitle}</h4>
        <p>{request.artist}</p>
        <span className="requested-by">por {request.userName}</span>
      </div>
      <div className="actions">
        <button onClick={onVote}>
          👍 {request.votes}
        </button>
        {request.tipAmount > 0 && (
          <span className="tip">💰 {request.tipAmount}€</span>
        )}
        <button onClick={() => onTip(5)}>
          Tip 5€
        </button>
      </div>
    </div>
  );
}
```

#### 2.2 Local Talent Marketplace
**O Problema:** Organizers não sabem onde encontrar DJs, músicos, performers locais.

**Nossa Solução:** Marketplace de talento local integrado
- 🎤 **Perfis de artistas** - DJs, bandas, performers
- 🎸 **Portfolio** - Vídeos, músicas, fotos
- ⭐ **Reviews** - Ratings de eventos passados
- 💰 **Preços** - Transparência de cachês
- 📅 **Disponibilidade** - Calendário automático
- 🤝 **Booking direto** - Contrata pelo app
- 💳 **Pagamento via wallet** - Sem intermediários

**Perfis de Talentos:**
```
DJ Mário - House/Techno
⭐ 4.9 (23 reviews)
💰 €200-500/noite
📅 Disponível: Sex, Sab
📍 Praia, Santiago
🎵 [Soundcloud mix]

"Tocou no nosso casamento, incrível!"
"Melhor DJ da ilha!"
```

**Tech Stack:**
```typescript
// packages/shared-types/src/talent.ts
interface TalentProfile {
  id: string;
  userId: string;
  type: 'dj' | 'band' | 'performer' | 'host' | 'photographer' | 'videographer';
  stageName: string;
  bio: string;
  genres?: string[]; // For DJs/bands
  location: string;
  island: string;
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  portfolio: {
    photos: string[];
    videos: string[];
    soundcloud?: string;
    youtube?: string;
    spotify?: string;
  };
  rating: number;
  reviewCount: number;
  eventsPerformed: number;
  availability: {
    monday: boolean;
    tuesday: boolean;
    // ...
  };
  verified: boolean;
  createdAt: Date;
}

interface TalentBooking {
  id: string;
  talentId: string;
  eventId: string;
  organizationId: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  price: number;
  startTime: Date;
  endTime: Date;
  notes?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: Date;
}

interface TalentReview {
  id: string;
  talentId: string;
  eventId: string;
  reviewerId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
}
```

**Frontend:**
```typescript
// apps/web/app/talent/page.tsx
export default function TalentMarketplacePage() {
  const [filters, setFilters] = useState({
    type: 'all',
    location: 'all',
    priceRange: [0, 1000],
    genre: 'all',
  });

  const { talents } = useTalents(filters);

  return (
    <div>
      <h1>Encontre Talento Local</h1>
      <TalentFilters filters={filters} onChange={setFilters} />
      <TalentGrid talents={talents} />
    </div>
  );
}

// apps/admin/components/talent/BookTalent.tsx
export function BookTalentModal({ eventId }: Props) {
  const handleBook = async (talentId: string) => {
    await createBooking({
      talentId,
      eventId,
      price: selectedTalent.priceRange.min,
      startTime: event.startDate,
      endTime: event.endDate,
    });
  };

  return <Modal>Booking UI</Modal>;
}
```

#### 2.3 Food & Drink Pre-Order (NFC Wallet)
**O Problema:** Filas enormes em bares/food trucks. Dinheiro/cartão lento.

**Nossa Solução:** Pre-order via app, pagar com wallet NFC
- 🍔 **Menu do evento** - Ver todos vendors
- 📱 **Order pelo app** - Antes ou durante evento
- 💳 **Pagar com NFC wallet** - Tap wristband para levantar
- ⏰ **Scheduled orders** - "Entregar às 21h"
- 🎫 **Combo deals** - "1 Burger + 2 Cervejas = €15"
- 📊 **Vendor analytics** - Vendas em tempo real

**Use Cases:**
- Festival: Order pizza às 20h, levanta às 21h
- Concerto: Pre-order 2 cervejas para o intervalo
- Feira: Browse vendors, order antecipadamente

**Tech Stack:**
```typescript
// packages/shared-types/src/food.ts
interface VendorMenu {
  vendorId: string;
  eventId: string;
  items: MenuItem[];
  available: boolean;
  preparationTime: number; // minutes
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'food' | 'drink' | 'dessert' | 'other';
  imageUrl?: string;
  allergens?: string[];
  vegetarian: boolean;
  vegan: boolean;
  available: boolean;
  preparationTime: number;
}

interface FoodOrder {
  id: string;
  eventId: string;
  vendorId: string;
  userId: string;
  wristbandUid?: string;
  items: {
    menuItemId: string;
    quantity: number;
    specialInstructions?: string;
  }[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  scheduledFor?: Date;
  orderedAt: Date;
  readyAt?: Date;
  completedAt?: Date;
}
```

**NFC Pickup Flow:**
```typescript
// Vendor terminal
1. Cliente toca wristband NFC
2. Sistema mostra orders pendentes do cliente
3. Vendor marca como "ready"
4. Cliente levanta comida
5. Vendor marca como "completed"
6. Wallet balance deduzido automaticamente
```

**Cloud Function:**
```typescript
// functions/src/food/createOrder.ts
export const createFoodOrder = functions.https.onCall(async (data, context) => {
  const { vendorId, items, scheduledFor } = data;

  const user = await getUser(context.auth.uid);
  const total = await calculateTotal(items);

  // Check wallet balance
  if (user.wallet.balance < total) {
    throw new functions.https.HttpsError('failed-precondition', 'Saldo insuficiente');
  }

  // Create order
  const orderRef = await db.collection('food_orders').add({
    eventId: data.eventId,
    vendorId,
    userId: context.auth.uid,
    wristbandUid: user.wristbandUid,
    items,
    totalAmount: total,
    status: 'pending',
    scheduledFor: scheduledFor || null,
    orderedAt: new Date(),
  });

  // Deduct from wallet
  await deductWalletBalance(context.auth.uid, total);

  // Notify vendor
  await notifyVendor(vendorId, 'New order received');

  return { orderId: orderRef.id, total };
});
```

---

### CATEGORIA 3: 🌍 Cultura Local & Sustentabilidade

#### 3.1 Carbon Footprint Tracker
**O Problema:** Eventos geram muito CO₂ (viagens, energia, desperdício).

**Nossa Solução:** Tracking de impacto ambiental
- 🌱 **Carbon calculator** - Estima CO₂ do evento
- ✈️ **Travel emissions** - Baseado em localização dos attendees
- ⚡ **Energy consumption** - Palco, som, luz
- ♻️ **Waste tracking** - Reciclagem vs lixo
- 🌳 **Carbon offset** - Opção de compensar (plantar árvores)
- 🏆 **Eco badges** - Eventos sustentáveis

**Cálculo:**
```
Total CO₂ =
  + Viagens (média km × attendees × 0.12kg CO₂/km)
  + Energia (kWh × 0.4kg CO₂/kWh)
  + Alimentação (refeições × 2kg CO₂/refeição)
  - Reciclagem (-0.5kg CO₂/kg reciclado)
```

**Tech Stack:**
```typescript
// packages/shared-types/src/sustainability.ts
interface CarbonFootprint {
  eventId: string;
  totalCO2: number; // kg
  breakdown: {
    travel: number;
    energy: number;
    food: number;
    waste: number;
    recycling: number; // negative
  };
  offsetAmount: number; // kg compensated
  offsetCost: number; // €
  rating: 'A' | 'B' | 'C' | 'D' | 'E'; // A = best
  calculatedAt: Date;
}

interface SustainabilityMetrics {
  eventId: string;
  attendeeCount: number;
  avgTravelDistance: number; // km
  energyUsed: number; // kWh
  wasteGenerated: number; // kg
  recyclingRate: number; // %
  vegetarianMeals: number;
  singleUsePlasticBanned: boolean;
  publicTransportEncouraged: boolean;
}
```

**UI:**
```typescript
// Event page
<SustainabilityBadge rating="A" co2={450} />
"Este evento compensa 100% das emissões 🌱"

// Checkout
<CarbonOffsetOption>
  "Adicione €2 para compensar sua viagem (+1.5€ já incluído)"
  <TreeCounter trees={3} />
</CarbonOffsetOption>
```

#### 3.2 CV Creole Language Support
**O Problema:** Plataforma em PT/EN. Cabo-verdianos falam Crioulo.

**Nossa Solução:** Suporte nativo para Crioulo
- 🇨🇻 **UI em Crioulo** - Tradução completa
- 🎤 **Event descriptions em Crioulo** - Organizers podem escrever
- 🗣️ **Voice commands** - "Móstra-m eventos na Praia"
- 📱 **SMS em Crioulo** - Notificações
- 🎵 **Search em Crioulo** - "funaná", "batuku", "koladera"

**Tech Stack:**
```typescript
// i18n support
languages: ['pt', 'en', 'cv'] // CV = Crioulo

// Event content
interface Event {
  title: string;
  titleCV?: string; // Título em Crioulo
  description: string;
  descriptionCV?: string;
  // ...
}

// Search indexing
searchableText: {
  pt: "música ao vivo",
  en: "live music",
  cv: "múzika bibó"
}
```

#### 3.3 Community Event Voting
**O Problema:** Organizers decidem tudo. Comunidade quer voz.

**Nossa Solução:** Deixa comunidade votar em decisões
- 🗳️ **Vote em lineup** - Qual artista convidar?
- 📅 **Vote em data** - Melhor dia para evento?
- 📍 **Vote em local** - Praia ou Mindelo?
- 🍔 **Vote em vendors** - Que food trucks trazer?
- 🎨 **Vote em design** - Escolhe poster do evento

**Use Cases:**
- Festival: Comunidade vota top 3 artistas para headliner
- Organização: Subscribers votam próximo evento
- Promoter: Fans escolhem data do show

**Tech Stack:**
```typescript
// packages/shared-types/src/voting.ts
interface EventPoll {
  id: string;
  eventId?: string;
  calendarId?: string; // Calendar subscribers vote
  question: string;
  type: 'lineup' | 'date' | 'location' | 'vendor' | 'design' | 'other';
  options: PollOption[];
  multipleChoice: boolean;
  maxVotes: number;
  voterEligibility: 'all' | 'subscribers' | 'ticket_holders' | 'past_attendees';
  status: 'open' | 'closed';
  closesAt: Date;
  createdAt: Date;
}

interface PollOption {
  id: string;
  label: string;
  description?: string;
  imageUrl?: string;
  votes: number;
}

interface PollVote {
  pollId: string;
  userId: string;
  optionId: string;
  votedAt: Date;
}
```

---

### CATEGORIA 4: 🤖 AI & Automação

#### 4.1 AI Event Recommendations
**O Problema:** Users perdem eventos que iriam gostar.

**Nossa Solução:** ML-powered recommendations
- 🎯 **Personalized feed** - Baseado em histórico
- 📊 **Taste profile** - Aprende preferências
- 👥 **Friend recommendations** - "3 amigos vão a este evento"
- 📅 **Best time to buy** - "Preço vai subir amanhã"
- 🎭 **Similar events** - "Se gostou deste, vai gostar de..."

**ML Model:**
```python
# Collaborative filtering
user_features = [
  - past_events (categories, genres)
  - spending_pattern
  - preferred_days (weekend vs weekday)
  - location_preference
  - social_connections (friends going)
]

event_features = [
  - category, tags
  - price_range
  - date, time
  - location
  - organizer_reputation
  - popularity_score
]

recommendation_score = model.predict(user, event)
```

#### 4.2 AI Event Photo Booth
**O Problema:** Fotógrafos caros. Selfies sem contexto.

**Nossa Solução:** AI-generated event memories
- 📸 **AI photo enhancement** - Melhora fotos automaticamente
- 🎨 **Event filters** - Branded filters com logo do evento
- 🖼️ **AI backgrounds** - Remove fundo, adiciona event theme
- 🎬 **Auto video recap** - Compila fotos em vídeo com música
- 🎭 **Face recognition** - "Você apareceu em 15 fotos"
- 💾 **Event photo gallery** - Todas fotos do evento num álbum

**Tech Stack:**
```typescript
// Cloud Vision API for face recognition
// Stable Diffusion para backgrounds
// FFmpeg para video generation

interface EventPhotoGallery {
  eventId: string;
  totalPhotos: number;
  contributorCount: number;
  photos: EventPhoto[];
}

interface EventPhoto {
  id: string;
  eventId: string;
  uploadedBy: string;
  imageUrl: string;
  enhancedUrl?: string; // AI enhanced
  faces: DetectedFace[];
  tags: string[];
  likes: number;
  uploadedAt: Date;
}
```

---

## 🗺️ Roadmap de Inovação (3 Fases)

### **FASE 1: Gamification & Social Proof** (6 semanas) - €15-20k
**Objetivo:** Fazer eventos mais sociais e engaging

**Features:**
1. ✅ Live Event Dashboard (real-time sales, FOMO)
2. ✅ Event Achievements & Challenges
3. ✅ Dynamic Ticket Pricing (surge pricing)
4. ✅ Leaderboards (top fans, organizers)

**Impacto Esperado:**
- 📈 40% mais conversão (urgência + social proof)
- 🎮 3x engagement (gamification)
- 💰 20% mais revenue (dynamic pricing)

---

### **FASE 2: Experiência Física** (6 semanas) - €15-20k
**Objetivo:** Melhorar experiência durante eventos

**Features:**
5. ✅ Collaborative Playlists (vote em músicas)
6. ✅ Local Talent Marketplace (booking artists)
7. ✅ Food & Drink Pre-Order (NFC wallet)
8. ✅ Event Photo Booth (AI-generated memories)

**Impacto Esperado:**
- 🎵 80% participação em playlists
- 🎤 50 artistas registados no marketplace
- 🍔 30% orders via pre-order
- 📸 5x mais fotos partilhadas

---

### **FASE 3: Cultura & Sustentabilidade** (6 semanas) - €10-15k
**Objetivo:** Diferenciação cultural e impacto social

**Features:**
9. ✅ Carbon Footprint Tracker
10. ✅ CV Creole Language Support
11. ✅ Community Event Voting
12. ✅ AI Event Recommendations

**Impacto Esperado:**
- 🌱 50% eventos com carbon offset
- 🇨🇻 20% users preferem Crioulo
- 🗳️ 70% engagement em polls
- 🎯 2x descoberta de eventos (AI recs)

---

## 💰 Investimento Total

| Fase | Timeline | Investimento | ROI Esperado |
|------|----------|--------------|--------------|
| FASE 1 | 6 semanas | €15-20k | 40% ↑ conversão, 20% ↑ revenue |
| FASE 2 | 6 semanas | €15-20k | 3x engagement, 50 artistas |
| FASE 3 | 6 semanas | €10-15k | Diferenciação cultural |
| **TOTAL** | **18 semanas** | **€40-55k** | **Liderança de mercado** |

---

## 🎯 Por Que Isto Nos Torna Únicos

| Feature | Events.cv | Luma | Eventbrite | Dice | Shotgun |
|---------|-----------|------|------------|------|---------|
| Live Sales Dashboard | ✅ | ❌ | ❌ | ❌ | ❌ |
| Gamification & Achievements | ✅ | ❌ | ❌ | ❌ | ❌ |
| Dynamic Pricing | ✅ | ❌ | ⚠️ | ❌ | ❌ |
| Collaborative Playlists | ✅ | ❌ | ❌ | ❌ | ❌ |
| Talent Marketplace | ✅ | ❌ | ❌ | ❌ | ❌ |
| NFC Pre-Order Food | ✅ | ❌ | ❌ | ❌ | ❌ |
| Carbon Footprint | ✅ | ❌ | ❌ | ❌ | ❌ |
| Crioulo Support | ✅ | ❌ | ❌ | ❌ | ❌ |
| Community Voting | ✅ | ❌ | ❌ | ❌ | ❌ |
| AI Recommendations | ✅ | ⚠️ | ⚠️ | ❌ | ❌ |
| **NFC Cashless** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Loyalty Program** | ✅ | ❌ | ❌ | ❌ | ❌ |

**✅ = Única no mercado | ⚠️ = Básico | ❌ = Não tem**

---

## 📊 Decisão: Luma Features + Inovação?

### Opção A: HÍBRIDA (Recomendado)
**Luma Best Features (do plano anterior):**
- Event Calendars
- Guest Chat
- Event Blasts
- Social Sharing

**+ NOSSA INOVAÇÃO:**
- Live Dashboard (FOMO)
- Gamification (achievements)
- Collaborative Playlists
- Talent Marketplace
- Carbon Footprint

**Timeline:** 6 meses
**Investimento:** €60-80k
**Resultado:** Paridade com Luma + Diferenciação clara

### Opção B: SÓ INOVAÇÃO
**Focar em features únicas:**
- Todas as 12 features inovadoras
- Não copiar Luma
- Criar mercado próprio

**Timeline:** 4-5 meses
**Investimento:** €40-55k
**Resultado:** 100% diferenciado, mercado de nicho

### Opção C: INCREMENTAL
**Começar com TOP 5:**
1. Live Event Dashboard
2. Gamification
3. Event Calendars (Luma)
4. Guest Chat (Luma)
5. Collaborative Playlists

**Timeline:** 2-3 meses
**Investimento:** €20-30k
**Resultado:** Quick wins, iterar depois

---

## 🚀 Qual Caminho Seguir?

**Minha Recomendação:** **Opção A (HÍBRIDA)**

**Porquê:**
1. ✅ Aproveita best practices do Luma (calendars, chat)
2. ✅ Adiciona diferenciação CLARA (gamification, playlists)
3. ✅ Capitaliza vantagens existentes (NFC, wallet)
4. ✅ Cria moat defensável (ninguém consegue copiar tudo)
5. ✅ Timeline realista (6 meses)

**Próximos Passos:**
1. ⬜ Aprovar roadmap de inovação
2. ⬜ Decidir: Opção A, B ou C?
3. ⬜ Priorizar features (top 5 para começar?)
4. ⬜ Começar implementação

O que prefere? Híbrida, só inovação, ou incremental? 🎯

---

**Documento Criado:** 2025-12-23
**Versão:** 1.0
**Status:** Aguardando Decisão Estratégica
