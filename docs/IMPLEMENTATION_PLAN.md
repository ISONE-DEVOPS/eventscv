# EventsCV - Plano de Implementação Completo do CRUD e Funcionalidades

## 📋 Visão Geral

Este documento apresenta o plano completo para implementação de todas as funcionalidades CRUD faltantes na plataforma EventsCV, incluindo:

- ✅ 8 Páginas Super-Admin (todas as funcionalidades de gestão da plataforma)
- ✅ Sistema de Dashboards Personalizáveis com Widgets
- ✅ Sistema de Permissões Granulares
- ✅ Sistema de Notificações (Email, Push, In-App)
- ✅ Sistema de Relatórios e Exportação

---

## 🎯 Estado Atual vs. Estado Desejado

### Estado Atual (O que já existe)

**Páginas Implementadas:**
- ✅ Login e autenticação Firebase
- ✅ Dashboard organizacional (com dados mock)
- ✅ Eventos (CRUD completo com Firestore)
- ✅ Tickets (lista com refunds)
- ✅ Analytics (com dados mock)
- ✅ Finance (payouts e transações)
- ✅ Team (gestão de membros)
- ✅ Check-in (validação de QR codes)
- ✅ Settings (configurações organizacionais)
- ✅ Super-admin/Users (gestão de utilizadores)
- ✅ Super-admin/Organizations (gestão de organizações)
- ✅ QR Code Registration System (implementado recentemente)

**Infraestrutura Técnica:**
- Firebase Authentication
- Firestore Database
- Firebase Cloud Functions v2
- Next.js 16 com App Router
- TypeScript
- Shared Types package
- Services layer (events, tickets, analytics, finance, team, etc.)

### Estado Desejado (O que vamos implementar)

**Super-Admin Pages:**
1. Events - Moderação e gestão de todos os eventos
2. Analytics - Dashboard com métricas reais da plataforma
3. Subscriptions - Gestão de planos e pagamentos
4. Transactions - Visão financeira global
5. Payouts - Processamento de levantamentos
6. Support - Sistema de tickets de suporte
7. Integrations/Pagali - Gestão de integração de pagamentos
8. Settings - Configurações da plataforma

**Dashboards Personalizáveis:**
- Sistema de widgets (stats, charts, lists, actions)
- Layouts por role (Super Admin, Org Admin, Promoter, End User)
- Drag-and-drop customization
- Dashboard para promotores
- Dashboard para utilizadores finais (web app)

**Permissões Granulares:**
- Resource-based permissions (38 permissões definidas)
- Permission profiles/templates
- Event scoping (acesso específico a eventos)
- Audit log de alterações de permissões
- UI de gestão de permissões

**Sistema de Notificações:**
- Email (SendGrid) - 15+ tipos de notificações
- Push notifications (FCM)
- In-app notification center
- Preferências de notificações por utilizador
- Templates personalizáveis
- Quiet hours e digest mode

**Relatórios e Exportação:**
- 10+ tipos de relatórios predefinidos
- Exportação CSV, Excel, PDF
- Relatórios agendados (daily, weekly, monthly)
- Charts e visualizações em PDF
- Export buttons em todas as tabelas

---

## 📊 Arquitetura da Solução

### Estrutura de Dados

**Novas Collections Firestore:**
```
/dashboardLayouts/{layoutId}              # Layouts de dashboard personalizados
/permissionProfiles/{profileId}           # Templates de permissões
/subscriptions/{subscriptionId}           # Subscrições de organizações
/subscription_usage/{orgId}               # Tracking de uso vs limites
/analytics_daily/{date}                   # Analytics agregados por dia
/analytics_monthly/{month}                # Analytics agregados por mês
/transaction_stats_daily/{date}           # Stats de transações
/pagali_transactions/{transactionId}      # Transações Pagali
/pagali_webhooks/{webhookId}              # Eventos webhook Pagali
/pagali_api_logs/{logId}                  # Logs de API Pagali
/notificationPreferences/{userId}         # Preferências de notificações
/notifications/{notificationId}           # Notificações in-app
/notificationTemplates/{templateId}       # Templates de notificações
/notificationQueue/{queueId}              # Fila de notificações
/reportDefinitions/{reportId}             # Definições de relatórios
/generatedReports/{reportId}              # Relatórios gerados
/scheduledReports/{scheduleId}            # Relatórios agendados
```

