# Sistema de Notificações por Email - EventsCV

## Resumo

Sistema completo de notificações por email implementado usando **cPanel SMTP com Nodemailer**. Os utilizadores recebem emails automáticos após compras de bilhetes e falhas de pagamento usando o email `noreply@events.cv`.

## ✅ O que foi Implementado

### 1. **Serviço de Email** (`/functions/src/notifications/email.ts`)

Duas funções principais:

#### `sendPurchaseConfirmation()`
- Email de confirmação de compra com design profissional
- Inclui todos os detalhes do evento e bilhetes
- QR code para acesso directo aos bilhetes
- Link para ver bilhetes na plataforma

#### `sendPaymentFailure()`
- Notificação de falha no pagamento
- Explicação dos possíveis motivos
- Botão para tentar novamente
- Informações de suporte

### 2. **Templates de Email**

Emails com design responsivo e profissional:

✅ **Características:**
- HTML responsivo (funciona em mobile e desktop)
- Gradientes modernos (roxo/lilás)
- Fallback de texto simples
- Brand consistency (cores EventsCV)
- CTAs claros e visíveis
- Informações de suporte

✅ **Elementos Incluídos:**
- Cabeçalho com gradiente
- Informações do evento (data, local)
- Lista de bilhetes com preços
- Total pago destacado
- ID do pedido para referência
- Instruções de uso
- Links de ação
- Footer com contactos

### 3. **Integração com Pagali**

Os emails são enviados automaticamente:

✅ **Pagamento Bem-Sucedido:**
1. Webhook recebe confirmação do Pagali
2. Bilhetes são gerados
3. Email de confirmação é enviado
4. Log é criado em `email-logs`

✅ **Pagamento Falhado:**
1. Webhook recebe falha do Pagali
2. Email de notificação é enviado
3. Log é criado em `email-logs`

### 4. **Logging e Monitorização**

Todos os emails são registados em Firestore:

```typescript
Collection: email-logs
Document: {
  type: 'purchase_confirmation' | 'payment_failure'
  to: string
  orderId: string
  status: 'sent' | 'failed'
  error?: string
  sentAt: Timestamp
}
```

## 📧 Configuração do cPanel Email

### Passo 1: Criar Email no cPanel

1. Login no cPanel: `https://events.cv:2083`
2. **Email Accounts** → **Create**
3. Preencher:
   - Email: `noreply`
   - Domain: `events.cv`
   - Password: (escolher password forte)
4. Click **Create**

### Passo 2: Obter Configurações SMTP

No cPanel → **Email Accounts** → **Connect Devices**:
- **Servidor SMTP:** `mail.events.cv`
- **Porta:** 465 (SSL) ou 587 (TLS)
- **Username:** `noreply@events.cv`
- **Password:** (a que criaste)

### Passo 3: Configurar Environment Variables

#### Desenvolvimento Local

Criar `/functions/.env`:
```bash
# cPanel SMTP Configuration
SMTP_HOST=mail.events.cv
SMTP_PORT=465
SMTP_USER=noreply@events.cv
SMTP_PASS=SUA_PASSWORD_AQUI
FROM_EMAIL=noreply@events.cv
FROM_NAME=EventsCV
```

**IMPORTANTE:** Substituir `SUA_PASSWORD_AQUI` pela password real do email.

#### Produção (Firebase)

O Firebase Functions carrega automaticamente o ficheiro `.env`. Alternativamente:

```bash
firebase functions:config:set \
  smtp.host="mail.events.cv" \
  smtp.port="465" \
  smtp.user="noreply@events.cv" \
  smtp.pass="SUA_PASSWORD"
```

### Passo 4: Deploy

```bash
cd /Users/lindapeixoto/My\ Apps/eventscv
firebase deploy --only functions:pagaliWebhook
```

## 🧪 Como Testar

### Teste 1: Pagamento Bem-Sucedido

1. Ir para https://eventscv-web.web.app
2. Selecionar evento e bilhetes
3. Fazer checkout com Pagali
4. Completar pagamento (cartão de teste)
5. **Verificar email** → Deve receber confirmação

### Teste 2: Pagamento Falhado

1. Fazer checkout com Pagali
2. Cancelar pagamento (botão return)
3. **Verificar email** → Deve receber notificação de falha

### Teste 3: Logs no Firestore

```javascript
// No Firebase Console → Firestore Database
db.collection('email-logs')
  .orderBy('sentAt', 'desc')
  .limit(10)
  .get()

// Verificar:
// - type: 'purchase_confirmation' ou 'payment_failure'
// - status: 'sent'
// - to: email do comprador
```

## 📊 Exemplo de Emails

### Email de Confirmação

```
Assunto: ✓ Bilhetes confirmados - Festival de Verão 2025

[Gradiente roxo/lilás]
✓ Pagamento Confirmado!
Os teus bilhetes estão prontos

Olá João Silva,

O teu pagamento foi processado com sucesso! Os bilhetes para
Festival de Verão 2025 estão disponíveis na tua conta.

┌─────────────────────────────┐
│ Festival de Verão 2025      │
│ 📅 15 de Janeiro de 2025    │
│ 📍 Praia, Santiago          │
└─────────────────────────────┘

Bilhetes:
┌──────────────────┬──────────┐
│ VIP              │ 5.000$00 │
│ Geral (x2)       │ 4.000$00 │
├──────────────────┼──────────┤
│ Total Pago       │ 9.000$00 │
└──────────────────┴──────────┘

[Ver Meus Bilhetes] (botão)

ℹ️ Como usar os bilhetes
1. Acede a "Meus Bilhetes" na tua conta
2. Apresenta o código QR na entrada
3. Guarda este email para referência
```

