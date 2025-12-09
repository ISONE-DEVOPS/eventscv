# EventsCV - Arquitetura SaaS Multi-Tenant

## Visão Geral

EventsCV é uma plataforma SaaS (Software as a Service) de gestão de eventos com arquitetura multi-tenant, onde cada promotor de eventos opera no seu próprio espaço isolado dentro da plataforma.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           EVENTSCV SAAS PLATFORM                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         NÍVEIS DE ACESSO                                 │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                         │   │
│  │  🔴 SUPER ADMIN (Plataforma)                                            │   │
│  │     └── Gestão total da plataforma EventsCV                            │   │
│  │         ├── Gestão de todos os tenants/organizações                    │   │
│  │         ├── Configurações globais (taxas, pagamentos, features)        │   │
│  │         ├── Analytics e relatórios globais                             │   │
│  │         ├── Suporte e moderação                                        │   │
│  │         └── Gestão de Admins                                           │   │
│  │                                                                         │   │
│  │  🟠 ADMIN (Organização/Tenant)                                          │   │
│  │     └── Gestão de uma organização específica                           │   │
│  │         ├── Configurações da organização                               │   │
│  │         ├── Gestão de promotores da organização                        │   │
│  │         ├── Relatórios financeiros da organização                      │   │
│  │         ├── Aprovação de eventos                                       │   │
│  │         └── Gestão de payouts                                          │   │
│  │                                                                         │   │
│  │  🟢 PROMOTOR (Eventos)                                                  │   │
│  │     └── Gestão dos seus próprios eventos                               │   │
│  │         ├── Criar e editar eventos                                     │   │
│  │         ├── Gestão de bilhetes e preços                                │   │
│  │         ├── Check-in e controlo de acessos                             │   │
│  │         ├── Relatórios dos seus eventos                                │   │
│  │         └── Gestão de staff/voluntários                                │   │
│  │                                                                         │   │
│  │  🔵 UTILIZADOR FINAL (Consumidor)                                       │   │
│  │     └── Experiência de compra e participação                           │   │
│  │         ├── Descobrir e pesquisar eventos                              │   │
│  │         ├── Comprar bilhetes                                           │   │
│  │         ├── Wallet digital                                             │   │
│  │         ├── Meus bilhetes e histórico                                  │   │
│  │         └── Programa de fidelidade                                     │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Modelo Multi-Tenant

### Estrutura Hierárquica

```
EventsCV Platform (SaaS)
│
├── Organização A (Tenant)
│   ├── Admin A1
│   ├── Admin A2
│   ├── Promotor A1
│   │   ├── Evento 1
│   │   └── Evento 2
│   └── Promotor A2
│       └── Evento 3
│
├── Organização B (Tenant)
│   ├── Admin B1
│   └── Promotor B1
│       ├── Evento 4
│       └── Evento 5
│
└── Utilizadores Finais (Globais)
    ├── User 1 → compra bilhetes de qualquer evento
    ├── User 2
    └── User N
```

### Isolamento de Dados

| Entidade | Escopo | Visibilidade |
|----------|--------|--------------|
| Configurações Plataforma | Global | Super Admin |
| Organizações | Global | Super Admin, Admin próprio |
| Eventos | Por Organização | Público (publicados), Org (draft) |
| Orders/Bilhetes | Por Evento | User próprio, Promotor, Admin, Super Admin |
| Utilizadores | Global | Próprio, Super Admin |
| Wallet | Por User | User próprio, Super Admin |
| Transações Cashless | Por Evento | Promotor, Admin, Super Admin |

---

## Definição de Roles e Permissões

### 1. Super Admin (Platform Owner)

**Descrição:** Equipa EventsCV que gere toda a plataforma.

