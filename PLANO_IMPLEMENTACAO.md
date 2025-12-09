# Plano de Implementação - Plataforma de Eventos CV

## Google Cloud Platform - Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           GOOGLE CLOUD PLATFORM                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         FIREBASE (GCP Integrado)                         │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │  🔐 Firebase Auth          │  🗄️ Cloud Firestore    │  📁 Cloud Storage  │   │
│  │  - Email/Password          │  - NoSQL Database      │  - Imagens         │   │
│  │  - Google/Apple/Facebook   │  - Real-time sync      │  - QR Codes        │   │
│  │  - Phone (SMS)             │  - Offline support     │  - Documentos      │   │
│  │  - Custom Claims           │  - Security Rules      │  - Backups         │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │  📨 Cloud Messaging (FCM)  │  📊 Firebase Analytics │  🔧 Remote Config  │   │
│  │  - Push notifications      │  - User behavior       │  - Feature flags   │   │
│  │  - Topic messaging         │  - Conversions         │  - A/B testing     │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         CLOUD FUNCTIONS (2nd Gen)                        │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │  - Webhooks de Pagamentos (Stripe, Pagali, Vinti4)                      │   │
│  │  - Geração de QR Codes dinâmicos                                        │   │
│  │  - Processamento NFC / Sync offline                                     │   │
│  │  - Triggers Firestore (onCreate, onUpdate, onDelete)                    │   │
│  │  - Scheduled Jobs (relatórios, lembretes, cleanup)                      │   │
│  │  - Callable Functions (validação, wallet, etc.)                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         CLOUD RUN (Opcional)                             │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │  - API REST para integrações externas                                   │   │
│  │  - Microserviços de processamento pesado                                │   │
│  │  - Workers de background jobs                                           │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         SERVIÇOS ADICIONAIS GCP                          │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │  🔒 Secret Manager         │  📊 BigQuery           │  🔍 Cloud Logging  │   │
│  │  - API Keys                │  - Analytics           │  - Audit logs      │   │
│  │  - Credentials             │  - Relatórios          │  - Error tracking  │   │
│  │                            │  - Data warehouse      │  - Monitoring      │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │  ⏰ Cloud Scheduler        │  📬 Cloud Tasks        │  🌐 Cloud CDN      │   │
│  │  - Cron jobs               │  - Queue processing    │  - Assets cache    │   │
│  │  - Reminders               │  - Async tasks         │  - Global delivery │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Estrutura do Projeto (Monorepo)