**Campos Adicionados a Collections Existentes:**
```typescript
// Event
moderationStatus: 'pending' | 'approved' | 'rejected'
suspended: boolean
suspensionReason?: string

// Organization
subscriptionId: string  // Reference to subscriptions collection

// OrganizationMember
customPermissions: Permission[]
permissionProfile?: string
assignedEventIds: string[]
```

### Cloud Functions Architecture

**Novas Functions:**
```
/functions/src/
├── notifications/
│   ├── triggers/          # Order, ticket, event, payout triggers
│   ├── services/          # Email, push, SMS services
│   ├── scheduled/         # Event reminders, digest processor
│   └── templates/         # Email templates
├── reports/
│   ├── generators/        # CSV, Excel, PDF generators
│   ├── queries/           # Data query services
│   ├── schedulers/        # Daily, weekly, monthly schedulers
│   └── cleanup/           # Expired reports cleanup
├── analytics/
│   ├── aggregators/       # Daily, monthly aggregation
│   └── calculators/       # Stats calculation
├── subscriptions/
│   ├── usage/             # Track usage vs limits
│   └── renewal/           # Check renewals, send notifications
└── integrations/
    └── pagali/            # Webhook handler, sync transactions
```

### UI Components Architecture

**Novos Componentes:**
```
/apps/admin/components/
├── widgets/
│   ├── WidgetRegistry.tsx
│   ├── WidgetContainer.tsx
│   ├── stat/StatWidget.tsx
│   ├── chart/LineChartWidget.tsx
│   └── list/RecentListWidget.tsx
├── dashboard/
│   ├── DashboardGrid.tsx
│   ├── WidgetLibrary.tsx
│   └── WidgetConfigModal.tsx
├── permissions/
│   ├── PermissionEditor.tsx
│   ├── PermissionGate.tsx
│   └── PermissionAuditLog.tsx
├── notifications/
│   ├── NotificationCenter.tsx
│   ├── NotificationItem.tsx
│   └── NotificationPreferences.tsx
└── reports/
    ├── ReportGenerator.tsx
    ├── ReportList.tsx
    └── ScheduledReports.tsx
```

---

## 🗓️ Roadmap de Implementação

### **FASE 1: Super-Admin Pages Essenciais** (Semanas 1-3)

**Prioridade: CRÍTICA** - Ferramentas essenciais para gestão da plataforma

#### Semana 1: Analytics & Events
- [ ] Analytics Page - Substituir mock data por agregações reais
  - Implementar Cloud Functions de agregação diária/mensal
  - Criar collections analytics_daily e analytics_monthly
  - Implementar getPlatformAnalytics com dados reais
  - Adicionar charts de crescimento (revenue, orgs, users)
  - Top events e top organizations

- [ ] Events Page - Moderação e suspensão
  - Adicionar campos de moderação ao Event type
  - Implementar moderateEvent, suspendEvent, unsuspendEvent
  - UI para aprovar/rejeitar eventos
  - Filtros avançados (org, categoria, data, featured, suspended)
  - Bulk operations (feature/suspend múltiplos eventos)

#### Semana 2: Subscriptions & Transactions
- [ ] Subscriptions Page - Gestão completa de planos
  - Criar subscriptions collection e tipos
  - Implementar subscription service (CRUD, plan changes)
  - UI para mudar planos das organizações
  - Tracking de uso vs limites (subscription_usage)
  - Stats: MRR, churn rate, conversions

- [ ] Transactions Page - Visão financeira global
  - Enhanced filtering (tipo, status, org, event, amount, date)
  - Search por transaction ID
  - Transaction details modal
  - Refund management
  - Export CSV/Excel

#### Semana 3: Payouts & Support
- [ ] Payouts Page - Processamento de levantamentos
  - Resolver organization names (denormalização ou joins)
  - Payout details modal com account info
  - Bulk approval workflow
  - Complete payout modal (proof upload, reference)
  - Reject/fail payout com reason
  - Stats e filters melhorados