```typescript
const SUPER_ADMIN_PERMISSIONS = {
  // Gestão de Plataforma
  platform: {
    viewDashboard: true,
    editSettings: true,
    viewAnalytics: true,
    manageFeatureFlags: true,
    viewAllLogs: true,
  },

  // Gestão de Organizações
  organizations: {
    create: true,
    read: true,
    update: true,
    delete: true,
    approve: true,
    suspend: true,
    viewFinancials: true,
    manageCommissions: true,
  },

  // Gestão de Utilizadores
  users: {
    create: true,
    read: true,
    update: true,
    delete: true,
    impersonate: true,      // Login como outro user para suporte
    manageRoles: true,
    viewWallets: true,
    issueRefunds: true,
  },

  // Gestão de Eventos
  events: {
    readAll: true,
    updateAny: true,
    deleteAny: true,
    feature: true,          // Destacar eventos na homepage
    moderate: true,
  },

  // Financeiro
  finance: {
    viewAllTransactions: true,
    managePayouts: true,
    configurePaymentGateways: true,
    viewRevenue: true,
    exportReports: true,
  },

  // Suporte
  support: {
    viewTickets: true,
    respondTickets: true,
    accessAllData: true,
  },
};
```

**Acesso:** `superadmin.eventscv.cv`

---

### 2. Admin (Organization Admin)

**Descrição:** Gestor de uma organização/empresa de eventos específica.

```typescript
const ADMIN_PERMISSIONS = {
  // Gestão da Organização
  organization: {
    viewDashboard: true,
    editProfile: true,
    editSettings: true,
    viewAnalytics: true,
    manageBranding: true,
  },

  // Gestão de Equipa
  team: {
    invitePromoters: true,
    removePromoters: true,
    manageRoles: true,       // Apenas dentro da org
    viewActivity: true,
  },

  // Gestão de Eventos (todos da org)
  events: {
    create: true,
    readAll: true,           // Todos os eventos da org
    updateAll: true,
    deleteAll: true,
    approve: true,           // Aprovar eventos de promotores
    publish: true,
  },

  // Financeiro (da organização)
  finance: {
    viewTransactions: true,
    viewRevenue: true,
    requestPayout: true,
    viewPayoutHistory: true,
    exportReports: true,
    manageRefunds: true,
  },

  // Configurações de Bilhética
  ticketing: {
    manageTicketTypes: true,
    setPricing: true,
    manageDiscounts: true,
    viewSalesReports: true,
  },

  // NFC/Cashless
  cashless: {
    manageWristbands: true,
    viewAllTransactions: true,
    manageVendors: true,
    configureTerminals: true,
  },
};
```

**Acesso:** `admin.eventscv.cv` ou `[org-slug].eventscv.cv/admin`

---

### 3. Promotor (Event Promoter)

**Descrição:** Criador e gestor de eventos individuais dentro de uma organização.

```typescript
const PROMOTER_PERMISSIONS = {
  // Gestão de Eventos (próprios)
  events: {
    create: true,
    readOwn: true,
    updateOwn: true,
    deleteOwn: true,         // Apenas draft
    submitForApproval: true,
    viewAnalytics: true,
  },

  // Bilhética (eventos próprios)
  ticketing: {
    createTicketTypes: true,
    updateTicketTypes: true,
    viewOrders: true,
    checkIn: true,
    validateTickets: true,
    viewAttendees: true,
    exportAttendeeList: true,
  },

  // Staff
  staff: {
    addStaff: true,          // Adicionar staff ao evento
    removeStaff: true,
    assignRoles: true,       // Roles de staff (check-in, vendas)
  },

  // Relatórios (eventos próprios)
  reports: {
    viewSales: true,
    viewCheckIns: true,
    viewRevenue: true,       // Revenue do promotor
    exportBasicReports: true,
  },

  // Cashless (eventos próprios)
  cashless: {
    viewTransactions: true,
    activateWristbands: true,
    viewVendorSales: true,
  },

  // Comunicação
  communication: {
    sendToAttendees: true,   // Email/notificação para compradores
    viewMessages: true,
  },
};
```

**Acesso:** `dashboard.eventscv.cv` ou `[org-slug].eventscv.cv/dashboard`

---

### 4. Utilizador Final (End User)

**Descrição:** Consumidor que compra bilhetes e participa em eventos.

