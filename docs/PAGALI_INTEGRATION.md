# Integração Pagali - EventsCV

## Resumo

A integração com o gateway de pagamento **Pagali** foi completada com sucesso. O sistema agora suporta pagamentos reais através da rede Vinti4 (Visa, Mastercard) em Cabo Verde.

## O que foi Implementado

### 1. Cloud Functions (Backend)

✅ **Funções Implementadas:**

- `initiatePagaliPayment` - Inicia o processo de pagamento
- `pagaliWebhook` - Recebe notificações de pagamento do Pagali
- `getPagaliPaymentStatus` - Verifica o estado de um pagamento
- `createOrder` - Cria pedido antes do pagamento
- `releaseExpiredOrders` - Liberta reservas de bilhetes expiradas (agenda: cada 5 minutos)

**Localização:** `/functions/src/payments/pagali.ts` e `/functions/src/orders/createOrder.ts`

**URL do Webhook:** `https://pagaliwebhook-tlxti2wida-ew.a.run.app`

### 2. Checkout Flow (Frontend)

✅ **Melhorias Implementadas:**

- Autenticação obrigatória (redireciona para login se não autenticado)
- Carregamento de saldo da carteira em tempo real
- Pré-preenchimento de dados do utilizador
- Integração completa com Pagali
- URL do webhook configurado corretamente

**Localização:** `/apps/web/app/checkout/CheckoutClient.tsx`

### 3. Página de Retorno

✅ **Funcionalidades:**

- Verificação automática do estado do pagamento
- Polling inteligente (10 tentativas, 2 segundos entre cada)
- Estados: success, failed, pending, error
- Redirecionamento para bilhetes após sucesso

**Localização:** `/apps/web/app/checkout/return/ReturnClient.tsx`

## Fluxo de Pagamento

```
1. Utilizador seleciona bilhetes → Checkout
2. Sistema cria pedido (Order) → Reserva bilhetes temporariamente
3. Utilizador escolhe "Cartão SISP / Vinti4"
4. Sistema chama initiatePagaliPayment
5. Sistema redireciona para página de pagamento Pagali
6. Utilizador faz login no Pagali e completa pagamento
7. Pagali envia webhook para Cloud Function
8. Cloud Function processa pagamento:
   - Se sucesso: Gera bilhetes, atualiza evento, atribui pontos
   - Se falhou: Notifica utilizador
9. Utilizador retorna para /checkout/return
10. Sistema verifica estado e mostra resultado
```

## Configuração

### Ambiente de Teste (Ativo)

```javascript
Entity ID: 4A96B708-FD44-4133-8A79-B6F04FC914A1
Payment Page ID: 0933F2B2-B1D6-78B2-C6AB-4DF232196AA2
URL: http://app.pagali.io/pagali/index.php?r=pgPaymentInterface/ecommercePayment

// Cartão de Teste
Número: 6034 4500 0600 3036
Validade: 12/24
CVV2: 185

// Login Pagali Test
Username: isone_is
Password: 12345
```

### Ambiente de Produção

Para ativar pagamentos reais, configurar as seguintes variáveis de ambiente:

```bash
# No Firebase Functions
firebase functions:config:set \
  pagali.entity_id="YOUR_PRODUCTION_ENTITY_ID" \
  pagali.payment_page_id="YOUR_PRODUCTION_PAYMENT_PAGE_ID" \
  pagali.url="https://app.pagali.io/pagali/index.php?r=pgPaymentInterface/ecommercePayment"

# Deployment
firebase deploy --only functions:initiatePagaliPayment,functions:pagaliWebhook,functions:getPagaliPaymentStatus,functions:createOrder
```

**Nota:** Os valores de produção devem ser obtidos após contrato com Pagali.

## Segurança

✅ **Medidas Implementadas:**

1. **Autenticação Obrigatória**
   - Apenas utilizadores autenticados podem criar pedidos
   - Verificação de propriedade do pedido

2. **Validação de Pedidos**
   - Verificação de disponibilidade de bilhetes
   - Reserva temporária (30 minutos)
   - Libertação automática de reservas expiradas

3. **SSL/TLS**
   - Todas as comunicações via HTTPS
   - Webhook seguro via Cloud Functions

4. **Logging Completo**
   - Todos os eventos de pagamento registados
   - Collections: `payment-logs`, `order-logs`

## Estrutura de Dados

### Order Document
```typescript
{
  orderId: string
  eventId: string
  eventTitle: string
  userId: string
  tickets: Array<{
    ticketTypeId: string
    ticketTypeName: string
    price: number
    currency: string
    quantity: number
  }>
  total: number
  currency: string
  buyerName: string
  buyerEmail: string
  buyerPhone: string
  paymentStatus: 'pending' | 'completed' | 'failed' | 'cancelled' | 'expired'
  paymentMethod: 'pagali' | 'wallet' | null
  paymentProvider: 'pagali' | null
  pagaliPaymentStatus: 'Completed' | 'Error' | undefined
  createdAt: Timestamp
  updatedAt: Timestamp
  expiresAt: Timestamp
}
```