- [ ] Support Page - Sistema de tickets
  - Two-column layout (list + details)
  - Real-time messaging thread
  - Internal notes
  - Assign to team members
  - SLA tracking (response time, resolution time)
  - Canned responses
  - Attachments upload

### **FASE 2: Integrations & Settings** (Semana 4)

#### Semana 4: Pagali & Platform Settings
- [ ] Integrations/Pagali Page
  - Test connection functionality
  - Webhook configuration e verification
  - Transaction logs from Pagali
  - Success rate metrics e error logs
  - Manual sync button

- [ ] Settings Page - Configurações completas
  - 8 tabs: General, Financial, Features, Appearance, Notifications, Security, Email Templates, Advanced
  - Email template editor com rich text
  - Settings change audit log
  - Commission rate history
  - Import/Export settings
  - Feature flags management

### **FASE 3: Dashboards Personalizáveis** (Semanas 5-7)

#### Semana 5: Widget Framework
- [ ] Widget System Core
  - Definir widget types e interfaces
  - Criar WidgetRegistry e WidgetContainer
  - Implementar widgets básicos (StatWidget, ChartWidgets)
  - Widget data service (routing e fetching)
  - Dashboard layout storage (Firestore)

- [ ] Dashboard Grid Engine
  - Implementar DashboardGrid com react-grid-layout
  - Drag-and-drop functionality
  - Widget resize
  - Layout save/load

#### Semana 6: Role-Specific Dashboards
- [ ] Super Admin Dashboard - Substituir mock data
  - Platform stats widgets
  - Revenue charts
  - Organizations leaderboard
  - Recent activity feed

- [ ] Organization Admin Dashboard - Real data
  - Org stats widgets
  - Revenue trend
  - Upcoming events
  - Recent sales

- [ ] Promoter Dashboard (NEW)
  - My events stats
  - Sales per event
  - Check-in stats
  - Quick actions

- [ ] End User Dashboard (NEW - Web App)
  - Upcoming events (my tickets)
  - Wallet balance
  - Loyalty points
  - Ticket QR codes

#### Semana 7: Customization UI
- [ ] Dashboard Customization
  - Edit mode toggle
  - Widget library panel
  - Widget configuration modal
  - Add/remove widgets
  - Layout management page
  - Save multiple layouts

### **FASE 4: Permissões Granulares** (Semanas 8-9)

#### Semana 8: Permission System Core
- [ ] Data Model & Backend
  - Enhanced OrganizationMember schema (customPermissions, assignedEventIds)
  - Permission profiles/templates
  - Permission evaluation logic (hasPermission, getEffectivePermissions)
  - Update authStore com permission context
  - Permission audit log collection

- [ ] Service Layer
  - Implementar permission checking services
  - Cloud Functions permission middleware
  - Update all callable functions com permission checks

#### Semana 9: Permission UI & Enforcement
- [ ] Permission Management UI
  - PermissionEditor component (checkboxes por categoria)
  - Permission templates selector
  - Event scope configuration
  - Audit log viewer
  - Team page integration

- [ ] Enforcement Across App
  - Update todas as páginas com permission checks
  - PermissionGate component
  - usePermissions hook
  - Update Firestore Security Rules
  - Button/action hiding based on permissions

### **FASE 5: Notificações** (Semanas 10-12)

#### Semana 10: Email Notifications
- [ ] Email Infrastructure
  - Email service com SendGrid
  - Template system (Firestore + code)
  - Template rendering engine
  - Notification preferences collection

- [ ] Critical Email Notifications
  - Order confirmation + ticket delivery
  - Team invitation emails
  - Payout status updates
  - Support ticket replies

#### Semana 11: Push & In-App Notifications
- [ ] Push Notifications
  - FCM integration
  - Push service implementation
  - Token management
  - Push notification triggers

- [ ] In-App Notification Center
  - NotificationCenter component (bell icon)
  - Notification list com infinite scroll
  - Mark as read/unread
  - Click to navigate

#### Semana 12: Advanced Notifications
- [ ] Event Reminders & Scheduled
  - Event reminder scheduler (24h, 1h)
  - Digest processor (daily/weekly)
  - Quiet hours respect

- [ ] Notification Preferences UI
  - Per-notification-type settings
  - Channel preferences (email/push/sms)
  - Frequency settings
  - Test notification button