```typescript
const USER_PERMISSIONS = {
  // Descoberta
  discovery: {
    browseEvents: true,
    searchEvents: true,
    viewEventDetails: true,
    saveEvents: true,        // Favoritos
  },

  // Compras
  purchases: {
    buyTickets: true,
    viewOwnOrders: true,
    cancelOrder: true,       // Dentro do prazo de cancelamento
    requestRefund: true,
    transferTicket: true,    // Se permitido pelo evento
  },

  // Wallet
  wallet: {
    viewBalance: true,
    topUp: true,
    viewTransactions: true,
    transferP2P: true,
  },

  // Bilhetes
  tickets: {
    viewOwn: true,
    downloadQR: true,
    addToWallet: true,       // Apple/Google Wallet
  },

  // Perfil
  profile: {
    editOwn: true,
    manageNotifications: true,
    viewLoyaltyPoints: true,
    redeemRewards: true,
    deleteAccount: true,
  },

  // Social
  social: {
    followOrganizers: true,
    shareEvents: true,
    referFriends: true,
  },
};
```

**Acesso:** `eventscv.cv` (Web) + App Mobile

---

## Interfaces por Role

### Estrutura de Apps

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              APLICAÇÕES EVENTSCV                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  1. SUPER ADMIN PORTAL                                                   │   │
│  │     URL: superadmin.eventscv.cv                                         │   │
│  │     Tech: Next.js (Admin App)                                           │   │
│  │                                                                         │   │
│  │     Funcionalidades:                                                    │   │
│  │     ├── Dashboard global (revenue, users, events)                       │   │
│  │     ├── Gestão de organizações                                          │   │
│  │     ├── Gestão de utilizadores                                          │   │
│  │     ├── Configurações de pagamento                                      │   │
│  │     ├── Feature flags                                                   │   │
│  │     ├── Logs e auditoria                                                │   │
│  │     └── Suporte/Tickets                                                 │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  2. ORGANIZATION DASHBOARD                                               │   │
│  │     URL: admin.eventscv.cv ou [slug].eventscv.cv/admin                  │   │
│  │     Tech: Next.js (Admin App)                                           │   │
│  │                                                                         │   │
│  │     Funcionalidades (Admin):                                            │   │
│  │     ├── Dashboard da organização                                        │   │
│  │     ├── Gestão de equipa (promotores)                                   │   │
│  │     ├── Todos os eventos da org                                         │   │
│  │     ├── Relatórios financeiros                                          │   │
│  │     ├── Payouts                                                         │   │
│  │     └── Configurações da org                                            │   │
│  │                                                                         │   │
│  │     Funcionalidades (Promotor):                                         │   │
│  │     ├── Meus eventos                                                    │   │
│  │     ├── Criar/editar evento                                             │   │
│  │     ├── Gestão de bilhetes                                              │   │
│  │     ├── Check-in                                                        │   │
│  │     ├── Relatórios do evento                                            │   │
│  │     └── Gestão de staff                                                 │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  3. MARKETPLACE (Utilizador Final)                                       │   │
│  │     URL: eventscv.cv                                                    │   │
│  │     Tech: Next.js (Web App)                                             │   │
│  │                                                                         │   │
│  │     Funcionalidades:                                                    │   │
│  │     ├── Homepage com eventos em destaque                                │   │
│  │     ├── Pesquisa e filtros                                              │   │
│  │     ├── Página de evento                                                │   │
│  │     ├── Checkout                                                        │   │
│  │     ├── Meus bilhetes                                                   │   │
│  │     ├── Wallet                                                          │   │
│  │     ├── Perfil                                                          │   │
│  │     └── Programa de fidelidade                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  4. MOBILE APP (Flutter)                                                 │   │
│  │     Stores: App Store + Google Play                                     │   │
│  │                                                                         │   │
│  │     Para Utilizadores:                                                  │   │
│  │     ├── Descoberta de eventos                                           │   │
│  │     ├── Compra de bilhetes                                              │   │
│  │     ├── Wallet digital                                                  │   │
│  │     ├── QR Code dos bilhetes                                            │   │
│  │     ├── Pagamentos NFC                                                  │   │
│  │     └── Notificações push                                               │   │
│  │                                                                         │   │
│  │     Para Promotores/Staff:                                              │   │
│  │     ├── App de check-in (scan QR)                                       │   │
│  │     ├── Terminal de vendas (POS)                                        │   │
│  │     └── Dashboard básico                                                │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Modelo de Dados Atualizado

### Custom Claims (Firebase Auth)