```
eventscv/
├── apps/
│   ├── web/                      # Next.js 14+ (Marketplace + Portal)
│   │   ├── app/
│   │   │   ├── (public)/         # Rotas públicas
│   │   │   │   ├── page.tsx      # Homepage
│   │   │   │   ├── events/       # Listagem e detalhe eventos
│   │   │   │   ├── checkout/     # Fluxo de compra
│   │   │   │   └── auth/         # Login/Register
│   │   │   ├── (dashboard)/      # Área autenticada
│   │   │   │   ├── profile/      # Perfil utilizador
│   │   │   │   ├── tickets/      # Meus bilhetes
│   │   │   │   ├── wallet/       # Carteira digital
│   │   │   │   └── orders/       # Histórico compras
│   │   │   └── api/              # API Routes (webhooks)
│   │   ├── components/
│   │   ├── lib/
│   │   └── ...
│   │
│   ├── admin/                    # Next.js (Dashboard Admin/Organizadores)
│   │   ├── app/
│   │   │   ├── (auth)/           # Login admin
│   │   │   ├── dashboard/        # Overview
│   │   │   ├── events/           # Gestão eventos
│   │   │   ├── orders/           # Pedidos
│   │   │   ├── analytics/        # Relatórios
│   │   │   ├── nfc/              # Gestão pulseiras
│   │   │   ├── settings/         # Configurações
│   │   │   └── super-admin/      # Apenas super admins
│   │   └── ...
│   │
│   └── mobile/                   # Flutter App
│       ├── lib/
│       │   ├── main.dart
│       │   ├── app/
│       │   │   ├── routes/
│       │   │   └── theme/
│       │   ├── features/
│       │   │   ├── auth/
│       │   │   ├── events/
│       │   │   ├── tickets/
│       │   │   ├── wallet/
│       │   │   └── nfc/
│       │   ├── core/
│       │   │   ├── services/
│       │   │   ├── models/
│       │   │   └── utils/
│       │   └── shared/
│       ├── android/
│       ├── ios/
│       └── pubspec.yaml
│
├── packages/                     # Código partilhado
│   ├── shared-types/             # TypeScript types/interfaces
│   ├── ui-components/            # Componentes React partilhados
│   ├── firebase-admin/           # Firebase Admin SDK utils
│   └── utils/                    # Funções utilitárias
│
├── functions/                    # Cloud Functions
│   ├── src/
│   │   ├── index.ts
│   │   ├── auth/
│   │   │   ├── onUserCreate.ts
│   │   │   └── onUserDelete.ts
│   │   ├── payments/
│   │   │   ├── stripeWebhook.ts
│   │   │   ├── pagaliWebhook.ts
│   │   │   ├── vinti4Webhook.ts
│   │   │   └── processPayment.ts
│   │   ├── tickets/
│   │   │   ├── generateTicket.ts
│   │   │   ├── validateTicket.ts
│   │   │   └── transferTicket.ts
│   │   ├── wallet/
│   │   │   ├── topUp.ts
│   │   │   ├── processBonus.ts
│   │   │   └── updateLoyalty.ts
│   │   ├── nfc/
│   │   │   ├── syncTransaction.ts
│   │   │   ├── activateWristband.ts
│   │   │   └── checkBalance.ts
│   │   ├── notifications/
│   │   │   ├── sendPush.ts
│   │   │   ├── sendEmail.ts
│   │   │   └── eventReminder.ts
│   │   └── scheduled/
│   │       ├── dailyReports.ts
│   │       └── cleanupOldData.ts
│   ├── package.json
│   └── tsconfig.json
│
├── firebase/
│   ├── firestore.rules
│   ├── firestore.indexes.json
│   ├── storage.rules
│   └── firebase.json
│
├── infrastructure/               # IaC (Terraform/Pulumi)
│   ├── main.tf
│   ├── variables.tf
│   └── modules/
│
├── docs/                         # Documentação
│   ├── api/
│   ├── architecture/
│   └── deployment/
│
├── package.json                  # Root package.json (workspaces)
├── turbo.json                    # Turborepo config
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── deploy-web.yml
│       ├── deploy-admin.yml
│       ├── deploy-functions.yml
│       └── deploy-mobile.yml
└── README.md
```

---

## Fases de Implementação Detalhadas

### FASE 0: Setup Inicial (1-2 semanas)

#### 0.1 Configuração GCP & Firebase
```bash
# Criar projeto GCP
gcloud projects create eventscv-prod --name="EventsCV Production"
gcloud projects create eventscv-staging --name="EventsCV Staging"

# Ativar APIs necessárias
gcloud services enable \
  firebase.googleapis.com \
  firestore.googleapis.com \
  cloudfunctions.googleapis.com \
  cloudrun.googleapis.com \
  secretmanager.googleapis.com \
  cloudscheduler.googleapis.com \
  cloudtasks.googleapis.com \
  bigquery.googleapis.com

# Configurar Firebase
firebase projects:addfirebase eventscv-prod
firebase projects:addfirebase eventscv-staging
```

#### 0.2 Setup Monorepo
- Inicializar monorepo com Turborepo
- Configurar ESLint, Prettier, TypeScript
- Setup Husky + lint-staged
- Configurar CI/CD (GitHub Actions)

#### 0.3 Ambientes
| Ambiente | Projeto Firebase | URL |
|----------|-----------------|-----|
| Development | eventscv-dev | localhost:3000 |
| Staging | eventscv-staging | staging.eventscv.cv |
| Production | eventscv-prod | www.eventscv.cv |

#### Entregáveis Fase 0:
- [ ] Projetos GCP/Firebase criados e configurados
- [ ] Monorepo inicializado com todas as apps
- [ ] CI/CD pipeline funcional
- [ ] Ambientes de staging e produção configurados
- [ ] Domínios configurados (DNS, SSL)

---

### FASE 1: MVP Core (8-10 semanas)