### **FASE 6: Relatórios e Exportação** (Semanas 13-15)

#### Semana 13: Report Infrastructure
- [ ] Core Report System
  - Report definitions collection
  - CSV generator
  - Excel generator (ExcelJS)
  - Cloud Storage setup
  - Report generation queue

- [ ] Basic Reports
  - Financial summary
  - Transaction list
  - Payout history
  - Ticket sales

#### Semana 14: Advanced Reports
- [ ] PDF Reports
  - PDF generator (PDFKit)
  - Chart generator para PDFs
  - Event performance reports
  - Organization reports

- [ ] Export from Tables
  - Add export buttons a todas as DataTables
  - Quick CSV export functionality
  - Export com filters aplicados

#### Semana 15: Scheduled Reports
- [ ] Report Scheduling
  - Scheduled reports collection
  - Daily/weekly/monthly scheduler
  - Email delivery de reports
  - Report retention (7 days)

- [ ] Reports UI
  - Reports dashboard
  - Report generator modal
  - Scheduled reports management
  - Report history

---

## 🛠️ Stack Técnico

### Frontend
- **Framework:** Next.js 16 (App Router, Turbopack)
- **UI Library:** React 18
- **Styling:** Tailwind CSS
- **State Management:** Zustand (authStore)
- **Forms:** React Hook Form
- **Data Fetching:** React Query (para web app)
- **Charts:** Recharts
- **Drag & Drop:** react-grid-layout
- **Rich Text:** TipTap ou Quill
- **Color Picker:** react-colorful

### Backend
- **Authentication:** Firebase Auth
- **Database:** Firestore
- **Storage:** Cloud Storage
- **Functions:** Cloud Functions v2 (Node.js 22)
- **Scheduled Jobs:** Cloud Scheduler + Pub/Sub

### Integrations
- **Email:** SendGrid
- **Push:** Firebase Cloud Messaging (FCM)
- **SMS:** Twilio (future)
- **Payments:** Pagali, Stripe (existing)
- **PDF:** PDFKit
- **Excel:** ExcelJS
- **CSV:** csv-stringify

### Development
- **Language:** TypeScript
- **Package Manager:** pnpm
- **Monorepo:** pnpm workspaces
- **Linting:** ESLint
- **Formatting:** Prettier

---

## 📦 Dependências a Adicionar

### Functions (`/functions/package.json`)
```json
{
  "dependencies": {
    "exceljs": "^4.4.0",
    "pdfkit": "^0.15.0",
    "csv-stringify": "^6.5.0",
    "chartjs-node-canvas": "^4.1.6",
    "handlebars": "^4.7.8",
    "juice": "^10.0.1"
  }
}
```

### Admin App (`/apps/admin/package.json`)
```json
{
  "dependencies": {
    "react-grid-layout": "^1.4.4",
    "@types/react-grid-layout": "^1.3.5",
    "recharts": "^2.10.0",
    "react-colorful": "^5.6.1",
    "@tiptap/react": "^2.1.0",
    "@tiptap/starter-kit": "^2.1.0"
  }
}
```

### Web App (`/apps/web/package.json`)
```json
{
  "dependencies": {
    "recharts": "^2.10.0"
  }
}
```

---

## 🔒 Segurança e Firestore Rules

### Rules a Adicionar

```javascript
// Dashboard layouts
match /dashboardLayouts/{layoutId} {
  allow read: if isOrgMember(resource.data.organizationId);
  allow create, update: if isAuthenticated() &&
                          request.resource.data.userId == request.auth.uid;
  allow delete: if request.auth.uid == resource.data.userId ||
                  isOrgAdmin(resource.data.organizationId);
}

// Permission audit
match /organizations/{orgId}/permissionAudit/{entryId} {
  allow read: if isOrgAdmin(orgId);
  allow write: if false; // Only via Cloud Function
}

// Subscriptions
match /subscriptions/{subscriptionId} {
  allow read: if isSuperAdmin() ||
                isOrgMember(resource.data.organizationId);
  allow write: if isSuperAdmin();
}

// Notifications
match /notifications/{notificationId} {
  allow read: if request.auth.uid == resource.data.userId;
  allow write: if false; // Only server can write
}

// Generated reports
match /generatedReports/{reportId} {
  allow read: if request.auth.uid == resource.data.generatedBy ||
                isSuperAdmin() ||
                (resource.data.organizationId != null &&
                 isOrgMember(resource.data.organizationId));
  allow write: if false; // Only server can write
}
```