```typescript
interface UserClaims {
  role: 'super_admin' | 'admin' | 'promoter' | 'user';
  organizationId?: string;      // Para admin e promoter
  organizationRole?: 'owner' | 'admin' | 'promoter' | 'staff';
  permissions?: string[];       // Permissões específicas
}

// Exemplos:
// Super Admin
{ role: 'super_admin' }

// Admin de organização
{ role: 'admin', organizationId: 'org_123', organizationRole: 'owner' }

// Promotor
{ role: 'promoter', organizationId: 'org_123', organizationRole: 'promoter' }

// Utilizador final
{ role: 'user' }
```

### Coleções Firestore

```
firestore/
│
├── platform/                           # Configurações globais da plataforma
│   └── config/
│       ├── settings                    # Configurações gerais
│       ├── payment_gateways            # Gateways de pagamento
│       ├── commissions                 # Taxas e comissões
│       ├── feature_flags               # Feature flags
│       └── maintenance                 # Modo manutenção
│
├── super_admins/                       # Super Admins da plataforma
│   └── {userId}/
│       ├── email
│       ├── name
│       ├── permissions
│       └── lastLogin
│
├── organizations/                      # Tenants (Organizações)
│   └── {orgId}/
│       ├── name
│       ├── slug                        # URL amigável
│       ├── logo
│       ├── description
│       ├── status: 'pending' | 'active' | 'suspended'
│       ├── plan: 'starter' | 'pro' | 'business' | 'enterprise'
│       ├── commissionRate              # Taxa personalizada
│       ├── payoutSettings
│       ├── createdAt
│       ├── approvedAt
│       ├── approvedBy                  # Super Admin que aprovou
│       │
│       ├── members/                    # Membros da organização
│       │   └── {userId}/
│       │       ├── role: 'owner' | 'admin' | 'promoter' | 'staff'
│       │       ├── permissions[]
│       │       ├── invitedBy
│       │       ├── joinedAt
│       │       └── status
│       │
│       ├── events/                     # Eventos da organização
│       │   └── {eventId}/ → referência para /events/{eventId}
│       │
│       ├── payouts/                    # Histórico de payouts
│       │   └── {payoutId}/
│       │
│       └── audit_log/                  # Log de atividades
│           └── {logId}/
│
├── events/                             # Eventos (global, indexados)
│   └── {eventId}/
│       ├── organizationId              # Tenant owner
│       ├── createdBy                   # Promotor que criou
│       ├── status: 'draft' | 'pending_approval' | 'approved' | 'published' | 'cancelled' | 'completed'
│       ├── approvedBy                  # Admin que aprovou
│       ├── ... (resto dos campos)
│       │
│       ├── ticketTypes/
│       ├── orders/
│       ├── checkins/
│       └── vendors/
│
├── users/                              # Utilizadores finais
│   └── {userId}/
│       ├── email
│       ├── name
│       ├── role: 'user'               # Role base
│       ├── organizationMemberships: [  # Se também é promotor/admin
│       │   { orgId, role, permissions }
│       │ ]
│       ├── wallet
│       ├── loyalty
│       │
│       ├── tickets/
│       ├── transactions/
│       └── notifications/
│
├── invitations/                        # Convites pendentes
│   └── {inviteId}/
│       ├── email
│       ├── organizationId
│       ├── role
│       ├── invitedBy
│       ├── expiresAt
│       └── status
│
└── audit_logs/                         # Logs globais (Super Admin)
    └── {logId}/
        ├── action
        ├── userId
        ├── targetType
        ├── targetId
        ├── changes
        ├── ip
        └── timestamp
```

---

## Fluxo de Onboarding

### 1. Nova Organização

```
┌─────────────────────────────────────────────────────────────────┐
│                    ONBOARDING ORGANIZAÇÃO                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Promotor regista-se como "Quero criar eventos"              │
│     └── Formulário: Nome, Email, Empresa, NIF, Telefone         │
│                                                                 │
│  2. Cria pedido de organização                                  │
│     └── Nome da org, descrição, tipo de eventos                 │
│                                                                 │
│  3. Super Admin recebe notificação                              │
│     └── Analisa pedido, verifica dados                          │
│                                                                 │
│  4. Super Admin aprova/rejeita                                  │
│     ├── Aprovado: Organização criada, user torna-se Owner       │
│     └── Rejeitado: Email com motivo                             │
│                                                                 │
│  5. Owner configura organização                                 │
│     ├── Upload logo                                             │
│     ├── Configurar payout (dados bancários)                     │
│     └── Convidar equipa                                         │
│                                                                 │
│  6. Owner/Admin cria primeiro evento                            │
│     └── Evento fica em "draft" até publicação                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Convite de Membro

```
Owner/Admin convida → Email enviado → User aceita → Acesso concedido
                   ↓
         [email, role, permissions]
