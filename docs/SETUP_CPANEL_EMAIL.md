# Setup Email cPanel - EventsCV

## 🚀 Configuração Rápida (2 minutos)

### 1. Criar Email no cPanel

1. **Login no cPanel:** https://events.cv:2083 (ou o teu URL do cPanel)
2. **Email Accounts** → **Create**
3. Preencher:
   - **Email:** `noreply`
   - **Domain:** `events.cv`
   - **Password:** (escolher password forte)
   - **Storage:** Unlimited ou 250MB
4. Click **Create**

### 2. Obter Configurações SMTP

No cPanel, ir a **Email Accounts** → **Connect Devices**:

```
Servidor SMTP: mail.events.cv
Porta: 465 (SSL) ou 587 (TLS)
Username: noreply@events.cv
Password: (password que criaste)
```

### 3. Configurar EventsCV

Editar `/functions/.env`:

```bash
# EMAIL NOTIFICATIONS - cPanel SMTP
SMTP_HOST=mail.events.cv
SMTP_PORT=465
SMTP_USER=noreply@events.cv
SMTP_PASS=SUA_PASSWORD_AQUI
FROM_EMAIL=noreply@events.cv
FROM_NAME=EventsCV
```

**IMPORTANTE:**
- Substituir `SUA_PASSWORD_AQUI` pela password real
- **NUNCA** fazer commit do ficheiro `.env` (já está no .gitignore)

### 4. Deploy

```bash
cd /Users/lindapeixoto/My\ Apps/eventscv
firebase deploy --only functions:pagaliWebhook
```

## ✅ Testar

1. Fazer compra de teste em https://eventscv-web.web.app
2. Verificar email (inbox de quem comprou)
3. Ver logs: `firebase functions:log --only pagaliWebhook`

## 🔧 Configurações Alternativas

### Porta 587 (TLS/STARTTLS)

Se a porta 465 não funcionar, tentar 587:

```bash
SMTP_HOST=mail.events.cv
SMTP_PORT=587
SMTP_USER=noreply@events.cv
SMTP_PASS=SUA_PASSWORD_AQUI
```

No código (já configurado automaticamente):
- Porta 465 → `secure: true` (SSL)
- Porta 587 → `secure: false` (STARTTLS)

### Email Personalizado

Para usar outro email (ex: `bilhetes@events.cv`):

```bash
FROM_EMAIL=bilhetes@events.cv
FROM_NAME=EventsCV Bilhetes
```

## 🚨 Troubleshooting

### Email não enviado

**Verificar:**
1. Password correta no `.env`
2. Email `noreply@events.cv` criado no cPanel
3. Porta 465 ou 587 aberta no firewall
4. Ver logs: `firebase functions:log`

**Erros Comuns:**
```
Error: Invalid login: 535 Authentication failed
→ Password incorreta

Error: Connection timeout
→ Porta bloqueada ou servidor SMTP errado

Error: ECONNREFUSED
→ Servidor SMTP incorreto
```

### Email na pasta de spam

**Soluções:**
1. Verificar SPF record no DNS
2. Adicionar DKIM no cPanel
3. Configurar DMARC

**DNS Records (cPanel → Zone Editor):**

```dns
# SPF Record
Type: TXT
Name: events.cv
Value: v=spf1 a mx ip4:SEU_IP_SERVIDOR ~all

# DMARC Record
Type: TXT
Name: _dmarc.events.cv
Value: v=DMARC1; p=none; rua=mailto:postmaster@events.cv
```

### Limites de Envio

**cPanel geralmente tem limites:**
- ~500-1000 emails/hora
- ~3000-5000 emails/dia

**Verificar limites:**
1. cPanel → Email Deliverability
2. Contactar hosting provider se precisar aumentar

## 📊 Monitorização

### Ver Emails Enviados

cPanel → **Email Deliverability** → **Track Delivery**

### Logs no Firebase

```bash
# Ver todos os logs
firebase functions:log --only pagaliWebhook

# Filtrar por email
firebase functions:log --only pagaliWebhook | grep "email sent"
```

### Firestore (email-logs)

```javascript
db.collection('email-logs')
  .orderBy('sentAt', 'desc')
  .limit(20)
  .get()
```

## 💰 Custos

**cPanel Email:**
- ✅ Grátis (incluído no hosting)
- ✅ Sem limites de quota (depende do plano)
- ✅ Domínio próprio (events.cv)

**vs SendGrid:**
- Free: 100 emails/dia
- Essentials: $19.95/mês (50k emails)

## 🔒 Segurança

### Boas Práticas

1. **Password Forte**
   - Mínimo 16 caracteres
   - Letras, números, símbolos
   - Rodar periodicamente

2. **Não Partilhar Credenciais**
   - `.env` no .gitignore
   - Não fazer commit da password
   - Usar secrets manager em produção

3. **Monitorizar Atividade**
   - Ver logs regularmente
   - Alertas para falhas
   - Verificar emails em spam

4. **Rate Limiting**
   - Implementar se necessário
   - Prevenir abuse
   - Respeitar limites do servidor

## 📝 Comandos Úteis

```bash
# Testar SMTP localmente
cd functions
node -e "require('./lib/notifications/email').sendPurchaseConfirmation({...})"

# Ver configuração atual
cat .env | grep SMTP

# Deploy apenas pagaliWebhook
firebase deploy --only functions:pagaliWebhook

# Ver logs em tempo real
firebase functions:log --only pagaliWebhook --follow
```

## 🔗 Links Úteis

- **cPanel Login:** https://events.cv:2083
- **Documentação cPanel:** https://docs.cpanel.net/
- **Nodemailer Docs:** https://nodemailer.com/
- **Email Testing:** https://www.mail-tester.com/

## ✅ Checklist Final

Antes de ir para produção:

- [ ] Email `noreply@events.cv` criado no cPanel
- [ ] Password configurada no `.env`
- [ ] `.env` adicionado ao `.gitignore`
- [ ] Deploy feito com sucesso
- [ ] Email de teste enviado e recebido
- [ ] Email não vai para spam
- [ ] SPF/DKIM configurados (opcional mas recomendado)
- [ ] Logs a funcionar corretamente

---

**Tempo estimado:** 2-5 minutos
**Custo:** Grátis (incluído no cPanel)
**Dificuldade:** Muito Fácil ⭐