---

## 📈 Métricas de Sucesso

### KPIs Técnicos
- [ ] Todas as 8 páginas super-admin funcionais
- [ ] 0 dados mock (tudo com Firestore real)
- [ ] <2s tempo de carregamento de dashboards
- [ ] 99.9% delivery rate de emails
- [ ] 95% delivery rate de push notifications
- [ ] <5min geração de relatórios grandes (10k+ linhas)
- [ ] 100% coverage de permissões em todas as ações

### KPIs de Negócio
- [ ] Super admins podem gerir plataforma completamente
- [ ] Org admins têm dashboards personalizados
- [ ] Promotores têm dashboard dedicado
- [ ] Utilizadores recebem notificações relevantes
- [ ] Relatórios financeiros exportáveis
- [ ] Sistema de suporte operacional

---

## ⚠️ Riscos e Mitigações

### Riscos Técnicos

1. **Performance de Agregações**
   - **Risco:** Queries complexas podem ser lentas
   - **Mitigação:** Agregações diárias via Cloud Functions, indexes otimizados

2. **Deliverability de Emails**
   - **Risco:** Emails podem ir para spam
   - **Mitigação:** SPF/DKIM/DMARC configurados, warming up do domínio

3. **Quota Limits**
   - **Risco:** Firestore/SendGrid quotas podem ser excedidas
   - **Mitigação:** Rate limiting, monitoring, alertas proativos

4. **Data Migration**
   - **Risco:** Migração de dados existentes pode falhar
   - **Mitigação:** Scripts de migração testados, rollback plan

### Riscos de Negócio

1. **Complexidade de Permissões**
   - **Risco:** Utilizadores confusos com sistema granular
   - **Mitigação:** Templates predefinidos, UI intuitivo, documentação

2. **Notification Fatigue**
   - **Risco:** Muitas notificações podem incomodar utilizadores
   - **Mitigação:** Preferências granulares, digest mode, quiet hours

3. **Report Storage Costs**
   - **Risco:** Relatórios gerados podem custar muito storage
   - **Mitigação:** Auto-delete após 7 dias, compressão de ficheiros

---

## 🧪 Estratégia de Testing

### Testes por Fase

**Fase 1 (Super-Admin Pages):**
- Unit tests para services (events, analytics, subscriptions, etc.)
- Integration tests para CRUD operations
- Manual testing de cada página

**Fase 2 (Dashboards):**
- Component tests para widgets
- Integration tests para layout persistence
- Visual regression tests

**Fase 3 (Permissões):**
- Unit tests para permission evaluation logic
- Integration tests para Firestore rules
- End-to-end tests de permission enforcement

**Fase 4 (Notificações):**
- Unit tests para template rendering
- Integration tests para email/push delivery
- Manual testing de todos os triggers

**Fase 5 (Relatórios):**
- Unit tests para generators (CSV, Excel, PDF)
- Performance tests para large datasets
- Manual testing de scheduled reports

### Testing Checklist

#### Super-Admin
- [ ] Pode aprovar/rejeitar eventos
- [ ] Pode suspender eventos com motivo
- [ ] Pode ver analytics reais da plataforma
- [ ] Pode mudar plano de organização
- [ ] Pode processar payouts
- [ ] Pode responder tickets de suporte
- [ ] Pode configurar integração Pagali
- [ ] Pode editar settings da plataforma

#### Organization Admin
- [ ] Vê dashboard com dados reais
- [ ] Pode personalizar layout do dashboard
- [ ] Pode criar evento (se tiver permissão)
- [ ] Pode exportar relatórios financeiros
- [ ] Recebe notificações de payouts

#### Promoter
- [ ] Vê dashboard de eventos próprios
- [ ] Pode criar eventos (se assignado)
- [ ] Não vê dados financeiros da org
- [ ] Recebe notificações de vendas

#### End User
- [ ] Vê dashboard com tickets
- [ ] Recebe email de confirmação de compra
- [ ] Recebe notificação de evento 24h antes
- [ ] Pode configurar preferências de notificações

