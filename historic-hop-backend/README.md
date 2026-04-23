# Historic Hop - Backend

Backend em Node.js + Express para a aplicação Historic Hop.

## 📦 Setup

### 1. Instalar dependências

```bash
cd historic-hop-backend
npm install
```

### 2. Configurar variáveis de ambiente

Copie `.env.example` para `.env`:

```bash
cp .env.example .env
```

Configure:
```
PORT=3001
REPLICATE_API_TOKEN=seu_token_aqui
SUPABASE_URL=https://mqagxiruwgytlwodahfv.supabase.co
SUPABASE_ANON_KEY=seu_key_aqui
```

### 3. Rodar o servidor

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3001`

## 🚀 Endpoints

### POST `/api/generate-activity`
Gera atividades (quiz, cronológica, verdadeiro/falso, preenchimento)

**Body:**
```json
{
  "periodId": "colonia",
  "activityType": "quiz",
  "level": 1,
  "difficulty": "Fácil"
}
```

### POST `/api/generate-questions`
Gera perguntas de quiz

**Body:**
```json
{
  "periodId": "imperio",
  "level": 2,
  "topic": "Independência",
  "difficulty": "Médio"
}
```

### POST `/api/history-chat`
Chat interativo com personagens históricos

**Body:**
```json
{
  "messages": [
    {"role": "user", "content": "Quem foi Dom Pedro I?"}
  ],
  "periodId": "imperio"
}
```

## 📝 Frontend Integration

No frontend (React), atualize as chamadas de API para apontar para este servidor:

```typescript
// Antes (Supabase Functions):
const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-activity`;

// Depois (Express Backend):
const url = "http://localhost:3001/api/generate-activity";
```

## 🗂️ Estrutura

```
src/
├── server.ts           # Servidor principal Express
├── routes/
│   ├── generateActivity.ts
│   ├── generateQuestions.ts
│   ├── historyChat.ts
│   ├── generateAudio.ts
│   ├── speechToText.ts
│   └── manageQuestions.ts
```

## 🔧 Stack

- **Node.js** + **Express** - Framework web
- **TypeScript** - Type safety
- **Replicate** - IA (Llama 3, SDXL)
- **Supabase** - Banco de dados (opcional)
- **CORS** - Cross-origin requests