#### Sprint 1-2: Autenticação & Base (2 semanas)

**Web App (Next.js):**
```typescript
// Funcionalidades:
- Login/Register (Email, Google, Facebook, Apple)
- Login com telefone (SMS - importante para CV)
- Recuperação de password
- Perfil básico do utilizador
- Protected routes
```

**Firebase:**
```typescript
// Cloud Functions:
- onUserCreate: Criar documento user no Firestore
- onUserDelete: Cleanup de dados

// Firestore Collections:
- users/{userId}
- users/{userId}/settings
```

**Mobile (Flutter):**
```dart
// Funcionalidades:
- Splash screen
- Onboarding
- Login/Register (mesmos métodos)
- Navegação básica
```

#### Sprint 3-4: Gestão de Eventos (2 semanas)

**Admin Dashboard:**
```typescript
// Funcionalidades Organizador:
- Criar evento (wizard multi-step)
- Editar evento
- Upload de imagens (cover, galeria)
- Definir tipos de bilhetes
- Configurar preços e quotas
- Publicar/despublicar evento
- Listagem dos meus eventos
```

**Web App:**
```typescript
// Funcionalidades Público:
- Homepage com eventos em destaque
- Listagem de eventos com filtros
- Página de detalhe do evento
- Busca por texto, data, categoria, localização
- SEO otimizado (metadata, OG tags)
```

**Firestore:**
```typescript
// Collections:
- organizations/{orgId}
- events/{eventId}
- events/{eventId}/ticketTypes/{typeId}
```

#### Sprint 5-6: Sistema de Bilhetes & Checkout (2 semanas)

**Web App:**
```typescript
// Checkout Flow:
1. Seleção de bilhetes
2. Reserva temporária (10 min via Cloud Functions)
3. Formulário de dados
4. Seleção de pagamento
5. Processamento
6. Confirmação + Email
```

**Cloud Functions:**
```typescript
// Functions:
- reserveTickets: Bloquear bilhetes temporariamente
- releaseExpiredReservations: Scheduled (cada 1 min)
- processOrder: Criar order após pagamento
- generateTicketQR: Gerar QR único por bilhete
- sendOrderConfirmation: Email + Push
```

**Integrações Pagamento (Básico):**
```typescript
// Stripe:
- Stripe Elements (cartões internacionais)
- Webhook para confirmar pagamentos
- Stripe Connect (preparar para payouts)

// Pagali (MVP):
- Redirect flow
- Webhook de confirmação
```

#### Sprint 7-8: Mobile App & Dashboard (2 semanas)

**Mobile App:**
```dart
// Funcionalidades:
- Feed de eventos
- Detalhe do evento
- Compra de bilhetes (WebView ou nativo)
- Meus bilhetes (lista)
- QR Code do bilhete
- Push notifications
- Offline cache (bilhetes)
```

**Admin Dashboard:**
```typescript
// Funcionalidades:
- Dashboard overview (vendas, check-ins)
- Lista de orders
- Lista de participantes
- Exportar CSV
- Check-in manual (busca por email/nome)
```

#### Entregáveis Fase 1:
- [ ] Sistema de autenticação completo
- [ ] CRUD de eventos funcional
- [ ] Checkout com Stripe + Pagali
- [ ] Geração de bilhetes com QR
- [ ] App mobile com bilhetes
- [ ] Dashboard básico para organizadores
- [ ] Emails transacionais configurados

---

### FASE 2: Wallet & Pagamentos Avançados (4-6 semanas)

#### Sprint 9-10: Sistema de Wallet (2 semanas)

**Modelo de Dados:**
```typescript
// users/{userId}
wallet: {
  balance: number,           // Saldo principal (CVE)
  bonusBalance: number,      // Saldo bónus/cashback
  currency: "CVE",
  lastTopUp: timestamp,
  totalSpent: number
}

// users/{userId}/walletTransactions/{txId}
{
  type: "topup" | "purchase" | "cashback" | "refund" | "transfer_in" | "transfer_out",
  amount: number,
  balanceType: "main" | "bonus",
  balanceAfter: number,
  description: string,
  reference: string,         // orderId, paymentId, etc.
  createdAt: timestamp
}
```