---

## 📚 Documentação a Criar

### Para Developers
- [ ] Architecture Decision Records (ADRs)
- [ ] API documentation (Cloud Functions)
- [ ] Widget development guide
- [ ] Permission system guide
- [ ] Notification triggers reference
- [ ] Report definition guide

### Para Users
- [ ] Super admin user guide
- [ ] Dashboard customization tutorial
- [ ] Permission management guide
- [ ] Notification preferences guide
- [ ] Reports generation guide

---

## 🚀 Deployment Strategy

### Staging Environment
1. Deploy todas as features em staging primeiro
2. Testing completo por 1 semana
3. Bug fixes e refinements

### Production Rollout
1. **Soft Launch (Week 16):**
   - Deploy super-admin pages
   - Enable para super admins apenas
   - Monitor errors e performance

2. **Beta Launch (Week 17):**
   - Enable dashboards customizáveis
   - Enable para selected org admins
   - Gather feedback

3. **Full Launch (Week 18):**
   - Enable permissões granulares
   - Enable notificações para todos
   - Enable relatórios para todos
   - Comunicação oficial de features

### Rollback Plan
- Feature flags para disable funcionalidades
- Database backups diários
- Cloud Functions versioning
- Frontend deployment rollback via Vercel/Firebase

---

## 💰 Estimativa de Custos

### Infrastructure Costs (mensal)

**Firebase:**
- Firestore: ~€100/mês (estimado para 100k docs, 1M reads)
- Cloud Functions: ~€50/mês (estimado para 500k invocations)
- Cloud Storage: ~€20/mês (para relatórios)
- **Total Firebase: ~€170/mês**

**Third-Party Services:**
- SendGrid: €15/mês (25k emails)
- Twilio (SMS): €10/mês (500 SMS) - future
- **Total Third-Party: ~€25/mês**

**Total Estimated: €195/mês**

### Development Costs (one-time)

Assumindo 1 developer full-time:
- 18 semanas × 40h/semana = 720 horas
- A taxa de €40/hora = **€28,800**

---

## ✅ Critérios de Aceitação

### Funcionalidades Core
- [x] QR Code Registration implementado
- [ ] Todas as 8 páginas super-admin funcionais
- [ ] Dashboards com dados reais (zero mock data)
- [ ] Sistema de permissões granulares ativo
- [ ] Notificações a funcionar (email + push)
- [ ] Relatórios exportáveis (CSV, Excel, PDF)

### Quality Gates
- [ ] 0 erros TypeScript
- [ ] 0 console errors em produção
- [ ] Lighthouse score >90
- [ ] Todas as Firestore rules testadas
- [ ] Documentação completa
- [ ] User acceptance testing passed

---

## 🎓 Próximos Passos Imediatos

### Após aprovação deste plano:

1. **Setup Inicial (Dia 1):**
   - Criar branch `feature/crud-implementation`
   - Instalar dependências necessárias
   - Setup Firestore collections e indexes
   - Configure SendGrid account

2. **Sprint 1 - Super Admin Analytics (Dias 2-7):**
   - Criar `analytics_daily` collection
   - Implementar Cloud Function `aggregateDailyAnalytics`
   - Implementar `getPlatformAnalytics` com dados reais
   - Update Analytics page UI
   - Testing e deployment

3. **Daily Standups:**
   - Review do progresso
   - Bloqueios e soluções
   - Ajustes ao plano conforme necessário

4. **Weekly Reviews:**
   - Demo das features implementadas
   - Feedback e iterações
   - Planning da próxima semana

---

## 📞 Contactos e Recursos

### Documentação de Referência
- Firebase: https://firebase.google.com/docs
- Next.js: https://nextjs.org/docs
- SendGrid: https://docs.sendgrid.com
- Recharts: https://recharts.org/en-US/
- React Grid Layout: https://react-grid-layout.github.io/react-grid-layout

### Support Channels
- Firebase Support
- SendGrid Support
- Stack Overflow
- GitHub Issues (eventscv repo)

---

**Última atualização:** 2025-12-22
**Versão do documento:** 1.0
**Autor:** Claude Code (Planeamento Assistido)
