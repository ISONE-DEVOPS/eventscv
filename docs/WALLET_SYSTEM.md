# Sistema de Carteira Digital - EventsCV

**Data:** 28 de Dezembro de 2025
**Status:** ✅ Completo e Deployado
**Versão:** 1.0.0

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Funcionalidades](#funcionalidades)
3. [Arquitectura](#arquitectura)
4. [Cloud Functions](#cloud-functions)
5. [Base de Dados](#base-de-dados)
6. [Fluxos de Pagamento](#fluxos-de-pagamento)
7. [Interface do Utilizador](#interface-do-utilizador)
8. [Segurança](#segurança)
9. [Testes](#testes)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O Sistema de Carteira Digital permite que utilizadores:
- Carreguem saldo na sua carteira EventsCV
- Paguem bilhetes instantaneamente usando saldo da carteira
- Recebam bónus em carregamentos
- Vejam histórico de transações
- Recebam reembolsos diretamente na carteira

### Vantagens

✅ **Para Utilizadores:**
- Checkout instantâneo (sem redirecionamento)
- Sem taxas adicionais em pagamentos
- Bónus de 2% em carregamentos ≥1.000$00
- Histórico completo de transações
- Reembolsos automáticos

✅ **Para a Plataforma:**
- Redução de taxas de gateway (Pagali)
- Maior conversão (menos fricção)
- Fidelização de utilizadores
- Dados de consumo mais ricos

---

## ⚡ Funcionalidades

### 1. Tipos de Saldo

**Saldo Principal (balance)**
- Adicionado via carregamentos (top-up)
- Usado em pagamentos de bilhetes
- Pode receber reembolsos

**Saldo Bónus (bonusBalance)**
- Ganho automaticamente em carregamentos ≥1.000$00
- Taxa: 2% do valor carregado
- Usado **primeiro** em pagamentos
- Não pode ser transferido ou retirado

### 2. Sistema de Bónus

| Carregamento | Bónus (2%) | Total Recebido |
|--------------|-----------|----------------|
| 500$00 | 0$00 | 500$00 |
| 1.000$00 | 20$00 | 1.020$00 |
| 2.000$00 | 40$00 | 2.040$00 |
| 5.000$00 | 100$00 | 5.100$00 |
| 10.000$00 | 200$00 | 10.200$00 |
| 50.000$00 | 1.000$00 | 51.000$00 |

**Fórmula:**
```typescript
bonus = amount >= 1000 ? Math.floor(amount * 0.02) : 0
```

### 3. Limites de Operação

| Operação | Mínimo | Máximo |
|----------|--------|--------|
| Carregamento (Top-Up) | 100$00 | 50.000$00 |
| Pagamento | 1$00 | Sem limite (depende do saldo) |
| Reembolso | 1$00 | Valor do pedido |

### 4. Pontos de Fidelidade

- **Taxa:** 1 ponto por cada 100 CVE gastos
- Aplicado tanto em pagamentos Pagali como Wallet
- Arredondado para baixo: `Math.floor(amount / 100)`
- Exemplos:
  - 500 CVE = 5 pontos
  - 1.250 CVE = 12 pontos
  - 99 CVE = 0 pontos

---

## 🏗️ Arquitectura

### Diagrama de Fluxo

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │
       ├─ Top-Up ──────────────────┐
       │                           │
       │                    ┌──────▼──────┐
       │                    │   Pagali    │
       │                    │   Gateway   │
       │                    └──────┬──────┘
       │                           │
       │                    ┌──────▼──────────┐
       │                    │  pagaliWebhook  │
       │                    └──────┬──────────┘
       │                           │
       │                    ┌──────▼──────────┐
       │                    │   topUpWallet   │
       │                    └──────┬──────────┘
       │                           │
       ├─ Pagamento ───────────────┤
       │                           │
       │                    ┌──────▼──────────┐
       │                    │  payWithWallet  │
       │                    └──────┬──────────┘
       │                           │
       │                    ┌──────▼──────────────┐
       │                    │onOrderWalletPayment │
       │                    └──────┬──────────────┘
       │                           │
       │                    ┌──────▼──────────┐
       │                    │ generateTickets │
       │                    │  sendEmail      │
       │                    │  awardPoints    │
       │                    └─────────────────┘
       │
       └─ Consulta ────────────────┐
                                   │
                            ┌──────▼──────────┐
                            │ getWalletBalance│
                            │getWalletTransac.│
                            └─────────────────┘
```

### Componentes

**Frontend (Next.js)**
- `/apps/web/app/wallet/topup/page.tsx` - Página de carregamento
- `/apps/web/app/checkout/CheckoutClient.tsx` - Opção de pagamento wallet
- `/apps/web/app/profile/page.tsx` - Display de saldo

**Backend (Cloud Functions)**
- `/functions/src/wallet/walletOperations.ts` - Todas as operações de carteira
- `/functions/src/payments/pagali.ts` - Integração para top-ups

**Database (Firestore)**
- `users/{userId}` - Documento com campo `wallet: {balance, bonusBalance}`
- `wallet-transactions/{transactionId}` - Histórico de transações
- `orders/{orderId}` - Pedidos com `paymentMethod: 'wallet'`

---

## ☁️ Cloud Functions

Todas as funções estão deployadas em **us-central1**.

### 1. getWalletBalance

**Tipo:** `onCall` (HTTP Callable)
**Autenticação:** Obrigatória
**Descrição:** Obtém o saldo atual da carteira do utilizador.

**Request:**
```typescript
// Sem parâmetros - usa auth.uid automaticamente
```

**Response:**
```typescript
{
  balance: number;        // Saldo principal
  bonusBalance: number;   // Saldo bónus
  totalBalance: number;   // Soma de ambos
}
```

**Exemplo:**
```typescript
const functions = getFunctions();
const getBalanceFn = httpsCallable(functions, 'getWalletBalance');
const result = await getBalanceFn();
console.log(result.data);
// { balance: 5000, bonusBalance: 100, totalBalance: 5100 }
```

---

### 2. getWalletTransactions

**Tipo:** `onCall` (HTTP Callable)
**Autenticação:** Obrigatória
**Descrição:** Retorna histórico de transações da carteira.

**Request:**
```typescript
{
  limit?: number;  // Default: 50, Max: 100
}
```

**Response:**
```typescript
{
  transactions: Array<{
    id: string;
    type: 'topup' | 'payment' | 'refund' | 'bonus';
    amount: number;
    bonusAmount?: number;
    balanceAfter: number;
    bonusBalanceAfter: number;
    description: string;
    relatedOrderId?: string;
    createdAt: Timestamp;
  }>;
}
```

**Exemplo:**
```typescript
const getTransactionsFn = httpsCallable(functions, 'getWalletTransactions');
const result = await getTransactionsFn({ limit: 10 });
```

---

### 3. topUpWallet

**Tipo:** `onCall` (HTTP Callable)
**Autenticação:** Obrigatória
**Descrição:** Adiciona saldo à carteira após pagamento bem-sucedido.

**Request:**
```typescript
{
  amount: number;           // Montante (100-50000 CVE)
  paymentMethod: string;    // 'pagali' | 'stripe'
  paymentReference: string; // Referência do pagamento
}
```

**Response:**
```typescript
{
  newBalance: number;
  newBonusBalance: number;
  bonusAwarded: number;
  transactionId: string;
}
```

**Validações:**
- ✅ Utilizador autenticado
- ✅ Montante entre 100 e 50.000 CVE
- ✅ Payment reference válido

**Lógica de Bónus:**
```typescript
const bonus = amount >= 1000 ? Math.floor(amount * 0.02) : 0;
```

**Exemplo:**
```typescript
const topUpFn = httpsCallable(functions, 'topUpWallet');
const result = await topUpFn({
  amount: 5000,
  paymentMethod: 'pagali',
  paymentReference: 'PAG-123456'
});
// { newBalance: 5000, newBonusBalance: 100, bonusAwarded: 100, transactionId: 'tx_...' }
```

---

### 4. payWithWallet

**Tipo:** `onCall` (HTTP Callable)
**Autenticação:** Obrigatória
**Descrição:** Processa pagamento de um pedido usando saldo da carteira.

**Request:**
```typescript
{
  orderId: string;          // ID do pedido
  useBonusBalance?: boolean; // Default: true
}
```

**Response:**
```typescript
{
  success: true;
  transactionId: string;
  balanceUsed: number;
  bonusBalanceUsed: number;
  remainingBalance: number;
  remainingBonusBalance: number;
}
```

**Validações:**
- ✅ Utilizador é dono do pedido
- ✅ Pedido existe e está pendente
- ✅ Saldo suficiente (principal + bónus)
- ✅ Pedido não está expirado

**Lógica de Dedução:**
```typescript
// 1. Usa saldo bónus primeiro (se useBonusBalance=true)
if (useBonusBalance && bonusBalance > 0) {
  const bonusToUse = Math.min(bonusBalance, amountDue);
  bonusBalance -= bonusToUse;
  amountDue -= bonusToUse;
}

// 2. Usa saldo principal para o restante
if (amountDue > 0) {
  balance -= amountDue;
}
```

**Após Pagamento:**
- ✅ Atualiza status do pedido para 'paid'
- ✅ Define `paymentMethod: 'wallet'`
- ✅ Cria registo de transação
- ✅ Trigger `onOrderWalletPayment` gera bilhetes automaticamente

**Exemplo:**
```typescript
const payWithWalletFn = httpsCallable(functions, 'payWithWallet');
const result = await payWithWalletFn({
  orderId: 'order_123',
  useBonusBalance: true
});
```

---

### 5. refundToWallet

**Tipo:** `onCall` (HTTP Callable)
**Autenticação:** Obrigatória (Admin)
**Descrição:** Processa reembolso para a carteira do utilizador.

**Request:**
```typescript
{
  userId: string;      // ID do utilizador a reembolsar
  amount: number;      // Montante do reembolso
  orderId: string;     // ID do pedido original
  reason?: string;     // Motivo do reembolso
}
```

**Response:**
```typescript
{
  newBalance: number;
  transactionId: string;
}
```

**Validações:**
- ✅ Utilizador admin autenticado
- ✅ Montante > 0
- ✅ Pedido existe

**Exemplo:**
```typescript
const refundFn = httpsCallable(functions, 'refundToWallet');
const result = await refundFn({
  userId: 'user_123',
  amount: 1500,
  orderId: 'order_456',
  reason: 'Evento cancelado'
});
```

---

### 6. onOrderWalletPayment

**Tipo:** `onDocumentUpdated` (Firestore Trigger)
**Path:** `orders/{orderId}`
**Descrição:** Trigger automático quando um pedido é pago via wallet.

**Condições de Ativação:**
```typescript
const before = event.data?.before.data();
const after = event.data?.after.data();

// Trigger ativa quando:
// - Status mudou de 'pending' para 'paid'
// - Método de pagamento é 'wallet'
const wasNotPaid = before?.status !== 'paid';
const isNowPaid = after?.status === 'paid';
const isPaidWithWallet = after?.paymentMethod === 'wallet';

if (wasNotPaid && isNowPaid && isPaidWithWallet) {
  // Processar...
}
```

**Ações Executadas:**

1. **Gerar Bilhetes**
```typescript
for (const item of order.items) {
  for (let i = 0; i < item.quantity; i++) {
    await db.collection('tickets').add({
      eventId: order.eventId,
      orderId: order.id,
      userId: order.userId,
      ticketTypeId: item.ticketTypeId,
      ticketTypeName: item.ticketTypeName,
      price: item.price,
      currency: item.currency,
      status: 'valid',
      qrCode: generateQRCode(),
      createdAt: FieldValue.serverTimestamp(),
    });
  }
}
```

2. **Atualizar Evento**
```typescript
await eventRef.update({
  ticketsSold: FieldValue.increment(totalTickets),
  revenue: FieldValue.increment(order.total),
});
```

3. **Atribuir Pontos de Fidelidade**
```typescript
const points = Math.floor(order.total / 100);
await userRef.update({
  'loyalty.points': FieldValue.increment(points),
  'loyalty.totalSpent': FieldValue.increment(order.total),
});
```

4. **Enviar Email de Confirmação**
```typescript
await sendOrderConfirmationEmail({
  to: order.buyerEmail,
  buyerName: order.buyerName,
  eventName: event.name,
  tickets: order.items,
  total: order.total,
  orderId: order.id,
});
```

**Logging:**
```typescript
await db.collection('order-logs').add({
  orderId,
  action: 'wallet_payment_processed',
  ticketsGenerated: totalTickets,
  pointsAwarded: points,
  emailSent: true,
  timestamp: FieldValue.serverTimestamp(),
});
```

---

## 💾 Base de Dados

### Estrutura do Documento `users/{userId}`

```typescript
{
  uid: string;
  email: string;
  displayName: string;

  // Carteira Digital
  wallet: {
    balance: number;           // Saldo principal (CVE)
    bonusBalance: number;      // Saldo bónus (CVE)
    totalSpent: number;        // Total gasto historicamente
    totalTopUp: number;        // Total carregado historicamente
    lastTopUpAt: Timestamp;    // Último carregamento
    lastTransactionAt: Timestamp; // Última transação
  };

  // Fidelidade
  loyalty: {
    points: number;            // Pontos acumulados
    totalSpent: number;        // Total gasto (para pontos)
    tier: 'bronze' | 'silver' | 'gold'; // Tier de fidelidade
  };

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Estrutura de `wallet-transactions/{transactionId}`

```typescript
{
  id: string;
  userId: string;              // Referência ao utilizador
  type: 'topup' | 'payment' | 'refund' | 'bonus';

  // Montantes
  amount: number;              // Montante principal
  bonusAmount?: number;        // Montante de bónus (se aplicável)

  // Saldos após transação
  balanceAfter: number;
  bonusBalanceAfter: number;

  // Metadados
  description: string;         // Descrição legível
  relatedOrderId?: string;     // Se relacionado a um pedido
  relatedEventId?: string;     // Se relacionado a um evento
  paymentMethod?: string;      // Método usado (para top-ups)
  paymentReference?: string;   // Referência externa

  // Timestamps
  createdAt: Timestamp;
}
```

**Exemplo de Transação de Top-Up:**
```json
{
  "id": "tx_abc123",
  "userId": "user_xyz",
  "type": "topup",
  "amount": 5000,
  "bonusAmount": 100,
  "balanceAfter": 5000,
  "bonusBalanceAfter": 100,
  "description": "Carregamento de Carteira - 5.000$00",
  "paymentMethod": "pagali",
  "paymentReference": "PAG-789456",
  "createdAt": "2025-12-28T10:30:00Z"
}
```

**Exemplo de Transação de Pagamento:**
```json
{
  "id": "tx_def456",
  "userId": "user_xyz",
  "type": "payment",
  "amount": 1500,
  "bonusAmount": 100,
  "balanceAfter": 3500,
  "bonusBalanceAfter": 0,
  "description": "Pagamento - Festa de Ano Novo 2026",
  "relatedOrderId": "order_123",
  "relatedEventId": "event_456",
  "createdAt": "2025-12-28T11:00:00Z"
}
```

### Índices Necessários

```javascript
// Firestore Indexes
// Collection: wallet-transactions
{
  fields: [
    { fieldPath: "userId", order: "ASCENDING" },
    { fieldPath: "createdAt", order: "DESCENDING" }
  ]
}
```

**Criar índice via Firebase Console:**
1. Aceder: https://console.firebase.google.com/project/eventscv-platform/firestore/indexes
2. Criar índice composto: `userId (ASC) + createdAt (DESC)`

---

## 💳 Fluxos de Pagamento

### Fluxo 1: Carregamento de Saldo (Top-Up)

```
1. Utilizador acede a /wallet/topup
   ↓
2. Seleciona montante (quick amount ou custom)
   ↓
3. Clica em "Carregar X$00"
   ↓
4. Cloud Function: createOrder
   - Cria pedido especial: eventId='wallet-topup'
   - ticketTypeId='topup'
   ↓
5. Cloud Function: initiatePagaliPayment
   - Gera URL de pagamento Pagali
   - returnUrl: /wallet/topup/return
   ↓
6. Redirect para Pagali
   ↓
7. Utilizador completa pagamento
   ↓
8. Pagali Webhook → pagaliWebhook function
   ↓
9. Webhook identifica pedido de top-up
   ↓
10. Cloud Function: topUpWallet
    - Adiciona saldo principal
    - Calcula e adiciona bónus (se aplicável)
    - Cria transação no histórico
    ↓
11. Atualiza pedido: status='paid'
    ↓
12. Envio de email de confirmação
    ↓
13. Redirect para /wallet/topup/return
    ↓
14. Display de sucesso + novo saldo
```

### Fluxo 2: Pagamento com Carteira

```
1. Utilizador no checkout (/checkout?eventId=X)
   ↓
2. Seleciona bilhetes e preenche dados
   ↓
3. Cloud Function: createOrder
   - Status: 'pending'
   - Reserva temporária de bilhetes (30 min)
   ↓
4. Display de métodos de pagamento
   - Mostra saldo disponível
   - Opção "Carteira Digital" se saldo suficiente
   ↓
5. Utilizador seleciona "Carteira Digital"
   ↓
6. Clica em "Confirmar Pagamento"
   ↓
7. Cloud Function: payWithWallet
   - Valida pedido e saldo
   - Deduz do saldo (bónus primeiro, depois principal)
   - Atualiza pedido: status='paid', paymentMethod='wallet'
   - Cria transação
   ↓
8. Firestore Trigger: onOrderWalletPayment
   - Gera bilhetes (tickets collection)
   - Atualiza evento (ticketsSold, revenue)
   - Atribui pontos de fidelidade
   - Envia email de confirmação
   ↓
9. Frontend: redirect para /tickets
   ↓
10. Display de bilhetes com QR codes
```

### Fluxo 3: Reembolso

```
1. Admin identifica pedido para reembolso
   ↓
2. Acede a admin panel
   ↓
3. Cloud Function: refundToWallet
   - Valida permissões (admin only)
   - Adiciona montante ao saldo principal
   - Cria transação tipo 'refund'
   ↓
4. Atualiza pedido: status='refunded'
   ↓
5. Invalida bilhetes: status='refunded'
   ↓
6. Envio de email de notificação
   ↓
7. Utilizador vê saldo atualizado
```

---

## 🎨 Interface do Utilizador

### Página de Top-Up (`/wallet/topup`)

**Componentes Principais:**

1. **Display de Saldo Atual**
```tsx
<div className="bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20">
  <h3>Saldo Atual</h3>
  <p>{walletBalance.toLocaleString('pt-CV')}$00</p>
  {bonusBalance > 0 && (
    <p>+{bonusBalance.toLocaleString('pt-CV')}$00 em bónus</p>
  )}
</div>
```

2. **Quick Amounts**
```tsx
const quickAmounts = [
  { value: 500, label: '500$00', bonus: 0 },
  { value: 1000, label: '1.000$00', bonus: 20 },
  { value: 2000, label: '2.000$00', bonus: 40 },
  { value: 5000, label: '5.000$00', bonus: 100 },
  { value: 10000, label: '10.000$00', bonus: 200 },
];
```

3. **Custom Amount Input**
```tsx
<input
  type="number"
  min="100"
  max="50000"
  step="100"
  placeholder="Mínimo 100$00"
/>
```

4. **Bonus Preview**
```tsx
{bonus > 0 && (
  <div className="p-3 bg-amber-500/10">
    <p>Bónus deste carregamento:</p>
    <p className="text-lg font-bold">+{bonus}$00</p>
  </div>
)}
```

5. **Payment Button**
```tsx
<button
  onClick={handleTopUp}
  disabled={isProcessing || amount === 0}
  className="btn-primary"
>
  Carregar {amount.toLocaleString('pt-CV')}$00
</button>
```

### Checkout com Opção Wallet (`/checkout`)

**Componentes:**

1. **Balance Display**
```tsx
<div className="flex items-center gap-3">
  <Wallet className="w-5 h-5 text-brand-primary" />
  <div>
    <p className="text-sm text-zinc-400">Saldo disponível</p>
    <p className="font-semibold text-white">
      {walletBalance.toLocaleString('pt-CV')}$00
    </p>
  </div>
</div>
```

2. **Payment Method Selection**
```tsx
<button
  onClick={() => setSelectedPayment('wallet')}
  disabled={walletBalance < total}
  className={selectedPayment === 'wallet' ? 'selected' : ''}
>
  <Wallet />
  <span>Carteira Digital</span>
  {walletBalance < total && (
    <span className="text-red-400">Saldo insuficiente</span>
  )}
</button>
```

3. **Instant Checkout**
```tsx
if (selectedPayment === 'wallet') {
  const payWithWalletFn = httpsCallable(functions, 'payWithWallet');
  await payWithWalletFn({ orderId, useBonusBalance: true });

  // Pagamento instantâneo - sem redirect!
  router.push('/tickets');
}
```

### Profile Page - Wallet Section (`/profile`)

```tsx
<div className="bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10">
  <h3>Carteira Digital</h3>

  {/* Saldo Total */}
  <div>
    <p>Saldo Total</p>
    <h2>{(balance + bonusBalance).toLocaleString('pt-CV')}$00</h2>
  </div>

  {/* Breakdown */}
  <div className="grid grid-cols-2 gap-4">
    <div>
      <p>Saldo Principal</p>
      <p>{balance.toLocaleString('pt-CV')}$00</p>
    </div>
    <div>
      <p>Saldo Bónus</p>
      <p>{bonusBalance.toLocaleString('pt-CV')}$00</p>
    </div>
  </div>

  {/* Actions */}
  <Link href="/wallet/topup" className="btn-primary">
    Carregar Saldo
  </Link>
  <Link href="/wallet/transactions" className="btn-secondary">
    Ver Histórico
  </Link>
</div>
```

---

## 🔒 Segurança

### Autenticação e Autorização

1. **Todas as operações requerem autenticação**
```typescript
if (!request.auth) {
  throw new HttpsError('unauthenticated', 'Utilizador não autenticado');
}
```

2. **Validação de propriedade**
```typescript
const order = await db.collection('orders').doc(orderId).get();
if (order.data()?.userId !== userId) {
  throw new HttpsError('permission-denied', 'Pedido não pertence ao utilizador');
}
```

3. **Admin-only operations**
```typescript
// refundToWallet
const adminUser = await db.collection('admins').doc(request.auth.uid).get();
if (!adminUser.exists) {
  throw new HttpsError('permission-denied', 'Operação restrita a administradores');
}
```

### Validações de Negócio

1. **Limites de montante**
```typescript
if (amount < 100 || amount > 50000) {
  throw new HttpsError('invalid-argument', 'Montante fora dos limites (100-50000 CVE)');
}
```

2. **Verificação de saldo**
```typescript
const totalAvailable = balance + (useBonusBalance ? bonusBalance : 0);
if (totalAvailable < orderTotal) {
  throw new HttpsError('failed-precondition', 'Saldo insuficiente');
}
```

3. **Prevenção de duplo pagamento**
```typescript
if (order.status === 'paid') {
  throw new HttpsError('already-exists', 'Pedido já foi pago');
}
```

4. **Verificação de expiração**
```typescript
const now = Date.now();
const expiresAt = order.expiresAt?.toMillis();
if (expiresAt && now > expiresAt) {
  throw new HttpsError('deadline-exceeded', 'Pedido expirado');
}
```

### Transações Atómicas

**Todas as operações de saldo usam Firestore transactions** para garantir consistência:

```typescript
await db.runTransaction(async (transaction) => {
  // 1. Ler estado atual
  const userDoc = await transaction.get(userRef);
  const currentBalance = userDoc.data()?.wallet?.balance || 0;

  // 2. Validar
  if (currentBalance < amount) {
    throw new Error('Saldo insuficiente');
  }

  // 3. Atualizar atomicamente
  transaction.update(userRef, {
    'wallet.balance': currentBalance - amount,
    'wallet.lastTransactionAt': FieldValue.serverTimestamp(),
  });

  transaction.set(transactionRef, {
    userId,
    type: 'payment',
    amount,
    balanceAfter: currentBalance - amount,
    createdAt: FieldValue.serverTimestamp(),
  });
});
```

### Logging e Auditoria

**Todas as operações são logadas:**

```typescript
await db.collection('wallet-logs').add({
  userId,
  action: 'payment',
  amount,
  orderId,
  balanceBefore,
  balanceAfter,
  success: true,
  timestamp: FieldValue.serverTimestamp(),
  ip: request.rawRequest?.ip,
  userAgent: request.rawRequest?.headers['user-agent'],
});
```

### Rate Limiting

Cloud Functions v2 tem rate limiting automático:
- **Máximo:** 1000 invocações/segundo por função
- **Timeout:** 60 segundos (configurável)
- **Memória:** 256MB (configurável)

Para proteção adicional, pode implementar:

```typescript
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  points: 10, // Número de requests
  duration: 60, // Por 60 segundos
});

export const payWithWallet = onCall(async (request) => {
  const userId = request.auth?.uid;

  try {
    await rateLimiter.consume(userId);
  } catch (error) {
    throw new HttpsError('resource-exhausted', 'Muitas tentativas. Aguarde 1 minuto.');
  }

  // ... resto da lógica
});
```

---

## 🧪 Testes

### Testes Manuais

#### 1. Testar Top-Up

**Setup:**
1. Login como utilizador
2. Verificar saldo inicial: `/profile`

**Passos:**
1. Aceder: https://eventscv-web.web.app/wallet/topup
2. Selecionar "1.000$00" (deve mostrar +20$00 bónus)
3. Clicar em "Carregar 1.000$00"
4. Completar pagamento Pagali (usar cartão teste)
5. Aguardar webhook

**Verificações:**
- ✅ Saldo principal aumentou 1.000$00
- ✅ Saldo bónus aumentou 20$00
- ✅ Email de confirmação recebido
- ✅ Transação aparece em `/wallet/transactions`

#### 2. Testar Pagamento com Wallet

**Setup:**
1. Ter saldo suficiente na carteira (fazer top-up se necessário)
2. Encontrar evento com bilhetes disponíveis

**Passos:**
1. Aceder a evento: `/events/{eventId}`
2. Clicar em "Comprar Bilhetes"
3. Selecionar quantidade
4. No checkout, escolher "Carteira Digital"
5. Confirmar pagamento

**Verificações:**
- ✅ Pagamento instantâneo (sem redirect)
- ✅ Saldo deduzido corretamente
- ✅ Bónus usado primeiro (se disponível)
- ✅ Bilhetes gerados com QR codes
- ✅ Email de confirmação recebido
- ✅ Pontos de fidelidade atribuídos
- ✅ Redirect para `/tickets`

#### 3. Testar Saldo Insuficiente

**Setup:**
1. Ter saldo < preço do bilhete

**Passos:**
1. Tentar comprar bilhete
2. No checkout, opção "Carteira Digital" deve estar desabilitada
3. Mensagem: "Saldo insuficiente"

**Verificações:**
- ✅ Opção wallet desabilitada
- ✅ Mensagem clara de erro
- ✅ Outras opções de pagamento disponíveis

#### 4. Testar Histórico de Transações

**Passos:**
1. Fazer top-up
2. Fazer pagamento
3. Aceder: `/wallet/transactions` (ou `/profile`)

**Verificações:**
- ✅ Todas as transações listadas
- ✅ Ordem cronológica (mais recente primeiro)
- ✅ Tipo correto (topup, payment, bonus)
- ✅ Montantes corretos
- ✅ Saldo após cada transação

### Testes com Firestore Emulator

```bash
# Instalar emulators
firebase init emulators

# Selecionar: Firestore, Functions

# Iniciar emulators
firebase emulators:start

# Em outro terminal, rodar testes
cd functions
npm test
```

**Exemplo de teste unitário:**

```typescript
// functions/src/wallet/__tests__/walletOperations.test.ts
import { test } from '@firebase/rules-unit-testing';

describe('Wallet Operations', () => {
  test('should calculate bonus correctly', () => {
    expect(calculateBonus(500)).toBe(0);
    expect(calculateBonus(1000)).toBe(20);
    expect(calculateBonus(5000)).toBe(100);
  });

  test('should deduct bonus balance first', async () => {
    // Setup
    const userId = 'test_user';
    const orderId = 'test_order';

    // Criar utilizador com saldo
    await db.collection('users').doc(userId).set({
      wallet: { balance: 1000, bonusBalance: 100 }
    });

    // Criar pedido de 150 CVE
    await db.collection('orders').doc(orderId).set({
      userId,
      total: 150,
      status: 'pending'
    });

    // Executar pagamento
    const result = await payWithWallet({ orderId, useBonusBalance: true });

    // Verificar
    expect(result.bonusBalanceUsed).toBe(100);
    expect(result.balanceUsed).toBe(50);
    expect(result.remainingBonusBalance).toBe(0);
    expect(result.remainingBalance).toBe(950);
  });
});
```

---

## 🔧 Troubleshooting

### Problema: Saldo não atualiza após top-up

**Possíveis Causas:**
1. Webhook Pagali não chegou
2. Pedido não foi identificado como 'wallet-topup'
3. Erro na função `topUpWallet`

**Debug:**
```bash
# Ver logs do webhook
firebase functions:log --only pagaliWebhook

# Ver logs de top-up
firebase functions:log --only topUpWallet

# Verificar pedido no Firestore
# orders/{orderId}
# - eventId deve ser 'wallet-topup'
# - status deve mudar para 'paid'
```

**Solução:**
1. Verificar logs de erro
2. Confirmar que webhook URL está correto em Pagali
3. Reprocessar manualmente se necessário

---

### Problema: Pagamento wallet falha com "Saldo insuficiente"

**Possíveis Causas:**
1. Saldo real é menor que o mostrado no UI
2. Outra transação em paralelo consumiu saldo
3. Bónus não está sendo contado

**Debug:**
```typescript
// No frontend, antes do pagamento:
const getBalanceFn = httpsCallable(functions, 'getWalletBalance');
const balance = await getBalanceFn();
console.log('Balance:', balance.data);
console.log('Order total:', orderTotal);
console.log('Sufficient:', balance.data.totalBalance >= orderTotal);
```

**Solução:**
1. Refresh do saldo antes de tentar pagamento
2. Verificar se `useBonusBalance` está `true`
3. Adicionar mais saldo

---

### Problema: Bilhetes não são gerados após pagamento wallet

**Possíveis Causas:**
1. Trigger `onOrderWalletPayment` não executou
2. Erro na geração de QR codes
3. Evento ou pedido inválido

**Debug:**
```bash
# Ver logs do trigger
firebase functions:log --only onOrderWalletPayment

# Verificar pedido no Firestore
# orders/{orderId}
# - status: 'paid'
# - paymentMethod: 'wallet'
# - Deve ter campo 'items' com bilhetes

# Verificar se bilhetes foram criados
# tickets collection
# - Filtrar por orderId
```

**Solução:**
1. Verificar logs de erro
2. Confirmar que pedido tem `paymentMethod: 'wallet'`
3. Reprocessar manualmente:
```typescript
// Admin console
const orderId = 'ORDER_ID';
await processWalletPaymentSuccess(orderId, orderData);
```

---

### Problema: Bónus não aplicado em top-up

**Possíveis Causas:**
1. Montante < 1000 CVE
2. Cálculo de bónus com bug
3. Atualização do campo bonusBalance falhou

**Debug:**
```typescript
// Verificar cálculo
const amount = 5000;
const bonus = amount >= 1000 ? Math.floor(amount * 0.02) : 0;
console.log('Bonus for', amount, ':', bonus); // Deve ser 100

// Verificar no Firestore
// users/{userId}/wallet/bonusBalance
```

**Solução:**
1. Confirmar montante ≥ 1000 CVE
2. Verificar logs da função `topUpWallet`
3. Atualizar manualmente se necessário

---

### Problema: Email de confirmação não enviado

**Verificar:**
1. Configuração SMTP está correta
2. Função `sendOrderConfirmationEmail` executou
3. Email não está em spam

**Debug:**
```bash
# Ver logs de email
firebase functions:log --only pagaliWebhook --limit 50

# Verificar email-logs no Firestore
# Filtrar por orderId ou buyerEmail
```

**Solução:**
Ver documentação completa em: [EMAIL_NOTIFICATIONS.md](EMAIL_NOTIFICATIONS.md)

---

## 📈 Métricas e Analytics

### KPIs Importantes

**Para Business:**
- Taxa de uso de wallet vs Pagali
- Montante médio de top-up
- Frequência de carregamentos
- Saldo médio dos utilizadores
- Taxa de conversão com wallet (vs Pagali)

**Para Produto:**
- Tempo médio de checkout (wallet vs Pagali)
- Taxa de falha de pagamentos
- Utilização de saldo bónus
- Reembolsos processados

### Queries Úteis

```typescript
// Total em wallets
const snapshot = await db.collection('users').get();
let totalBalance = 0;
let totalBonus = 0;
snapshot.forEach(doc => {
  const wallet = doc.data()?.wallet;
  totalBalance += wallet?.balance || 0;
  totalBonus += wallet?.bonusBalance || 0;
});
console.log('Total em wallets:', totalBalance + totalBonus, 'CVE');

// Top-ups por mês
const startOfMonth = new Date();
startOfMonth.setDate(1);
startOfMonth.setHours(0, 0, 0, 0);

const topups = await db.collection('wallet-transactions')
  .where('type', '==', 'topup')
  .where('createdAt', '>=', startOfMonth)
  .get();

let totalTopups = 0;
topups.forEach(doc => {
  totalTopups += doc.data().amount;
});
console.log('Top-ups este mês:', totalTopups, 'CVE');

// Pagamentos via wallet
const walletPayments = await db.collection('orders')
  .where('paymentMethod', '==', 'wallet')
  .where('status', '==', 'paid')
  .get();

console.log('Pedidos pagos via wallet:', walletPayments.size);
```

---

## 🚀 Próximos Passos

### Melhorias Futuras

1. **Wallet Sharing**
   - Permitir transferências entre utilizadores
   - Gift cards e vouchers

2. **Auto Top-Up**
   - Carregamento automático quando saldo < X
   - Configuração de montante e método

3. **Withdrawal**
   - Permitir levantamento de saldo
   - Transferência bancária ou móvel

4. **Tier System**
   - Bónus maiores para utilizadores VIP
   - Bronze: 2%, Silver: 3%, Gold: 5%

5. **Scheduled Payments**
   - Subscrições mensais
   - Pagamentos recorrentes

6. **Wallet Analytics Dashboard**
   - Para utilizadores verem padrões de gasto
   - Relatórios mensais automáticos

---

## 📚 Recursos Adicionais

### Documentação Relacionada
- [PAGALI_INTEGRATION.md](PAGALI_INTEGRATION.md) - Integração de pagamentos
- [EMAIL_NOTIFICATIONS.md](EMAIL_NOTIFICATIONS.md) - Sistema de emails
- [PROGRESS_SUMMARY.md](PROGRESS_SUMMARY.md) - Estado geral do projeto

### Links Úteis
- Firebase Functions: https://firebase.google.com/docs/functions
- Firestore Transactions: https://firebase.google.com/docs/firestore/manage-data/transactions
- Firebase Security Rules: https://firebase.google.com/docs/firestore/security/get-started

---

**Última Atualização:** 28 de Dezembro de 2025
**Versão:** 1.0.0
**Autor:** EventsCV Development Team

---

*Made with ❤️ for EventsCV*