**Cloud Functions:**
```typescript
- topUpWallet: Processar carregamento
- deductFromWallet: Débito para compras
- addCashback: Crédito de cashback
- transferP2P: Transferência entre users
- getWalletBalance: Callable para saldo atual
```

**Frontend:**
```typescript
// Web + Mobile:
- Página/Screen da Wallet
- Histórico de transações
- Top-up flow (escolher valor → método → confirmar)
- Saldo visível no header/app bar
```

#### Sprint 11-12: Integração Vinti4 & Melhorias (2 semanas)

**Vinti4 Integration:**
```typescript
// Fluxo:
1. User seleciona Vinti4
2. Redirect para página Vinti4
3. User paga com cartão nacional
4. Callback para nossa API
5. Webhook confirma pagamento
6. Crédito na wallet
```

**Melhorias Checkout:**
```typescript
- Pagamento via Wallet (se saldo suficiente)
- Split payment (Wallet + Cartão)
- Salvar método de pagamento preferido
- Histórico de pagamentos
```

#### Sprint 13: Cashback & Promoções Básicas (1-2 semanas)

**Sistema de Cashback:**
```typescript
// Regras configuráveis por organizador:
- Percentagem de cashback (ex: 5%)
- Valor mínimo de compra
- Período da promoção
- Limite máximo de cashback

// Cloud Function Trigger:
onOrderComplete → calcular e creditar cashback
```

#### Entregáveis Fase 2:
- [ ] Wallet funcional com saldo
- [ ] Top-up via Stripe, Pagali, Vinti4
- [ ] Pagamento via wallet no checkout
- [ ] Histórico de transações
- [ ] Sistema de cashback básico
- [ ] Transferências P2P

---

### FASE 3: NFC & Cashless (6-8 semanas)

#### Sprint 14-15: Infraestrutura NFC (2 semanas)

**Modelo de Dados:**
```typescript
// nfcWristbands/{wristbandUid}
{
  uid: string,               // UID único da pulseira
  eventId: string,
  userId: string | null,
  ticketId: string | null,
  balance: number,           // Saldo cashless
  status: "inactive" | "active" | "blocked",
  activatedAt: timestamp | null,
  lastTransaction: timestamp | null,
  offlineBalance: number,    // Cache para modo offline
  pin: string | null         // PIN opcional para segurança
}

// cashlessTransactions/{txId}
{
  wristbandUid: string,
  eventId: string,
  vendorId: string,
  terminalId: string,
  amount: number,
  type: "payment" | "topup" | "refund",
  status: "pending" | "completed" | "failed",
  offline: boolean,          // True se feita offline
  syncedAt: timestamp | null,
  createdAt: timestamp
}
```

**Cloud Functions:**
```typescript
- activateWristband: Associar pulseira a bilhete/user
- topUpWristband: Carregar saldo cashless
- processPayment: Débito de saldo (online)
- syncOfflineTransactions: HTTP endpoint para sync
- checkWristbandBalance: Query de saldo
```

#### Sprint 16-17: App Terminal POS (2 semanas)

**Flutter App (Terminal/POS):**
```dart
// Funcionalidades:
- Login staff/vendor
- Leitura NFC da pulseira
- Mostrar saldo
- Input valor a cobrar
- Confirmar transação
- Modo offline (queue local)
- Sync automático quando online
- Histórico de transações do terminal
```

**Modo Offline:**
```dart
// Estratégia:
1. Cache de pulseiras ativas (últimas 24h)
2. Queue local de transações (Hive/SQLite)
3. Limite de transação offline (ex: 5000 CVE)
4. Limite total offline por pulseira (ex: 10000 CVE)
5. Sync automático quando detecta internet
6. Indicador visual de modo offline
```

#### Sprint 18-19: Dashboard Cashless (2 semanas)

**Admin Dashboard:**
```typescript
// Funcionalidades:
- Gestão de pulseiras (importar lote, ativar, bloquear)
- Gestão de vendedores
- Gestão de terminais
- Dashboard vendas em tempo real
- Relatório por vendedor
- Relatório por produto/categoria
- Exportar dados
- Reconciliação de transações offline
```