### Email de Falha

```
Assunto: ⚠️ Pagamento não processado - Festival de Verão 2025

[Gradiente rosa/vermelho]
⚠️ Pagamento Não Processado

Olá João Silva,

Infelizmente, não conseguimos processar o teu pagamento para
Festival de Verão 2025.

Isto pode acontecer por:
• Saldo insuficiente no cartão
• Dados do cartão incorretos
• Limite de transações atingido
• Cancelamento durante o processo

[Tentar Novamente] (botão)

💡 Precisa de ajuda?
Se continuas a ter problemas, contacta o teu banco ou
a nossa equipa de suporte.
```

## 🔧 Personalização

### Alterar Design dos Emails

Editar `/functions/src/notifications/email.ts`:

```typescript
// Cores do gradiente
style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"

// Logo (adicionar)
<img src="https://eventscv.com/logo.png" alt="EventsCV" />

// Cores dos botões
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Adicionar Novos Tipos de Email

```typescript
// Em /functions/src/notifications/email.ts

export async function sendTicketReminder(/* params */) {
  const html = `...`; // Template HTML

  await sgMail.send({
    to: email,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: '🎫 Lembrete: Evento amanhã!',
    html,
  });
}
```

## 📈 Limites e Custos

### cPanel Email (Atual)
- ✅ **Grátis** (incluído no hosting)
- ✅ Domínio próprio (events.cv)
- ✅ ~500-1000 emails/hora (típico)
- ✅ ~3000-5000 emails/dia (típico)
- ✅ Sem custos adicionais

**Nota:** Limites variam por hosting provider. Verificar com o teu provider se necessário.

### Cálculo de Uso
```
Eventos/dia: 10
Bilhetes/evento: 20
Emails/dia = 10 × 20 = 200 emails

✅ Bem dentro dos limites do cPanel
```

## 🚨 Troubleshooting

### Email não enviado

**Verificar:**
1. Password correta no `.env`
2. Email `noreply@events.cv` criado no cPanel
3. Porta 465 ou 587 aberta
4. Servidor SMTP correto (`mail.events.cv`)
5. Logs no Firestore (`email-logs`)

**Logs:**
```javascript
// Firebase Functions Logs
firebase functions:log --only pagaliWebhook

// Procurar por:
// - "Error sending purchase confirmation email"
// - "SendGrid API key not configured"
```

### Email na pasta de spam

**Soluções:**
1. Autenticar domínio (não apenas single sender)
2. Adicionar SPF, DKIM, DMARC records
3. Manter bounce rate baixo (<5%)
4. Evitar palavras spam no assunto

### Rate limiting / Limites excedidos

**Erro:** `Too many emails sent`

**Soluções:**
1. Verificar limites com hosting provider
2. Implementar queue system se necessário
3. Considerar upgrade do plano de hosting
4. Distribuir envios ao longo do dia

## 📋 Checklist de Produção

Antes de lançar em produção:

- [ ] Criar email `noreply@events.cv` no cPanel
- [ ] Password configurada no `.env`
- [ ] `.env` no `.gitignore` (nunca fazer commit)
- [ ] Configurar SPF/DKIM no DNS (recomendado)
- [ ] Testar envio de emails
- [ ] Verificar emails em diferentes clients (Gmail, Outlook, etc)
- [ ] Emails não vão para spam
- [ ] Configurar alertas para falhas
- [ ] Monitorizar logs no Firebase
- [ ] Cumprir GDPR / regulamentos locais

## 🔗 Links Úteis

- **cPanel Login:** https://events.cv:2083
- **Nodemailer Docs:** https://nodemailer.com/
- **Email Testing:** https://www.mail-tester.com/
- **Email HTML Validator:** https://validator.w3.org/
- **Firestore Console:** https://console.firebase.google.com/project/eventscv-platform/firestore
- **Setup Guide:** [SETUP_CPANEL_EMAIL.md](SETUP_CPANEL_EMAIL.md)

## 📝 Próximos Passos

### Melhorias Recomendadas

1. **Email Templates Dinâmicos**
   - Usar SendGrid Dynamic Templates
   - Fácil edição sem código

2. **Anexos PDF**
   - Gerar bilhete PDF
   - Anexar ao email de confirmação

3. **Mais Tipos de Notificação**
   - Lembrete 24h antes do evento
   - Lembrete 1h antes do evento
   - Cancelamento de evento
   - Reembolso processado

4. **Analytics**
   - Taxa de abertura
   - Taxa de clique
   - Dispositivos usados

5. **A/B Testing**
   - Testar diferentes assuntos
   - Testar diferentes CTAs
   - Optimizar conversão

6. **Personalização**
   - Nome do utilizador
   - Eventos relacionados
   - Recomendações personalizadas

---

**Última Atualização:** 2025-12-27
**Estado:** ✅ Implementado e Deployado
**Dependências:** SendGrid API Key necessária para produção