```

---

## Modelo de Preços (SaaS)

### Planos de Subscrição

| Plano | Preço/mês | Taxa/bilhete | Funcionalidades |
|-------|-----------|--------------|-----------------|
| **Starter** | Grátis | 5% + 50$00 | Até 100 bilhetes/evento, 2 eventos/mês, 1 promotor |
| **Pro** | 4.900$00 | 3% + 30$00 | Ilimitado, 5 promotores, relatórios avançados |
| **Business** | 14.900$00 | 2% + 20$00 | Tudo Pro + NFC, API, 20 promotores |
| **Enterprise** | Custom | 1-1.5% | Tudo Business + White-label, SLA, Account manager |

### Limites por Plano

```typescript
const PLAN_LIMITS = {
  starter: {
    maxEventsPerMonth: 2,
    maxTicketsPerEvent: 100,
    maxPromoters: 1,
    maxStaffPerEvent: 3,
    features: ['basic_analytics', 'email_support'],
  },
  pro: {
    maxEventsPerMonth: -1, // Unlimited
    maxTicketsPerEvent: -1,
    maxPromoters: 5,
    maxStaffPerEvent: 10,
    features: ['advanced_analytics', 'priority_support', 'custom_branding', 'api_access'],
  },
  business: {
    maxEventsPerMonth: -1,
    maxTicketsPerEvent: -1,
    maxPromoters: 20,
    maxStaffPerEvent: 50,
    features: ['all_pro', 'nfc_cashless', 'api_full', 'webhooks', 'dedicated_support'],
  },
  enterprise: {
    maxEventsPerMonth: -1,
    maxTicketsPerEvent: -1,
    maxPromoters: -1,
    maxStaffPerEvent: -1,
    features: ['all_business', 'white_label', 'sla', 'account_manager', 'custom_integrations'],
  },
};
```

---

## Security Rules Atualizadas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ===== HELPER FUNCTIONS =====

    function isAuthenticated() {
      return request.auth != null;
    }

    function getUserRole() {
      return request.auth.token.role;
    }

    function isSuperAdmin() {
      return getUserRole() == 'super_admin';
    }

    function isOrgMember(orgId) {
      return isAuthenticated() &&
        request.auth.token.organizationId == orgId;
    }

    function isOrgAdmin(orgId) {
      return isOrgMember(orgId) &&
        request.auth.token.organizationRole in ['owner', 'admin'];
    }

    function isOrgPromoter(orgId) {
      return isOrgMember(orgId) &&
        request.auth.token.organizationRole in ['owner', 'admin', 'promoter'];
    }

    function isEventOwner(eventData) {
      return eventData.createdBy == request.auth.uid;
    }

    // ===== PLATFORM CONFIG =====

    match /platform/{document=**} {
      allow read: if isSuperAdmin();
      allow write: if isSuperAdmin();
    }

    // ===== SUPER ADMINS =====

    match /super_admins/{userId} {
      allow read, write: if isSuperAdmin();
    }

    // ===== ORGANIZATIONS =====

    match /organizations/{orgId} {
      // Public pode ler perfil básico de orgs ativas
      allow read: if resource.data.status == 'active' ||
                    isSuperAdmin() ||
                    isOrgMember(orgId);

      // Criar: apenas super admin (após aprovação de pedido)
      allow create: if isSuperAdmin();

      // Update: super admin ou admin da org
      allow update: if isSuperAdmin() || isOrgAdmin(orgId);

      // Delete: apenas super admin
      allow delete: if isSuperAdmin();

      // Members subcollection
      match /members/{memberId} {
        allow read: if isOrgMember(orgId) || isSuperAdmin();
        allow write: if isOrgAdmin(orgId) || isSuperAdmin();
      }

      // Payouts
      match /payouts/{payoutId} {
        allow read: if isOrgAdmin(orgId) || isSuperAdmin();
        allow create: if isOrgAdmin(orgId);
        allow update: if isSuperAdmin(); // Só super admin processa
      }

      // Audit log
      match /audit_log/{logId} {
        allow read: if isOrgAdmin(orgId) || isSuperAdmin();
        allow create: if isOrgMember(orgId); // Sistema cria automaticamente
      }
    }

    // ===== EVENTS =====

    match /events/{eventId} {
      // Eventos publicados são públicos
      allow read: if resource.data.status == 'published' ||
                    isOrgPromoter(resource.data.organizationId) ||
                    isSuperAdmin();

      // Criar: promotores da org
      allow create: if isOrgPromoter(request.resource.data.organizationId);

      // Update: dono do evento, admin da org, ou super admin
      allow update: if isEventOwner(resource.data) ||
                      isOrgAdmin(resource.data.organizationId) ||
                      isSuperAdmin();

      // Delete: apenas draft, pelo dono ou admin
      allow delete: if resource.data.status == 'draft' &&
                      (isEventOwner(resource.data) ||
                       isOrgAdmin(resource.data.organizationId) ||
                       isSuperAdmin());

      // Subcollections
      match /ticketTypes/{typeId} {
        allow read: if true;
        allow write: if isEventOwner(get(/databases/$(database)/documents/events/$(eventId)).data) ||
                       isOrgAdmin(get(/databases/$(database)/documents/events/$(eventId)).data.organizationId);
      }

      match /orders/{orderId} {
        allow read: if request.auth.uid == resource.data.userId ||
                      isOrgPromoter(get(/databases/$(database)/documents/events/$(eventId)).data.organizationId) ||
                      isSuperAdmin();
        allow create: if isAuthenticated();
        allow update: if false; // Apenas Cloud Functions
      }
    }

    // ===== USERS =====

    match /users/{userId} {
      allow read: if request.auth.uid == userId || isSuperAdmin();
      allow create: if request.auth.uid == userId;
      allow update: if request.auth.uid == userId || isSuperAdmin();
      allow delete: if isSuperAdmin();

      match /tickets/{ticketId} {
        allow read: if request.auth.uid == userId || isSuperAdmin();
        allow write: if false; // Apenas Cloud Functions
      }

      match /transactions/{txId} {
        allow read: if request.auth.uid == userId || isSuperAdmin();
        allow write: if false;
      }
    }

    // ===== INVITATIONS =====

    match /invitations/{inviteId} {
      allow read: if resource.data.email == request.auth.token.email ||
                    isOrgAdmin(resource.data.organizationId) ||
                    isSuperAdmin();
      allow create: if isOrgAdmin(request.resource.data.organizationId);
      allow update: if resource.data.email == request.auth.token.email; // Aceitar convite
      allow delete: if isOrgAdmin(resource.data.organizationId);
    }
  }
}
```