**Real-time Dashboard:**
```typescript
// Firestore listeners:
- Total vendas ao vivo
- Transações por minuto
- Top vendedores
- Alertas (transações suspeitas)
```

#### Sprint 20: Check-in NFC (1-2 semanas)

**Funcionalidades:**
```typescript
- Leitura NFC para check-in
- Validação do bilhete
- Controlo de entradas/saídas
- Zonas de acesso (VIP, Backstage)
- Dashboard check-ins em tempo real
- Alertas de bilhetes duplicados
```

#### Entregáveis Fase 3:
- [ ] Gestão de pulseiras NFC
- [ ] App terminal POS funcional
- [ ] Pagamentos cashless online
- [ ] Modo offline com sync
- [ ] Check-in via NFC
- [ ] Dashboard vendas real-time
- [ ] Relatórios cashless

---

### FASE 4: Fidelização & Growth (4-6 semanas)

#### Sprint 21-22: Sistema de Pontos (2 semanas)

**Modelo de Dados:**
```typescript
// users/{userId}
loyalty: {
  points: number,
  lifetimePoints: number,
  tier: "bronze" | "silver" | "gold" | "platinum",
  tierExpiresAt: timestamp,
  nextTierAt: number        // Pontos para próximo nível
}

// Regras de pontos:
- 1 CVE gasto = 1 ponto
- Bónus por categoria de evento
- Bónus por tier
- Pontos expiram em 12 meses
```

**Tiers:**
| Tier | Pontos/Ano | Benefícios |
|------|-----------|------------|
| Bronze | 0 | 1x pontos |
| Silver | 5000 | 1.5x pontos, acesso antecipado |
| Gold | 15000 | 2x pontos, descontos 10% |
| Platinum | 50000 | 3x pontos, descontos 20%, VIP |

#### Sprint 23-24: Referral & Recompensas (2 semanas)

**Programa Referral:**
```typescript
// users/{userId}
referral: {
  code: string,              // Código único
  referredBy: string | null,
  referralCount: number,
  totalEarned: number
}

// Recompensas:
- Quem convida: 500 pontos + 5% da 1ª compra
- Quem é convidado: 10% desconto na 1ª compra
```

**Marketplace de Recompensas:**
```typescript
// rewards/{rewardId}
{
  name: string,
  description: string,
  type: "discount" | "freeTicket" | "merchandise" | "experience",
  pointsCost: number,
  stock: number | null,
  validUntil: timestamp,
  terms: string
}
```

#### Sprint 25: Analytics Avançados (1-2 semanas)

**BigQuery Integration:**
```typescript
// Export automático para BigQuery:
- Eventos
- Orders
- Transações cashless
- User behavior

// Dashboards:
- Looker Studio para organizadores
- Métricas de conversão
- Cohort analysis
- Previsão de vendas
```

#### Entregáveis Fase 4:
- [ ] Sistema de pontos completo
- [ ] Tiers de fidelidade
- [ ] Programa de referral
- [ ] Marketplace de recompensas
- [ ] Analytics avançados (BigQuery)
- [ ] Dashboards personalizados

---

### FASE 5: Escala & Enterprise (Ongoing)

#### 5.1 Internacionalização
```typescript
// i18n:
- Português (PT-PT, PT-CV)
- English
- Français (países PALOP)

// Multi-moeda:
- CVE (Escudo Cabo-verdiano)
- EUR
- USD
```

#### 5.2 API Pública
```typescript
// REST API para integrações:
- Autenticação OAuth2
- Endpoints públicos (eventos, organizadores)
- Endpoints privados (orders, tickets)
- Webhooks configuráveis
- Rate limiting
- Documentação OpenAPI/Swagger
```

#### 5.3 White-Label
```typescript
// Para grandes organizadores:
- Domínio personalizado
- Branding customizado
- App mobile própria (flavor)
- Funcionalidades exclusivas
```

---

## Estimativa de Custos GCP (Mensal)

### Ambiente de Desenvolvimento/Staging
| Serviço | Uso Estimado | Custo |
|---------|--------------|-------|
| Firebase Spark Plan | Free tier | $0 |
| Cloud Functions | < 2M invocations | ~$0 |
| Firestore | < 1GB, < 50k reads/day | ~$0 |
| Storage | < 5GB | ~$0 |
| **Total Dev/Staging** | | **~$0-20/mês** |