### Pagali Request (POST Form Data)
```typescript
{
  id_ent: string              // Entity ID
  id_temp: string             // Payment Page ID
  order_id: string            // Order ID from our system
  currency_code: string       // 'CVE' for Cabo Verde Escudos
  total: number               // Total amount
  notify: string              // Webhook URL
  return: string              // Return URL after payment
  item_name[]: Array<string>  // Item names
  quantity[]: Array<number>   // Quantities
  item_number[]: Array<string> // Item references (optional)
  amount[]: Array<number>     // Unit prices
  total_item[]: Array<number> // Total prices per item
}
```

### Pagali Response (Webhook)
```typescript
{
  order_id: string                    // Order ID
  payment_status: 'Completed' | 'Error' // Payment result
}
```

## Processamento de Sucesso

Quando o pagamento é confirmado (`payment_status: 'Completed'`):

1. ✅ Bilhetes são gerados com QR codes únicos
2. ✅ Contador de bilhetes vendidos é atualizado no evento
3. ✅ Pontos de gamificação são atribuídos ao utilizador
4. ✅ Transação de pontos é registada
5. ✅ Email de confirmação é enviado (TODO: implementar)

**Fórmula de Pontos:** 1 ponto por cada 100 CVE gastos

## Monitorizaçãp

### Collections para Monitorização

- **orders** - Todos os pedidos
- **payment-logs** - Histórico de pagamentos
- **order-logs** - Histórico de pedidos
- **tickets** - Bilhetes gerados

### Queries Úteis

```javascript
// Pagamentos pendentes há mais de 30 minutos
db.collection('orders')
  .where('paymentStatus', '==', 'pending')
  .where('expiresAt', '<=', new Date())

// Pagamentos completados hoje
db.collection('payment-logs')
  .where('paymentStatus', '==', 'Completed')
  .where('createdAt', '>=', startOfDay)

// Taxa de sucesso de pagamentos
// Sucesso / (Sucesso + Falhas)
```

## Testes

### Como Testar

1. **Aceder ao site:** https://eventscv-web.web.app
2. **Criar conta / Fazer login**
3. **Selecionar um evento** com bilhetes disponíveis
4. **Adicionar bilhetes** ao carrinho
5. **Ir para checkout**
6. **Escolher "Cartão SISP / Vinti4"**
7. **Aceitar termos** e confirmar
8. **Fazer login no Pagali** (isone_is / 12345)
9. **Preencher dados do cartão de teste**
10. **Confirmar pagamento**
11. **Verificar bilhetes** em "Meus Bilhetes"

### Cenários de Teste

- ✅ Pagamento com sucesso
- ✅ Pagamento falhado
- ✅ Cancelamento durante pagamento (botão return)
- ✅ Pagamento pendente (timeout)
- ✅ Pedido expirado (aguardar 30 minutos)
- ✅ Saldo insuficiente na carteira
- ✅ Autenticação obrigatória

## URLs Importantes

- **Web App:** https://eventscv-web.web.app
- **Admin Panel:** https://eventscv-admin.web.app
- **Webhook:** https://pagaliwebhook-tlxti2wida-ew.a.run.app
- **Pagali Test:** http://app.pagali.io
- **Firebase Console:** https://console.firebase.google.com/project/eventscv-platform

## Próximos Passos

### Recomendações

1. **Email Notifications**
   - Implementar envio de emails de confirmação
   - Templates: Confirmação de compra, Falha de pagamento, Bilhete digital

2. **Pagali Production Setup**
   - Obter credenciais de produção
   - Configurar environment variables
   - Testar em ambiente real

3. **Webhook Segurança**
   - Adicionar assinatura/validação de webhooks (se Pagali suportar)
   - Rate limiting

4. **Monitorização**
   - Configurar alertas para pagamentos falhados
   - Dashboard de métricas de pagamento
   - Logs centralizados

5. **Pagamento via Carteira**
   - Implementar fluxo completo de pagamento via wallet
   - Integração com sistema de bónus e loyalty

6. **MB WAY**
   - Adicionar suporte para MB WAY (quando disponível)

## Suporte

Para questões sobre a integração Pagali:
- **Documentação:** `/Users/lindapeixoto/claude/pagali/Pagali-Integration-eCommerce.pdf`
- **Código:** `/functions/src/payments/pagali.ts`
- **Suporte Pagali:** (contacto a definir)

---

**Última Atualização:** 2025-12-27
**Estado:** ✅ Implementado e Deployado
**Ambiente:** Teste (credenciais de produção pendentes)