---

## Implementação Técnica

### Estrutura de Pastas Atualizada

```
apps/
├── web/                    # Marketplace (Utilizadores Finais)
│   └── app/
│       ├── (public)/       # Rotas públicas
│       ├── (auth)/         # Login/Register
│       └── (user)/         # Área do utilizador logado
│           ├── tickets/
│           ├── wallet/
│           └── profile/
│
├── admin/                  # Dashboard (Admin + Promotores)
│   └── app/
│       ├── (auth)/         # Login
│       ├── (dashboard)/    # Área comum
│       │   ├── page.tsx    # Overview (adapta ao role)
│       │   ├── events/     # Gestão de eventos
│       │   ├── orders/     # Pedidos
│       │   └── reports/    # Relatórios
│       ├── (admin)/        # Apenas Admin
│       │   ├── team/       # Gestão de equipa
│       │   ├── settings/   # Config da org
│       │   └── payouts/    # Financeiro
│       └── (superadmin)/   # Apenas Super Admin
│           ├── organizations/
│           ├── users/
│           ├── platform/
│           └── support/
│
└── mobile/                 # App Mobile (Flutter)
    └── lib/
        ├── features/
        │   ├── user/       # Funcionalidades user
        │   ├── promoter/   # Funcionalidades promoter (check-in, POS)
        │   └── shared/     # Partilhado
```

---

*Documento de Arquitetura SaaS - EventsCV*
*Versão 2.0*