### Produção (Inicial - até 10k users)
| Serviço | Uso Estimado | Custo |
|---------|--------------|-------|
| Firebase Blaze Plan | Pay as you go | - |
| Cloud Firestore | 10GB, 500k reads/day | ~$50 |
| Cloud Functions | 5M invocations | ~$20 |
| Cloud Storage | 50GB | ~$5 |
| Firebase Auth | 50k MAU | ~$0 (free tier) |
| Cloud Messaging | Unlimited | $0 |
| Secret Manager | 10 secrets | ~$1 |
| Cloud Scheduler | 10 jobs | ~$1 |
| **Total Inicial** | | **~$80-150/mês** |

### Produção (Scale - 50k+ users)
| Serviço | Uso Estimado | Custo |
|---------|--------------|-------|
| Cloud Firestore | 100GB, 5M reads/day | ~$500 |
| Cloud Functions | 50M invocations | ~$200 |
| Cloud Storage | 500GB | ~$50 |
| BigQuery | 1TB processed | ~$25 |
| Cloud Run (API) | 100k requests/day | ~$50 |
| Firebase Auth | 500k MAU | ~$100 |
| CDN/Bandwidth | 1TB | ~$100 |
| **Total Scale** | | **~$1000-1500/mês** |

### Custos Externos (Estimativa)
| Serviço | Custo Mensal |
|---------|--------------|
| Vercel (Web hosting) | $20-100 |
| SendGrid (Email) | $20-50 |
| Twilio (SMS) | $50-200 |
| Sentry (Error tracking) | $26-80 |
| Stripe (taxas) | 2.9% + $0.30/tx |
| Domínio + SSL | ~$20/ano |

---

## Equipa Recomendada

### MVP (Fase 1-2)
| Função | Quantidade | Responsabilidade |
|--------|-----------|------------------|
| Full-Stack Lead | 1 | Arquitetura, Next.js, Firebase |
| Flutter Developer | 1 | App mobile |
| UI/UX Designer | 1 | Design system, interfaces |

### Scale (Fase 3-5)
| Função | Quantidade | Responsabilidade |
|--------|-----------|------------------|
| Tech Lead | 1 | Arquitetura, code review |
| Backend Developer | 1-2 | Cloud Functions, integrações |
| Frontend Developer | 1-2 | Next.js, React |
| Flutter Developer | 1-2 | Apps mobile |
| DevOps | 0.5-1 | CI/CD, infraestrutura |
| QA Engineer | 1 | Testes, qualidade |
| UI/UX Designer | 1 | Evolução produto |

---

## Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Integração Pagali/Vinti4 complexa | Alta | Alto | Começar integração cedo, ter fallback |
| Performance em eventos grandes | Média | Alto | Load testing, auto-scaling configurado |
| NFC offline sync conflicts | Média | Médio | Estratégia de resolução de conflitos robusta |
| Fraude em pagamentos | Média | Alto | Limites, verificações, monitoring |
| Adoção lenta por organizadores | Média | Alto | Onboarding simples, suporte próximo |
| Conectividade em CV | Alta | Médio | Forte suporte offline, PWA |

---

## Métricas de Sucesso

### KPIs Técnicos
- Uptime > 99.5%
- Tempo de resposta API < 200ms (p95)
- Taxa de erro < 0.1%
- Sync offline < 30s após reconexão

### KPIs de Negócio
- Eventos criados por mês
- Bilhetes vendidos
- Volume transacionado
- Taxa de conversão checkout
- NPS de organizadores
- Retenção de utilizadores

---

## Próximos Passos Imediatos

1. **Setup do projeto**
   - Criar repositório GitHub
   - Inicializar monorepo
   - Configurar Firebase projects

2. **Design System**
   - Definir cores, tipografia, componentes
   - Criar protótipos Figma dos fluxos principais

3. **Sprint 1**
   - Autenticação Firebase
   - Estrutura base Next.js
   - Estrutura base Flutter
   - CI/CD pipeline

---

*Documento de Planeamento - Plataforma de Eventos CV*
*Versão 1.0 - Dezembro 2024*
