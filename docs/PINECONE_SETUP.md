# 🔮 Pinecone Setup Guide - Events.cv

## O Que é o Pinecone?

Pinecone é uma vector database que permite fazer pesquisas de similaridade usando embeddings. Usamos para o sistema de recomendações personalizadas da Lyra.

---

## 🚀 Configuração Inicial

### 1. Criar Conta Pinecone (Free Tier)

1. Aceda a: [https://www.pinecone.io/](https://www.pinecone.io/)
2. Clique em **Start Free**
3. Crie conta com email ou Google
4. Verifique o email

### 2. Criar Index

Depois de fazer login no dashboard:

1. Navegue para: [https://app.pinecone.io/](https://app.pinecone.io/)
2. Clique em **Create Index**
3. Preencha os campos:

```
Name: events-cv-embeddings
Dimensions: 1536
Metric: cosine
Region: us-east-1 (ou mais próximo de Europe)
```

**Importante:** Dimensões MUST ser 1536 porque usamos o modelo `text-embedding-3-small` da OpenAI que gera vetores de 1536 dimensões.

4. Clique em **Create Index**

### 3. Obter API Key

1. No menu lateral, clique em **API Keys**
2. Copie a chave que já foi criada automaticamente
3. Formato: `pcsk_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

---

## ✅ Verificar Configuração

### Via Dashboard:

1. Aceda ao seu index: `events-cv-embeddings`
2. Deve ver:
   - Status: **Ready**
   - Vectors: **0** (inicialmente vazio)
   - Dimensions: **1536**
   - Metric: **cosine**

### Via API (Teste):

Crie um ficheiro `test-pinecone.js`:

```javascript
const { Pinecone } = require('@pinecone-database/pinecone');

const pinecone = new Pinecone({
  apiKey: 'pcsk_7JoTQK_Ptxt3z1h33bxVWLZaYWXpT883ZS6ypyKEeEDnHkWuNah55YSxe9dF11yPTPsVoj',
});

async function testPinecone() {
  try {
    // List all indexes
    const indexes = await pinecone.listIndexes();
    console.log('✅ Connected to Pinecone!');
    console.log('Indexes:', indexes);

    // Get index stats
    const index = pinecone.index('events-cv-embeddings');
    const stats = await index.describeIndexStats();
    console.log('Index stats:', stats);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testPinecone();
```

Execute:
```bash
cd functions
node test-pinecone.js
```

---

## 📊 Como Funciona o Sistema de Recomendações

### 1. Criar Embeddings de Eventos

Quando um evento é publicado:

```
Event Created → Generate Embedding → Store in Pinecone
    ↓                    ↓                    ↓
Firestore         OpenAI API          Pinecone Index
```

**Código (automático via trigger):**
```typescript
// functions/src/ai/recommendations/personalized.ts
export const createEventEmbedding = functions.firestore.onDocumentWritten(
  'events/{eventId}',
  async (event) => {
    // Gera embedding usando OpenAI
    const embedding = await generateEventEmbedding(eventData);

    // Armazena no Pinecone
    await pinecone.index('events-cv-embeddings').upsert([{
      id: eventId,
      values: embedding,
      metadata: { title, category, city, date }
    }]);
  }
);
```

### 2. Buscar Recomendações

Quando um utilizador pede recomendações:

```
User History → Generate User Embedding → Query Pinecone → Return Similar Events
      ↓                    ↓                    ↓                  ↓
  Firestore          OpenAI API          Pinecone Search    Scored Results
```

**Código:**
```typescript
// Gera embedding do histórico do user
const userEmbedding = await generateUserPreferenceEmbedding(userId);

// Pesquisa eventos similares
const results = await pinecone.index('events-cv-embeddings').query({
  vector: userEmbedding,
  topK: 20,
  filter: { city: 'Praia', date: { $gt: Date.now() } }
});

// results contém os eventos mais similares aos gostos do user
```

---

## 💾 Estrutura dos Dados no Pinecone

### Vector Structure:

```javascript
{
  id: "event-123",                    // Event ID from Firestore
  values: [0.123, -0.456, ...],       // 1536 dimensions
  metadata: {
    title: "Festa de Kizomba",
    category: "music",
    tags: ["kizomba", "live-music"],
    city: "Praia",
    price: 15,
    date: "2024-12-31T22:00:00Z"
  }
}
```

### Metadata Filtering:

Podemos filtrar por:
- `city` - Cidade do evento
- `category` - Categoria (music, sports, food, etc.)
- `price` - Preço (para filtrar por range)
- `date` - Data (para eventos futuros)

---

## 📈 Limites do Free Tier

| Recurso | Free Tier | Notas |
|---------|-----------|-------|
| Indexes | 1 | Suficiente para Events.cv |
| Vectors | 100,000 | ~50,000 eventos |
| Queries/month | Unlimited | Sem limite! |
| Storage | 1 GB | Mais que suficiente |
| Dimensions | Até 20,000 | Usamos 1536 |

**Para 50,000 eventos, o free tier é PERFEITO! 🎉**

---

## 🔄 Operações Comuns

### Inserir/Atualizar Vector:

```typescript
await index.upsert([
  {
    id: 'event-456',
    values: embedding,
    metadata: { title: 'Jazz Night', category: 'music' }
  }
]);
```

### Pesquisar por Similaridade:

```typescript
const results = await index.query({
  vector: userEmbedding,
  topK: 10,
  includeMetadata: true,
  filter: { category: 'music' }
});
```

### Deletar Vector:

```typescript
await index.deleteOne('event-456');
```

### Estatísticas do Index:

```typescript
const stats = await index.describeIndexStats();
console.log('Total vectors:', stats.totalVectorCount);
```

---

## 🧪 Testar Recomendações

### 1. Popular Index com Eventos de Teste

```bash
# Criar alguns eventos de teste no Firestore
# Os embeddings serão criados automaticamente via trigger
```

### 2. Chamar a Função de Recomendações

```typescript
const getRecommendations = httpsCallable(functions, 'getRecommendations');

const result = await getRecommendations({
  userId: 'user-123',
  limit: 5,
  city: 'Praia'
});

console.log('Recommendations:', result.data.recommendations);
```

---

## 🚨 Troubleshooting

### Erro: "Index not found"
- Verifique se criou o index `events-cv-embeddings`
- Verifique o nome exato (case-sensitive)

### Erro: "Dimension mismatch"
- Certifique-se que o index tem 1536 dimensões
- OpenAI `text-embedding-3-small` sempre gera 1536

### Erro: "Invalid API key"
- Verifique se copiou a chave completa
- Verifique se não tem espaços extras
- Gere nova chave se necessário

### Vectors não aparecem:
- Pode levar alguns segundos para indexar
- Use `describeIndexStats()` para verificar contagem
- Verifique logs do Firebase Functions

---

## 📊 Monitorização

### Dashboard Pinecone:
1. [app.pinecone.io](https://app.pinecone.io/)
2. Selecione seu index
3. Veja:
   - Total vectors
   - Query performance
   - Usage metrics

### Custos:
- Free tier: $0/mês
- Serverless: $0.0008 per 1K vectors stored/month
- POD-based: A partir de $70/mês (não recomendado para início)

---

## ✅ Checklist de Setup

- [x] Conta Pinecone criada
- [x] Index `events-cv-embeddings` criado (1536 dims, cosine)
- [x] API key obtida e configurada no Firebase
- [ ] Criar evento de teste no Firestore
- [ ] Verificar embedding criado no Pinecone
- [ ] Testar função `getRecommendations`
- [ ] Verificar resultados no dashboard

---

## 🔗 Links Úteis

- [Pinecone Dashboard](https://app.pinecone.io/)
- [Pinecone Docs](https://docs.pinecone.io/)
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [Events.cv AI Implementation](./AI_IMPLEMENTATION_TODAY.md)

---

**Status:** ✅ Pinecone Configurado
**Próximo:** Deploy das Cloud Functions
