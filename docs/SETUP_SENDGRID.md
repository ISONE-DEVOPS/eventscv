# Guia Rápido: Setup SendGrid - EventsCV

## 🚀 Setup em 5 Minutos

### 1. Criar Conta SendGrid
```
1. Ir para: https://signup.sendgrid.com/
2. Preencher formulário
3. Verificar email
4. Login: https://app.sendgrid.com/
```

### 2. Criar API Key
```
1. Settings → API Keys
2. "Create API Key"
3. Nome: EventsCV Production
4. Permissions: Full Access
5. COPIAR A CHAVE (só aparece uma vez!)
```

### 3. Verificar Sender
```
1. Settings → Sender Authentication
2. "Verify a Single Sender"
3. Preencher:
   - From Name: EventsCV
   - From Email: noreply@eventscv.com
   - Reply To: support@eventscv.com
   - Address: (teu endereço)
4. Verificar email recebido
```

### 4. Configurar EventsCV

Criar `/functions/.env` (se não existir):
```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@eventscv.com
FROM_NAME=EventsCV
```

**IMPORTANTE:** Substituir `noreply@eventscv.com` pelo email verificado no passo 3.

### 5. Deploy
```bash
cd /Users/lindapeixoto/My\ Apps/eventscv
firebase deploy --only functions:pagaliWebhook
```

## ✅ Testar

1. Fazer compra de teste em https://eventscv-web.web.app
2. Verificar email (inbox ou spam)
3. Ver logs: `firebase functions:log --only pagaliWebhook`

## 🆘 Problemas Comuns

### Email não enviado
```
Verificar:
1. API Key correta no .env
2. Email verificado no SendGrid
3. Não excedeu 100 emails/dia (free tier)
```

### Email na spam
```
Solução:
1. Autenticar domínio (não apenas sender)
2. Settings → Sender Authentication → Authenticate Domain
3. Adicionar DNS records fornecidos
```

### API Key não funciona
```
Verificar:
1. Copiou a chave completa (começa com SG.)
2. Permissions: Full Access
3. Key não foi revogada
```

## 📊 Monitorização

Ver estatísticas no SendGrid:
```
Dashboard → Activity Feed
- Emails enviados
- Emails entregues
- Bounces
- Spam reports
```

## 💰 Custos

**Free Tier:**
- 100 emails/dia
- Suficiente para testes

**Upgrade quando:**
- Mais de 100 emails/dia
- Produção com muitos utilizadores

**Preços:**
- Essentials: $19.95/mês (50k emails)
- Pro: $89.95/mês (100k emails)

---

**Tempo estimado:** 5-10 minutos
**Custo:** Grátis (100 emails/dia)
**Dificuldade:** Fácil ⭐
