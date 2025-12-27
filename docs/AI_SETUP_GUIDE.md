# 🤖 AI Features Setup Guide

Este guia explica como configurar todas as funcionalidades de AI no Events.cv.

## 📋 Resumo dos Serviços AI

| Serviço | Função | Modelo | Custo Estimado |
|---------|--------|--------|----------------|
| **Anthropic Claude** | Lyra chat assistant | claude-3-5-sonnet | $3-15/1M tokens |
| **OpenAI GPT** | Geração de conteúdo + insights | gpt-4o-mini | $0.15/1M tokens |
| **OpenAI Embeddings** | Recomendações personalizadas | text-embedding-3-small | $0.02/1M tokens |
| **Replicate FLUX** | Geração de posters | flux-1.1-pro | $0.04/imagem |
| **Pinecone** | Vector database | - | Free tier (100K vectors) |

**Custo total estimado: ~$60-80/mês para 1000 eventos/mês**

---

## 1️⃣ Anthropic (Claude) - Lyra Chat Assistant

### O que é?
Claude é o modelo de AI da Anthropic usado para a Lyra, nossa assistente virtual.

### Como obter a API key:

1. Aceda a [https://console.anthropic.com/](https://console.anthropic.com/)
2. Crie uma conta ou faça login
3. Navegue para **API Keys** no menu lateral
4. Clique em **Create Key**
5. Dê um nome: "Events.cv Production"
6. Copie a chave (começa com `sk-ant-api03-`)

### Configurar no Firebase:

```bash
firebase functions:config:set anthropic.api_key="sk-ant-api03-xxxxx"
```

### Testar localmente:

```bash
export ANTHROPIC_API_KEY="sk-ant-api03-xxxxx"
```

---

## 2️⃣ OpenAI - Content Generation & Embeddings

### O que é?
OpenAI fornece:
- **GPT-4o mini**: Geração de descrições, emails, insights
- **text-embedding-3-small**: Vetores para recomendações personalizadas

### Como obter a API key:

1. Aceda a [https://platform.openai.com/](https://platform.openai.com/)
2. Crie uma conta ou faça login
3. Navegue para **API Keys**: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
4. Clique em **Create new secret key**
5. Dê um nome: "Events.cv Production"
6. Copie a chave (começa com `sk-`)

### Configurar limites de gasto (IMPORTANTE):

1. Aceda a [https://platform.openai.com/account/billing/limits](https://platform.openai.com/account/billing/limits)
2. Defina **Hard limit**: $100/mês (ou o valor desejado)
3. Defina **Soft limit**: $50/mês
4. Adicione email para alertas

### Configurar no Firebase:

```bash
firebase functions:config:set openai.api_key="sk-xxxxx"
```

---

## 3️⃣ Replicate - AI Poster Generation

### O que é?
Replicate permite usar o modelo FLUX Pro para gerar posters de eventos automaticamente.

### Como obter o token:

1. Aceda a [https://replicate.com/](https://replicate.com/)
2. Crie uma conta ou faça login
3. Navegue para [https://replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)
4. Copie o **Default token** (começa com `r8_`)
5. Ou crie um novo token clicando em **Create token**

### Configurar billing:

1. Aceda a [https://replicate.com/account/billing](https://replicate.com/account/billing)
2. Adicione um método de pagamento
3. Cada imagem gerada custa ~$0.04

### Configurar no Firebase:

```bash
firebase functions:config:set replicate.api_token="r8_xxxxx"
```

---

## 4️⃣ Pinecone - Vector Database

### O que é?
Pinecone armazena vetores (embeddings) dos eventos para fazer recomendações personalizadas baseadas em similaridade.

### Como obter a API key:

1. Aceda a [https://www.pinecone.io/](https://www.pinecone.io/)
2. Crie uma conta (free tier disponível)
3. Faça login no [https://app.pinecone.io/](https://app.pinecone.io/)
4. Navegue para **API Keys**
5. Copie a chave (formato UUID)

### Criar o index:

1. No dashboard do Pinecone, clique em **Create Index**
2. Configurações:
   - **Name**: `events-cv-embeddings`
   - **Dimensions**: `1536` (para text-embedding-3-small)
   - **Metric**: `cosine`
   - **Pod Type**: `s1.x1` (free tier)
3. Clique em **Create Index**

### Configurar no Firebase:

```bash
firebase functions:config:set pinecone.api_key="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

---

## 🚀 Deploy Completo

### 1. Verificar configurações:

```bash
firebase functions:config:get
```

Deve ver:

```json
{
  "anthropic": {
    "api_key": "sk-ant-api03-xxxxx"
  },
  "openai": {
    "api_key": "sk-xxxxx"
  },
  "replicate": {
    "api_token": "r8_xxxxx"
  },
  "pinecone": {
    "api_key": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  }
}
```

### 2. Build das funções:

```bash
cd functions
npm run build
```

### 3. Deploy:

```bash
firebase deploy --only functions
```

Ou deploy apenas das funções AI:

```bash
firebase deploy --only functions:lyraChat,functions:generatePoster,functions:getRecommendations,functions:generateInsights
```

---

## 🧪 Testar Localmente

### 1. Criar arquivo .env:

```bash
cd functions
cp .env.example .env
```

### 2. Preencher .env com suas chaves

### 3. Carregar variáveis:

```bash
export $(cat .env | xargs)
```

### 4. Executar emuladores:

```bash
firebase emulators:start
```

### 5. Testar Lyra:

```bash
curl -X POST http://localhost:5001/events-cv/europe-west1/lyraChat \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "message": "Que eventos há hoje?",
      "userId": "test-user-123",
      "language": "pt"
    }
  }'
```

---

## 📊 Monitorização de Custos

### Anthropic:
- Dashboard: [https://console.anthropic.com/dashboard](https://console.anthropic.com/dashboard)
- Ver usage e custos em tempo real

### OpenAI:
- Dashboard: [https://platform.openai.com/usage](https://platform.openai.com/usage)
- Alertas automáticos quando atingir limites

### Replicate:
- Dashboard: [https://replicate.com/account/billing](https://replicate.com/account/billing)
- Ver histórico de predições e custos

### Pinecone:
- Dashboard: [https://app.pinecone.io/](https://app.pinecone.io/)
- Free tier: 100K vetores (suficiente para ~50K eventos)

---

## 🔒 Segurança

### ✅ FAZER:
- ✅ Rodar keys periodicamente (a cada 3-6 meses)
- ✅ Usar Firebase Secrets Manager em produção
- ✅ Definir limites de gasto em todos os serviços
- ✅ Monitorizar usage diariamente
- ✅ Ter .env no .gitignore

### ❌ NÃO FAZER:
- ❌ Commitar .env para git
- ❌ Partilhar API keys publicamente
- ❌ Usar mesmas keys em dev e produção
- ❌ Deixar keys em código-fonte
- ❌ Esquecer de definir billing alerts

---

## 🆘 Troubleshooting

### Erro: "Invalid API key"
- Verificar se copiou a chave completa
- Verificar se não tem espaços extras
- Verificar se a chave não expirou

### Erro: "Quota exceeded"
- Verificar limites de gasto no dashboard
- Adicionar método de pagamento
- Aumentar quota se necessário

### Erro: "Model not found"
- Verificar nome do modelo no código
- Alguns modelos precisam de acesso especial

### Funções não deployam:
```bash
# Ver logs detalhados
firebase deploy --only functions --debug

# Ver logs das funções
firebase functions:log
```

---

## 📞 Suporte

### Documentação:
- Anthropic: [https://docs.anthropic.com/](https://docs.anthropic.com/)
- OpenAI: [https://platform.openai.com/docs](https://platform.openai.com/docs)
- Replicate: [https://replicate.com/docs](https://replicate.com/docs)
- Pinecone: [https://docs.pinecone.io/](https://docs.pinecone.io/)

### Community:
- Anthropic Discord
- OpenAI Forum
- Replicate Discord
- Pinecone Slack

---

## ✅ Checklist de Setup

- [ ] Conta criada em Anthropic
- [ ] API key Anthropic obtida
- [ ] Conta criada em OpenAI
- [ ] API key OpenAI obtida
- [ ] Billing limits definidos em OpenAI
- [ ] Conta criada em Replicate
- [ ] Token Replicate obtido
- [ ] Conta criada em Pinecone
- [ ] Index Pinecone criado (`events-cv-embeddings`)
- [ ] API key Pinecone obtida
- [ ] Configurações adicionadas ao Firebase
- [ ] Funções deployed com sucesso
- [ ] Testes realizados
- [ ] Monitorização configurada
- [ ] Billing alerts ativos

---

**Pronto! 🎉 Agora tem todas as funcionalidades AI do Events.cv configuradas e prontas a usar!**
